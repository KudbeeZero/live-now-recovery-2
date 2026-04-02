import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  MapPin,
  Radio,
  Search,
  Server,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProviderStatus } from "../backend";
import { EnhancedRecoveryMap } from "../components/EnhancedRecoveryMap";
import { HandoffImpact } from "../components/HandoffImpact";
import { PriceComparisonCard } from "../components/PriceComparisonCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProviders,
  useCanisterState,
  useIsAdmin,
  useToggleLive,
} from "../hooks/useQueries";
import { isProviderStale, statusLabel } from "../utils/providerUtils";

type FilterType = "all" | "mat" | "narcan" | "er";

const filterLabels: { key: FilterType; label: string; color: string }[] = [
  { key: "all", label: "All Providers", color: "#6ee7d0" },
  { key: "mat", label: "MAT", color: "#00ff88" },
  { key: "narcan", label: "Narcan", color: "#fbbf24" },
  { key: "er", label: "Emergency Rooms", color: "#f87171" },
];

export function HomePage() {
  const { data: providers = [], isLoading } = useAllProviders();
  const { data: canisterState } = useCanisterState();
  const { data: isAdmin } = useIsAdmin();
  const toggleLive = useToggleLive();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  const liveProviders = providers.filter(
    (p) => p.status === ProviderStatus.Live && !isProviderStale(p.lastVerified),
  );

  const liveCount = liveProviders.length;

  const filteredBySearch = providers.filter((p) => {
    if (!search.trim()) return true;
    return p.name.toLowerCase().includes(search.toLowerCase());
  });

  const filteredByType = providers.filter((p) => {
    if (activeFilter === "all") return true;
    const name = p.name.toLowerCase();
    if (activeFilter === "mat")
      return (
        name.includes("mat") ||
        name.includes("brightside") ||
        name.includes("buprenorphine")
      );
    if (activeFilter === "narcan")
      return (
        name.includes("narcan") ||
        name.includes("naloxone") ||
        name.includes("pharmacy")
      );
    if (activeFilter === "er")
      return (
        name.includes("er") ||
        name.includes("emergency") ||
        name.includes("hospital")
      );
    return true;
  });

  // Combine search + type filter
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
                placeholder="Search by provider name or city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-10 pr-4 rounded-xl shadow-lg bg-white text-gray-900 placeholder-gray-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* ── High-Risk Alert (authenticated users) ── */}
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

      {/* ── Results Section: Filters + Map + Provider List ── */}
      <section
        className="w-full bg-teal-mid py-8 px-4"
        data-ocid="home.section"
      >
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Filter chips — always visible */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter
              className="w-4 h-4 shrink-0"
              style={{ color: "oklch(0.55 0.03 220)" }}
            />
            {filterLabels.map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] hover:scale-[1.03]"
                style={{
                  background:
                    activeFilter === key
                      ? `${color}20`
                      : "oklch(0.13 0.03 240)",
                  border: `1px solid ${
                    activeFilter === key ? `${color}50` : "oklch(0.22 0.05 240)"
                  }`,
                  color: activeFilter === key ? color : "oklch(0.58 0.03 220)",
                }}
                data-ocid="home.tab"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Map — 60% */}
            <div className="lg:col-span-3">
              <div className="h-[340px] lg:h-[520px] rounded-xl overflow-hidden shadow-card">
                <EnhancedRecoveryMap
                  height="100%"
                  onToggleLive={isLoggedIn ? handleToggle : undefined}
                />
              </div>
            </div>

            {/* Provider list — 40% */}
            <div className="lg:col-span-2">
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
                    return (
                      <Link
                        key={provider.id}
                        to="/provider/$id"
                        params={{ id: provider.id }}
                        className="block hover:-translate-y-0.5 transition-all duration-150"
                        data-ocid={`home.item.${idx + 1}`}
                      >
                        <div className="group bg-card rounded-xl p-4 shadow-card border border-border hover:border-primary/40 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${info.dotClass}`}
                                />
                                <span
                                  className={`text-xs font-bold ${info.textClass}`}
                                >
                                  {info.label}
                                </span>
                              </div>
                              <p className="font-semibold text-sm text-foreground leading-snug truncate">
                                {provider.name}
                              </p>
                            </div>
                            <div className="bg-primary rounded-lg p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0">
                              <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </Link>
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
            {/* Section header */}
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

            {/* Main layout: table + side panel */}
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
                        return (
                          <div
                            key={p.id}
                            className="px-5 py-3.5 flex items-center gap-4"
                            data-ocid={`home.item.${i + 1}`}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full block shrink-0 ${
                                live ? "animate-pulse" : ""
                              }`}
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
                              <p
                                className="font-medium truncate text-sm"
                                style={{ color: "oklch(0.88 0.08 195)" }}
                              >
                                {p.name}
                              </p>
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
                            <Switch
                              checked={p.isLive}
                              onCheckedChange={() =>
                                handleToggle(p.id, p.isLive)
                              }
                              className="shrink-0"
                              data-ocid={`home.toggle.${i + 1}`}
                            />
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
                        style={{
                          borderTop: "1px solid oklch(0.20 0.04 240)",
                        }}
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
                                        style={{
                                          color: "oklch(0.82 0.15 60)",
                                        }}
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

                {/* Provider view: their own Live Toggle */}
                {!isAdmin && (
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: "oklch(0.13 0.03 240)",
                      border: "1px solid oklch(0.22 0.05 240)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Activity
                        className="w-4 h-4"
                        style={{ color: "#00ff88" }}
                      />
                      <h3
                        className="font-bold text-sm"
                        style={{ color: "oklch(0.90 0.01 200)" }}
                      >
                        Your Status
                      </h3>
                    </div>
                    <p
                      className="text-xs mb-4"
                      style={{ color: "oklch(0.55 0.03 220)" }}
                    >
                      Toggle your availability. Status auto-expires after 4
                      hours.
                    </p>
                    {providers.slice(0, 1).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: "oklch(0.85 0.08 195)" }}
                        >
                          {p.name}
                        </span>
                        <Switch
                          checked={p.isLive}
                          onCheckedChange={() => handleToggle(p.id, p.isLive)}
                          data-ocid="home.toggle.1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
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
      <section className="py-12 px-4 bg-secondary" data-ocid="home.section">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center text-foreground">
            Find Providers by City
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {(
              [
                ["Cleveland", "/cleveland"],
                ["Lakewood", "/lakewood"],
                ["Parma", "/parma"],
                ["Lorain", "/lorain"],
                ["Akron", "/akron"],
              ] as [string, string][]
            ).map(([city, path]) => (
              <Button
                key={path}
                asChild
                variant="outline"
                className="min-h-[44px] transition-all border-primary/40 text-primary hover:bg-primary/10 hover:scale-105"
                data-ocid="home.button"
              >
                <Link to={path}>{city}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>
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
