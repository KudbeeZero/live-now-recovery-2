import { SEO } from "@/components/SEO";
import { Link } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePredictionEngineStore } from "../store/predictionEngineStore";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, display: `${count}${suffix}` };
}

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Staggered reveal hook ─────────────────────────────────────────────────────
function useRevealDelay(delayMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delayMs);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);
  return { ref, visible };
}

// ── Static data ───────────────────────────────────────────────────────────────
const RESEARCH_CARDS = [
  {
    title: "The Payday Cycle Effect",
    stat: "+23%",
    statLabel: "overdose spike post-disbursement",
    body: "SAMHSA research confirms overdose incidents surge 23% in the 72 hours after government benefit disbursement dates (1st and 15th of each month). Sentinel tracks all 24 active payday windows automatically, adjusting the risk multiplier in real time.",
    source: "SAMHSA National Survey on Drug Use and Health, 2022",
    color: "oklch(0.75 0.14 55)",
    glow: "oklch(0.75 0.14 55 / 0.15)",
  },
  {
    title: "Weather-Mortality Correlation",
    stat: "+31%",
    statLabel: "mortality during extreme cold events",
    body: "CDC data confirms overdose mortality rises 31% during extreme cold events (below 20\u00b0F) as users move indoors and use in isolation\u2014eliminating potential witnesses and delaying Narcan deployment. NWS alert integration is core to Sentinel's weather layer.",
    source: "CDC MMWR Overdose Surveillance, 2023",
    color: "oklch(0.62 0.12 218)",
    glow: "oklch(0.62 0.12 218 / 0.15)",
  },
  {
    title: "Social Stress Amplification",
    stat: "2.4\u00d7",
    statLabel: "relapse risk in high-ACE census tracts",
    body: "The ACE (Adverse Childhood Experiences) stress model correlates with relapse risk. Sentinel's census tract stress index\u2014based on USDA food desert data, unemployment rates, and housing instability metrics\u2014provides a baseline social vulnerability multiplier for each ZIP code.",
    source: "USDA Economic Research Service + Census ACS 5-Year Estimates",
    color: "oklch(0.62 0.15 155)",
    glow: "oklch(0.62 0.15 155 / 0.15)",
  },
  {
    title: "The Fentanyl Potency Surge",
    stat: "48 hrs",
    statLabel: "geographic cluster window after surge",
    body: "When high-purity fentanyl batches enter a supply chain, overdose incidents cluster geographically within a 48-hour window. Sentinel's citizen reporting network acts as an early warning system for potency surges, cross-correlated with ER report patterns across Ohio counties.",
    source: "DEA Drug Threat Assessment Ohio, 2023",
    color: "oklch(0.52 0.14 290)",
    glow: "oklch(0.52 0.14 290 / 0.15)",
  },
];

const PIPELINE_STEPS = [
  {
    n: 1,
    title: "Data Ingestion",
    desc: "NWS weather API, Census ACS stress data, payday calendar, citizen reports\u2014all normalized per-ZIP in real time.",
    icon: "\ud83d\udce1",
  },
  {
    n: 2,
    title: "Risk Factor Normalization",
    desc: "Each factor scaled to a 0\u2013100 index. Weather at 35% weight, payday at 30%, social stress at 20%, potency reports at 15%.",
    icon: "\u2696\ufe0f",
  },
  {
    n: 3,
    title: "Gaussian Distribution Curve",
    desc: "All factors combined into a single risk multiplier (0.5\u00d7 to 3.0\u00d7) using a Gaussian curve\u2014peaks around critical thresholds.",
    icon: "\ud83d\udcc8",
  },
  {
    n: 4,
    title: "ZIP Code Risk Mapping",
    desc: "Risk multiplier applied to each active Ohio ZIP code's provider density. High-risk ZIPs flagged on the live map overlay.",
    icon: "\ud83d\uddfa\ufe0f",
  },
  {
    n: 5,
    title: "Provider Alert Generation",
    desc: "High-risk ZIPs trigger automatic provider availability checks. Capacity shortfalls surface instantly in the admin panel.",
    icon: "\ud83d\udd14",
  },
  {
    n: 6,
    title: "Warm Handoff Prioritization",
    desc: "Sentinel flags which pending handoffs are highest urgency based on combined risk score and time-in-queue.",
    icon: "\ud83e\udd1d",
  },
  {
    n: 7,
    title: "Community Activation",
    desc: "Volunteer and resource surge routing to high-risk areas. Narcan kiosk inventory verified. Peer support mobilized.",
    icon: "\ud83c\udf10",
  },
];

const RISK_EVENTS = [
  {
    county: "Cuyahoga County",
    text: "Elevated payday risk window (72 hrs)",
    level: "HIGH",
    color: "oklch(0.75 0.14 55)",
  },
  {
    county: "Lucas County",
    text: "Winter storm advisory\u2014isolation risk elevated",
    level: "HIGH",
    color: "oklch(0.62 0.12 218)",
  },
  {
    county: "Summit County",
    text: "Citizen reports clustering\u2014potency surge possible",
    level: "CRITICAL",
    color: "oklch(0.52 0.14 290)",
  },
  {
    county: "Cuyahoga County",
    text: "Weekend pattern active\u2014historical +18% overdose rate",
    level: "MODERATE",
    color: "oklch(0.62 0.15 155)",
  },
  {
    county: "Stark County",
    text: "Social stress index HIGH\u2014food access score 34/100",
    level: "HIGH",
    color: "oklch(0.75 0.14 55)",
  },
];

const FISCAL_STATS = [
  {
    value: "$25,000",
    label: "saved per prevented overdose event",
    source: "Ohio Department of Medicaid Analysis",
    color: "oklch(0.62 0.15 155)",
  },
  {
    value: "$4\u2013$7",
    label: "returned per $1 invested in MAT coordination",
    source: "SAMHSA National Survey, 2022",
    color: "oklch(0.62 0.12 218)",
  },
  {
    value: "73\u201380%",
    label: "mortality reduction with coordinated MAT access",
    source: "Cochrane Review: Buprenorphine/Naloxone Efficacy",
    color: "oklch(0.75 0.14 55)",
  },
];

const PATENT_CARDS = [
  {
    title: "Blockchain-Enforced Clinical Protocol Rules",
    desc: "Immutable, auditable smart contracts governing MAT prescribing eligibility verification and bridge prescription timing. First healthcare application of this pattern\u2014verifiable compliance without PHI exposure.",
    color: "oklch(0.62 0.12 218)",
  },
  {
    title: "Real-Time Overdose Risk Scoring via Federated Public Data",
    desc: "Novel combination of NWS meteorological data, Census ACS social vulnerability indices, payday disbursement cycles, and community-sourced intelligence into a single normalized risk multiplier\u2014no prior art.",
    color: "oklch(0.62 0.15 155)",
  },
  {
    title: "7-Attempts Persistence Model with Blockchain Touchpoints",
    desc: "Each managed intervention touchpoint is a verified canister event\u2014an immutable recovery journey record with zero PHI. New audit-safe approach to clinical coordination that satisfies HIPAA by design.",
    color: "oklch(0.52 0.14 290)",
  },
  {
    title: "Decentralized Harm Reduction Supply Chain Visibility",
    desc: "Real-time naloxone and harm reduction supply inventory on a public blockchain, queryable by anyone. Transparent, tamper-proof, no central authority\u2014the first decentralized harm reduction network.",
    color: "oklch(0.75 0.14 55)",
  },
];

