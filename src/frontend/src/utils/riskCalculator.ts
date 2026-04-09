/**
 * Sentinel Risk Calculator
 * Computes composite risk scores for ZIP codes based on active prediction engine state.
 * All calculations are deterministic and client-side; backend supplies raw multiplier data.
 *
 * Uses frontend-friendly PredictionEngineSettings (number fields, not bigint).
 */

import type {
  PredictionEngineSettings,
  RiskEvent,
} from "../types/predictionEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Alias kept for backward compatibility — use RiskEvent from types/predictionEngine */
export type FrontendRiskEvent = RiskEvent;

export interface RiskInputs {
  settings: PredictionEngineSettings;
  riskEvents: RiskEvent[];
  /** ZIP → social stress multiplier (e.g. 1.15 for high-stress ZIPs) */
  socialStressBaseline: Map<string, number>;
  /** Global weather risk multiplier from backend (1.0 = normal, 1.25 = cold/storm) */
  weatherRiskMultiplier: number;
}

// ─── Payday multiplier (client-side, date-aware) ──────────────────────────────

/**
 * Returns payday multiplier based on current date.
 * 1st or 15th of month → 1.4x
 * Friday or Saturday evening (after 5pm) → 1.3x
 * All other times → 1.0x
 */
export function getPaydayMultiplier(now: Date = new Date()): number {
  const day = now.getDate();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sun, 5=Fri, 6=Sat

  if (day === 1 || day === 15) return 1.4;
  if ((dayOfWeek === 5 || dayOfWeek === 6) && hour >= 17) return 1.3;
  return 1.0;
}

// ─── Composite risk score per ZIP ─────────────────────────────────────────────

/**
 * Computes a composite risk score (0.0 – 1.0) for a given ZIP code.
 * Combines all active multipliers and scales by sensitivity.
 */
export function compositeRiskScore(
  zip: string,
  inputs: RiskInputs,
  now: Date = new Date(),
): number {
  const { settings, riskEvents, socialStressBaseline, weatherRiskMultiplier } =
    inputs;
  const sensitivityScale = settings.sensitivitySlider / 100;

  // Base ambient score
  let score = 0.1;

  // ── Weather multiplier ─────────────────────────────────────────────────────
  if (settings.weatherToggle && weatherRiskMultiplier > 1.0) {
    score += (weatherRiskMultiplier - 1.0) * sensitivityScale;
  }

  // ── Payday multiplier ──────────────────────────────────────────────────────
  if (settings.paydayToggle) {
    const pm = getPaydayMultiplier(now);
    if (pm > 1.0) score += (pm - 1.0) * sensitivityScale;
  }

  // ── Social stress baseline ─────────────────────────────────────────────────
  if (settings.stressToggle) {
    const stressMultiplier = socialStressBaseline.get(zip) ?? 1.0;
    if (stressMultiplier > 1.0) {
      score += (stressMultiplier - 1.0) * sensitivityScale;
    }
  }

  // ── Potency / lethality multiplier (2x lethality) ────────────────────────
  if (settings.potencyToggle) {
    score += 0.6 * sensitivityScale;
  }

  // ── Risk event overlaps ────────────────────────────────────────────────────
  const nowMs = now.getTime();
  for (const event of riskEvents) {
    if (nowMs >= event.startDate && nowMs <= event.endDate) {
      if (event.affectedZIPs.length === 0 || event.affectedZIPs.includes(zip)) {
        score += (event.multiplier - 1.0) * sensitivityScale;
      }
    }
  }

  return Math.min(1.0, Math.max(0.0, score));
}

// ─── Gaussian curve helpers ───────────────────────────────────────────────────

function gaussianBell(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z);
}

/**
 * Returns a 24-point array (0-23h) of predicted activity probability (0-100).
 * Uses the active toggle settings to scale amplitude; sensitivity slider controls
 * overall intensity.
 *
 * Overloads:
 *   - (settings, weatherRisk, potencyActive) — new signature per spec
 *   - (settings) — legacy signature (used by PredictionPanel)
 */
export function generateGaussianCurveData(
  settings: Pick<
    PredictionEngineSettings,
    | "weatherToggle"
    | "paydayToggle"
    | "stressToggle"
    | "potencyToggle"
    | "sensitivitySlider"
    | "avgDailyHandoffCount"
  >,
  weatherRisk?: number,
  potencyActive?: boolean,
): GaussianDataPoint[] {
  let multiplier = 1.0;

  const effectiveWeatherRisk = weatherRisk ?? 1.25;
  const effectivePotency =
    potencyActive !== undefined ? potencyActive : settings.potencyToggle;

  if (settings.weatherToggle) multiplier *= Math.max(1.0, effectiveWeatherRisk);
  if (settings.paydayToggle) multiplier *= getPaydayMultiplier();
  if (settings.stressToggle) multiplier *= 1.15;
  if (effectivePotency) multiplier *= 2.0;

  // Sensitivity 0-100 → amplitude 0.3–1.5
  const amp = 0.3 + (settings.sensitivitySlider / 100) * 1.2;

  // Optionally scale base by avgDailyHandoffCount (cap at 50 for display)
  const baseScale =
    "avgDailyHandoffCount" in settings
      ? Math.min(
          1.0,
          (settings as PredictionEngineSettings).avgDailyHandoffCount / 50,
        )
      : 1.0;

  const result: GaussianDataPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const raw =
      gaussianBell(h, 19, 3.5) * 0.9 +
      gaussianBell(h, 14, 2.0) * 0.35 +
      gaussianBell(h, 23, 1.5) * 0.55;
    result.push({
      hour: h,
      probability: Math.min(
        100,
        Math.round(raw * multiplier * amp * baseScale * 100),
      ),
    });
  }
  return result;
}

