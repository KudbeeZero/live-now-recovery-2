/**
 * CredentialAwardModal
 * Fullscreen celebration overlay when a new credential is earned.
 * Pure CSS confetti — no external libraries.
 * Auto-dismisses after 6 seconds with a visible progress bar.
 */
import { useEffect, useRef, useState } from "react";
import type { CredentialType } from "../backend";
import {
  formatEarnedAt,
  getShareUrl,
  getTierColor,
  getTierLabel,
} from "../lib/credentials";
import { CREDENTIAL_META } from "../types/credentials";
import type { Credential } from "../types/credentials";
import { getBadgeSvg } from "./badge-svgs";

// ─── Tier config ─────────────────────────────────────────────────────────────
const TIER_GRADIENT: Record<string, string> = {
  Community:
    "linear-gradient(135deg, oklch(0.22 0.12 155) 0%, oklch(0.18 0.08 185) 100%)",
  PeerSupport:
    "linear-gradient(135deg, oklch(0.20 0.12 240) 0%, oklch(0.17 0.08 218) 100%)",
  Clinical:
    "linear-gradient(135deg, oklch(0.24 0.10 65) 0%, oklch(0.18 0.08 85) 100%)",
  Leadership:
    "linear-gradient(135deg, oklch(0.22 0.12 290) 0%, oklch(0.17 0.09 315) 100%)",
};

const TIER_BORDER: Record<string, string> = {
  Community: "oklch(0.68 0.18 155 / 0.6)",
  PeerSupport: "oklch(0.65 0.18 240 / 0.6)",
  Clinical: "oklch(0.75 0.16 65 / 0.6)",
  Leadership: "oklch(0.68 0.20 290 / 0.6)",
};

const TIER_GLOW: Record<string, string> = {
  Community:
    "0 0 60px oklch(0.68 0.18 155 / 0.35), 0 0 120px oklch(0.68 0.18 155 / 0.15)",
  PeerSupport:
    "0 0 60px oklch(0.65 0.18 240 / 0.35), 0 0 120px oklch(0.65 0.18 240 / 0.15)",
  Clinical:
    "0 0 60px oklch(0.75 0.16 65 / 0.35), 0 0 120px oklch(0.75 0.16 65 / 0.15)",
  Leadership:
    "0 0 60px oklch(0.68 0.20 290 / 0.35), 0 0 120px oklch(0.68 0.20 290 / 0.15)",
};

const CONFETTI_COLORS: Record<string, string[]> = {
  Community: [
    "oklch(0.72 0.20 155)",
    "oklch(0.62 0.15 185)",
    "oklch(0.85 0.18 130)",
    "oklch(0.55 0.12 200)",
  ],
  PeerSupport: [
    "oklch(0.65 0.18 240)",
    "oklch(0.72 0.15 220)",
    "oklch(0.55 0.12 260)",
    "oklch(0.80 0.14 210)",
  ],
  Clinical: [
    "oklch(0.75 0.16 65)",
    "oklch(0.82 0.18 80)",
    "oklch(0.65 0.14 55)",
    "oklch(0.90 0.10 90)",
  ],
  Leadership: [
    "oklch(0.68 0.20 290)",
    "oklch(0.75 0.18 310)",
    "oklch(0.60 0.15 275)",
    "oklch(0.82 0.14 330)",
  ],
};

// ─── Tier normalizer ─────────────────────────────────────────────────────────
// The backend tier() helper returns values with spaces (e.g. 'Peer Support'),
// but the lookup maps above use no-space keys (e.g. 'PeerSupport').
// Always pass tier values through normalizeTier before indexing the maps.
const normalizeTier = (tier: string): keyof typeof TIER_GRADIENT =>
  tier.replace(/\s+/g, "") as keyof typeof TIER_GRADIENT;

// ─── Confetti particle ───────────────────────────────────────────────────────
interface ConfettiParticle {
  id: number;
  color: string;
  x: number; // % from center-x
  y: number; // % start
  size: number; // px
  duration: number; // ms
  delay: number; // ms
  rotation: number; // deg
  shape: "circle" | "square" | "rect";
}

function makeParticles(tier: string, count: number): ConfettiParticle[] {
  const colors =
    CONFETTI_COLORS[normalizeTier(tier)] ?? CONFETTI_COLORS.Community;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: (Math.random() - 0.5) * 240, // ±120% of container width in px
    y: -(Math.random() * 80 + 40), // launch upward 40–120%
    size: Math.random() * 8 + 4, // 4–12 px
    duration: Math.random() * 1200 + 1200, // 1.2–2.4 s
    delay: Math.random() * 400,
    rotation: Math.random() * 720 - 360,
    shape: (["circle", "square", "rect"] as const)[
      Math.floor(Math.random() * 3)
    ],
  }));
}

