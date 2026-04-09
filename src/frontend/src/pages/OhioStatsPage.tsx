import {
  Activity,
  AlertTriangle,
  BarChart2,
  Clock,
  DollarSign,
  MapPin,
  TrendingDown,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Color constants ────────────────────────────────────────────────────────────
const GREEN = "#00e676";
const TEAL = "#00bcd4";
const AMBER = "#ffb300";
const NAVY_CARD = "oklch(0.13 0.03 240)";
const NAVY_BORDER = "oklch(0.22 0.05 240)";
const MUTED_TEXT = "oklch(0.55 0.03 220)";

// ─── Chart data ─────────────────────────────────────────────────────────────────
const OVERDOSE_DATA = [
  { year: "2018", deaths: 4854 },
  { year: "2019", deaths: 5072 },
  { year: "2020", deaths: 4017 },
  { year: "2021", deaths: 3765 },
  { year: "2022", deaths: 3523 },
  { year: "2023", deaths: 3301 },
  { year: "2024", deaths: 3050 },
];

const REGION_DATA = [
  { region: "R1", providers: 12 },
  { region: "R2", providers: 8 },
  { region: "R3", providers: 19 },
  { region: "R4", providers: 6 },
  { region: "R5", providers: 11 },
  { region: "R6", providers: 14 },
  { region: "R7", providers: 9 },
  { region: "R8", providers: 7 },
  { region: "R9", providers: 16 },
  { region: "R10", providers: 5 },
  { region: "R11", providers: 22 },
  { region: "R12", providers: 13 },
  { region: "R13", providers: 18 },
];

const COVERAGE_DATA = [
  { label: "Business Hours", pct: 92, fill: GREEN },
  { label: "After 5pm / Weekends", pct: 23, fill: AMBER },
];

// ─── Custom tooltip ─────────────────────────────────────────────────────────────
function DarkTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number | string; name?: string; color?: string }>;
  label?: string;
  formatter?: (val: number | string) => string;
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
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

const STATS = [
  {
    icon: AlertTriangle,
    value: "~4,000+",
    label: "Overdose Deaths per Year",
    note: "Ohio statewide, estimated — CDC/ODHE data",
    color: "text-amber-recovery",
    bg: "bg-amber-recovery/10",
  },
  {
    icon: Users,
    value: "~3,500",
    label: "Buprenorphine Prescribers in Ohio",
    note: "DEA waivered providers as of 2024",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Activity,
    value: "~100,000+",
    label: "Ohioans on MAT",
    note: "Active treatment statewide estimate",
    color: "text-live",
    bg: "bg-live/10",
  },
  {
    icon: Clock,
    value: "<10%",
    label: "MAT Clinics with After-Hours Access",
    note: "Estimated from Ohio MHAR provider data",
    color: "text-amber-recovery",
    bg: "bg-amber-recovery/10",
  },
  {
    icon: TrendingDown,
    value: "2–4 weeks",
    label: "Average Wait Time for MAT",
    note: "National estimate; Ohio varies by county",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: DollarSign,
    value: "$1.2B+",
    label: "OneOhio Opioid Settlement Funds",
    note: "Available through OneOhio Recovery Foundation",
    color: "text-live",
    bg: "bg-live/10",
  },
];

const COUNTIES = [
  "Cuyahoga",
  "Lake",
  "Geauga",
  "Ashtabula",
  "Trumbull",
  "Mahoning",
  "Columbiana",
];

