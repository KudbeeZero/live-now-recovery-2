import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Award, BarChart3, Medal, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ImpactDashboard } from "../components/ImpactDashboard";
import { SEO } from "../components/SEO";
import { useTopContributors } from "../hooks/useCredentials";
import { CREDENTIAL_META } from "../types/credentials";

const TIER_FILTER_OPTIONS = [
  { key: "all", label: "All Tiers" },
  { key: "Community", label: "Community" },
  { key: "PeerSupport", label: "Peer Support" },
  { key: "Clinical", label: "Clinical" },
  { key: "Leadership", label: "Leadership" },
] as const;

type TierFilter = (typeof TIER_FILTER_OPTIONS)[number]["key"];

const TIER_COLOR_MAP: Record<string, string> = {
  Community: "text-emerald-400",
  PeerSupport: "text-blue-400",
  Clinical: "text-amber-400",
  Leadership: "text-purple-400",
};

const TIER_BG_MAP: Record<string, string> = {
  Community: "bg-emerald-500/10 border-emerald-500/30",
  PeerSupport: "bg-blue-500/10 border-blue-500/30",
  Clinical: "bg-amber-500/10 border-amber-500/30",
  Leadership: "bg-purple-500/10 border-purple-500/30",
};

const CRED_TIER_MAP: Record<string, string> = {
  FirstResponder: "Community",
  CommunitySentinel: "Community",
  NarcanHero: "Community",
  RecoveryAlly: "PeerSupport",
  ThirtyDayGuide: "PeerSupport",
  StorySharer: "PeerSupport",
  MATChampion: "Clinical",
  BridgeProvider: "Clinical",
  RecoveryNavigator: "Clinical",
  SentinelVerified: "Clinical",
  CommunityArchitect: "Leadership",
  PolicyPioneer: "Leadership",
};

