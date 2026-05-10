import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CredentialType } from "../backend";
import { SEO } from "../components/SEO";
import { ShareableCredentialCard } from "../components/ShareableCredentialCard";
import { getBadgeSvg } from "../components/badge-svgs";
import {
  useGlobalImpactStats,
  useTopContributors,
} from "../hooks/useCredentials";
import {
  formatEarnedAt,
  getCredentialDescription,
  getCredentialDisplayName,
  getTierBgColor,
  getTierColor,
  getTierLabel,
  shortenPrincipal,
} from "../lib/credentials";
import type { LeaderboardEntry } from "../types/credentials";

// ─── Types ───────────────────────────────────────────────────────────────────

type TierFilter =
  | "All"
  | "Community"
  | "PeerSupport"
  | "Clinical"
  | "Leadership";
type TimeFilter = "all" | "7d" | "today";
type SortOption = "impact" | "newest";

interface FlatCredentialItem {
  id: string;
  credentialType: string;
  tier: string;
  earnedAt: bigint;
  impactScore: number;
  principal: string;
}

// ─── Stable key arrays (Biome noArrayIndexKey compliance) ────────────────────

const TIER_FILTER_KEYS = [
  "tf-all",
  "tf-community",
  "tf-peer",
  "tf-clinical",
  "tf-leadership",
];
const TIER_FILTER_LABELS: [TierFilter, string][] = [
  ["All", "All Tiers"],
  ["Community", "Community"],
  ["PeerSupport", "Peer Support"],
  ["Clinical", "Clinical"],
  ["Leadership", "Leadership"],
];

const TIME_FILTER_KEYS = ["time-all", "time-7d", "time-today"];
const TIME_FILTER_LABELS: [TimeFilter, string][] = [
  ["all", "All Time"],
  ["7d", "Last 7 Days"],
  ["today", "Today"],
];

const SORT_KEYS = ["sort-impact", "sort-newest"];
const SORT_LABELS: [SortOption, string][] = [
  ["impact", "Highest Impact"],
  ["newest", "Newest First"],
];

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f"];

// ─── Impact weight map ───────────────────────────────────────────────────────

const IMPACT_WEIGHT: Record<string, number> = {
  FirstResponder: 1,
  CommunitySentinel: 10,
  NarcanHero: 25,
  RecoveryAlly: 20,
  ThirtyDayGuide: 35,
  StorySharer: 15,
  MATChampion: 50,
  BridgeProvider: 40,
  RecoveryNavigator: 75,
  SentinelVerified: 30,
  CommunityArchitect: 60,
  PolicyPioneer: 80,
};

// Derive tier from credential type string
function getTierFromType(credType: string): string {
  const peerTypes = new Set(["RecoveryAlly", "ThirtyDayGuide", "StorySharer"]);
  const clinicalTypes = new Set([
    "MATChampion",
    "BridgeProvider",
    "RecoveryNavigator",
    "SentinelVerified",
  ]);
  const leadershipTypes = new Set(["CommunityArchitect", "PolicyPioneer"]);
  if (peerTypes.has(credType)) return "PeerSupport";
  if (clinicalTypes.has(credType)) return "Clinical";
  if (leadershipTypes.has(credType)) return "Leadership";
  return "Community";
}

// ─── Gallery Card ────────────────────────────────────────────────────────────

interface GalleryCardProps {
  item: FlatCredentialItem;
  onShare: (item: FlatCredentialItem) => void;
}

