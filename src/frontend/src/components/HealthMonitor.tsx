import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createActor } from "../backend";

// ─── Types ───────────────────────────────────────────────────────────────────

type CheckStatus = "pass" | "fail" | "slow" | "pending";

interface RouteCheck {
  label: string;
  route: string;
  type: "route" | "endpoint";
  status: CheckStatus;
  responseTime: number | null;
}

interface HealthRun {
  timestamp: number;
  passCount: number;
  failCount: number;
  slowCount: number;
}

const FRONTEND_ROUTES: { label: string; route: string }[] = [
  { label: "/", route: "/" },
  { label: "/admin", route: "/admin" },
  { label: "/provider/:id", route: "/provider/demo" },
  { label: "/helper", route: "/helper" },
  { label: "/location/:town", route: "/location/cleveland" },
  { label: "/signup", route: "/signup" },
  { label: "/register", route: "/register" },
  { label: "/verify", route: "/verify" },
  { label: "/mission", route: "/mission" },
  { label: "/about", route: "/about" },
  { label: "/contact", route: "/contact" },
  { label: "/founder", route: "/founder" },
  { label: "/blog", route: "/blog" },
  { label: "/blog/:slug", route: "/blog/what-is-mat" },
  { label: "/resources", route: "/resources" },
  { label: "/faq", route: "/faq" },
  { label: "/how-it-works", route: "/how-it-works" },
  { label: "/ohio-stats", route: "/ohio-stats" },
  { label: "/sitemap", route: "/sitemap" },
];

const ENDPOINT_CHECKS: { label: string; route: string }[] = [
  { label: "getAllProviders", route: "getAllProviders" },
  { label: "getTotalHandoffs", route: "getTotalHandoffs" },
  { label: "getCanisterState", route: "getCanisterState" },
  { label: "getMarketplaceGeoJSON", route: "getMarketplaceGeoJSON" },
];

const LS_KEY = "health_monitor_history";
const SLOW_THRESHOLD_MS = 800;

function loadHistory(): HealthRun[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HealthRun[];
  } catch {
    return [];
  }
}

function saveHistory(runs: HealthRun[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(runs.slice(-20)));
  } catch {
    // silently ignore localStorage errors
  }
}

function statusColor(status: CheckStatus): string {
  if (status === "pass") return "oklch(0.55 0.18 145)";
  if (status === "slow") return "oklch(0.82 0.15 85)";
  if (status === "fail") return "oklch(0.55 0.22 27)";
  return "oklch(0.35 0.03 240)";
}

