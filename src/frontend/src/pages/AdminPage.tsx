/**
 * AdminPage — 8-tab admin command center for Live Now Recovery.
 * Auth guard: useInternetIdentity() + useIsAdmin()
 * Tabs: Overview, Providers, Citizen Reports, Testimonials, Helpers, Fiscal Impact, Health Monitor, Prediction Engine
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BedDouble,
  CheckCircle2,
  Clock,
  Database,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Flag,
  Heart,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Settings,
  Shield,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type { Helper, ProviderWithStatus, TouchpointRecord } from "../backend";
import { HealthMonitor } from "../components/HealthMonitor";
import { ImpactOdometer } from "../components/ImpactOdometer";
import { PredictionEnginePanel } from "../components/PredictionEnginePanel";
import {
  useAllProviders,
  useApproveTestimonial,
  useFlagCitizenReport,
  useGetAllReports,
  useGetAllTestimonialsAdmin,
  useGetHelperCount,
  useHideTestimonial,
  useIsAdmin,
  useRegisterProvider,
  useSetProviderActiveStatus,
  useToggleLive,
  useVerifyProvider,
} from "../hooks/useQueries";
import { usePredictionEngineStore } from "../store/predictionEngineStore";
import type { CitizenReport, Testimonial } from "../types/community";
import { isProviderStale, statusLabel } from "../utils/providerUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab =
  | "overview"
  | "providers"
  | "reports"
  | "testimonials"
  | "helpers"
  | "fiscal"
  | "health"
  | "prediction";

type EmergencyStatus = "open_bed" | "72hr_bridge" | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVIDER_TYPE_COLORS: Record<string, string> = {
  MAT: "bg-emerald-900/40 text-emerald-400 border-emerald-700/40",
  "MAT Clinic": "bg-emerald-900/40 text-emerald-400 border-emerald-700/40",
  Narcan: "bg-amber-900/40 text-amber-400 border-amber-700/40",
  "Narcan Distribution": "bg-amber-900/40 text-amber-400 border-amber-700/40",
  ER: "bg-red-900/40 text-red-400 border-red-700/40",
  "Emergency Room": "bg-red-900/40 text-red-400 border-red-700/40",
  "Naloxone Kiosk": "bg-purple-900/40 text-purple-400 border-purple-700/40",
  "Telehealth MAT": "bg-indigo-900/40 text-indigo-400 border-indigo-700/40",
};

const REPORT_TYPE_COLORS: Record<string, string> = {
  "suspected-od": "bg-red-900/40 text-red-400 border-red-700/40",
  "narcan-used": "bg-amber-900/40 text-amber-400 border-amber-700/40",
  "bad-batch-alert": "bg-orange-900/40 text-orange-400 border-orange-700/40",
  "area-concern": "bg-purple-900/40 text-purple-400 border-purple-700/40",
  "check-in": "bg-emerald-900/40 text-emerald-400 border-emerald-700/40",
  "resource-found": "bg-teal-900/40 text-teal-400 border-teal-700/40",
  other: "bg-slate-700/40 text-slate-400 border-slate-600/40",
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  "suspected-od": "Suspected OD",
  "narcan-used": "Narcan Used",
  "bad-batch-alert": "Bad Batch Alert",
  "area-concern": "Area Concern",
  "check-in": "Check-In",
  "resource-found": "Resource Found",
  other: "Other",
};

// ─── Emergency helpers ────────────────────────────────────────────────────────

function getEmergencyStatus(
  id: string,
): { status: EmergencyStatus; setAt: number } | null {
  try {
    const bridgeRaw = localStorage.getItem(`bridge_active_${id}`);
    if (bridgeRaw) {
      const parsed = JSON.parse(bridgeRaw) as { expiresAt: number };
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(`bridge_active_${id}`);
        return null;
      }
      return { status: "72hr_bridge", setAt: parsed.expiresAt - 72 * 3600000 };
    }
    const raw = localStorage.getItem(`emergency_status_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      status: EmergencyStatus;
      setAt: number;
    };
    if (Date.now() - parsed.setAt > 72 * 60 * 60 * 1000) {
      localStorage.removeItem(`emergency_status_${id}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function _setEmergencyStatus(id: string, status: EmergencyStatus) {
  if (!status) {
    localStorage.removeItem(`emergency_status_${id}`);
    localStorage.removeItem(`bridge_active_${id}`);
  } else if (status === "72hr_bridge") {
    localStorage.setItem(
      `bridge_active_${id}`,
      JSON.stringify({ expiresAt: Date.now() + 72 * 3600000 }),
    );
  } else {
    localStorage.setItem(
      `emergency_status_${id}`,
      JSON.stringify({ status, setAt: Date.now() }),
    );
  }
}

function isERProvider(p: { name: string; providerType?: string }): boolean {
  const type = p.providerType ?? "";
  if (type === "ER" || type === "Emergency Room") return true;
  const lower = p.name.toLowerCase();
  return (
    lower.includes(" er") ||
    lower.includes("emergency") ||
    lower.includes("hospital") ||
    lower.includes("bridge")
  );
}

function formatCountdown(setAt: number): string {
  const elapsed = Date.now() - setAt;
  const remaining = 72 * 60 * 60 * 1000 - elapsed;
  if (remaining <= 0) return "Expired";
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m remaining`;
}

function formatTime(ts: bigint | number): string {
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  { id: "providers", label: "Providers", icon: <Shield className="w-4 h-4" /> },
  {
    id: "reports",
    label: "Citizen Reports",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  { id: "helpers", label: "Helpers", icon: <Users className="w-4 h-4" /> },
  {
    id: "fiscal",
    label: "Fiscal Impact",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: "health",
    label: "Health Monitor",
    icon: <Heart className="w-4 h-4" />,
  },
  {
    id: "prediction",
    label: "Prediction Engine",
    icon: <Zap className="w-4 h-4" />,
  },
];

const SEED_PROVIDERS = [
  {
    id: "seed-mat-001",
    name: "Signature Health – Cleveland",
    lat: 41.4849,
    lng: -81.7984,
    providerType: "MAT",
  },
  {
    id: "seed-mat-002",
    name: "FrontLine Service – Broadway",
    lat: 41.4578,
    lng: -81.6645,
    providerType: "MAT",
  },
  {
    id: "seed-mat-003",
    name: "Oriana House – Akron",
    lat: 41.0814,
    lng: -81.519,
    providerType: "MAT",
  },
  {
    id: "seed-mat-004",
    name: "Cornerstone of Recovery – Akron",
    lat: 41.057,
    lng: -81.5544,
    providerType: "MAT",
  },
  {
    id: "seed-mat-005",
    name: "Meridian Health Services – Youngstown",
    lat: 41.0891,
    lng: -80.6551,
    providerType: "MAT",
  },
  {
    id: "seed-mat-006",
    name: "Signature Health – Elyria",
    lat: 41.3683,
    lng: -82.1077,
    providerType: "MAT",
  },
  {
    id: "seed-narcan-001",
    name: "AIDS Taskforce of Greater Cleveland",
    lat: 41.5078,
    lng: -81.6621,
    providerType: "Narcan",
  },
  {
    id: "seed-narcan-002",
    name: "Community Health Center of Akron",
    lat: 41.08,
    lng: -81.4967,
    providerType: "Narcan",
  },
  {
    id: "seed-narcan-003",
    name: "Mahoning County Public Health",
    lat: 41.1119,
    lng: -80.728,
    providerType: "Narcan",
  },
  {
    id: "seed-narcan-004",
    name: "Stark County Health Dept – North Canton",
    lat: 40.8756,
    lng: -81.4234,
    providerType: "Narcan",
  },
  {
    id: "seed-narcan-005",
    name: "Lorain County Health & Dentistry",
    lat: 41.4534,
    lng: -82.1824,
    providerType: "Narcan",
  },
  {
    id: "seed-narcan-006",
    name: "Quest Recovery – Canton Narcan Dist.",
    lat: 40.7735,
    lng: -81.3859,
    providerType: "Narcan",
  },
  {
    id: "seed-er-001",
    name: "MetroHealth Medical Center ER",
    lat: 41.4714,
    lng: -81.6997,
    providerType: "ER",
  },
  {
    id: "seed-er-002",
    name: "Cleveland Clinic Main Campus ER",
    lat: 41.5036,
    lng: -81.6203,
    providerType: "ER",
  },
  {
    id: "seed-er-003",
    name: "Summa Health – Akron City Hospital ER",
    lat: 41.0839,
    lng: -81.5063,
    providerType: "ER",
  },
  {
    id: "seed-er-004",
    name: "St. Elizabeth Youngstown Hospital ER",
    lat: 41.1064,
    lng: -80.6639,
    providerType: "ER",
  },
  {
    id: "seed-er-005",
    name: "Aultman Hospital ER – Canton",
    lat: 40.782,
    lng: -81.4191,
    providerType: "ER",
  },
  {
    id: "seed-er-006",
    name: "UH Elyria Medical Center ER",
    lat: 41.37,
    lng: -82.1035,
    providerType: "ER",
  },
  {
    id: "seed-kiosk-001",
    name: "The Centers Ohio Kiosk – Payne Ave Cleveland",
    lat: 41.508,
    lng: -81.6537,
    providerType: "Naloxone Kiosk",
  },
  {
    id: "seed-kiosk-002",
    name: "The Centers Ohio Kiosk – Superior Ave Cleveland",
    lat: 41.5312,
    lng: -81.6218,
    providerType: "Naloxone Kiosk",
  },
  {
    id: "seed-kiosk-003",
    name: "The Centers Ohio Kiosk – Sherman Ave Akron",
    lat: 41.0754,
    lng: -81.5124,
    providerType: "Naloxone Kiosk",
  },
  {
    id: "seed-kiosk-004",
    name: "Massillon Police Dept Naloxone Kiosk",
    lat: 40.7962,
    lng: -81.5218,
    providerType: "Naloxone Kiosk",
  },
  {
    id: "seed-kiosk-005",
    name: "Jackson Township Police Naloxone Kiosk",
    lat: 40.8329,
    lng: -81.5457,
    providerType: "Naloxone Kiosk",
  },
  {
    id: "seed-telehealth-001",
    name: "Spero Health Ohio – Telehealth",
    lat: 41.4993,
    lng: -81.6944,
    providerType: "Telehealth MAT",
  },
  {
    id: "seed-telehealth-002",
    name: "Eagle HealthWorks – Telehealth MAT",
    lat: 41.0534,
    lng: -81.519,
    providerType: "Telehealth MAT",
  },
];

// ─── Sub-tab components ───────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  color = "text-foreground",
  isLoading = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  isLoading?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-card rounded-2xl border border-border p-5 text-left hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-ocid="admin.metric_card"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      )}
    </button>
  );
}

function ProviderTypeBadge({ type }: { type: string }) {
  const cls =
    PROVIDER_TYPE_COLORS[type] ??
    "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}
    >
      {type}
    </span>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({
  providers,
  setTab,
}: {
  providers: ProviderWithStatus[];
  setTab: (t: AdminTab) => void;
}) {
  const { data: allReports = [] } = useGetAllReports();
  const { data: allTestimonials = [] } = useGetAllTestimonialsAdmin();
  const { data: helperCount, isLoading: helperLoading } = useGetHelperCount();
  const fiscalData = usePredictionEngineStore((s) => s.fiscalData);

  const activeProviders = providers.filter((p) => p.is_active).length;
  const pendingVerifications = providers.filter((p) => !p.is_verified).length;
  const pendingTestimonials = allTestimonials.filter(
    (t) => !t.isApproved && !t.isHidden,
  ).length;
  const approvedTestimonials = allTestimonials.filter(
    (t) => t.isApproved,
  ).length;

  const dollarsSaved = fiscalData.totalDollarsSaved;

  return (
    <div className="space-y-8" data-ocid="admin.overview_tab">
      {/* Metric grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={<Shield className="w-4 h-4" />}
          label="Active Providers"
          value={activeProviders}
          color="text-emerald-400"
          onClick={() => setTab("providers")}
        />
        <MetricCard
          icon={<ShieldCheck className="w-4 h-4" />}
          label="Pending Verification"
          value={pendingVerifications}
          color={
            pendingVerifications > 0
              ? "text-amber-400"
              : "text-muted-foreground"
          }
          onClick={() => setTab("providers")}
        />
        <MetricCard
          icon={<Activity className="w-4 h-4" />}
          label="Citizen Reports"
          value={allReports.length}
          color="text-blue-400"
          onClick={() => setTab("reports")}
        />
        <MetricCard
          icon={<MessageSquare className="w-4 h-4" />}
          label="Pending Testimonials"
          value={pendingTestimonials}
          color={
            pendingTestimonials > 0 ? "text-amber-400" : "text-muted-foreground"
          }
          onClick={() => setTab("testimonials")}
        />
        <MetricCard
          icon={<Users className="w-4 h-4" />}
          label="Total Helpers"
          value={helperLoading ? "…" : Number(helperCount ?? 0n)}
          color="text-purple-400"
          isLoading={helperLoading}
          onClick={() => setTab("helpers")}
        />
        <MetricCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Dollars Saved"
          value={`$${(dollarsSaved / 1000).toFixed(0)}K`}
          color="text-emerald-400"
          onClick={() => setTab("fiscal")}
        />
      </div>

      {/* Quick status grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider breakdown */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-live-green" />
              <h3 className="font-semibold text-foreground">
                Provider Breakdown
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setTab("providers")}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View all →
            </button>
          </div>
          {(
            ["MAT", "Narcan", "ER", "Naloxone Kiosk", "Telehealth MAT"] as const
          ).map((type) => {
            const count = providers.filter(
              (p) =>
                p.providerType === type ||
                (type === "MAT" && p.providerType === "MAT Clinic"),
            ).length;
            const active = providers.filter(
              (p) =>
                (p.providerType === type ||
                  (type === "MAT" && p.providerType === "MAT Clinic")) &&
                p.is_active,
            ).length;
            return (
              <div
                key={type}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <ProviderTypeBadge type={type} />
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-emerald-400 font-medium">
                    {active} active
                  </span>
                  <span className="text-muted-foreground">/ {count} total</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials snapshot */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-live-green" />
              <h3 className="font-semibold text-foreground">Testimonials</h3>
            </div>
            <button
              type="button"
              onClick={() => setTab("testimonials")}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Moderate →
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Pending review
              </span>
              <span
                className={`font-bold ${pendingTestimonials > 0 ? "text-amber-400" : "text-muted-foreground"}`}
              >
                {pendingTestimonials}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Approved stories
              </span>
              <span className="font-bold text-emerald-400">
                {approvedTestimonials}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Total submitted
              </span>
              <span className="font-bold text-foreground">
                {allTestimonials.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System quick actions */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-live-green" />
          <h3 className="font-semibold text-foreground">Quick Navigation</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TABS.slice(1).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium text-foreground transition-colors border border-border"
              data-ocid={`admin.tab_nav_${tab.id}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Providers ───────────────────────────────────────────────────────────

function ProvidersTab({ providers }: { providers: ProviderWithStatus[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [seedProgress, setSeedProgress] = useState({
    running: false,
    done: 0,
    total: SEED_PROVIDERS.length,
  });

  const verifyProvider = useVerifyProvider();
  const setActiveStatus = useSetProviderActiveStatus();
  const toggleLive = useToggleLive();
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  // Bridge status
  const { data: bridgeStatus, isLoading: bridgeLoading } = useQuery({
    queryKey: ["emergencyBridgeStatus"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getEmergencyBridgeStatus();
    },
    enabled: !!actor,
    refetchInterval: 30_000,
  });
  const [bridgeActing, setBridgeActing] = useState(false);
  const bridgeActivatedAtMs =
    bridgeStatus?.isActive && bridgeStatus.activatedAt
      ? Number(bridgeStatus.activatedAt) / 1_000_000
      : null;

  // Sync per-ER emergency statuses from backend bridge status
  useEffect(() => {
    for (const p of providers) {
      if (
        bridgeStatus?.isActive &&
        bridgeActivatedAtMs &&
        isERProvider({ name: p.name, providerType: p.providerType })
      ) {
        const existing = getEmergencyStatus(p.id);
        if (!existing || existing.status !== "open_bed") {
          _setEmergencyStatus(p.id, "72hr_bridge");
        }
      }
    }
  }, [providers, bridgeStatus, bridgeActivatedAtMs]);

  const handleGlobalBridgeToggle = async (activate: boolean) => {
    if (!actor) return;
    setBridgeActing(true);
    try {
      await actor.setEmergencyActive(activate);
      if (activate) {
        localStorage.setItem(
          "bridge_active_global",
          JSON.stringify({ expiresAt: Date.now() + 72 * 3_600_000 }),
        );
      } else {
        localStorage.removeItem("bridge_active_global");
      }
      await qc.invalidateQueries({ queryKey: ["emergencyBridgeStatus"] });
      toast.success(
        activate
          ? "72-Hour Bridge activated on-chain."
          : "Bridge status cleared.",
      );
    } catch {
      toast.error("Failed to update bridge status. Admin access required.");
    } finally {
      setBridgeActing(false);
    }
  };

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      search === "" || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      p.providerType === typeFilter ||
      (typeFilter === "MAT" && p.providerType === "MAT Clinic");
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.is_active) ||
      (statusFilter === "inactive" && !p.is_active) ||
      (statusFilter === "unverified" && !p.is_verified);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    setApprovingIds((prev) => new Set(prev).add(id));
    try {
      await verifyProvider.mutateAsync(id);
      toast.success("Provider verified and now live on map");
    } catch {
      toast.error("Verification failed.");
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await setActiveStatus.mutateAsync({ id, status: !current });
      toast.success(`Provider ${!current ? "activated" : "suspended"}`);
    } catch {
      toast.error("Toggle failed.");
    }
  };

  const handleSeedDemoData = async () => {
    if (!actor) return;
    setSeedProgress({ running: true, done: 0, total: SEED_PROVIDERS.length });
    let done = 0;
    for (const p of SEED_PROVIDERS) {
      try {
        await (
          actor as unknown as Record<
            string,
            (...args: unknown[]) => Promise<void>
          >
        ).registerProvider(p.id, p.name, p.lat, p.lng, p.providerType);
        await toggleLive.mutateAsync({ id: p.id, status: true });
        done++;
        setSeedProgress((prev) => ({ ...prev, done }));
      } catch {
        done++;
        setSeedProgress((prev) => ({ ...prev, done }));
      }
    }
    setSeedProgress((prev) => ({ ...prev, running: false }));
    toast.success(`Seeded ${done} of ${SEED_PROVIDERS.length} Ohio providers`);
    qc.invalidateQueries({ queryKey: ["allProviders"] });
  };

  const pendingVerifications = providers.filter((p) => !p.is_verified);

  return (
    <div className="space-y-6" data-ocid="admin.providers_tab">
      {/* Pending Verifications */}
      {pendingVerifications.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-700/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-amber-300">
              Pending Verification
            </h3>
            <Badge className="ml-auto bg-amber-900/50 text-amber-400 border-amber-700/40 text-xs">
              {pendingVerifications.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {pendingVerifications.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-card/50 rounded-xl px-4 py-3"
                data-ocid={`admin.pending_item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground">ID: {p.id}</p>
                </div>
                <ProviderTypeBadge type={p.providerType} />
                <Button
                  size="sm"
                  disabled={approvingIds.has(p.id)}
                  onClick={() => handleApprove(p.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold min-h-[36px]"
                  data-ocid={`admin.approve_button.${i + 1}`}
                >
                  {approvingIds.has(p.id) ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Make Live"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 72-Hour Bridge Toggle */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <BedDouble className="w-4 h-4 text-amber-400" />
            <div>
              <p className="font-semibold text-foreground">
                72-Hour Bridge Status
              </p>
              <p className="text-xs text-muted-foreground">
                Federal ER buprenorphine bridge — stored on-chain, expires in
                72h
              </p>
            </div>
          </div>
          {bridgeStatus?.isActive ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {bridgeLoading ? "…" : "ACTIVE"}
                {bridgeActivatedAtMs && (
                  <span className="text-amber-600 text-xs">
                    · {formatCountdown(bridgeActivatedAtMs)}
                  </span>
                )}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGlobalBridgeToggle(false)}
                disabled={bridgeActing}
                className="border-amber-700/40 text-amber-400 hover:bg-amber-950/40"
                data-ocid="admin.bridge_deactivate"
              >
                {bridgeActing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Deactivate"
                )}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => handleGlobalBridgeToggle(true)}
              disabled={bridgeActing || bridgeLoading}
              className="bg-amber-600 hover:bg-amber-500 text-white"
              data-ocid="admin.bridge_activate"
            >
              {bridgeActing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Activate Bridge
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Seed + Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search providers by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-h-[40px]"
          data-ocid="admin.provider_search"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-ocid="admin.type_filter"
        >
          <option value="all">All Types</option>
          <option value="MAT">MAT Clinic</option>
          <option value="Narcan">Narcan Distribution</option>
          <option value="ER">Emergency Room</option>
          <option value="Naloxone Kiosk">Naloxone Kiosk</option>
          <option value="Telehealth MAT">Telehealth MAT</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-ocid="admin.status_filter"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="unverified">Unverified</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedDemoData}
          disabled={seedProgress.running || !actor}
          className="min-h-[40px] whitespace-nowrap"
          data-ocid="admin.seed_button"
        >
          {seedProgress.running ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              {seedProgress.done}/{seedProgress.total}
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 mr-1.5" />
              Seed Ohio Providers
            </>
          )}
        </Button>
      </div>

      {/* Provider table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {filteredProviders.length} providers
          </span>
        </div>
        {filteredProviders.length === 0 ? (
          <div className="p-12 text-center" data-ocid="admin.providers_empty">
            <Shield className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              No providers match your filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Verified
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Rep.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Last Seen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProviders.map((p, i) => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/30 transition-colors"
                    data-ocid={`admin.provider_row.${i + 1}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-[200px]">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.id.slice(0, 12)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ProviderTypeBadge type={p.providerType} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700/40" : "bg-muted text-muted-foreground border border-border"}`}
                      >
                        {p.is_active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${p.is_verified ? "text-emerald-400" : "text-amber-400"}`}
                      >
                        {p.is_verified ? "✓ Verified" : "⚠ Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-muted-foreground">
                        {Number(p.reputationScore)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {isProviderStale(p.lastVerified)
                          ? "Stale"
                          : statusLabel(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p.id, p.is_active)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${p.is_active ? "border-red-700/40 text-red-400 hover:bg-red-950/30" : "border-emerald-700/40 text-emerald-400 hover:bg-emerald-950/30"}`}
                          data-ocid={`admin.toggle_active.${i + 1}`}
                        >
                          {p.is_active ? "Suspend" : "Activate"}
                        </button>
                        {!p.is_verified && (
                          <button
                            type="button"
                            onClick={() => handleApprove(p.id)}
                            disabled={approvingIds.has(p.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-emerald-700/40 text-emerald-400 hover:bg-emerald-950/30 transition-colors"
                            data-ocid={`admin.verify_button.${i + 1}`}
                          >
                            {approvingIds.has(p.id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </button>
                        )}
                        <Link
                          to="/provider/$id"
                          params={{ id: p.id }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                          data-ocid={`admin.view_provider.${i + 1}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Citizen Reports ─────────────────────────────────────────────────────

function CitizenReportsTab() {
  const { data: reports = [], isLoading } = useGetAllReports();
  const flagReport = useFlagCitizenReport();
  const [typeFilter, setTypeFilter] = useState("all");
  const [flaggingIds, setFlaggingIds] = useState<Set<string>>(new Set());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredReports = reports.filter(
    (r: CitizenReport) => typeFilter === "all" || r.activityType === typeFilter,
  );

  const reportsToday = reports.filter((r: CitizenReport) => {
    const ts =
      typeof r.createdAt === "bigint"
        ? Number(r.createdAt) / 1_000_000
        : r.createdAt;
    return ts >= today.getTime();
  }).length;

  const byType = reports.reduce<Record<string, number>>(
    (acc, r: CitizenReport) => {
      const key = r.activityType ?? "other";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const handleFlag = async (id: string) => {
    setFlaggingIds((prev) => new Set(prev).add(id));
    try {
      await flagReport.mutateAsync(id);
      toast.success("Report flagged and removed");
    } catch {
      toast.error("Failed to flag report");
    } finally {
      setFlaggingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6" data-ocid="admin.reports_tab">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-foreground">{reports.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Reports</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-blue-400">{reportsToday}</p>
          <p className="text-xs text-muted-foreground mt-1">Reports Today</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-red-400">
            {byType["suspected-od"] ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Suspected ODs</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-amber-400">
            {byType["narcan-used"] ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Narcan Used</p>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-3 text-sm">
          Reports by Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byType).map(([type, count]: [string, number]) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium ${REPORT_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground border-border"}`}
            >
              {REPORT_TYPE_LABELS[type] ?? type}
              <span className="font-bold">{count}</span>
            </span>
          ))}
          {Object.keys(byType).length === 0 && (
            <span className="text-sm text-muted-foreground">
              No reports yet
            </span>
          )}
        </div>
      </div>

      {/* Filter + table */}
      <div className="flex items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-ocid="admin.report_type_filter"
        >
          <option value="all">All Types</option>
          {Object.entries(REPORT_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {filteredReports.length} showing
        </span>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center" data-ocid="admin.reports_empty">
            <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">No citizen reports yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReports.map((report: CitizenReport, i: number) => (
              <div
                key={report.id}
                className="px-5 py-4 flex gap-4"
                data-ocid={`admin.report_row.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${REPORT_TYPE_COLORS[report.activityType] ?? "bg-muted text-muted-foreground border-border"}`}
                    >
                      {REPORT_TYPE_LABELS[report.activityType] ??
                        report.activityType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ZIP {report.zipCode}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {formatTime(report.createdAt)}
                    </span>
                    <span className="text-xs text-blue-400 ml-auto">
                      ↑ {Number(report.upvotes)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {report.content || "No content provided"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFlag(report.id)}
                  disabled={flaggingIds.has(report.id)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-700/40 text-red-400 hover:bg-red-950/30 transition-colors min-h-[36px]"
                  data-ocid={`admin.flag_button.${i + 1}`}
                >
                  {flaggingIds.has(report.id) ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Flag className="w-3 h-3" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Testimonials ────────────────────────────────────────────────────────

function TestimonialsTab() {
  const { data: testimonials = [], isLoading } = useGetAllTestimonialsAdmin();
  const approveTestimonial = useApproveTestimonial();
  const hideTestimonial = useHideTestimonial();
  const [actingIds, setActingIds] = useState<Set<string>>(new Set());

  const pending = testimonials.filter(
    (t: Testimonial) => !t.isApproved && !t.isHidden,
  );
  const approved = testimonials.filter(
    (t: Testimonial) => t.isApproved && !t.isHidden,
  );

  const act = async (id: string, action: "approve" | "hide") => {
    setActingIds((prev) => new Set(prev).add(id));
    try {
      if (action === "approve") {
        await approveTestimonial.mutateAsync(id);
        toast.success("Story approved and published");
      } else {
        await hideTestimonial.mutateAsync(id);
        toast.success("Story hidden");
      }
    } catch {
      toast.error(`Failed to ${action} testimonial`);
    } finally {
      setActingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const TestimonialCard = ({
    t,
    showApprove,
  }: { t: Testimonial; showApprove: boolean }) => (
    <div
      className="bg-card/60 rounded-xl border border-border p-4 space-y-2"
      data-ocid="admin.testimonial_card"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground text-sm">
            {t.authorDisplayName || "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground">
            ZIP {t.zipCode} · {formatTime(t.createdAt)}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {showApprove && (
            <button
              type="button"
              onClick={() => act(t.id, "approve")}
              disabled={actingIds.has(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 hover:bg-emerald-900/60 transition-colors min-h-[32px]"
              data-ocid="admin.approve_testimonial"
            >
              {actingIds.has(t.id) ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Approve
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => act(t.id, "hide")}
            disabled={actingIds.has(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-red-400 hover:border-red-700/40 transition-colors min-h-[32px]"
            data-ocid="admin.hide_testimonial"
          >
            <X className="w-3 h-3" />
            Hide
          </button>
        </div>
      </div>
      <p className="text-sm text-foreground/80 line-clamp-3">{t.content}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8" data-ocid="admin.testimonials_tab">
      {/* Pending queue */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="font-semibold text-foreground">Pending Moderation</h3>
          <Badge className="bg-amber-900/40 text-amber-400 border-amber-700/40 text-xs">
            {pending.length}
          </Badge>
        </div>
        {pending.length === 0 ? (
          <div
            className="bg-card rounded-xl border border-border p-8 text-center"
            data-ocid="admin.pending_testimonials_empty"
          >
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400/60" />
            <p className="text-sm text-muted-foreground">
              Moderation queue is clear
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((t: Testimonial) => (
              <TestimonialCard key={t.id} t={t} showApprove={true} />
            ))}
          </div>
        )}
      </div>

      {/* Approved */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-foreground">Approved Stories</h3>
          <Badge className="bg-emerald-900/40 text-emerald-400 border-emerald-700/40 text-xs">
            {approved.length}
          </Badge>
        </div>
        {approved.length === 0 ? (
          <div
            className="bg-card rounded-xl border border-border p-8 text-center"
            data-ocid="admin.approved_testimonials_empty"
          >
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No approved stories yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map((t: Testimonial) => (
              <TestimonialCard key={t.id} t={t} showApprove={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Helpers ─────────────────────────────────────────────────────────────

function HelpersTab() {
  const { actor, isFetching } = useActor(createActor);
  const { data: helpers = [], isLoading } = useQuery<Helper[]>({
    queryKey: ["allHelpers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllHelpers();
      } catch (err) {
        console.error("[getAllHelpers] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  const handleExportCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "ZIP",
      "Help Type",
      "Signup Date",
    ];
    const rows = helpers.map((h) => [
      h.firstName,
      h.lastName,
      h.email,
      h.zip,
      h.helpType,
      formatTime(h.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `helpers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${helpers.length} helpers to CSV`);
  };

  return (
    <div className="space-y-6" data-ocid="admin.helpers_tab">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-card rounded-xl border border-border px-4 py-3">
            <p className="text-2xl font-bold text-purple-400">
              {helpers.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total Volunteers
            </p>
          </div>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={helpers.length === 0}
          variant="outline"
          size="sm"
          className="min-h-[40px]"
          data-ocid="admin.export_csv"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : helpers.length === 0 ? (
          <div className="p-12 text-center" data-ocid="admin.helpers_empty">
            <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">No volunteer signups yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    ZIP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Help Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Signed Up
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {helpers.map((h, i) => (
                  <tr
                    key={h.id || `${h.email}-${i}`}
                    className="hover:bg-muted/30 transition-colors"
                    data-ocid={`admin.helper_row.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {h.firstName} {h.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {h.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{h.zip}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/40 text-purple-400 border border-purple-700/40">
                        {h.helpType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatTime(h.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Fiscal Impact ───────────────────────────────────────────────────────

function FiscalImpactTab() {
  const { actor, isFetching } = useActor(createActor);
  const fiscalData = usePredictionEngineStore((s) => s.fiscalData);

  const { data: touchpointData = [], isLoading: touchpointLoading } = useQuery<
    TouchpointRecord[]
  >({
    queryKey: ["touchpointData"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTouchpointData();
      } catch (err) {
        console.error("[getTouchpointData] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-8" data-ocid="admin.fiscal_tab">
      {/* ImpactOdometer embedded */}
      <ImpactOdometer
        dollarsSaved={fiscalData.totalDollarsSaved}
        livesSaved={fiscalData.livesSaved}
        communityReinvestmentFund={fiscalData.communityReinvestmentFund}
        stabilityPipelinePercent={fiscalData.stabilityPipelinePercent}
      />

      {/* Touchpoint progression table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-live-green" />
          <h3 className="font-semibold text-foreground">
            Stability Pipeline — Agent Progression
          </h3>
          <Badge className="ml-auto bg-muted text-muted-foreground border-border text-xs">
            {touchpointData.length} agents
          </Badge>
        </div>
        {touchpointLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : touchpointData.length === 0 ? (
          <div className="p-12 text-center" data-ocid="admin.touchpoint_empty">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              Touchpoint data builds as the simulation runs
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Enable Simulation in the Prediction Engine tab to generate data
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Agent ID
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Touchpoints
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Total Saved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {touchpointData.map((record, i) => (
                  <tr
                    key={record.agentId}
                    className="hover:bg-muted/30 transition-colors"
                    data-ocid={`admin.touchpoint_row.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {record.agentId.slice(0, 12)}…
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: 7 }, (_, idx) => (
                          <span
                            key={`tp-${record.agentId}-${idx}`}
                            className={`w-3 h-3 rounded-sm ${idx < Number(record.touchpoints) ? "bg-emerald-500" : "bg-muted"}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {record.isStabilized ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-700/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Stabilized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900/40 text-amber-400 border border-amber-700/40">
                          <Clock className="w-3 h-3" />
                          In Progress ({Number(record.touchpoints)}/7)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-400">
                      ${record.totalSaved.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Register Provider Panel ───────────────────────────────────────────────────

function RegisterProviderPanel() {
  const registerProvider = useRegisterProvider();
  const [form, setForm] = useState({
    id: "",
    name: "",
    lat: "",
    lng: "",
    providerType: "MAT Clinic",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerProvider.mutateAsync({
        id: form.id,
        name: form.name,
        lat: Number.parseFloat(form.lat),
        lng: Number.parseFloat(form.lng),
        providerType: form.providerType,
      });
      toast.success("Provider registered!");
      setForm({
        id: "",
        name: "",
        lat: "",
        lng: "",
        providerType: "MAT Clinic",
      });
    } catch {
      toast.error("Registration failed. Admin access required.");
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <Plus className="w-4 h-4 text-live-green" />
        <h3 className="font-semibold text-foreground">Register New Provider</h3>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reg-id">Provider ID</Label>
            <Input
              id="reg-id"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              placeholder="provider-001"
              className="mt-1 min-h-[44px]"
              required
              data-ocid="admin.provider_id_input"
            />
          </div>
          <div>
            <Label htmlFor="reg-name">Provider Name</Label>
            <Input
              id="reg-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Brightside Health — Cleveland"
              className="mt-1 min-h-[44px]"
              required
              data-ocid="admin.provider_name_input"
            />
          </div>
          <div>
            <Label htmlFor="reg-lat">Latitude</Label>
            <Input
              id="reg-lat"
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
              placeholder="41.48"
              className="mt-1 min-h-[44px]"
              required
              data-ocid="admin.provider_lat_input"
            />
          </div>
          <div>
            <Label htmlFor="reg-lng">Longitude</Label>
            <Input
              id="reg-lng"
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
              placeholder="-81.74"
              className="mt-1 min-h-[44px]"
              required
              data-ocid="admin.provider_lng_input"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="reg-type">Provider Type</Label>
          <select
            id="reg-type"
            value={form.providerType}
            onChange={(e) =>
              setForm((f) => ({ ...f, providerType: e.target.value }))
            }
            className="mt-1 w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            data-ocid="admin.provider_type_select"
          >
            <option value="MAT Clinic">MAT Clinic</option>
            <option value="Narcan Distribution">Narcan Distribution</option>
            <option value="Emergency Room">Emergency Room</option>
            <option value="Naloxone Kiosk">Naloxone Kiosk (24/7)</option>
            <option value="Telehealth MAT">Telehealth MAT</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          ⚠ No ZIP code, no PHI stored.
        </p>
        <Button
          type="submit"
          disabled={registerProvider.isPending}
          className="w-full min-h-[44px] bg-live-green hover:bg-live-green/90 text-navy font-semibold"
          data-ocid="admin.register_provider_submit"
        >
          {registerProvider.isPending ? "Registering…" : "Register Provider"}
        </Button>
      </form>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export function AdminPage() {
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: providers = [] } = useAllProviders();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const principalText = identity?.getPrincipal().toText() ?? "";

  // ── Auth states ──────────────────────────────────────────────────────────

  if (loginStatus === "logging-in") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Signing in…</p>
        </div>
      </div>
    );
  }

  if (loginStatus !== "success") {
    return (
      <main className="min-h-screen" data-ocid="admin.page">
        <section className="bg-card border-b border-border px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-live-green" />
              <p className="text-xs font-bold uppercase tracking-widest text-live-green">
                Admin
              </p>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Admin <span className="text-live-green">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Provider verification, reporting, fiscal analytics, and system
              controls.
            </p>
          </div>
        </section>
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-6">
          <div
            className="w-full max-w-md rounded-2xl p-8 text-center flex flex-col items-center gap-5"
            style={{
              background: "oklch(0.18 0.012 218 / 0.5)",
              border: "2px solid oklch(0.68 0.1 218 / 0.6)",
              boxShadow: "0 0 32px oklch(0.68 0.1 218 / 0.15)",
            }}
          >
            <Lock
              className="w-10 h-10"
              style={{ color: "oklch(0.68 0.1 218)" }}
            />
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Sign in to continue
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Authenticate with Internet Identity to access the admin
                dashboard. Make sure popups are allowed in your browser.
              </p>
            </div>
            <Button
              onClick={() => login()}
              className="min-h-[48px] w-full font-semibold text-base px-8"
              style={{
                background: "oklch(0.68 0.1 218)",
                color: "oklch(0.14 0.008 240)",
              }}
              data-ocid="admin.primary_button"
            >
              Sign In with Internet Identity
            </Button>
            {loginStatus === "loginError" && (
              <p className="text-sm text-destructive text-center max-w-xs">
                Sign in failed. Make sure popups are allowed, then try again.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">
            Verifying admin access…
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen" data-ocid="admin.page">
        <section className="bg-card border-b border-border px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Admin <span className="text-live-green">Dashboard</span>
            </h1>
          </div>
        </section>
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-6">
          <div
            className="w-full max-w-md rounded-2xl p-6 text-center flex flex-col items-center gap-4"
            style={{
              background: "oklch(0.18 0.012 218 / 0.5)",
              border: "2px solid oklch(0.68 0.1 218 / 0.6)",
              boxShadow: "0 0 24px oklch(0.68 0.1 218 / 0.12)",
            }}
          >
            <Lock
              className="w-10 h-10"
              style={{ color: "oklch(0.68 0.1 218)" }}
            />
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Not Authorized
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Your Internet Identity does not have admin privileges. If you
                believe this is an error, ensure you are signed in with the
                correct identity.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => clear()}
              className="min-h-[40px]"
              style={{
                borderColor: "oklch(0.68 0.1 218 / 0.5)",
                color: "oklch(0.68 0.1 218)",
              }}
            >
              Sign Out &amp; Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // ── Authorized admin view ────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background" data-ocid="admin.page">
      {/* Header */}
      <section className="bg-card border-b border-border px-4 py-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-live-green/10 border border-live-green/30 flex items-center justify-center">
              <Settings className="w-4 h-4 text-live-green" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                Admin Dashboard
              </h1>
              {principalText && (
                <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                  {principalText.slice(0, 20)}…
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-900/40 text-emerald-400 border-emerald-700/40 text-xs hidden sm:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Admin
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clear()}
              className="min-h-[36px] text-xs"
              data-ocid="admin.sign_out"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <div className="bg-card border-b border-border sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className="flex overflow-x-auto scrollbar-hide gap-1 py-1"
            role="tablist"
            aria-label="Admin sections"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${
                    activeTab === tab.id
                      ? "bg-live-green/10 text-live-green border border-live-green/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }
                `}
                data-ocid={`admin.tab_${tab.id}`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <OverviewTab providers={providers} setTab={setActiveTab} />
        )}
        {activeTab === "providers" && (
          <div className="space-y-8">
            <ProvidersTab providers={providers} />
            <RegisterProviderPanel />
          </div>
        )}
        {activeTab === "reports" && <CitizenReportsTab />}
        {activeTab === "testimonials" && <TestimonialsTab />}
        {activeTab === "helpers" && <HelpersTab />}
        {activeTab === "fiscal" && <FiscalImpactTab />}
        {activeTab === "health" && <HealthMonitor />}
        {activeTab === "prediction" && <PredictionEnginePanel />}
      </div>
    </main>
  );
}
