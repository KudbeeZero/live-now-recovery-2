import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePredictionEngineStore } from "../store/predictionEngineStore";
import {
  useGetSimulationStats,
  useIncrementSimulationStats,
  useInitSimulationTime,
} from "./useQueries";

// ─── Ohio ZIP → City map (required ZIPs from spec) ────────────────────────────

const ZIP_CITY_MAP: Record<string, string> = {
  "44105": "Cleveland",
  "44115": "Cleveland",
  "44310": "Akron",
  "44512": "Youngstown",
  "44718": "Canton",
  "44109": "Cleveland",
  "44612": "Dalton",
  "45505": "Springfield",
  "45011": "Hamilton",
};

const OHIO_ZIPS = Object.keys(ZIP_CITY_MAP);

// ─── Content pools ────────────────────────────────────────────────────────────

/** Toast A — normal recovery handoff with dollar callout */
const NORMAL_POOL: ((city: string, zip: string) => string)[] = [
  (city) =>
    `Agent referred to MAT care in ${city}, OH. Estimated Healthcare Savings: $25,000.`,
  (city) =>
    `Warm handoff completed in ${city}, OH. Estimated Healthcare Savings: $25,000.`,
  (city) =>
    `A volunteer helped someone find treatment in ${city}, OH. Estimated Healthcare Savings: $25,000.`,
  (city) =>
    `New telehealth MAT appointment booked in ${city}, OH. Estimated Healthcare Savings: $25,000.`,
  (_city, zip) =>
    `Naloxone kit picked up in ${zip}. Estimated Healthcare Savings: $25,000.`,
];

/** Toast B — high-risk intervention with dollar callout */
const HIGH_RISK_POOL: ((city: string, zip: string) => string)[] = [
  (_city, zip) =>
    `High-Risk Intervention in ${zip}. Agent referred to MAT. Estimated Healthcare Savings: $25,000.`,
  (_city, zip) =>
    `High-Risk Detection in ${zip}: Cold Snap + Payday. Saving $50,000 in predicted ICU overhead.`,
  (city, zip) =>
    `Sentinel Risk Spike in ${zip} (${city}). MAT referral initiated. Estimated Healthcare Savings: $25,000.`,
];

/** Milestone toast — fires 1-in-5 when potency toggle is active */
const MILESTONE_POOL: ((city: string) => string)[] = [
  (city) =>
    `30-Day Stability Milestone reached in ${city}. Community ROI generated: $45,000.`,
  (city) =>
    `Agent in ${city} crossed the 7-touchpoint threshold. Community ROI generated: $45,000.`,
];

// ─── Audio subsystem ──────────────────────────────────────────────────────────
// Audio context kept for future re-enablement once backend TTS proxy is wired up.

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — used when backend TTS proxy is available

/**
 * Speak text via ElevenLabs TTS (Rachel voice).
 * All ElevenLabs API calls must be routed through the ICP backend proxy to keep
 * the API key out of the frontend bundle. Until a backend `getTextToSpeech`
 * function is available, this silently no-ops so TTS is non-functional but the
 * rest of the simulation continues to work.
 */
export async function speakText(_text: string): Promise<void> {
  // NOTE: TTS is intentionally disabled here. The ElevenLabs API key must
  // never be placed in frontend code. Wire this up to the backend canister's
  // getTextToSpeech() proxy function when it is available.
  console.warn(
    `[speakText] TTS disabled — backend proxy required (voiceId: ${VOICE_ID})`,
  );
}

// ─── Jackpot event listener ───────────────────────────────────────────────────

let jackpotListenerAttached = false;

function attachJackpotListener() {
  if (jackpotListenerAttached) return;
  jackpotListenerAttached = true;

  window.addEventListener("sentinel:jackpot", () => {
    const announcement =
      "30-Day Stability Milestone reached. Community ROI generated: 45,000 dollars.";
    speakText(announcement);
  });

  // ImpactOdometer "Listen" button dispatches this event
  window.addEventListener("sentinel:speak", (e: Event) => {
    const detail = (e as CustomEvent<{ text: string }>).detail;
    if (detail?.text) speakText(detail.text);
  });
}

attachJackpotListener();

// ─── Gaussian distribution helpers ───────────────────────────────────────────

/**
 * Returns a weight 0–1 for a given hour based on a Gaussian centered at 19:00 (7 pm).
 * sigma=3 gives meaningful spread from ~14:00 to midnight.
 */
function gaussianWeight(hour: number): number {
  const mu = 19;
  const sigma = 3;
  return Math.exp(-0.5 * ((hour - mu) / sigma) ** 2);
}

/**
 * Given avgDailyHandoffCount, return the expected ms delay until the next toast.
 * We use the inverse of the Gaussian weight to spread events appropriately:
 * more events near peak hour, fewer at quiet times.
 */