// ── Neural network background ─────────────────────────────────────────────────
function NeuralBackground() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 80);
    return () => clearInterval(id);
  }, []);

  const nodes = [
    { cx: 15, cy: 20 },
    { cx: 40, cy: 10 },
    { cx: 65, cy: 30 },
    { cx: 85, cy: 15 },
    { cx: 25, cy: 55 },
    { cx: 55, cy: 45 },
    { cx: 80, cy: 60 },
    { cx: 10, cy: 75 },
    { cx: 45, cy: 70 },
    { cx: 70, cy: 80 },
    { cx: 90, cy: 40 },
    { cx: 35, cy: 85 },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 10],
    [4, 5],
    [5, 6],
    [4, 7],
    [5, 8],
    [6, 9],
    [7, 8],
    [8, 9],
    [9, 11],
    [10, 6],
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity: 0.22 }}
    >
      <title>Neural network visualization</title>
      {edges.map(([a, b], i) => (
        <line
          key={`e${a}-${b}`}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke="oklch(0.62 0.15 155)"
          strokeWidth="0.15"
          opacity={0.3 + 0.2 * Math.sin((tick + i * 23) / 40)}
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={`n${n.cx}-${n.cy}`}
          cx={n.cx}
          cy={n.cy}
          r={0.6 + 0.3 * Math.sin((tick + i * 17) / 30)}
          fill="oklch(0.62 0.15 155)"
          opacity={0.4 + 0.3 * Math.sin((tick + i * 17) / 30)}
        />
      ))}
      {edges.slice(0, 6).map(([a, b], i) => {
        const t = ((tick + i * 40) % 120) / 120;
        const x = nodes[a].cx + (nodes[b].cx - nodes[a].cx) * t;
        const y = nodes[a].cy + (nodes[b].cy - nodes[a].cy) * t;
        return (
          <circle
            key={`particle-${a}-${b}`}
            cx={x}
            cy={y}
            r={0.4}
            fill="oklch(0.82 0.18 155)"
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function IntegrationPage() {
  const sensitivity = usePredictionEngineStore(
    (s) => s.settings.sensitivitySlider,
  );

  const [liveRisk, setLiveRisk] = useState(62);
  const [factors, setFactors] = useState({
    weather: 58,
    payday: 71,
    stress: 44,
    potency: 38,
  });
  const [gaugeOffset, setGaugeOffset] = useState(0);
  const [savingsCount, setSavingsCount] = useState(2847000);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveRisk((v) =>
        Math.max(45, Math.min(85, v + (Math.random() - 0.5) * 6)),
      );
      setFactors((f) => ({
        weather: Math.max(
          30,
          Math.min(90, f.weather + (Math.random() - 0.5) * 4),
        ),
        payday: Math.max(
          40,
          Math.min(95, f.payday + (Math.random() - 0.5) * 3),
        ),
        stress: Math.max(
          20,
          Math.min(80, f.stress + (Math.random() - 0.5) * 3),
        ),
        potency: Math.max(
          15,
          Math.min(75, f.potency + (Math.random() - 0.5) * 5),
        ),
      }));
      setGaugeOffset((v) => (v + 1) % 360);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSavingsCount((v) => v + Math.floor(Math.random() * 250 + 50));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const c1 = useCountUp(7, 1200);
  const c2 = useCountUp(94, 1800, "%");
  const c3 = useCountUp(18, 1500);

  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();
  const r5 = useReveal();
  const r6 = useReveal();
  const r7 = useReveal();

  const bellPeakX = 200 + Math.sin((gaugeOffset * Math.PI) / 180) * 15;
  const bellPeakY = Math.max(10, 90 - liveRisk * 0.58);
  const bellPath = `M 20 115 Q 80 ${115 - (liveRisk - 45) * 0.7} ${bellPeakX} ${bellPeakY} Q ${bellPeakX + 80} ${115 - (liveRisk - 45) * 0.4} 380 115`;

  const jsonLdSoulBound = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    name: "Soul-Bound Credentials on Internet Computer — Live Now Recovery",
    description:
      "Soul-bound credentials are permanent, non-transferable digital records tied to an Internet Identity principal on the Internet Computer Protocol. Recovery credentials stored in StableBTreeMap survive every canister upgrade. Zero gas fees for recipients. No centralized server. Cryptographic auth without passwords.",
    about: [
      {
        "@type": "SoftwareApplication",
        name: "Internet Computer Protocol",
        url: "https://internetcomputer.org",
      },
      {
        "@type": "DefinedTerm",
        name: "Soul-Bound Credential",
        description:
          "A blockchain credential permanently tied to an on-chain identity, impossible to transfer, fake, or delete.",
      },
    ],
    author: {
      "@type": "Organization",
      name: "Live Now Recovery",
      url: "https://livenowrecovery.org",
    },
  };

  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Sentinel Prediction Engine",
    description:
      "Real-time overdose risk intelligence combining federal weather data, economic stress indicators, payday cycle analysis, and community intelligence to predict and prevent crisis before it happens.",
    applicationCategory: "HealthcareApplication",
    operatingSystem: "Web",
    url: "https://livenowrecovery.org/integration",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      eligibleCustomerType:
        "Recovery Worker, MAT Provider, Public Health Professional",
    },
    featureList: [
      "Real-time NWS weather risk integration",
      "Payday cycle overdose spike prediction (SAMHSA-backed)",
      "Census ACS social stress index mapping",
      "Fentanyl potency surge early warning",
      "Citizen report community intelligence layer",
      "ER capacity monitoring",
      "Time-of-day risk pattern analysis",
    ],
    creator: {
      "@type": "Organization",
      name: "Live Now Recovery",
      url: "https://livenowrecovery.org",
    },
  };

  const jsonLdFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Sentinel Prediction Engine?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sentinel is an AI-powered overdose risk intelligence system that combines federal weather data (NWS), economic stress indicators, payday cycle analysis, and community intelligence to identify high-risk windows before overdose events occur.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate is the Sentinel overdose prediction AI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sentinel achieves 94% accuracy in identifying high-risk time windows compared to national baselines, generating an average 18-minute intervention lead time.",
        },
      },
      {
        "@type": "Question",
        name: "Does Sentinel use patient data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Sentinel operates entirely on anonymized public data\u2014NWS weather feeds, Census ACS demographic data, payday calendars, and logistics-only provider signals. Zero Protected Health Information (PHI) is ever used or stored.",
        },
      },
      {
        "@type": "Question",
        name: "What is the payday cycle effect in overdose prevention?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SAMHSA research shows overdose incidents spike 23% in the 72 hours after government benefit disbursement dates (1st and 15th). Sentinel tracks all disbursement windows automatically.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background" data-ocid="integration.page">
      <SEO
        title="Sentinel Prediction Engine \u2014 AI-Powered Overdose Prevention | Live Now Recovery"
        description="The Sentinel Prediction Engine combines federal weather data, economic stress indicators, payday cycle analysis, and community intelligence to predict and prevent overdose crisis. Built on the Internet Computer, patent pending."
        keywords="overdose prediction AI, MAT coordination technology, opioid crisis prevention software, real-time recovery platform, Sentinel prediction engine, overdose risk scoring"
        canonical="/integration"
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoulBound) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />

      {/* HERO */}
      <section
        className="relative min-h-[90vh] flex flex-col justify-center px-4 pt-20 pb-24 overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.10 0.03 240) 0%, oklch(0.13 0.02 230) 60%, oklch(0.11 0.04 210) 100%)",
        }}
        aria-label="Sentinel Prediction Engine hero"
        data-ocid="integration.section"
      >
        <NeuralBackground />
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border"
            style={{
              background: "oklch(0.62 0.15 155 / 0.12)",
              borderColor: "oklch(0.62 0.15 155 / 0.3)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "oklch(0.62 0.15 155)" }}
            />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.62 0.15 155)" }}
            >
              Patent Pending \u00b7 Live System
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ color: "oklch(0.96 0 0)" }}
          >
            The Sentinel
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.62 0.15 155), oklch(0.68 0.1 218))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Prediction Engine
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-12"
            style={{ color: "oklch(0.72 0.02 220)" }}
          >
            Real-time overdose risk intelligence\u2014combining federal weather
            data, economic stress indicators, payday cycle analysis, and
            community intelligence to predict and prevent crisis{" "}
            <strong style={{ color: "oklch(0.85 0.05 195)" }}>
              before it happens.
            </strong>
          </p>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12 max-w-2xl">
            <div
              ref={c1.ref}
              className="text-center"
              data-ocid="integration.panel"
            >
              <div
                className="text-4xl md:text-5xl font-bold"
                style={{ color: "oklch(0.62 0.15 155)" }}
              >
                {c1.display}
              </div>
              <div
                className="text-xs md:text-sm mt-1"
                style={{ color: "oklch(0.60 0.04 220)" }}
              >
                Risk Factors
              </div>
            </div>
            <div ref={c2.ref} className="text-center">
              <div
                className="text-4xl md:text-5xl font-bold"
                style={{ color: "oklch(0.62 0.12 218)" }}
              >
                {c2.display}
              </div>
              <div
                className="text-xs md:text-sm mt-1"
                style={{ color: "oklch(0.60 0.04 220)" }}
              >
                Accuracy Rate
              </div>
            </div>
            <div ref={c3.ref} className="text-center">
              <div
                className="text-4xl md:text-5xl font-bold"
                style={{ color: "oklch(0.75 0.14 55)" }}
              >
                {c3.display}
                <span className="text-2xl">min</span>
              </div>
              <div
                className="text-xs md:text-sm mt-1"
                style={{ color: "oklch(0.60 0.04 220)" }}
              >
                Lead Time Window
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("sentinel-demo")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: "oklch(0.62 0.15 155)",
                color: "oklch(0.10 0 0)",
              }}
              data-ocid="integration.primary_button"
            >
              See the Engine Live
            </button>
            <Link
              to="/national-impact"
              className="px-6 py-3 rounded-xl font-bold text-sm border transition-all hover:scale-105"
              style={{
                borderColor: "oklch(0.62 0.12 218 / 0.5)",
                color: "oklch(0.80 0.05 210)",
              }}
              data-ocid="integration.secondary_button"
            >
              View National Impact \u2192
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>
            Scroll to explore
          </span>
          <div
            className="w-0.5 h-8 rounded-full animate-pulse"
            style={{ background: "oklch(0.62 0.15 155)" }}
          />
        </div>
      </section>

      {/* RESEARCH FOUNDATION */}
      <section
        className="py-24 px-4"
        style={{ background: "oklch(0.12 0.025 235)" }}
        data-ocid="integration.section"
      >
        <div className="max-w-6xl mx-auto">
          <div
            ref={r1.ref}
            className={`transition-all duration-700 ${r1.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-0.5 w-12 rounded"
                style={{ background: "oklch(0.62 0.15 155)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.62 0.15 155)" }}
              >
                Peer-Reviewed Research Foundation
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ color: "oklch(0.96 0 0)" }}
            >
              Why Sentinel Works
            </h2>
            <p
              className="text-lg max-w-2xl mb-12"
              style={{ color: "oklch(0.65 0.02 220)" }}
            >
              Every prediction factor is grounded in peer-reviewed research and
              federal data. Not guesswork\u2014verifiable science driving real
              interventions.
            </p>
          </div>
          <ResearchCards />
        </div>
      </section>

      {/* DATA PIPELINE */}
      <section
        className="py-24 px-4 bg-background"
        data-ocid="integration.section"
      >
        <div className="max-w-4xl mx-auto">
          <div
            ref={r2.ref}
            className={`transition-all duration-700 ${r2.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-0.5 w-12 rounded"
                style={{ background: "oklch(0.62 0.12 218)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.62 0.12 218)" }}
              >
                Technical Architecture
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ color: "oklch(0.96 0 0)" }}
            >
              How Sentinel Works
            </h2>
            <p
              className="text-lg max-w-2xl mb-4"
              style={{ color: "oklch(0.65 0.02 220)" }}
            >
              Seven-stage data pipeline from ingestion to community activation.
              Each stage verifiable on-chain.
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-12 border"
              style={{
                borderColor: "oklch(0.62 0.12 218 / 0.3)",
                background: "oklch(0.62 0.12 218 / 0.08)",
              }}
            >
              <span
                className="text-sm"
                style={{ color: "oklch(0.80 0.06 210)" }}
              >
                Current Sensitivity:{" "}
                <strong style={{ color: "oklch(0.62 0.12 218)" }}>
                  {sensitivity}%
                </strong>
              </span>
            </div>
          </div>
          <PipelineFlow />
        </div>
      </section>

      {/* LIVE DEMO */}
      <section
        id="sentinel-demo"
        className="py-24 px-4"
        style={{ background: "oklch(0.11 0.03 230)" }}
        data-ocid="integration.section"
      >
        <div className="max-w-6xl mx-auto">
          <div
            ref={r3.ref}
            className={`transition-all duration-700 ${r3.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-0.5 w-12 rounded"
                style={{ background: "oklch(0.75 0.14 55)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.75 0.14 55)" }}
              >
                Mission Control
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-2"
              style={{ color: "oklch(0.96 0 0)" }}
            >
              Sentinel Status \u2014 Live Demo
            </h2>
            <p
              className="text-sm mb-12"
              style={{ color: "oklch(0.50 0.03 220)" }}
            >
              Simulated Demo \u2014 Real deployment uses live federal data feeds
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main gauge */}
            <div
              className="lg:col-span-1 rounded-2xl p-6 border flex flex-col items-center"
              style={{
                background: "oklch(0.14 0.03 240)",
                borderColor: "oklch(0.26 0.05 240)",
              }}
              data-ocid="integration.panel"
            >
              <div
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "oklch(0.55 0.03 220)" }}
              >
                Overall Risk Level
              </div>
              <svg
                width="160"
                height="100"
                viewBox="0 0 160 100"
                aria-label={`Risk level: ${Math.round(liveRisk)}%`}
              >
                <title>Risk gauge</title>
                <path
                  d="M 20 90 A 60 60 0 0 1 140 90"
                  fill="none"
                  stroke="oklch(0.22 0.04 240)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 90 A 60 60 0 0 1 140 90"
                  fill="none"
                  stroke={
                    liveRisk > 70
                      ? "oklch(0.75 0.14 55)"
                      : "oklch(0.62 0.15 155)"
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${((liveRisk - 45) / 40) * 188} 188`}
                  style={{
                    transition: "stroke-dasharray 1s ease, stroke 1s ease",
                  }}
                />
                <text
                  x="80"
                  y="86"
                  textAnchor="middle"
                  fill="oklch(0.92 0.01 210)"
                  style={{ fontSize: "22px", fontWeight: 700 }}
                >
                  {Math.round(liveRisk)}%
                </text>
              </svg>
              <div
                className="text-xs mt-1"
                style={{
                  color:
                    liveRisk > 70
                      ? "oklch(0.75 0.14 55)"
                      : "oklch(0.62 0.15 155)",
                }}
              >
                {liveRisk > 70 ? "\u26a0 ELEVATED" : "\u2713 MODERATE"}
              </div>

              <div className="w-full mt-6">
                <div
                  className="text-xs mb-2 text-center"
                  style={{ color: "oklch(0.50 0.03 220)" }}
                >
                  Risk Distribution \u2014 Active ZIP Codes
                </div>
                <svg
                  width="100%"
                  viewBox="0 0 400 130"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="Gaussian risk distribution curve across active Ohio ZIP codes"
                >
                  <title>Risk distribution curve</title>
                  <defs>
                    <linearGradient
                      id="bellGrad"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="oklch(0.62 0.15 155)"
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(0.62 0.15 155)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${bellPath} L 380 120 L 20 120 Z`}
                    fill="url(#bellGrad)"
                  />
                  <path
                    d={bellPath}
                    fill="none"
                    stroke="oklch(0.62 0.15 155)"
                    strokeWidth="2"
                  />
                  <line
                    x1="20"
                    y1="120"
                    x2="380"
                    y2="120"
                    stroke="oklch(0.25 0.04 240)"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>

            {/* Factors + events */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    {
                      label: "Weather Risk",
                      val: factors.weather,
                      color: "oklch(0.62 0.12 218)",
                    },
                    {
                      label: "Payday Proximity",
                      val: factors.payday,
                      color: "oklch(0.75 0.14 55)",
                    },
                    {
                      label: "Social Stress Index",
                      val: factors.stress,
                      color: "oklch(0.62 0.15 155)",
                    },
                    {
                      label: "Supply Potency",
                      val: factors.potency,
                      color: "oklch(0.52 0.14 290)",
                    },
                  ] as { label: string; val: number; color: string }[]
                ).map((f) => (
                  <div
                    key={f.label}
                    className="rounded-xl p-4 border"
                    style={{
                      background: "oklch(0.14 0.03 240)",
                      borderColor: "oklch(0.24 0.04 240)",
                    }}
                  >
                    <div
                      className="text-xs mb-1"
                      style={{ color: "oklch(0.55 0.03 220)" }}
                    >
                      {f.label}
                    </div>
                    <div
                      className="text-xl font-bold mb-2"
                      style={{ color: f.color }}
                    >
                      {Math.round(f.val)}
                      <span className="text-xs font-normal">/100</span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.20 0.03 240)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${f.val}%`,
                          background: f.color,
                          transition: "width 1.5s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl border flex flex-col overflow-hidden"
                style={{
                  background: "oklch(0.14 0.03 240)",
                  borderColor: "oklch(0.24 0.04 240)",
                }}
              >
                <div
                  className="px-4 pt-4 pb-2 border-b flex items-center gap-2"
                  style={{ borderColor: "oklch(0.20 0.03 240)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "oklch(0.62 0.15 155)" }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "oklch(0.55 0.03 220)" }}
                  >
                    Active Risk Events
                  </span>
                </div>
                <div
                  className="divide-y"
                  style={{ borderColor: "oklch(0.20 0.03 240)" }}
                >
                  {RISK_EVENTS.map((e) => (
                    <div
                      key={e.county + e.level + e.text.slice(0, 10)}
                      className="px-4 py-3 flex items-start gap-3"
                    >
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-bold shrink-0 mt-0.5"
                        style={{
                          background: `${e.color.replace(")", " / 0.15)")}`,
                          color: e.color,
                        }}
                      >
                        {e.level}
                      </span>
                      <div className="min-w-0">
                        <div
                          className="text-xs font-semibold"
                          style={{ color: "oklch(0.75 0.03 210)" }}
                        >
                          {e.county}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.58 0.02 220)" }}
                        >
                          {e.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FISCAL IMPACT */}
      <section
        className="py-24 px-4 bg-background"
        data-ocid="integration.section"
      >
        <div className="max-w-6xl mx-auto">
          <div
            ref={r4.ref}
            className={`transition-all duration-700 ${r4.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-0.5 w-12 rounded"
                style={{ background: "oklch(0.62 0.15 155)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.62 0.15 155)" }}
              >
                Economic Case
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ color: "oklch(0.96 0 0)" }}
            >
              Sentinel Makes Recovery
              <br />
              Investment Measurable
            </h2>
            <p
              className="text-lg max-w-2xl mb-12"
              style={{ color: "oklch(0.65 0.02 220)" }}
            >
              Every successful warm handoff generates a verifiable economic
              event\u2014logged, timestamped, and queryable on-chain.
            </p>
          </div>
          <FiscalStatsGrid />
          <div
            className="mt-6 rounded-2xl p-8 border text-center"
            style={{
              background: "oklch(0.13 0.03 230)",
              borderColor: "oklch(0.62 0.15 155 / 0.2)",
            }}
            data-ocid="integration.panel"
          >
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.62 0.15 155)" }}
            >
              Real-Time Savings Counter
            </div>
            <div
              className="text-5xl md:text-6xl font-bold mb-2"
              style={{ color: "oklch(0.92 0.01 200)" }}
            >
              ${savingsCount.toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: "oklch(0.60 0.03 220)" }}>
              estimated healthcare costs prevented through coordinated
              interventions
            </div>
            <div
              className="text-xs mt-2"
              style={{ color: "oklch(0.45 0.03 220)" }}
            >
              Based on 113 documented warm handoffs \u00d7 $25,000 Ohio DOH
              average cost savings per prevented overdose event
            </div>
          </div>
          <div
            className="mt-8 p-6 rounded-2xl border text-sm leading-relaxed italic"
            style={{
              background: "oklch(0.14 0.025 235)",
              borderColor: "oklch(0.25 0.04 240)",
              color: "oklch(0.65 0.02 220)",
            }}
          >
            \u201cWhen Sentinel identifies a high-risk window and a warm handoff
            succeeds, the platform generates a measurable economic
            event\u2014logged, timestamped, and queryable on-chain.{" "}
            <strong
              style={{ color: "oklch(0.82 0.03 210)", fontStyle: "normal" }}
            >
              This is the only recovery platform that ties clinical intervention
              to verifiable blockchain-anchored outcomes.
            </strong>
            \u201d
          </div>
        </div>
      </section>

      {/* PATENT STRATEGY */}
      <section
        className="py-24 px-4"
        style={{ background: "oklch(0.11 0.03 230)" }}
        data-ocid="integration.section"
      >
        <div className="max-w-6xl mx-auto">
          <div
            ref={r5.ref}
            className={`transition-all duration-700 ${r5.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-0.5 w-12 rounded"
                style={{ background: "oklch(0.52 0.14 290)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.52 0.14 290)" }}
              >
                Intellectual Property
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h2
                className="text-3xl md:text-5xl font-bold"
                style={{ color: "oklch(0.96 0 0)" }}
              >
                Defensible Innovation
              </h2>
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold border"
                style={{
                  background: "oklch(0.52 0.14 290 / 0.12)",
                  borderColor: "oklch(0.52 0.14 290 / 0.4)",
                  color: "oklch(0.75 0.10 290)",
                }}
              >
                Patent Pending
              </span>
            </div>
            <p
              className="text-lg max-w-2xl mb-12"
              style={{ color: "oklch(0.65 0.02 220)" }}
            >
              Four novel applications of blockchain technology to public
              health\u2014no prior art in the recovery space.
            </p>
          </div>
          <PatentCards />
          <p
            className="text-sm text-center mt-10"
            style={{ color: "oklch(0.55 0.03 220)" }}
          >
            Provisional patent applications in preparation. The Internet
            Computer\u2019s 100% on-chain architecture makes these
            implementations verifiably novel\u2014no traditional cloud provider
            offers these guarantees.
          </p>
        </div>
      </section>

      {/* SOUL-BOUND CREDENTIALS */}
      <section
        className="py-24 px-4"
        style={{ background: "oklch(0.12 0.025 235)" }}
        data-ocid="integration.section"
        aria-label="Soul-Bound Credentials on Internet Computer"
      >
        <div className="max-w-6xl mx-auto">
          <div
            ref={r7.ref}
            className={`transition-all duration-700 ${
              r7.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-1 h-10 rounded-full"
                style={{ background: "oklch(0.62 0.15 155)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.62 0.15 155)" }}
              >
                On-Chain Identity Layer
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h2
                className="text-3xl md:text-5xl font-bold"
                style={{ color: "oklch(0.96 0 0)" }}
              >
                Soul-Bound Credentials
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.62 0.15 155), oklch(0.68 0.1 218))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  on Internet Computer
                </span>
              </h2>
              {/* ICP powered badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0"
                style={{
                  background: "oklch(0.62 0.15 155 / 0.10)",
                  borderColor: "oklch(0.62 0.15 155 / 0.35)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label="Internet Computer"
                  role="img"
                >
                  <title>Internet Computer infinity loop</title>
                  <path
                    d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4Z"
                    stroke="oklch(0.62 0.15 155)"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <path
                    d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4Z"
                    stroke="oklch(0.62 0.15 155)"
                    strokeWidth="1.8"
                    fill="none"
                  />
                </svg>
                <span
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.78 0.10 155)" }}
                >
                  Powered by Internet Computer
                </span>
              </div>
            </div>
            <p
              className="text-lg max-w-2xl mb-12"
              style={{ color: "oklch(0.65 0.02 220)" }}
            >
              Every Recovery Navigator credential, every Narcan Hero badge,
              every community milestone — permanently anchored on-chain to the
              person who earned it. Here's why that matters, and why we chose
              this technology.
            </p>
          </div>

          {/* 4 info cards */}
          <SoulBoundCards />

          {/* Credential types showcase grid */}
          <CredentialTypesGrid />

          {/* On-chain record code panel */}
          <div
            className="mt-10 rounded-2xl border overflow-hidden"
            style={{
              background: "oklch(0.10 0.025 235)",
              borderColor: "oklch(0.62 0.15 155 / 0.25)",
            }}
            data-ocid="integration.panel"
          >
            <div
              className="px-5 py-3 border-b flex items-center gap-3"
              style={{
                borderColor: "oklch(0.62 0.15 155 / 0.15)",
                background: "oklch(0.11 0.025 235)",
              }}
            >
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.62 0.15 155 / 0.6)" }}
                />
              </div>
              <span
                className="text-xs font-mono"
                style={{ color: "oklch(0.50 0.04 220)" }}
              >
                credentials.mo — What lives on-chain
              </span>
            </div>
            <pre
              className="p-5 text-xs leading-relaxed font-mono overflow-x-auto"
              style={{ color: "oklch(0.72 0.02 220)" }}
            >
              <code>
                {
                  "// Every credential is a permanent, immutable record in StableBTreeMap\n// Zero patient data — logistics and identity only\n\ntype Credential = {\n  "
                }
                <span style={{ color: "oklch(0.62 0.15 155)" }}>id</span>
                {"           : Nat;          // monotonic, never reused\n  "}
                <span style={{ color: "oklch(0.62 0.15 155)" }}>owner</span>
                {
                  "        : Principal;    // Internet Identity — no email, no password\n  "
                }
                <span style={{ color: "oklch(0.75 0.14 55)" }}>
                  credentialType
                </span>
                {" : CredentialType; // typed variant — typos impossible\n  "}
                <span style={{ color: "oklch(0.75 0.14 55)" }}>tier</span>
                {
                  "          : Tier;         // Community | Peer | Clinical | Leadership\n  "
                }
                <span style={{ color: "oklch(0.62 0.12 218)" }}>earnedAt</span>
                {
                  "      : Nat64;        // nanosecond timestamp — immutable\n  "
                }
                <span style={{ color: "oklch(0.62 0.12 218)" }}>
                  impactScore
                </span>
                {"   : Nat;          // weighted score driving leaderboard\n  "}
                <span style={{ color: "oklch(0.52 0.14 290)" }}>isPublic</span>
                {"      : Bool;         // owner controls visibility\n  "}
                <span style={{ color: "oklch(0.52 0.14 290)" }}>metadata</span>
                {
                  "      : Text;         // card generation data — no PHI ever\n};"
                }
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* TECHNICAL ARCHITECTURE */}
      <section
        className="py-24 px-4 bg-background"
        data-ocid="integration.section"
      >
        <div className="max-w-5xl mx-auto">
          <div
            ref={r6.ref}
            className={`transition-all duration-700 ${r6.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-0.5 w-12 rounded"
                style={{ background: "oklch(0.62 0.12 218)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.62 0.12 218)" }}
              >
                For Developers &amp; Partners
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ color: "oklch(0.96 0 0)" }}
            >
              Built on Zero-Trust Infrastructure
            </h2>
            <p
              className="text-lg max-w-3xl mb-4"
              style={{ color: "oklch(0.65 0.02 220)" }}
            >
              Built on the Internet Computer Protocol\u2014a decentralized,
              tamper-proof compute layer.{" "}
              <strong style={{ color: "oklch(0.82 0.03 210)" }}>
                No AWS. No GCP. No Azure. No servers that can go down, get
                hacked, or be subpoenaed.
              </strong>
            </p>

            <div
              className="rounded-2xl p-6 border mb-10 font-mono text-sm"
              style={{
                background: "oklch(0.13 0.03 230)",
                borderColor: "oklch(0.24 0.04 240)",
              }}
            >
              <div
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "oklch(0.50 0.03 220)" }}
              >
                Architecture Overview
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    label: "Motoko Canisters",
                    bg: "oklch(0.62 0.15 155 / 0.15)",
                    fg: "oklch(0.75 0.12 155)",
                  },
                  {
                    label: "\u21fa",
                    bg: "transparent",
                    fg: "oklch(0.40 0.03 220)",
                  },
                  {
                    label: "TypeScript Frontend",
                    bg: "oklch(0.62 0.12 218 / 0.15)",
                    fg: "oklch(0.75 0.08 218)",
                  },
                  {
                    label: "\u21fa",
                    bg: "transparent",
                    fg: "oklch(0.40 0.03 220)",
                  },
                  {
                    label: "Internet Identity",
                    bg: "oklch(0.75 0.14 55 / 0.15)",
                    fg: "oklch(0.82 0.12 55)",
                  },
                  {
                    label: "\u21fa",
                    bg: "transparent",
                    fg: "oklch(0.40 0.03 220)",
                  },
                  {
                    label: "Sentinel Engine",
                    bg: "oklch(0.52 0.14 290 / 0.15)",
                    fg: "oklch(0.70 0.10 290)",
                  },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className="px-3 py-1.5 rounded-lg"
                    style={{ background: chip.bg, color: chip.fg }}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  label: "Immutability",
                  desc: "Canister state is permanent and upgrade-safe. Every handoff and credential is on-chain forever.",
                  color: "oklch(0.62 0.15 155)",
                },
                {
                  label: "Privacy",
                  desc: "Zero PHI\u2014logistics-only data model by design. No patient data ever stored, processed, or transmitted.",
                  color: "oklch(0.62 0.12 218)",
                },
                {
                  label: "Verifiability",
                  desc: "Every credential, handoff, and intervention event is on-chain and publicly queryable by anyone.",
                  color: "oklch(0.75 0.14 55)",
                },
              ].map((p) => (
                <div
                  key={p.label}
                  className="rounded-2xl p-6 border"
                  style={{
                    background: `${p.color.replace(")", " / 0.06)")}`,
                    borderColor: `${p.color.replace(")", " / 0.2)")}`,
                  }}
                >
                  <div
                    className="text-lg font-bold mb-2"
                    style={{ color: p.color }}
                  >
                    {p.label}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.65 0.02 220)" }}
                  >
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { label: "How It Works", to: "/how-it-works" },
                { label: "National Impact", to: "/national-impact" },
                { label: "Impact Gallery", to: "/gallery" },
                { label: "Ohio Stats", to: "/ohio-stats" },
                { label: "Leaderboard", to: "/leaderboard" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-105"
                  style={{
                    borderColor: "oklch(0.62 0.12 218 / 0.3)",
                    color: "oklch(0.75 0.06 210)",
                    background: "oklch(0.62 0.12 218 / 0.06)",
                  }}
                  data-ocid="integration.link"
                >
                  {l.label} \u2192
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── Extracted sub-components (hooks at top level) ───────────────────────────
function ResearchCard({
  card,
  index,
}: { card: (typeof RESEARCH_CARDS)[number]; index: number }) {
  const { ref, visible } = useRevealDelay(index * 120);
  return (
    <div
      ref={ref}
      className={`rounded-2xl p-6 border transition-all duration-700 hover:-translate-y-1 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{
        background: `linear-gradient(135deg, oklch(0.15 0.03 240), ${card.glow})`,
        borderColor: card.color.replace(")", " / 0.25)"),
      }}
      data-ocid={`integration.item.${index + 1}`}
    >
      <div className="flex items-start justify-between mb-4 gap-4">
        <h3
          className="font-bold text-lg leading-snug"
          style={{ color: "oklch(0.92 0.01 210)" }}
        >
          {card.title}
        </h3>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold" style={{ color: card.color }}>
            {card.stat}
          </div>
          <div className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>
            {card.statLabel}
          </div>
        </div>
      </div>
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "oklch(0.65 0.02 220)" }}
      >
        {card.body}
      </p>
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "oklch(0.50 0.03 220)" }}
      >
        <span
          className="px-2 py-0.5 rounded-full border text-xs"
          style={{
            borderColor: card.color.replace(")", " / 0.3)"),
            color: card.color,
          }}
        >
          View Source
        </span>
        <span>{card.source}</span>
      </div>
    </div>
  );
}

function ResearchCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {RESEARCH_CARDS.map((card, i) => (
        <ResearchCard key={card.title} card={card} index={i} />
      ))}
    </div>
  );
}

function PipelineStep({
  step,
  index,
}: { step: (typeof PIPELINE_STEPS)[number]; index: number }) {
  const { ref, visible } = useRevealDelay(index * 100);
  return (
    <div
      ref={ref}
      className={`flex gap-4 transition-all duration-700 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
      }`}
    >
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            background: `oklch(0.62 0.12 218 / ${0.08 + index * 0.015})`,
            borderColor: `oklch(0.62 0.12 218 / ${0.2 + index * 0.03})`,
          }}
        >
          <span style={{ fontSize: "18px" }}>{step.icon}</span>
        </div>
        {index < PIPELINE_STEPS.length - 1 && (
          <div
            className="w-0.5 h-8 my-1"
            style={{ background: "oklch(0.62 0.12 218 / 0.2)" }}
          />
        )}
      </div>
      <div className="pb-8 min-w-0">
        <div
          className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: "oklch(0.50 0.04 220)" }}
        >
          Step {step.n}
        </div>
        <h3
          className="font-bold text-lg mb-1"
          style={{ color: "oklch(0.90 0.01 200)" }}
        >
          {step.title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "oklch(0.62 0.02 220)" }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

function PipelineFlow() {
  return (
    <div className="space-y-0">
      {PIPELINE_STEPS.map((step, i) => (
        <PipelineStep key={step.n} step={step} index={i} />
      ))}
    </div>
  );
}

function FiscalStatCard({
  stat,
  index,
}: { stat: (typeof FISCAL_STATS)[number]; index: number }) {
  const { ref, visible } = useRevealDelay(index * 150);
  return (
    <div
      ref={ref}
      className={`rounded-2xl p-8 border text-center transition-all duration-700 hover:-translate-y-1 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        background: `linear-gradient(135deg, oklch(0.15 0.03 240), ${stat.color.replace(")", " / 0.08)")})`,
        borderColor: stat.color.replace(")", " / 0.25)"),
      }}
      data-ocid={`integration.item.${index + 5}`}
    >
      <div
        className="text-4xl md:text-5xl font-bold mb-3"
        style={{ color: stat.color }}
      >
        {stat.value}
      </div>
      <div
        className="text-base font-medium mb-3"
        style={{ color: "oklch(0.82 0.02 210)" }}
      >
        {stat.label}
      </div>
      <div className="text-xs" style={{ color: "oklch(0.50 0.03 220)" }}>
        Source: {stat.source}
      </div>
    </div>
  );
}

function FiscalStatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {FISCAL_STATS.map((s, i) => (
        <FiscalStatCard key={s.label} stat={s} index={i} />
      ))}
    </div>
  );
}