export function LeaderboardPage() {
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const { data: contributors = [], isLoading } = useTopContributors(50);

  const filtered =
    tierFilter === "all"
      ? contributors
      : contributors.filter((entry) =>
          entry.credentialTypes.some((ct) => CRED_TIER_MAP[ct] === tierFilter),
        );

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-sm font-bold text-muted-foreground w-5 text-center">
        #{rank}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-background" data-ocid="leaderboard.page">
      <SEO
        title="Recovery Impact Leaderboard | Top Contributors — Live Now Recovery"
        description="The top 50 contributors to Ohio's recovery network — ranked by impact score, earned through real community action. Credentials are soul-bound on the Internet Computer."
        keywords="recovery leaderboard, MAT community leaders, harm reduction contributors, ICP soul-bound credentials, Ohio recovery community"
        canonical="/leaderboard"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Live Now Recovery Community Leaderboard",
          description:
            "Top 50 community contributors ranked by on-chain impact score — earned through real recovery coordination actions in Ohio.",
          numberOfItems: 50,
          url: "https://live-now-recovery-3f2.caffeine.xyz/leaderboard",
        }}
      />

      {/* Hero */}
      <section
        className="w-full px-4 pt-14 pb-10 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.038 225), oklch(0.28 0.038 225), oklch(0.36 0.065 196))",
        }}
        data-ocid="leaderboard.section"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-teal-light mb-4">
            <BarChart3 className="h-3 w-3" />
            Live on ICP Blockchain
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-3">
            Community <span className="text-brand-teal">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            Every credential is permanently minted on-chain. Pseudonymous,
            transparent, and earned through real action — not bought or
            transferred.
          </p>
        </motion.div>
      </section>

      {/* X Spaces promo banner */}
      <div
        className="w-full px-4 py-3 text-center text-sm font-semibold"
        style={{
          background: "oklch(0.20 0.040 225)",
          borderBottom: "1px solid oklch(0.28 0.05 220 / 0.5)",
          color: "oklch(0.72 0.20 142)",
        }}
        data-ocid="leaderboard.promo_banner"
      >
        🎙 Featured on X Spaces — watch the leaderboard update live during our
        weekly community call.
      </div>

      {/* Impact stats */}
      <ImpactDashboard />

      {/* Tier filter + table */}
      <section className="w-full px-4 pb-16" data-ocid="leaderboard.section">
        <div className="max-w-4xl mx-auto">
          {/* Filters */}
          <fieldset
            className="flex flex-wrap gap-2 mb-6 border-0 p-0 m-0"
            aria-label="Filter by tier"
          >
            <legend className="sr-only">Filter by tier</legend>
            {TIER_FILTER_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTierFilter(key)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-150"
                style={{
                  background:
                    tierFilter === key
                      ? "oklch(0.72 0.20 142 / 0.18)"
                      : "oklch(0.18 0.03 225)",
                  border: `1px solid ${
                    tierFilter === key
                      ? "oklch(0.72 0.20 142 / 0.45)"
                      : "oklch(0.28 0.04 225)"
                  }`,
                  color:
                    tierFilter === key
                      ? "oklch(0.82 0.18 142)"
                      : "oklch(0.55 0.03 220)",
                }}
                data-ocid="leaderboard.tab"
              >
                {label}
              </button>
            ))}
          </fieldset>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3" data-ocid="leaderboard.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-48 rounded-2xl bg-card border border-border"
              data-ocid="leaderboard.empty_state"
            >
              <Award className="w-10 h-10 mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground font-semibold">
                No contributors yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Submit a report or complete a handoff to earn your first badge.
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="leaderboard.list">
              {filtered.map((entry, idx) => {
                const topCred = entry.credentialTypes[0] ?? "FirstResponder";
                const tier = CRED_TIER_MAP[topCred] ?? "Community";
                const meta =
                  CREDENTIAL_META[topCred as keyof typeof CREDENTIAL_META] ??
                  null;
                void meta;
                return (
                  <motion.div
                    key={entry.principal.toString()}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(idx * 0.05, 0.4),
                    }}
                    data-ocid={`leaderboard.item.${idx + 1}`}
                  >
                    <div className="flex items-center justify-center w-8 shrink-0">
                      {rankIcon(entry.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {entry.principal.toString().slice(0, 24)}…
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.credentialTypes.slice(0, 4).map((ct) => {
                          const cm =
                            CREDENTIAL_META[ct as keyof typeof CREDENTIAL_META];
                          const t = CRED_TIER_MAP[ct] ?? "Community";
                          return (
                            <Badge
                              key={ct}
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                TIER_BG_MAP[t] ?? ""
                              } ${TIER_COLOR_MAP[t] ?? ""}`}
                            >
                              {cm?.displayName ?? ct}
                            </Badge>
                          );
                        })}
                        {entry.credentialTypes.length > 4 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-muted-foreground"
                          >
                            +{entry.credentialTypes.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-xl font-black tabular-nums ${
                          TIER_COLOR_MAP[tier] ?? "text-primary"
                        }`}
                      >
                        {Number(entry.impactScore).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        impact pts
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* "$5 + 1 report" callout */}
          <motion.div
            className="mt-10 rounded-2xl p-7 text-center"
            style={{
              background: "oklch(0.72 0.20 142 / 0.08)",
              border: "1px solid oklch(0.72 0.20 142 / 0.25)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            data-ocid="leaderboard.cta_card"
          >
            <Users className="w-8 h-8 mx-auto mb-3 text-brand-teal" />
            <p className="text-lg font-bold text-foreground mb-1">
              See what $5 + 1 report can do.
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
              A $5 donation unlocks a digital Community Supporter badge. Submit
              one community report and earn First Responder status — permanently
              on-chain, shared with the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                data-ocid="leaderboard.donate_button"
              >
                Donate $5 →
              </Link>
              <Link
                to="/hub"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                data-ocid="leaderboard.citizens_button"
              >
                Submit a Report →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