function nextToastDelayMs(avgDailyHandoffCount: number): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const weight = gaussianWeight(hour);

  // Base interval if handoffs were uniform across the day
  const baseIntervalMs =
    (24 * 60 * 60 * 1000) / Math.max(avgDailyHandoffCount, 1);

  // Minimum 8 s to avoid spamming; if weight is ~0 use a long idle delay
  if (weight < 0.05) return Math.min(baseIntervalMs * 10, 5 * 60 * 1000);

  // Scale inversely: at peak weight=1, use shortest interval
  const scaledMs = baseIntervalMs / weight;

  // Clamp: 8 s – 8 min, then add ±30 % jitter for naturalness
  const jitter = 0.7 + Math.random() * 0.6;
  return Math.min(Math.max(scaledMs * jitter, 8_000), 8 * 60 * 1000);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface ActivitySimulationResult {
  /** Handoffs generated in this browser session */
  currentSessionHandoffs: number;
  /** Cumulative handoffs stored in the canister */
  backendTotalHandoffs: number;
  /** Volunteer count from the canister (starts at 47) */
  backendTotalVolunteers: number;
}

export function useActivitySimulation(): ActivitySimulationResult {
  const { settings } = usePredictionEngineStore();
  const { simulationEnabled, avgDailyHandoffCount, potencyToggle } = settings;

  // Backend simulation stats
  const { data: simStats } = useGetSimulationStats();
  const incrementStats = useIncrementSimulationStats();
  const initSimTime = useInitSimulationTime();

  // Session-local handoff counter
  const [currentSessionHandoffs, setCurrentSessionHandoffs] = useState(0);

  // Init simulation time once per session (fire-and-forget)
  const initFiredRef = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initSimMutate = useRef(initSimTime.mutate);
  useEffect(() => {
    initSimMutate.current = initSimTime.mutate;
  });
  useEffect(() => {
    if (initFiredRef.current) return;
    initFiredRef.current = true;
    initSimMutate.current();
  }, []);

  // Keep a ref so the timeout callback always reads the latest values
  const stateRef = useRef({
    simulationEnabled,
    avgDailyHandoffCount,
    potencyToggle,
  });
  useEffect(() => {
    stateRef.current = {
      simulationEnabled,
      avgDailyHandoffCount,
      potencyToggle,
    };
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const incrementStatsMutate = useRef(incrementStats.mutate);
  useEffect(() => {
    incrementStatsMutate.current = incrementStats.mutate;
  });

  useEffect(() => {
    if (!simulationEnabled) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    function scheduleNext() {
      const { simulationEnabled, avgDailyHandoffCount, potencyToggle } =
        stateRef.current;
      if (!simulationEnabled) return;

      const delay = nextToastDelayMs(avgDailyHandoffCount);
      timeoutRef.current = setTimeout(() => {
        fireToast(potencyToggle);
        // Increment session counter
        setCurrentSessionHandoffs((prev) => prev + 1);
        // Increment backend counter: 1 handoff, 1-3 scans (fire-and-forget)
        const scans = Math.floor(Math.random() * 3) + 1;
        incrementStatsMutate.current({ handoffs: 1n, scans: BigInt(scans) });
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [simulationEnabled]);

  const backendTotalHandoffs = simStats ? Number(simStats.totalSimHandoffs) : 0;
  const backendTotalVolunteers = simStats
    ? Number(simStats.totalSimVolunteers)
    : 47;

  return {
    currentSessionHandoffs,
    backendTotalHandoffs,
    backendTotalVolunteers,
  };
}

// ─── Toast firing ─────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fireToast(potencyActive: boolean) {
  const zip = pick(OHIO_ZIPS);
  const city = ZIP_CITY_MAP[zip] ?? "Ohio";

  // Milestone fires 1-in-5 when potency toggle is on
  if (potencyActive && Math.random() < 0.2) {
    const msgFn = pick(MILESTONE_POOL);
    const message = msgFn(city);
    toast.success(message, {
      position: "bottom-left",
      duration: 6000,
      className:
        "bg-[oklch(0.22_0.038_225)] text-white border border-[oklch(var(--live))] text-sm font-semibold",
      icon: "🏆",
    });
    speakText(message);
    return;
  }

  // High-risk pool fires ~58 % when potency toggle is on
  const useHighRisk = potencyActive && Math.random() < 0.58;

  if (useHighRisk) {
    const msgFn = pick(HIGH_RISK_POOL);
    const message = msgFn(city, zip);
    toast.warning(message, {
      position: "bottom-left",
      duration: 4000,
      className:
        "bg-[oklch(0.25_0.05_25)] text-white border border-[oklch(0.6_0.18_25)] text-sm font-medium",
      icon: "⚠️",
    });
    speakText(message);
  } else {
    const msgFn = pick(NORMAL_POOL);
    const message = msgFn(city, zip);
    toast(message, {
      position: "bottom-left",
      duration: 4000,
      className:
        "bg-[oklch(0.22_0.038_225)] text-white border border-[oklch(var(--live))] text-sm font-medium",
      icon: "🤝",
    });
    speakText(message);
  }
}