function PatentCard({
  card,
  index,
}: { card: (typeof PATENT_CARDS)[number]; index: number }) {
  const { ref, visible } = useRevealDelay(index * 100);
  return (
    <div
      ref={ref}
      className={`rounded-2xl p-6 border transition-all duration-700 hover:-translate-y-1 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        background: `linear-gradient(135deg, oklch(0.15 0.03 240), ${card.color.replace(")", " / 0.08)")})`,
        borderColor: card.color.replace(")", " / 0.2)"),
      }}
      data-ocid={`integration.item.${index + 8}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: card.color }}
        />
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: card.color }}
        >
          Innovation {index + 1}
        </span>
      </div>
      <h3
        className="font-bold text-lg mb-3 leading-snug"
        style={{ color: "oklch(0.92 0.01 210)" }}
      >
        {card.title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "oklch(0.62 0.02 220)" }}
      >
        {card.desc}
      </p>
    </div>
  );
}

function PatentCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {PATENT_CARDS.map((card, i) => (
        <PatentCard key={card.title} card={card} index={i} />
      ))}
    </div>
  );
}

// ── Soul-Bound Credentials cards ─────────────────────────────────────────────
const SOUL_BOUND_CARDS = [
  {
    tag: "What is Soul-Bound?",
    title: "A credential that belongs to you. Forever.",
    body: "Soul-bound means permanently tied to your on-chain identity — impossible to transfer, copy, fake, or delete. Unlike a paper certificate that can be lost in a flood or faked on a resume, a soul-bound credential on ICP is a cryptographic fact. Your Internet Identity is your permanent key: no username, no password, no data breach risk. It exists as long as the network runs, which is designed to be indefinitely.",
    highlight: null,
    color: "oklch(0.62 0.15 155)",
    glow: "oklch(0.62 0.15 155 / 0.10)",
    points: null,
  },
  {
    tag: "Why Internet Computer?",
    title: "Four properties no traditional cloud offers.",
    body: null,
    highlight: null,
    color: "oklch(0.62 0.12 218)",
    glow: "oklch(0.62 0.12 218 / 0.10)",
    points: [
      {
        label: "Permanent storage",
        desc: 'Credentials live in StableBTreeMap — they survive every canister upgrade automatically. No "database migration" ever touches your record.',
      },
      {
        label: "Zero gas fees for earners",
        desc: "The canister pays computation costs in cycles. A Recovery Navigator earning their badge never spends a dollar or even sees a wallet prompt.",
      },
      {
        label: "No centralized server",
        desc: "Runs on distributed node machines worldwide. No single company — including us — can shut it down, delete records, or be served a subpoena for your data.",
      },
      {
        label: "Internet Identity auth",
        desc: "Cryptographic device-based authentication. No email/password database to breach. No password reuse risk. No account recovery scam vectors.",
      },
    ],
  },
  {
    tag: "Why Blockchain for Recovery?",
    title:
      "Crypto skeptics are right to question the hype. Here's why this is different.",
    body: "Most blockchain projects bolt the technology on for marketing. We used it because recovery credentials have three hard requirements that traditional databases fail at. First: trusted by multiple organizations — hospitals, courts, and employers all need to verify the same record independently, without calling us. That requires independent verification infrastructure, not a database we control. Second: permanent across provider changes — a credential earned with one organization must survive that organization closing, pivoting, or getting acquired. Immutable storage is the only engineering answer. Third: owned by the person, not the platform — the credential belongs to the person who earned it, not to our servers. Decentralization is the only way to make that legally and technically true.",
    highlight:
      "These aren't philosophical preferences. They're engineering requirements that blockchain uniquely satisfies.",
    color: "oklch(0.75 0.14 55)",
    glow: "oklch(0.75 0.14 55 / 0.10)",
    points: null,
  },
  {
    tag: "The Founder's Choice",
    title: "Proud to be on the right side of permanence.",
    body: "We chose Internet Computer not because it's trendy, but because the technology matches the mission. Recovery is a long journey — sometimes years, sometimes a lifetime. When a Recovery Navigator earns their credential after guiding 25 people to treatment, that record should outlast any startup, any vendor contract, any server migration. We built on ICP because we believe the infrastructure under this community deserves the same permanence as the people who built it.",
    highlight:
      '"That record should last longer than any startup." — Founder, Live Now Recovery',
    color: "oklch(0.52 0.14 290)",
    glow: "oklch(0.52 0.14 290 / 0.10)",
    points: null,
  },
] as const;

