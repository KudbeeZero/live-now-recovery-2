import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePredictionEngineStore } from "../store/predictionEngineStore";

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

let audioUnlocked = false;
let pendingAudioCtx: AudioContext | null = null;

function ensureAudioContext(): AudioContext {
  if (!pendingAudioCtx) {
    pendingAudioCtx = new AudioContext();
  }
  return pendingAudioCtx;
}

/** Unlock audio on first user gesture — required by iOS Safari */
function setupAudioUnlock() {
  const unlock = () => {
    try {
      const ctx = ensureAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      audioUnlocked = true;
    } catch {
      // ignore
    }
  };
  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
}

// Initialize audio unlock listener immediately (module level)
setupAudioUnlock();

/** Truncate message to max 200 chars for TTS clips */
function truncateForTTS(text: string): string {
  if (text.length <= 200) return text;
  const cut = text.slice(0, 200);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 100 ? `${cut.slice(0, lastSpace)}.` : `${cut}.`;
}

const ELEVENLABS_API_KEY =
  "sk_0f7ce7dfa7d51f3eae33d595787f454d6888a444f1cffef2";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

/**
 * Speak text via ElevenLabs TTS (Rachel voice).
 * Plays through Web Audio API for best cross-platform compatibility.
 * Silently no-ops if audio context is not yet unlocked (user hasn't interacted).
 */
export async function speakText(text: string): Promise<void> {
  if (!audioUnlocked) return;

  const truncated = truncateForTTS(text);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: truncated,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );

    if (!response.ok) return;

    const arrayBuffer = await response.arrayBuffer();
    const ctx = ensureAudioContext();

    // Resume context if suspended (needed on some mobile browsers)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Audio is non-critical — silently degrade
  }
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

export function useActivitySimulation() {
  const { settings } = usePredictionEngineStore();
  const { simulationEnabled, avgDailyHandoffCount, potencyToggle } = settings;

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
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [simulationEnabled]);
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
