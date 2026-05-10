// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONSTANTS — Replace with your real campaign URLs before launch
// ─────────────────────────────────────────────────────────────────────────────
const GOFUNDME_URL = "YOUR_GOFUNDME_URL"; // Replace with your GoFundMe campaign URL
const KICKSTARTER_URL = "YOUR_KICKSTARTER_URL"; // Replace with your Kickstarter campaign URL
const PAYPAL_URL = "YOUR_PAYPAL_URL"; // Replace with your PayPal.me donation URL
const STRIPE_PAYMENT_LINK = "YOUR_STRIPE_PAYMENT_LINK"; // Replace with your Stripe Payment Link
// ─────────────────────────────────────────────────────────────────────────────

import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Award,
  Building2,
  ChevronDown,
  Clock,
  ExternalLink,
  Globe,
  Heart,
  Info,
  MapPin,
  Network,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SEO } from "../components/SEO";

// ─── SEO JSON-LD ─────────────────────────────────────────────────────────────
const DONATE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Live Now Recovery",
  url: "https://livenowrecovery.org",
  description:
    "Privacy-first real-time MAT provider and harm reduction resource platform in Ohio. Building real-time recovery coordination infrastructure to prevent overdose deaths.",
  address: {
    "@type": "PostalAddress",
    addressRegion: "OH",
    addressCountry: "US",
  },
  potentialAction: {
    "@type": "DonateAction",
    target: "https://livenowrecovery.org/donate",
  },
};

