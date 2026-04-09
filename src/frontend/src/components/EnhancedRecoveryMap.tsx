import type { FeatureCollection, Point } from "geojson";
import { MapPin } from "lucide-react";
import maplibregl, {
  type GeoJSONSource,
  type Map as MaplibreMap,
  type Popup as MaplibrePopup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { ProviderStatus } from "../backend";
import { useAllProviders, useHandoffCountsByZip } from "../hooks/useQueries";
import {
  handoffCountsToHeatmapGeoJSON,
  providersToGeoJSON,
} from "../utils/geoJsonAdapters";
import { isProviderStale } from "../utils/providerUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  height?: string;
  currentProviderId?: string;
  onToggleLive?: (id: string, current: boolean) => void;
  // Docked filter bar props (owned by parent)
  activeFilter?: string;
  setActiveFilter?: (f: string) => void;
  show3dBuildings?: boolean;
  showHeatmap?: boolean;
  showWeather?: boolean;
}

// Provider type label map (backend sends lowercase strings)
const TYPE_LABELS: Record<string, string> = {
  MAT: "MAT",
  Narcan: "Narcan",
  ER: "Emergency Room",
  "Emergency Room": "Emergency Room",
  "Naloxone Kiosk": "Naloxone Kiosk",
  "Telehealth MAT": "Telehealth MAT",
  Pharmacy: "Pharmacy",
  General: "General",
  unknown: "Other",
};

