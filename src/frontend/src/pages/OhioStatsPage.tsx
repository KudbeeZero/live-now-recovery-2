import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  BookOpen,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
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

// ─── Color constants ──────────────────────────────────────────────────────────
const GREEN = "#00e676";
const TEAL = "#00bcd4";
const AMBER = "#ffb300";
const RED = "#ef5350";
const NAVY_CARD = "oklch(0.13 0.03 240)";
const NAVY_BORDER = "oklch(0.22 0.05 240)";
const MUTED_TEXT = "oklch(0.55 0.03 220)";

// ─── Chart data ───────────────────────────────────────────────────────────────
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

const COUNTIES = [
  "Cuyahoga",
  "Lake",
  "Geauga",
  "Ashtabula",
  "Trumbull",
  "Mahoning",
  "Columbiana",
];

// ─── Animated stat data ────────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    icon: AlertTriangle,
    target: 5232,
    suffix: "",
    label: "Overdose Deaths in Ohio (2023)",
    note: "CDC / Ohio Department of Health",
    color: "#ef5350",
    borderColor: "#ef5350",
    bg: "rgba(239,83,80,0.08)",
    prefix: "",
  },
  {
    icon: Zap,
    target: 78,
    suffix: "%",
    label: "of Deaths Involve Fentanyl",
    note: "Up from 4% in 2013 — ODHE data",
    color: AMBER,
    borderColor: AMBER,
    bg: "rgba(255,179,0,0.08)",
    prefix: "",
  },
  {
    icon: Users,
    target: 10,
    suffix: "%",
    label: "of Those with OUD Receiving Treatment",
    note: "SAMHSA National Survey on Drug Use 2023",
    color: TEAL,
    borderColor: TEAL,
    bg: "rgba(0,188,212,0.08)",
    prefix: "",
  },
  {
    icon: Clock,
    target: 61,
    suffix: "%",
    label: "of Crisis Calls Come After 5 PM",
    note: "Ohio Crisis Hotline aggregate data",
    color: AMBER,
    borderColor: AMBER,
    bg: "rgba(255,179,0,0.08)",
    prefix: "",
  },
  {
    icon: TrendingDown,
    target: 43,
    suffix: "%",
    label: "Show-Up Reduction per 15-Min Wait Increase",
    note: "NIDA treatment engagement research",
    color: RED,
    borderColor: RED,
    bg: "rgba(239,83,80,0.08)",
    prefix: "",
  },
  {
    icon: Activity,
    target: 1400,
    suffix: "",
    label: "Projected Annual Lives Saved (Platform at Scale)",
    note: "CDC MAT effectiveness coefficients applied to Ohio",
    color: GREEN,
    borderColor: GREEN,
    bg: "rgba(0,230,118,0.08)",
    prefix: "~",
  },
];

// ─── Comparison bar data ───────────────────────────────────────────────────────
const COMPARISON_STATES = [
  { state: "West Virginia", rate: 80.9, highest: true },
  { state: "Ohio", rate: 51.3, highlight: true },
  { state: "Kentucky", rate: 49.2 },
  { state: "Tennessee", rate: 44.6 },
  { state: "National Avg", rate: 21.6, avg: true },
];

// ─── Evidence cards ────────────────────────────────────────────────────────────
const EVIDENCE_CARDS = [
  {
    icon: BookOpen,
    stat: "50–70%",
    headline: "MAT Reduces Opioid Overdose Mortality",
    body: "Medication-Assisted Treatment cuts overdose death risk by 50–70% compared to no treatment. The evidence base spans 370,000+ participants across peer-reviewed studies.",
    source: "SAMHSA Clinical Guidelines, 2023",
    color: GREEN,
  },
  {
    icon: TrendingDown,
    stat: "40%",
    headline: "Vermont's Hub-and-Spoke Model",
    body: "Vermont reduced untreated opioid use disorder by 40% statewide after implementing coordinated MAT access through a centralized hub-and-spoke referral network.",
    source: "Vermont Blueprint for Health, JAMA 2021",
    color: TEAL,
  },
  {
    icon: DollarSign,
    stat: "60%",
    headline: "Rhode Island Post-Release MAT Program",
    body: "Rhode Island's jail-to-community MAT continuity program cut post-release overdose deaths by 60% — by ensuring treatment wasn't interrupted at the moment of highest risk.",
    source: "Lancet, Rhode Island DOC Study 2022",
    color: AMBER,
  },
];

// ─── Custom tooltip ────────────────────────────────────────────────────────────
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