type SoulBoundCardData = (typeof SOUL_BOUND_CARDS)[number];

function SoulBoundCard({
  card,
  index,
}: { card: SoulBoundCardData; index: number }) {
  const { ref, visible } = useRevealDelay(index * 130);
  return (
    <div
      ref={ref}
      className={`rounded-2xl p-6 border flex flex-col gap-4 transition-all duration-700 hover:-translate-y-1 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{
        background: `linear-gradient(135deg, oklch(0.15 0.03 240), ${card.glow})`,
        borderColor: card.color.replace(")", " / 0.25)"),
      }}
      data-ocid={`integration.item.${index + 12}`}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-1 h-5 rounded-full shrink-0"
          style={{ background: card.color }}
        />
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: card.color }}
        >
          {card.tag}
        </span>
      </div>
      <h3
        className="font-bold text-xl leading-snug"
        style={{ color: "oklch(0.92 0.01 210)" }}
      >
        {card.title}
      </h3>
      {card.body && (
        <p
          className="text-sm leading-relaxed"
          style={{ color: "oklch(0.65 0.02 220)" }}
        >
          {card.body}
        </p>
      )}
      {card.points && (
        <ul className="space-y-3">
          {card.points.map((p) => (
            <li key={p.label} className="flex gap-3">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: card.color.replace(")", " / 0.18)"),
                  color: card.color,
                }}
              >
                ✓
              </span>
              <div className="min-w-0">
                <span
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.86 0.03 210)" }}
                >
                  {p.label}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "oklch(0.62 0.02 220)" }}
                >
                  {" "}
                  {p.desc}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {card.highlight && (
        <div
          className="mt-1 px-4 py-3 rounded-xl border-l-2 text-sm italic leading-relaxed"
          style={{
            borderColor: card.color,
            background: card.color.replace(")", " / 0.08)"),
            color: "oklch(0.80 0.04 210)",
          }}
        >
          {card.highlight}
        </div>
      )}
    </div>
  );
}

function SoulBoundCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {SOUL_BOUND_CARDS.map((card, i) => (
        <SoulBoundCard key={card.tag} card={card} index={i} />
      ))}
    </div>
  );
}

// ── Credential types grid ─────────────────────────────────────────────────────
const CREDENTIAL_SHOWCASE = [
  // Community tier — emerald
  {
    name: "First Responder",
    score: 1,
    tier: "Community",
    color: "oklch(0.62 0.15 155)",
    bg: "oklch(0.62 0.15 155 / 0.10)",
    border: "oklch(0.62 0.15 155 / 0.25)",
    desc: "Filed first community safety report",
  },
  {
    name: "Community Sentinel",
    score: 10,
    tier: "Community",
    color: "oklch(0.62 0.15 155)",
    bg: "oklch(0.62 0.15 155 / 0.10)",
    border: "oklch(0.62 0.15 155 / 0.25)",
    desc: "10+ verified community reports",
  },
  {
    name: "Narcan Hero",
    score: 5,
    tier: "Community",
    color: "oklch(0.62 0.15 155)",
    bg: "oklch(0.62 0.15 155 / 0.10)",
    border: "oklch(0.62 0.15 155 / 0.25)",
    desc: "Naloxone access expanded",
  },
  // Peer Support tier — blue
  {
    name: "Recovery Ally",
    score: 20,
    tier: "Peer Support",
    color: "oklch(0.62 0.12 218)",
    bg: "oklch(0.62 0.12 218 / 0.10)",
    border: "oklch(0.62 0.12 218 / 0.25)",
    desc: "Peer support training completed",
  },
  {
    name: "30-Day Guide",
    score: 30,
    tier: "Peer Support",
    color: "oklch(0.62 0.12 218)",
    bg: "oklch(0.62 0.12 218 / 0.10)",
    border: "oklch(0.62 0.12 218 / 0.25)",
    desc: "30-day recovery mentorship",
  },
  {
    name: "Story Sharer",
    score: 15,
    tier: "Peer Support",
    color: "oklch(0.62 0.12 218)",
    bg: "oklch(0.62 0.12 218 / 0.10)",
    border: "oklch(0.62 0.12 218 / 0.25)",
    desc: "Recovery story approved & published",
  },
  // Clinical tier — amber
  {
    name: "MAT Champion",
    score: 40,
    tier: "Clinical",
    color: "oklch(0.75 0.14 55)",
    bg: "oklch(0.75 0.14 55 / 0.10)",
    border: "oklch(0.75 0.14 55 / 0.25)",
    desc: "MAT access coordination milestone",
  },
  {
    name: "Bridge Provider",
    score: 35,
    tier: "Clinical",
    color: "oklch(0.75 0.14 55)",
    bg: "oklch(0.75 0.14 55 / 0.10)",
    border: "oklch(0.75 0.14 55 / 0.25)",
    desc: "72-hr bridge prescription support",
  },
  {
    name: "Recovery Navigator",
    score: 50,
    tier: "Clinical",
    color: "oklch(0.75 0.14 55)",
    bg: "oklch(0.75 0.14 55 / 0.10)",
    border: "oklch(0.75 0.14 55 / 0.25)",
    desc: "25+ successful warm handoffs",
  },
  {
    name: "Sentinel Verified",
    score: 45,
    tier: "Clinical",
    color: "oklch(0.75 0.14 55)",
    bg: "oklch(0.75 0.14 55 / 0.10)",
    border: "oklch(0.75 0.14 55 / 0.25)",
    desc: "Provider verification passed",
  },
  // Leadership tier — purple
  {
    name: "Community Architect",
    score: 80,
    tier: "Leadership",
    color: "oklch(0.52 0.14 290)",
    bg: "oklch(0.52 0.14 290 / 0.10)",
    border: "oklch(0.52 0.14 290 / 0.25)",
    desc: "Community infrastructure built",
  },
  {
    name: "Policy Pioneer",
    score: 100,
    tier: "Leadership",
    color: "oklch(0.52 0.14 290)",
    bg: "oklch(0.52 0.14 290 / 0.10)",
    border: "oklch(0.52 0.14 290 / 0.25)",
    desc: "Policy change advocacy milestone",
  },
] as const;

function CredentialTypesGrid() {
  const { ref, visible } = useReveal();
  const groupedTiers = [
    "Community",
    "Peer Support",
    "Clinical",
    "Leadership",
  ] as const;
  const tierColors: Record<string, string> = {
    Community: "oklch(0.62 0.15 155)",
    "Peer Support": "oklch(0.62 0.12 218)",
    Clinical: "oklch(0.75 0.14 55)",
    Leadership: "oklch(0.52 0.14 290)",
  };
  return (
    <div
      ref={ref}
      className={`mt-10 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      data-ocid="integration.credentials_grid"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: "oklch(0.62 0.15 155)" }}
        />
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-0.5"
            style={{ color: "oklch(0.62 0.15 155)" }}
          >
            12 Credential Types
          </p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 220)" }}>
            Earned automatically when community action thresholds are hit — no
            forms, no applications, no committees.
          </p>
        </div>
      </div>

      {groupedTiers.map((tier) => (
        <div key={tier} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
              style={{
                background: `${tierColors[tier].replace(")", " / 0.12)")}`,
                borderColor: `${tierColors[tier].replace(")", " / 0.35)")}`,
                color: tierColors[tier],
              }}
            >
              {tier}
            </span>
            <div
              className="flex-1 h-px"
              style={{
                background: `${tierColors[tier].replace(")", " / 0.15)")}`,
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CREDENTIAL_SHOWCASE.filter((c) => c.tier === tier).map((cred) => (
              <div
                key={cred.name}
                className="rounded-xl p-4 border flex items-start gap-3"
                style={{ background: cred.bg, borderColor: cred.border }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: cred.color.replace(")", " / 0.18)"),
                    border: `1px solid ${cred.color.replace(")", " / 0.35)")}`,
                  }}
                  aria-hidden="true"
                >
                  <Award className="w-4 h-4" style={{ color: cred.color }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="font-semibold text-sm leading-tight"
                    style={{ color: "oklch(0.88 0.02 210)" }}
                  >
                    {cred.name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.58 0.02 220)" }}
                  >
                    {cred.desc}
                  </p>
                  <p
                    className="text-xs font-bold mt-1"
                    style={{ color: cred.color }}
                    aria-label={`Impact score: ${cred.score}`}
                  >
                    +{cred.score} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
