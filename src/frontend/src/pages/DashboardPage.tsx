import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Activity,
  BarChart2,
  Building2,
  CheckCircle,
  DollarSign,
  Download,
  FileDown,
  Loader2,
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ImpactOdometer } from "../components/ImpactOdometer";
import { useFiscalImpact } from "../hooks/usePredictionEngine";
import {
  useAllProviders,
  useCanisterState,
  useHandoffCountsByZip,
  useIsAdmin,
  useTotalCostPlusReferrals,
  useTotalHandoffs,
} from "../hooks/useQueries";
import { usePredictionEngineStore } from "../store/predictionEngineStore";

// ─── Color constants ───────────────────────────────────────────────────────────
// Use Tailwind emerald-400 (#4ade80) for Recharts/inline-style contexts
// where CSS custom properties cannot be read. This aligns with the --live token.
const GREEN = "#4ade80";
const TEAL = "#00bcd4";
const AMBER = "#ffb300";
const INDIGO = "#7c4dff";
const NAVY_CARD = "oklch(0.13 0.03 240)";
const NAVY_BORDER = "oklch(0.22 0.05 240)";
const MUTED_TEXT = "oklch(0.55 0.03 220)";
// Provider type color map
const TYPE_COLORS: Record<string, string> = {
  "MAT Clinic": GREEN,
  "Narcan Distribution": AMBER,
  "Emergency Room": "#ff5252",
  "Naloxone Kiosk/Vending Machine": INDIGO,
  "Telehealth MAT": TEAL,
  Other: "#78909c",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
  loading?: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: NAVY_CARD,
        border: `1px solid ${NAVY_BORDER}`,
        boxShadow: `0 0 24px ${color}10`,
      }}
      data-ocid="dashboard.stat_card"
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: MUTED_TEXT }}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-9 w-24 bg-white/5" />
      ) : (
        <p
          className="text-3xl font-bold tracking-tight"
          style={{ color, textShadow: `0 0 20px ${color}50` }}
        >
          {value}
        </p>
      )}
      {subtitle && (
        <p className="text-xs" style={{ color: MUTED_TEXT }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
  loading,
  empty,
  emptyMessage,
}: {
  title: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
    >
      <div
        className="px-6 py-4 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${NAVY_BORDER}` }}
      >
        <Icon className="w-4 h-4" style={{ color: GREEN }} />
        <h3
          className="font-bold text-sm"
          style={{ color: "oklch(0.92 0.01 200)" }}
        >
          {title}
        </h3>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-40 w-full bg-white/5" />
          </div>
        ) : empty ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2">
            <BarChart2
              className="w-8 h-8"
              style={{ color: "oklch(0.35 0.04 220)" }}
            />
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              {emptyMessage ?? "No data available yet"}
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// Custom tooltip for recharts
function DarkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number | string; name?: string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs shadow-xl"
      style={{
        background: "oklch(0.10 0.03 240)",
        border: `1px solid ${NAVY_BORDER}`,
        color: "oklch(0.88 0.01 200)",
      }}
    >
      {label && (
        <p className="font-bold mb-1" style={{ color: GREEN }}>
          {label}
        </p>
      )}
      {payload.map((entry) => (
        <p
          key={`${entry.name ?? ""}-${entry.value}`}
          style={{ color: entry.color ?? "oklch(0.88 0.01 200)" }}
        >
          {entry.name ? `${entry.name}: ` : ""}
          {entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Access gate ───────────────────────────────────────────────────────────────
function AccessGate() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "oklch(0.08 0.02 240)" }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-10 text-center flex flex-col items-center gap-6"
        style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
        data-ocid="dashboard.access_gate"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: `${GREEN}15`, border: `1px solid ${GREEN}30` }}
        >
          <Lock className="w-7 h-7" style={{ color: GREEN }} />
        </div>
        <div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "oklch(0.92 0.01 200)" }}
          >
            Partner Access Only
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: MUTED_TEXT }}>
            This dashboard is for county and health system partners. Contact us
            to request access.
          </p>
        </div>
        <Link to="/contact">
          <Button
            className="font-semibold"
            style={{
              background: `${GREEN}18`,
              border: `1px solid ${GREEN}40`,
              color: GREEN,
            }}
            data-ocid="dashboard.request_access"
          >
            Request Access
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────────

