import type { FeatureCollection, Point } from "geojson";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProviderStatus } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAllProviders, useHandoffCountsByZip } from "../hooks/useQueries";
import {
  handoffCountsToHeatmapGeoJSON,
  providersToGeoJSON,
} from "../utils/geoJsonAdapters";
import { isProviderStale } from "../utils/providerUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LayerVisibility {
  hotspots: boolean;
  matProviders: boolean;
  buildings3d: boolean;
}

interface Props {
  height?: string;
  currentProviderId?: string;
  onToggleLive?: (id: string, current: boolean) => void;
}

// Provider type label map (backend sends lowercase strings)
const TYPE_LABELS: Record<string, string> = {
  MAT: "MAT",
  Narcan: "Narcan",
  ER: "ER",
  Pharmacy: "Pharmacy",
  General: "General",
  unknown: "Other",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function labelForType(t: string): string {
  return TYPE_LABELS[t] ?? t.replace(/_/g, " ");
}

function applyProviderTypeFilter(
  data: FeatureCollection,
  filter: string,
): FeatureCollection {
  if (filter === "all") return data;
  return {
    ...data,
    features: data.features.filter(
      (f) => f.properties?.providerType === filter,
    ),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EnhancedRecoveryMap({
  height = "500px",
  currentProviderId,
  onToggleLive,
}: Props) {
  // ── Existing refs / state (unchanged) ────────────────────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerVisibility>({
    hotspots: true,
    matProviders: true,
    buildings3d: true,
  });

  // ── Marketplace additions ─────────────────────────────────────────────────
  const { actor } = useActor();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [providerTypes, setProviderTypes] = useState<string[]>([]);
  // Holds latest full dataset so filter changes don't require a network call
  const marketplaceDataRef = useRef<FeatureCollection | null>(null);
  // Mirror activeFilter for use inside stable map event callbacks
  const activeFilterRef = useRef<string>("all");

  // ── Existing queries (unchanged) ─────────────────────────────────────────
  const { data: providers = [] } = useAllProviders();
  const { data: handoffCounts = [] } = useHandoffCountsByZip();

  const liveCount = providers.filter(
    (p) => p.status === ProviderStatus.Live && !isProviderStale(p.lastVerified),
  ).length;

  // ── Map initialisation (unchanged) ───────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional init-once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style:
          "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [-81.6, 41.4],
        zoom: 10,
        minZoom: 8,
        maxZoom: 16,
        attributionControl: false,
        pitch: 30,
        bearing: 0,
      });
    } catch (e) {
      setLoadError(String(e));
      return;
    }

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left",
    );
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("error", (e) => {
      console.error("MapLibre error:", e);
      setLoadError("Map style failed to load. Check your connection.");
    });

    map.on("load", () => {
      const providerGeoJSON = providersToGeoJSON(providers);
      const heatmapGeoJSON = handoffCountsToHeatmapGeoJSON(handoffCounts);

      map.addSource("providers-source", {
        type: "geojson",
        data: providerGeoJSON,
      });
      map.addSource("heatmap-source", {
        type: "geojson",
        data: heatmapGeoJSON,
      });

      // Heatmap layer
      map.addLayer({
        id: "hotspot-heat",
        type: "heatmap",
        source: "heatmap-source",
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "weight"],
            0,
            0,
            20,
            1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            1,
            14,
            3,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.2,
            "rgba(0,180,160,0.5)",
            0.5,
            "rgba(0,200,170,0.75)",
            0.8,
            "rgba(0,255,136,0.85)",
            1,
            "rgba(120,255,200,1.0)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            20,
            14,
            40,
          ],
          "heatmap-opacity": 0.75,
        },
      });

      // 3D buildings — graceful fallback
      try {
        const styleLayers = map.getStyle().layers || [];
        const buildingLayer = (styleLayers as any[]).find((l) =>
          l.id?.toLowerCase().includes("building"),
        );
        if (buildingLayer) {
          map.setPaintProperty(
            buildingLayer.id,
            "fill-extrusion-color",
            "#1a2535",
          );
          map.setPaintProperty(buildingLayer.id, "fill-extrusion-opacity", 0.6);
        }
      } catch (_e) {
        /* style doesn't support 3D */
      }

      // Live providers — glowing green
      map.addLayer({
        id: "mat-providers-live",
        type: "circle",
        source: "providers-source",
        filter: ["==", ["get", "isLive"], true],
        paint: {
          "circle-radius": 10,
          "circle-color": "#00ff88",
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "rgba(0,255,136,0.35)",
          "circle-blur": 0.05,
        },
      });

      // Offline / unknown providers
      map.addLayer({
        id: "mat-providers-offline",
        type: "circle",
        source: "providers-source",
        filter: ["!=", ["get", "isLive"], true],
        paint: {
          "circle-radius": 7,
          "circle-color": [
            "match",
            ["get", "status"],
            "Live",
            "#fbbf24",
            "Offline",
            "#4a5568",
            "#6b7280",
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,255,255,0.15)",
        },
      });

      // Shared popup for legacy (mat-providers) layers
      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: "300px",
      });

      function handleProviderClick(e: any) {
        const feature = e.features?.[0];
        if (!feature) return;
        const { id, name, status, isLive } = feature.properties;
        const coords: [number, number] =
          feature.geometry.coordinates.slice() as [number, number];
        const isMine = currentProviderId && id === currentProviderId;

        let statusBadge = "";
        if (isLive) {
          statusBadge = `<span style="background:rgba(0,255,136,0.15);color:#00ff88;border:1px solid rgba(0,255,136,0.3);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">● LIVE NOW</span>`;
        } else if (status === "Offline") {
          statusBadge = `<span style="background:rgba(107,114,128,0.15);color:#9ca3af;border:1px solid rgba(107,114,128,0.3);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">OFFLINE</span>`;
        } else {
          statusBadge = `<span style="background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">UNVERIFIED</span>`;
        }

        const actionBtn = isMine
          ? `<button id="lnr-toggle-btn" data-id="${id}" data-live="${isLive}" style="display:inline-flex;align-items:center;gap:6px;background:${isLive ? "#dc2626" : "#059669"};color:#fff;font-size:12px;font-weight:700;border:none;cursor:pointer;padding:7px 14px;border-radius:8px;margin-top:2px;width:100%;justify-content:center;">${isLive ? "⏹ Go Offline" : "▶ Go Live"}</button>`
          : `<div style="display:flex;gap:8px;margin-top:4px;"><a href="/provider/${id}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:4px;background:rgba(45,156,219,0.2);color:#7dd3fc;border:1px solid rgba(45,156,219,0.3);font-size:12px;font-weight:600;text-decoration:none;padding:6px 10px;border-radius:8px;">View Profile →</a></div>`;

        const html = `
          <div style="background:#0f1923;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;min-width:200px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
            ${isMine ? '<div style="font-size:10px;color:#00ff88;font-weight:700;letter-spacing:0.08em;margin-bottom:6px;">◆ YOUR LOCATION</div>' : ""}
            <p style="color:#e2e8f0;font-size:13px;font-weight:700;margin:0 0 6px 0;">${name}</p>
            <div style="margin-bottom:10px;">${statusBadge}</div>
            ${actionBtn}
          </div>`;

        popupRef.current!.setLngLat(coords).setHTML(html).addTo(map);

        setTimeout(() => {
          const btn = document.getElementById("lnr-toggle-btn");
          if (btn && onToggleLive) {
            btn.addEventListener("click", () => {
              onToggleLive(btn.dataset.id ?? "", btn.dataset.live === "true");
              popupRef.current!.remove();
            });
          }
        }, 50);
      }

      map.on("click", "mat-providers-live", handleProviderClick);
      map.on("click", "mat-providers-offline", handleProviderClick);

      for (const layer of ["mat-providers-live", "mat-providers-offline"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }

      setMapReady(true);
    });

    mapInstanceRef.current = map;

    return () => {
      popupRef.current?.remove();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── Existing data-sync effects (unchanged) ───────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const source = mapInstanceRef.current.getSource("providers-source") as
      | maplibregl.GeoJSONSource
      | undefined;
    source?.setData(providersToGeoJSON(providers));
  }, [providers, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const source = mapInstanceRef.current.getSource("heatmap-source") as
      | maplibregl.GeoJSONSource
      | undefined;
    source?.setData(handoffCountsToHeatmapGeoJSON(handoffCounts));
  }, [handoffCounts, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;
    const setVis = (id: string, visible: boolean) => {
      try {
        if (map.getLayer(id))
          map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      } catch (_e) {
        /* layer may not exist */
      }
    };
    setVis("hotspot-heat", layers.hotspots);
    setVis("mat-providers-live", layers.matProviders);
    setVis("mat-providers-offline", layers.matProviders);
    setVis("buildings-3d", layers.buildings3d);
  }, [layers, mapReady]);

  // ── Marketplace: clustered GeoJSON layer + polling ───────────────────────
  //
  // Runs once when the map is ready AND the backend actor is available.
  // Adds three layers on top of the existing stack:
  //   mp-clusters        — cluster circles (teal, sized by count)
  //   mp-cluster-count   — count labels inside clusters
  //   mp-provider-points — individual verified/unverified points
  //
  useEffect(() => {
    if (!mapReady || !actor || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // ── helpers ──────────────────────────────────────────────────────────
    async function loadMarketplaceData(): Promise<FeatureCollection> {
      const raw = await actor!.getMarketplaceGeoJSON();
      return JSON.parse(raw) as FeatureCollection;
    }

    function filteredData(full: FeatureCollection): FeatureCollection {
      return applyProviderTypeFilter(full, activeFilterRef.current);
    }

    // ── main init ────────────────────────────────────────────────────────
    async function initMarketplaceLayer() {
      try {
        const data = await loadMarketplaceData();
        marketplaceDataRef.current = data;

        // Collect unique, non-trivial provider types for the filter UI
        const types: string[] = (
          Array.from(
            new Set(
              data.features
                .map((f) => f.properties?.providerType as string)
                .filter((t): t is string => !!t && t !== "unknown"),
            ),
          ) as string[]
        ).sort();
        setProviderTypes(types);

        // Guard: if source already exists (actor refresh), just update data
        if (map.getSource("marketplace-providers")) {
          (
            map.getSource("marketplace-providers") as maplibregl.GeoJSONSource
          ).setData(filteredData(data));
          return;
        }

        // ── Source with clustering ────────────────────────────────────────
        map.addSource("marketplace-providers", {
          type: "geojson",
          data: filteredData(data),
          cluster: true,
          clusterMaxZoom: 13, // expand to individual points at zoom > 13
          clusterRadius: 50, // px radius to merge into a cluster
        });

        // ── Cluster circles ───────────────────────────────────────────────
        // Three size tiers driven by point_count
        map.addLayer({
          id: "mp-clusters",
          type: "circle",
          source: "marketplace-providers",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#0d9488", // 1–4  (teal)
              5,
              "#0891b2", // 5–19 (cyan)
              20,
              "#0369a1", // 20+  (blue)
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              5,
              24,
              20,
              32,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(255,255,255,0.18)",
            "circle-opacity": 0.92,
          },
        });

        // ── Cluster count labels ───────────────────────────────────────────
        map.addLayer({
          id: "mp-cluster-count",
          type: "symbol",
          source: "marketplace-providers",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 12,
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "rgba(0,0,0,0.3)",
            "text-halo-width": 1,
          },
        });

        // ── Individual provider points ─────────────────────────────────────
        // Green = verified, orange = unverified
        // Only renders when NOT a cluster (zoom > clusterMaxZoom or isolated)
        map.addLayer({
          id: "mp-provider-points",
          type: "circle",
          source: "marketplace-providers",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              5,
              14,
              8,
            ],
            "circle-opacity": 0.92,
            "circle-color": [
              "case",
              ["==", ["get", "is_verified"], true],
              "#22c55e", // verified — green
              "#f97316", // unverified — orange
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": [
              "case",
              ["==", ["get", "is_verified"], true],
              "rgba(34,197,94,0.4)",
              "rgba(249,115,22,0.4)",
            ],
          },
        });

        // ── Cluster click → smooth zoom ───────────────────────────────────
        map.on("click", "mp-clusters", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["mp-clusters"],
          });
          if (!features.length) return;
          const clusterId = features[0].properties?.cluster_id as number;
          const coords = (features[0].geometry as Point).coordinates as [
            number,
            number,
          ];

          (map.getSource("marketplace-providers") as maplibregl.GeoJSONSource)
            .getClusterExpansionZoom(clusterId)
            .then((zoom) => {
              map.easeTo({ center: coords, zoom: zoom ?? 14, duration: 400 });
            })
            .catch(() => {});
        });

        // ── Individual point click → popup ────────────────────────────────
        map.on("click", "mp-provider-points", (e) => {
          const feature = e.features?.[0];
          if (!feature) return;

          const p = feature.properties as {
            id: string;
            providerType: string;
            is_verified: boolean;
            reputationScore: number;
          };

          // MapLibre serialises booleans as strings inside properties
          const verified =
            p.is_verified === true || (p.is_verified as unknown) === "true";
          const score =
            typeof p.reputationScore === "number"
              ? p.reputationScore.toFixed(1)
              : "0.0";

          const verifiedBadge = verified
            ? `<span style="background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">✓ Verified</span>`
            : `<span style="background:rgba(249,115,22,0.15);color:#f97316;border:1px solid rgba(249,115,22,0.3);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">Unverified</span>`;

          const typeLabel = labelForType(p.providerType ?? "unknown");

          const html = `
            <div style="background:#0f1923;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;min-width:200px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
              <p style="color:#e2e8f0;font-size:13px;font-weight:700;margin:0 0 6px 0;">${typeLabel}</p>
              <div style="margin-bottom:10px;">${verifiedBadge}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-size:11px;color:#718096;">Reputation score</span>
                <span style="font-size:12px;font-weight:700;color:#6ee7d0;">${score}</span>
              </div>
              <a href="/provider/${p.id}" style="display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(45,156,219,0.18);color:#7dd3fc;border:1px solid rgba(45,156,219,0.3);font-size:12px;font-weight:600;text-decoration:none;padding:7px 10px;border-radius:8px;">View Profile →</a>
            </div>`;

          new maplibregl.Popup({ closeButton: true, maxWidth: "280px" })
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
        });

        // ── Cursor UX ─────────────────────────────────────────────────────
        for (const layerId of ["mp-clusters", "mp-provider-points"]) {
          map.on("mouseenter", layerId, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = "";
          });
        }
      } catch (err) {
        console.warn(
          "[EnhancedRecoveryMap] Marketplace layer init failed:",
          err,
        );
      }
    }

    initMarketplaceLayer();

    // ── 15-second live refresh (smooth setData, no layer rebuild) ─────────
    const intervalId = setInterval(async () => {
      try {
        const data = await loadMarketplaceData();
        marketplaceDataRef.current = data;
        const source = map.getSource("marketplace-providers") as
          | maplibregl.GeoJSONSource
          | undefined;
        source?.setData(filteredData(data));
      } catch (err) {
        console.warn("[EnhancedRecoveryMap] Marketplace refresh failed:", err);
      }
    }, 15_000);

    return () => clearInterval(intervalId);
  }, [mapReady, actor]);

  // ── Filter effect: instant update, no map reinit ─────────────────────────
  useEffect(() => {
    activeFilterRef.current = activeFilter;
    if (!mapReady || !mapInstanceRef.current || !marketplaceDataRef.current)
      return;
    const source = mapInstanceRef.current.getSource("marketplace-providers") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;
    source.setData(
      applyProviderTypeFilter(marketplaceDataRef.current, activeFilter),
    );
  }, [activeFilter, mapReady]);

  // ── Layer toggle helper ───────────────────────────────────────────────────
  function toggleLayer(key: keyof LayerVisibility) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{ height }}
      data-ocid="map.canvas_target"
    >
      {/* Map canvas */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Empty state overlay */}
      {mapReady && providers.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 rounded-xl z-10 pointer-events-none">
          <MapPin className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">
            No providers found in this area
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {!mapReady && !loadError && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
          style={{ background: "#0a1520" }}
          data-ocid="map.loading_state"
        >
          <div className="w-full h-full absolute inset-0 opacity-10">
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <div
                key={k}
                className="border-b border-white/10"
                style={{ height: "16.666%" }}
              />
            ))}
          </div>
          <div className="relative flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#00ff88]/30 border-t-[#00ff88] animate-spin" />
            <p className="text-sm font-semibold" style={{ color: "#6ee7d0" }}>
              Loading Live Recovery Map…
            </p>
            <p className="text-xs" style={{ color: "#4a6070" }}>
              Fetching provider locations
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3 px-6 text-center"
          style={{ background: "#0a1520" }}
          data-ocid="map.error_state"
        >
          <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
            <span className="text-red-400 text-lg">!</span>
          </div>
          <p className="text-sm font-semibold text-red-400">
            Map failed to load
          </p>
          <p className="text-xs" style={{ color: "#4a6070" }}>
            {loadError}
          </p>
        </div>
      )}

      {/* Live count badge */}
      {mapReady && (
        <div
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: "rgba(15,25,35,0.9)",
            border: "1px solid rgba(0,255,136,0.25)",
          }}
          data-ocid="map.panel"
        >
          <span
            className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shrink-0"
            style={{ boxShadow: "0 0 6px rgba(0,255,136,0.8)" }}
          />
          <span className="text-xs font-bold text-[#00ff88]">
            {liveCount} Live
          </span>
          <span className="text-xs" style={{ color: "rgba(110,231,208,0.6)" }}>
            providers
          </span>
        </div>
      )}

      {/* ── Control panel ──────────────────────────────────────────────── */}
      {mapReady && (
        <div
          className="absolute bottom-6 right-4 z-10 rounded-2xl p-4 shadow-2xl"
          style={{
            background: "#0f1923",
            border: "1px solid rgba(255,255,255,0.08)",
            width: "13rem",
          }}
          data-ocid="map.panel"
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full bg-[#00ff88] shrink-0"
              style={{ boxShadow: "0 0 8px rgba(0,255,136,0.9)" }}
            />
            <span
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: "#6ee7d0" }}
            >
              Layer Controls
            </span>
          </div>

          {/* Layer toggles */}
          <div className="space-y-2.5 mb-3">
            <ToggleRow
              label="Overdose Hotspots"
              active={layers.hotspots}
              dotColor="rgba(0,200,180,0.9)"
              glowColor="rgba(0,200,180,0.4)"
              onToggle={() => toggleLayer("hotspots")}
            />
            <ToggleRow
              label="MAT Providers"
              active={layers.matProviders}
              dotColor="#00ff88"
              glowColor="rgba(0,255,136,0.4)"
              onToggle={() => toggleLayer("matProviders")}
            />
            <ToggleRow
              label="3D Buildings"
              active={layers.buildings3d}
              dotColor="#6b7280"
              glowColor="transparent"
              onToggle={() => toggleLayer("buildings3d")}
            />
          </div>

          {/* ── Provider type filter ───────────────────────────────────── */}
          {providerTypes.length > 0 && (
            <div
              className="pt-3 mb-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wide mb-2"
                style={{ color: "#4a6070" }}
              >
                Filter by type
              </p>
              <div className="flex flex-wrap gap-1">
                {/* All reset chip */}
                <FilterChip
                  label="All"
                  active={activeFilter === "all"}
                  onClick={() => setActiveFilter("all")}
                />
                {providerTypes.map((t) => (
                  <FilterChip
                    key={t}
                    label={labelForType(t)}
                    active={activeFilter === t}
                    onClick={() =>
                      setActiveFilter((prev) => (prev === t ? "all" : t))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div
            className="pt-3 space-y-1.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <LegendDot color="#22c55e" label="Verified" glow />
            <LegendDot color="#f97316" label="Unverified" />
            <LegendDot color="#00ff88" label="Live now" glow />
            <LegendDot color="#4a5568" label="Offline" />
            <LegendDot color="#0d9488" label="Cluster" teal />
            <LegendDot
              color="rgba(0,200,180,0.8)"
              label="Hotspot density"
              teal
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all duration-150"
      style={{
        background: active ? "rgba(13,148,136,0.35)" : "rgba(255,255,255,0.06)",
        color: active ? "#6ee7d0" : "#718096",
        border: active
          ? "1px solid rgba(13,148,136,0.6)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  active,
  dotColor,
  glowColor,
  onToggle,
}: {
  label: string;
  active: boolean;
  dotColor: string;
  glowColor: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full"
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            background: active ? dotColor : "#2d3748",
            boxShadow: active ? `0 0 6px ${glowColor}` : "none",
            transition: "all 0.2s",
          }}
        />
        <span
          className="text-xs"
          style={{
            color: active ? "#e2e8f0" : "#4a5568",
            transition: "color 0.2s",
          }}
        >
          {label}
        </span>
      </div>
      <div
        className="relative w-8 h-4 rounded-full transition-colors duration-200 shrink-0"
        style={{ background: active ? "#0d9488" : "#2d3748" }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: active ? "calc(100% - 14px)" : "2px" }}
        />
      </div>
    </button>
  );
}

function LegendDot({
  color,
  label,
  glow,
  teal,
}: { color: string; label: string; glow?: boolean; teal?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: color,
          boxShadow: glow
            ? `0 0 5px ${color}`
            : teal
              ? "0 0 5px rgba(0,200,180,0.5)"
              : "none",
        }}
      />
      <span className="text-[10px]" style={{ color: "#718096" }}>
        {label}
      </span>
    </div>
  );
}
