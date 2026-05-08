import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
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
import { ShareableCredentialCard } from "./ShareableCredentialCard";
import { getBadgeSvg } from "./badge-svgs";

interface BadgeGridProps {
  credentials: Credential[];
  isLoading?: boolean;
  emptyText?: string;
}

function BadgeSkeleton() {
  return (
    <div className="rounded-xl p-4 border border-border/50 bg-card flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function BadgeGrid({
  credentials,
  isLoading = false,
  emptyText,
}: BadgeGridProps) {
  const [selected, setSelected] = useState<Credential | null>(null);
  const [shareCredential, setShareCredential] = useState<Credential | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(["a", "b", "c"] as const).map((k) => (
          <BadgeSkeleton key={k} />
        ))}
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div
        data-ocid="badge_grid.empty_state"
        className="text-center py-12 px-6 rounded-xl border border-dashed border-border/50 bg-muted/20"
      >
        <div className="text-4xl mb-3">🏅</div>
        <p className="text-sm font-medium text-foreground">
          No credentials yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {emptyText ??
            "Credentials are earned by contributing to the platform."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        data-ocid="badge_grid.list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {credentials.map((cred, idx) => {
          const svgStr = cred.badgeSvg ?? getBadgeSvg(cred.credentialType);
          const tierColor = getTierColor(cred.tier);
          const tierBg = getTierBgColor(cred.tier);
          const tierLabel = getTierLabel(cred.tier);
          const displayName = getCredentialDisplayName(cred.credentialType);
          const date = formatEarnedAt(cred.earnedAt);

          return (
            <div
              key={Number(cred.id)}
              data-ocid={`badge_grid.item.${idx + 1}`}
              className={`
                group relative rounded-xl border text-left
                transition-all duration-200 hover:scale-[1.02] hover:shadow-md
                bg-card flex flex-col
                ${tierBg}
              `}
            >
              {/* Clickable badge info area */}
              <button
                type="button"
                onClick={() => setSelected(cred)}
                className="flex-1 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-t-xl"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center ${tierColor} ${tierBg}`}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled SVG strings
                    dangerouslySetInnerHTML={{ __html: svgStr }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${tierColor}`}
                    >
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tierLabel} · {date}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Impact score
                  </span>
                  <span className={`text-xs font-bold ${tierColor}`}>
                    +{Number(cred.impactScore)}
                  </span>
                </div>
              </button>

              {/* Generate & Share Visual Card button */}
              <button
                type="button"
                data-ocid={`badge_grid.share_card_button.${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShareCredential(cred);
                }}
                className={`
                  w-full flex items-center justify-center gap-1.5
                  border-t py-2.5 rounded-b-xl text-xs font-semibold
                  transition-colors duration-150
                  ${tierColor} border-t-[var(--border)] hover:bg-white/5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                `}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate &amp; Share Visual Card
              </button>
            </div>
          );
        })}
      </div>

      <CredentialModal
        credential={selected}
        onClose={() => setSelected(null)}
      />

      <ShareableCredentialCard
        credential={shareCredential}
        onClose={() => setShareCredential(null)}
      />
    </>
  );
}