const AUTO_DISMISS_MS = 6000;

// ─── Props ───────────────────────────────────────────────────────────────────
export interface CredentialAwardModalProps {
  credential: Credential | null;
  onDismiss: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function CredentialAwardModal({
  credential,
  onDismiss,
}: CredentialAwardModalProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── When a new credential arrives, reset and show ──────────────────────────
  useEffect(() => {
    if (!credential) {
      setVisible(false);
      setExiting(false);
      setProgress(100);
      return;
    }

    setExiting(false);
    setProgress(100);
    // tiny delay so CSS enter animation triggers from clean state
    const showTimer = setTimeout(() => setVisible(true), 16);

    // Progress bar tick every 60ms
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(pct);
      if (pct <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 60);

    dismissTimerRef.current = setTimeout(
      () => triggerDismiss(),
      AUTO_DISMISS_MS,
    );

    return () => {
      clearTimeout(showTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [credential]);

  function triggerDismiss() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      onDismiss();
    }, 350);
  }

  if (!credential || !visible) return null;

  const tier = normalizeTier(credential.tier ?? "Community");
  const meta = CREDENTIAL_META[credential.credentialType as CredentialType];
  const displayName = meta?.displayName ?? String(credential.name);
  const description = meta?.description ?? String(credential.description ?? "");
  const tierLabel = getTierLabel(tier);
  const tierTextClass = getTierColor(tier);
  const isHeavy = tier === "Clinical" || tier === "Leadership";
  // tier is already normalized — safe to use directly as map key
  const confettiCount = isHeavy ? 45 : 22;
  const particles = makeParticles(tier, confettiCount);
  const earnedDate = formatEarnedAt(credential.earnedAt);
  const shareUrl = getShareUrl(credential);
  const badgeSvg = getBadgeSvg(String(credential.credentialType));

  const cardStyle: React.CSSProperties = {
    background: TIER_GRADIENT[tier] ?? TIER_GRADIENT.Community,
    border: `1.5px solid ${TIER_BORDER[tier] ?? "oklch(0.5 0.1 218 / 0.5)"}`,
    boxShadow: TIER_GLOW[tier],
  };

  return (
    <>
      {/* CSS keyframes injected inline — no external deps */}
      <style>{`
        @keyframes cred-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cred-backdrop-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes cred-card-in {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.06); opacity: 1; }
          80%  { transform: scale(0.97); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes cred-card-out {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes cred-badge-pop {
          0%   { transform: scale(0); opacity: 0; }
          55%  { transform: scale(1.15); opacity: 1; }
          75%  { transform: scale(0.93); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confetti-burst {
          0%   { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          70%  { opacity: 0.9; }
          100% { transform: translate(var(--cx), calc(var(--cy) + 180px)) rotate(var(--cr)) scale(0.4); opacity: 0; }
        }
        @keyframes shimmer-line {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes unlock-text {
          0%   { letter-spacing: -0.05em; opacity: 0; transform: scale(0.9); }
          100% { letter-spacing: 0.08em; opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: "oklch(0.05 0.02 240 / 0.85)",
          backdropFilter: "blur(6px)",
          animation: exiting
            ? "cred-backdrop-out 0.35s ease forwards"
            : "cred-backdrop-in 0.25s ease forwards",
        }}
        aria-label={`Achievement Unlocked: ${displayName}`}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") triggerDismiss();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) triggerDismiss();
        }}
      >
        {/* Confetti */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {particles.map((p) => (
            <span
              key={p.id}
              style={
                {
                  position: "absolute",
                  left: "50%",
                  top: "40%",
                  width:
                    p.shape === "rect" ? `${p.size * 2.5}px` : `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius:
                    p.shape === "circle"
                      ? "50%"
                      : p.shape === "square"
                        ? "2px"
                        : "1px",
                  background: p.color,
                  // CSS custom properties for the animation target coords
                  ["--cx" as string]: `${p.x}px`,
                  ["--cy" as string]: `${p.y}px`,
                  ["--cr" as string]: `${p.rotation}deg`,
                  animation: `confetti-burst ${p.duration}ms ease-out ${p.delay}ms both`,
                } as React.CSSProperties
              }
            />
          ))}
          {/* Second burst for heavy tiers */}
          {isHeavy &&
            makeParticles(tier, confettiCount).map((p) => (
              <span
                key={`b${p.id}`}
                style={
                  {
                    position: "absolute",
                    left: "50%",
                    top: "40%",
                    width:
                      p.shape === "rect" ? `${p.size * 2.5}px` : `${p.size}px`,
                    height: `${p.size}px`,
                    borderRadius:
                      p.shape === "circle"
                        ? "50%"
                        : p.shape === "square"
                          ? "2px"
                          : "1px",
                    background: p.color,
                    ["--cx" as string]: `${p.x * 0.8}px`,
                    ["--cy" as string]: `${p.y * 1.2}px`,
                    ["--cr" as string]: `${p.rotation}deg`,
                    animation: `confetti-burst ${p.duration}ms ease-out ${p.delay + 600}ms both`,
                  } as React.CSSProperties
                }
              />
            ))}
        </div>

        {/* Modal card — stop click from bubbling to backdrop */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: div is presentation only, keyboard handled by backdrop onKeyDown */}
        <div
          className="relative w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            ...cardStyle,
            animation: exiting
              ? "cred-card-out 0.35s ease forwards"
              : "cred-card-in 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
          onClick={(e) => e.stopPropagation()}
          data-ocid="credential_award.dialog"
        >
          {/* ── Tier header bar ──────────────────────────────────────────── */}
          <div
            className="relative h-2 overflow-hidden"
            style={{
              background: TIER_BORDER[tier] ?? "oklch(0.5 0.1 218)",
            }}
          >
            {/* shimmer */}
            <div
              className="absolute inset-y-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.5), transparent)",
                animation: "shimmer-line 2s linear 0.6s infinite",
              }}
              aria-hidden="true"
            />
          </div>

          {/* ── Close button ─────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={triggerDismiss}
            aria-label="Close achievement modal"
            data-ocid="credential_award.close_button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{ color: "oklch(0.85 0 0 / 0.7)" }}
          >
            ✕
          </button>

          {/* ── Body ─────────────────────────────────────────────────────── */}
          <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center gap-4">
            {/* Achievement Unlocked label — heavy tiers only */}
            {isHeavy && (
              <p
                className={`text-xs font-extrabold uppercase tracking-widest ${tierTextClass}`}
                style={{
                  animation: "unlock-text 0.5s ease 0.3s both",
                }}
              >
                Achievement Unlocked!
              </p>
            )}

            {/* Badge SVG */}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${tierTextClass}`}
              style={{
                background: "oklch(0.10 0.04 240 / 0.5)",
                border: `2px solid ${TIER_BORDER[tier]}`,
                animation:
                  "cred-badge-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
              }}
              aria-hidden="true"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG from controlled source
              dangerouslySetInnerHTML={{
                __html: badgeSvg.replace(
                  "<svg ",
                  '<svg width="56" height="56" ',
                ),
              }}
            />

            {/* Credential name */}
            <div className="space-y-1">
              <h2
                className={`text-2xl font-extrabold leading-tight ${tierTextClass}`}
                style={{ textShadow: "0 0 24px currentColor" }}
              >
                {displayName}
              </h2>
              {/* Tier pill */}
              <span
                className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${tierTextClass}`}
                style={{
                  background: "oklch(0.10 0.04 240 / 0.6)",
                  border: `1px solid ${TIER_BORDER[tier]}`,
                }}
              >
                {tierLabel} Tier
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/80 leading-relaxed max-w-[260px]">
              {description}
            </p>

            {/* Earned date */}
            <p className="text-xs text-muted-foreground">Earned {earnedDate}</p>

            {/* Share on X */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="credential_award.share_x_button"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: "var(--brand-teal)",
                color: "oklch(0.12 0.04 240)",
              }}
              aria-label={`Share ${displayName} credential on X`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.638L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
              Share on X
            </a>

            {/* Soul-bound note */}
            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1.5">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Soul-bound on Internet Computer · Permanent &amp; non-transferable
            </p>
          </div>

          {/* ── Progress bar ─────────────────────────────────────────────── */}
          <div
            className="h-1 w-full"
            style={{ background: "oklch(0.10 0.02 240 / 0.4)" }}
          >
            <div
              className="h-full transition-none"
              style={{
                width: `${progress}%`,
                background: TIER_BORDER[tier] ?? "var(--brand-teal)",
                transition: "width 60ms linear",
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </>
  );
}
