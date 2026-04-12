import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Globe,
  Heart,
  MapPin,
  Shield,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const HOT_ZONES = [
  { state: "WV", name: "West Virginia", rate: 80.9, rank: 1 },
  { state: "OH", name: "Ohio", rate: 47.2, rank: 2 },
  { state: "KY", name: "Kentucky", rate: 45.8, rank: 3 },
  { state: "TN", name: "Tennessee", rate: 40.7, rank: 4 },
  { state: "DC", name: "Washington DC", rate: 40.0, rank: 5 },
  { state: "LA", name: "Louisiana", rate: 38.5, rank: 6 },
  { state: "NV", name: "Nevada", rate: 37.6, rank: 7 },
  { state: "NM", name: "New Mexico", rate: 35.8, rank: 8 },
  { state: "DE", name: "Delaware", rate: 35.2, rank: 9 },
  { state: "MD", name: "Maryland", rate: 34.9, rank: 10 },
];

const STATE_POPULATIONS: Record<string, number> = {
  WV: 1793716,
  OH: 11756000,
  KY: 4512000,
  TN: 7051000,
  DC: 689545,
  LA: 4590000,
  NV: 3185000,
  NM: 2118000,
  DE: 1003000,
  MD: 6165000,
};

// ─── Color helpers ────────────────────────────────────────────────────────────

// Gradient from deep red (rank 1) to amber (rank 10)
function getRankColor(rank: number): string {
  const colors = [
    "#b71c1c", // rank 1 — deep red
    "#c62828",
    "#d32f2f",
    "#e53935",
    "#e64a19",
    "#f4511e",
    "#fb8c00",
    "#ffa000",
    "#ffb300",
    "#ffc107", // rank 10 — amber
  ];
  return colors[rank - 1] ?? "#ffc107";
}

function formatDollars(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
}

// ─── Impact projection calculator ────────────────────────────────────────────

function calcImpact(zone: (typeof HOT_ZONES)[number]) {
  const pop = STATE_POPULATIONS[zone.state] ?? 0;
  const annualDeaths = (zone.rate * pop) / 100_000;
  const preventable = annualDeaths * 0.1;
  const savings = preventable * 25_000;
  const referrals = preventable * 3;
  const stabilized = referrals * 0.63;
  const communityROI = stabilized * 45_000;
  return {
    preventable: Math.round(preventable),
    savings: Math.round(savings),
    stabilized: Math.round(stabilized),
    communityROI: Math.round(communityROI),
    total: Math.round(savings + communityROI),
  };
}

// ─── Shared motion wrapper ────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatHero({
  value,
  label,
  idx,
}: {
  value: string;
  label: string;
  idx: number;
}) {
  return (
    <FadeUp delay={0.1 + idx * 0.08}>
      <div className="bg-[oklch(0.16_0.04_240)] border border-[oklch(0.28_0.06_240)] rounded-2xl px-6 py-7 text-center">
        <p className="text-4xl sm:text-5xl font-extrabold text-[#00bcd4] mb-2 tabular-nums">
          {value}
        </p>
        <p className="text-sm text-[oklch(0.65_0.03_220)] leading-snug">
          {label}
        </p>
      </div>
    </FadeUp>
  );
}

