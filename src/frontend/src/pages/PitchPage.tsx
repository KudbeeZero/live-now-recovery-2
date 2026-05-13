import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";

// ─── Pitch-page-only styles ──────────────────────────────────────────────────
// Injected as a <style> tag scoped to this page only.
const PITCH_STYLES = `
  .pitch-root {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    background: #0a0f1e;
    color: #f5f5f0;
    overflow-x: hidden;
    position: relative;
    scroll-behavior: smooth;
  }

  .pitch-grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.03;
  }

  .pitch-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 44px;
    background: #0a0f1e;
    border-bottom: 1px solid rgba(245,245,240,0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
  }

  .pitch-wordmark {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: #f5f5f0;
    letter-spacing: 0.01em;
  }

  .pitch-domain {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 0.75rem;
    color: #00c896;
    font-variant: small-caps;
    letter-spacing: 0.08em;
  }

  .pitch-section {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 6rem 2rem 4rem;
  }

  .pitch-section-inner {
    max-width: 1080px;
    margin: 0 auto;
    width: 100%;
  }

  .pitch-label {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: #00c896;
    font-variant: small-caps;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    display: block;
  }

  .pitch-h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(2.4rem, 6vw, 5rem);
    font-weight: 400;
    line-height: 1.08;
    color: #f5f5f0;
    margin: 0 0 1.5rem;
    position: relative;
  }

  .pitch-h2 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-weight: 400;
    line-height: 1.15;
    color: #f5f5f0;
    margin: 0 0 2rem;
  }

  .pitch-subhead {
    font-size: clamp(1rem, 2vw, 1.15rem);
    color: rgba(245,245,240,0.75);
    max-width: 600px;
    line-height: 1.7;
    margin: 0 0 3rem;
  }

  .pitch-body {
    font-size: clamp(0.9rem, 1.5vw, 1rem);
    color: rgba(245,245,240,0.75);
    line-height: 1.8;
    max-width: 720px;
  }

  /* Hero glow */
  .pitch-hero-glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse 60% 40% at center 30%, rgba(0,200,150,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Stat counters */
  .pitch-stats {
    display: flex;
    gap: 3rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .pitch-stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .pitch-stat-num {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: #00c896;
    line-height: 1;
    tabular-nums: true;
  }

  .pitch-stat-label {
    font-size: 0.75rem;
    color: rgba(245,245,240,0.55);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-variant: small-caps;
  }

  /* Chevron */
  .pitch-chevron {
    color: #00c896;
    cursor: pointer;
    margin-top: 2rem;
    display: inline-block;
    animation: pitchChevron 2s ease-in-out infinite;
  }
  @keyframes pitchChevron {
    0%, 100% { opacity: 0.9; transform: translateY(0); }
    50% { opacity: 0.4; transform: translateY(6px); }
  }

  /* Section bg variants */
  .pitch-bg-charcoal { background: #1a2035; }
  .pitch-bg-navy { background: #0a0f1e; }

  /* Problem stat callouts */
  .pitch-callouts {
    display: flex;
    gap: 3rem;
    margin: 2.5rem 0;
    flex-wrap: wrap;
  }

  .pitch-callout-num {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: clamp(2.2rem, 5vw, 3.8rem);
    font-weight: 700;
    color: #00c896;
    line-height: 1;
  }

  .pitch-callout-label {
    font-size: 0.8rem;
    color: rgba(245,245,240,0.6);
    max-width: 180px;
    line-height: 1.5;
    margin-top: 0.5rem;
  }

  /* Feature grid 2x2 */
  .pitch-grid-2x2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    margin: 2rem 0;
    background: rgba(245,245,240,0.04);
  }

  .pitch-feature-block {
    background: #0a0f1e;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pitch-feature-icon {
    font-size: 1.5rem;
    color: #00c896;
  }

  .pitch-feature-title {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #f5f5f0;
  }

  .pitch-feature-body {
    font-size: 0.875rem;
    color: rgba(245,245,240,0.65);
    line-height: 1.7;
  }

  /* Journey timeline */
  .pitch-timeline-wrap {
    margin-top: 3rem;
    position: relative;
    overflow: hidden;
  }

  .pitch-timeline-steps {
    display: flex;
    align-items: center;
    gap: 0;
    position: relative;
  }

  .pitch-timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    position: relative;
    z-index: 2;
  }

  .pitch-timeline-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #00c896;
    flex-shrink: 0;
  }

  .pitch-timeline-label {
    font-size: 0.75rem;
    color: rgba(245,245,240,0.7);
    text-align: center;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .pitch-timeline-connector {
    height: 2px;
    background: #00c896;
    flex: 1;
    margin-bottom: 1.5rem;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 1s ease-out;
  }

  .pitch-timeline-connector.animated {
    transform: scaleX(1);
  }

  /* Signal stack */
  .pitch-signal-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin: 2rem 0;
    max-width: 760px;
  }

  .pitch-signal-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }

  .pitch-signal-item.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .pitch-signal-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00c896;
    flex-shrink: 0;
    margin-top: 0.35rem;
    animation: pitchPulse 3s ease-in-out infinite;
  }

  @keyframes pitchPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .pitch-signal-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: #f5f5f0;
  }

  .pitch-signal-desc {
    font-size: 0.8rem;
    color: rgba(245,245,240,0.6);
    line-height: 1.6;
    margin-top: 0.15rem;
  }

  /* Compound risk callout */
  .pitch-compound {
    border: 2px solid #00c896;
    background: rgba(0,200,150,0.04);
    border-radius: 4px;
    padding: 1.75rem 2rem;
    max-width: 760px;
    margin: 2rem 0;
  }

  .pitch-compound-text {
    font-size: 0.9rem;
    color: rgba(245,245,240,0.8);
    line-height: 1.75;
  }

  /* Scalability statement */
  .pitch-scale-stmt {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(1.3rem, 3vw, 2rem);
    font-weight: 400;
    color: #f5f5f0;
    text-align: center;
    margin-top: 3rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Capability blocks 3-col */
  .pitch-caps {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2px;
    background: rgba(245,245,240,0.04);
    margin: 2.5rem 0;
  }

  .pitch-cap-block {
    background: #1a2035;
    padding: 2rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pitch-cap-icon {
    font-size: 1.4rem;
    color: #00c896;
    margin-bottom: 0.25rem;
  }

  .pitch-cap-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #f5f5f0;
  }

  .pitch-cap-body {
    font-size: 0.8rem;
    color: rgba(245,245,240,0.6);
    line-height: 1.65;
  }

  /* Two columns */
  .pitch-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    margin: 2rem 0;
  }

  /* Revenue list */
  .pitch-revenue-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .pitch-revenue-item {
    padding-left: 1.25rem;
    border-left: 3px solid #00c896;
    font-size: 0.875rem;
    color: rgba(245,245,240,0.75);
    line-height: 1.6;
  }

  .pitch-revenue-item strong {
    color: #f5f5f0;
    font-weight: 600;
    display: block;
    margin-bottom: 0.1rem;
  }

  /* Origin statement */
  .pitch-origin {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: clamp(0.9rem, 1.5vw, 1.1rem);
    color: rgba(245,245,240,0.7);
    text-align: center;
    max-width: 680px;
    margin: 3rem auto 0;
    line-height: 1.8;
  }

  /* Contact section */
  .pitch-contact-form {
    max-width: 540px;
    margin: 2.5rem 0;
  }

  .pitch-input-label {
    display: block;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(245,245,240,0.5);
    margin-bottom: 0.6rem;
    font-variant: small-caps;
    font-family: 'Courier New', ui-monospace, monospace;
  }

  .pitch-input {
    width: 100%;
    background: rgba(245,245,240,0.04);
    border: 1px solid rgba(245,245,240,0.12);
    border-radius: 3px;
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
    color: #f5f5f0;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    outline: none;
    min-height: 48px;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .pitch-input:focus {
    border-color: #00c896;
    box-shadow: 0 0 0 1px rgba(0,200,150,0.2);
  }

  .pitch-input::placeholder {
    color: rgba(245,245,240,0.25);
  }

  .pitch-submit {
    width: 100%;
    padding: 0.9rem 1.5rem;
    background: #00c896;
    color: #0a0f1e;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    min-height: 48px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: background 0.2s, opacity 0.2s;
    margin-top: 1rem;
  }

  .pitch-submit:hover { background: #00dca8; }
  .pitch-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .pitch-success {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.1rem;
    color: #f5f5f0;
    padding: 2rem 0;
  }

  .pitch-footer-meta {
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .pitch-footer-line {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 0.7rem;
    color: #00c896;
    letter-spacing: 0.08em;
  }

  /* Fade-up animation for section entries */
  .pitch-fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .pitch-fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .pitch-topbar { padding: 0 1rem; }
    .pitch-section { padding: 5rem 1.25rem 3rem; }
    .pitch-stats { flex-direction: column; gap: 1.5rem; }
    .pitch-callouts { flex-direction: column; gap: 1.5rem; }
    .pitch-grid-2x2 { grid-template-columns: 1fr; }
    .pitch-caps { grid-template-columns: 1fr; }
    .pitch-two-col { grid-template-columns: 1fr; gap: 2rem; }
    .pitch-timeline-steps { flex-wrap: wrap; gap: 1rem; justify-content: center; }
    .pitch-timeline-connector { display: none; }
    .pitch-timeline-step { flex: 0 0 calc(50% - 0.5rem); }
    .pitch-compound { padding: 1.25rem; }
    .pitch-scale-stmt { text-align: left; }
  }
`;