export interface GaussianDataPoint {
  hour: number;
  probability: number;
}

/** Returns the hour with the highest predicted probability */
export function peakHour(data: GaussianDataPoint[]): number {
  return data.reduce((best, pt) =>
    pt.probability > best.probability ? pt : best,
  ).hour;
}

/** Scales avgDaily by the curve peak amplitude */
export function expectedHandoffs(
  data: GaussianDataPoint[],
  avgDaily: number,
): number {
  const maxProb = Math.max(...data.map((d) => d.probability));
  const scale = maxProb > 0 ? maxProb / 100 : 1;
  return Math.round(avgDaily * (0.5 + scale));
}

/**
 * Maps a composite risk multiplier value to Tailwind color classes + label.
 * Input: multiplier (e.g. 1.4 = HIGH, 1.0 = Normal).
 */
export function riskScoreToColor(score: number): {
  text: string;
  bg: string;
  label: string;
} {
  if (score >= 1.8)
    return { text: "text-red-400", bg: "bg-red-500/20", label: "CRITICAL" };
  if (score >= 1.4)
    return { text: "text-orange-400", bg: "bg-orange-500/20", label: "HIGH" };
  if (score >= 1.2)
    return {
      text: "text-yellow-400",
      bg: "bg-yellow-500/20",
      label: "ELEVATED",
    };
  return { text: "text-live-green", bg: "bg-live-green/10", label: "Normal" };
}

// ─── Score → heatmap weight ───────────────────────────────────────────────────

/**
 * Maps a 0-1 risk score to a heatmap weight for MapLibre GL.
 * Suppresses near-zero scores to keep the map clean when risk is low.
 */
export function riskScoreToHeatmapOpacity(score: number): number {
  const s = Math.min(1.0, Math.max(0.0, score));
  // Suppress very low scores
  if (s < 0.15) return 0;
  return s;
}

// ─── Build sentinel GeoJSON source ────────────────────────────────────────────

export interface SentinelPointProperties {
  riskScore: number;
  zip: string;
}

/**
 * Builds a GeoJSON FeatureCollection for the sentinel-risk-layer heatmap.
 * Each provider becomes a Point with a `riskScore` property derived from
 * the composite risk score for its ZIP code.
 *
 * @param providers   List of providers with lat/lng/zip
 * @param inputs      Active prediction engine inputs (settings, events, stress, weather)
 * @param citizenBoosts  Optional ZIP → citizen-report boost amount (additive, post-calculation)
 */
export function buildSentinelGeoJSON(
  providers: Array<{ lat: number; lng: number; id: string; zip?: string }>,
  inputs: RiskInputs,
  citizenBoosts?: Record<string, number>,
): GeoJSON.FeatureCollection<GeoJSON.Point, SentinelPointProperties> {
  const now = new Date();
  const features = providers.map((p) => {
    const zip = p.zip ?? "";
    const raw = compositeRiskScore(zip, inputs, now);

    // Add citizen-report boost on top of the composite score (additive, capped at 5.0)
    const citizenBoost = citizenBoosts ? (citizenBoosts[zip] ?? 0) : 0;
    const boostedRaw = Math.min(5.0, raw + citizenBoost);

    const riskScore = riskScoreToHeatmapOpacity(boostedRaw);
    return {
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      properties: { riskScore, zip },
    };
  });

  return { type: "FeatureCollection", features };
}

// ─── Fiscal impact helpers (7-Attempts Model) ─────────────────────────────────

/**
 * P_stability = 1 − (1 − 0.15)^n
 * At n=1 → 15%, at n=7 → ~68%
 */
export function stabilityProbability(touchpoints: number): number {
  return 1 - 0.85 ** Math.max(0, touchpoints);
}

/**
 * Dollar savings for a given touchpoint n (1-indexed).
 * Touchpoints 1-3: $25,000 cost avoidance
 * Touchpoints 4-6: +$5,000 productivity bonus
 * Touchpoint 7+:   +$45,000 community ROI
 */
export function dollarsSavedAtTouchpoint(touchpoint: number): number {
  if (touchpoint <= 3) return 25_000;
  if (touchpoint <= 6) return 30_000;
  return 75_000; // 25k + 5k + 45k
}