function HotZoneCard({
  zone,
  selected,
  onClick,
  idx,
}: {
  zone: (typeof HOT_ZONES)[number];
  selected: boolean;
  onClick: () => void;
  idx: number;
}) {
  const maxRate = HOT_ZONES[0].rate;
  const pct = (zone.rate / maxRate) * 100;
  const isOhio = zone.state === "OH";

  return (
    <FadeUp delay={0.05 + idx * 0.06}>
      <button
        onClick={onClick}
        type="button"
        className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 cursor-pointer ${
          selected
            ? "border-[#00bcd4] bg-[oklch(0.18_0.05_240)] shadow-[0_0_20px_oklch(0.68_0.1_218/0.25)]"
            : "border-[oklch(0.26_0.05_240)] bg-[oklch(0.15_0.03_240)] hover:border-[oklch(0.38_0.06_240)] hover:bg-[oklch(0.17_0.04_240)]"
        }`}
        data-ocid={`national.hotzone.${zone.state.toLowerCase()}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                selected
                  ? "bg-[#00bcd4] text-[oklch(0.12_0.03_240)]"
                  : "bg-[oklch(0.22_0.05_240)] text-[oklch(0.75_0.02_220)]"
              }`}
            >
              {zone.rank}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-[oklch(0.93_0.01_220)] truncate">
                {zone.name}
              </p>
              {isOhio && (
                <span className="text-[10px] font-bold text-[#00bcd4] uppercase tracking-wide">
                  ✓ Pilot Active
                </span>
              )}
            </div>
          </div>
          <span
            className="text-sm font-bold tabular-nums shrink-0"
            style={{ color: getRankColor(zone.rank) }}
          >
            {zone.rate}
          </span>
        </div>
        {/* Burden bar */}
        <div className="h-1.5 rounded-full bg-[oklch(0.20_0.03_240)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: getRankColor(zone.rank) }}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.1 + idx * 0.04,
              ease: "easeOut",
            }}
          />
        </div>
        <p className="text-[10px] text-[oklch(0.52_0.03_220)] mt-1.5">
          per 100,000 population
        </p>
      </button>
    </FadeUp>
  );
}

function ImpactCard({
  icon: Icon,
  label,
  value,
  color,
  idx,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  idx: number;
}) {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: idx * 0.07 }}
      className="bg-[oklch(0.16_0.04_240)] border border-[oklch(0.26_0.05_240)] rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <p className="text-xs text-[oklch(0.60_0.03_220)]">{label}</p>
      </div>
      <p
        className="text-2xl sm:text-3xl font-extrabold tabular-nums"
        style={{ color }}
      >
        {value}
      </p>
    </motion.div>
  );
}

function TimelineStep({
  step,
  title,
  desc,
  idx,
}: {
  step: string;
  title: string;
  desc: string;
  idx: number;
}) {
  return (
    <FadeUp delay={idx * 0.12}>
      <div className="flex flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[oklch(0.18_0.05_240)] border border-[#00bcd4]/30 flex items-center justify-center">
          <span className="text-[#00bcd4] font-bold text-sm">{step}</span>
        </div>
        <div>
          <h3 className="font-bold text-[oklch(0.93_0.01_220)] mb-2">
            {title}
          </h3>
          <p className="text-sm text-[oklch(0.62_0.03_220)] leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </FadeUp>
  );
}

const COMPARISONS = [
  {
    location: "Rhode Island",
    intervention:
      "First US state to implement prison-based MAT program statewide",
    outcome: "61% reduction in overdose deaths post-release",
    icon: Shield,
    color: "#00e676",
  },
  {
    location: "Vermont",
    intervention:
      "Hub-and-Spoke MAT model — coordinated access across all counties",
    outcome: "30% reduction in opioid-related ER visits within 2 years",
    icon: Heart,
    color: "#00bcd4",
  },
  {
    location: "Dayton, Ohio",
    intervention: "Rapid naloxone distribution + peer support warm handoffs",
    outcome: "Reversed a 3-year rising overdose trend in under 18 months",
    icon: TrendingDown,
    color: "#ffb300",
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export function NationalImpactPage() {
  const [selectedState, setSelectedState] = useState("WV");

  const selectedZone =
    HOT_ZONES.find((z) => z.state === selectedState) ?? HOT_ZONES[0];
  const impact = calcImpact(selectedZone);

  return (
    <main
      className="min-h-screen bg-[oklch(0.12_0.03_240)]"
      data-ocid="national-impact.page"
    >
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.11_0.03_240)] border-b border-[oklch(0.22_0.05_240)]">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(ellipse, #00bcd4 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-8"
            style={{
              background:
                "radial-gradient(ellipse, #b71c1c 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <FadeUp>
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-[#00bcd4]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#00bcd4]">
                National Expansion
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[oklch(0.96_0.01_220)] leading-tight mb-6 max-w-4xl">
              The Overdose Crisis{" "}
              <span className="text-[#00bcd4]">Has a Geography</span>
            </h1>
            <p className="text-lg sm:text-xl text-[oklch(0.72_0.03_220)] max-w-3xl leading-relaxed mb-12">
              110,000+ Americans died of overdose last year. The deaths cluster
              in predictable hot zones — and those zones are underserved by
              exactly the kind of coordinated, real-time platform that already
              exists. One deployment. Any county. Days, not years.
            </p>
          </FadeUp>

          {/* Stat strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { value: "110,847", label: "Overdose deaths in 2022 — CDC" },
              { value: "$1.5T", label: "Annual economic burden — NIDA" },
              {
                value: "10 States",
                label: "Account for 60% of all overdose deaths",
              },
            ].map((s, i) => (
              <StatHero key={s.value} value={s.value} label={s.label} idx={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOT ZONES + PROJECTOR ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <FadeUp>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#00bcd4]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#00bcd4]">
              Where It's Happening
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[oklch(0.93_0.01_220)] mb-3">
            The 10 Highest-Burden States
          </h2>
          <p className="text-[oklch(0.65_0.03_220)] mb-12 max-w-2xl">
            Ranked by overdose death rate per 100,000 population. Select a state
            to see projected platform impact.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Hot zone cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {HOT_ZONES.map((zone, idx) => (
                <HotZoneCard
                  key={zone.state}
                  zone={zone}
                  selected={selectedState === zone.state}
                  onClick={() => setSelectedState(zone.state)}
                  idx={idx}
                />
              ))}
            </div>
          </div>

          {/* Right: Impact projector */}
          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <FadeUp delay={0.1}>
                <div className="bg-[oklch(0.14_0.04_240)] border border-[oklch(0.26_0.05_240)] rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[#00bcd4]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#00bcd4]">
                      Deployment Projector
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[oklch(0.93_0.01_220)] mb-1">
                    Live Now Recovery in{" "}
                    <span className="text-[#00bcd4]">{selectedZone.name}</span>
                  </h3>
                  <p className="text-sm text-[oklch(0.55_0.03_220)] mb-7">
                    Based on a 10% overdose reduction — consistent with outcomes
                    in Rhode Island (61%), Vermont (30%), and coordinated MAT
                    programs nationwide.
                  </p>

                  {/* Impact cards grid */}
                  <div className="grid grid-cols-2 gap-3 mb-7">
                    <ImpactCard
                      icon={Shield}
                      label="Annual Overdoses Prevented"
                      value={formatNumber(impact.preventable)}
                      color="#00e676"
                      idx={0}
                    />
                    <ImpactCard
                      icon={DollarSign}
                      label="Healthcare Dollars Saved"
                      value={formatDollars(impact.savings)}
                      color="#00bcd4"
                      idx={1}
                    />
                    <ImpactCard
                      icon={Heart}
                      label="People Stabilized in 30-Day MAT"
                      value={formatNumber(impact.stabilized)}
                      color="#7c3aed"
                      idx={2}
                    />
                    <ImpactCard
                      icon={Users}
                      label="Community ROI Generated"
                      value={formatDollars(impact.communityROI)}
                      color="#ffb300"
                      idx={3}
                    />
                  </div>

                  {/* Total */}
                  <div className="rounded-2xl border border-[#00bcd4]/30 bg-[oklch(0.17_0.05_240)] px-5 py-4 mb-7 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[oklch(0.60_0.03_220)] mb-0.5">
                        Total Projected Annual Impact
                      </p>
                      <p className="text-2xl font-extrabold text-[#00e676] tabular-nums">
                        {formatDollars(impact.total)}
                      </p>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-[#00bcd4] shrink-0 opacity-60" />
                  </div>

                  <Button
                    asChild
                    className="w-full bg-[#00bcd4] text-[oklch(0.10_0.03_240)] hover:bg-[oklch(0.76_0.12_218)] font-bold"
                    data-ocid="national.projector.cta"
                  >
                    <Link to="/contact">
                      Request Deployment Info
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPLOYMENT TIMELINE ───────────────────────────────────────────── */}
      <section className="bg-[oklch(0.11_0.025_240)] border-y border-[oklch(0.22_0.05_240)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <FadeUp>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#00bcd4]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#00bcd4]">
                Deployment
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[oklch(0.93_0.01_220)] mb-3">
              One Platform. Any Hot Zone.{" "}
              <span className="text-[#00bcd4]">Days, Not Years.</span>
            </h2>
            <p className="text-[oklch(0.65_0.03_220)] mb-14 max-w-2xl">
              The infrastructure is already built. Every new region just needs
              local data seeding and community activation.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connector line — desktop only */}
            <div
              className="hidden md:block absolute top-6 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-[#00bcd4]/20 via-[#00bcd4]/60 to-[#00bcd4]/20"
              aria-hidden="true"
            />
            {[
              {
                step: "D1",
                title: "Day 1 — Local Data Seeding",
                desc: "Provider locations, emergency rooms, Narcan kiosks, and harm reduction inventory loaded for the target county or state. Seed data persists across all future deploys.",
              },
              {
                step: "W1",
                title: "Week 1 — Community Activation",
                desc: "Citizen reporting layer goes live. Sentinel Risk heatmap calibrated to local Census and weather data. Prediction Engine initialized with regional risk factors.",
              },
              {
                step: "M1",
                title: "Month 1 — Impact Tracking",
                desc: "Fiscal impact odometer begins tracking real interventions. Dashboard analytics live for county health departments and state agencies. ROI reporting ready.",
              },
            ].map((s, i) => (
              <TimelineStep
                key={s.step}
                step={s.step}
                title={s.title}
                desc={s.desc}
                idx={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROOF: WHERE IT WORKS ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <FadeUp>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-[#00bcd4]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#00bcd4]">
              Proven Models
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[oklch(0.93_0.01_220)] mb-3">
            Where Coordinated Access Is Already Working
          </h2>
          <p className="text-[oklch(0.65_0.03_220)] mb-12 max-w-2xl">
            The interventions exist. The evidence is clear. The gap is
            coordination — and that's exactly what this platform closes.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMPARISONS.map((c, idx) => (
            <FadeUp key={c.location} delay={idx * 0.1}>
              <div className="bg-[oklch(0.15_0.04_240)] border border-[oklch(0.26_0.05_240)] rounded-2xl p-6 h-full flex flex-col">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${c.color}22` }}
                >
                  <c.icon className="w-5 h-5" style={{ color: c.color }} />
                </div>
                <h3 className="font-extrabold text-lg text-[oklch(0.93_0.01_220)] mb-2">
                  {c.location}
                </h3>
                <p className="text-sm text-[oklch(0.62_0.03_220)] leading-relaxed mb-4 flex-1">
                  {c.intervention}
                </p>
                <div
                  className="rounded-xl px-4 py-3 border mb-4"
                  style={{
                    background: `${c.color}11`,
                    borderColor: `${c.color}33`,
                  }}
                >
                  <p className="text-sm font-bold" style={{ color: c.color }}>
                    {c.outcome}
                  </p>
                </div>
                <div className="border-t border-[oklch(0.22_0.04_240)] pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.52_0.03_220)] mb-1">
                    What Live Now Recovery Adds
                  </p>
                  <p className="text-xs text-[oklch(0.65_0.03_220)]">
                    Real-time provider status, community reports, Sentinel
                    prediction engine, fiscal impact tracking
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[oklch(0.11_0.025_240)] border-t border-[oklch(0.22_0.05_240)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[oklch(0.93_0.01_220)] mb-4">
              Ready to Deploy in{" "}
              <span className="text-[#00bcd4]">Your Region?</span>
            </h2>
            <p className="text-[oklch(0.65_0.03_220)] mb-10 max-w-xl mx-auto text-lg">
              The platform is live in Ohio. The next hot zone is already
              waiting. Let's put the tools where the need is.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Button
                asChild
                size="lg"
                className="bg-[#00bcd4] text-[oklch(0.10_0.03_240)] hover:bg-[oklch(0.76_0.12_218)] font-bold px-8"
                data-ocid="national.cta.demo"
              >
                <Link to="/">
                  View the Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-[oklch(0.38_0.06_240)] text-[oklch(0.85_0.02_220)] hover:bg-[oklch(0.18_0.04_240)] px-8"
                data-ocid="national.cta.contact"
              >
                <Link to="/contact">Talk to the Team</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Built on Internet Computer",
                "NO-PHI",
                "HIPAA-Aware Architecture",
                "Ohio Pilot Active",
              ].map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-[oklch(0.32_0.06_240)] bg-[oklch(0.16_0.04_240)] text-[oklch(0.72_0.03_220)]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