// Colour for each provider type on the individual-point layer
const TYPE_COLORS: Record<string, string> = {
  MAT: "#22c55e",
  Narcan: "#fbbf24",
  ER: "#f87171",
  "Emergency Room": "#f87171",
  "Naloxone Kiosk": "#c084fc",
  "Telehealth MAT": "#818cf8",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function labelForType(t: string): string {
  return TYPE_LABELS[t] ?? t.replace(/_/g, " ");
}

function colorForType(t: string): string {
  return TYPE_COLORS[t] ?? "#22c55e";
}

function applyProviderTypeFilter(
  data: FeatureCollection,
  filter: string,
): FeatureCollection {
  if (filter === "all") return data;
  return {
    ...data,
    features: data.features.filter((f) => {
      const pt = (f.properties?.providerType as string) ?? "";
      if (filter === "mat") return pt === "MAT" || pt === "MAT Clinic";
      if (filter === "narcan")
        return pt === "Narcan" || pt === "Narcan Distribution";
      if (filter === "er") return pt === "ER" || pt === "Emergency Room";
      if (filter === "kiosk") return pt === "Naloxone Kiosk";
      if (filter === "telehealth") return pt === "Telehealth MAT";
      // Exact match fallback
      return pt === filter;
    }),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EnhancedRecoveryMap({
  height = "500px",
  currentProviderId,
  onToggleLive,
  activeFilter,
  setActiveFilter: _setActiveFilter,
  show3dBuildings,
  showHeatmap,
  showWeather,
}: Props) {
  // ── Refs / state ────────────────────────────────────────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MaplibreMap | null>(null);
  const popupRef = useRef<MaplibrePopup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Marketplace additions ─────────────────────────────────────────────────
  // Holds latest full dataset so filter changes don't require a network call
  const marketplaceDataRef = useRef<FeatureCollection | null>(null);
  // Mirror activeFilter for use inside stable map event callbacks
  const activeFilterRef = useRef<string>("all");

  // ── Existing queries (unchanged) ─────────────────────────────────────────
  const { data: providers = [] } = useAllProviders();
  const { data: handoffCounts = [] } = useHandoffCountsByZip();
  // ── Weather widget state ─────────────────────────────────────────────────
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    desc: string;
    icon: string;
    city: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const weatherTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map WMO weather codes to emoji + label
  function describeWMO(code: number): { icon: string; desc: string } {
    if (code === 0) return { icon: "☀️", desc: "Clear Sky" };
    if (code <= 2) return { icon: "⛅", desc: "Partly Cloudy" };
    if (code === 3) return { icon: "☁️", desc: "Overcast" };
    if (code <= 49) return { icon: "🌫️", desc: "Fog / Haze" };
    if (code <= 59) return { icon: "🌦️", desc: "Drizzle" };
    if (code <= 69) return { icon: "🌧️", desc: "Rain" };
    if (code <= 79) return { icon: "❄️", desc: "Snow" };
    if (code <= 84) return { icon: "🌦️", desc: "Rain Showers" };
    if (code <= 94) return { icon: "⛈️", desc: "Thunderstorm" };
    return { icon: "🌩️", desc: "Severe Storm" };
  }

  async function fetchWeather(lat: number, lng: number) {
    setWeatherLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current_weather=true&temperature_unit=fahrenheit`;
      const res = await fetch(url);
      const json = await res.json();
      const cw = json.current_weather;
      const { icon, desc } = describeWMO(cw.weathercode);
      // Reverse-geocode city name using Nominatim
      let city = "NE Ohio";
      try {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&zoom=10`,
          { headers: { "Accept-Language": "en" } },
        );
        const geoJson = await geo.json();
        city =
          geoJson.address?.city ||
          geoJson.address?.town ||
          geoJson.address?.county ||
          "NE Ohio";
      } catch {
        /* ignore geocode failure */
      }
      setWeatherData({
        temp: Math.round(cw.temperature),
        desc,
        icon,
        city,
      });
    } catch {
      /* silently ignore weather failures */
    } finally {
      setWeatherLoading(false);
    }
  }

  // Fetch weather on mount, then whenever map center changes (debounced 2s)
  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchWeather is stable, intentional
  useEffect(() => {
    if (!showWeather) return;
    // Initial fetch at map center (Cleveland area)
    fetchWeather(41.4, -81.6);

    function onMoveEnd() {
      if (!mapInstanceRef.current) return;
      const c = mapInstanceRef.current.getCenter();
      if (weatherTimerRef.current) clearTimeout(weatherTimerRef.current);
      weatherTimerRef.current = setTimeout(() => {
        fetchWeather(c.lat, c.lng);
      }, 2000);
    }

    const map = mapInstanceRef.current;
    if (map) map.on("moveend", onMoveEnd);

    return () => {
      if (map) map.off("moveend", onMoveEnd);
      if (weatherTimerRef.current) clearTimeout(weatherTimerRef.current);
    };
  }, [showWeather, mapReady]);

  const liveCount = providers.filter(
    (p) => p.status === ProviderStatus.Live && !isProviderStale(p.lastVerified),
  ).length;

  // ── Map initialisation (unchanged) ───────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional init-once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let map: MaplibreMap;
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
      | GeoJSONSource
      | undefined;
    source?.setData(providersToGeoJSON(providers));
  }, [providers, mapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const source = mapInstanceRef.current.getSource("heatmap-source") as
      | GeoJSONSource
      | undefined;
    source?.setData(handoffCountsToHeatmapGeoJSON(handoffCounts));
  }, [handoffCounts, mapReady]);

  // ── Layer visibility — driven by props ──────────────────────────────────
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
    setVis("hotspot-heat", showHeatmap ?? true);
    setVis("mat-providers-live", true);
    setVis("mat-providers-offline", true);
    setVis("buildings-3d", show3dBuildings ?? true);
  }, [showHeatmap, show3dBuildings, mapReady]);

  // ── activeFilter ref sync (prop-driven) ──────────────────────────────────
  useEffect(() => {
    activeFilterRef.current = activeFilter ?? "all";
  }, [activeFilter]);

  // ── Marketplace: clustered GeoJSON layer + polling ───────────────────────
  //
  // Runs once when the map is ready. Providers come from useAllProviders()
  // which is a PUBLIC QUERY — no auth/actor required.
  // Adds three layers on top of the existing stack:
  //   mp-clusters        — cluster circles (teal, sized by count)
  //   mp-cluster-count   — count labels inside clusters
  //   mp-provider-points — individual verified/unverified points
  //
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // ── helpers ──────────────────────────────────────────────────────────
    function loadMarketplaceData(): FeatureCollection {
      // Option 4: use getAllProviders (existing endpoint) + convert to GeoJSON
      const geoJson = providersToGeoJSON(
        providers,
      ) as unknown as FeatureCollection;
      // Enrich properties with providerType and bridge_active flag
      return {
        ...geoJson,
        features: geoJson.features.map((f) => {
          const name = (f.properties?.name as string) ?? "";
          const nameLower = name.toLowerCase();
          // Use backend providerType if available, otherwise infer from name
          const backendType = (f.properties as { providerType?: string })
            ?.providerType;
          let providerType = backendType ?? "MAT";
          if (!backendType) {
            if (nameLower.includes("kiosk") || nameLower.includes("vending")) {
              providerType = "Naloxone Kiosk";
            } else if (nameLower.includes("telehealth")) {
              providerType = "Telehealth MAT";
            } else if (
              nameLower.includes("narcan") ||
              nameLower.includes("naloxone") ||
              nameLower.includes("harm reduction") ||
              nameLower.includes("health dept") ||
              nameLower.includes("aids") ||
              nameLower.includes("taskforce") ||
              nameLower.includes("community health center")
            ) {
              providerType = "Narcan";
            } else if (
              nameLower.includes(" er") ||
              nameLower.includes("emergency") ||
              nameLower.includes("hospital") ||
              nameLower.includes("medical center")
            ) {
              providerType = "ER";
            }
          }
          // Check localStorage for bridge-active status on ER providers
          const id = (f.properties?.id as string) ?? "";
          let bridgeActive = false;
          if (providerType === "ER" || providerType === "Emergency Room") {
            try {
              const raw = localStorage.getItem(`bridge_active_${id}`);
              if (raw) {
                const parsed = JSON.parse(raw) as { expiresAt: number };
                bridgeActive = Date.now() < parsed.expiresAt;
              }
            } catch {
              /* ignore */
            }
          }
          return {
            ...f,
            properties: {
              ...f.properties,
              providerType,
              is_verified: (f.properties as any)?.isLive ?? false,
              reputationScore: 0,
              bridgeActive,
            },
          };
        }),
      };
    }

    function filteredData(full: FeatureCollection): FeatureCollection {
      return applyProviderTypeFilter(full, activeFilterRef.current);
    }

    // ── main init ────────────────────────────────────────────────────────
    async function initMarketplaceLayer() {
      try {
        const data = loadMarketplaceData();
        marketplaceDataRef.current = data;

        // Guard: if source already exists (actor refresh), just update data
        if (map.getSource("marketplace-providers")) {
          (map.getSource("marketplace-providers") as GeoJSONSource).setData(
            filteredData(data),
          );
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
        // Type-coloured circles: green=MAT, amber=Narcan, red=ER, purple=Kiosk, indigo=Telehealth
        // Gold ring for ERs with active 72-hour bridge
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
              9,
            ],
            "circle-opacity": 0.92,
            "circle-color": [
              "match",
              ["get", "providerType"],
              "MAT",
              "#22c55e",
              "Narcan",
              "#fbbf24",
              "ER",
              "#f87171",
              "Emergency Room",
              "#f87171",
              "Naloxone Kiosk",
              "#c084fc",
              "Telehealth MAT",
              "#818cf8",
              "#22c55e", // default
            ],
            "circle-stroke-width": [
              "case",
              ["==", ["get", "bridgeActive"], true],
              4,
              1.5,
            ],
            "circle-stroke-color": [
              "case",
              ["==", ["get", "bridgeActive"], true],
              "#fbbf24", // gold ring for bridge-active ERs
              [
                "match",
                ["get", "providerType"],
                "MAT",
                "rgba(34,197,94,0.4)",
                "Narcan",
                "rgba(251,191,36,0.4)",
                "ER",
                "rgba(248,113,113,0.4)",
                "Emergency Room",
                "rgba(248,113,113,0.4)",
                "Naloxone Kiosk",
                "rgba(192,132,252,0.4)",
                "Telehealth MAT",
                "rgba(129,140,248,0.4)",
                "rgba(34,197,94,0.4)",
              ],
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

          (map.getSource("marketplace-providers") as GeoJSONSource)
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
          const typeColor = colorForType(p.providerType ?? "unknown");

          const html = `
            <div style="background:#0f1923;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;min-width:200px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
              <p style="color:${typeColor};font-size:11px;font-weight:700;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.06em;">${typeLabel}</p>
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
        const data = loadMarketplaceData();
        marketplaceDataRef.current = data;
        const source = map.getSource("marketplace-providers") as
          | GeoJSONSource
          | undefined;
        source?.setData(filteredData(data));
      } catch (err) {
        console.warn("[EnhancedRecoveryMap] Marketplace refresh failed:", err);
      }
    }, 15_000);

    return () => clearInterval(intervalId);
  }, [mapReady, providers]);

  // ── Filter effect: instant update, no map reinit ─────────────────────────
  useEffect(() => {
    activeFilterRef.current = activeFilter ?? "all";
    if (!mapReady || !mapInstanceRef.current || !marketplaceDataRef.current)
      return;
    const source = mapInstanceRef.current.getSource("marketplace-providers") as
      | GeoJSONSource
      | undefined;
    if (!source) return;
    source.setData(
      applyProviderTypeFilter(
        marketplaceDataRef.current,
        activeFilter ?? "all",
      ),
    );
  }, [activeFilter, mapReady]);

  // ── Locate-me handler ─────────────────────────────────────────────────────
  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current!.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          speed: 1.4,
          curve: 1.2,
        });
      },
      () => {
        // geolocation denied or unavailable — silently ignore
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  };

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

      {/* Locate-me button */}
      <button
        type="button"
        aria-label="Locate me"
        onClick={handleLocateMe}
        className="absolute z-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-150 hover:scale-105 active:scale-95"
        style={{
          bottom: "90px",
          right: "10px",
          width: "36px",
          height: "36px",
          background: "#1a73e8",
          border: "2px solid rgba(255,255,255,0.9)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Locate me</title>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
        </svg>
      </button>

      {/* Empty state overlay — shown when canister has no providers yet */}
      {mapReady && providers.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 rounded-xl z-10 pointer-events-none px-6 text-center">
          <MapPin className="w-8 h-8" style={{ color: "#6ee7d0" }} />
          <p className="text-sm font-semibold" style={{ color: "#6ee7d0" }}>
            No providers loaded yet
          </p>
          <p className="text-xs" style={{ color: "rgba(110,231,208,0.6)" }}>
            Admin: go to /admin → Sign In → "Seed Ohio Providers" to populate
            the map
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

      {/* Weather widget — upper-left, Apple Maps style */}
      {showWeather && mapReady && (
        <div
          className="absolute z-10 flex items-center gap-2.5 px-3 py-2 rounded-xl"
          style={{
            top: "52px",
            left: "10px",
            background: "rgba(15,25,35,0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            minWidth: "130px",
          }}
          data-ocid="map.weather_widget"
        >
          {weatherLoading && !weatherData ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
          ) : weatherData ? (
            <>
              <span className="text-xl leading-none">{weatherData.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">
                  {weatherData.temp}°F
                </span>
                <span
                  className="text-[10px] font-medium leading-tight"
                  style={{ color: "rgba(110,231,208,0.85)" }}
                >
                  {weatherData.desc}
                </span>
                <span
                  className="text-[9px] leading-tight"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {weatherData.city}
                </span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