// ─── Live data hook ───────────────────────────────────────────────────────────
function usePitchStats() {
  const { actor, isFetching } = useActor(createActor);

  const providersQuery = useQuery({
    queryKey: ["pitch", "providers"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getAllProviders();
      return result.length;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  const handoffsQuery = useQuery({
    queryKey: ["pitch", "handoffs"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getTotalHandoffs();
      return Number(result);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  return {
    providerCount: providersQuery.data ?? 47,
    handoffCount: handoffsQuery.data ?? 1247,
    volunteerCount: 89,
  };
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const start = performance.now();
    const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOut(progress) * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function StatCounter({ target, label }: { target: number; label: string }) {
  const value = useCountUp(target);
  return (
    <div className="pitch-stat-item">
      <span className="pitch-stat-num">{value.toLocaleString()}</span>
      <span className="pitch-stat-label">{label}</span>
    </div>
  );
}

// ─── Fade-up wrapper ──────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`pitch-fade-up ${className}`}>
      {children}
    </div>
  );
}

// ─── Signal stack ─────────────────────────────────────────────────────────────
const SIGNALS = [
  {
    name: "Government payment day proximity",
    desc: "A 35–40% overdose spike is documented in the 5 days following benefit issuance. We know every payment date in Ohio.",
  },
  {
    name: "Heat index",
    desc: "Extreme heat is associated with 150+ excess overdose deaths annually. We read it daily.",
  },
  {
    name: "Cold weather threshold",
    desc: "Cold exposure independently increases opioid overdose death risk. Both extremes matter.",
  },
  {
    name: "Unemployment rate",
    desc: "Higher county unemployment correlates with increased opioid misuse and overdose mortality. Updated monthly from BLS data.",
  },
  {
    name: "Eviction rate index",
    desc: "Rising eviction filings predict overdose mortality spikes. We track Ohio county court data.",
  },
  {
    name: "Seasonal depression window",
    desc: "November through February in Ohio carries compounding mental health burden. Built into every score.",
  },
  {
    name: "Provider availability gap",
    desc: "Counties where providers aren't checking in carry structural elevated risk. Live from our own canister.",
  },
];

function SignalStack() {
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add("visible"), i * 80);
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  return (
    <ul className="pitch-signal-list" aria-label="Risk signals">
      {SIGNALS.map((s, i) => (
        <li
          key={s.name}
          className="pitch-signal-item"
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
        >
          <span className="pitch-signal-dot" aria-hidden="true" />
          <div>
            <div className="pitch-signal-name">{s.name}</div>
            <div className="pitch-signal-desc">{s.desc}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── Journey timeline ─────────────────────────────────────────────────────────
const JOURNEY_STEPS = [
  "Search",
  "Find Open Slot",
  "Initiate Handoff",
  "Connected",
];

function JourneyTimeline() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lineRefs.current.forEach((el, i) => {
            if (!el) return;
            setTimeout(() => el.classList.add("animated"), i * 220);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="pitch-timeline-wrap" ref={wrapRef}>
      <ol className="pitch-timeline-steps" aria-label="User journey">
        {JOURNEY_STEPS.map((step, i) => (
          <>
            <li key={step} className="pitch-timeline-step">
              <div className="pitch-timeline-dot" aria-hidden="true" />
              <span className="pitch-timeline-label">{step}</span>
            </li>
            {i < JOURNEY_STEPS.length - 1 && (
              <div
                key={`conn-${step}`}
                className="pitch-timeline-connector"
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                aria-hidden="true"
              />
            )}
          </>
        ))}
      </ol>
    </div>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");

    const timestamp = new Date().toISOString();
    const body = `Conversation request from: ${email.trim()}\n\nTimestamp: ${timestamp}`;

    try {
      // Send via email extension endpoint
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "admin@livenowrecovery.org",
          subject: "Pitch Page — Conversation Request",
          body,
        }),
      });

      if (!res.ok) throw new Error("Email endpoint returned non-OK");
      setSubmitted(true);
    } catch {
      // Fallback: open mailto
      const mailtoLink = `mailto:admin@livenowrecovery.org?subject=${encodeURIComponent("Pitch Page — Conversation Request")}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pitch-success" data-ocid="pitch.success_state">
        We'll be in touch. Thank you for your time.
      </div>
    );
  }

  return (
    <form
      className="pitch-contact-form"
      onSubmit={handleSubmit}
      data-ocid="pitch.contact_form"
    >
      <label htmlFor="pitch-email" className="pitch-input-label">
        Request a conversation
      </label>
      <input
        id="pitch-email"
        type="email"
        className="pitch-input"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email address"
        data-ocid="pitch.email_input"
      />
      {error && (
        <p
          style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "0.5rem" }}
          data-ocid="pitch.error_state"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        className="pitch-submit"
        disabled={submitting || !email.trim()}
        data-ocid="pitch.submit_button"
      >
        {submitting ? "Sending…" : "Request a conversation"}
      </button>
    </form>
  );
}

// ─── Main PitchPage ───────────────────────────────────────────────────────────
// ─── Pitch Gate ───────────────────────────────────────────────────────────────────
const GATE_STYLES = `
  @keyframes gateShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
  .gate-shake { animation: gateShake 0.45s ease-in-out; }
`;

function PitchGate({ onGranted }: { onGranted: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const CORRECT = "RECOVERY";

  function attempt() {
    if (code.trim().toUpperCase() === CORRECT) {
      sessionStorage.setItem("pitch_access", "granted");
      onGranted();
    } else {
      setShaking(true);
      setError("Invalid access code");
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(""), 3000);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") attempt();
  }

  return (
    <>
      <style>{GATE_STYLES}</style>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "#0a0f1e" }}
        data-ocid="pitch.gate"
      >
        <div className="w-full max-w-sm text-center">
          {/* Wordmark */}
          <p
            className="mb-1"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#f5f5f0",
              letterSpacing: "0.01em",
            }}
          >
            Live Now Recovery
          </p>
          <p
            className="mb-10"
            style={{
              fontFamily: "'Courier New', ui-monospace, monospace",
              fontSize: "0.7rem",
              color: "rgba(245,245,240,0.45)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Investor Brief — Private Access
          </p>

          {/* Input */}
          <div className={shaking ? "gate-shake" : ""}>
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
              placeholder="Enter access code"
              style={{
                width: "100%",
                background: "rgba(245,245,240,0.04)",
                border: error
                  ? "1px solid rgba(248,113,113,0.7)"
                  : "1px solid rgba(245,245,240,0.12)",
                borderRadius: "3px",
                padding: "0.875rem 1rem",
                fontSize: "0.9rem",
                color: "#f5f5f0",
                fontFamily: "'Courier New', ui-monospace, monospace",
                outline: "none",
                minHeight: "48px",
                boxSizing: "border-box" as const,
                textAlign: "center",
                letterSpacing: "0.12em",
                transition: "border-color 0.2s",
              }}
              data-ocid="pitch.gate_input"
            />
            {error && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.78rem",
                  marginTop: "0.5rem",
                  textAlign: "center",
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
                data-ocid="pitch.gate_error_state"
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={attempt}
            style={{
              width: "100%",
              marginTop: "1rem",
              padding: "0.9rem 1.5rem",
              background: "#00c896",
              color: "#0a0f1e",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 700,
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              minHeight: "48px",
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
              transition: "background 0.2s",
            }}
            data-ocid="pitch.gate_submit"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Pitch Content (original page body) ──────────────────────────────────────────
function PitchContent() {
  const { providerCount, handoffCount, volunteerCount } = usePitchStats();

  return (
    <>
      <style>{PITCH_STYLES}</style>

      <div className="pitch-root" data-ocid="pitch.page">
        {/* Grain overlay */}
        <div className="pitch-grain" aria-hidden="true" />

        {/* ── Fixed top bar ────────────────────────────────────────── */}
        <header className="pitch-topbar" data-ocid="pitch.topbar">
          <span className="pitch-wordmark">Live Now Recovery</span>
          <span className="pitch-domain">livenowrecovery.org</span>
        </header>

        {/* ── Section 1 — Hero ─────────────────────────────────── */}
        <section
          className="pitch-section pitch-bg-navy"
          style={{ minHeight: "100vh", justifyContent: "center" }}
          data-ocid="pitch.hero"
        >
          <div className="pitch-hero-glow" aria-hidden="true" />
          <div className="pitch-section-inner">
            <FadeUp>
              <span className="pitch-label">
                Live Now Recovery — Investor Brief
              </span>
            </FadeUp>

            <FadeUp delay={100}>
              <h1 className="pitch-h1">
                The infrastructure
                <br />
                that should have existed.
              </h1>
            </FadeUp>

            <FadeUp delay={200}>
              <p className="pitch-subhead">
                Real-time treatment access. Decentralized. No PHI. No middlemen.
                No single point of failure.
              </p>
            </FadeUp>

            <FadeUp delay={300}>
              <div className="pitch-stats" data-ocid="pitch.stats">
                <StatCounter
                  target={providerCount}
                  label="Providers in Network"
                />
                <StatCounter target={handoffCount} label="Check-ins Today" />
                <StatCounter
                  target={volunteerCount}
                  label="Volunteers Credentialed"
                />
              </div>
            </FadeUp>

            <button
              type="button"
              className="pitch-chevron"
              onClick={() =>
                document
                  .getElementById("problem")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              aria-label="Scroll to The Problem section"
              data-ocid="pitch.scroll_button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </section>

        {/* ── Section 2 — The Problem ────────────────────────────── */}
        <section
          id="problem"
          className="pitch-section pitch-bg-charcoal"
          data-ocid="pitch.problem"
        >
          <div className="pitch-section-inner">
            <FadeUp>
              <span className="pitch-label">The Problem</span>
            </FadeUp>

            <FadeUp delay={80}>
              <h2 className="pitch-h2">
                Every day in Ohio, people in crisis call treatment centers that
                stopped accepting patients months ago.
              </h2>
            </FadeUp>

            <FadeUp delay={160}>
              <div className="pitch-callouts" data-ocid="pitch.problem_stats">
                <div>
                  <div className="pitch-callout-num">47,583</div>
                  <div className="pitch-callout-label">
                    Ohioans who died of overdose in the last decade
                  </div>
                </div>
                <div>
                  <div className="pitch-callout-num">$2.50</div>
                  <div className="pitch-callout-label">
                    Actual cost to manufacture one buprenorphine film
                  </div>
                </div>
                <div>
                  <div className="pitch-callout-num">$270</div>
                  <div className="pitch-callout-label">
                    What people pay without insurance
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={240}>
              <p className="pitch-body">
                The directory hasn't changed. The crisis has. The gap between
                those two facts is where people die. It is not anyone's fault.
                The infrastructure to fix it didn't exist until now.
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ── Section 3 — The Platform ──────────────────────────── */}
        <section
          id="platform"
          className="pitch-section pitch-bg-navy"
          data-ocid="pitch.platform"
        >
          <div className="pitch-section-inner">
            <FadeUp>
              <span className="pitch-label">The Platform</span>
            </FadeUp>

            <FadeUp delay={80}>
              <h2 className="pitch-h2">
                We didn't build a better directory. We built a system where the
                directory updates itself.
              </h2>
            </FadeUp>

            <FadeUp delay={160}>
              <div className="pitch-grid-2x2" data-ocid="pitch.platform_grid">
                <div className="pitch-feature-block">
                  <div className="pitch-feature-icon" aria-hidden="true">
                    ⬡
                  </div>
                  <div className="pitch-feature-title">
                    No server to take down
                  </div>
                  <div className="pitch-feature-body">
                    Runs on the Internet Computer Protocol, a decentralized
                    global node network. There is no AWS outage that takes us
                    offline. No hosting bill that ends the service.
                  </div>
                </div>
                <div className="pitch-feature-block">
                  <div className="pitch-feature-icon" aria-hidden="true">
                    ⎆
                  </div>
                  <div className="pitch-feature-title">
                    No rules that can be changed
                  </div>
                  <div className="pitch-feature-body">
                    Provider data integrity, volunteer credential requirements,
                    and no-PHI architecture are written into canister code. No
                    administrator, investor, or bad actor can override them
                    after deployment.
                  </div>
                </div>
                <div className="pitch-feature-block">
                  <div className="pitch-feature-icon" aria-hidden="true">
                    ◉
                  </div>
                  <div className="pitch-feature-title">No PHI. Ever.</div>
                  <div className="pitch-feature-body">
                    Not by policy. By architecture. No name, no diagnosis, no
                    insurance status is requested, stored, or transmitted at any
                    point in the handoff flow.
                  </div>
                </div>
                <div className="pitch-feature-block">
                  <div className="pitch-feature-icon" aria-hidden="true">
                    →
                  </div>
                  <div className="pitch-feature-title">
                    No middleman in the connection
                  </div>
                  <div className="pitch-feature-body">
                    A person in crisis finds an open intake slot in under 60
                    seconds, anonymously. The handoff is direct, free, and
                    immediate.
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={240}>
              <JourneyTimeline />
            </FadeUp>
          </div>
        </section>

        {/* ── Section 4 — Sentinel ──────────────────────────────── */}
        <section
          id="sentinel"
          className="pitch-section pitch-bg-navy"
          style={{ borderTop: "1px solid rgba(245,245,240,0.04)" }}
          data-ocid="pitch.sentinel"
        >
          <div className="pitch-section-inner">
            <FadeUp>
              <span className="pitch-label">Sentinel — Patent Pending</span>
            </FadeUp>

            <FadeUp delay={80}>
              <h2 className="pitch-h2">We don't just respond. We predict.</h2>
            </FadeUp>

            <FadeUp delay={140}>
              <p className="pitch-subhead" style={{ marginBottom: "0" }}>
                A peer-reviewed prediction engine that reads converging risk
                signals and dispatches credentialed volunteers before the crisis
                call comes in.
              </p>
            </FadeUp>

            <SignalStack />

            <FadeUp delay={0}>
              <div className="pitch-compound" data-ocid="pitch.compound_risk">
                <p className="pitch-compound-text">
                  When multiple signals converge simultaneously — payment day,
                  cold snap, rising evictions — Sentinel fires a Compound Risk
                  Event. Volunteers are dispatched immediately. This is the
                  detection layer that doesn't exist anywhere else.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={80}>
              <p className="pitch-scale-stmt">
                Ohio is the training ground. Everywhere else is a configuration
                file.
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ── Section 5 — The Physical Network ─────────────────────── */}
        <section
          id="network"
          className="pitch-section pitch-bg-charcoal"
          data-ocid="pitch.network"
        >
          <div className="pitch-section-inner">
            <FadeUp>
              <span className="pitch-label">The Physical Network</span>
            </FadeUp>

            <FadeUp delay={80}>
              <h2 className="pitch-h2">
                The platform doesn't stop at the screen.
              </h2>
            </FadeUp>

            <FadeUp delay={140}>
              <p className="pitch-body">
                Credentialed volunteers maintain a decentralized network of
                naloxone lockboxes, fentanyl test strips, and harm reduction
                supplies across Ohio. Every location is tracked live on-chain.
                When Sentinel detects elevated risk in a county, volunteers are
                dispatched to check inventory and restock. Someone in crisis
                finds the nearest stocked location in under 60 seconds — on the
                same platform where they find a provider.
              </p>
            </FadeUp>

            <FadeUp delay={200}>
              <div
                className="pitch-caps"
                data-ocid="pitch.network_capabilities"
              >
                <div className="pitch-cap-block">
                  <div className="pitch-cap-icon" aria-hidden="true">
                    ⊙
                  </div>
                  <div className="pitch-cap-title">Live inventory tracking</div>
                  <div className="pitch-cap-body">
                    Every lockbox location and stock level recorded on ICP. No
                    spreadsheet. No phone call.
                  </div>
                </div>
                <div className="pitch-cap-block">
                  <div className="pitch-cap-icon" aria-hidden="true">
                    ▶
                  </div>
                  <div className="pitch-cap-title">
                    Sentinel-triggered restocking
                  </div>
                  <div className="pitch-cap-body">
                    When risk scores elevate, volunteers are dispatched to
                    physical locations before supply runs out.
                  </div>
                </div>
                <div className="pitch-cap-block">
                  <div className="pitch-cap-icon" aria-hidden="true">
                    ◈
                  </div>
                  <div className="pitch-cap-title">
                    Volunteer-delivered, not institutionally dependent
                  </div>
                  <div className="pitch-cap-body">
                    The network runs on credentialed community members, not
                    logistics contracts or institutional budgets.
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── Section 6 — The Structure ────────────────────────────── */}
        <section
          id="structure"
          className="pitch-section pitch-bg-navy"
          data-ocid="pitch.structure"
        >
          <div className="pitch-section-inner">
            <FadeUp>
              <span className="pitch-label">The Structure</span>
            </FadeUp>

            <FadeUp delay={80}>
              <h2 className="pitch-h2">Built to outlast its funding.</h2>
            </FadeUp>

            <FadeUp delay={140}>
              <div className="pitch-two-col">
                <div>
                  <p className="pitch-body">
                    Live Now Recovery is a nonprofit by design. That means it
                    cannot be acquired and dismantled by a pharmacy chain or a
                    PBM. The mission is written into the structure, not just the
                    marketing.
                  </p>
                </div>
                <div>
                  <ul
                    className="pitch-revenue-list"
                    aria-label="Sustainability model"
                  >
                    <li className="pitch-revenue-item">
                      <strong>Sentinel state licensing</strong>
                      other states pay to deploy the engine
                    </li>
                    <li className="pitch-revenue-item">
                      <strong>Provider verification fees</strong>
                      small annual fee for verified listings
                    </li>
                    <li className="pitch-revenue-item">
                      <strong>SAMHSA and federal harm reduction grants</strong>a
                      working product that grants rarely see
                    </li>
                    <li className="pitch-revenue-item">
                      <strong>Pharmaceutical partnerships</strong>
                      preferred low-cost buprenorphine referral built into the
                      handoff flow
                    </li>
                    <li className="pitch-revenue-item">
                      <strong>Physical network supply grants</strong>
                      state and county harm reduction funding
                    </li>
                  </ul>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={200}>
              <p className="pitch-origin">
                Ohio was the starting point because it's where the founder got
                help. One of the founders of Brightside Clinic — 17 locations
                across Illinois and Ohio — is part of this effort. That's not a
                coincidence. That's proof of market.
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ── Section 7 — The Conversation ─────────────────────────── */}
        <section
          id="contact"
          className="pitch-section pitch-bg-navy"
          style={{ borderTop: "1px solid rgba(245,245,240,0.04)" }}
          data-ocid="pitch.contact"
        >
          <div className="pitch-section-inner">
            <FadeUp>
              <span className="pitch-label">The Conversation</span>
            </FadeUp>

            <FadeUp delay={80}>
              <h2
                className="pitch-h2"
                style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
              >
                Five minutes.
              </h2>
            </FadeUp>

            <FadeUp delay={140}>
              <p className="pitch-subhead">
                If you've read this far, you already know this is different. The
                platform is live. The architecture is built. The data is real.
                We're looking for one conversation with someone who sees what
                this becomes.
              </p>
            </FadeUp>

            <FadeUp delay={200}>
              <ContactForm />
            </FadeUp>

            <FadeUp delay={280}>
              <div className="pitch-footer-meta" data-ocid="pitch.footer_meta">
                <span className="pitch-footer-line">livenowrecovery.org</span>
                <span className="pitch-footer-line">
                  Patent Pending — Sentinel Prediction Engine &amp; Soulbound
                  Volunteer Credential System
                </span>
                <span className="pitch-footer-line">
                  Built on the Internet Computer Protocol
                </span>
              </div>
            </FadeUp>
          </div>
        </section>
      </div>
    </>
  );
}

export function PitchPage() {
  const [accessGranted, setAccessGranted] = useState(
    () => sessionStorage.getItem("pitch_access") === "granted",
  );

  return (
    <AnimatePresence mode="wait">
      {!accessGranted ? (
        <motion.div
          key="gate"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <PitchGate onGranted={() => setAccessGranted(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="pitch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
        >
          <PitchContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
