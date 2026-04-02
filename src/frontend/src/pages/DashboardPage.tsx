import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  Radio,
  Server,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProviderStatus } from "../backend";
import { EnhancedRecoveryMap } from "../components/EnhancedRecoveryMap";
import {
  useAllProviders,
  useCanisterState,
  useIsAdmin,
  useToggleLive,
} from "../hooks/useQueries";
import { isProviderStale, statusLabel } from "../utils/providerUtils";

type FilterType = "all" | "mat" | "narcan" | "er";

export function DashboardPage() {
  const { data: providers = [], isLoading } = useAllProviders();
  const { data: canisterState } = useCanisterState();
  const { data: isAdmin } = useIsAdmin();
  const toggleLive = useToggleLive();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  // For demo: treat all providers with "MAT" in name as MAT, etc.
  // In production this would come from a `type` field on the provider.
  const filterLabels: { key: FilterType; label: string; color: string }[] = [
    { key: "all", label: "All Providers", color: "#6ee7d0" },
    { key: "mat", label: "MAT", color: "#00ff88" },
    { key: "narcan", label: "Narcan", color: "#fbbf24" },
    { key: "er", label: "Emergency Rooms", color: "#f87171" },
  ];

  const liveProviders = providers.filter(
    (p) => p.status === ProviderStatus.Live && !isProviderStale(p.lastVerified),
  );

  const filteredProviders = providers.filter((p) => {
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

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleLive.mutateAsync({ id, status: !current });
      toast.success(`Status updated to ${!current ? "Live" : "Offline"}`);
    } catch {
      toast.error("Failed to update status. Login required.");
    }
  };

  return (
    <main
      className="min-h-screen py-8 px-4"
      style={{ background: "oklch(0.08 0.02 240)" }}
      data-ocid="dashboard.page"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio
                className="w-5 h-5"
                style={{
                  color: "#00ff88",
                  filter: "drop-shadow(0 0 6px rgba(0,255,136,0.5))",
                }}
              />
              <h1
                className="text-2xl font-bold"
                style={{ color: "oklch(0.93 0.01 200)" }}
              >
                Region 13 Live Dashboard
              </h1>
            </div>
            <p className="text-sm" style={{ color: "oklch(0.55 0.03 220)" }}>
              Real-time provider availability — no PHI stored
            </p>
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
            <span className="text-sm font-bold" style={{ color: "#00ff88" }}>
              {liveProviders.length} Live
            </span>
          </div>
        </div>

        {/* ── High-Risk Alert ── */}
        {canisterState?.high_risk_window_active && (
          <div
            className="p-4 rounded-xl flex items-start gap-3"
            style={{
              background: "oklch(0.14 0.06 60 / 0.3)",
              border: "1px solid oklch(0.75 0.15 60 / 0.4)",
            }}
            data-ocid="dashboard.error_state"
          >
            <AlertTriangle
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "oklch(0.82 0.15 60)" }}
            />
            <div>
              <p className="font-bold" style={{ color: "oklch(0.88 0.12 60)" }}>
                High-Risk Window Active
              </p>
              <p className="text-sm" style={{ color: "oklch(0.75 0.08 60)" }}>
                {canisterState.active_providers.filter(([, , hr]) => hr).length}{" "}
                provider(s) flagged. Escalate if needed.
              </p>
            </div>
          </div>
        )}

        {/* ── Quick Filters ── */}
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
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background:
                  activeFilter === key ? `${color}20` : "oklch(0.13 0.03 240)",
                border: `1px solid ${activeFilter === key ? `${color}50` : "oklch(0.22 0.05 240)"}`,
                color: activeFilter === key ? color : "oklch(0.58 0.03 220)",
              }}
              data-ocid="dashboard.button"
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map — 2/3 width */}
          <div className="xl:col-span-2 space-y-4">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid oklch(0.22 0.06 195 / 0.4)",
                boxShadow: "0 0 40px rgba(0,229,255,0.05)",
              }}
            >
              <EnhancedRecoveryMap height="460px" onToggleLive={handleToggle} />
            </div>

            {/* Provider Status Table */}
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
                  <h2
                    className="font-bold"
                    style={{ color: "oklch(0.90 0.01 200)" }}
                  >
                    Provider Status
                  </h2>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.18 0.04 240)",
                    color: "oklch(0.58 0.03 220)",
                  }}
                >
                  {filteredProviders.length} shown
                </span>
              </div>

              {isLoading ? (
                <div
                  className="p-8 text-center"
                  style={{ color: "oklch(0.58 0.03 220)" }}
                  data-ocid="dashboard.loading_state"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-[#00ff88]/30 border-t-[#00ff88] animate-spin mx-auto mb-2" />
                  Loading providers…
                </div>
              ) : filteredProviders.length === 0 ? (
                <div
                  className="p-8 text-center"
                  style={{ color: "oklch(0.58 0.03 220)" }}
                  data-ocid="dashboard.empty_state"
                >
                  No providers match this filter.
                </div>
              ) : (
                <div
                  className="divide-y"
                  style={{ borderColor: "oklch(0.18 0.03 240)" }}
                >
                  {filteredProviders.map((p, i) => {
                    const stale = isProviderStale(p.lastVerified);
                    const live = p.status === ProviderStatus.Live && !stale;
                    return (
                      <div
                        key={p.id}
                        className="px-5 py-3.5 flex items-center gap-4"
                        data-ocid={`dashboard.item.${i + 1}`}
                      >
                        <div className="shrink-0">
                          <span
                            className={`w-2.5 h-2.5 rounded-full block ${live ? "animate-pulse" : ""}`}
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
                        </div>
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
                            color: live ? "#00ff88" : "oklch(0.58 0.03 220)",
                          }}
                        >
                          {statusLabel(p.status)}
                        </Badge>
                        <Switch
                          checked={p.isLive}
                          onCheckedChange={() => handleToggle(p.id, p.isLive)}
                          className="shrink-0"
                          data-ocid={`dashboard.toggle.${i + 1}`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel — 1/3 width */}
          <div className="space-y-5">
            {/* Live Right Now panel */}
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
                      data-ocid={`dashboard.item.${i + 1}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                        style={{
                          background: "#00ff88",
                          boxShadow: "0 0 5px rgba(0,255,136,0.7)",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: "oklch(0.88 0.08 195)" }}
                        >
                          {p.name}
                        </p>
                      </div>
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

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Providers"
                value={providers.length}
                color="#6ee7d0"
              />
              <StatCard
                label="Live Now"
                value={liveProviders.length}
                color="#00ff88"
                glow
              />
            </div>

            {/* Admin collapsible drawer */}
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
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  data-ocid="dashboard.button"
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
                            textShadow: canisterState.high_risk_window_active
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
                                data-ocid={`dashboard.item.${i + 1}`}
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
                  <Activity className="w-4 h-4" style={{ color: "#00ff88" }} />
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
                  Toggle your availability. Status auto-expires after 4 hours.
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
                      data-ocid="dashboard.toggle.1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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
