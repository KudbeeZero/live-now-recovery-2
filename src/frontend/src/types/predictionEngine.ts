/**
 * Prediction Engine — TypeScript type definitions
 * Mirrors the Motoko backend types from backend.d.ts with frontend-friendly
 * representations (bigint fields converted to number for UI convenience).
 */

// ─── Core settings (mirrors PredictionEngineState in backend.d.ts) ──────────

export interface PredictionEngineSettings {
  weatherToggle: boolean;
  paydayToggle: boolean;
  stressToggle: boolean;
  potencyToggle: boolean;
  /** 0–100 master sensitivity slider */
  sensitivitySlider: number;
  /** Average simulated handoffs per day (controls Gaussian peak height) */
  avgDailyHandoffCount: number;
  /** Whether the activity simulation toasts are firing */
  simulationEnabled: boolean;
}

// ─── Risk events (mirrors RiskEvent in backend.d.ts) ─────────────────────────

export interface RiskEvent {
  id: string;
  name: string;
  /** Unix timestamp milliseconds */
  startDate: number;
  /** Unix timestamp milliseconds */
  endDate: number;
  affectedZIPs: string[];
  /** e.g. 1.4 for a 40% risk increase */
  multiplier: number;
  /** Uploaded file/image URL (empty string if none) */
  fileUrl: string;
  /** Unix timestamp milliseconds */
  createdAt: number;
}

// ─── Weather data ─────────────────────────────────────────────────────────────

export interface WeatherRiskData {
  /** Combined weather risk multiplier (1.0 = baseline, 1.25 = cold/storm) */
  multiplier: number;
  /** Raw alert text from NWS, empty string if clear */
  alertText: string;
  /** When this data was last fetched (ms) */
  fetchedAt: number;
}

// ─── Census social stress ─────────────────────────────────────────────────────

export interface SocialStressData {
  /** ZIP code → social stress multiplier (1.0 baseline, 1.15 for high-stress ZIPs) */
  zipMultipliers: Record<string, number>;
  fetchedAt: number;
}

// ─── Composite risk per ZIP ───────────────────────────────────────────────────

export interface RiskMultipliers {
  /** ZIP code key */
  zip: string;
  payday: number;
  weather: number;
  socialStress: number;
  potency: number;
  /** From any matching RiskEvent for the current date */
  eventMultiplier: number;
  /** Final composite value (product of all active multipliers × sensitivity) */
  composite: number;
}

// ─── Fiscal impact (7-Attempts model) ────────────────────────────────────────

export interface TouchpointRecord {
  agentId: string;
  zip: string;
  touchpoints: number;
  stabilized: boolean;
  dollarsSaved: number;
}

export interface FiscalImpactSummary {
  totalDollarsSaved: number;
  livesSaved: number;
  communityReinvestmentFund: number;
  /** Number of agents who have reached touchpoint 7 */
  stabilizedAgents: number;
  /** Percentage of simulated agents at touchpoint 7 */
  stabilityPipelinePercent: number;
}

// ─── Gaussian curve data ──────────────────────────────────────────────────────

export interface GaussianDataPoint {
  hour: number;
  probability: number;
}
