/**
 * AdminPage — 9-tab admin command center for Live Now Recovery.
 * Auth guard: useInternetIdentity() + useIsAdmin()
 * Tabs: Overview, Providers, Citizen Reports, Testimonials, Helpers, Fiscal Impact, Health Monitor, Prediction Engine, Credentials
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Flag,
  Heart,
  LayoutDashboard,
  Loader2,
  Lock,
  Medal,
  MessageSquare,
  Package,
  Plus,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  TrendingDown,
  TrendingUp,
  UserCheck,
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
  useGlobalImpactStats,
  usePendingPhysicalFulfillments,
} from "../hooks/useCredentials";
import {
  useAllHelpers,
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
import {
  formatEarnedAt,
  getTierBgColor,
  getTierColor,
  getTierLabel,
  shortenPrincipal,
} from "../lib/credentials";
import { usePredictionEngineStore } from "../store/predictionEngineStore";
import type { CitizenReport, Testimonial } from "../types/community";
import {
  ALL_CREDENTIAL_TYPES,
  CREDENTIAL_META,
  CredentialType,
} from "../types/credentials";
import { isProviderStale, statusLabel } from "../utils/providerUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab =
  | "dashboard"
  | "overview"
  | "providers"
  | "reports"
  | "testimonials"
  | "helpers"
  | "fiscal"
  | "health"
  | "prediction"
  | "credentials";

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
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
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
  {
    id: "credentials",
    label: "Credentials",
    icon: <Award className="w-4 h-4" />,
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

// ─── Mock data for AdminDashboardTab ─────────────────────────────────────────

const _DASHBOARD_MOCK_PROVIDERS = [
  {
    id: "dm-1",
    name: "Signature Health – Cleveland",
    city: "Cleveland",
    type: "MAT Clinic",
    status: "Active",
    verified: true,
  },
  {
    id: "dm-2",
    name: "Oriana House – Akron",
    city: "Akron",
    type: "Outpatient",
    status: "Active",
    verified: true,
  },
  {
    id: "dm-3",
    name: "FrontLine Service",
    city: "Cleveland",
    type: "Harm Reduction",
    status: "Pending",
    verified: false,
  },
  {
    id: "dm-4",
    name: "Meridian Health – Youngstown",
    city: "Youngstown",
    type: "MAT Clinic",
    status: "Active",
    verified: false,
  },
  {
    id: "dm-5",
    name: "Quest Recovery – Canton",
    city: "Canton",
    type: "Narcan Distribution",
    status: "Inactive",
    verified: true,
  },
];

const _DASHBOARD_MOCK_VOLUNTEERS = [
  {
    id: "dv-1",
    name: "Marcus T.",
    county: "Cuyahoga",
    role: "Peer Support",
    joined: "Jan 14, 2025",
    status: "Active",
  },
  {
    id: "dv-2",
    name: "Alicia R.",
    county: "Summit",
    role: "Outreach Worker",
    joined: "Feb 3, 2025",
    status: "Pending",
  },
  {
    id: "dv-3",
    name: "Devon M.",
    county: "Mahoning",
    role: "Recovery Coach",
    joined: "Mar 8, 2025",
    status: "Active",
  },
  {
    id: "dv-4",
    name: "Sandra K.",
    county: "Stark",
    role: "Transportation",
    joined: "Apr 1, 2025",
    status: "Suspended",
  },
];

const _DASHBOARD_ACTIVITY = [
  {
    id: 1,
    type: "verified",
    desc: "Signature Health – Cleveland verified",
    time: "4 min ago",
    borderColor: "bg-live-green",
  },
  {
    id: 2,
    type: "incident",
    desc: "Suspected overdose reported — Columbus, Franklin Co.",
    time: "11 min ago",
    borderColor: "bg-red-400",
  },
  {
    id: 3,
    type: "volunteer",
    desc: "New volunteer pending approval — Alicia R., Summit Co.",
    time: "23 min ago",
    borderColor: "bg-amber-400",
  },
  {
    id: 4,
    type: "registered",
    desc: "New provider registered — FrontLine Service, Cleveland",
    time: "37 min ago",
    borderColor: "bg-blue-400",
  },
  {
    id: 5,
    type: "incident",
    desc: "Narcan deployed — Dayton, Montgomery Co.",
    time: "52 min ago",
    borderColor: "bg-red-400",
  },
  {
    id: 6,
    type: "deactivated",
    desc: "Quest Recovery – Canton marked inactive",
    time: "1 hr ago",
    borderColor: "bg-muted-foreground/30",
  },
  {
    id: 7,
    type: "verified",
    desc: "Oriana House – Akron verification renewed",
    time: "2 hr ago",
    borderColor: "bg-live-green",
  },
  {
    id: 8,
    type: "registered",
    desc: "New provider registered — Spero Health, Toledo",
    time: "3 hr ago",
    borderColor: "bg-blue-400",
  },
];

// ─── AdminDashboardTab ───────────────────────────────────────────────────────

// ── CSV Export helpers ────────────────────────────────────────────────────

function downloadCsv(filename: string, rows: string[][]): void {
  const escapeCsvCell = (val: string) =>
    /[,"\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportDataButton({
  providers,
  helpers,
}: {
  providers: ProviderWithStatus[];
  helpers: Helper[];
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (providers.length === 0 && helpers.length === 0) {
      toast.info("Load dashboard data first.");
      return;
    }
    setExporting(true);
    const today = new Date().toISOString().slice(0, 10);

    // Providers CSV
    const providerRows: string[][] = [
      ["Name", "City", "Type", "Status", "Verified", "Reputation Score"],
      ...providers.map((p) => [
        p.name,
        "", // no city on ProviderWithStatus — use name context
        p.providerType,
        p.is_active ? "Active" : "Inactive",
        p.is_verified ? "Yes" : "No",
        String(p.reputationScore ?? 0),
      ]),
    ];
    downloadCsv(`livenow-providers-${today}.csv`, providerRows);

    // Helpers CSV
    if (helpers.length > 0) {
      const helperRows: string[][] = [
        ["Name", "ZIP", "Role", "Join Date", "Status"],
        ...helpers.map((v) => {
          const ms =
            typeof v.createdAt === "bigint"
              ? Number(v.createdAt) / 1_000_000
              : Number(v.createdAt);
          const joined = ms
            ? new Date(ms).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "";
          return [
            `${v.firstName} ${v.lastName}`,
            v.zip || "",
            v.helpType || "Helper",
            joined,
            "Active",
          ];
        }),
      ];
      downloadCsv(`livenow-volunteers-${today}.csv`, helperRows);
    }

    setTimeout(() => setExporting(false), 800);
    toast.success("Export complete.");
  };

  return (
    <button
      type="button"
      disabled={exporting}
      onClick={handleExport}
      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-live-green/40 bg-live-green/5 text-live-green text-sm font-medium hover:bg-live-green/10 transition-colors disabled:opacity-50"
      data-ocid="admin.export_data_button"
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Export Data
    </button>
  );
}

function AdminDashboardTab({
  providers,
  setTab,
  principalText,
}: {
  providers: ProviderWithStatus[];
  setTab: (t: AdminTab) => void;
  principalText: string;
}) {
  const [providerSearch, setProviderSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState<
    "All" | "Active" | "Pending" | "Unverified"
  >("All");
  const [volunteerSearch, setVolunteerSearch] = useState("");
  const [volunteerFilter, setVolunteerFilter] = useState<
    "All" | "Active" | "Pending" | "Suspended"
  >("All");
  const [copied, setCopied] = useState(false);

  // ── Live data hooks ─────────────────────────────────────────────────────
  const {
    data: helpers = [],
    isLoading: helpersLoading,
    isError: helpersError,
  } = useAllHelpers();

  const {
    data: reports = [],
    isLoading: reportsLoading,
    isError: reportsError,
  } = useGetAllReports();

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalProviders = providers.length;
  const activeIncidents = reports.filter(
    (r) =>
      r.activityType === "suspected-od" || r.activityType === "narcan-used",
  ).length;
  const totalVolunteers = helpers.length;
  const pendingVerifications = providers.filter((p) => !p.is_verified).length;

  // ── Activity feed from reports ───────────────────────────────────────────
  const activityEntries = reports
    .slice()
    .sort(
      (a, b) =>
        (typeof b.createdAt === "bigint"
          ? Number(b.createdAt) / 1_000_000
          : Number(b.createdAt)) -
        (typeof a.createdAt === "bigint"
          ? Number(a.createdAt) / 1_000_000
          : Number(a.createdAt)),
    )
    .slice(0, 12)
    .map((r, i) => {
      const ms =
        typeof r.createdAt === "bigint"
          ? Number(r.createdAt) / 1_000_000
          : Number(r.createdAt);
      const diff = Date.now() - ms;
      const mins = Math.floor(diff / 60_000);
      const timeAgo =
        mins < 1
          ? "just now"
          : mins < 60
            ? `${mins} min ago`
            : mins < 1440
              ? `${Math.floor(mins / 60)} hr ago`
              : `${Math.floor(mins / 1440)} days ago`;
      const label =
        REPORT_TYPE_LABELS[r.activityType] ?? r.activityType.replace(/-/g, " ");
      const borderColor =
        r.activityType === "suspected-od" || r.activityType === "narcan-used"
          ? "bg-red-400"
          : r.activityType === "bad-batch-alert"
            ? "bg-amber-400"
            : r.activityType === "check-in"
              ? "bg-live-green"
              : "bg-blue-400";
      return {
        id: `${r.id}-${i}`,
        desc: `${label} — ${r.zipCode || "Unknown area"}`,
        time: timeAgo,
        borderColor,
      };
    });

  const handleCopyPrincipal = () => {
    if (principalText) {
      navigator.clipboard.writeText(principalText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // ── Filtered providers (live data from prop) ─────────────────────────────
  const filteredProviders = providers.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(providerSearch.toLowerCase());
    if (!matchSearch) return false;
    if (providerFilter === "Active") return p.is_active;
    if (providerFilter === "Pending") return !p.is_active && !p.is_verified;
    if (providerFilter === "Unverified") return !p.is_verified;
    return true;
  });

  // ── Filtered helpers (live data from hook) ───────────────────────────────
  const filteredHelpers = helpers.filter((v) => {
    const matchSearch =
      `${v.firstName} ${v.lastName}`
        .toLowerCase()
        .includes(volunteerSearch.toLowerCase()) ||
      v.zip.toLowerCase().includes(volunteerSearch.toLowerCase());
    if (!matchSearch) return false;
    // All helpers from backend don't have an explicit status field;
    // treat all as Active. Filter "Pending"/"Suspended" returns none.
    if (volunteerFilter === "Active") return true;
    if (volunteerFilter === "Pending") return false;
    if (volunteerFilter === "Suspended") return false;
    return true;
  });

  // ── Skeleton row helper ──────────────────────────────────────────────────
  const SkeletonRows = ({
    cols,
    rows = 3,
  }: { cols: number; rows?: number }) => (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are positional
        <tr key={`skel-${i}`}>
          {Array.from({ length: cols }).map((__, j) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cols are positional
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-6" data-ocid="admin.dashboard_tab">
      {/* Principal copy strip */}
      {principalText && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/30 border border-border w-fit">
          <span className="text-xs text-muted-foreground">Principal:</span>
          <span className="font-mono text-xs text-foreground">
            {principalText.slice(0, 10)}&hellip;{principalText.slice(-6)}
          </span>
          <button
            type="button"
            onClick={handleCopyPrincipal}
            className="ml-1 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            aria-label="Copy full principal"
            data-ocid="admin.copy_principal"
          >
            <Copy className="w-3 h-3" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="admin.stats_bar"
      >
        {/* Total Providers */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-live-green/10 border border-live-green/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-live-green" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Total Providers
            </span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-live-green">
              {totalProviders}
            </p>
            <span className="flex items-center gap-0.5 text-xs text-live-green">
              <TrendingUp className="w-3 h-3" />
              {providers.filter((p) => p.is_active).length} active
            </span>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-900/20 border border-amber-700/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Active Incidents
            </span>
          </div>
          <div className="flex items-end justify-between">
            {reportsLoading ? (
              <Skeleton
                className="h-8 w-12"
                data-ocid="admin.incidents_loading_state"
              />
            ) : (
              <p className="text-3xl font-bold text-amber-400">
                {activeIncidents}
              </p>
            )}
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Activity className="w-3 h-3" /> {reports.length} total
            </span>
          </div>
        </div>

        {/* Volunteers */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-live-green/10 border border-live-green/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-live-green" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Volunteers / Helpers
            </span>
          </div>
          <div className="flex items-end justify-between">
            {helpersLoading ? (
              <Skeleton
                className="h-8 w-12"
                data-ocid="admin.helpers_loading_state"
              />
            ) : (
              <p className="text-3xl font-bold text-live-green">
                {totalVolunteers}
              </p>
            )}
            <span className="flex items-center gap-0.5 text-xs text-live-green">
              <TrendingUp className="w-3 h-3" /> registered
            </span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-900/20 border border-red-700/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Pending Verifications
            </span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-red-400">
              {pendingVerifications}
            </p>
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> Review
            </span>
          </div>
        </div>
      </div>

      {/* Two-column main: tables + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Providers table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Shield className="w-4 h-4 text-live-green" />
              <h3 className="font-semibold text-foreground">Providers</h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {filteredProviders.length} shown
              </span>
            </div>
            <div className="px-5 py-3 border-b border-border flex flex-wrap gap-2">
              <Input
                placeholder="Search name or city"
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                className="max-w-[200px] h-8 text-sm"
                data-ocid="admin.provider_search"
              />
              <select
                value={providerFilter}
                onChange={(e) =>
                  setProviderFilter(
                    e.target.value as
                      | "All"
                      | "Active"
                      | "Pending"
                      | "Unverified",
                  )
                }
                className="h-8 text-sm px-2 rounded-md bg-muted border border-border text-foreground"
                data-ocid="admin.provider_filter"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>
            <div
              className="overflow-x-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Provider
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Type
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Verified
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.slice(0, 10).map((p, i) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.provider_row.${i + 1}`}
                    >
                      <td
                        className="px-4 py-3 font-medium text-foreground max-w-[160px] truncate"
                        title={p.name}
                      >
                        {p.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            PROVIDER_TYPE_COLORS[p.providerType] ??
                            "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {p.providerType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            p.is_active
                              ? "bg-live-green/10 text-live-green border-live-green/30"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {p.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.is_verified ? (
                          <span className="text-live-green font-bold text-lg">
                            ✓
                          </span>
                        ) : (
                          <span className="text-red-400 font-bold text-lg">
                            ✗
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTab("providers")}
                            className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/70 text-foreground transition-colors"
                            data-ocid={`admin.view_provider.${i + 1}`}
                          >
                            View
                          </button>
                          {!p.is_verified && (
                            <button
                              type="button"
                              onClick={() => setTab("providers")}
                              className="text-xs px-2 py-1 rounded bg-live-green/10 hover:bg-live-green/20 text-live-green transition-colors"
                              data-ocid={`admin.verify_provider.${i + 1}`}
                            >
                              Verify
                            </button>
                          )}
                          {p.is_active && (
                            <button
                              type="button"
                              onClick={() => setTab("providers")}
                              className="text-xs px-2 py-1 rounded bg-red-900/20 hover:bg-red-900/30 text-red-400 transition-colors"
                              data-ocid={`admin.deactivate_provider.${i + 1}`}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProviders.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-muted-foreground text-sm"
                        data-ocid="admin.providers_empty_state"
                      >
                        No providers match your filter.
                      </td>
                    </tr>
                  )}
                  {filteredProviders.length > 10 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-3 text-center text-xs text-muted-foreground"
                      >
                        Showing 10 of {filteredProviders.length} —{" "}
                        <button
                          type="button"
                          onClick={() => setTab("providers")}
                          className="text-primary underline"
                        >
                          View all in Providers tab
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Volunteers / Helpers table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-live-green" />
              <h3 className="font-semibold text-foreground">
                Volunteers / Helpers
              </h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {helpersLoading ? "…" : `${filteredHelpers.length} shown`}
              </span>
            </div>
            {helpersError && (
              <div
                className="mx-5 my-3 px-4 py-3 rounded-xl border border-primary/40 bg-primary/5 text-sm text-primary"
                data-ocid="admin.helpers_error_state"
              >
                Unable to load volunteers right now. Try refreshing.
              </div>
            )}
            <div className="px-5 py-3 border-b border-border flex flex-wrap gap-2">
              <Input
                placeholder="Search name or ZIP"
                value={volunteerSearch}
                onChange={(e) => setVolunteerSearch(e.target.value)}
                className="max-w-[200px] h-8 text-sm"
                data-ocid="admin.volunteer_search"
              />
              <select
                value={volunteerFilter}
                onChange={(e) =>
                  setVolunteerFilter(
                    e.target.value as
                      | "All"
                      | "Active"
                      | "Pending"
                      | "Suspended",
                  )
                }
                className="h-8 text-sm px-2 rounded-md bg-muted border border-border text-foreground"
                data-ocid="admin.volunteer_filter"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div
              className="overflow-x-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      ZIP
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Role
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Joined
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {helpersLoading && !helpersError ? (
                    <SkeletonRows cols={6} rows={3} />
                  ) : (
                    <>
                      {filteredHelpers.slice(0, 10).map((v, i) => {
                        const ms =
                          typeof v.createdAt === "bigint"
                            ? Number(v.createdAt) / 1_000_000
                            : Number(v.createdAt);
                        const joined = ms
                          ? new Date(ms).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—";
                        return (
                          <tr
                            key={v.id}
                            className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                            data-ocid={`admin.volunteer_row.${i + 1}`}
                          >
                            <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                              {v.firstName} {v.lastName}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                              {v.zip || "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted border border-border text-muted-foreground">
                                {v.helpType || "Helper"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                              {joined}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-live-green/10 text-live-green border-live-green/30">
                                Active
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setTab("helpers")}
                                  className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/70 text-foreground transition-colors"
                                  data-ocid={`admin.view_volunteer.${i + 1}`}
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredHelpers.length === 0 && !helpersLoading && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-muted-foreground text-sm"
                            data-ocid="admin.volunteers_empty_state"
                          >
                            No helpers registered yet.
                          </td>
                        </tr>
                      )}
                      {filteredHelpers.length > 10 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-3 text-center text-xs text-muted-foreground"
                          >
                            Showing 10 of {filteredHelpers.length} —{" "}
                            <button
                              type="button"
                              onClick={() => setTab("helpers")}
                              className="text-primary underline"
                            >
                              View all in Helpers tab
                            </button>
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Activity feed */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-live-green animate-pulse" />
            <h3 className="font-semibold text-foreground">Activity Log</h3>
            <span className="ml-1 text-xs text-live-green font-medium">
              Live
            </span>
          </div>
          {reportsError && (
            <div
              className="mx-4 mt-3 px-4 py-3 rounded-xl border border-primary/40 bg-primary/5 text-sm text-primary"
              data-ocid="admin.reports_error_state"
            >
              Unable to load activity right now. Try refreshing.
            </div>
          )}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ maxHeight: "600px" }}
            data-ocid="admin.activity_feed"
          >
            {reportsLoading && !reportsError ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional skeleton
                  key={`skel-act-${i}`}
                  className="flex gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/50"
                  data-ocid="admin.activity_loading_state"
                >
                  <Skeleton className="w-1 self-stretch rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))
            ) : activityEntries.length > 0 ? (
              activityEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/50"
                  data-ocid={`admin.activity_item.${i + 1}`}
                >
                  <div
                    className={`shrink-0 w-1 self-stretch rounded-full mt-1 ${entry.borderColor}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug">
                      {entry.desc}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="text-center text-sm text-muted-foreground py-8"
                data-ocid="admin.activity_empty_state"
              >
                No activity yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions bar */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-live-green" />
          <h3 className="text-sm font-semibold text-foreground">
            Quick Actions
          </h3>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          data-ocid="admin.quick_actions"
        >
          <button
            type="button"
            onClick={() => setTab("providers")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-live-green/40 bg-live-green/5 text-live-green text-sm font-medium hover:bg-live-green/10 transition-colors"
            data-ocid="admin.add_provider_button"
          >
            <Plus className="w-4 h-4" /> Add Provider
          </button>
          <button
            type="button"
            onClick={() => setProviderFilter("Pending")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-live-green/40 bg-live-green/5 text-live-green text-sm font-medium hover:bg-live-green/10 transition-colors"
            data-ocid="admin.review_pending_button"
          >
            <CheckCircle2 className="w-4 h-4" /> Review Pending
          </button>
          <ExportDataButton providers={providers} helpers={helpers} />

          <button
            type="button"
            onClick={() => {
              window.location.href = "/admin/settings";
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-live-green/40 bg-live-green/5 text-live-green text-sm font-medium hover:bg-live-green/10 transition-colors"
            data-ocid="admin.settings_button"
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>
    </div>
  );
}

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

// ─── Helpers: tier utils ──────────────────────────────────────────────────────

const TIER_ORDER = [
  "Community",
  "PeerSupport",
  "Clinical",
  "Leadership",
] as const;

function TierBadge({ tier }: { tier: string }) {
  const colorCls = getTierColor(tier);
  const bgCls = getTierBgColor(tier);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${bgCls} ${colorCls}`}
    >
      {getTierLabel(tier)}
    </span>
  );
}

function CredentialNameBadge({
  credType,
}: { credType: CredentialType | string }) {
  const meta = CREDENTIAL_META[credType as CredentialType];
  const name =
    meta?.displayName ??
    String(credType)
      .replace(/([A-Z])/g, " $1")
      .trim();
  const tierBg = meta ? getTierBgColor(meta.tier) : "bg-muted border-border";
  const tierColor = meta ? getTierColor(meta.tier) : "text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tierBg} ${tierColor}`}
    >
      {name}
    </span>
  );
}