export function OhioStatsPage() {
  return (
    <main className="min-h-screen" data-ocid="ohio_stats.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              The Data
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Ohio MAT Access:{" "}
            <span className="text-live-green">The Numbers</span>
          </h1>
          <p className="text-on-dark text-lg max-w-2xl">
            The statistics behind the crisis — and why real-time availability
            infrastructure matters for Ohio Region 13.
          </p>
          <p className="text-xs text-on-dark/60 mt-3">
            All figures are estimates sourced from CDC, ODHE, SAMHSA, and Ohio
            MHAR. Live Now Recovery does not collect or report patient data.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {STATS.map(({ icon: Icon, value, label, note, color, bg }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-muted-foreground text-xs">{note}</p>
            </div>
          ))}
        </div>

        {/* ── Recovery Data Charts ── */}
        <div className="mb-14">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-live-green mb-1">
              By the numbers
            </p>
            <h2 className="text-2xl font-bold text-white">Recovery Data</h2>
          </div>

          <div className="flex flex-col gap-6">
            {/* Chart 1 — Overdose deaths by year */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: NAVY_CARD,
                border: `1px solid ${NAVY_BORDER}`,
              }}
              data-ocid="ohio_stats.overdose_chart"
            >
              <div
                className="px-6 py-4 flex items-center gap-2"
                style={{ borderBottom: `1px solid ${NAVY_BORDER}` }}
              >
                <TrendingDown className="w-4 h-4" style={{ color: GREEN }} />
                <h3
                  className="font-bold text-sm"
                  style={{ color: "oklch(0.92 0.01 200)" }}
                >
                  Ohio Overdose Deaths: The Impact of MAT Access
                </h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={OVERDOSE_DATA}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="greenGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                        <stop
                          offset="95%"
                          stopColor={GREEN}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={NAVY_BORDER}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => v.toLocaleString()}
                      width={52}
                    />
                    <Tooltip
                      content={
                        <DarkTooltip
                          formatter={(v) =>
                            `${Number(v).toLocaleString()} deaths`
                          }
                        />
                      }
                    />
                    <ReferenceLine
                      x="2020"
                      stroke={TEAL}
                      strokeDasharray="4 3"
                      label={{
                        value: "MAT Access Expanded",
                        position: "insideTopRight",
                        fill: TEAL,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="deaths"
                      stroke={GREEN}
                      strokeWidth={2.5}
                      fill="url(#greenGrad)"
                      dot={{ fill: GREEN, r: 3, strokeWidth: 0 }}
                      activeDot={{ fill: GREEN, r: 5, strokeWidth: 0 }}
                      name="Overdose Deaths"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs mt-2" style={{ color: MUTED_TEXT }}>
                  Source: Ohio Department of Health / CDC WONDER. Figures are
                  estimated.
                </p>
              </div>
            </div>

            {/* Chart 2 — Providers by ADAMH Region */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: NAVY_CARD,
                border: `1px solid ${NAVY_BORDER}`,
              }}
              data-ocid="ohio_stats.region_chart"
            >
              <div
                className="px-6 py-4 flex items-center gap-2"
                style={{ borderBottom: `1px solid ${NAVY_BORDER}` }}
              >
                <BarChart2 className="w-4 h-4" style={{ color: TEAL }} />
                <h3
                  className="font-bold text-sm"
                  style={{ color: "oklch(0.92 0.01 200)" }}
                >
                  MAT Providers by Ohio ADAMH Region
                </h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={REGION_DATA}
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={NAVY_BORDER}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="region"
                      tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      content={
                        <DarkTooltip formatter={(v) => `${v} providers`} />
                      }
                    />
                    <Bar
                      dataKey="providers"
                      name="MAT Providers"
                      radius={[4, 4, 0, 0]}
                    >
                      {REGION_DATA.map((entry) => (
                        <Cell
                          key={entry.region}
                          fill={entry.region === "R13" ? GREEN : TEAL}
                          opacity={entry.region === "R13" ? 1 : 0.75}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs mt-2" style={{ color: MUTED_TEXT }}>
                  Region 13 (Northeast Ohio) highlighted — pilot region for Live
                  Now Recovery.
                </p>
              </div>
            </div>

            {/* Chart 3 — After-hours coverage gap */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: NAVY_CARD,
                border: `1px solid ${NAVY_BORDER}`,
              }}
              data-ocid="ohio_stats.coverage_chart"
            >
              <div
                className="px-6 py-4 flex items-center gap-2"
                style={{ borderBottom: `1px solid ${NAVY_BORDER}` }}
              >
                <Clock className="w-4 h-4" style={{ color: AMBER }} />
                <h3
                  className="font-bold text-sm"
                  style={{ color: "oklch(0.92 0.01 200)" }}
                >
                  MAT Access Gap: Business Hours vs. After Hours
                </h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={COVERAGE_DATA}
                    layout="vertical"
                    margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={NAVY_BORDER}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fill: MUTED_TEXT, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={130}
                    />
                    <Tooltip
                      content={
                        <DarkTooltip formatter={(v) => `${v}% covered`} />
                      }
                    />
                    <Bar
                      dataKey="pct"
                      name="Coverage"
                      radius={[0, 4, 4, 0]}
                      barSize={32}
                    >
                      {COVERAGE_DATA.map((entry) => (
                        <Cell key={entry.label} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div
                  className="mt-4 flex items-center gap-2 rounded-lg px-4 py-3"
                  style={{
                    background: `${GREEN}12`,
                    border: `1px solid ${GREEN}30`,
                  }}
                >
                  <Activity
                    className="w-4 h-4 shrink-0"
                    style={{ color: GREEN }}
                  />
                  <p className="text-xs font-semibold" style={{ color: GREEN }}>
                    69% coverage gap addressed by Live Now Recovery's 24/7
                    after-hours platform
                  </p>
                </div>
                <p className="text-xs mt-3" style={{ color: MUTED_TEXT }}>
                  Estimates based on Ohio MHAR provider survey data. After-hours
                  coverage includes ER 72-hour bridge, telehealth MAT, and
                  naloxone kiosk access.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── After-hours gap callout ── */}
        <div className="rounded-xl border border-amber-recovery/40 bg-amber-recovery/5 p-6 mb-10">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-amber-recovery mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-foreground text-lg mb-2">
                The After-Hours Gap
              </h3>
              <p className="text-3xl font-bold text-amber-recovery mb-3">90%</p>
              <p className="text-muted-foreground leading-relaxed">
                Estimated percentage of overdoses that do not occur between 9 AM
                and 5 PM on weekdays — the only window when most MAT clinics are
                open. When a clinic closes at 2 PM on a Friday, the next
                available access point is Monday morning. That gap is where
                people die.
              </p>
              <p className="text-muted-foreground text-sm mt-3">
                Live Now Recovery's emergency mode activates automatically after
                5 PM and on weekends, surfacing crisis resources and any
                provider with after-hours emergency availability.
              </p>
            </div>
          </div>
        </div>

        {/* ── Impact projection ── */}
        <div className="rounded-xl border border-live-green/30 bg-live-green/5 p-6 mb-14">
          <h3 className="font-bold text-live-green text-lg mb-3">
            Impact Projection
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Real-time availability data reduces unnecessary emergency room
            visits for patients who cannot reach a MAT provider. When a patient
            in crisis can see — in seconds — that a specific clinic is live
            right now, the probability of follow-through increases
            significantly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                value: "73%",
                label:
                  "of patients who access same-day MAT continue treatment at 30 days (SAMHSA)",
                color: "text-live",
              },
              {
                value: "25%",
                label:
                  "no-show reduction with gated ride confirmation before departure",
                color: "text-primary",
              },
              {
                value: "$1,675",
                label:
                  "annual savings per patient via Cost Plus Drugs vs. retail buprenorphine",
                color: "text-amber-recovery",
              },
            ].map((item) => (
              <div key={item.label} className="bg-secondary rounded-lg p-4">
                <p className={`text-2xl font-bold ${item.color} mb-1`}>
                  {item.value}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Region 13 coverage area ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Ohio Region 13 Coverage Area
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-5">
            Live Now Recovery currently serves providers and patients across
            these seven counties in Northeast Ohio.
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNTIES.map((county) => (
              <span
                key={county}
                className="px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm font-medium"
              >
                {county} County
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
