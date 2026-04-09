import type { FeatureCollection, Point } from "geojson";
import { AlertTriangle, MapPin, MessageSquarePlus } from "lucide-react";
import maplibregl, {
  type GeoJSONSource,
  type Map as MaplibreMap,
  type Popup as MaplibrePopup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { ProviderStatus } from "../backend";
import {
  useAllProviders,
  useGetAllReports,
  useGetRiskEvents,
  useGetSocialStressBaseline,
  useGetWeatherRisk,
  useHandoffCountsByZip,
  useUpvoteCitizenReport,
} from "../hooks/useQueries";
import { usePredictionEngineStore } from "../store/predictionEngineStore";
import type { CitizenReport } from "../types/community";
import {
  handoffCountsToHeatmapGeoJSON,
  providersToGeoJSON,
} from "../utils/geoJsonAdapters";
import { isProviderStale } from "../utils/providerUtils";
import {
  type FrontendRiskEvent,
  buildSentinelGeoJSON,
} from "../utils/riskCalculator";
import { CitizenReportComposer } from "./CitizenReportComposer";

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
  const [_loadError, setLoadError] = useState<string | null>(null);

  // ── Sentinel Risk overlay state ──────────────────────────────────────────
  const [sentinelActive, setSentinelActive] = useState(false);

  // ── Community Reports state ──────────────────────────────────────────────
  const [showCommunityReports, setShowCommunityReports] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  // ── Citizen reports data ─────────────────────────────────────────────────
  const { data: citizenReports = [] } = useGetAllReports();
  const upvoteMutation = useUpvoteCitizenReport();

  // Prediction engine store
  const predictionSettings = usePredictionEngineStore((s) => s.settings);
  const setRiskEvents = usePredictionEngineStore((s) => s.setRiskEvents);
  const setSocialStressBaseline = usePredictionEngineStore(
    (s) => s.setSocialStressBaseline,
  );
  const setWeatherRiskMultiplier = usePredictionEngineStore(
    (s) => s.setWeatherRiskMultiplier,
  );
  const storeRiskEvents = usePredictionEngineStore((s) => s.riskEvents);
  const storeSocialStress = usePredictionEngineStore(
    (s) => s.socialStressBaseline,
  );
  const storeWeatherMultiplier = usePredictionEngineStore(
    (s) => s.weatherRiskMultiplier,
  );

  // Prediction engine queries (only fires when sentinel is toggled on)
  const { data: backendRiskEvents } = useGetRiskEvents();
  const { data: weatherRisk } = useGetWeatherRisk();
  const { data: socialStressData } = useGetSocialStressBaseline();

  // ── Marketplace additions ─────────────────────────────────────────────────
  // Holds latest full dataset so filter changes don't require a network call
  const marketplaceDataRef = useRef<FeatureCollection | null>(null);
  // Mirror activeFilter for use inside stable map event callbacks
  const activeFilterRef = useRef<string>("all");

  // ── Existing queries (unchanged) ─────────────────────────────────────────
  const { data: providers = [] } = useAllProviders();
  const { data: handoffCounts = [] } = useHandoffCountsByZip();
  // ── Weather widget state ─────────────────────────────────────────────────
  const [_weatherData, setWeatherData] = useState<{
    temp: number;
    desc: string;
    icon: string;
    city: string;
  } | null>(null);
  const [_weatherLoading, setWeatherLoading] = useState(false);
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

  const _liveCount = providers.filter(
    (p) => p.status === ProviderStatus.Live && !isProviderStale(p.lastVerified),
  ).length;

  // ── Map initialisation ───────────────────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional init-once
  useEffect(() => {
    // Guard: container must be mounted and map must not already exist
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    // Guard: container must have non-zero dimensions before init.
    // If the container is zero-sized (e.g. inside a hidden tab), defer init.
    if (container.clientWidth === 0 && container.clientHeight === 0) {
      // Retry after a short delay to allow the DOM layout to settle
      const retryTimer = setTimeout(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;
        // Re-trigger by forcing a state update would cause loops;
        // instead just proceed — MapLibre handles zero-size gracefully on resize
      }, 200);
      return () => clearTimeout(retryTimer);
    }

    let map: MaplibreMap;
    try {
      map = new maplibregl.Map({
        container,
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

    mapInstanceRef.current = map;

    // ResizeObserver — keeps map canvas in sync with flex/grid layout changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        (map as InstanceType<typeof maplibregl.Map>).resize();
      });
      resizeObserver.observe(container);
    }

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left",
    );
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Only log tile/layer errors — do NOT replace the map with an error screen
    // for non-fatal errors (tile 404s, network blips, etc.)
    map.on("error", (e) => {
      console.warn("[MapLibre] Non-fatal map error:", e.error?.message ?? e);
    });

    map.on("load", () => {
      // Force resize after load — ensures map fills container correctly in
      // flex/grid layouts where the container may have been zero-sized at init
      (map as InstanceType<typeof maplibregl.Map>).resize();
      // Also schedule a second resize on next frame to handle CSS transitions
      requestAnimationFrame(() =>
        (map as InstanceType<typeof maplibregl.Map>).resize(),
      );

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

    return () => {
      resizeObserver?.disconnect();
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

  // ── Sync backend prediction data into store ──────────────────────────────
  useEffect(() => {
    if (!backendRiskEvents) return;
    // Convert backend RiskEvent (bigint timestamps in nanoseconds) to frontend (ms)
    const converted: FrontendRiskEvent[] = backendRiskEvents.map((e) => ({
      id: e.id,
      name: e.name,
      startDate: Number(e.startDate) / 1_000_000,
      endDate: Number(e.endDate) / 1_000_000,
      affectedZIPs: e.affectedZIPs,
      multiplier: e.multiplier,
      fileUrl: e.fileUrl,
      createdAt: Number(e.createdAt) / 1_000_000,
    }));
    setRiskEvents(converted);
  }, [backendRiskEvents, setRiskEvents]);

  useEffect(() => {
    if (weatherRisk !== undefined && weatherRisk !== null) {
      setWeatherRiskMultiplier(weatherRisk);
    }
  }, [weatherRisk, setWeatherRiskMultiplier]);

  useEffect(() => {
    if (socialStressData && socialStressData.length > 0) {
      setSocialStressBaseline(socialStressData);
    }
  }, [socialStressData, setSocialStressBaseline]);

  // ── Sentinel Risk layer — add/remove/update ──────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const SENTINEL_SOURCE = "sentinel-risk-source";
    const SENTINEL_LAYER = "sentinel-risk-layer";

    function removeSentinelLayer() {
      try {
        if (map.getLayer(SENTINEL_LAYER)) map.removeLayer(SENTINEL_LAYER);
        if (map.getSource(SENTINEL_SOURCE)) map.removeSource(SENTINEL_SOURCE);
      } catch (_e) {
        /* ignore if already removed */
      }
    }

    if (!sentinelActive) {
      removeSentinelLayer();
      return;
    }

    // Build GeoJSON from current providers
    const providerPoints = providers.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      id: p.id,
      zip: p.id.includes("-") ? p.id.split("-")[0] : undefined,
    }));

    const sentinelGeoJSON = buildSentinelGeoJSON(providerPoints, {
      settings: predictionSettings,
      riskEvents: storeRiskEvents,
      socialStressBaseline: storeSocialStress,
      weatherRiskMultiplier: storeWeatherMultiplier,
    });

    // If source already exists, just update data
    const existingSource = map.getSource(SENTINEL_SOURCE) as
      | GeoJSONSource
      | undefined;
    if (existingSource) {
      existingSource.setData(sentinelGeoJSON);
      return;
    }

    // Add source and layer for the first time
    map.addSource(SENTINEL_SOURCE, {
      type: "geojson",
      data: sentinelGeoJSON,
    });

    // ── Sentinel heatmap layer — beneath provider pins ────────────────────
    // Insert before the mp-clusters layer so pins stay on top (z-order by insertion)
    const insertBefore = map.getLayer("mp-clusters")
      ? "mp-clusters"
      : undefined;

    map.addLayer(
      {
        id: SENTINEL_LAYER,
        type: "heatmap",
        source: SENTINEL_SOURCE,
        paint: {
          // Weight driven by riskScore (0–1)
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "riskScore"],
            0,
            0,
            1,
            1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.8,
            14,
            2.5,
          ],
          // Color ramp: green (safe) → yellow → orange → red (critical)
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.15,
            "rgba(34,197,94,0.4)", // safe  — live-green tint
            0.35,
            "rgba(234,179,8,0.55)", // low   — yellow
            0.55,
            "rgba(249,115,22,0.65)", // moderate — orange
            0.75,
            "rgba(239,68,68,0.75)", // high  — red
            1.0,
            "rgba(220,38,38,0.88)", // critical — deep red
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            30,
            14,
            60,
          ],
          "heatmap-opacity": 0.72,
        },
      },
      insertBefore,
    );

    return () => {
      // Cleanup only on unmount, not on every deps change
    };
  }, [
    sentinelActive,
    mapReady,
    providers,
    predictionSettings,
    storeRiskEvents,
    storeSocialStress,
    storeWeatherMultiplier,
  ]);
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

  // ── Community Reports layer — add/remove/update ──────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const SOURCE = "citizen-reports-source";
    const LAYER = "citizen-reports-layer";
    const LAYER_LABELS = "citizen-reports-labels";

    function colorForReportType(type: string): string {
      if (type === "narcan-used") return "#22c55e";
      if (
        type === "area-concern" ||
        type === "suspected-od" ||
        type === "bad-batch-alert"
      )
        return "#f97316";
      if (type === "resource-found") return "#60a5fa";
      if (type === "check-in") return "#a78bfa";
      return "#94a3b8";
    }

    function removeReportLayers() {
      try {
        if (map.getLayer(LAYER_LABELS)) map.removeLayer(LAYER_LABELS);
        if (map.getLayer(LAYER)) map.removeLayer(LAYER);
        if (map.getSource(SOURCE)) map.removeSource(SOURCE);
      } catch (_e) {
        /* ignore */
      }
    }

    if (!showCommunityReports) {
      removeReportLayers();
      return;
    }

    // Build GeoJSON from reports that have coordinates
    const reportFeatures = citizenReports
      .filter(
        (r): r is CitizenReport & { lat: number; lng: number } =>
          typeof r.lat === "number" && typeof r.lng === "number",
      )
      .map((r) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [r.lng, r.lat] },
        properties: {
          id: r.id,
          activityType: r.activityType,
          content: r.content,
          upvotes: r.upvotes,
          color: colorForReportType(r.activityType),
          zipCode: r.zipCode,
        },
      }));

    const geoJson: FeatureCollection = {
      type: "FeatureCollection",
      features: reportFeatures,
    };

    const existingSource = map.getSource(SOURCE) as GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(geoJson);
      return;
    }

    map.addSource(SOURCE, { type: "geojson", data: geoJson });

    map.addLayer({
      id: LAYER,
      type: "circle",
      source: SOURCE,
      paint: {
        "circle-radius": 8,
        "circle-color": ["get", "color"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "rgba(255,255,255,0.7)",
        "circle-opacity": 0.9,
      },
    });

    map.addLayer({
      id: LAYER_LABELS,
      type: "symbol",
      source: SOURCE,
      layout: {
        "text-field": ["concat", "👍 ", ["to-string", ["get", "upvotes"]]],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 10,
        "text-offset": [0, 1.2],
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "rgba(0,0,0,0.6)",
        "text-halo-width": 1,
      },
    });

    // Cursor
    for (const lyr of [LAYER, LAYER_LABELS]) {
      map.on("mouseenter", lyr, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", lyr, () => {
        map.getCanvas().style.cursor = "";
      });
    }

    // Popup on click
    map.on("click", LAYER, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const p = feature.properties as {
        id: string;
        activityType: string;
        content: string;
        upvotes: number;
        color: string;
        zipCode: string;
      };
      const truncated =
        p.content.length > 140 ? `${p.content.slice(0, 140)}…` : p.content;
      const typeLabel = p.activityType
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const html = `
        <div style="background:#0d1b2a;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;min-width:210px;max-width:270px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:11px;font-weight:700;color:${p.color};text-transform:uppercase;letter-spacing:0.06em;">${typeLabel}</span>
            <span style="font-size:10px;color:rgba(255,255,255,0.4);">ZIP ${p.zipCode}</span>
          </div>
          <p style="color:#e2e8f0;font-size:12px;line-height:1.5;margin:0 0 10px 0;">${truncated}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:11px;color:rgba(110,231,208,0.7);">👍 ${p.upvotes} upvotes</span>
            <button id="upvote-btn-${p.id}" data-report-id="${p.id}" style="background:rgba(0,255,136,0.12);color:#00ff88;border:1px solid rgba(0,255,136,0.3);font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;cursor:pointer;">Upvote</button>
          </div>
        </div>`;

      new maplibregl.Popup({ closeButton: true, maxWidth: "290px" })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);

      setTimeout(() => {
        const btn = document.getElementById(`upvote-btn-${p.id}`);
        if (btn) {
          btn.addEventListener("click", () => {
            upvoteMutation.mutate(p.id);
            btn.textContent = "✓ Thanks!";
            btn.style.opacity = "0.5";
            (btn as HTMLButtonElement).disabled = true;
          });
        }
      }, 50);
    });

    return () => {
      removeReportLayers();
    };
  }, [showCommunityReports, mapReady, citizenReports, upvoteMutation]);

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
      style={{ height: height || "500px", minHeight: "300px" }}
      data-ocid="map.canvas_target"
    >
      {/* Map canvas — MapLibre mounts here; absolute inset-0 fills the relative parent */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

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

      {/* Report Activity button — opens the composer */}
      {mapReady && (
        <button
          type="button"
          aria-label="Submit a community report"
          onClick={() => setShowComposer(true)}
          data-ocid="map.report_activity_btn"
          className="absolute z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
          style={{
            bottom: "134px",
            right: "10px",
            background: "rgba(15,25,35,0.9)",
            border: "1px solid rgba(0,255,136,0.28)",
            backdropFilter: "blur(8px)",
          }}
        >
          <MessageSquarePlus
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "#00ff88" }}
          />
          <span className="text-xs font-bold" style={{ color: "#00ff88" }}>
            Report
          </span>
        </button>
      )}

      {/* Community Reports toggle chip */}
      {mapReady && (
        <button
          type="button"
          onClick={() => setShowCommunityReports((v) => !v)}
          data-ocid="map.community_reports_toggle"
          aria-pressed={showCommunityReports}
          aria-label={
            showCommunityReports
              ? "Hide community reports"
              : "Show community reports"
          }
          className="absolute z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            bottom: "176px",
            right: "10px",
            background: showCommunityReports
              ? "rgba(96,165,250,0.18)"
              : "rgba(15,25,35,0.9)",
            border: showCommunityReports
              ? "1px solid rgba(96,165,250,0.45)"
              : "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            boxShadow: showCommunityReports
              ? "0 0 12px rgba(96,165,250,0.22)"
              : "none",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <title>Community reports</title>
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke={
                showCommunityReports ? "#60a5fa" : "rgba(110,231,208,0.7)"
              }
              strokeWidth="2"
            />
            <path
              d="M12 2v3M12 19v3M2 12h3M19 12h3"
              stroke={
                showCommunityReports ? "#60a5fa" : "rgba(110,231,208,0.7)"
              }
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span
            className="text-xs font-bold"
            style={{
              color: showCommunityReports ? "#60a5fa" : "rgba(110,231,208,0.7)",
            }}
          >
            Community
          </span>
          {showCommunityReports && citizenReports.length > 0 && (
            <span
              className="px-1 py-px rounded-full text-[9px] font-black leading-none"
              style={{ background: "#60a5fa", color: "#fff" }}
            >
              {citizenReports.length}
            </span>
          )}
        </button>
      )}

      {/* Sentinel Risk toggle chip */}
      {mapReady && (
        <button
          type="button"
          onClick={() => setSentinelActive((v) => !v)}
          data-ocid="map.sentinel_toggle"
          aria-pressed={sentinelActive}
          aria-label={
            sentinelActive
              ? "Disable Sentinel Risk overlay"
              : "Enable Sentinel Risk overlay"
          }
          className="absolute z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            bottom: "218px",
            right: "10px",
            background: sentinelActive
              ? "rgba(220,38,38,0.2)"
              : "rgba(15,25,35,0.9)",
            border: sentinelActive
              ? "1px solid rgba(239,68,68,0.5)"
              : "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            boxShadow: sentinelActive ? "0 0 12px rgba(239,68,68,0.3)" : "none",
          }}
        >
          <AlertTriangle
            className="w-3.5 h-3.5 shrink-0"
            style={{
              color: sentinelActive ? "#f87171" : "rgba(110,231,208,0.7)",
            }}
          />
          <span
            className="text-xs font-bold"
            style={{
              color: sentinelActive ? "#f87171" : "rgba(110,231,208,0.7)",
            }}
          >
            Sentinel
          </span>
          {sentinelActive && (
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
              style={{ background: "#f87171" }}
            />
          )}
        </button>
      )}

      {/* Citizen Report Composer modal */}
      {showComposer && (
        <CitizenReportComposer onClose={() => setShowComposer(false)} />
      )}
    </div>
  );
}
