/**
 * ImpactOdometer — The Mark Cuban pitch moment component.
 * Live-ticking fiscal impact dashboard for the Sentinel Prediction Engine.
 * Shows healthcare savings, lives saved, community reinvestment fund, and
 * stability pipeline. Supports ElevenLabs "Listen" TTS summary.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Heart,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { speakText } from "../hooks/useActivitySimulation";
import { usePredictionEngineStore } from "../store/predictionEngineStore";

// ─── Constants ────────────────────────────────────────────────────────────────

// Use Tailwind emerald-400 (#4ade80) for Recharts/inline-style contexts
// where CSS custom properties cannot be read. This aligns with --live token.
const GREEN_HEX = "#4ade80";
const NAVY_CARD = "oklch(0.13 0.03 240)";
const NAVY_BORDER = "oklch(0.22 0.05 240)";
const MUTED_TEXT = "oklch(0.55 0.03 220)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n).toLocaleString()}`;
  return `$${Math.round(n)}`;
}

function formatLives(n: number): string {
  return n.toFixed(2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OdometerDigit({ value, color }: { value: string; color: string }) {
  return (
    <span
      className="font-mono font-extrabold tabular-nums"
      style={{
        color,
        textShadow: `0 0 24px ${color}80, 0 0 8px ${color}40`,
        fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
        lineHeight: 1.1,
      }}
    >
      {value}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subLabel,
  color,
  glowing,
  badge,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  value: string;
  subLabel?: string;
  color: string;
  glowing?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: NAVY_CARD,
        border: `1px solid ${color}35`,
        boxShadow: glowing
          ? `0 0 32px ${color}20, inset 0 1px 0 ${color}10`
          : "none",
        transition: "box-shadow 0.4s ease",
      }}
      data-ocid="impact_odometer.metric_card"
    >
      {/* Ambient glow top-right */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
        }}
      />
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: MUTED_TEXT }}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="flex items-end gap-2 flex-wrap">
        <OdometerDigit value={value} color={color} />
        {badge}
      </div>
      {subLabel && (
        <p className="text-xs" style={{ color: MUTED_TEXT }}>
          {subLabel}
        </p>
      )}
    </div>
  );
}

function StabilityPipelineBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
      data-ocid="impact_odometer.pipeline_bar"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: `${GREEN_HEX}18`,
              border: `1px solid ${GREEN_HEX}30`,
            }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: GREEN_HEX }} />
          </div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: MUTED_TEXT }}
            >
              Stability Pipeline
            </p>
            <p className="text-xs" style={{ color: MUTED_TEXT }}>
              Agents reaching 7th touchpoint ($45k ROI threshold)
            </p>
          </div>
        </div>
        <span
          className="font-bold text-xl font-mono tabular-nums"
          style={{ color: GREEN_HEX, textShadow: `0 0 16px ${GREEN_HEX}60` }}
        >
          {clamped.toFixed(1)}%
        </span>
      </div>
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ background: "oklch(0.18 0.03 240)" }}
        tabIndex={0}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Stability pipeline ${clamped.toFixed(1)} percent`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, oklch(0.45 0.17 155) 0%, ${GREEN_HEX} 50%, oklch(0.75 0.18 155) 100%)`,
            boxShadow: `0 0 12px ${GREEN_HEX}60`,
            transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: MUTED_TEXT }}
      >
        <span>0 touchpoints</span>
        <span className="font-semibold" style={{ color: GREEN_HEX }}>
          7th touchpoint = $45,000 community ROI
        </span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ─── Jackpot animation overlay ────────────────────────────────────────────────

function JackpotFlash({ zip }: { zip: string }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      style={{ animation: "jackpotFade 2.8s ease-out forwards" }}
    >
      <div
        className="px-8 py-6 rounded-3xl text-center"
        style={{
          background: "oklch(0.12 0.04 155)",
          border: `2px solid ${GREEN_HEX}`,
          boxShadow: `0 0 80px ${GREEN_HEX}40`,
          animation: "jackpotScale 2.8s ease-out forwards",
        }}
      >
        <p
          className="text-4xl font-extrabold mb-1"
          style={{ color: GREEN_HEX, textShadow: `0 0 40px ${GREEN_HEX}` }}
        >
          +$45,000
        </p>
        <p
          className="text-sm font-semibold"
          style={{ color: "oklch(0.75 0.1 155)" }}
        >
          30-Day Stability Milestone — {zip}
        </p>
        <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.08 155)" }}>
          Community ROI Unlocked
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface ImpactOdometerProps {
  /** Override fiscal data (used when parent manages state directly) */
  dollarsSaved?: number;
  livesSaved?: number;
  stabilizedAgents?: number;
  stabilityPipelinePercent?: number;
  communityReinvestmentFund?: number;
  /** If true, shows 'Accelerated' badge and faster tick */
  accelerated?: boolean;
  /** Sensitivity slider value (0-100) — if >50 shows Healthcare Burn row */
  sensitivity?: number;
}

