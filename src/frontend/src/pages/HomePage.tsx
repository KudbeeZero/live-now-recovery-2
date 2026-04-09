import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BedDouble,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Heart,
  Info,
  MapPin,
  Pill,
  Radio,
  Search,
  Server,
  Shield,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProviderStatus } from "../backend";
import { EnhancedRecoveryMap } from "../components/EnhancedRecoveryMap";
import { HandoffImpact } from "../components/HandoffImpact";
import { PriceComparisonCard } from "../components/PriceComparisonCard";
import {
  useAllProviders,
  useCanisterState,
  useIsAdmin,
  useToggleLive,
  useTotalHandoffs,
} from "../hooks/useQueries";
import { isProviderStale, statusLabel } from "../utils/providerUtils";

type FilterType = "all" | "mat" | "narcan" | "er" | "kiosk" | "telehealth";

const filterLabels: { key: FilterType; label: string; color: string }[] = [
  { key: "all", label: "All Providers", color: "#6ee7d0" },
  { key: "mat", label: "MAT", color: "#00ff88" },
  { key: "narcan", label: "Narcan", color: "#fbbf24" },
  { key: "er", label: "ER", color: "#f87171" },
  { key: "kiosk", label: "Kiosk", color: "#c084fc" },
  { key: "telehealth", label: "Telehealth", color: "#818cf8" },
];

type EmergencyStatus = "open_bed" | "72hr_bridge" | null;