// ─── Animated counter hook ───────────────────────────────────────────────────
function useCountUp(target: number, duration = 2200, enabled = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  useEffect(() => {
    if (!enabled || target === 0) return;
    cancelAnimationFrame(frameRef.current);
    startRef.current = 0;
    function step(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
      else setCount(target);
    }
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);
  return count;
}

// ─── Section 1: Hero ─────────────────────────────────────────────────────────
const HOTSPOTS = [
  { cx: 490, cy: 180, r: 14, color: "#f59e0b", delay: 0 },
  { cx: 550, cy: 230, r: 10, color: "#f59e0b", delay: 0.6 },
  { cx: 510, cy: 260, r: 12, color: "#f59e0b", delay: 1.2 },
  { cx: 430, cy: 220, r: 9, color: "#f59e0b", delay: 0.9 },
  { cx: 575, cy: 200, r: 8, color: "#f59e0b", delay: 1.8 },
  { cx: 460, cy: 245, r: 11, color: "#f59e0b", delay: 0.3 },
  { cx: 390, cy: 190, r: 7, color: "#6ee7d0", delay: 0.7 },
  { cx: 600, cy: 250, r: 6, color: "#6ee7d0", delay: 1.4 },
  { cx: 340, cy: 210, r: 5, color: "#6ee7d0", delay: 2.0 },
  { cx: 530, cy: 290, r: 8, color: "#6ee7d0", delay: 0.5 },
];

function USMapBackground() {
  return (
    <svg
      viewBox="0 0 900 480"
      className="w-full h-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            stopColor="oklch(0.22 0.05 218)"
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.10 0.02 240)"
            stopOpacity="0"
          />
        </radialGradient>
        {HOTSPOTS.map((h, i) => (
          <radialGradient
            key={`hg-${h.cx}-${h.cy}`}
            id={`hg${i}`}
            cx="50%"
            cy="50%"
            r="50%"
          >
            <stop offset="0%" stopColor={h.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={h.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {/* Simplified US outline */}
      <path
        d="M 180 120 L 200 90 L 280 80 L 350 70 L 420 60 L 500 58 L 580 65 L 640 70 L 700 80 L 740 95 L 760 120 L 770 150 L 760 180 L 740 200 L 720 220 L 700 240 L 680 260 L 660 270 L 640 280 L 620 290 L 600 295 L 580 300 L 560 310 L 550 330 L 540 350 L 520 370 L 500 380 L 480 375 L 460 360 L 440 345 L 420 330 L 400 315 L 380 300 L 360 285 L 340 270 L 320 255 L 300 240 L 280 220 L 250 210 L 220 200 L 200 185 L 185 160 Z"
        fill="none"
        stroke="oklch(0.68 0.1 218 / 0.18)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Florida peninsula */}
      <path
        d="M 620 290 L 630 320 L 635 350 L 625 375 L 610 390 L 600 380 L 595 360 L 590 340 L 600 310 L 610 295"
        fill="none"
        stroke="oklch(0.68 0.1 218 / 0.18)"
        strokeWidth="1.5"
      />
      {/* Great Lakes hint */}
      <ellipse
        cx="520"
        cy="155"
        rx="30"
        ry="14"
        fill="oklch(0.62 0.12 218 / 0.08)"
      />
      <ellipse
        cx="570"
        cy="148"
        rx="18"
        ry="10"
        fill="oklch(0.62 0.12 218 / 0.08)"
      />
      {/* Background radial glow */}
      <ellipse cx="490" cy="220" rx="200" ry="160" fill="url(#bgGrad)" />
      {/* Hotspot pulses */}
      {HOTSPOTS.map((h, i) => (
        <g key={`hs-${h.cx}-${h.cy}`}>
          <circle
            cx={h.cx}
            cy={h.cy}
            r={h.r * 3}
            fill={`url(#hg${i})`}
            opacity="0.15"
          />
          <circle
            cx={h.cx}
            cy={h.cy}
            r={h.r}
            fill={h.color}
            opacity="0.85"
            style={{
              animation: "hotspotPulse 2.4s ease-in-out infinite",
              animationDelay: `${h.delay}s`,
              transformOrigin: `${h.cx}px ${h.cy}px`,
            }}
          />
        </g>
      ))}
      {/* Floating data stream lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`l${i}`}
          x1={100 + i * 150}
          y1={50 + i * 30}
          x2={400 + i * 80}
          y2={300 + i * 20}
          stroke="oklch(0.68 0.1 218)"
          strokeWidth="0.8"
          opacity="0.1"
          strokeDasharray="6 14"
          style={{
            animation: "streamFlow 4s linear infinite",
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </svg>
  );
}

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.11 0.025 240) 0%, oklch(0.16 0.04 220) 50%, oklch(0.13 0.03 240) 100%)",
      }}
      data-ocid="donate.hero"
    >
      <style>{`
        @keyframes hotspotPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.7); }
        }
        @keyframes streamFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes hotspotPulse { 0%, 100% { opacity: 0.7; } }
          @keyframes streamFlow { 0%, 100% { stroke-dashoffset: 0; } }
        }
      `}</style>
      {/* Map background */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <USMapBackground />
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.11_0.025_240)] pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20 pb-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-8"
          style={{
            background: "oklch(0.68 0.1 218 / 0.12)",
            border: "1px solid oklch(0.68 0.1 218 / 0.35)",
            color: "oklch(0.78 0.14 196)",
          }}
        >
          <Activity className="w-3.5 h-3.5" />
          Real-Time Recovery Infrastructure
        </motion.div>
        {/* Headline */}
        <motion.h1
          className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight text-white mb-6"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Recovery{" "}
          <span
            style={{
              background:
                "linear-gradient(90deg, oklch(0.78 0.14 196), oklch(0.72 0.15 175))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cannot
          </span>{" "}
          Wait.
        </motion.h1>
        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Every minute matters during addiction crisis intervention. We are
          building a real-time recovery coordination system that connects people
          to help before overdose, before incarceration, before it is too late.
        </motion.p>
        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a
            href="#donate"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.14 196), oklch(0.55 0.16 218))",
              color: "#fff",
              boxShadow: "0 4px 32px oklch(0.62 0.14 196 / 0.35)",
            }}
            data-ocid="donate.hero_cta_primary"
          >
            Help Build the Recovery Network
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2"
            style={{
              background: "oklch(0.68 0.1 218 / 0.10)",
              border: "1px solid oklch(0.68 0.1 218 / 0.35)",
              color: "oklch(0.82 0.12 196)",
            }}
            data-ocid="donate.hero_cta_secondary"
          >
            See How It Works
            <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>
        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-white/50"
        >
          {[
            { icon: Users, text: "2,400+ volunteers enrolled" },
            { icon: MapPin, text: "47 active ZIP codes" },
            { icon: Activity, text: "1,893 warm handoffs coordinated" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5">
              <Icon
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.68 0.1 218)" }}
              />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
      {/* Scroll-reveal badges */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, staggerChildren: 0.15 }}
      >
        {[
          {
            val: "Every 100 min",
            label: "An Ohioan dies from overdose",
            color: "#f59e0b",
          },
          {
            val: "72-hour",
            label: "Window for warm handoff success",
            color: "oklch(0.72 0.15 175)",
          },
          {
            val: "48 hrs",
            label: "Average fatal overdose recurrence window",
            color: "#f59e0b",
          },
        ].map(({ val, label, color }, i) => (
          <motion.div
            key={label}
            className="rounded-xl px-4 py-3 text-left"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            style={{
              background: "oklch(0.16 0.03 230 / 0.8)",
              border: `1px solid ${color}33`,
            }}
          >
            <p
              className="text-xl font-extrabold tabular-nums"
              style={{ color }}
            >
              {val}
            </p>
            <p className="text-xs text-white/55 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── Section 2: The Problem ───────────────────────────────────────────────────
const CRISIS_STAGES = [
  {
    icon: Heart,
    label: "Person enters crisis",
    color: "oklch(0.72 0.15 175)",
    note: "Often alone, unsupported",
  },
  {
    icon: Activity,
    label: "Calls ER or 911",
    color: "#f59e0b",
    note: "Average wait: 4-6 hours",
  },
  {
    icon: ExternalLink,
    label: "Discharged with no follow-up",
    color: "#f59e0b",
    note: "No warm handoff — 72% relapse risk",
  },
  {
    icon: Clock,
    label: "Waitlist for MAT: 3-6 weeks",
    color: "#f59e0b",
    note: "Motivation window closes in days",
  },
  {
    icon: Search,
    label: "Family searches for help",
    color: "#f59e0b",
    note: "Average: 23 calls before finding space",
  },
  {
    icon: Network,
    label: "Provider unavailable — no real-time visibility",
    color: "#f59e0b",
    note: "No coordination system exists",
  },
  {
    icon: RefreshCw,
    label: "Relapse during gap",
    color: "#f59e0b",
    note: "Gap in care is the leading cause",
  },
  {
    icon: Clock,
    label: "Fatal overdose window: average 48 hours",
    color: "#d97706",
    note: "Preventable with real-time coordination",
  },
];

function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const stat1 = useCountUp(5232, 2000, inView);
  const stat3 = useCountUp(25000, 2000, inView);

  return (
    <section
      id="problem"
      className="w-full px-4 py-20"
      style={{ background: "oklch(0.135 0.018 240)" }}
      data-ocid="donate.problem_section"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.68 0.1 218)" }}
          >
            The Crisis
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            The System Is Failing During
            <br className="hidden md:block" /> the Most Critical Window
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Current infrastructure leaves people stranded in the hours and days
            that decide everything. Here is what happens without real-time
            recovery coordination.
          </p>
        </motion.div>
        {/* Timeline */}
        <div className="relative mb-16">
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[oklch(0.68_0.1_218_/_0.5)] to-transparent" />
          <div className="flex flex-col gap-4">
            {CRISIS_STAGES.map((stage, i) => (
              <motion.div
                key={stage.label}
                className="relative flex items-start gap-5 pl-16 md:pl-20"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <div
                  className="absolute left-3 md:left-5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: `${stage.color}18`,
                    border: `1.5px solid ${stage.color}60`,
                  }}
                >
                  <stage.icon
                    className="w-3.5 h-3.5"
                    style={{ color: stage.color }}
                  />
                </div>
                <div
                  className="flex-1 rounded-xl px-4 py-3"
                  style={{
                    background: "oklch(0.17 0.022 240)",
                    border: `1px solid ${stage.color}25`,
                  }}
                >
                  <p className="text-sm font-semibold text-white/90">
                    {stage.label}
                  </p>
                  <p className="text-xs text-white/45 mt-0.5">{stage.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Stat cards */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              val: stat1.toLocaleString(),
              suffix: "",
              label: "Ohio overdose deaths in 2023 — one every 100 minutes",
              color: "#f59e0b",
            },
            {
              val: "50-70%",
              suffix: "",
              label: "Reduction in opioid mortality with proper MAT access",
              color: "oklch(0.72 0.15 175)",
            },
            {
              val: `$${stat3.toLocaleString()}`,
              suffix: "",
              label: "Average savings per prevented emergency OD event",
              color: "oklch(0.72 0.15 175)",
            },
          ].map(({ val, label, color }, i) => (
            <motion.div
              key={label}
              className="rounded-2xl px-6 py-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              style={{
                background: "oklch(0.17 0.022 240)",
                border: `1px solid ${color}30`,
              }}
            >
              <p
                className="text-3xl font-black tabular-nums mb-1"
                style={{ color }}
              >
                {val}
              </p>
              <p className="text-xs text-white/55 leading-snug">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Platform Flow ─────────────────────────────────────────────────
const FLOW_STEPS = [
  {
    n: 1,
    icon: Heart,
    title: "Person Enters Crisis",
    desc: "Someone in active addiction or overdose risk reaches out or is identified.",
    live: "Alert threshold: active",
  },
  {
    n: 2,
    icon: Zap,
    title: "Alert Generated",
    desc: "Platform creates a real-time coordination event assigned to the nearest available responders.",
    live: "Response time: 8 min avg",
  },
  {
    n: 3,
    icon: Activity,
    title: "Provider Availability Checked",
    desc: "System queries all active MAT clinics, ERs, telehealth, and kiosks in real time.",
    live: "Providers available: 14",
  },
  {
    n: 4,
    icon: RefreshCw,
    title: "Warm Handoff Initiated",
    desc: "A volunteer or provider directly bridges the person to treatment — no cold referral.",
    live: "Success rate: 68%",
  },
  {
    n: 5,
    icon: MapPin,
    title: "MAT Resources Located",
    desc: "Nearest MAT slots, Narcan kiosks, and harm reduction supplies are identified and shared.",
    live: "MAT slots open: 3",
  },
  {
    n: 6,
    icon: Users,
    title: "Community Support Engaged",
    desc: "Peer support specialists, volunteers, and recovery coaches are notified to follow up.",
    live: "Volunteers alerted: 7",
  },
  {
    n: 7,
    icon: TrendingUp,
    title: "Follow-Up Tracking Active",
    desc: "Outcome is logged — did the person access care? Completions drive credential badges.",
    live: "Outcome tracked: yes",
  },
];

function PlatformFlowSection() {
  return (
    <section
      id="how-it-works"
      className="w-full px-4 py-20"
      style={{ background: "oklch(0.11 0.015 240)" }}
      data-ocid="donate.platform_flow_section"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.68 0.1 218)" }}
          >
            The Platform
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            How Real-Time Recovery Coordination Works
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            From crisis to care in minutes — not weeks.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {FLOW_STEPS.slice(0, 4).map((step, i) => (
            <FlowCard key={step.n} step={step} i={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {FLOW_STEPS.slice(4).map((step, i) => (
            <FlowCard key={step.n} step={step} i={i + 4} />
          ))}
        </div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-white/60 text-lg mb-6 italic">
            "This system should already exist everywhere. Help build it."
          </p>
          <a
            href="#donate"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.14 196), oklch(0.55 0.16 218))",
              color: "#fff",
            }}
            data-ocid="donate.flow_cta"
          >
            Fund the Infrastructure <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function FlowCard({ step, i }: { step: (typeof FLOW_STEPS)[0]; i: number }) {
  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col gap-3 cursor-default"
      style={{
        background: "oklch(0.16 0.025 235 / 0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid oklch(0.68 0.1 218 / 0.12)",
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 0 28px oklch(0.68 0.1 218 / 0.18)",
      }}
      data-ocid={`donate.flow_step.${step.n}`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
          style={{
            background: "oklch(0.62 0.14 196 / 0.15)",
            color: "oklch(0.78 0.14 196)",
            border: "1px solid oklch(0.62 0.14 196 / 0.3)",
          }}
        >
          {step.n}
        </span>
        <step.icon
          className="w-4 h-4"
          style={{ color: "oklch(0.72 0.12 196)" }}
        />
      </div>
      <div>
        <p className="text-sm font-bold text-white mb-1">{step.title}</p>
        <p className="text-xs text-white/55 leading-relaxed">{step.desc}</p>
      </div>
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit mt-auto"
        style={{
          background: "oklch(0.68 0.1 218 / 0.10)",
          color: "oklch(0.78 0.14 196)",
          border: "1px solid oklch(0.68 0.1 218 / 0.2)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.68_0.1_218)] animate-pulse" />
        {step.live}
      </span>
    </motion.div>
  );
}

// ─── Section 4: Impact Tiers ──────────────────────────────────────────────────
const IMPACT_CARDS = [
  {
    amount: "$10/mo",
    tier: "Community Protector",
    desc: "Keeps 1 Narcan kiosk stocked with supplies for one month. Real lives, real access.",
    color: "oklch(0.72 0.15 175)",
    bars: [
      { label: "Narcan kits", pct: 85 },
      { label: "Syringe supply", pct: 70 },
      { label: "Test strips", pct: 90 },
    ],
  },
  {
    amount: "$25/mo",
    tier: "Warm Handoff Enabler",
    desc: "Funds coordination for 3 warm handoffs connecting people in crisis to providers.",
    color: "oklch(0.68 0.1 218)",
    bars: [
      { label: "Handoffs funded", pct: 75 },
      { label: "Volunteer hours", pct: 60 },
      { label: "Follow-up coverage", pct: 80 },
    ],
  },
  {
    amount: "$50/mo",
    tier: "ZIP Code Activator",
    desc: "Extends real-time provider coverage to one new ZIP code in Ohio. 47 ZIP codes, growing.",
    color: "#f59e0b",
    bars: [
      { label: "Coverage radius", pct: 100 },
      { label: "Provider visibility", pct: 95 },
      { label: "Resource mapping", pct: 88 },
    ],
  },
  {
    amount: "Custom",
    tier: "Network Expander",
    desc: "Fuel the expansion — any amount scales the recovery infrastructure.",
    color: "oklch(0.72 0.12 290)",
    bars: [
      { label: "Network nodes", pct: 60 },
      { label: "State coverage", pct: 45 },
      { label: "Phase 2 progress", pct: 30 },
    ],
  },
];

const TRUST_STATS = [
  { val: 2413, label: "Volunteers", color: "oklch(0.72 0.15 175)" },
  { val: 47, label: "Active ZIP Codes", color: "oklch(0.68 0.1 218)" },
  { val: 38, label: "Recovery Partners", color: "#f59e0b" },
  { val: 1893, label: "Interventions", color: "oklch(0.72 0.12 290)" },
];

function ImpactTiersSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [amount, setAmount] = useState(25);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });
  const trustVal0 = useCountUp(TRUST_STATS[0].val, 1800, statsInView);
  const trustVal1 = useCountUp(TRUST_STATS[1].val, 1800, statsInView);
  const trustVal2 = useCountUp(TRUST_STATS[2].val, 1800, statsInView);
  const trustVal3 = useCountUp(TRUST_STATS[3].val, 1800, statsInView);
  const trustVals = [trustVal0, trustVal1, trustVal2, trustVal3];

  const handoffs = Math.floor(amount * 0.6);
  const narcan = Math.floor(amount * 0.4);
  const people = Math.floor(amount * 2.5);

  return (
    <section
      className="w-full px-4 py-20"
      style={{ background: "oklch(0.135 0.018 240)" }}
      data-ocid="donate.impact_tiers_section"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.68 0.1 218)" }}
          >
            Your Impact
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            See the Real Impact of Your Contribution
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Every tier maps directly to a measurable community outcome.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {IMPACT_CARDS.map((card, i) => (
            <motion.div
              key={card.tier}
              className="rounded-2xl p-5 flex flex-col gap-4 cursor-pointer transition-all duration-300"
              style={{
                background: "oklch(0.17 0.022 240)",
                border: `1px solid ${card.color}${hovered === i ? "60" : "28"} `,
                boxShadow: hovered === i ? `0 0 32px ${card.color}20` : "none",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              data-ocid={`donate.impact_card.${i + 1}`}
            >
              <div>
                <p
                  className="text-2xl font-black"
                  style={{ color: card.color }}
                >
                  {card.amount}
                </p>
                <p className="text-xs font-bold uppercase tracking-wide text-white/40 mt-0.5">
                  {card.tier}
                </p>
              </div>
              <p className="text-xs text-white/65 leading-relaxed flex-1">
                {card.desc}
              </p>
              {hovered === i && (
                <motion.div
                  className="flex flex-col gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25 }}
                >
                  {card.bars.map((bar, j) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs text-white/45 mb-1">
                        <span>{bar.label}</span>
                        <span>{bar.pct}%</span>
                      </div>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ background: "oklch(0.22 0.02 240)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: card.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${bar.pct}%` }}
                          transition={{ duration: 0.5, delay: j * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        {/* Impact calculator */}
        <motion.div
          className="rounded-2xl p-8 mb-12"
          style={{
            background: "oklch(0.17 0.022 240)",
            border: "1px solid oklch(0.68 0.1 218 / 0.2)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          data-ocid="donate.calculator"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">
            Impact Calculator
          </p>
          <div className="flex items-end gap-4 mb-4">
            <p
              className="text-5xl font-black"
              style={{ color: "oklch(0.72 0.15 175)" }}
            >
              ${amount}
            </p>
            <p className="text-white/50 text-sm mb-2">per month</p>
          </div>
          <input
            type="range"
            min={5}
            max={500}
            step={5}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer mb-6"
            style={{
              background: `linear-gradient(to right, oklch(0.62 0.14 196) ${(amount / 500) * 100}%, oklch(0.22 0.02 240) ${(amount / 500) * 100}%)`,
              accentColor: "oklch(0.62 0.14 196)",
            }}
            data-ocid="donate.amount_slider"
          />
          <p className="text-white/70 text-sm leading-relaxed">
            Your{" "}
            <span
              className="font-bold"
              style={{ color: "oklch(0.72 0.15 175)" }}
            >
              ${amount}/mo
            </span>{" "}
            would help coordinate approximately{" "}
            <span className="font-bold text-white">
              {handoffs} warm handoffs
            </span>
            , <span className="font-bold text-white">{narcan} Narcan kits</span>
            , and reach{" "}
            <span className="font-bold text-white">{people} people</span> in
            your community this year.
          </p>
        </motion.div>
        {/* Trust stats */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TRUST_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl px-4 py-4 text-center"
              style={{
                background: "oklch(0.17 0.022 240)",
                border: `1px solid ${s.color}25`,
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p
                className="text-2xl font-black tabular-nums"
                style={{ color: s.color }}
              >
                {trustVals[i].toLocaleString()}
              </p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 5: Human Stories ─────────────────────────────────────────────────
const STORIES = [
  {
    quote:
      "I was discharged from MetroHealth at 2am with a pamphlet. No phone number. No appointment. Three days later I was in the same ER.",
    who: "Marcus, 34, Cleveland",
    outcome: "Now: 60 days clean through MAT access",
    bg: "linear-gradient(135deg, oklch(0.16 0.04 210), oklch(0.14 0.025 230))",
    accent: "oklch(0.72 0.15 175)",
  },
  {
    quote:
      "I called 23 treatment centers before finding one that had space. My son did not have 23 days.",
    who: "A Mother in Akron",
    outcome: "Now advocating for real-time availability systems",
    bg: "linear-gradient(135deg, oklch(0.15 0.022 240), oklch(0.13 0.020 250))",
    accent: "#f59e0b",
  },
  {
    quote:
      "We see the same patients cycling through ERs because there is no bridge. This platform changes that window.",
    who: "Dr. Patel, Recovery Clinic Director",
    outcome: "Partner clinic — 47 warm handoffs completed",
    bg: "linear-gradient(135deg, oklch(0.14 0.028 225), oklch(0.17 0.035 215))",
    accent: "oklch(0.68 0.1 218)",
  },
  {
    quote:
      "I earned my Recovery Navigator badge after 25 handoffs. It is not a digital trophy. It is proof the system worked.",
    who: "Volunteer, Cuyahoga County",
    outcome: "Recovery Navigator credential — 25 handoffs coordinated",
    bg: "linear-gradient(135deg, oklch(0.15 0.03 160), oklch(0.14 0.025 200))",
    accent: "oklch(0.68 0.17 155)",
  },
];

function StoriesSection() {
  return (
    <section
      className="w-full px-4 py-20"
      style={{ background: "oklch(0.11 0.015 240)" }}
      data-ocid="donate.stories_section"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.68 0.1 218)" }}
          >
            Human Stories
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Every Number Is a Person
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            The faces behind the data. Hopeful. Serious. Real.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {STORIES.map((s, i) => (
            <motion.div
              key={s.who}
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background: s.bg, border: `1px solid ${s.accent}30` }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              data-ocid={`donate.story.${i + 1}`}
            >
              <p className="text-xl md:text-2xl font-semibold italic text-white/90 leading-snug flex-1">
                &ldquo;{s.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-bold" style={{ color: s.accent }}>
                  {s.who}
                </p>
                <p className="text-xs text-white/45 mt-0.5">{s.outcome}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Transparency Dashboard ───────────────────────────────────────
const DASHBOARD_METRICS = [
  {
    label: "Active Recovery Resources",
    val: 847,
    desc: "Kiosks, clinics, telehealth, ERs",
    color: "oklch(0.72 0.15 175)",
    pulse: "teal",
  },
  {
    label: "Warm Handoffs Today",
    val: 23,
    desc: "Coordinated in last 24h",
    color: "oklch(0.68 0.1 218)",
    pulse: "teal",
  },
  {
    label: "Narcan Kits Available",
    val: 1204,
    desc: "Across active ZIP codes",
    color: "oklch(0.72 0.15 175)",
    pulse: "teal",
  },
  {
    label: "Volunteer Responders",
    val: 2413,
    desc: "Active this week",
    color: "oklch(0.68 0.1 218)",
    pulse: "teal",
  },
  {
    label: "Response Coverage",
    val: 74,
    desc: "Ohio counties with real-time visibility",
    suffix: "%",
    color: "#f59e0b",
    pulse: "amber",
  },
  {
    label: "Provider Availability",
    val: 0,
    desc: "Updated every 15 minutes",
    label2: "Live",
    color: "oklch(0.72 0.15 175)",
    pulse: "teal",
  },
  {
    label: "New Credentials Earned",
    val: 12,
    desc: "Badges minted today",
    color: "oklch(0.72 0.12 290)",
    pulse: "teal",
  },
];

const ACTIVITY_FEED = [
  "Warm handoff completed — Cleveland, OH",
  "Narcan Hero badge earned — Akron, OH",
  "Provider updated availability — Youngstown, OH",
  "Community Sentinel credential minted — Columbus, OH",
  "Narcan kiosk restocked — Canton, OH",
  "Recovery Navigator badge earned — Toledo, OH",
  "Warm handoff completed — Dayton, OH",
  "New volunteer enrolled — Lorain, OH",
  "MAT slot opened — Cleveland, OH",
  "Follow-up completed — Cincinnati, OH",
];

function DashboardSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const val0 = useCountUp(DASHBOARD_METRICS[0].val, 1800, inView);
  const val1 = useCountUp(DASHBOARD_METRICS[1].val, 1800, inView);
  const val2 = useCountUp(DASHBOARD_METRICS[2].val, 1800, inView);
  const val3 = useCountUp(DASHBOARD_METRICS[3].val, 1800, inView);
  const val4 = useCountUp(DASHBOARD_METRICS[4].val, 1800, inView);
  const val5 = useCountUp(DASHBOARD_METRICS[5].val, 1800, inView);
  const val6 = useCountUp(DASHBOARD_METRICS[6].val, 1800, inView);
  const vals = [val0, val1, val2, val3, val4, val5, val6];
  const [feedIdx, setFeedIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setFeedIdx((f) => (f + 1) % ACTIVITY_FEED.length),
      2800,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="w-full px-4 py-20"
      style={{ background: "oklch(0.135 0.018 240)" }}
      data-ocid="donate.dashboard_section"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.68 0.1 218)" }}
          >
            Mission Control
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
            Real-Time Recovery Infrastructure
          </h2>
          <p className="text-white/50 text-sm">
            Not a charity. Operational emergency infrastructure.
          </p>
        </motion.div>
        <motion.div
          ref={ref}
          className="rounded-2xl p-6 md:p-8 mt-10"
          style={{
            background: "oklch(0.16 0.022 235 / 0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid oklch(0.68 0.1 218 / 0.18)",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Top row — 4 metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {DASHBOARD_METRICS.slice(0, 4).map((m, i) => (
              <MetricCard key={m.label} metric={m} val={vals[i]} />
            ))}
          </div>
          {/* Bottom row — 3 metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {DASHBOARD_METRICS.slice(4).map((m, i) => (
              <MetricCard
                key={m.label}
                metric={m}
                val={m.val === 0 ? 0 : vals[i + 4]}
                isLive={m.val === 0}
              />
            ))}
          </div>
          {/* Activity feed */}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3 overflow-hidden"
            style={{
              background: "oklch(0.12 0.015 240)",
              border: "1px solid oklch(0.22 0.02 240)",
            }}
          >
            <span
              className="flex-shrink-0 w-2 h-2 rounded-full animate-pulse"
              style={{ background: "oklch(0.72 0.15 175)" }}
            />
            <motion.p
              key={feedIdx}
              className="text-sm text-white/65 truncate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {ACTIVITY_FEED[feedIdx]}
            </motion.p>
          </div>
          <p className="text-xs text-white/25 mt-4 text-center">
            All metrics are representative. Platform operates under a strict
            NO-PHI policy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function MetricCard({
  metric,
  val,
  isLive = false,
}: {
  metric: (typeof DASHBOARD_METRICS)[0];
  val: number;
  isLive?: boolean;
}) {
  return (
    <div
      className="rounded-xl px-4 py-4 flex flex-col gap-1"
      style={{
        background: "oklch(0.13 0.015 240)",
        border: `1px solid ${metric.color}20`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
          style={{
            background:
              metric.pulse === "amber" ? "#f59e0b" : "oklch(0.72 0.15 175)",
          }}
        />
        <p className="text-xs text-white/40 leading-snug truncate">
          {metric.label}
        </p>
      </div>
      <p
        className="text-2xl font-black tabular-nums"
        style={{ color: metric.color }}
      >
        {isLive ? "Live" : `${val.toLocaleString()}${metric.suffix ?? ""}`}
      </p>
      <p className="text-xs text-white/35">{metric.desc}</p>
    </div>
  );
}

// ─── Section 7: Donation Experience ──────────────────────────────────────────
const DONATION_BUTTONS = [
  {
    label: "Donate on GoFundMe",
    url: GOFUNDME_URL,
    bg: "linear-gradient(135deg, oklch(0.45 0.14 155), oklch(0.38 0.13 170))",
    badge: null,
  },
  {
    label: "Back Us on Kickstarter",
    url: KICKSTARTER_URL,
    bg: "linear-gradient(135deg, oklch(0.50 0.15 155), oklch(0.42 0.14 165))",
    badge: null,
  },
  {
    label: "Donate via PayPal",
    url: PAYPAL_URL,
    bg: "linear-gradient(135deg, oklch(0.50 0.12 230), oklch(0.40 0.14 240))",
    badge: null,
  },
  {
    label: "Set Up Monthly Giving",
    url: STRIPE_PAYMENT_LINK,
    bg: "linear-gradient(135deg, oklch(0.55 0.14 196), oklch(0.45 0.16 218))",
    badge: "Recommended",
  },
];

const IS_PLACEHOLDER = DONATION_BUTTONS.some((b) => b.url.startsWith("YOUR_"));

function DonationSection() {
  const [amount, setAmount] = useState(25);
  const handoffs = Math.floor(amount * 0.6);
  const narcan = Math.floor(amount * 0.4);
  const people = Math.floor(amount * 2.5);

  return (
    <section
      id="donate"
      className="w-full px-4 py-20"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.13 0.030 225) 0%, oklch(0.11 0.015 240) 100%)",
      }}
      data-ocid="donate.donation_section"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.68 0.1 218)" }}
          >
            Fund the Future
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Fund the Future of Recovery
          </h2>
          <p className="text-white/60">
            Every dollar builds real infrastructure that saves real lives.
          </p>
        </motion.div>
        {/* Slider */}
        <motion.div
          className="rounded-2xl p-7 mb-6"
          style={{
            background: "oklch(0.16 0.025 235 / 0.8)",
            border: "1px solid oklch(0.68 0.1 218 / 0.22)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-end gap-3 mb-4">
            <p
              className="text-5xl font-black"
              style={{ color: "oklch(0.72 0.15 175)" }}
            >
              ${amount}
            </p>
            <p className="text-white/50 text-sm mb-2">/ month</p>
          </div>
          <input
            type="range"
            min={5}
            max={500}
            step={5}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer mb-5"
            style={{
              background: `linear-gradient(to right, oklch(0.62 0.14 196) ${(amount / 500) * 100}%, oklch(0.22 0.02 240) ${(amount / 500) * 100}%)`,
              accentColor: "oklch(0.62 0.14 196)",
            }}
            data-ocid="donate.main_slider"
          />
          <p className="text-sm text-white/65 leading-relaxed">
            Your{" "}
            <span
              className="font-bold"
              style={{ color: "oklch(0.72 0.15 175)" }}
            >
              ${amount}/mo
            </span>{" "}
            would help coordinate approximately{" "}
            <span className="font-bold text-white">
              {handoffs} warm handoffs
            </span>
            , <span className="font-bold text-white">{narcan} Narcan kits</span>
            , and reach{" "}
            <span className="font-bold text-white">{people} people</span> in
            your community this year.
          </p>
        </motion.div>
        {/* Donation buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {DONATION_BUTTONS.map(({ label, url, bg, badge }, i) => (
            <motion.a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center justify-between rounded-xl px-5 py-4 font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2"
              style={{ background: bg }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              data-ocid={`donate.platform_button.${i + 1}`}
            >
              <span>{label}</span>
              <div className="flex items-center gap-2">
                {badge && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    {badge}
                  </span>
                )}
                <ExternalLink className="w-3.5 h-3.5 opacity-75" />
              </div>
            </motion.a>
          ))}
        </div>
        {/* Placeholder notice */}
        {IS_PLACEHOLDER && (
          <div
            className="rounded-xl px-5 py-4 flex items-start gap-3 mb-6"
            style={{
              background: "oklch(0.65 0.12 55 / 0.10)",
              border: "1px solid oklch(0.75 0.15 60 / 0.25)",
            }}
            data-ocid="donate.placeholder_notice"
          >
            <Info
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "oklch(0.82 0.15 60)" }}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: "oklch(0.75 0.08 60)" }}
            >
              <strong>Developer note:</strong> Donation links are placeholders.
              Replace{" "}
              <code className="font-mono text-[11px]">GOFUNDME_URL</code>,{" "}
              <code className="font-mono text-[11px]">KICKSTARTER_URL</code>,{" "}
              <code className="font-mono text-[11px]">PAYPAL_URL</code>, and{" "}
              <code className="font-mono text-[11px]">STRIPE_PAYMENT_LINK</code>{" "}
              at the top of{" "}
              <code className="font-mono text-[11px]">DonatePage.tsx</code>.
            </p>
          </div>
        )}
        {/* Emotional reinforcement */}
        <motion.div
          className="rounded-2xl p-6 text-center"
          style={{
            background: "oklch(0.17 0.028 220)",
            border: "1px solid oklch(0.68 0.1 218 / 0.2)",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Award
            className="w-8 h-8 mx-auto mb-3"
            style={{ color: "oklch(0.72 0.12 290)" }}
          />
          <p className="text-white font-semibold mb-2">
            You are helping create intervention before tragedy.
          </p>
          <p className="text-white/55 text-sm mb-3">
            Recovery cannot wait — and with your support, it does not have to.
          </p>
          <p className="text-xs" style={{ color: "oklch(0.72 0.12 290)" }}>
            Monthly donors of $25+ receive a digital Community Supporter
            credential badge — permanent, on-chain recognition of your
            contribution.
          </p>
          <p className="text-xs text-white/30 mt-3">
            Your donation is processed securely by the payment provider. We
            never store your payment information.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section 8: Community Movement ───────────────────────────────────────────
const MOVEMENT_CARDS = [
  {
    icon: Users,
    title: "Become a Community Responder",
    desc: "Join 2,413 Ohio volunteers — earn credentials, build your impact, and help coordinate real recovery interventions in your community.",
    cta: { label: "Volunteer Now", to: "/helper" },
    color: "oklch(0.72 0.15 175)",
  },
  {
    icon: Building2,
    title: "Partner Organizations",
    desc: "We work alongside Cuyahoga County Board of Health, AIDS Task Force of Greater Cleveland, and recovery orgs across Ohio. Join the network.",
    cta: null,
    color: "oklch(0.68 0.1 218)",
  },
  {
    icon: Globe,
    title: "National Growth Roadmap",
    desc: "Ohio is Phase 1. West Virginia, Kentucky, Tennessee, and the top 10 overdose hot zones are next. Help us get there.",
    cta: null,
    color: "#f59e0b",
  },
];

const US_STATES = [
  { id: "WV", cx: 570, cy: 220, phase: 2, name: "West Virginia" },
  { id: "KY", cx: 530, cy: 245, phase: 2, name: "Kentucky" },
  { id: "TN", cx: 530, cy: 270, phase: 2, name: "Tennessee" },
  { id: "OH", cx: 510, cy: 195, phase: 1, name: "Ohio" },
];

function MovementSection() {
  return (
    <section
      className="w-full px-4 py-20"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.14 0.030 220) 0%, oklch(0.12 0.020 240) 100%)",
      }}
      data-ocid="donate.movement_section"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.68 0.1 218)" }}
          >
            Community Movement
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Recovery Is a Community Infrastructure Problem.
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            We are building the systems communities need to respond faster,
            coordinate better, and save lives together.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {MOVEMENT_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "oklch(0.17 0.022 240)",
                border: `1px solid ${card.color}28`,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              data-ocid={`donate.movement_card.${i + 1}`}
            >
              <card.icon className="w-7 h-7" style={{ color: card.color }} />
              <div className="flex-1">
                <p className="font-bold text-white mb-2">{card.title}</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  {card.desc}
                </p>
              </div>
              {card.cta && (
                <Button
                  asChild
                  className="mt-auto w-full"
                  style={{ background: card.color, color: "#0d1117" }}
                >
                  <Link to={card.cta.to} data-ocid="donate.volunteer_cta">
                    {card.cta.label}
                  </Link>
                </Button>
              )}
            </motion.div>
          ))}
        </div>
        {/* US Phase map */}
        <motion.div
          className="rounded-2xl p-6 mb-12"
          style={{
            background: "oklch(0.17 0.022 240)",
            border: "1px solid oklch(0.68 0.1 218 / 0.15)",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4 text-center">
            National Expansion Roadmap
          </p>
          <svg
            viewBox="180 100 500 280"
            className="w-full h-40 md:h-52"
            aria-label="US expansion map"
            role="img"
          >
            <path
              d="M 180 120 L 200 90 L 280 80 L 350 70 L 420 60 L 500 58 L 580 65 L 640 70 L 700 80 L 740 95 L 760 120 L 770 150 L 760 180 L 740 200 L 720 220 L 700 240 L 680 260 L 660 270 L 640 280 L 620 290 L 600 295 L 580 300 L 560 310 L 550 330 L 540 350 L 520 370 L 500 380 L 480 375 L 460 360 L 440 345 L 420 330 L 400 315 L 380 300 L 360 285 L 340 270 L 320 255 L 300 240 L 280 220 L 250 210 L 220 200 L 200 185 L 185 160 Z"
              fill="oklch(0.20 0.02 240 / 0.4)"
              stroke="oklch(0.30 0.03 230 / 0.5)"
              strokeWidth="1"
            />
            {US_STATES.map((s) => (
              <g key={s.id}>
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={s.phase === 1 ? 18 : 12}
                  fill={
                    s.phase === 1
                      ? "oklch(0.62 0.14 196 / 0.3)"
                      : "oklch(0.65 0.14 60 / 0.25)"
                  }
                  stroke={s.phase === 1 ? "oklch(0.68 0.14 196)" : "#f59e0b"}
                  strokeWidth="1.5"
                  style={
                    s.phase === 1
                      ? { animation: "hotspotPulse 2.5s ease-in-out infinite" }
                      : undefined
                  }
                />
                <text
                  x={s.cx}
                  y={s.cy + 4}
                  textAnchor="middle"
                  fontSize="8"
                  fill={s.phase === 1 ? "oklch(0.82 0.14 196)" : "#f59e0b"}
                  fontWeight="bold"
                >
                  {s.id}
                </text>
                <text
                  x={s.cx}
                  y={s.cy + 26}
                  textAnchor="middle"
                  fontSize="7"
                  fill="rgba(255,255,255,0.4)"
                >
                  {s.phase === 1 ? "Phase 1" : "Phase 2"}
                </text>
              </g>
            ))}
          </svg>
        </motion.div>
        {/* Final CTA */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              asChild
              className="min-h-[52px] px-10 font-bold text-base rounded-xl gap-2 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.62 0.14 196), oklch(0.55 0.16 218))",
                color: "#fff",
                boxShadow: "0 4px 32px oklch(0.62 0.14 196 / 0.35)",
              }}
            >
              <Link to="/helper" data-ocid="donate.join_network_cta">
                Join the Recovery Network <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <p className="text-white/30 text-xs mt-6">
              Live Now Recovery. Built on the Internet Computer. Transparent by
              design. Community by choice.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Page Root ────────────────────────────────────────────────────────────────
export function DonatePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "oklch(0.11 0.015 240)" }}
      data-ocid="donate.page"
    >
      <SEO
        title="Fund the Future of Recovery | Live Now Recovery"
        description="Every dollar builds real-time recovery coordination infrastructure that saves lives. Fund warm handoffs, Narcan kits, and overdose intervention in Ohio's hardest-hit communities."
        keywords="donate recovery Ohio, fund MAT treatment, opioid crisis donation, Narcan kits fund, harm reduction donation Ohio, recovery infrastructure"
        canonical="/donate"
        jsonLd={DONATE_JSON_LD}
      />
      <HeroSection />
      <ProblemSection />
      <PlatformFlowSection />
      <ImpactTiersSection />
      <StoriesSection />
      <DashboardSection />
      <DonationSection />
      <MovementSection />
    </main>
  );
}