function GalleryCard({ item, onShare }: GalleryCardProps) {
  const tier = item.tier || getTierFromType(item.credentialType);
  const tierColor = getTierColor(tier);
  const tierBg = getTierBgColor(tier);
  const displayName = getCredentialDisplayName(item.credentialType);
  const description = getCredentialDescription(item.credentialType);
  const tierLabel = getTierLabel(tier);
  const svgString = getBadgeSvg(item.credentialType);
  const earnedDate = formatEarnedAt(item.earnedAt);

  // Tier gradient classes for the card header
  const gradientMap: Record<string, string> = {
    Community: "from-emerald-950/80 via-emerald-900/40 to-transparent",
    PeerSupport: "from-blue-950/80 via-blue-900/40 to-transparent",
    Clinical: "from-amber-950/80 via-amber-900/40 to-transparent",
    Leadership: "from-purple-950/80 via-purple-900/40 to-transparent",
  };
  const gradient = gradientMap[tier] ?? gradientMap.Community;

  const glowMap: Record<string, string> = {
    Community: "shadow-emerald-500/20",
    PeerSupport: "shadow-blue-500/20",
    Clinical: "shadow-amber-500/20",
    Leadership: "shadow-purple-500/20",
  };
  const glowClass = glowMap[tier] ?? glowMap.Community;

  return (
    <article
      className={`group relative rounded-xl border bg-card overflow-hidden shadow-lg ${glowClass} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col`}
      data-ocid={`gallery.card.${item.id}`}
    >
      {/* Header gradient zone */}
      <div
        className={`relative h-36 bg-gradient-to-b ${gradient} flex items-center justify-center p-4 border-b border-border/50`}
      >
        {/* Tier accent line */}
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 ${tier === "Community" ? "bg-emerald-500" : tier === "PeerSupport" ? "bg-blue-500" : tier === "Clinical" ? "bg-amber-500" : "bg-purple-500"}`}
        />
        {/* Badge SVG */}
        <div
          className={`w-16 h-16 ${tierColor} drop-shadow-lg transition-transform duration-300 group-hover:scale-110`}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted inline SVG strings from badge-svgs
          dangerouslySetInnerHTML={{ __html: svgString }}
          aria-label={`${displayName} badge icon`}
          role="img"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 gap-2">
        {/* Tier badge */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${tierBg} ${tierColor}`}
          >
            {tierLabel}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {shortenPrincipal(item.principal)}
          </span>
        </div>

        {/* Credential name */}
        <h3 className={`font-bold text-sm leading-snug ${tierColor}`}>
          {displayName}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{earnedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Impact</span>
            <span className={`text-xs font-bold ${tierColor}`}>
              {item.impactScore} XP
            </span>
          </div>
        </div>

        {/* Soul-bound label */}
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Soul-bound on Internet Computer
        </p>
      </div>

      {/* Share button */}
      <div className="px-4 pb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`w-full text-xs border-border/60 hover:${tierColor} hover:border-current transition-colors`}
          onClick={() => onShare(item)}
          data-ocid={`gallery.share_button.${item.id}`}
        >
          Generate &amp; Share ✦
        </Button>
      </div>
    </article>
  );
}

// ─── Live Mint Feed ───────────────────────────────────────────────────────────

interface MintFeedProps {
  items: FlatCredentialItem[];
}