function runColorFromRun(run: HealthRun): string {
  const total = run.passCount + run.failCount + run.slowCount;
  if (total === 0) return "oklch(0.30 0.03 240)";
  const passRate = run.passCount / total;
  if (passRate > 0.8) return "oklch(0.55 0.18 145)";
  if (passRate > 0.5) return "oklch(0.82 0.15 85)";
  return "oklch(0.55 0.22 27)";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HealthMonitor() {
  const { actor } = useActor(createActor);
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem("health_monitor_open") === "true";
    } catch {
      return false;
    }
  });
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<RouteCheck[]>(() => [
    ...FRONTEND_ROUTES.map((r) => ({
      ...r,
      type: "route" as const,
      status: "pending" as CheckStatus,
      responseTime: null,
    })),
    ...ENDPOINT_CHECKS.map((r) => ({
      ...r,
      type: "endpoint" as const,
      status: "pending" as CheckStatus,
      responseTime: null,
    })),
  ]);
  const [history, setHistory] = useState<HealthRun[]>(() => loadHistory());
  const [lastRun, setLastRun] = useState<number | null>(null);

  // Persist open state
  useEffect(() => {
    try {
      localStorage.setItem("health_monitor_open", String(open));
    } catch {
      // ignore
    }
  }, [open]);

  const runHealthCheck = async () => {
    if (running) return;
    setRunning(true);

    // Reset all to pending
    setChecks((prev) =>
      prev.map((c) => ({ ...c, status: "pending", responseTime: null })),
    );

    const results: RouteCheck[] = [];
    const baseUrl = window.location.origin;

    // Check frontend routes by fetching the root HTML and trusting the SPA is deployed
    // We test each route by fetching the base URL (SPA routes always return 200 for the index.html)
    // but we still measure roundtrip time which is meaningful for canister latency
    for (const route of FRONTEND_ROUTES) {
      const start = performance.now();
      let status: CheckStatus = "fail";
      let responseTime: number | null = null;
      try {
        const res = await fetch(`${baseUrl}${route.route}`, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        });
        responseTime = Math.round(performance.now() - start);
        if (res.ok || res.status === 200 || res.status === 304) {
          status = responseTime > SLOW_THRESHOLD_MS ? "slow" : "pass";
        } else {
          // SPA fallback — try GET for root
          const fallback = await fetch(baseUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
          });
          responseTime = Math.round(performance.now() - start);
          status = fallback.ok
            ? responseTime > SLOW_THRESHOLD_MS
              ? "slow"
              : "pass"
            : "fail";
        }
      } catch {
        responseTime = Math.round(performance.now() - start);
        status = "fail";
      }
      const result: RouteCheck = {
        label: route.label,
        route: route.route,
        type: "route",
        status,
        responseTime,
      };
      results.push(result);
      setChecks((prev) => {
        const next = [...prev];
        const idx = next.findIndex(
          (c) => c.route === route.route && c.type === "route",
        );
        if (idx !== -1) next[idx] = result;
        return next;
      });
    }

    // Check backend endpoints
    if (actor) {
      for (const ep of ENDPOINT_CHECKS) {
        const start = performance.now();
        let status: CheckStatus = "fail";
        let responseTime: number | null = null;
        try {
          if (ep.route === "getAllProviders") await actor.getAllProviders();
          else if (ep.route === "getTotalHandoffs")
            await actor.getTotalHandoffs();
          else if (ep.route === "getCanisterState")
            await actor.getCanisterState();
          else if (ep.route === "getMarketplaceGeoJSON")
            await actor.getMarketplaceGeoJSON();
          responseTime = Math.round(performance.now() - start);
          status = responseTime > SLOW_THRESHOLD_MS ? "slow" : "pass";
        } catch {
          responseTime = Math.round(performance.now() - start);
          status = "fail";
        }
        const result: RouteCheck = {
          label: ep.label,
          route: ep.route,
          type: "endpoint",
          status,
          responseTime,
        };
        results.push(result);
        setChecks((prev) => {
          const next = [...prev];
          const idx = next.findIndex(
            (c) => c.route === ep.route && c.type === "endpoint",
          );
          if (idx !== -1) next[idx] = result;
          return next;
        });
      }
    } else {
      // Actor not ready — mark endpoints as fail
      for (const ep of ENDPOINT_CHECKS) {
        const result: RouteCheck = {
          label: ep.label,
          route: ep.route,
          type: "endpoint",
          status: "fail",
          responseTime: null,
        };
        results.push(result);
        setChecks((prev) => {
          const next = [...prev];
          const idx = next.findIndex(
            (c) => c.route === ep.route && c.type === "endpoint",
          );
          if (idx !== -1) next[idx] = result;
          return next;
        });
      }
    }

    // Compute summary and save history
    const passCount = results.filter((r) => r.status === "pass").length;
    const failCount = results.filter((r) => r.status === "fail").length;
    const slowCount = results.filter((r) => r.status === "slow").length;
    const run: HealthRun = {
      timestamp: Date.now(),
      passCount,
      failCount,
      slowCount,
    };
    const updated = [...loadHistory(), run].slice(-20);
    saveHistory(updated);
    setHistory(updated);
    setLastRun(Date.now());
    setRunning(false);
  };

  const allChecks = checks;
  const passCount = allChecks.filter((c) => c.status === "pass").length;
  const failCount = allChecks.filter((c) => c.status === "fail").length;
  const slowCount = allChecks.filter((c) => c.status === "slow").length;
  const checkedCount = allChecks.filter((c) => c.status !== "pending").length;
  const passRate = checkedCount > 0 ? passCount / checkedCount : null;
  const _barColor =
    passRate === null
      ? "oklch(0.35 0.04 240)"
      : passRate > 0.8
        ? "oklch(0.55 0.18 145)"
        : passRate > 0.5
          ? "oklch(0.82 0.15 85)"
          : "oklch(0.55 0.22 27)";
  const barColor = _barColor;

  const routeChecks = allChecks.filter((c) => c.type === "route");
  const endpointChecks = allChecks.filter((c) => c.type === "endpoint");

  return (
    <div
      className="rounded-2xl overflow-hidden mb-8"
      style={{
        background: "oklch(0.13 0.03 240)",
        border: "1px solid oklch(0.22 0.05 240)",
      }}
      data-ocid="admin.health_monitor"
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-white/5 min-h-[56px]"
        aria-expanded={open}
        aria-controls="health-monitor-body"
        data-ocid="admin.toggle"
      >
        <Activity className="w-5 h-5 shrink-0" style={{ color: "#00ff88" }} />
        <span className="font-bold" style={{ color: "oklch(0.90 0.01 200)" }}>
          🔍 Health Monitor
        </span>
        {checkedCount > 0 && (
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background:
                passRate !== null && passRate > 0.8
                  ? "oklch(0.55 0.18 145 / 0.2)"
                  : "oklch(0.55 0.22 27 / 0.2)",
              color:
                passRate !== null && passRate > 0.8
                  ? "oklch(0.82 0.20 145)"
                  : "oklch(0.82 0.18 27)",
            }}
          >
            {passCount}/{checkedCount} passing
          </span>
        )}
        <span className="ml-auto" style={{ color: "oklch(0.50 0.03 220)" }}>
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {open && (
        <div id="health-monitor-body" className="px-6 pb-6 space-y-6">
          {/* Run Check button + summary */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
            <Button
              onClick={runHealthCheck}
              disabled={running}
              className="min-h-[44px] font-semibold"
              style={{
                background: running
                  ? "oklch(0.25 0.04 240)"
                  : "oklch(0.55 0.18 145)",
                color: "oklch(0.15 0.04 240)",
              }}
              data-ocid="admin.primary_button"
            >
              {running ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Running checks…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Run Health Check
                </>
              )}
            </Button>
            {lastRun && (
              <p className="text-xs" style={{ color: "oklch(0.45 0.03 220)" }}>
                Last run: {new Date(lastRun).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Pass/fail rate */}
          {checkedCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.70 0.05 220)" }}
                >
                  Pass rate
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.82 0.20 145)" }}
                >
                  {passCount} of {checkedCount} passing
                  {slowCount > 0 && (
                    <span style={{ color: "oklch(0.82 0.15 85)" }}>
                      {" "}
                      · {slowCount} slow
                    </span>
                  )}
                  {failCount > 0 && (
                    <span style={{ color: "oklch(0.82 0.18 27)" }}>
                      {" "}
                      · {failCount} failed
                    </span>
                  )}
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full overflow-hidden"
                style={{ background: "oklch(0.22 0.04 240)" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round((passCount / checkedCount) * 100)}%`,
                    background: barColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* Status grid — last 20 runs */}
          {history.length > 0 && (
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "oklch(0.55 0.03 220)" }}
              >
                Last {history.length} check{history.length > 1 ? "s" : ""}
              </p>
              <div
                className="flex items-center gap-1 flex-wrap"
                data-ocid="admin.list"
              >
                {history.map((run, i) => (
                  <div
                    key={`${run.timestamp}-${i}`}
                    title={`${new Date(run.timestamp).toLocaleString()} — ${run.passCount}✓ ${run.slowCount}~ ${run.failCount}✗`}
                    className="w-5 h-5 rounded-sm transition-transform hover:scale-125 cursor-default"
                    style={{ background: runColorFromRun(run) }}
                  />
                ))}
                {/* Fill remaining to 20 */}
                {Array.from(
                  { length: Math.max(0, 20 - history.length) },
                  (_, i) => {
                    const slotKey = `empty-slot-${history.length + i}`;
                    return (
                      <div
                        key={slotKey}
                        className="w-5 h-5 rounded-sm"
                        style={{ background: "oklch(0.20 0.03 240)" }}
                      />
                    );
                  },
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {(
                  [
                    { color: "oklch(0.55 0.18 145)", label: "All passing" },
                    {
                      color: "oklch(0.82 0.15 85)",
                      label: "Some slow/failing",
                    },
                    {
                      color: "oklch(0.55 0.22 27)",
                      label: "Failures detected",
                    },
                    { color: "oklch(0.20 0.03 240)", label: "Not yet run" },
                  ] as { color: string; label: string }[]
                ).map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ background: color }}
                    />
                    <span
                      className="text-[10px]"
                      style={{ color: "oklch(0.45 0.03 220)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Site flow map — Routes */}
          <div>
            <p
              className="text-xs font-bold mb-3 uppercase tracking-widest"
              style={{ color: "oklch(0.55 0.18 145)" }}
            >
              Frontend Routes
            </p>
            <div className="flex flex-wrap gap-2" data-ocid="admin.list">
              {routeChecks.map((check) => (
                <div
                  key={check.route}
                  title={
                    check.status === "pending"
                      ? "Not checked yet"
                      : `${check.status.toUpperCase()}${check.responseTime !== null ? ` · ${check.responseTime}ms` : ""}`
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: "oklch(0.17 0.03 240)",
                    border: `1px solid ${
                      check.status === "pending"
                        ? "oklch(0.25 0.04 240)"
                        : check.status === "pass"
                          ? "oklch(0.55 0.18 145 / 0.4)"
                          : check.status === "slow"
                            ? "oklch(0.82 0.15 85 / 0.4)"
                            : "oklch(0.55 0.22 27 / 0.4)"
                    }`,
                    color: "oklch(0.75 0.05 220)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: statusColor(check.status) }}
                  />
                  <span className="font-mono text-[11px]">{check.label}</span>
                  {check.responseTime !== null && (
                    <span
                      className="text-[10px] opacity-70"
                      style={{
                        color:
                          check.status === "slow"
                            ? "oklch(0.82 0.15 85)"
                            : check.status === "fail"
                              ? "oklch(0.82 0.18 27)"
                              : "oklch(0.55 0.03 220)",
                      }}
                    >
                      {check.responseTime}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Backend endpoints */}
          <div>
            <p
              className="text-xs font-bold mb-3 uppercase tracking-widest"
              style={{ color: "oklch(0.55 0.18 145)" }}
            >
              Backend Endpoints
            </p>
            <div className="flex flex-wrap gap-2" data-ocid="admin.list">
              {endpointChecks.map((check) => (
                <div
                  key={check.route}
                  title={
                    check.status === "pending"
                      ? "Not checked yet"
                      : `${check.status.toUpperCase()}${check.responseTime !== null ? ` · ${check.responseTime}ms` : ""}`
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                  style={{
                    background: "oklch(0.17 0.03 240)",
                    border: `1px solid ${
                      check.status === "pending"
                        ? "oklch(0.25 0.04 240)"
                        : check.status === "pass"
                          ? "oklch(0.55 0.18 145 / 0.5)"
                          : check.status === "slow"
                            ? "oklch(0.82 0.15 85 / 0.5)"
                            : "oklch(0.55 0.22 27 / 0.5)"
                    }`,
                    color: "oklch(0.75 0.05 220)",
                  }}
                >
                  {check.status === "pass" ? (
                    <CheckCircle2
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: "oklch(0.65 0.18 145)" }}
                    />
                  ) : check.status === "fail" ? (
                    <XCircle
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: "oklch(0.65 0.22 27)" }}
                    />
                  ) : check.status === "slow" ? (
                    <Activity
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: "oklch(0.82 0.15 85)" }}
                    />
                  ) : (
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ background: "oklch(0.35 0.03 240)" }}
                    />
                  )}
                  <span className="font-mono text-[11px]">{check.label}</span>
                  {check.responseTime !== null && (
                    <span
                      className="text-[10px] opacity-60"
                      style={{ color: "oklch(0.55 0.03 220)" }}
                    >
                      {check.responseTime}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div
            className="flex items-center gap-4 flex-wrap pt-1 border-t"
            style={{ borderColor: "oklch(0.20 0.04 240)" }}
          >
            {(
              [
                { color: "oklch(0.55 0.18 145)", label: "Pass" },
                {
                  color: "oklch(0.82 0.15 85)",
                  label: `Slow (>${SLOW_THRESHOLD_MS}ms)`,
                },
                { color: "oklch(0.55 0.22 27)", label: "Fail" },
                { color: "oklch(0.35 0.03 240)", label: "Pending" },
              ] as { color: string; label: string }[]
            ).map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: color }}
                />
                <span
                  className="text-[10px]"
                  style={{ color: "oklch(0.45 0.03 220)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px]" style={{ color: "oklch(0.38 0.03 220)" }}>
            ⓘ Route checks use HEAD requests against the deployed origin.
            Backend checks call canister query methods directly. History stored
            in this browser only.
          </p>
        </div>
      )}
    </div>
  );
}
