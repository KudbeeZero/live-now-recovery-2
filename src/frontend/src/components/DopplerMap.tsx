import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ProviderStatus } from "../backend";
import { useAllProviders } from "../hooks/useQueries";
import { isProviderStale } from "../utils/providerUtils";

const BRIGHTSIDE_COORDS = [
  { city: "Cleveland", id: "brightside-cleveland", lat: 41.4822, lng: -81.743 },
  { city: "Lakewood", id: "brightside-lakewood", lat: 41.4819, lng: -81.7982 },
  { city: "Parma", id: "brightside-parma", lat: 41.3773, lng: -81.729 },
  { city: "Lorain", id: "brightside-lorain", lat: 41.452, lng: -82.1824 },
  { city: "Akron", id: "brightside-akron", lat: 41.0814, lng: -81.519 },
];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });
}

function makeIcon(color: string, glow: string, size = 14): string {
  return `<div style="
    width:${size}px;height:${size}px;
    background:${color};
    border-radius:50%;
    border:2px solid rgba(255,255,255,0.5);
    box-shadow:0 0 10px 3px ${glow};
  "></div>`;
}

export function DopplerMap({ height = "500px" }: { height?: string }) {
  const { data: providers = [] } = useAllProviders();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  // Load Leaflet once
  useEffect(() => {
    if (leafletReady) return;
    loadLeaflet()
      .then(() => setLeafletReady(true))
      .catch(console.error);
  }, [leafletReady]);

  // Init map
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [41.4, -81.6],
      zoom: 10,
      minZoom: 8,
      maxZoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    // CartoDB dark tile layer (no API key required)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    // Bounds — NE Ohio
    const bounds = L.latLngBounds([40.394, -82.758], [42.327, -80.519]);
    map.setMaxBounds(bounds);

    // Attribution control bottom-left
    L.control.attribution({ position: "bottomleft" }).addTo(map);

    mapInstanceRef.current = map;
  }, [leafletReady]);

  // Re-render markers whenever providers change
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear old markers
    map.eachLayer((layer: unknown) => {
      const l = layer as any;
      if (l._isCaffeineMarker) map.removeLayer(l);
    });

    // Add Brightside anchor markers (teal/cyan)
    for (const loc of BRIGHTSIDE_COORDS) {
      const icon = L.divIcon({
        className: "",
        html: makeIcon("#22d3ee", "rgba(34,211,238,0.6)", 13),
        iconSize: [13, 13],
        iconAnchor: [6.5, 6.5],
        popupAnchor: [0, -10],
      });
      const marker = L.marker([loc.lat, loc.lng], { icon });
      marker._isCaffeineMarker = true;
      marker.bindPopup(
        `
        <div style="font-family:system-ui;min-width:160px;">
          <div style="font-weight:700;color:#22d3ee;margin-bottom:4px;">Brightside Health</div>
          <div style="color:#e5e7eb;font-size:13px;">${loc.city}</div>
          <div style="margin-top:8px;">
            <a href="/location/${loc.city.toLowerCase()}" 
               style="color:#22d3ee;font-size:12px;text-decoration:underline;"
               onclick="event.stopPropagation()">
              View providers in ${loc.city} →
            </a>
          </div>
        </div>
      `,
        { className: "lnr-popup" },
      );
      marker.addTo(map);
    }

    // Add dynamic provider markers
    for (const p of providers) {
      const isLive =
        p.status === ProviderStatus.Live && !isProviderStale(p.lastVerified);
      const isOffline = p.status === ProviderStatus.Offline;
      const color = isLive ? "#00ff88" : isOffline ? "#4a5568" : "#fbbf24";
      const glow = isLive
        ? "rgba(0,255,136,0.6)"
        : isOffline
          ? "transparent"
          : "rgba(251,191,36,0.4)";
      const size = isLive ? 15 : 11;

      const icon = L.divIcon({
        className: "",
        html: makeIcon(color, glow, size),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -12],
      });

      const statusText = isLive
        ? "🟢 LIVE NOW"
        : isOffline
          ? "⚫ OFFLINE"
          : "🟡 Status Unknown";
      const marker = L.marker([p.lat, p.lng], { icon });
      marker._isCaffeineMarker = true;
      marker.bindPopup(
        `
        <div style="font-family:system-ui;min-width:180px;">
          <div style="font-weight:700;color:#f3f4f6;margin-bottom:4px;font-size:14px;">${p.name}</div>
          <div style="font-size:12px;margin-bottom:8px;">${statusText}</div>
          <a href="/provider/${p.id}" 
             style="display:inline-block;background:#2D9CDB;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;"
             onclick="event.stopPropagation()">
            View Profile →
          </a>
        </div>
      `,
        { className: "lnr-popup" },
      );
      marker.addTo(map);
    }
  }, [providers, leafletReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!leafletReady) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center bg-[#0d1117] rounded-xl"
      >
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading map…
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-card border border-border rounded-xl p-3 text-xs space-y-1.5 shadow-card">
        <p
          className="font-bold text-xs mb-2 tracking-widest uppercase"
          style={{
            color: "#22d3ee",
            textShadow: "0 0 8px rgba(34,211,238,0.5)",
          }}
        >
          Legend
        </p>
        {[
          { color: "#00ff88", label: "Live Now", glow: "0 0 6px #00ff88" },
          { color: "#fbbf24", label: "Status Unknown", glow: "none" },
          { color: "#4a5568", label: "Offline", glow: "none" },
          { color: "#22d3ee", label: "Brightside", glow: "0 0 6px #22d3ee" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: item.color, boxShadow: item.glow }}
            />
            <span style={{ color: "oklch(0.75 0.02 220)" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Live count badge */}
      <div
        className="absolute top-3 left-3 z-[1000] rounded-2xl px-3 py-1.5 text-xs"
        style={{
          background: "rgba(0,255,136,0.10)",
          border: "1px solid rgba(0,255,136,0.25)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#00ff88", boxShadow: "0 0 6px #00ff88" }}
          />
          <span style={{ color: "#00ff88", fontWeight: 700 }}>
            {
              providers.filter(
                (p) =>
                  p.status === ProviderStatus.Live &&
                  !isProviderStale(p.lastVerified),
              ).length
            }{" "}
            Live
          </span>
          <span style={{ color: "rgba(255,255,255,0.45)" }}>providers</span>
        </div>
      </div>

      {/* Quick links for live providers */}
      <div
        className="absolute top-3 right-3 z-[1000] flex flex-col gap-1 max-h-32 overflow-y-auto"
        style={{ maxWidth: "150px" }}
      >
        {providers
          .filter(
            (p) =>
              p.status === ProviderStatus.Live &&
              !isProviderStale(p.lastVerified),
          )
          .slice(0, 3)
          .map((p) => (
            <Link
              key={p.id}
              to="/provider/$id"
              params={{ id: p.id }}
              className="block text-xs px-2 py-1 rounded-lg truncate"
              style={{
                background: "rgba(0,255,136,0.1)",
                border: "1px solid rgba(0,255,136,0.2)",
                color: "#00ff88",
              }}
            >
              ● {p.name.replace("Brightside Health — ", "")}
            </Link>
          ))}
      </div>

      {/* Popup styles injected once */}
      <style>{`
        .lnr-popup .leaflet-popup-content-wrapper {
          background: #1a1c24;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          color: #f3f4f6;
          padding: 2px;
        }
        .lnr-popup .leaflet-popup-tip {
          background: #1a1c24;
        }
        .lnr-popup .leaflet-popup-close-button {
          color: #9ca3af;
          font-size: 18px;
          top: 6px;
          right: 8px;
        }
        .leaflet-container {
          background: #0d1117;
          font-family: "Plus Jakarta Sans", system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
}