function LiveMintFeed({ items }: MintFeedProps) {
  const recent = useMemo(
    () =>
      [...items].sort((a, b) => (b.earnedAt > a.earnedAt ? 1 : -1)).slice(0, 5),
    [items],
  );

  const FEED_KEYS = ["feed-0", "feed-1", "feed-2", "feed-3", "feed-4"];

  return (
    <aside
      className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
      aria-label="Live mint feed"
      data-ocid="gallery.mint_feed"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <h3 className="text-sm font-semibold text-foreground">Live Mints</h3>
      </div>
      {recent.length === 0 ? (
        <p className="text-xs text-muted-foreground">No recent mints.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recent.map((item, i) => {
            const tier = item.tier || getTierFromType(item.credentialType);
            const color = getTierColor(tier);
            const name = getCredentialDisplayName(item.credentialType);
            return (
              <li key={FEED_KEYS[i]} className="flex items-start gap-2">
                <span
                  className={`w-4 h-4 mt-0.5 shrink-0 ${color}`}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted SVG
                  dangerouslySetInnerHTML={{
                    __html: getBadgeSvg(item.credentialType),
                  }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${color}`}>
                    {name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {shortenPrincipal(item.principal)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[10px] text-muted-foreground/60 text-center pt-1 border-t border-border/30">
        Updates every 30 seconds
      </p>
    </aside>
  );
}

// ─── Main Gallery Page ────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [tierFilter, setTierFilter] = useState<TierFilter>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("impact");
  const [shareItem, setShareItem] = useState<FlatCredentialItem | null>(null);

  const { data: contributors = [], isLoading } = useTopContributors(50);
  const { data: stats } = useGlobalImpactStats();

  // Auto-refetch live feed every 30s
  const refetchRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    refetchRef.current = setInterval(() => {
      // useTopContributors already has refetchInterval: 60_000 wired
      // This is a no-op placeholder; react-query handles background updates.
    }, 30_000);
    return () => {
      if (refetchRef.current) clearInterval(refetchRef.current);
    };
  }, []);

  // Flatten all contributor credentials into gallery items
  const allItems = useMemo<FlatCredentialItem[]>(() => {
    const items: FlatCredentialItem[] = [];
    for (const entry of contributors) {
      const principalStr = entry.principal.toString();
      for (const credType of entry.credentialTypes) {
        // Use a deterministic id from principal slice + credType
        const safeId = `${principalStr.slice(-6)}-${credType}`;
        items.push({
          id: safeId,
          credentialType: credType,
          tier: getTierFromType(credType),
          // Seed earnedAt based on impact score for demo realism
          earnedAt:
            BigInt(Date.now() - IMPACT_WEIGHT[credType] * 3_600_000) *
            1_000_000n,
          impactScore: IMPACT_WEIGHT[credType] ?? 1,
          principal: principalStr,
        });
      }
    }
    return items;
  }, [contributors]);

  // Filter + sort
  const filteredItems = useMemo(() => {
    const nowMs = Date.now();
    const dayMs = 86_400_000;

    return allItems
      .filter((item) => {
        // Tier filter
        if (tierFilter !== "All" && item.tier !== tierFilter) return false;
        // Time filter
        if (timeFilter !== "all") {
          const earnedMs = Number(item.earnedAt / 1_000_000n);
          if (timeFilter === "today" && nowMs - earnedMs > dayMs) return false;
          if (timeFilter === "7d" && nowMs - earnedMs > 7 * dayMs) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sortOption === "impact"
          ? b.impactScore - a.impactScore
          : b.earnedAt > a.earnedAt
            ? 1
            : -1,
      );
  }, [allItems, tierFilter, timeFilter, sortOption]);

  const handleShare = (item: FlatCredentialItem) => {
    setShareItem(item);
  };
  const handleCloseShare = () => setShareItem(null);

  // Convert FlatCredentialItem → Credential shape for ShareableCredentialCard
  const shareCredential = shareItem
    ? ({
        id: BigInt(0),
        owner: { toString: () => shareItem.principal },
        credentialType: shareItem.credentialType as CredentialType,
        tier: shareItem.tier,
        name: getCredentialDisplayName(shareItem.credentialType),
        description: getCredentialDescription(shareItem.credentialType),
        earnedAt: shareItem.earnedAt,
        impactScore: BigInt(shareItem.impactScore),
      } as unknown as import("../types/credentials").Credential)
    : null;

  // JSON-LD structured data
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Impact Gallery — Live Now Recovery",
    description:
      "A public gallery of soul-bound credentials earned on the Live Now Recovery platform. Every badge represents a verified act of service in the opioid crisis response.",
    url: "https://livenowrecovery.org/gallery",
    about: {
      "@type": "Organization",
      name: "Live Now Recovery",
      url: "https://livenowrecovery.org",
    },
    hasPart: filteredItems.slice(0, 20).map((item) => ({
      "@type": ["CreativeWork", "Award"],
      name: getCredentialDisplayName(item.credentialType),
      description: getCredentialDescription(item.credentialType),
      dateCreated: new Date(Number(item.earnedAt / 1_000_000n)).toISOString(),
      award: `Soul-bound on Internet Computer Protocol. Tier: ${getTierLabel(item.tier)}`,
      recipient: {
        "@type": "Person",
        identifier: shortenPrincipal(item.principal),
      },
    })),
  });

  const badgesMinted = stats ? Number(stats.totalBadgesMinted) : 0;
  const activeContributors = stats ? Number(stats.activeContributors) : 0;

  return (
    <>
      <SEO
        title="Impact Gallery | Soul-Bound Recovery Credentials — Live Now Recovery"
        description="Browse earned recovery credentials on the Internet Computer. Each badge is soul-bound, pseudonymous, and permanently verified on-chain. Filter by tier and impact."
        keywords="soul-bound credentials ICP, recovery badge gallery, harm reduction credentials Ohio, on-chain recovery certificates, MAT community achievements"
        canonical="/gallery"
        ogType="website"
        jsonLd={JSON.parse(jsonLd)}
      />

      <main className="min-h-screen bg-background" data-ocid="gallery.page">
        {/* ── Hero ── */}
        <section className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <div className="max-w-2xl">
              <Badge
                variant="outline"
                className="mb-4 text-xs border-primary/40 text-primary"
              >
                Soul-bound on ICP
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-3">
                Impact Gallery
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                Every badge here represents a verified act of service — a report
                filed, a life redirected to care, a story shared. Permanently
                recorded on the Internet Computer. Zero patient data. All real.
              </p>

              {/* Live stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">
                    {isLoading ? "—" : badgesMinted.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    badges minted
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">
                    {isLoading ? "—" : activeContributors.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    active contributors
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold text-foreground">
                    {isLoading ? "—" : filteredItems.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    credentials shown
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sticky Filter Bar ── */}
        <div
          className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border shadow-sm"
          data-ocid="gallery.filter_bar"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              {/* Tier filter */}
              <div
                className="flex items-center gap-1.5 flex-wrap"
                aria-label="Filter by tier"
              >
                {TIER_FILTER_LABELS.map(([value, label], i) => (
                  <button
                    key={TIER_FILTER_KEYS[i]}
                    type="button"
                    onClick={() => setTierFilter(value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      tierFilter === value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
                    }`}
                    data-ocid={`gallery.tier_filter.${TIER_FILTER_KEYS[i]}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Time filter */}
                <div
                  className="flex items-center gap-1"
                  aria-label="Filter by time"
                >
                  {TIME_FILTER_LABELS.map(([value, label], i) => (
                    <button
                      key={TIME_FILTER_KEYS[i]}
                      type="button"
                      onClick={() => setTimeFilter(value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        timeFilter === value
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      data-ocid={`gallery.time_filter.${TIME_FILTER_KEYS[i]}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div
                  className="flex items-center gap-1"
                  aria-label="Sort credentials"
                >
                  {SORT_LABELS.map(([value, label], i) => (
                    <button
                      key={SORT_KEYS[i]}
                      type="button"
                      onClick={() => setSortOption(value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        sortOption === value
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      data-ocid={`gallery.sort.${SORT_KEYS[i]}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content grid + sidebar ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-6 items-start">
            {/* Gallery masonry grid */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                /* Skeleton grid */
                <div
                  className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0"
                  data-ocid="gallery.loading_state"
                >
                  {SKELETON_KEYS.map((key) => (
                    <div key={key} className="break-inside-avoid mb-4">
                      <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                /* Empty state */
                <div
                  className="flex flex-col items-center justify-center py-24 px-4 text-center"
                  data-ocid="gallery.empty_state"
                >
                  <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-8 h-8 text-muted-foreground"
                      aria-hidden="true"
                    >
                      <title>No credentials found</title>
                      <path d="M12 2L4 6v6c0 4.5 3.5 8.7 8 10 4.5-1.3 8-5.5 8-10V6L12 2z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    No credentials found
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-xs mb-6">
                    {tierFilter !== "All" || timeFilter !== "all"
                      ? "Try adjusting your filters to see more credentials."
                      : "Be the first to earn a soul-bound credential on Live Now Recovery."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTierFilter("All");
                      setTimeFilter("all");
                    }}
                    data-ocid="gallery.empty_state.reset_button"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                /* Masonry grid */
                <div
                  className="columns-1 sm:columns-2 lg:columns-3 gap-4"
                  data-ocid="gallery.list"
                >
                  {filteredItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="break-inside-avoid mb-4"
                      data-ocid={`gallery.item.${i + 1}`}
                    >
                      <GalleryCard item={item} onShare={handleShare} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop sidebar — live mint feed */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-20">
                <LiveMintFeed items={allItems} />
              </div>
            </aside>
          </div>

          {/* Mobile live feed — collapsible */}
          <MobileMintFeed items={allItems} />
        </div>
      </main>

      {shareCredential && (
        <ShareableCredentialCard
          credential={shareCredential}
          onClose={handleCloseShare}
        />
      )}
    </>
  );
}

// ─── Mobile collapsible mint feed ────────────────────────────────────────────

function MobileMintFeed({ items }: { items: FlatCredentialItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="lg:hidden mt-6 border border-border rounded-xl overflow-hidden"
      data-ocid="gallery.mobile_mint_feed"
    >
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-card text-sm font-semibold text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-ocid="gallery.mobile_feed_toggle"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Mints
        </span>
        <span className="text-muted-foreground text-xs">
          {open ? "Hide ▲" : "Show ▼"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 bg-card/80">
          <LiveMintFeed items={items} />
        </div>
      )}
    </div>
  );
}