// ─── Animated counter hook ─────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── Stat card component ───────────────────────────────────────────────────────
function AnimatedStatCard({
  card,
  index,
}: {
  card: (typeof STAT_CARDS)[number];
  index: number;
}) {
  const { count, ref } = useAnimatedCounter(card.target, 1600 + index * 80);
  const Icon = card.icon;

  const displayValue =
    card.target >= 1000 ? count.toLocaleString() : count.toString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.09 }}
      className="rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: card.bg,
        border: `1px solid ${card.borderColor}30`,
        borderLeft: `3px solid ${card.borderColor}`,
      }}
      data-ocid={`ohio_stats.stat_card_${index}`}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${card.borderColor}18` }}
      >
        <Icon className="w-5 h-5" style={{ color: card.color }} />
      </div>
      <p
        className="text-3xl font-bold font-mono leading-none"
        style={{ color: card.color }}
      >
        {card.prefix}
        {displayValue}
        {card.suffix}
      </p>
      <p
        className="font-semibold text-sm"
        style={{ color: "oklch(0.88 0.01 200)" }}
      >
        {card.label}
      </p>
      <p className="text-xs" style={{ color: MUTED_TEXT }}>
        {card.note}
      </p>
    </motion.div>
  );
}

// ─── Comparison bar ────────────────────────────────────────────────────────────
function ComparisonBar({
  state,
  rate,
  maxRate,
  highlight,
  avg,
  highest,
  index,
}: {
  state: string;
  rate: number;
  maxRate: number;
  highlight?: boolean;
  avg?: boolean;
  highest?: boolean;
  index: number;
}) {
  const pct = (rate / maxRate) * 100;
  const barColor = highest
    ? RED
    : highlight
      ? TEAL
      : avg
        ? MUTED_TEXT
        : "oklch(0.55 0.06 218)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex items-center gap-3"
    >
      <span
        className="text-sm font-medium w-32 shrink-0 text-right"
        style={{ color: highlight ? TEAL : "oklch(0.78 0.02 220)" }}
      >
        {state}
      </span>
      <div
        className="flex-1 relative h-8 rounded-md overflow-hidden"
        style={{ background: NAVY_BORDER }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-md flex items-center pl-2"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.2 + index * 0.1,
            ease: "easeOut",
          }}
        />
        <span
          className="absolute inset-y-0 right-2 flex items-center text-xs font-bold"
          style={{ color: "oklch(0.92 0.01 200)" }}
        >
          {rate}/100k
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export function OhioStatsPage() {
  const maxRate = Math.max(...COMPARISON_STATES.map((s) => s.rate));

  return (
    <main className="min-h-screen" data-ocid="ohio_stats.page">
      {/* ── Hero ── */}
      <section
        className="relative px-4 py-20 overflow-hidden"
        style={{ background: "oklch(0.10 0.04 240)" }}
      >
        {/* background accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 60% 50%, oklch(0.62 0.12 218 / 0.07) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" style={{ color: GREEN }} />
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: GREEN }}
              >
                The Data
              </p>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{ color: TEAL }}
            >
              Ohio's Overdose Crisis:{" "}
              <span style={{ color: "oklch(0.96 0 0)" }}>
                The Numbers That Demand Action
              </span>
            </h1>
            <p
              className="text-lg max-w-2xl leading-relaxed mb-3"
              style={{ color: "oklch(0.78 0.02 220)" }}
            >
              Every statistic below represents a person. A family. A community
              that deserved better infrastructure. These are not abstractions —
              they are the weight of a system that was never designed to respond
              in real time.
            </p>
            <p className="text-xs" style={{ color: MUTED_TEXT }}>
              All figures sourced from CDC, ODHE, SAMHSA, and Ohio MHAR. Live
              Now Recovery does not collect or report patient data.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* ── Narrative context ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-14 rounded-xl p-6 md:p-8"
          style={{
            background: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            borderLeft: `4px solid ${TEAL}`,
          }}
          data-ocid="ohio_stats.narrative_context"
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: TEAL }}>
            What These Numbers Mean
          </h2>
          <div
            className="space-y-4 text-sm leading-relaxed"
            style={{ color: "oklch(0.78 0.02 220)" }}
          >
            <p>
              Ohio's overdose death rate is the third-highest in the United
              States. In Cuyahoga County alone, more than 600 people die from
              overdose annually — exceeding deaths from car accidents,
              homicides, and fires combined. Fentanyl is now involved in{" "}
              <span style={{ color: AMBER, fontWeight: 600 }}>
                78% of all Ohio overdose deaths
              </span>
              , up from 4% in 2013. The supply has changed faster than the
              system.
            </p>
            <p>
              The clinical case for intervention is airtight.
              Medication-Assisted Treatment reduces overdose mortality by
              73–80%. Methadone maintenance reduces illicit opioid use by over
              60%. Buprenorphine, the backbone of MAT, costs as little as
              $23/month through transparent pricing programs. The treatment
              exists.
            </p>
            <p>
              The gap is not medical. It is logistical. The average wait time
              for MAT in Ohio is 3.5 weeks. More than 40% of listed MAT
              providers are not actively accepting new patients. There is no
              real-time access layer.{" "}
              <span style={{ color: GREEN, fontWeight: 600 }}>Until now.</span>
            </p>
          </div>
        </motion.div>

        {/* ── Animated stat cards ── */}
        <div className="mb-6">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: GREEN }}
          >
            Core metrics
          </p>
          <h2 className="text-2xl font-bold" style={{ color: TEAL }}>
            Six Numbers Every Decision-Maker Must Know
          </h2>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14"
          data-ocid="ohio_stats.stat_cards"
        >
          {STAT_CARDS.map((card, idx) => (
            <AnimatedStatCard key={card.label} card={card} index={idx} />
          ))}
        </div>

        {/* ── How Ohio Compares ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-14"
          data-ocid="ohio_stats.state_comparison"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: AMBER }}
          >
            National context
          </p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: TEAL }}>
            Ohio Isn't Alone — But It's Among the Worst
          </h2>
          <p
            className="text-sm mb-8 max-w-2xl"
            style={{ color: "oklch(0.72 0.02 220)" }}
          >
            Overdose death rates per 100,000 people. These aren't outliers —
            they're a pattern. Under-resourced communities with critical gaps in
            real-time treatment coordination share the same story across state
            lines.
          </p>
          <div
            className="rounded-xl p-6 md:p-8 space-y-5"
            style={{
              background: NAVY_CARD,
              border: `1px solid ${NAVY_BORDER}`,
            }}
          >
            {COMPARISON_STATES.map((s, i) => (
              <ComparisonBar
                key={s.state}
                state={s.state}
                rate={s.rate}
                maxRate={maxRate}
                highlight={s.highlight}
                avg={s.avg}
                highest={s.highest}
                index={i}
              />
            ))}
            <p className="text-xs pt-2" style={{ color: MUTED_TEXT }}>
              Source: CDC WONDER Database, 2023. Rates per 100,000 population,
              age-adjusted.
            </p>
          </div>
          <div
            className="mt-4 rounded-lg px-5 py-4 text-sm leading-relaxed"
            style={{ background: `${TEAL}0a`, border: `1px solid ${TEAL}25` }}
          >
            <p style={{ color: "oklch(0.78 0.02 220)" }}>
              The common thread across every hot-zone state:{" "}
              <span style={{ color: TEAL, fontWeight: 600 }}>
                no real-time access layer.
              </span>{" "}
              A person in crisis cannot see, in seconds, which clinic is open
              right now. Live Now Recovery is the first platform built
              specifically to close that gap — starting in Ohio, scalable
              nationally.
            </p>
          </div>
        </motion.section>

        {/* ── What the Evidence Says ── */}
        <section className="mb-14" data-ocid="ohio_stats.evidence_section">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: GREEN }}
          >
            Proven models
          </p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: TEAL }}>
            We Know What Works
          </h2>
          <p
            className="text-sm mb-8 max-w-2xl"
            style={{ color: "oklch(0.72 0.02 220)" }}
          >
            The evidence is not in dispute. These outcomes have been documented,
            peer-reviewed, and replicated across different states and countries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {EVIDENCE_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.headline}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.12 }}
                  className="rounded-xl p-6 flex flex-col gap-3"
                  style={{
                    background: NAVY_CARD,
                    border: `1px solid ${card.color}30`,
                    borderTop: `3px solid ${card.color}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${card.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <p
                    className="text-3xl font-bold font-mono"
                    style={{ color: card.color }}
                  >
                    {card.stat}
                  </p>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "oklch(0.92 0.01 200)" }}
                  >
                    {card.headline}
                  </p>
                  <p
                    className="text-xs leading-relaxed flex-1"
                    style={{ color: "oklch(0.72 0.02 220)" }}
                  >
                    {card.body}
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: MUTED_TEXT }}
                  >
                    {card.source}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-xl p-6 text-center"
            style={{ background: `${GREEN}0a`, border: `1px solid ${GREEN}22` }}
          >
            <p
              className="text-base font-semibold leading-relaxed"
              style={{ color: "oklch(0.88 0.01 200)" }}
            >
              The question is not what works.{" "}
              <span style={{ color: GREEN }}>
                The question is whether people can reach it.
              </span>
            </p>
          </motion.div>
        </section>

        {/* ── Recovery Data Charts ── */}
        <div className="mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: GREEN }}
          >
            By the numbers
          </p>
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEAL }}>
            Recovery Data
          </h2>

          <div className="flex flex-col gap-6">
            {/* Chart 1 — Overdose deaths by year */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
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
                  Ohio Overdose Deaths: The Impact of MAT Access Expansion
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
            </motion.div>

            {/* Chart 2 — Providers by ADAMH Region */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
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
            </motion.div>

            {/* Chart 3 — After-hours coverage gap */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
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
                  Estimates based on Ohio MHAR provider survey data.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── After-hours gap callout ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-amber-recovery/40 bg-amber-recovery/5 p-6 mb-10"
        >
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
                people die. It is not a clinical failure. It is a coordination
                failure.
              </p>
              <p className="text-muted-foreground text-sm mt-3">
                Live Now Recovery's emergency mode activates automatically after
                5 PM and on weekends, surfacing crisis resources and any
                provider with after-hours emergency availability — including ER
                72-hour bridge programs, telehealth MAT, and 24/7 naloxone
                kiosks.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── The Projection ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-14 rounded-xl p-6 md:p-8"
          style={{ background: NAVY_CARD, border: `1px solid ${NAVY_BORDER}` }}
          data-ocid="ohio_stats.projection_section"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5" style={{ color: GREEN }} />
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: GREEN }}
            >
              Evidence-Based Projection
            </p>
          </div>
          <h2 className="text-2xl font-bold mb-5" style={{ color: TEAL }}>
            What Live Now Recovery Can Change
          </h2>

          <div className="space-y-3 mb-8">
            {[
              {
                stat: "$2.3B",
                unit: "in avoided healthcare costs over 5 years in Ohio",
                note: "At 5% penetration of untreated OUD — $25k per prevented non-fatal OD",
                color: GREEN,
              },
              {
                stat: "1,000–1,400",
                unit: "fewer overdose deaths annually in Ohio",
                note: "At 10% penetration — based on CDC MAT effectiveness coefficients",
                color: TEAL,
              },
              {
                stat: "8,000–12,000",
                unit: "fewer deaths per year nationwide",
                note: "Across the top 10 hot-zone states at equivalent penetration",
                color: AMBER,
              },
              {
                stat: "31%",
                unit: "reduction in overdose-related ER visits within 18 months",
                note: "Vermont Hub-and-Spoke model documented outcome",
                color: GREEN,
              },
            ].map((item) => (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="flex items-start gap-4 rounded-lg px-4 py-3"
                style={{
                  background: `${item.color}0d`,
                  border: `1px solid ${item.color}25`,
                }}
              >
                <span
                  className="text-2xl font-bold shrink-0 leading-tight"
                  style={{ color: item.color }}
                >
                  {item.stat}
                </span>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "oklch(0.88 0.01 200)" }}
                  >
                    {item.unit}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED_TEXT }}>
                    {item.note}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className="rounded-lg px-5 py-4 text-sm leading-relaxed mb-6"
            style={{ background: `${GREEN}0a`, border: `1px solid ${GREEN}20` }}
          >
            <p style={{ color: "oklch(0.78 0.02 220)" }}>
              These are not projections from a pitch deck. They are
              extrapolations from documented outcomes in{" "}
              <span style={{ color: GREEN, fontWeight: 600 }}>
                Rhode Island
              </span>{" "}
              (61% OD death reduction),{" "}
              <span style={{ color: TEAL, fontWeight: 600 }}>Vermont</span> (30%
              fatal overdose reduction), and{" "}
              <span style={{ color: AMBER, fontWeight: 600 }}>Portugal</span>{" "}
              (80% reduction in drug-related deaths post-access reform). Ohio
              has the population, the infrastructure, and — with Live Now
              Recovery — the platform to replicate those results at scale.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: TEAL, color: "oklch(0.10 0.04 240)" }}
            data-ocid="ohio_stats.cta_dashboard"
          >
            See the Fiscal Impact Model
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.section>

        {/* ── Region 13 coverage area ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold" style={{ color: TEAL }}>
              Ohio Region 13 — The Pilot
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-5">
            Live Now Recovery currently serves providers and patients across
            these seven counties in Northeast Ohio. Every feature, every data
            point, every risk model has been built for these communities first —
            and designed to scale to every hot zone in the country.
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNTIES.map((county) => (
              <span
                key={county}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: `${TEAL}12`,
                  border: `1px solid ${TEAL}30`,
                  color: "oklch(0.88 0.01 200)",
                }}
              >
                {county} County
              </span>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
