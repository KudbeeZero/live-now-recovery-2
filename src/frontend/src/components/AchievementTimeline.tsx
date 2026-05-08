import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  formatEarnedAt,
  getCredentialDisplayName,
  getTierBgColor,
  getTierColor,
  getTierLabel,
} from "../lib/credentials";
import type { Credential } from "../types/credentials";
import { CredentialModal } from "./CredentialModal";
import { getBadgeSvg } from "./badge-svgs";

interface AchievementTimelineProps {
  credentials: Credential[];
  isLoading?: boolean;
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {(["a", "b", "c"] as const).map((k) => (
        <div key={k} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            {k !== "c" && <div className="w-0.5 h-8 bg-border/40 mt-2" />}
          </div>
          <div className="flex-1 pb-6 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AchievementTimeline({
  credentials,
  isLoading = false,
}: AchievementTimelineProps) {
  const [selected, setSelected] = useState<Credential | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  if (isLoading) return <TimelineSkeleton />;

  if (credentials.length === 0) {
    return (
      <div
        data-ocid="achievement_timeline.empty_state"
        className="text-center py-10 rounded-xl border border-dashed border-border/50 bg-muted/20"
      >
        <div className="text-3xl mb-3">⏳</div>
        <p className="text-sm font-medium text-foreground">
          Your journey starts here
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Credentials you earn will appear on your timeline.
        </p>
      </div>
    );
  }

  return (
    <>
      <div data-ocid="achievement_timeline.list" className="relative">
        {credentials.map((cred, idx) => {
          const isLast = idx === credentials.length - 1;
          const svgStr = cred.badgeSvg ?? getBadgeSvg(cred.credentialType);
          const tierColor = getTierColor(cred.tier);
          const tierBg = getTierBgColor(cred.tier);
          const displayName = getCredentialDisplayName(cred.credentialType);
          const tierLabel = getTierLabel(cred.tier);
          const date = formatEarnedAt(cred.earnedAt);
          const isHovered = hovered === idx;

          return (
            <div
              key={Number(cred.id)}
              data-ocid={`achievement_timeline.item.${idx + 1}`}
              className="flex gap-4 group"
            >
              {/* Timeline spine */}
              <div className="flex flex-col items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSelected(cred)}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  className={`
                    h-11 w-11 rounded-full flex items-center justify-center
                    transition-all duration-300 cursor-pointer
                    ${tierColor} ${tierBg}
                    ${isHovered ? "scale-110 shadow-lg" : ""}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  `}
                  aria-label={`View ${displayName} credential`}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled SVG strings
                  dangerouslySetInnerHTML={{ __html: svgStr }}
                />
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[2rem] transition-colors duration-300 mt-2 ${
                      isHovered
                        ? `${getTierColor(cred.tier).replace("text-", "bg-")} opacity-60`
                        : "bg-border/40"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                <button
                  type="button"
                  onClick={() => setSelected(cred)}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  className={`
                    w-full text-left rounded-lg p-3 border transition-all duration-200
                    ${isHovered ? `${tierBg} shadow-sm` : "border-transparent bg-transparent"}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    cursor-pointer
                  `}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${tierColor}`}>
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
                      {tierLabel}
                    </span>
                    {/* Confetti animation on hover — CSS-only sparkle */}
                    {isHovered && (
                      <span
                        className="text-xs animate-pulse"
                        aria-hidden="true"
                      >
                        ✨
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{date}</p>
                  <p
                    className={`text-xs mt-1.5 ${isHovered ? "text-foreground/80" : "text-muted-foreground"} transition-colors`}
                  >
                    Impact score:{" "}
                    <span className={`font-bold ${tierColor}`}>
                      +{Number(cred.impactScore)}
                    </span>
                  </p>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CredentialModal
        credential={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
