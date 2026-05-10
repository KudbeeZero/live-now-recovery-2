import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useRef, useState } from "react";
import { type CitizenReport, createActor } from "../backend";
import type { ProviderWithStatus, RiskEvent } from "../backend";
import type {
  AlertSeverity,
  Incident,
  NaloxoneLocation,
  SafetyAlert,
} from "../types/hub";

// ── Timestamp utility ─────────────────────────────────────────────────────────
// Motoko createdAt values are nanosecond timestamps (bigint or number).
// Returns a human-readable relative time string.
export const fromNanoTimestamp = (nano: bigint | number): string => {
  const ms =
    typeof nano === "bigint" ? Number(nano / 1_000_000n) : nano / 1_000_000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins <= 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
};

// ── Ohio ZIP → city lookup (common Ohio ZIPs) ─────────────────────────────────
const ZIP_TO_CITY: Record<string, string> = {
  "43201": "Columbus",
  "43202": "Columbus",
  "43203": "Columbus",
  "43204": "Columbus",
  "43205": "Columbus",
  "43206": "Columbus",
  "43207": "Columbus",
  "43209": "Columbus",
  "43210": "Columbus",
  "43211": "Columbus",
  "43212": "Columbus",
  "43213": "Columbus",
  "43214": "Columbus",
  "43215": "Columbus",
  "43219": "Columbus",
  "43220": "Columbus",
  "43221": "Columbus",
  "43222": "Columbus",
  "43223": "Columbus",
  "43224": "Columbus",
  "43227": "Columbus",
  "43228": "Columbus",
  "43229": "Columbus",
  "43230": "Columbus",
  "43231": "Columbus",
  "44101": "Cleveland",
  "44102": "Cleveland",
  "44103": "Cleveland",
  "44104": "Cleveland",
  "44105": "Cleveland",
  "44106": "Cleveland",
  "44107": "Cleveland",
  "44108": "Cleveland",
  "44109": "Cleveland",
  "44110": "Cleveland",
  "44111": "Cleveland",
  "44112": "Cleveland",
  "44113": "Cleveland",
  "44114": "Cleveland",
  "44115": "Cleveland",
  "44120": "Cleveland",
  "44128": "Cleveland",
  "45401": "Dayton",
  "45402": "Dayton",
  "45403": "Dayton",
  "45404": "Dayton",
  "45405": "Dayton",
  "45406": "Dayton",
  "45409": "Dayton",
  "45410": "Dayton",
  "45419": "Dayton",
  "45420": "Dayton",
  "45424": "Dayton",
  "45429": "Dayton",
  "45431": "Dayton",
  "45432": "Dayton",
  "45433": "Dayton",
  "45435": "Dayton",
  "45440": "Dayton",
  "45458": "Dayton",
  "45459": "Dayton",
  "45469": "Dayton",
  "45201": "Cincinnati",
  "45202": "Cincinnati",
  "45203": "Cincinnati",
  "45204": "Cincinnati",
  "45205": "Cincinnati",
  "45206": "Cincinnati",
  "45207": "Cincinnati",
  "45208": "Cincinnati",
  "45209": "Cincinnati",
  "45211": "Cincinnati",
  "45212": "Cincinnati",
  "45213": "Cincinnati",
  "45214": "Cincinnati",
  "45215": "Cincinnati",
  "45216": "Cincinnati",
  "45217": "Cincinnati",
  "45218": "Cincinnati",
  "45219": "Cincinnati",
  "45220": "Cincinnati",
  "45223": "Cincinnati",
  "45224": "Cincinnati",
  "45225": "Cincinnati",
  "45226": "Cincinnati",
  "45227": "Cincinnati",
  "45229": "Cincinnati",
  "45230": "Cincinnati",
  "45231": "Cincinnati",
  "44501": "Youngstown",
  "44502": "Youngstown",
  "44503": "Youngstown",
  "44504": "Youngstown",
  "44505": "Youngstown",
  "44506": "Youngstown",
  "44507": "Youngstown",
  "44509": "Youngstown",
  "44510": "Youngstown",
  "44511": "Youngstown",
  "44512": "Youngstown",
  "44514": "Youngstown",
  "44515": "Youngstown",
  "44301": "Akron",
  "44302": "Akron",
  "44303": "Akron",
  "44304": "Akron",
  "44305": "Akron",
  "44306": "Akron",
  "44307": "Akron",
  "44308": "Akron",
  "44309": "Akron",
  "44310": "Akron",
  "44311": "Akron",
  "44312": "Akron",
  "44313": "Akron",
  "44314": "Akron",
  "44319": "Akron",
  "44320": "Akron",
  "44321": "Akron",
  "44325": "Akron",
  "44333": "Akron",
  "43601": "Toledo",
  "43602": "Toledo",
  "43603": "Toledo",
  "43604": "Toledo",
  "43605": "Toledo",
  "43606": "Toledo",
  "43607": "Toledo",
  "43608": "Toledo",
  "43609": "Toledo",
  "43610": "Toledo",
  "43611": "Toledo",
  "43612": "Toledo",
  "43613": "Toledo",
  "43614": "Toledo",
  "43615": "Toledo",
  "43616": "Toledo",
  "43617": "Toledo",
  "43619": "Toledo",
  "43620": "Toledo",
  "43623": "Toledo",
};

