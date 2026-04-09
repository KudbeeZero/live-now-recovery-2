import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, MapPin, Phone } from "lucide-react";
import type { ProviderWithStatus } from "../backend";
import {
  BRIGHTSIDE_LOCATIONS,
  BrightsideAnchor,
} from "../components/BrightsideAnchor";
import { PriceComparisonCard } from "../components/PriceComparisonCard";
import { useAllProviders } from "../hooks/useQueries";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// City center coordinates for the 15 supported routes
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  cleveland: { lat: 41.4993, lng: -81.6944 },
  lakewood: { lat: 41.4819, lng: -81.7982 },
  parma: { lat: 41.3773, lng: -81.729 },
  lorain: { lat: 41.4529, lng: -82.1824 },
  akron: { lat: 41.0814, lng: -81.519 },
  youngstown: { lat: 41.0998, lng: -80.6495 },
  canton: { lat: 40.7989, lng: -81.3784 },
  elyria: { lat: 41.3684, lng: -82.1077 },
  mentor: { lat: 41.6661, lng: -81.3396 },
  strongsville: { lat: 41.3145, lng: -81.8357 },
  euclid: { lat: 41.5931, lng: -81.5268 },
  sandusky: { lat: 41.4487, lng: -82.7079 },
  warren: { lat: 41.2376, lng: -80.8184 },
  toledo: { lat: 41.6639, lng: -83.5552 },
  medina: { lat: 41.1386, lng: -81.8638 },
};

type ProviderWithDist = ProviderWithStatus & { distMi: number };

// Haversine distance in miles
function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  MAT: {
    label: "MAT Clinic",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.30)",
  },
  Narcan: {
    label: "Narcan Distribution",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.30)",
  },
  ER: {
    label: "Emergency Room",
    color: "#f87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.30)",
  },
  "Naloxone Kiosk": {
    label: "Naloxone Kiosk",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.10)",
    border: "rgba(192,132,252,0.30)",
  },
  "Telehealth MAT": {
    label: "Telehealth MAT",
    color: "#818cf8",
    bg: "rgba(129,140,248,0.10)",
    border: "rgba(129,140,248,0.30)",
  },
};

function typeCfg(raw: string) {
  // Exact match first
  if (TYPE_CONFIG[raw]) return TYPE_CONFIG[raw];
  // Fuzzy fallback
  if (/^mat/i.test(raw)) return TYPE_CONFIG.MAT;
  if (/narcan|naloxone kiosk/i.test(raw)) return TYPE_CONFIG["Naloxone Kiosk"];
  if (/narcan/i.test(raw)) return TYPE_CONFIG.Narcan;
  if (/telehealth/i.test(raw)) return TYPE_CONFIG["Telehealth MAT"];
  if (/er$|emergency/i.test(raw)) return TYPE_CONFIG.ER;
  return {
    label: raw || "Provider",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.10)",
    border: "rgba(148,163,184,0.30)",
  };
}

export function LocationPage({ townOverride }: { townOverride?: string }) {
  const params = useParams({ strict: false }) as { town?: string };
  const town = (townOverride ?? params.town ?? "").toLowerCase();
  const cityName = capitalize(town);
  const hasBrightside = BRIGHTSIDE_LOCATIONS.some(
    (l) => l.name.toLowerCase() === town,
  );

  const cityCoords = CITY_COORDS[town];
  const { data: allProviders = [], isLoading } = useAllProviders();

  const nearbyProviders: ProviderWithDist[] = cityCoords
    ? (allProviders as ProviderWithStatus[])
        .map(
          (p): ProviderWithDist => ({
            ...p,
            distMi: distanceMiles(cityCoords.lat, cityCoords.lng, p.lat, p.lng),
          }),
        )
        .sort((a, b) => a.distMi - b.distMi)
        .slice(0, 12)
    : [];

  return (
    <main className="min-h-screen py-10 px-4" data-ocid="location.page">
      <div className="max-w-5xl mx-auto">
        {/* SEO heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            MAT Providers in {cityName}, Ohio
          </h1>
          <p className="text-muted-foreground">
            Real-time availability for medication-assisted treatment in{" "}
            {cityName}. Region 13 coverage.
          </p>
        </div>

        {/* Crisis banner */}
        <div
          className="mb-8 p-4 rounded-xl bg-crisis-banner/10 border border-crisis-banner/20 flex items-start gap-3"
          data-ocid="location.panel"
        >
          <AlertCircle className="w-5 h-5 text-crisis-banner shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-crisis-banner text-sm">
              Need help right now?
            </p>
            <p className="text-sm text-foreground/80">
              Call Ohio MAR NOW:{" "}
              <a
                href="tel:833-234-6343"
                className="font-bold text-crisis-banner hover:underline"
              >
                833-234-6343
              </a>{" "}
              — 24/7 crisis support
            </p>
          </div>
        </div>

        {/* Provider card grid */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Providers Near {cityName}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card animate-pulse"
                  style={{ height: "140px" }}
                />
              ))}
            </div>
          ) : nearbyProviders.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">
                No providers listed in this area yet.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Call Ohio MAR NOW at{" "}
                <a
                  href="tel:833-234-6343"
                  className="text-crisis-banner hover:underline font-bold"
                >
                  833-234-6343
                </a>{" "}
                for immediate assistance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyProviders.map((p) => {
                const cfg = typeCfg(
                  (p as { providerType?: string }).providerType ?? "",
                );
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border bg-card p-5 flex flex-col gap-3 transition-shadow hover:shadow-glow"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    {/* Type badge */}
                    <span
                      className="self-start text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        color: cfg.color,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      {cfg.label}
                    </span>

                    {/* Provider name */}
                    <p className="font-bold text-white text-base leading-snug">
                      {p.name}
                    </p>

                    {/* Distance */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {p.distMi < 0.1
                        ? "In city center"
                        : `${p.distMi.toFixed(1)} mi from ${cityName}`}
                    </p>

                    {/* View button */}
                    <Link
                      to="/provider/$id"
                      params={{ id: p.id }}
                      className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                      style={{
                        background: "rgba(45,156,219,0.15)",
                        border: "1px solid rgba(45,156,219,0.35)",
                        color: "#2D9CDB",
                      }}
                    >
                      View Provider
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Price comparison — full width below grid */}
        <div className="mb-10">
          <PriceComparisonCard />
        </div>

        {/* Brightside anchor */}
        {hasBrightside && (
          <div className="mb-10">
            <BrightsideAnchor filterCity={cityName} />
          </div>
        )}

        {/* Local resources */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6">
          <h2 className="font-bold text-white mb-4">
            Local Crisis Resources — {cityName}
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-crisis-banner" />
              <span>
                <strong>Ohio MAR NOW:</strong>{" "}
                <a
                  href="tel:833-234-6343"
                  className="text-crisis-banner hover:underline font-bold"
                >
                  833-234-6343
                </a>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-action-blue" />
              <span>
                <strong>SAMHSA Helpline:</strong>{" "}
                <a
                  href="tel:1-800-662-4357"
                  className="text-action-blue hover:underline"
                >
                  1-800-662-HELP (4357)
                </a>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>988 Suicide &amp; Crisis Lifeline:</strong>{" "}
                <a href="tel:988" className="text-action-blue hover:underline">
                  988
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
