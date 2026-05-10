// ── Hub page local types ─────────────────────────────────────────────────────
// These are the UI-layer types for the Citizens Hub page.
// Backend (Motoko) types are mapped to these in useHubData.ts.

export type AlertSeverity = "Advisory" | "Warning" | "Critical";

export interface SafetyAlert {
  id: string;
  title: string;
  location: string;
  county: string;
  timeAgo: string;
  severity: AlertSeverity;
}

export interface Incident {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  timeAgo: string;
  status: "Active" | "Resolved";
}

export interface NaloxoneLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  resources: string[];
  hours: string;
  lat?: number;
  lng?: number;
}