function cityFromZip(zip: string): string {
  return ZIP_TO_CITY[zip] ?? "Ohio";
}

// ── Alert severity derivation ─────────────────────────────────────────────────
// Derives severity from the risk event name.
function deriveSeverity(name: string): AlertSeverity {
  const lower = name.toLowerCase();
  if (
    lower.includes("fentanyl") ||
    lower.includes("critical") ||
    lower.includes("xylazine") ||
    lower.includes("nitazene") ||
    lower.includes("overdose death")
  )
    return "Critical";
  if (
    lower.includes("supply low") ||
    lower.includes("warning") ||
    lower.includes("shortage") ||
    lower.includes("contaminated")
  )
    return "Warning";
  return "Advisory";
}

// ── Incident title mapping ────────────────────────────────────────────────────
// Maps Motoko activityType strings to human-readable titles.
function incidentTitle(activityType: string): string {
  switch (activityType) {
    case "overdose":
      return "Suspected Overdose";
    case "reversal":
      return "Overdose Reversal (Naloxone Used)";
    case "medical_emergency":
      return "Medical Emergency";
    case "crisis":
      return "Crisis Line Activated";
    case "welfare_check":
      return "Welfare Check Requested";
    default:
      // Capitalise the raw value for any future types
      return activityType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

// Derives Active/Resolved status from activityType.
function incidentStatus(activityType: string): "Active" | "Resolved" {
  return activityType === "reversal" || activityType === "welfare_check"
    ? "Resolved"
    : "Active";
}

// ── Provider type filter ──────────────────────────────────────────────────────
const NALOXONE_PROVIDER_TYPES = new Set([
  "harm_reduction",
  "naloxone_distribution",
  "outpatient",
  "Naloxone Distribution",
  "Naloxone Kiosk",
  "Harm Reduction",
]);

function isNaloxoneProvider(p: ProviderWithStatus): boolean {
  return NALOXONE_PROVIDER_TYPES.has(p.providerType);
}

// Parse inventory string to resource array (comma or semicolon separated).
function parseInventory(inventory: string): string[] {
  if (!inventory) return [];
  return inventory
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

function mapRiskEventToAlert(event: RiskEvent): SafetyAlert {
  // affectedZIPs[0] used as location; county derived from first ZIP's city
  const firstZip = event.affectedZIPs[0] ?? "";
  const city = cityFromZip(firstZip);
  const location = firstZip ? `${city} (ZIP: ${firstZip})` : city;
  const county = firstZip ? `ZIP ${firstZip}` : "Ohio";

  return {
    id: event.id,
    title: event.name,
    // Mapping: name → title (as-is, matches RiskEvent.name)
    location,
    county,
    // Mapping: createdAt (Int nanoseconds) → human-readable relative time
    timeAgo: fromNanoTimestamp(event.createdAt),
    // Mapping: severity derived from name text
    severity: deriveSeverity(event.name),
  };
}

function mapReportToIncident(report: CitizenReport): Incident {
  const city = cityFromZip(report.zipCode);
  return {
    id: report.id,
    // Mapping: activityType → formatted title
    title: incidentTitle(report.activityType),
    // Mapping: zipCode → neighborhood (used as-is), city looked up from ZIP
    neighborhood: report.zipCode,
    city,
    // Mapping: createdAt (Int nanoseconds) → human-readable relative time
    timeAgo: fromNanoTimestamp(report.createdAt),
    // Mapping: activityType → Active|Resolved
    status: incidentStatus(report.activityType),
  };
}

function mapProviderToLocation(p: ProviderWithStatus): NaloxoneLocation {
  // Mapping: inventory string (comma/semicolon separated) → resources array
  const resources = parseInventory(p.inventory);
  return {
    id: p.id,
    name: p.name,
    // Provider has no address field — use name + type as address placeholder
    address: `${p.name} — ${p.providerType}`,
    // Mapping: no city on Provider — derive from nearest major context
    city: "Ohio",
    resources: resources.length > 0 ? resources : ["Naloxone"],
    // Mapping: no hours on Provider — fallback text
    hours: "Contact for hours",
    // Mapping: lat/lng present on ProviderWithStatus as numbers
    lat: p.lat,
    lng: p.lng,
  };
}

// ── useHubData hook ───────────────────────────────────────────────────────────

export interface HubData {
  alerts: SafetyAlert[];
  alertsLoading: boolean;
  alertsError: string | null;

  incidents: Incident[];
  incidentsLoading: boolean;
  incidentsError: string | null;

  locations: NaloxoneLocation[];
  locationsLoading: boolean;
  locationsError: string | null;

  /** Timestamp of the most recent successful alerts or incidents poll */
  lastUpdated: Date | null;
}

/**
 * Fetches all three Citizens Hub data sections independently.
 * A failure in one section NEVER affects the others.
 *
 * Alerts and incidents are polled every 60 seconds for a live feel.
 * lastUpdated is exported so the Live indicator can show "updated Xs ago".
 */
export function useHubData(): HubData {
  const { actor, isFetching } = useActor(createActor);

  // ── Alerts state ───────────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  // ── Incidents state ────────────────────────────────────────────────────────
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);

  // ── Locations state ────────────────────────────────────────────────────────
  const [locations, setLocations] = useState<NaloxoneLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // ── Last updated timestamp ─────────────────────────────────────────────────
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Tracks whether each section has ever loaded (to suppress loading flash on polls)
  const alertsHasData = useRef(false);
  const incidentsHasData = useRef(false);

  // ── Fetch alerts ────────────────────────────────────────────────────────────
  const fetchAlerts = useCallback(
    async (silent = false) => {
      if (!actor) return;
      if (!silent) setAlertsLoading(true);
      try {
        const raw = await actor.getRiskEvents();
        const mapped: SafetyAlert[] = raw.map(mapRiskEventToAlert);
        setAlerts(mapped);
        setAlertsError(null);
        alertsHasData.current = true;
        setLastUpdated(new Date());
      } catch (err) {
        console.error("[useHubData] Failed to fetch alerts:", err);
        setAlertsError("Unable to load alerts right now. Try refreshing.");
        // Keep previous data if available
      } finally {
        setAlertsLoading(false);
      }
    },
    [actor],
  );

  // ── Fetch incidents ─────────────────────────────────────────────────────────
  const fetchIncidents = useCallback(
    async (silent = false) => {
      if (!actor) return;
      if (!silent) setIncidentsLoading(true);
      try {
        const raw = await actor.getAllReports();
        const mapped: Incident[] = raw.map(mapReportToIncident);
        setIncidents(mapped);
        setIncidentsError(null);
        incidentsHasData.current = true;
        setLastUpdated(new Date());
      } catch (err) {
        console.error("[useHubData] Failed to fetch incidents:", err);
        setIncidentsError(
          "Unable to load incidents right now. Try refreshing.",
        );
      } finally {
        setIncidentsLoading(false);
      }
    },
    [actor],
  );

  // ── Fetch naloxone locations ────────────────────────────────────────────────
  const fetchLocations = useCallback(async () => {
    if (!actor) return;
    setLocationsLoading(true);
    try {
      const raw = await actor.getAllProviders();

      // Graceful field-presence check — warn and fall back if schema fields missing
      const firstProvider = raw[0];
      const hasVerifiedField =
        firstProvider !== undefined && "is_verified" in firstProvider;
      const hasActiveField =
        firstProvider !== undefined && "is_active" in firstProvider;
      const hasReputationField =
        firstProvider !== undefined && "reputationScore" in firstProvider;

      if (!hasVerifiedField || !hasActiveField || !hasReputationField) {
        console.warn(
          "[useHubData] Provider schema missing is_verified/is_active/reputationScore — using unfiltered results",
        );
        const mapped = raw.slice(0, 10).map(mapProviderToLocation);
        setLocations(mapped);
        setLocationsError(null);
        return;
      }

      const filtered = raw
        .filter(
          (p) =>
            p.is_verified === true &&
            p.is_active === true &&
            isNaloxoneProvider(p),
        )
        .sort((a, b) => Number(b.reputationScore) - Number(a.reputationScore))
        .slice(0, 10)
        .map(mapProviderToLocation);

      setLocations(filtered);
      setLocationsError(null);
    } catch (err) {
      console.error("[useHubData] Failed to fetch locations:", err);
      setLocationsError("Unable to load locations right now. Try refreshing.");
    } finally {
      setLocationsLoading(false);
    }
  }, [actor]);

  // ── Initial fetch when actor is ready ──────────────────────────────────────
  useEffect(() => {
    if (!actor || isFetching) return;
    // Fire all three independently — failures are isolated
    fetchAlerts(false);
    fetchIncidents(false);
    fetchLocations();
  }, [actor, isFetching, fetchAlerts, fetchIncidents, fetchLocations]);

  // ── Polling: alerts + incidents every 60 seconds ───────────────────────────
  // Uses silent mode so there's no loading flash on subsequent polls.
  // Locations are not polled — provider data changes slowly.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!actor || isFetching) return;

    intervalRef.current = setInterval(() => {
      // Silent poll — only show loading on first fetch
      const alertsSilent = alertsHasData.current;
      const incidentsSilent = incidentsHasData.current;
      fetchAlerts(alertsSilent);
      fetchIncidents(incidentsSilent);
    }, 60_000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [actor, isFetching, fetchAlerts, fetchIncidents]);

  return {
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
  };
}