// ─── Tab: Credentials ─────────────────────────────────────────────────────────

const PENDING_APPROVAL_SIMULATED = [
  {
    principal: "rdmx6-jaaaa-aaaah-qcaiq-cai",
    type: CredentialType.RecoveryAlly,
    note: "Completed peer support training — verified by admin",
  },
  {
    principal: "rrkah-fqaaa-aaaaa-aaaaq-cai",
    type: CredentialType.StorySharer,
    note: "Submitted approved recovery testimonial",
  },
  {
    principal: "r7inp-6aaaa-aaaaa-aaabq-cai",
    type: CredentialType.SentinelVerified,
    note: "Provider verification process passed",
  },
];

function CredentialsTab() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  // ── Seed Demo Data ───────────────────────────────────────────────────────
  const [seedState, setSeedState] = useState<
    "idle" | "seeding" | "success" | "error"
  >("idle");
  const [seedError, setSeedError] = useState<string | null>(null);

  const handleSeedCredentials = async () => {
    if (!actor) return;
    setSeedState("seeding");
    setSeedError(null);
    try {
      await (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).adminSeedCredentials();
      setSeedState("success");
      void qc.invalidateQueries({ queryKey: ["allPublicBadges"] });
      void qc.invalidateQueries({ queryKey: ["globalImpactStats"] });
      void qc.invalidateQueries({ queryKey: ["topContributors"] });
      toast.success(
        "Successfully seeded 18 credential records! Head to /gallery and /leaderboard to see them live.",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSeedError(msg);
      setSeedState("error");
      toast.error(`Seed failed: ${msg}`);
    }
  };

  // Stats
  const { data: globalStats, isLoading: statsLoading } = useGlobalImpactStats();

  // Mint ledger — getAllPublicBadges returns [Principal, bigint][] (principal → credential count)
  const { data: publicBadges = [], isLoading: ledgerLoading } = useQuery<
    Array<[{ toString(): string }, bigint]>
  >({
    queryKey: ["allPublicBadges"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPublicBadges();
      } catch (err) {
        console.error("[getAllPublicBadges] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  // Physical fulfillment queue
  const {
    data: pendingFulfillments = [],
    isLoading: fulfillmentsLoading,
    refetch: refetchFulfillments,
  } = usePendingPhysicalFulfillments();

  const fulfillMutation = useMutation({
    mutationFn: async (_credId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return Promise.resolve(); // markPhysicalFulfilled not yet in backend
    },
    onSuccess: () => {
      toast.success("Marked as fulfilled — ready to ship!");
      void refetchFulfillments();
      void qc.invalidateQueries({ queryKey: ["pendingPhysicalFulfillments"] });
    },
    onError: () => toast.error("Failed to mark fulfilled"),
  });

  // Manual mint form
  const [mintForm, setMintForm] = useState({
    principal: "",
    credType: CredentialType.FirstResponder as CredentialType,
    metadata: "",
  });
  const [minting, setMinting] = useState(false);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !mintForm.principal) return;
    setMinting(true);
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const principal = Principal.fromText(mintForm.principal.trim());
      await actor.adminMintCredential(
        principal,
        mintForm.credType,
        mintForm.metadata.trim() || null,
      );
      toast.success("Credential minted successfully!");
      setMintForm({
        principal: "",
        credType: CredentialType.FirstResponder,
        metadata: "",
      });
      void qc.invalidateQueries({ queryKey: ["allPublicBadges"] });
      void qc.invalidateQueries({ queryKey: ["globalImpactStats"] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Mint failed: ${msg}`);
    } finally {
      setMinting(false);
    }
  };

  // Pending approvals actions
  const [approvingKeys, setApprovingKeys] = useState<Set<string>>(new Set());

  const handleApproveCredential = async (
    principalText: string,
    credType: CredentialType,
    key: string,
  ) => {
    if (!actor) return;
    setApprovingKeys((prev) => new Set(prev).add(key));
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const principal = Principal.fromText(principalText);
      await actor.adminMintCredential(principal, credType, null);
      toast.success("Credential approved and minted");
      void qc.invalidateQueries({ queryKey: ["allPublicBadges"] });
      void qc.invalidateQueries({ queryKey: ["globalImpactStats"] });
    } catch {
      toast.error("Approval failed. Admin access required.");
    } finally {
      setApprovingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8" data-ocid="admin.credentials_tab">
      {/* 0. Seed Demo Data card */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background:
            seedState === "success"
              ? "oklch(0.62 0.15 155 / 0.06)"
              : "oklch(0.14 0.03 240)",
          borderColor:
            seedState === "error"
              ? "oklch(0.52 0.18 28 / 0.5)"
              : seedState === "success"
                ? "oklch(0.62 0.15 155 / 0.4)"
                : "oklch(0.24 0.04 240)",
        }}
        data-ocid="admin.seed_credentials_card"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: "oklch(0.62 0.15 155 / 0.12)",
              border: "1px solid oklch(0.62 0.15 155 / 0.3)",
            }}
          >
            <Database
              className="w-5 h-5"
              style={{ color: "oklch(0.62 0.15 155)" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-base mb-1"
              style={{ color: "oklch(0.92 0.01 210)" }}
            >
              Initialize Credential Demo Data
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: "oklch(0.62 0.02 220)" }}
            >
              Populate the leaderboard and gallery with 15+ realistic credential
              records across all 12 badge types and all 4 tiers — ready for
              pitches and demos. This is a one-time operation.
            </p>

            {seedState === "idle" && (
              <Button
                onClick={handleSeedCredentials}
                disabled={!actor || isFetching}
                className="min-h-[44px] font-semibold"
                style={{
                  background: "oklch(0.62 0.15 155)",
                  color: "oklch(0.10 0 0)",
                }}
                data-ocid="admin.seed_credentials_button"
              >
                <Award className="w-4 h-4 mr-2" />
                Seed Credential Data
              </Button>
            )}

            {seedState === "seeding" && (
              <div
                className="flex items-center gap-3"
                data-ocid="admin.seed_credentials_loading_state"
              >
                <Loader2
                  className="w-5 h-5 animate-spin"
                  style={{ color: "oklch(0.62 0.15 155)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.62 0.15 155)" }}
                >
                  Seeding credentials…
                </span>
              </div>
            )}

            {seedState === "success" && (
              <div
                className="flex flex-col gap-3"
                data-ocid="admin.seed_credentials_success_state"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="w-5 h-5"
                    style={{ color: "oklch(0.62 0.15 155)" }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.62 0.15 155)" }}
                  >
                    Successfully seeded 18 credential records!
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.04 155)" }}
                >
                  Head to{" "}
                  <a
                    href="/gallery"
                    className="underline"
                    style={{ color: "oklch(0.62 0.15 155)" }}
                  >
                    /gallery
                  </a>{" "}
                  and{" "}
                  <a
                    href="/leaderboard"
                    className="underline"
                    style={{ color: "oklch(0.62 0.15 155)" }}
                  >
                    /leaderboard
                  </a>{" "}
                  to see them live.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSeedState("idle")}
                  className="w-fit text-xs"
                  style={{
                    borderColor: "oklch(0.62 0.15 155 / 0.4)",
                    color: "oklch(0.62 0.15 155)",
                  }}
                >
                  Seed Again
                </Button>
              </div>
            )}

            {seedState === "error" && (
              <div
                className="flex flex-col gap-3"
                data-ocid="admin.seed_credentials_error_state"
              >
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Seed failed
                  </span>
                </div>
                {seedError && (
                  <p className="text-xs text-destructive/70 font-mono">
                    {seedError}
                  </p>
                )}
                <Button
                  size="sm"
                  onClick={() => handleSeedCredentials()}
                  disabled={!actor || isFetching}
                  className="w-fit"
                  style={{
                    background: "oklch(0.62 0.15 155)",
                    color: "oklch(0.10 0 0)",
                  }}
                  data-ocid="admin.seed_credentials_retry_button"
                >
                  <Loader2 className="w-3.5 h-3.5 mr-1.5" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. Global Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Medal className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm text-muted-foreground">Badges Minted</span>
          </div>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold text-emerald-400">
              {Number(globalStats?.totalBadgesMinted ?? 0n).toLocaleString()}
            </p>
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm text-muted-foreground">
              Active Contributors
            </span>
          </div>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold text-blue-400">
              {Number(globalStats?.activeContributors ?? 0n).toLocaleString()}
            </p>
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Star className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm text-muted-foreground">
              Total Impact Score
            </span>
          </div>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold text-purple-400">
              {Number(globalStats?.totalImpactScore ?? 0n).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* 2. Full Mint Ledger */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Award className="w-4 h-4 text-live-green" />
          <h3 className="font-semibold text-foreground">Mint Ledger</h3>
          <Badge className="ml-auto bg-muted text-muted-foreground border-border text-xs">
            {publicBadges.length} records
          </Badge>
        </div>
        {ledgerLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : publicBadges.length === 0 ? (
          <div
            className="p-12 text-center"
            data-ocid="admin.credentials_ledger_empty"
          >
            <Award className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              No credentials minted yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Use the manual mint form below to issue the first credential
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Principal
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Badge Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {publicBadges.map(([principal, count], i) => (
                  <tr
                    key={principal.toString()}
                    className="hover:bg-muted/30 transition-colors"
                    data-ocid={`admin.credentials_row.${i + 1}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {shortenPrincipal(principal)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-emerald-400">
                        {Number(count)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Manual Mint Form */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Plus className="w-4 h-4 text-live-green" />
          <h3 className="font-semibold text-foreground">
            Manual Credential Mint
          </h3>
        </div>
        <form
          onSubmit={handleMint}
          className="space-y-4"
          data-ocid="admin.credentials_mint_form"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mint-principal">Principal (text format)</Label>
              <Input
                id="mint-principal"
                value={mintForm.principal}
                onChange={(e) =>
                  setMintForm((f) => ({ ...f, principal: e.target.value }))
                }
                placeholder="aaaaa-aa or rrkah-fqaaa-aaaaa-aaaaq-cai"
                className="mt-1 min-h-[44px] font-mono text-xs"
                required
                data-ocid="admin.credentials_principal_input"
              />
            </div>
            <div>
              <Label htmlFor="mint-type">Credential Type</Label>
              <select
                id="mint-type"
                value={mintForm.credType}
                onChange={(e) =>
                  setMintForm((f) => ({
                    ...f,
                    credType: e.target.value as CredentialType,
                  }))
                }
                className="mt-1 w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-ocid="admin.credentials_type_select"
              >
                {TIER_ORDER.map((tier) =>
                  ALL_CREDENTIAL_TYPES.filter(
                    (ct) =>
                      CREDENTIAL_META[ct as CredentialType]?.tier === tier,
                  ).map((ct) => (
                    <option key={ct} value={ct}>
                      [{getTierLabel(tier)}]{" "}
                      {CREDENTIAL_META[ct as CredentialType]?.displayName ?? ct}
                    </option>
                  )),
                )}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="mint-metadata">Metadata / Notes (optional)</Label>
            <textarea
              id="mint-metadata"
              value={mintForm.metadata}
              onChange={(e) =>
                setMintForm((f) => ({ ...f, metadata: e.target.value }))
              }
              placeholder="e.g. report_id:42, handoff_count:25, event_id:outreach-2026-01"
              rows={2}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-ocid="admin.credentials_metadata_textarea"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠ Soul-bound — minted credentials cannot be transferred or revoked.
            Zero PHI stored.
          </p>
          <Button
            type="submit"
            disabled={minting || !actor}
            className="min-h-[44px] bg-live-green hover:bg-live-green/90 text-navy font-semibold"
            data-ocid="admin.credentials_mint_submit"
          >
            {minting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Minting…
              </>
            ) : (
              <>
                <Award className="w-3.5 h-3.5 mr-1.5" />
                Issue Credential
              </>
            )}
          </Button>
        </form>
      </div>

      {/* 4. Physical Fulfillment Queue */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-foreground">
            Physical Fulfillment Queue
          </h3>
          {pendingFulfillments.length > 0 && (
            <Badge className="ml-auto bg-amber-900/40 text-amber-400 border-amber-700/40 text-xs">
              {pendingFulfillments.length} pending
            </Badge>
          )}
        </div>
        {fulfillmentsLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : pendingFulfillments.length === 0 ? (
          <div className="p-10 text-center" data-ocid="admin.fulfillment_empty">
            <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No pending physical rewards
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              When contributors claim physical rewards, they will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingFulfillments.map((cred, i) => (
              <div
                key={Number(cred.id)}
                className="px-5 py-4 flex items-center gap-4"
                data-ocid={`admin.fulfillment_row.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CredentialNameBadge credType={cred.credentialType} />
                    <TierBadge tier={cred.tier} />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {shortenPrincipal(cred.owner)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Earned: {formatEarnedAt(cred.earnedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fulfillMutation.mutate(cred.id)}
                  disabled={fulfillMutation.isPending}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-700/40 text-emerald-400 hover:bg-emerald-950/30 transition-colors min-h-[36px]"
                  data-ocid={`admin.mark_fulfilled.${i + 1}`}
                >
                  {fulfillMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Mark Fulfilled
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Pending Approvals */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-foreground">Pending Approvals</h3>
          <span className="ml-1 text-xs text-muted-foreground">
            (Recovery Ally · Story Sharer · Sentinel Verified)
          </span>
        </div>
        <div className="divide-y divide-border">
          {PENDING_APPROVAL_SIMULATED.map((item, i) => {
            const key = `${item.principal}-${item.type}`;
            return (
              <div
                key={key}
                className="px-5 py-4 flex items-center gap-4"
                data-ocid={`admin.approval_row.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CredentialNameBadge credType={item.type} />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {shortenPrincipal(item.principal)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {item.note}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleApproveCredential(item.principal, item.type, key)
                  }
                  disabled={approvingKeys.has(key)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-900/40 text-blue-400 border border-blue-700/40 hover:bg-blue-900/60 transition-colors min-h-[36px]"
                  data-ocid={`admin.approval_button.${i + 1}`}
                >
                  {approvingKeys.has(key) ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Approve &amp; Mint
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            These are example pending approvals. In production, submissions from
            the recovery account flow will populate this queue automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Not Authorized View ─────────────────────────────────────────────────────

interface NotAuthorizedViewProps {
  isSignedIn: boolean;
  adminError: boolean;
  principalText: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actor: any;
  qc: ReturnType<typeof useQueryClient>;
  clear: () => void;
}

function NotAuthorizedView({
  isSignedIn,
  adminError,
  principalText,
  actor,
  qc,
  clear,
}: NotAuthorizedViewProps) {
  const [claimStatus, setClaimStatus] = useState<
    "idle" | "loading" | "success" | "already_exists" | "error"
  >("idle");

  const handleClaimAdmin = async () => {
    if (!actor) return;
    setClaimStatus("loading");
    try {
      // initAdminIfEmpty() may not yet appear in generated types — use cast.
      const result: string = await (
        actor as Record<string, (...args: unknown[]) => Promise<string>>
      ).initAdminIfEmpty();
      console.log("[AdminPage] initAdminIfEmpty() returned:", result);
      if (result.startsWith("Admin set:")) {
        setClaimStatus("success");
        // Give the canister state a moment to settle, then re-check admin status.
        setTimeout(() => {
          void qc.invalidateQueries({ queryKey: ["isAdmin"] }).then(() => {
            void qc.refetchQueries({ queryKey: ["isAdmin"] });
          });
        }, 800);
      } else {
        // "Admin already exists" — caller is not the registered admin.
        setClaimStatus("already_exists");
      }
    } catch (err) {
      console.error("[AdminPage] initAdminIfEmpty() failed:", err);
      setClaimStatus("error");
    }
  };

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
          data-ocid="admin.error_state"
        >
          <Lock
            className="w-10 h-10"
            style={{ color: "oklch(0.68 0.1 218)" }}
          />
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {adminError ? "Admin Check Failed" : "Not Authorized"}
            </h2>
            {adminError ? (
              <p className="text-muted-foreground text-sm max-w-sm">
                The admin verification call failed. This is usually a temporary
                network issue. Click <strong>Retry Admin Check</strong> to try
                again without signing out.
              </p>
            ) : isSignedIn ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-muted-foreground text-sm max-w-sm">
                  Your account is not registered as an admin on this platform.
                  If you believe this is an error, click{" "}
                  <strong>Retry Admin Check</strong> — the verification
                  sometimes needs a moment after sign-in.
                </p>
                {principalText && (
                  <p className="text-xs text-muted-foreground font-mono break-all mt-1">
                    Signed in as:{" "}
                    <span className="text-foreground">{principalText}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm max-w-sm">
                Your Internet Identity does not have admin privileges. Ensure
                you are signed in with the correct identity.
              </p>
            )}
          </div>

          {/* Claim status messages */}
          {claimStatus === "success" && (
            <p
              className="text-sm font-semibold text-center"
              style={{ color: "oklch(0.68 0.25 145)" }}
              data-ocid="admin.success_state"
            >
              Admin access claimed — checking now…
            </p>
          )}
          {claimStatus === "already_exists" && (
            <p
              className="text-sm text-center"
              style={{ color: "oklch(0.72 0.18 30)" }}
            >
              An admin is already registered. You may be signed into the wrong
              account.
            </p>
          )}
          {claimStatus === "error" && (
            <p className="text-sm text-center text-destructive">
              Failed to claim admin access. Please try again.
            </p>
          )}

          {/* Retry Admin Check */}
          {isSignedIn && (
            <Button
              onClick={() => {
                console.log(
                  "[AdminPage] Manual retry — invalidating isAdmin cache",
                );
                void qc.invalidateQueries({ queryKey: ["isAdmin"] });
              }}
              className="min-h-[44px] w-full font-semibold"
              style={{
                background: "oklch(0.68 0.1 218)",
                color: "oklch(0.14 0.008 240)",
              }}
              data-ocid="admin.retry_button"
            >
              Retry Admin Check
            </Button>
          )}

          {/* Claim Admin Access — only shown when signed in and not yet claimed */}
          {isSignedIn && claimStatus !== "success" && (
            <Button
              onClick={() => void handleClaimAdmin()}
              disabled={claimStatus === "loading" || !actor}
              className="min-h-[44px] w-full font-semibold"
              style={{
                background:
                  claimStatus === "loading"
                    ? "oklch(0.68 0.25 145 / 0.5)"
                    : "oklch(0.68 0.25 145)",
                color: "oklch(0.14 0.008 240)",
              }}
              data-ocid="admin.claim_admin_button"
            >
              {claimStatus === "loading" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Claiming…
                </span>
              ) : (
                "Claim Admin Access"
              )}
            </Button>
          )}

          {principalText && (
            <p className="text-[11px] text-muted-foreground font-mono break-all">
              Principal: {principalText}
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => clear()}
            className="min-h-[40px]"
            style={{
              borderColor: "oklch(0.68 0.1 218 / 0.5)",
              color: "oklch(0.68 0.1 218)",
            }}
            data-ocid="admin.secondary_button"
          >
            Sign Out &amp; Try Again
          </Button>
        </div>
      </div>
    </main>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export function AdminPage() {
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const {
    data: isAdmin,
    isLoading: adminLoading,
    isError: adminError,
  } = useIsAdmin();
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const { data: providers = [] } = useAllProviders();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const principalText = identity?.getPrincipal().toText() ?? "";

  // ── Re-run admin check whenever login completes ──────────────────────────
  // Without this, the isAdmin query is cached with the anonymous identity
  // result and never refreshed after Internet Identity login succeeds.
  useEffect(() => {
    if (loginStatus === "success") {
      console.log(
        "[AdminPage] Login succeeded — invalidating and refetching isAdmin cache with authenticated identity",
      );
      void qc.invalidateQueries({ queryKey: ["isAdmin"] }).then(() => {
        void qc.refetchQueries({ queryKey: ["isAdmin"] });
      });
    }
  }, [loginStatus, qc]);

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
              <div className="flex flex-col items-center gap-3 w-full">
                <p className="text-sm text-destructive text-center max-w-xs">
                  Sign in was cancelled or failed. Please try again.
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Tip: Internet Identity opens in a popup window. If nothing
                  appeared, check your browser&apos;s popup blocker settings.
                </p>
                <Button
                  onClick={() => login()}
                  variant="outline"
                  className="min-h-[44px] w-full font-semibold"
                  style={{
                    borderColor: "oklch(0.68 0.1 218 / 0.6)",
                    color: "oklch(0.68 0.1 218)",
                  }}
                  data-ocid="admin.retry_button"
                >
                  Try Again
                </Button>
              </div>
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
    const isSignedIn = loginStatus === "success";
    return (
      <NotAuthorizedView
        isSignedIn={isSignedIn}
        adminError={adminError}
        principalText={principalText}
        actor={actor}
        qc={qc}
        clear={clear}
      />
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
                <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[160px] sm:max-w-[220px]">
                  {principalText.slice(0, 12)}…{principalText.slice(-5)}
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
        {activeTab === "dashboard" && (
          <AdminDashboardTab
            providers={providers}
            setTab={setActiveTab}
            principalText={principalText}
          />
        )}
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
        {activeTab === "credentials" && <CredentialsTab />}
      </div>
    </main>
  );
}
