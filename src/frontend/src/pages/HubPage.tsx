import { AlertTriangle, Bell, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SEO } from "../components/SEO";
import { useHubData } from "../hooks/useHubData";
import { useRelativeTime } from "../hooks/useRelativeTime";
import type {
  AlertSeverity,
  Incident,
  NaloxoneLocation,
  SafetyAlert,
} from "../types/hub";

// ── Severity badge config ─────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; className: string }
> = {
  Critical: {
    label: "Critical",
    className:
      "bg-[oklch(0.52_0.19_27_/_0.2)] text-[oklch(0.75_0.14_30)] border border-[oklch(0.52_0.19_27_/_0.4)]",
  },
  Warning: {
    label: "Warning",
    className:
      "bg-[oklch(0.75_0.14_55_/_0.2)] text-[oklch(0.85_0.14_55)] border border-[oklch(0.75_0.14_55_/_0.4)]",
  },
  Advisory: {
    label: "Advisory",
    className:
      "bg-[oklch(0.62_0.17_155_/_0.2)] text-teal-light border border-[oklch(0.62_0.17_155_/_0.4)]",
  },
};

const RESOURCE_TAG_COLORS: Record<string, string> = {
  Naloxone: "bg-primary/10 text-teal-light border border-primary/30",
  "Fentanyl Test Strips":
    "bg-[oklch(0.75_0.14_55_/_0.15)] text-[oklch(0.85_0.14_55)] border border-[oklch(0.75_0.14_55_/_0.3)]",
  "Harm Reduction Supplies":
    "bg-[oklch(0.52_0.14_290_/_0.15)] text-[oklch(0.75_0.14_290)] border border-[oklch(0.52_0.14_290_/_0.3)]",
  "Safe Use Kits":
    "bg-[oklch(0.62_0.17_155_/_0.15)] text-[oklch(0.75_0.17_155)] border border-[oklch(0.62_0.17_155_/_0.3)]",
};

// ── Skeleton loaders ───────────────────────────────────────────────────────────

function AlertsSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-72 h-28 bg-card rounded-xl border border-border animate-pulse"
        />
      ))}
    </div>
  );
}

function IncidentsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 bg-card rounded-xl border border-border animate-pulse"
        />
      ))}
    </div>
  );
}

function LocationsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-44 bg-card rounded-xl border border-border animate-pulse"
        />
      ))}
    </div>
  );
}

// ── Error card ─────────────────────────────────────────────────────────────

function ErrorCard({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border border-teal-light/40 bg-teal-light/5 px-5 py-4 text-sm text-teal-light"
      role="alert"
    >
      {message}
    </div>
  );
}

// ── Live indicator with last-updated time ────────────────────────────────────