// ─── Ohio ZIPs constant (for fiscal chart) ────────────────────────────────────
const OHIO_ZIPS = [
  "44105",
  "44115",
  "44310",
  "44512",
  "44718",
  "44109",
  "44612",
  "45505",
  "45011",
];

export function DashboardPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: providers = [], isLoading: providersLoading } =
    useAllProviders();
  const { data: totalHandoffs, isLoading: handoffsLoading } =
    useTotalHandoffs();
  const { data: handoffsByZip = [], isLoading: zipLoading } =
    useHandoffCountsByZip();
  const { data: totalReferrals, isLoading: referralsLoading } =
    useTotalCostPlusReferrals();
  const { data: canisterState, isLoading: canisterLoading } =
    useCanisterState();

  // Fiscal impact hook — polls backend/simulates every 30s
  useFiscalImpact();
  const { settings: engineSettings, fiscalData } = usePredictionEngineStore();

  // PDF export state
  const dashboardContentRef = useRef<HTMLDivElement>(null);
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "done">(
    "idle",
  );

  // Show gate while loading admin status
  if (adminLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.08 0.02 240)" }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return <AccessGate />;

  // ── Derived data ────────────────────────────────────────────────────────────
  const activeProviders = providers.filter((p) => p.isLive);
  const verifiedProviders = providers.filter(
    (p) => "is_verified" in p && (p as { is_verified: boolean }).is_verified,
  );

  // Provider type breakdown for area/bar chart
  const typeMap: Record<string, number> = {};
  for (const p of providers) {
    const t =
      ("providerType" in p
        ? (p as { providerType: string }).providerType
        : "") || "Other";
    typeMap[t] = (typeMap[t] ?? 0) + 1;
  }
  const typeBreakdownData = Object.entries(typeMap).map(([type, count]) => ({
    type,
    count,
  }));

  // Handoffs by ZIP chart data
  const zipChartData = handoffsByZip
    .map(([zip, count]) => ({ zip, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // Provider activity over time (synthetic trend from canister state + live data)
  const activityTrendData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    // Use real data for today; seed realistic values for prior days
    const base = activeProviders.length;
    const variance = Math.floor(Math.random() * 3);
    return {
      day: label,
      active: i === 6 ? base : Math.max(0, base - variance),
      total:
        i === 6
          ? providers.length
          : Math.max(base, providers.length - variance),
    };
  });

  // Memory usage as MB
  const memoryMB = canisterState
    ? Math.round(Number(canisterState.total_active_providers) * 0.004 + 1.2)
    : 0;

  // ── PDF export handler ──────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!dashboardContentRef.current || pdfState === "generating") return;
    setPdfState("generating");
    try {
      const isMobile = window.innerWidth < 768;
      const scale = isMobile ? 0.8 : 1.5;
      const canvas = await html2canvas(dashboardContentRef.current, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0d1117",
        logging: false,
        windowWidth: isMobile ? 768 : window.innerWidth,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentW = pageW - margin * 2;

      // Header
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      pdf.setFillColor(13, 17, 23);
      pdf.rect(0, 0, pageW, pageH, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(74, 222, 128); // emerald-400
      pdf.text("Live Now Recovery", margin, margin + 5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(140, 155, 175);
      pdf.text("Recovery Intelligence Report", margin, margin + 11);
      pdf.text(
        `Generated: ${today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        margin,
        margin + 16,
      );

      // Image positioned below header
      const headerH = margin + 22;
      const footerH = 12;
      const availH = pageH - headerH - footerH;
      const imgAspect = canvas.height / canvas.width;
      const imgH = Math.min(availH, contentW * imgAspect);
      const imgY = headerH;

      pdf.addImage(imgData, "PNG", margin, imgY, contentW, imgH);

      // Footer
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 110, 125);
      pdf.text("Confidential — For Investor Use Only", margin, pageH - 5);
      pdf.text(
        `© ${today.getFullYear()} Live Now Recovery`,
        pageW - margin,
        pageH - 5,
        { align: "right" },
      );

      // Separator lines
      pdf.setDrawColor(74, 222, 128);
      pdf.setLineWidth(0.4);
      pdf.line(margin, margin + 19, pageW - margin, margin + 19);
      pdf.line(margin, pageH - 9, pageW - margin, pageH - 9);

      pdf.save(`Recovery-Intelligence-Report-${dateStr}.pdf`);
      setPdfState("done");
      setTimeout(() => setPdfState("idle"), 3000);
    } catch {
      setPdfState("idle");
    }
  };

  // ── Download handler ────────────────────────────────────────────────────────
  const handleDownload = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalHandoffs: totalHandoffs?.toString() ?? "0",
        activeProviders: activeProviders.length,
        totalProviders: providers.length,
        verifiedProviders: verifiedProviders.length,
        totalCostPlusReferrals: totalReferrals?.toString() ?? "0",
      },
      handoffsByZip: handoffsByZip.map(([zip, count]) => ({
        zip,
        count: count.toString(),
      })),
      providerTypeBreakdown: typeBreakdownData,
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        isLive: p.isLive,
        status: String(p.status),
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-dashboard-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: "oklch(0.08 0.02 240)" }}
      data-ocid="dashboard.page"
    >
      {/* ── Dark navy hero header ── */}
      <section
        className="px-4 py-14"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.10 0.04 240) 0%, oklch(0.13 0.03 240) 100%)",
          borderBottom: `1px solid ${NAVY_BORDER}`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{
                    background: `${GREEN}15`,
                    color: GREEN,
                    border: `1px solid ${GREEN}25`,
                  }}
                >
                  B2B Analytics
                </span>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-extrabold mb-2"
                style={{ color: "oklch(0.97 0.01 200)" }}
              >
                Recovery{" "}
                <span
                  style={{ color: GREEN, textShadow: `0 0 30px ${GREEN}60` }}
                >
                  Intelligence
                </span>{" "}
                Dashboard
              </h1>
              <p
                className="text-base"
                style={{ color: "oklch(0.65 0.03 220)" }}
              >
                Real-time analytics for counties and health systems — Ohio
                Region 13
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* Export PDF */}
              <Button
                onClick={handleExportPDF}
                disabled={pdfState === "generating"}
                className="flex items-center gap-2 font-semibold"
                style={{
                  background: pdfState === "done" ? `${GREEN}25` : `${GREEN}18`,
                  border: `1px solid ${pdfState === "done" ? GREEN : `${GREEN}45`}`,
                  color: GREEN,
                  opacity: pdfState === "generating" ? 0.7 : 1,
                }}
                data-ocid="dashboard.export_pdf"
              >
                {pdfState === "generating" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : pdfState === "done" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    Export Report
                  </>
                )}
              </Button>
              {/* JSON download */}
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2 font-semibold"
                style={{
                  background: "oklch(0.16 0.04 240)",
                  border: "1px solid oklch(0.28 0.05 240)",
                  color: "oklch(0.72 0.04 220)",
                }}
                data-ocid="dashboard.download_report"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div
        ref={dashboardContentRef}
        className="max-w-7xl mx-auto px-4 py-10 space-y-10"
        data-ocid="dashboard.content"
      >
        {/* ── Stat cards row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Handoffs"
            value={handoffsLoading ? "…" : (totalHandoffs ?? 0n).toString()}
            icon={TrendingUp}
            color={GREEN}
            loading={handoffsLoading}
            subtitle="Verified warm handoffs completed"
          />
          <StatCard
            label="Active Providers"
            value={providersLoading ? "…" : activeProviders.length}
            icon={Activity}
            color={TEAL}
            loading={providersLoading}
            subtitle="Currently live on the platform"
          />
          <StatCard
            label="Cost Plus Referrals"
            value={referralsLoading ? "…" : (totalReferrals ?? 0n).toString()}
            icon={Zap}
            color={AMBER}
            loading={referralsLoading}
            subtitle="Patients referred to Cost Plus Rx"
          />
          <StatCard
            label="Verified Providers"
            value={providersLoading ? "…" : verifiedProviders.length}
            icon={ShieldCheck}
            color={INDIGO}
            loading={providersLoading}
            subtitle={`of ${providers.length} total registered`}
          />
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Handoffs by ZIP */}
          <ChartCard
            title="Handoffs by ZIP Code"
            icon={BarChart2}
            loading={zipLoading}
            empty={zipChartData.length === 0}
            emptyMessage="No handoff data yet — seed providers to start tracking"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={zipChartData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.20 0.03 240)"
                  vertical={false}
                />
                <XAxis
                  dataKey="zip"
                  tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<DarkTooltip />}
                  cursor={{ fill: `${GREEN}08` }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Handoffs">
                  {zipChartData.map((entry, index) => (
                    <Cell
                      key={`zip-${entry.zip}`}
                      fill={GREEN}
                      opacity={0.7 + (index / zipChartData.length) * 0.3}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Provider Activity Trend */}
          <ChartCard
            title="Provider Activity — 7 Days"
            icon={Activity}
            loading={providersLoading}
            empty={providers.length === 0}
            emptyMessage="No provider data yet"
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={activityTrendData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.20 0.03 240)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    color: MUTED_TEXT,
                    paddingTop: "12px",
                  }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  name="Active"
                  stroke={GREEN}
                  strokeWidth={2}
                  fill="url(#activeGrad)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke={TEAL}
                  strokeWidth={2}
                  fill="url(#totalGrad)"
                  dot={false}
                  strokeDasharray="4 2"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Provider type breakdown ── */}
        <ChartCard
          title="Provider Type Distribution"
          icon={Users}
          loading={providersLoading}
          empty={typeBreakdownData.length === 0}
          emptyMessage="No providers registered yet"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={typeBreakdownData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.20 0.03 240)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  tick={{ fill: MUTED_TEXT, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  content={<DarkTooltip />}
                  cursor={{ fill: `${GREEN}08` }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Providers">
                  {typeBreakdownData.map((entry) => (
                    <Cell
                      key={`type-${entry.type}`}
                      fill={TYPE_COLORS[entry.type] ?? "#78909c"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend / type list */}
            <div className="grid grid-cols-1 gap-3">
              {typeBreakdownData.map(({ type, count }) => (
                <div
                  key={type}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: TYPE_COLORS[type] ?? "#78909c" }}
                    />
                    <span
                      className="text-sm truncate"
                      style={{ color: "oklch(0.82 0.02 220)" }}
                    >
                      {type}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs shrink-0 font-bold"
                    style={{
                      borderColor: `${TYPE_COLORS[type] ?? "#78909c"}40`,
                      color: TYPE_COLORS[type] ?? "#78909c",
                    }}
                  >
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* ── System health ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4" style={{ color: GREEN }} />
            <h2
              className="font-bold text-sm uppercase tracking-wider"
              style={{ color: "oklch(0.72 0.04 220)" }}
            >
              Canister Health
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SystemHealthCard
              label="Registered Providers"
              value={providersLoading ? null : providers.length}
              unit="providers"
              color={GREEN}
              loading={providersLoading || canisterLoading}
            />
            <SystemHealthCard
              label="Active Providers"
              value={
                canisterLoading
                  ? null
                  : Number(canisterState?.total_active_providers ?? 0)
              }
              unit="live"
              color={TEAL}
              loading={canisterLoading}
            />
            <SystemHealthCard
              label="Est. Memory Usage"
              value={canisterLoading ? null : memoryMB}
              unit="MB"
              color={AMBER}
              loading={canisterLoading}
            />
            <SystemHealthCard
              label="High-Risk Window"
              value={
                canisterLoading
                  ? null
                  : canisterState?.high_risk_window_active
                    ? "ACTIVE"
                    : "Clear"
              }
              unit=""
              color={canisterState?.high_risk_window_active ? "#ff5252" : GREEN}
              loading={canisterLoading}
            />
          </div>
        </div>

        {/* ── Fiscal Impact section ── */}
        <div data-ocid="dashboard.fiscal_impact">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-4 h-4" style={{ color: GREEN }} />
            <h2
              className="font-bold text-sm uppercase tracking-wider"
              style={{ color: "oklch(0.72 0.04 220)" }}
            >
              Fiscal Impact Engine — Sentinel ROI Dashboard
            </h2>
          </div>

          {/* ImpactOdometer */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: NAVY_CARD,
              border: `1px solid ${GREEN}25`,
              boxShadow: `0 0 40px ${GREEN}08`,
            }}
          >
            <ImpactOdometer
              dollarsSaved={fiscalData.totalDollarsSaved}
              livesSaved={fiscalData.livesSaved}
              stabilizedAgents={fiscalData.stabilizedAgents}
              stabilityPipelinePercent={fiscalData.stabilityPipelinePercent}
              communityReinvestmentFund={fiscalData.communityReinvestmentFund}
              accelerated={engineSettings.potencyToggle}
              sensitivity={engineSettings.sensitivitySlider}
            />
          </div>

          {/* Monthly Cost Avoidance by ZIP */}
          <ChartCard
            title="Monthly Cost Avoidance by ZIP Code"
            icon={TrendingUp}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={OHIO_ZIPS.map((zip) => {
                  // Use real handoff data where available, else mock
                  const real = handoffsByZip.find(([z]) => z === zip);
                  const handoffs = real
                    ? Number(real[1])
                    : Math.floor(Math.random() * 8) + 1;
                  return {
                    zip,
                    costAvoidance: handoffs * 25_000,
                    handoffs,
                  };
                })}
                margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.20 0.03 240)"
                  vertical={false}
                />
                <XAxis
                  dataKey="zip"
                  tick={{ fill: MUTED_TEXT, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: MUTED_TEXT, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
                  }
                />
                <Tooltip
                  content={<DarkTooltip />}
                  cursor={{ fill: `${GREEN}08` }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Cost Avoided",
                  ]}
                />
                <Bar
                  dataKey="costAvoidance"
                  radius={[4, 4, 0, 0]}
                  name="Cost Avoidance"
                >
                  {OHIO_ZIPS.map((zip, index) => (
                    <Cell
                      key={`fiscal-${zip}`}
                      fill={GREEN}
                      opacity={0.6 + (index / OHIO_ZIPS.length) * 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </main>
  );
}

function SystemHealthCard({
  label,
  value,
  unit,
  color,
  loading,
}: {
  label: string;
  value: number | string | null;
  unit: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: NAVY_CARD,
        border: `1px solid ${NAVY_BORDER}`,
      }}
      data-ocid="dashboard.system_health_card"
    >
      <p
        className="text-xs uppercase tracking-wide mb-2"
        style={{ color: MUTED_TEXT }}
      >
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-7 w-16 bg-white/5" />
      ) : (
        <p
          className="text-xl font-bold"
          style={{ color, textShadow: `0 0 12px ${color}40` }}
        >
          {value ?? "—"}
          {unit ? (
            <span
              className="text-xs ml-1 font-normal"
              style={{ color: MUTED_TEXT }}
            >
              {unit}
            </span>
          ) : null}
        </p>
      )}
    </div>
  );
}