function getEmergencyStatus(id: string): EmergencyStatus {
  try {
    const raw = localStorage.getItem(`emergency_status_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      status: EmergencyStatus;
      setAt: number;
    };
    // Expire after 72 hours
    if (Date.now() - parsed.setAt > 72 * 60 * 60 * 1000) {
      localStorage.removeItem(`emergency_status_${id}`);
      return null;
    }
    return parsed.status;
  } catch {
    return null;
  }
}

// Local self-reported live state
function getSelfReported(id: string): { live: boolean; setAt: number } | null {
  try {
    const raw = localStorage.getItem(`self_live_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { live: boolean; setAt: number };
    // Expire after 4 hours
    if (Date.now() - parsed.setAt > 4 * 60 * 60 * 1000) {
      localStorage.removeItem(`self_live_${id}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setSelfReported(id: string, live: boolean) {
  localStorage.setItem(
    `self_live_${id}`,
    JSON.stringify({ live, setAt: Date.now() }),
  );
}

function clearSelfReported(id: string) {
  localStorage.removeItem(`self_live_${id}`);
}

function formatMinutesAgo(setAt: number): string {
  const minutes = Math.floor((Date.now() - setAt) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function HomePage() {
  const { data: providers = [], isLoading } = useAllProviders();
  const { data: canisterState } = useCanisterState();
  const { data: isAdmin } = useIsAdmin();
  const { data: totalHandoffs, isLoading: handoffsLoading } =
    useTotalHandoffs();
  const toggleLive = useToggleLive();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [show3dBuildings, setShow3dBuildings] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  // Volunteer count animation (0 → 47)
  const [volunteerCount, setVolunteerCount] = useState(0);
  useEffect(() => {
    const target = 47;
    const duration = 1500;
    const startTime = performance.now();
    let rafId: number;
    let timerId: ReturnType<typeof setTimeout>;
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out: quadratic
      const eased = 1 - (1 - progress) ** 2;
      setVolunteerCount(Math.round(eased * target));
      if (progress < 1) {
        timerId = setTimeout(() => {
          rafId = requestAnimationFrame(tick);
        }, 16);
      }
    }
    rafId = requestAnimationFrame(tick);
    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Provider card expanded tabs
  type CardTab = "meds" | "services" | "cost" | "insurance";
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [cardTab, setCardTab] = useState<Record<string, CardTab>>({});

  // Provider self-service toggle state
  const [selfLiveState, setSelfLiveState] = useState<{
    live: boolean;
    setAt: number;
  } | null>(null);
  const [selfToggleModal, setSelfToggleModal] = useState(false);
  const [selfProviderId, setSelfProviderId] = useState<string | null>(null);

  // Emergency status badges (read from localStorage, refreshed)
  const [emergencyStatuses, setEmergencyStatuses] = useState<
    Record<string, EmergencyStatus>
  >({});

  // Load emergency statuses from localStorage when providers load
  useEffect(() => {
    if (providers.length === 0) return;
    const map: Record<string, EmergencyStatus> = {};
    for (const p of providers) {
      map[p.id] = getEmergencyStatus(p.id);
    }
    setEmergencyStatuses(map);
  }, [providers]);

  // Find this user's provider (by identity principal — best effort: first provider if logged in non-admin)
  const myProvider = isLoggedIn && !isAdmin ? (providers[0] ?? null) : null;

  // Load self-reported state for my provider
  useEffect(() => {
    if (!myProvider) return;
    const saved = getSelfReported(myProvider.id);
    setSelfLiveState(saved);
    setSelfProviderId(myProvider.id);
  }, [myProvider]);

  const liveProviders = providers.filter(
    (p) => p.status === ProviderStatus.Live && !isProviderStale(p.lastVerified),
  );

  const liveCount = liveProviders.length;

  const filteredBySearch = providers.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const pType = (
      (p as unknown as { providerType?: string }).providerType ?? ""
    ).toLowerCase();
    // Search across name, providerType, and any address/city fields
    return p.name.toLowerCase().includes(q) || pType.includes(q);
  });

  const filteredByType = providers.filter((p) => {
    if (activeFilter === "all") return true;
    const name = p.name.toLowerCase();
    const pType = (
      (p as unknown as { providerType?: string }).providerType ?? ""
    ).toLowerCase();
    if (activeFilter === "mat")
      return (
        pType === "mat" ||
        pType === "mat clinic" ||
        name.includes("mat") ||
        name.includes("brightside") ||
        name.includes("buprenorphine")
      );
    if (activeFilter === "narcan")
      return (
        pType === "narcan" ||
        pType === "narcan distribution" ||
        name.includes("narcan") ||
        name.includes("naloxone") ||
        name.includes("pharmacy")
      );
    if (activeFilter === "er")
      return (
        pType === "er" ||
        pType === "emergency room" ||
        name.includes("er") ||
        name.includes("emergency") ||
        name.includes("hospital")
      );
    if (activeFilter === "kiosk")
      return pType === "naloxone kiosk" || name.includes("kiosk");
    if (activeFilter === "telehealth")
      return pType === "telehealth mat" || name.includes("telehealth");
    return true;
  });

  const filtered = filteredBySearch.filter((p) =>
    filteredByType.some((fp) => fp.id === p.id),
  );

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleLive.mutateAsync({ id, status: !current });
      toast.success(`Status updated to ${!current ? "Live" : "Offline"}`);
    } catch {
      toast.error("Failed to update status. Login required.");
    }
  };

  // Self-service toggle: open confirmation modal
  const handleSelfToggleRequest = () => {
    setSelfToggleModal(true);
  };

  // Self-service toggle: confirm
  const handleSelfToggleConfirm = () => {
    if (!selfProviderId) return;
    const newLive = !selfLiveState?.live;
    if (newLive) {
      const state = { live: true, setAt: Date.now() };
      setSelfReported(selfProviderId, true);
      setSelfLiveState(state);
      toast.success(
        "You are now self-reporting as Live. Status expires in 4 hours.",
      );
    } else {
      clearSelfReported(selfProviderId);
      setSelfLiveState(null);
      toast.success("Self-reported status cleared.");
    }
    setSelfToggleModal(false);
  };

  function providerStatusInfo(p: (typeof providers)[0]) {
    if (p.status === ProviderStatus.Live && !isProviderStale(p.lastVerified)) {
      return {
        label: "LIVE NOW",
        dotClass: "bg-live-green animate-pulse",
        textClass: "text-live-green",
      };
    }
    if (p.status === ProviderStatus.Offline) {
      return {
        label: "OFFLINE",
        dotClass: "bg-muted-foreground",
        textClass: "text-muted-foreground",
      };
    }
    return {
      label: "Status Unverified",
      dotClass: "bg-amber-recovery",
      textClass: "text-amber-recovery",
    };
  }

  return (
    <main className="min-h-screen bg-background" data-ocid="home.page">
      {/* ── Hero Section ── */}
      <section
        className="w-full px-4 py-14 md:py-20 min-h-[360px] flex items-center relative"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.038 225), oklch(0.28 0.038 225), oklch(0.36 0.065 196))",
        }}
        data-ocid="home.section"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, oklch(0.44 0.078 196 / 0.10) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 relative">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-primary/20 border border-primary/30 text-teal-light">
            <Radio className="w-3.5 h-3.5" />
            {liveCount} providers verified now
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
            Find MAT Care{" "}
            <span className="text-teal-light">Near You, Right Now</span>
          </h1>

          <p className="text-lg max-w-2xl text-foreground/80">
            Privacy-first provider availability — anonymous, real-time, and zero
            PHI stored. Find who is accepting patients right now in Ohio Region
            13.
          </p>

          <div className="w-full max-w-xl flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, city, or type…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-10 pr-4 rounded-xl shadow-lg bg-background text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                data-ocid="home.search_input"
              />
            </div>
            <Button
              className="h-14 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 shrink-0"
              data-ocid="home.primary_button"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="h-14 px-4 rounded-xl border-white/40 text-white bg-transparent hover:bg-white/10 shrink-0 hidden sm:flex items-center gap-1.5"
              data-ocid="home.secondary_button"
            >
              <MapPin className="w-4 h-4" />
              Near Me
            </Button>
          </div>

          <div className="inline-flex items-center gap-2.5 rounded-2xl px-4 py-2 bg-live-green/10 border border-live-green/30">
            <div className="w-2.5 h-2.5 rounded-full bg-live-green animate-pulse" />
            <span className="text-sm font-bold text-live-green">
              {liveCount} Live
            </span>
            <span className="text-sm text-foreground/60">
              providers verified now
            </span>
          </div>
        </div>
      </section>

      {/* ── High-Risk Alert ── */}
      {isLoggedIn && canisterState?.high_risk_window_active && (
        <div className="w-full px-4 pt-4">
          <div className="max-w-7xl mx-auto">
            <div
              className="p-4 rounded-xl flex items-start gap-3"
              style={{
                background: "oklch(0.14 0.06 60 / 0.3)",
                border: "1px solid oklch(0.75 0.15 60 / 0.4)",
              }}
              data-ocid="home.error_state"
            >
              <AlertTriangle
                className="w-5 h-5 shrink-0 mt-0.5"
                style={{ color: "oklch(0.82 0.15 60)" }}
              />
              <div>
                <p
                  className="font-bold"
                  style={{ color: "oklch(0.88 0.12 60)" }}
                >
                  High-Risk Window Active
                </p>
                <p className="text-sm" style={{ color: "oklch(0.75 0.08 60)" }}>
                  {
                    canisterState.active_providers.filter(([, , hr]) => hr)
                      .length
                  }{" "}
                  provider(s) flagged. Escalate if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Community Momentum Stat Bar ── */}
      <section
        className="w-full px-4 py-5"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.18 0.038 225) 0%, oklch(0.20 0.038 225) 100%)",
          borderBottom: "1px solid oklch(0.26 0.038 225 / 0.6)",
        }}
        data-ocid="home.section"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            <div
              className="flex flex-col items-center justify-center px-2 py-3 sm:py-4 rounded-xl"
              style={{
                background: "oklch(0.23 0.045 225 / 0.8)",
                border: "1px solid oklch(0.32 0.055 196 / 0.4)",
              }}
              data-ocid="home.stat_card"
            >
              <Users
                className="w-4 h-4 mb-1 opacity-60"
                style={{ color: "oklch(0.82 0.18 145)" }}
              />
              <span
                className="text-xl sm:text-3xl font-bold tabular-nums leading-none"
                style={{
                  color: "oklch(0.82 0.18 145)",
                  textShadow: "0 0 18px oklch(0.82 0.18 145 / 0.45)",
                }}
              >
                {volunteerCount}
              </span>
              <span
                className="text-[10px] sm:text-xs font-medium mt-1 text-center leading-tight"
                style={{ color: "oklch(0.58 0.04 220)" }}
              >
                Community Volunteers
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center px-2 py-3 sm:py-4 rounded-xl"
              style={{
                background: "oklch(0.23 0.045 225 / 0.8)",
                border: "1px solid oklch(0.32 0.055 196 / 0.4)",
              }}
              data-ocid="home.stat_card"
            >
              <Zap
                className="w-4 h-4 mb-1 opacity-60"
                style={{ color: "oklch(0.82 0.18 145)" }}
              />
              {handoffsLoading ? (
                <div
                  className="h-7 w-12 sm:h-9 sm:w-16 rounded animate-pulse"
                  style={{ background: "oklch(0.30 0.04 220 / 0.6)" }}
                />
              ) : (
                <span
                  className="text-xl sm:text-3xl font-bold tabular-nums leading-none"
                  style={{
                    color: "oklch(0.82 0.18 145)",
                    textShadow: "0 0 18px oklch(0.82 0.18 145 / 0.45)",
                  }}
                >
                  {totalHandoffs !== undefined
                    ? Number(totalHandoffs).toLocaleString()
                    : "0"}
                </span>
              )}
              <span
                className="text-[10px] sm:text-xs font-medium mt-1 text-center leading-tight"
                style={{ color: "oklch(0.58 0.04 220)" }}
              >
                Recovery Handoffs
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center px-2 py-3 sm:py-4 rounded-xl"
              style={{
                background: "oklch(0.23 0.045 225 / 0.8)",
                border: "1px solid oklch(0.36 0.12 145 / 0.45)",
                boxShadow: "0 0 14px oklch(0.82 0.18 145 / 0.08)",
              }}
              data-ocid="home.stat_card"
            >
              <Activity
                className="w-4 h-4 mb-1 opacity-60"
                style={{ color: "oklch(0.82 0.18 145)" }}
              />
              {isLoading ? (
                <div
                  className="h-7 w-10 sm:h-9 sm:w-12 rounded animate-pulse"
                  style={{ background: "oklch(0.30 0.04 220 / 0.6)" }}
                />
              ) : (
                <span
                  className="text-xl sm:text-3xl font-bold tabular-nums leading-none"
                  style={{
                    color: "oklch(0.82 0.18 145)",
                    textShadow: "0 0 18px oklch(0.82 0.18 145 / 0.55)",
                  }}
                >
                  {liveCount}
                </span>
              )}
              <span
                className="text-[10px] sm:text-xs font-medium mt-1 text-center leading-tight"
                style={{ color: "oklch(0.58 0.04 220)" }}
              >
                Active Providers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Peer Support Video CTA Banner ── */}
      <section
        className="w-full px-4 py-5"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.17 0.032 225) 0%, oklch(0.20 0.040 196) 100%)",
          borderBottom: "1px solid oklch(0.26 0.045 196 / 0.5)",
        }}
        data-ocid="home.section"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "oklch(0.72 0.20 142 / 0.15)",
                border: "1px solid oklch(0.72 0.20 142 / 0.35)",
              }}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="oklch(0.72 0.20 142)"
                  strokeWidth="1.5"
                />
                <polygon
                  points="10,8 16,12 10,16"
                  fill="oklch(0.72 0.20 142)"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p
                className="font-bold text-sm leading-snug"
                style={{ color: "oklch(0.92 0.02 200)" }}
              >
                Real Stories of Recovery
              </p>
              <p
                className="text-xs leading-snug mt-0.5 line-clamp-1"
                style={{ color: "oklch(0.58 0.04 220)" }}
              >
                Hear from people in recovery, MAT providers, and community
                advocates — real stories that make the path forward visible.
              </p>
            </div>
          </div>
          <Link
            to="/videos"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              background: "oklch(0.72 0.20 142 / 0.18)",
              border: "1px solid oklch(0.72 0.20 142 / 0.45)",
              color: "oklch(0.82 0.18 142)",
            }}
            data-ocid="home.videos_cta"
          >
            Watch Videos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Results Section: Map + Provider List ── */}
      <section
        className="w-full bg-teal-mid py-8 px-4"
        data-ocid="home.section"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Map — 60% */}
            <div className="lg:col-span-3">
              <div className="flex flex-col rounded-xl overflow-hidden shadow-card">
                <div className="h-[340px] lg:h-[520px]">
                  <EnhancedRecoveryMap
                    height="100%"
                    onToggleLive={isLoggedIn ? handleToggle : undefined}
                    activeFilter={activeFilter}
                    setActiveFilter={(f) => setActiveFilter(f as FilterType)}
                    show3dBuildings={show3dBuildings}
                    showHeatmap={showHeatmap}
                    showWeather={showWeather}
                  />
                </div>

                {/* Docked filter bar */}
                <div
                  className="flex items-center gap-1.5 px-3 py-2 flex-wrap"
                  style={{
                    background: "#0d1f2d",
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {filterLabels.map(({ key, label, color }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveFilter(key)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 hover:scale-[1.03]"
                      style={{
                        background:
                          activeFilter === key
                            ? `${color}22`
                            : "rgba(255,255,255,0.05)",
                        border: `1px solid ${activeFilter === key ? `${color}55` : "rgba(255,255,255,0.1)"}`,
                        color:
                          activeFilter === key ? color : "oklch(0.55 0.03 220)",
                      }}
                      data-ocid="home.tab"
                    >
                      {label}
                    </button>
                  ))}
                  <div
                    className="w-px h-4 mx-1"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow3dBuildings((v) => !v)}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 hover:scale-[1.03]"
                    style={{
                      background: show3dBuildings
                        ? "rgba(107,114,128,0.2)"
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${show3dBuildings ? "rgba(107,114,128,0.5)" : "rgba(255,255,255,0.1)"}`,
                      color: show3dBuildings
                        ? "#9ca3af"
                        : "oklch(0.45 0.03 220)",
                    }}
                    data-ocid="home.toggle"
                  >
                    3D Buildings
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHeatmap((v) => !v)}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 hover:scale-[1.03]"
                    style={{
                      background: showHeatmap
                        ? "rgba(0,200,180,0.15)"
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${showHeatmap ? "rgba(0,200,180,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: showHeatmap ? "#6ee7d0" : "oklch(0.45 0.03 220)",
                    }}
                    data-ocid="home.toggle"
                  >
                    Heatmap
                  </button>
                  <div
                    className="w-px h-4 mx-1"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowWeather((v) => !v)}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 hover:scale-[1.03]"
                    style={{
                      background: showWeather
                        ? "rgba(147,197,253,0.15)"
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${showWeather ? "rgba(147,197,253,0.45)" : "rgba(255,255,255,0.1)"}`,
                      color: showWeather ? "#93c5fd" : "oklch(0.45 0.03 220)",
                    }}
                    data-ocid="home.toggle"
                  >
                    🌤 Weather
                  </button>
                </div>
              </div>
            </div>

            {/* Provider list — 40% */}
            <div className="lg:col-span-2">
              {/* Unified search bar */}
              <div className="relative mb-3">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "oklch(0.50 0.03 220)" }}
                />
                <input
                  type="text"
                  placeholder="Search by name, city, or type…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{
                    background: "oklch(0.18 0.035 225)",
                    border: "1px solid oklch(0.28 0.04 225)",
                    color: "oklch(0.90 0.02 200)",
                  }}
                  data-ocid="home.provider_search"
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-foreground/60" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/60">
                  {filtered.length} Providers Found
                </h2>
              </div>

              {isLoading ? (
                <div className="space-y-3" data-ocid="home.loading_state">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-card rounded-xl p-4 border border-border animate-pulse"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-muted" />
                        <div className="h-3 w-16 rounded bg-muted" />
                      </div>
                      <div className="h-4 w-3/4 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-40 rounded-xl bg-card border border-border shadow-card"
                  data-ocid="home.empty_state"
                >
                  <MapPin className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    No providers are live right now. Check back soon or call
                    833-234-6343.
                  </p>
                </div>
              ) : (
                <div className="max-h-[400px] lg:max-h-[480px] overflow-y-auto space-y-3 pr-1">
                  {filtered.map((provider, idx) => {
                    const info = providerStatusInfo(provider);
                    const emergencyStatus = emergencyStatuses[provider.id];
                    const pType = (
                      (provider as unknown as { providerType?: string })
                        .providerType ?? ""
                    ).toLowerCase();
                    const isExpanded = expandedCard === provider.id;
                    const activeTab = cardTab[provider.id] ?? "meds";

                    // Derive data from provider type
                    const medsMap: Record<string, string[]> = {
                      "mat clinic": [
                        "Buprenorphine-Naloxone",
                        "Methadone",
                        "Naltrexone",
                        "Vivitrol",
                      ],
                      "narcan distribution": [
                        "Naloxone (Narcan)",
                        "NEXT naloxone",
                      ],
                      "emergency room": ["Naloxone", "Buprenorphine (bridge)"],
                      "naloxone kiosk": [
                        "Naloxone (free)",
                        "Fentanyl test strips",
                      ],
                      "telehealth mat": [
                        "Buprenorphine-Naloxone",
                        "Naltrexone",
                        "Suboxone",
                      ],
                    };
                    const servicesMap: Record<string, string[]> = {
                      "mat clinic": [
                        "Individual counseling",
                        "Group therapy",
                        "Case management",
                        "Peer support",
                      ],
                      "narcan distribution": [
                        "Free Narcan kits",
                        "Training",
                        "Referrals",
                      ],
                      "emergency room": [
                        "Crisis stabilization",
                        "Bridge prescription",
                        "Warm handoff",
                      ],
                      "naloxone kiosk": [
                        "24/7 access",
                        "Anonymous pickup",
                        "No ID required",
                      ],
                      "telehealth mat": [
                        "Video visits",
                        "e-Prescribing",
                        "Remote monitoring",
                      ],
                    };
                    const costMap: Record<string, string[]> = {
                      "mat clinic": [
                        "Buprenorphine via CostPlusDrugs: ~$20/mo",
                        "Sliding-scale fees available",
                        "Medicaid accepted",
                      ],
                      "narcan distribution": ["Free Narcan — no cost"],
                      "emergency room": [
                        "Covered under emergency Medicaid",
                        "Bridge scripts billed to insurance",
                      ],
                      "naloxone kiosk": ["Naloxone: FREE (grant-funded)"],
                      "telehealth mat": [
                        "~$50–$100/visit without insurance",
                        "Most major insurance accepted",
                      ],
                    };
                    const insuranceMap: Record<string, string[]> = {
                      "mat clinic": [
                        "Medicaid",
                        "Medicare",
                        "BCBS",
                        "Aetna",
                        "Anthem",
                        "Uninsured welcome",
                      ],
                      "narcan distribution": ["No insurance needed"],
                      "emergency room": ["All insurance", "Uninsured", "CHIP"],
                      "naloxone kiosk": ["No insurance needed — free"],
                      "telehealth mat": [
                        "Medicaid",
                        "BCBS",
                        "Aetna",
                        "Out-of-pocket",
                      ],
                    };

                    const meds = medsMap[pType] ?? ["Contact for details"];
                    const services = servicesMap[pType] ?? [
                      "Contact for details",
                    ];
                    const costs = costMap[pType] ?? ["Contact for details"];
                    const insurances = insuranceMap[pType] ?? [
                      "Contact provider",
                    ];

                    const TABS: {
                      key: CardTab;
                      label: string;
                      icon: React.ReactNode;
                      color: string;
                    }[] = [
                      {
                        key: "meds",
                        label: "Meds",
                        icon: <Pill className="w-3 h-3" />,
                        color: "#818cf8",
                      },
                      {
                        key: "services",
                        label: "Services",
                        icon: <Heart className="w-3 h-3" />,
                        color: "#6ee7d0",
                      },
                      {
                        key: "cost",
                        label: "Cost",
                        icon: <DollarSign className="w-3 h-3" />,
                        color: "#00ff88",
                      },
                      {
                        key: "insurance",
                        label: "Insurance",
                        icon: <Shield className="w-3 h-3" />,
                        color: "#fbbf24",
                      },
                    ];

                    const tabContent: Record<CardTab, string[]> = {
                      meds,
                      services,
                      cost: costs,
                      insurance: insurances,
                    };

                    return (
                      <div
                        key={provider.id}
                        className="bg-card rounded-xl shadow-card border border-border transition-colors hover:border-primary/40"
                        data-ocid={`home.item.${idx + 1}`}
                      >
                        {/* Card header — click to expand or navigate */}
                        <div className="flex items-start gap-2 p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${info.dotClass}`}
                              />
                              <span
                                className={`text-xs font-bold ${info.textClass}`}
                              >
                                {info.label}
                              </span>
                              {emergencyStatus === "open_bed" && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <BedDouble className="w-3 h-3" /> OPEN BED
                                </span>
                              )}
                              {emergencyStatus === "72hr_bridge" && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <Clock className="w-3 h-3" /> 72HR BRIDGE
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-sm text-foreground leading-snug truncate">
                              {provider.name}
                            </p>
                            {pType && (
                              <p
                                className="text-[10px] mt-0.5 capitalize"
                                style={{ color: "oklch(0.60 0.08 185)" }}
                              >
                                {pType}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Expand/info button */}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCard(isExpanded ? null : provider.id)
                              }
                              className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                              style={{
                                background: isExpanded
                                  ? "oklch(0.72 0.20 142 / 0.15)"
                                  : "oklch(0.25 0.04 225 / 0.6)",
                                color: isExpanded
                                  ? "oklch(0.80 0.20 142)"
                                  : "oklch(0.55 0.04 220)",
                              }}
                              aria-label={
                                isExpanded ? "Collapse details" : "Show details"
                              }
                              data-ocid={`home.info_button.${idx + 1}`}
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            {/* View profile */}
                            <Link
                              to="/provider/$id"
                              params={{ id: provider.id }}
                              className="bg-primary rounded-lg p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center hover:-translate-y-0.5 transition-all duration-150"
                              aria-label={`View ${provider.name}`}
                            >
                              <ArrowRight className="w-4 h-4 text-white" />
                            </Link>
                          </div>
                        </div>

                        {/* Expandable tab panel */}
                        {isExpanded && (
                          <div
                            style={{
                              borderTop: "1px solid oklch(0.24 0.04 225 / 0.5)",
                            }}
                          >
                            {/* Tab bar */}
                            <div
                              className="flex gap-1 px-3 pt-2"
                              role="tablist"
                            >
                              {TABS.map((t) => (
                                <button
                                  key={t.key}
                                  type="button"
                                  role="tab"
                                  aria-selected={activeTab === t.key}
                                  onClick={() =>
                                    setCardTab((prev) => ({
                                      ...prev,
                                      [provider.id]: t.key,
                                    }))
                                  }
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150"
                                  style={{
                                    background:
                                      activeTab === t.key
                                        ? `${t.color}20`
                                        : "transparent",
                                    color:
                                      activeTab === t.key
                                        ? t.color
                                        : "oklch(0.50 0.03 220)",
                                    borderBottom:
                                      activeTab === t.key
                                        ? `2px solid ${t.color}`
                                        : "2px solid transparent",
                                  }}
                                >
                                  {t.icon}
                                  {t.label}
                                </button>
                              ))}
                            </div>
                            {/* Tab content */}
                            <div className="px-4 py-3">
                              <ul className="space-y-1">
                                {tabContent[activeTab].map((item) => (
                                  <li
                                    key={item}
                                    className="flex items-start gap-2 text-xs"
                                    style={{ color: "oklch(0.78 0.04 210)" }}
                                  >
                                    <span
                                      className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full"
                                      style={{
                                        background:
                                          TABS.find((t) => t.key === activeTab)
                                            ?.color ?? "#6ee7d0",
                                      }}
                                    />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Authenticated: Dashboard Controls ── */}
      {isLoggedIn && (
        <section
          className="w-full px-4 py-8"
          style={{ background: "oklch(0.10 0.02 240)" }}
          data-ocid="home.section"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio
                  className="w-5 h-5"
                  style={{
                    color: "#00ff88",
                    filter: "drop-shadow(0 0 6px rgba(0,255,136,0.5))",
                  }}
                />
                <h2
                  className="text-xl font-bold"
                  style={{ color: "oklch(0.93 0.01 200)" }}
                >
                  Region 13 Live Dashboard
                </h2>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(0,255,136,0.08)",
                  border: "1px solid rgba(0,255,136,0.2)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"
                  style={{ boxShadow: "0 0 6px rgba(0,255,136,0.8)" }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: "#00ff88" }}
                >
                  {liveCount} Live
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Provider Status Table — 2/3 */}
              <div className="xl:col-span-2">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "oklch(0.13 0.03 240)",
                    border: "1px solid oklch(0.22 0.05 240)",
                  }}
                >
                  <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{ borderBottom: "1px solid oklch(0.20 0.04 240)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        className="w-4 h-4"
                        style={{ color: "oklch(0.65 0.06 200)" }}
                      />
                      <h3
                        className="font-bold"
                        style={{ color: "oklch(0.90 0.01 200)" }}
                      >
                        Provider Status
                      </h3>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.18 0.04 240)",
                        color: "oklch(0.58 0.03 220)",
                      }}
                    >
                      {filteredByType.length} shown
                    </span>
                  </div>

                  {isLoading ? (
                    <div
                      className="p-8 text-center"
                      style={{ color: "oklch(0.58 0.03 220)" }}
                      data-ocid="home.loading_state"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-[#00ff88]/30 border-t-[#00ff88] animate-spin mx-auto mb-2" />
                      Loading providers…
                    </div>
                  ) : filteredByType.length === 0 ? (
                    <div
                      className="p-8 text-center flex flex-col items-center gap-2"
                      style={{ color: "oklch(0.58 0.03 220)" }}
                      data-ocid="home.empty_state"
                    >
                      <Shield
                        className="w-8 h-8 mb-1"
                        style={{ color: "oklch(0.35 0.04 220)" }}
                      />
                      <p className="font-medium">
                        No providers match this filter
                      </p>
                      <p className="text-xs opacity-70">
                        Try switching to "All Providers"
                      </p>
                    </div>
                  ) : (
                    <div
                      className="divide-y"
                      style={{ borderColor: "oklch(0.18 0.03 240)" }}
                    >
                      {filteredByType.map((p, i) => {
                        const stale = isProviderStale(p.lastVerified);
                        const live = p.status === ProviderStatus.Live && !stale;
                        const emergencyStatus = emergencyStatuses[p.id];
                        return (
                          <div
                            key={p.id}
                            className="px-5 py-3.5 flex items-center gap-4"
                            data-ocid={`home.item.${i + 1}`}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full block shrink-0 ${live ? "animate-pulse" : ""}`}
                              style={{
                                background: live
                                  ? "#00ff88"
                                  : stale
                                    ? "#4a5568"
                                    : "#fbbf24",
                                boxShadow: live
                                  ? "0 0 6px rgba(0,255,136,0.7)"
                                  : "none",
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p
                                  className="font-medium truncate text-sm"
                                  style={{ color: "oklch(0.88 0.08 195)" }}
                                >
                                  {p.name}
                                </p>
                                {emergencyStatus === "open_bed" && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    <BedDouble className="w-3 h-3" /> OPEN BED
                                  </span>
                                )}
                                {emergencyStatus === "72hr_bridge" && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    <Clock className="w-3 h-3" /> 72HR BRIDGE
                                  </span>
                                )}
                              </div>
                              <p
                                className="text-xs font-mono"
                                style={{ color: "oklch(0.45 0.03 220)" }}
                              >
                                {p.id}
                                {stale ? " · stale" : ""}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0"
                              style={{
                                borderColor: live
                                  ? "rgba(0,255,136,0.3)"
                                  : "oklch(0.28 0.05 220)",
                                color: live
                                  ? "#00ff88"
                                  : "oklch(0.58 0.03 220)",
                              }}
                            >
                              {statusLabel(p.status)}
                            </Badge>
                            {isAdmin && (
                              <Switch
                                checked={p.isLive}
                                onCheckedChange={() =>
                                  handleToggle(p.id, p.isLive)
                                }
                                className="shrink-0"
                                data-ocid={`home.toggle.${i + 1}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Side Panel — 1/3 */}
              <div className="space-y-5">
                {/* Live Right Now */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "oklch(0.13 0.03 240)",
                    border: "1px solid oklch(0.22 0.05 240)",
                  }}
                >
                  <div
                    className="px-5 py-4"
                    style={{ borderBottom: "1px solid oklch(0.20 0.04 240)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"
                        style={{ boxShadow: "0 0 6px rgba(0,255,136,0.8)" }}
                      />
                      <h3
                        className="font-bold text-sm"
                        style={{ color: "#00ff88" }}
                      >
                        Live Right Now
                      </h3>
                    </div>
                  </div>
                  {liveProviders.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <Shield
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: "oklch(0.35 0.04 220)" }}
                      />
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.50 0.03 220)" }}
                      >
                        No providers live right now
                      </p>
                    </div>
                  ) : (
                    <div
                      className="divide-y max-h-64 overflow-y-auto"
                      style={{ borderColor: "oklch(0.18 0.03 240)" }}
                    >
                      {liveProviders.map((p, i) => (
                        <a
                          key={p.id}
                          href={`/provider/${p.id}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
                          data-ocid={`home.item.${i + 1}`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                            style={{
                              background: "#00ff88",
                              boxShadow: "0 0 5px rgba(0,255,136,0.7)",
                            }}
                          />
                          <p
                            className="text-xs font-semibold truncate flex-1"
                            style={{ color: "oklch(0.88 0.08 195)" }}
                          >
                            {p.name}
                          </p>
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: "#00ff88" }}
                          >
                            LIVE
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Total Providers"
                    value={providers.length}
                    color="#6ee7d0"
                  />
                  <StatCard
                    label="Live Now"
                    value={liveCount}
                    color="#00ff88"
                    glow
                  />
                </div>

                {/* Admin: Canister State drawer */}
                {isAdmin && (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "oklch(0.13 0.03 240)",
                      border: "1px solid oklch(0.22 0.05 240)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setAdminDrawerOpen((v) => !v)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors min-h-[52px]"
                      data-ocid="home.open_modal_button"
                    >
                      <div className="flex items-center gap-2">
                        <Server
                          className="w-4 h-4"
                          style={{ color: "oklch(0.65 0.06 200)" }}
                        />
                        <span
                          className="font-bold text-sm"
                          style={{ color: "oklch(0.90 0.01 200)" }}
                        >
                          Admin: Canister State
                        </span>
                      </div>
                      {adminDrawerOpen ? (
                        <ChevronUp
                          className="w-4 h-4"
                          style={{ color: "oklch(0.55 0.03 220)" }}
                        />
                      ) : (
                        <ChevronDown
                          className="w-4 h-4"
                          style={{ color: "oklch(0.55 0.03 220)" }}
                        />
                      )}
                    </button>

                    {adminDrawerOpen && canisterState && (
                      <div
                        className="px-5 pb-5 space-y-4"
                        style={{ borderTop: "1px solid oklch(0.20 0.04 240)" }}
                        data-ocid="home.panel"
                      >
                        <div className="pt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span style={{ color: "oklch(0.58 0.03 220)" }}>
                              Active providers
                            </span>
                            <span
                              className="font-bold"
                              style={{
                                color: "oklch(0.85 0.14 195)",
                                textShadow: "0 0 8px rgba(0,229,255,0.3)",
                              }}
                            >
                              {canisterState.total_active_providers.toString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: "oklch(0.58 0.03 220)" }}>
                              High-risk window
                            </span>
                            <span
                              className="font-bold"
                              style={{
                                color: canisterState.high_risk_window_active
                                  ? "oklch(0.82 0.15 60)"
                                  : "#00ff88",
                                textShadow:
                                  canisterState.high_risk_window_active
                                    ? "0 0 8px rgba(255,180,0,0.4)"
                                    : "0 0 8px rgba(0,255,136,0.4)",
                              }}
                            >
                              {canisterState.high_risk_window_active
                                ? "ACTIVE"
                                : "Clear"}
                            </span>
                          </div>
                        </div>
                        {canisterState.active_providers.length > 0 && (
                          <div>
                            <p
                              className="text-xs font-semibold uppercase tracking-wide mb-2"
                              style={{ color: "oklch(0.50 0.04 220)" }}
                            >
                              Risk Scores
                            </p>
                            <div className="space-y-1.5">
                              {canisterState.active_providers.map(
                                ([pid, score, hr], i) => (
                                  <div
                                    key={pid}
                                    className="flex items-center gap-2 text-xs"
                                    data-ocid={`home.item.${i + 1}`}
                                  >
                                    <span
                                      className="font-mono truncate flex-1"
                                      style={{ color: "oklch(0.65 0.06 200)" }}
                                    >
                                      {pid}
                                    </span>
                                    <span
                                      className="font-bold"
                                      style={{
                                        color: hr
                                          ? "oklch(0.82 0.15 60)"
                                          : "oklch(0.55 0.03 220)",
                                      }}
                                    >
                                      {score.toString()}
                                    </span>
                                    {hr && (
                                      <span
                                        style={{ color: "oklch(0.82 0.15 60)" }}
                                      >
                                        ⚠
                                      </span>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Provider self-service live toggle — non-admin providers only */}
                {!isAdmin && myProvider && (
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: "oklch(0.13 0.03 240)",
                      border: selfLiveState?.live
                        ? "1px solid oklch(0.82 0.18 145 / 0.35)"
                        : "1px solid oklch(0.22 0.05 240)",
                    }}
                    data-ocid="home.panel"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Activity
                        className="w-4 h-4"
                        style={{
                          color: selfLiveState?.live
                            ? "#00ff88"
                            : "oklch(0.55 0.03 220)",
                        }}
                      />
                      <h3
                        className="font-bold text-sm"
                        style={{ color: "oklch(0.90 0.01 200)" }}
                      >
                        My Live Status
                      </h3>
                      {selfLiveState?.live && (
                        <span
                          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: "oklch(0.82 0.18 145 / 0.15)",
                            color: "#00ff88",
                          }}
                        >
                          SELF-REPORTED
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs mb-4"
                      style={{ color: "oklch(0.50 0.03 220)" }}
                    >
                      {selfLiveState?.live
                        ? `Reporting as live since ${formatMinutesAgo(selfLiveState.setAt)}. Auto-expires in 4 hours.`
                        : "Toggle your availability. Status auto-expires after 4 hours."}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-sm font-medium truncate block"
                          style={{ color: "oklch(0.85 0.08 195)" }}
                        >
                          {myProvider.name}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "oklch(0.45 0.03 220)" }}
                        >
                          {selfLiveState?.live
                            ? "Live (self-reported)"
                            : "Offline"}
                        </span>
                      </div>
                      <Switch
                        checked={!!selfLiveState?.live}
                        onCheckedChange={handleSelfToggleRequest}
                        data-ocid="home.toggle.1"
                      />
                    </div>
                    <p
                      className="text-[10px] mt-3"
                      style={{ color: "oklch(0.40 0.03 220)" }}
                    >
                      ⓘ Self-reported status is visible to your patients. Admin
                      verification required for official live status.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Self-Service Toggle Confirmation Modal ── */}
      {selfToggleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          data-ocid="home.modal"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: "oklch(0.16 0.03 240)",
              border: "1px solid oklch(0.28 0.06 240)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3
                className="font-bold text-lg"
                style={{ color: "oklch(0.90 0.01 200)" }}
              >
                {selfLiveState?.live ? "Go Offline?" : "Go Live?"}
              </h3>
              <button
                type="button"
                onClick={() => setSelfToggleModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label="Close"
              >
                <X
                  className="w-4 h-4"
                  style={{ color: "oklch(0.55 0.03 220)" }}
                />
              </button>
            </div>

            {!selfLiveState?.live ? (
              <>
                <p
                  className="text-sm mb-2"
                  style={{ color: "oklch(0.75 0.04 220)" }}
                >
                  Going live tells patients you are currently accepting
                  walk-ins.
                </p>
                <div
                  className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm"
                  style={{
                    background: "oklch(0.82 0.18 145 / 0.08)",
                    border: "1px solid oklch(0.82 0.18 145 / 0.2)",
                  }}
                >
                  <Clock
                    className="w-4 h-4 shrink-0"
                    style={{ color: "#00ff88" }}
                  />
                  <span style={{ color: "oklch(0.75 0.08 185)" }}>
                    Your status will automatically expire in 4 hours.
                  </span>
                </div>
              </>
            ) : (
              <p
                className="text-sm mb-5"
                style={{ color: "oklch(0.75 0.04 220)" }}
              >
                This will clear your self-reported live status. Patients will
                see you as offline.
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px] border-white/20 text-white hover:bg-white/10"
                onClick={() => setSelfToggleModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 min-h-[44px] font-semibold"
                style={{
                  background: selfLiveState?.live
                    ? "oklch(0.40 0.08 220)"
                    : "#00ff88",
                  color: selfLiveState?.live ? "white" : "#0a1628",
                }}
                onClick={handleSelfToggleConfirm}
                data-ocid="home.confirm_button"
              >
                {selfLiveState?.live ? "Go Offline" : "Go Live"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mission ── */}
      <section className="py-16 px-4 bg-secondary" data-ocid="home.section">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 bg-primary/10 border border-primary/20 text-teal-light">
            <Shield className="w-3.5 h-3.5" /> Privacy-First Recovery Support
          </div>
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Every Minute Matters in Crisis
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Live Now Recovery shows who is available right now — in real time.
            We protect patient privacy absolutely. No names, no diagnoses, no
            records. Just the information that saves lives.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="min-h-[48px] px-8 font-semibold bg-primary text-white hover:bg-primary/90"
              data-ocid="home.primary_button"
            >
              <Link to="/">
                <MapPin className="w-4 h-4 mr-2" />
                Find Providers
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-[48px] px-6 font-medium border-primary/40 text-primary hover:bg-primary/10"
              data-ocid="home.secondary_button"
            >
              <Link to="/register">
                <Zap className="w-4 h-4 mr-2" />
                Register as Provider
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-[48px] px-6 font-medium border-teal-light/40 text-teal-light hover:bg-teal-light/10"
              data-ocid="home.secondary_button"
            >
              <Link to="/helper">
                <Users className="w-4 h-4 mr-2" />
                Become a Helper
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Impact + Costs ── */}
      <section
        className="py-16 px-4 max-w-7xl mx-auto"
        data-ocid="home.section"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HandoffImpact />
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Know Your Costs
              </h2>
            </div>
            <PriceComparisonCard />
          </div>
        </div>
      </section>

      {/* ── Cities ── */}
      {(() => {
        const CITIES: [string, string][] = [
          ["Cleveland", "/cleveland"],
          ["Lakewood", "/lakewood"],
          ["Parma", "/parma"],
          ["Lorain", "/lorain"],
          ["Akron", "/akron"],
          ["Youngstown", "/youngstown"],
          ["Canton", "/canton"],
          ["Elyria", "/elyria"],
          ["Mentor", "/mentor"],
          ["Strongsville", "/strongsville"],
          ["Euclid", "/euclid"],
          ["Sandusky", "/sandusky"],
          ["Warren", "/warren"],
          ["Toledo", "/toledo"],
          ["Medina", "/medina"],
        ];
        const visibleCities = showAllCities ? CITIES : CITIES.slice(0, 5);
        return (
          <section className="py-12 px-4 bg-secondary" data-ocid="home.section">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xl font-bold mb-6 text-center text-foreground">
                Find Providers by City
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {visibleCities.map(([city, path]) => {
                  const cityLower = city.toLowerCase();
                  const count = providers.filter((p) => {
                    const nameLower = p.name.toLowerCase();
                    if (nameLower.includes(cityLower)) return true;
                    // Also check address field if available
                    const addr = (
                      (p as unknown as { address?: string }).address ?? ""
                    ).toLowerCase();
                    return addr.includes(cityLower);
                  }).length;
                  return (
                    <Link
                      key={path}
                      to={path}
                      className="relative inline-flex items-center min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-105 border"
                      style={{
                        borderColor: "oklch(0.72 0.20 142 / 0.35)",
                        color: "oklch(0.72 0.20 142)",
                        background: "oklch(0.72 0.20 142 / 0.06)",
                      }}
                      data-ocid="home.button"
                    >
                      {city}
                      <span
                        className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={
                          count > 0
                            ? {
                                background: "oklch(0.72 0.20 142 / 0.20)",
                                color: "oklch(0.80 0.20 142)",
                              }
                            : {
                                background: "oklch(0.35 0.02 220 / 0.6)",
                                color: "oklch(0.55 0.03 220)",
                              }
                        }
                      >
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="flex justify-center mt-5">
                <Button
                  variant="outline"
                  className="min-h-[44px] transition-all border-primary/40 text-primary hover:bg-primary/10 gap-2"
                  onClick={() => setShowAllCities((prev) => !prev)}
                  data-ocid="home.cities-toggle"
                >
                  {showAllCities ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      View All 15 Cities <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
        );
      })()}
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
  glow,
}: { label: string; value: number; color: string; glow?: boolean }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "oklch(0.13 0.03 240)",
        border: `1px solid ${glow ? `${color}25` : "oklch(0.22 0.05 240)"}`,
        boxShadow: glow ? `0 0 20px ${color}12` : "none",
      }}
    >
      <p
        className="text-2xl font-bold"
        style={{ color, textShadow: glow ? `0 0 12px ${color}60` : "none" }}
      >
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.03 220)" }}>
        {label}
      </p>
    </div>
  );
}