function useLiveLabel(lastUpdated: Date | null): string {
  const [label, setLabel] = useState("Live");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!lastUpdated) {
      setLabel("Live");
      return;
    }

    const compute = () => {
      const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (secs < 5) setLabel("Live — just updated");
      else if (secs < 60) setLabel(`Live — updated ${secs}s ago`);
      else {
        const mins = Math.floor(secs / 60);
        setLabel(`Live — updated ${mins}m ago`);
      }
    };

    compute();
    tickRef.current = setInterval(compute, 5000);
    return () => {
      if (tickRef.current !== null) clearInterval(tickRef.current);
    };
  }, [lastUpdated]);

  return label;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function AlertCard({ alert, index }: { alert: SafetyAlert; index: number }) {
  const isCritical = alert.severity === "Critical";
  return (
    <div
      className="flex-shrink-0 w-72 bg-card rounded-xl border border-border card-teal-accent p-4 flex flex-col gap-2.5 hover:border-teal-light/40 transition-colors"
      data-ocid={`hub.alert.${index + 1}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-[oklch(0.75_0.14_30)] shrink-0" />
          ) : (
            <Bell className="w-4 h-4 text-teal-light shrink-0" />
          )}
          <p className="text-sm font-bold text-foreground leading-snug">
            {alert.title}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">{alert.location}</span>
        <span className="text-muted-foreground/50">·</span>
        <span className="shrink-0">{alert.timeAgo}</span>
      </div>
      <SeverityBadge severity={alert.severity} />
    </div>
  );
}

// ── Live auto-refreshing timestamp ─────────────────────────────────────────

function LiveTimeAgo({ incident }: { incident: Incident }) {
  const live = useRelativeTime(incident.rawTimestamp ?? null);
  return <>{live || incident.timeAgo}</>;
}

function IncidentCard({
  incident,
  index,
}: { incident: Incident; index: number }) {
  const isActive = incident.status === "Active";
  return (
    <div
      className={[
        "relative flex gap-4 p-4 rounded-xl min-h-[72px] transition-colors hover:bg-card/80",
        "bg-[oklch(0.18_0.008_240)] border border-border",
        isActive
          ? "border-l-[3px] border-l-teal-light"
          : "border-l-[3px] border-l-border",
      ].join(" ")}
      data-ocid={`hub.incident.${index + 1}`}
    >
      <div className="shrink-0 text-xl leading-none pt-0.5" aria-hidden="true">
        {isActive ? "🚨" : "✓"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-sm font-bold text-foreground">{incident.title}</p>
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-live/10 text-teal-light border border-live/30 shrink-0">
              <span
                className="w-1.5 h-1.5 rounded-full bg-live animate-pulse shrink-0"
                aria-hidden="true"
              />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted/30 text-muted-foreground border border-border shrink-0">
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0"
                aria-hidden="true"
              />
              Resolved
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {incident.neighborhood} · {incident.city} ·{" "}
          <LiveTimeAgo incident={incident} />
        </p>
      </div>
    </div>
  );
}

function ResourceCard({
  resource,
  index,
}: { resource: NaloxoneLocation; index: number }) {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${resource.address} ${resource.city}`)}`;
  return (
    <div
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-teal-light/40 transition-colors"
      data-ocid={`hub.resource.${index + 1}`}
    >
      <div>
        <p className="font-bold text-foreground text-sm">{resource.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {resource.address}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {resource.resources.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
              RESOURCE_TAG_COLORS[tag] ??
              "bg-muted/30 text-muted-foreground border border-border"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="text-on-dark font-medium">Hours:</span>{" "}
        {resource.hours}
      </p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-teal-light/60 text-teal-light text-xs font-semibold hover:bg-teal-light/10 transition-colors min-h-[36px]"
        data-ocid={`hub.resource.directions.${index + 1}`}
      >
        <MapPin className="w-3.5 h-3.5" />
        Get Directions
      </a>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export function HubPage() {
  const [visibleCount, setVisibleCount] = useState(6);

  const {
    alerts,
    alertsLoading,
    alertsError,
    incidents,
    incidentsLoading,
    incidentsError,
    locations,
    locationsLoading,
    locationsError,
    lastUpdated,
  } = useHubData();

  const liveLabel = useLiveLabel(lastUpdated);

  return (
    <main className="min-h-screen bg-background" data-ocid="hub.page">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <SEO
        title="Citizens Hub | Live Safety Alerts & Incidents — Live Now Recovery"
        description="Real-time overdose activity, safety alerts, and naloxone resource locations across Ohio. Updated every 60 seconds. Not a substitute for 911."
        keywords="Ohio safety alerts, live overdose incidents, naloxone locations Ohio, real-time harm reduction, fentanyl alerts Ohio, Narcan kiosk locations"
        canonical="/hub"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Citizens Hub — Live Now Recovery",
          description:
            "Real-time community safety alerts, overdose incidents, and naloxone resource locations across Ohio. Updated every 60 seconds.",
          url: "https://live-now-recovery-3f2.caffeine.xyz/hub",
        }}
      />
      <section
        className="border-b border-border bg-card"
        data-ocid="hub.header.section"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1 h-7 rounded-full bg-teal-light"
                  aria-hidden="true"
                />
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Citizens Hub
                </h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                Real-time overdose activity, safety alerts, and naloxone
                resources across Ohio.
              </p>
            </div>
            {/* Live pulse indicator with last-updated time */}
            <div
              className="flex items-center gap-2 shrink-0 bg-live/10 border border-live/30 px-3 py-1.5 rounded-full"
              data-ocid="hub.live_indicator"
            >
              <span
                className="w-2 h-2 rounded-full bg-live animate-pulse shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-teal-light tracking-wide">
                {liveLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* ── COMMUNITY SAFETY ALERTS ───────────────────────────────────── */}
        <section data-ocid="hub.alerts.section">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle
              className="w-4.5 h-4.5 text-[oklch(0.75_0.14_30)]"
              aria-hidden="true"
            />
            Community Safety Alerts
          </h2>

          {alertsLoading ? (
            <AlertsSkeleton />
          ) : alertsError ? (
            <ErrorCard message={alertsError} />
          ) : alerts.length === 0 ? (
            <div
              className="text-sm text-muted-foreground px-1"
              data-ocid="hub.alerts.empty_state"
            >
              No active alerts at this time.
            </div>
          ) : (
            <div
              className="flex gap-4 overflow-x-auto pb-3"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              data-ocid="hub.alerts.list"
            >
              {alerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── LIVE INCIDENT FEED ──────────────────────────────────────────── */}
        <section data-ocid="hub.feed.section">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full bg-live animate-pulse"
              aria-hidden="true"
            />
            Live Incident Feed
          </h2>

          {incidentsLoading ? (
            <IncidentsSkeleton />
          ) : incidentsError ? (
            <ErrorCard message={incidentsError} />
          ) : incidents.length === 0 ? (
            <div
              className="text-sm text-muted-foreground px-1"
              data-ocid="hub.feed.empty_state"
            >
              No incidents reported recently.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3" data-ocid="hub.feed.list">
                {incidents.slice(0, visibleCount).map((incident, i) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    index={i}
                  />
                ))}
              </div>
              {visibleCount < incidents.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="mt-4 w-full py-3 rounded-xl border border-teal-light/50 text-teal-light text-sm font-semibold hover:bg-teal-light/10 transition-colors min-h-[48px]"
                  data-ocid="hub.feed.load_more_button"
                >
                  Load More
                </button>
              )}
            </>
          )}
        </section>

        {/* ── NALOXONE & RESOURCE DROP LOCATIONS ──────────────────────────── */}
        <section data-ocid="hub.resources.section">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-teal-light" aria-hidden="true" />
            Naloxone &amp; Resources Near You
          </h2>

          {locationsLoading ? (
            <LocationsSkeleton />
          ) : locationsError ? (
            <ErrorCard message={locationsError} />
          ) : locations.length === 0 ? (
            <div
              className="text-sm text-muted-foreground px-1"
              data-ocid="hub.resources.empty_state"
            >
              No verified naloxone locations found at this time.
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              data-ocid="hub.resources.list"
            >
              {locations.map((resource, i) => (
                <ResourceCard key={resource.id} resource={resource} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── DISCLAIMER BANNER ────────────────────────────────────────────── */}
        <div
          className="bg-[oklch(0.12_0.008_240)] border border-border rounded-xl px-5 py-4 text-center"
          data-ocid="hub.disclaimer.panel"
          role="note"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            Live Now Recovery does not verify real-time incident reports. In an
            emergency, call{" "}
            <a
              href="tel:911"
              className="text-teal-light font-semibold hover:underline"
            >
              911
            </a>
            . For crisis support, call or text{" "}
            <a
              href="tel:988"
              className="text-teal-light font-semibold hover:underline"
              data-ocid="hub.disclaimer.988_link"
            >
              988
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