export function ImpactOdometer({
  dollarsSaved: propDollarsSaved,
  livesSaved: propLivesSaved,
  stabilizedAgents: propStabilizedAgents,
  stabilityPipelinePercent: propPipelinePercent,
  communityReinvestmentFund: propCRF,
  accelerated: propAccelerated,
  sensitivity: propSensitivity,
}: ImpactOdometerProps = {}) {
  const { settings, fiscalData } = usePredictionEngineStore();

  // Prefer prop values, then store values
  const dollarsSaved = propDollarsSaved ?? fiscalData?.totalDollarsSaved ?? 0;
  const livesSaved = propLivesSaved ?? fiscalData?.livesSaved ?? 0;
  const stabilizedAgents =
    propStabilizedAgents ?? fiscalData?.stabilizedAgents ?? 0;
  const pipelinePercent =
    propPipelinePercent ?? fiscalData?.stabilityPipelinePercent ?? 0;
  const crf =
    propCRF ?? fiscalData?.communityReinvestmentFund ?? dollarsSaved * 0.15;

  const accelerated = propAccelerated ?? settings.potencyToggle;
  const sensitivity = propSensitivity ?? settings.sensitivitySlider;

  // Animated display values (smooth tick)
  const [displayDollars, setDisplayDollars] = useState(dollarsSaved);
  const [displayLives, setDisplayLives] = useState(livesSaved);
  const [displayCRF, setDisplayCRF] = useState(crf);
  const [isListening, setIsListening] = useState(false);
  const [listenError, setListenError] = useState(false);
  const [jackpotZip, setJackpotZip] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Smooth counter animation toward target
  useEffect(() => {
    setDisplayDollars((prev) => prev + (dollarsSaved - prev) * 0.15);
    setDisplayLives((prev) => prev + (livesSaved - prev) * 0.15);
    setDisplayCRF((prev) => prev + (crf - prev) * 0.15);
  }, [dollarsSaved, livesSaved, crf]);

  // Tick up display values slightly over time for live demo feel
  useEffect(() => {
    const tickMs = accelerated ? 3500 : 7000;
    tickRef.current = setInterval(() => {
      setDisplayDollars((prev) => prev + 25);
      setDisplayCRF((prev) => prev + 3.75);
      setDisplayLives((prev) => +(prev + 0.002).toFixed(3));
    }, tickMs);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [accelerated]);

  // Listen for jackpot events from the simulation engine
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ agentId: string; zip: string }>)
        .detail;
      setJackpotZip(detail.zip);
      // Clear after animation
      setTimeout(() => setJackpotZip(null), 3000);
    };
    window.addEventListener("sentinel:jackpot", handler);
    return () => window.removeEventListener("sentinel:jackpot", handler);
  }, []);

  // Healthcare burn row (cost of inaction)
  const showBurn = sensitivity > 50;
  const healthcareBurn = (sensitivity / 100) * 2 * displayDollars;

  // ElevenLabs TTS — calls speakText (Rachel voice) directly.
  // Requires a prior user gesture to unlock the Web Audio context (iOS Safari).
  const handleListen = async () => {
    if (isListening) return;
    setIsListening(true);
    setListenError(false);
    const summary = `Sentinel Impact Summary. Total healthcare dollars saved: ${formatDollars(displayDollars)}. Statistical lives saved: ${formatLives(displayLives)}. Community reinvestment fund: ${formatDollars(displayCRF)}. ${stabilizedAgents} agents stabilized.`;
    try {
      await speakText(summary);
    } catch {
      setListenError(true);
      setTimeout(() => setListenError(false), 4000);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-4" data-ocid="impact_odometer">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{
              background: `${GREEN_HEX}15`,
              border: `1px solid ${GREEN_HEX}30`,
            }}
          >
            <DollarSign className="w-5 h-5" style={{ color: GREEN_HEX }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="font-bold text-base"
                style={{ color: "oklch(0.92 0.01 200)" }}
              >
                Impact Odometer
              </h3>
              {accelerated && (
                <Badge
                  className="text-xs font-bold px-2 py-0.5"
                  style={{
                    background: `${GREEN_HEX}20`,
                    border: `1px solid ${GREEN_HEX}50`,
                    color: GREEN_HEX,
                    animation: "pulse 1.5s infinite",
                  }}
                  data-ocid="impact_odometer.accelerated_badge"
                >
                  ⚡ Accelerated
                </Badge>
              )}
            </div>
            <p className="text-xs" style={{ color: MUTED_TEXT }}>
              7-Attempts persistence model — live fiscal ROI tracker
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleListen}
            disabled={isListening}
            className="flex items-center gap-2 text-xs font-semibold"
            style={{
              background: listenError
                ? "oklch(0.15 0.05 25)"
                : isListening
                  ? `${GREEN_HEX}10`
                  : "transparent",
              border: `1px solid ${listenError ? "oklch(0.45 0.15 25)" : `${GREEN_HEX}40`}`,
              color: listenError ? "#ff5252" : GREEN_HEX,
            }}
            aria-label="Listen to impact summary"
            data-ocid="impact_odometer.listen_button"
          >
            {isListening ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : listenError ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            {isListening
              ? "Generating…"
              : listenError
                ? "Audio unavailable"
                : "Listen to Summary"}
          </Button>
          {listenError && (
            <p className="text-xs" style={{ color: "#ff5252" }}>
              Tap once anywhere to enable audio, then retry.
            </p>
          )}
        </div>
      </div>

      {/* Main metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          icon={DollarSign}
          label="Total Healthcare Dollars Saved"
          value={formatDollars(displayDollars)}
          subLabel="$25k per prevented OD + productivity bonuses"
          color={GREEN_HEX}
          glowing
          badge={
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${GREEN_HEX}15`, color: GREEN_HEX }}
            >
              +$25k/handoff
            </span>
          }
        />
        <MetricCard
          icon={Heart}
          label="Statistical Lives Saved"
          value={formatLives(displayLives)}
          subLabel="0.08 lethality-to-handoff ratio applied"
          color="#ff8a80"
          glowing={displayLives > 0}
        />
        <MetricCard
          icon={RefreshCw}
          label="Community Reinvestment Fund"
          value={formatDollars(displayCRF)}
          subLabel="15% of healthcare savings reallocated to CHWs"
          color="#00bcd4"
          glowing
        />
        <MetricCard
          icon={Users}
          label="Stabilized Agents"
          value={stabilizedAgents.toString()}
          subLabel="Agents who reached touchpoint 7 ($45k ROI unlock)"
          color="#7c4dff"
          glowing={stabilizedAgents > 0}
          badge={
            stabilizedAgents > 0 ? (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "#7c4dff20",
                  color: "#7c4dff",
                  border: "1px solid #7c4dff40",
                }}
              >
                ✓ Stabilized
              </span>
            ) : undefined
          }
        />
      </div>

      {/* Stability Pipeline progress bar */}
      <StabilityPipelineBar percent={pipelinePercent} />

      {/* Healthcare Burn row — cost of inaction */}
      {showBurn && (
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{
            background: "oklch(0.11 0.04 25)",
            border: "1px solid oklch(0.35 0.12 25)",
          }}
          data-ocid="impact_odometer.healthcare_burn"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "oklch(0.30 0.10 25)",
              border: "1px solid oklch(0.40 0.12 25)",
            }}
          >
            <Zap className="w-4 h-4" style={{ color: "#ff5252" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#ff5252" }}
            >
              Healthcare Burn — Cost of Inaction
            </p>
            <p className="text-xs" style={{ color: "oklch(0.55 0.06 25)" }}>
              Projected cost if these interventions are NOT made
              (sensitivity-scaled)
            </p>
          </div>
          <div
            className="font-mono font-extrabold text-xl tabular-nums shrink-0"
            style={{ color: "#ff5252", textShadow: "0 0 16px #ff525280" }}
          >
            {formatDollars(healthcareBurn)}
          </div>
        </div>
      )}

      {/* Jackpot overlay */}
      {jackpotZip && <JackpotFlash zip={jackpotZip} />}

      <style>{`
        @keyframes jackpotFade {
          0% { opacity: 0; }
          10% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes jackpotScale {
          0% { transform: scale(0.8); }
          10% { transform: scale(1.05); }
          20% { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
