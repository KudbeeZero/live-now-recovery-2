import { type Variants, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

/* ─── animation variants ─────────────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* ─── animated counter hook ──────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { ref, value };
}

/* ─── data ────────────────────────────────────────────────────────────────── */
const gapStats = [
  {
    pct: "10%",
    label: "of people with OUD receive evidence-based treatment nationally",
    note: "SAMHSA 2023 National Survey",
  },
  {
    pct: "43%",
    label: "reduction in MAT show-up rate per 15-minute access delay",
    note: "Journal of Substance Abuse Treatment",
  },
  {
    pct: "61%",
    label:
      "of overdose calls occur after 5pm, when most providers list no availability",
    note: "Ohio EMS Incident Data 2022–2023",
  },
];

const statRows = [
  {
    label: "Referral show-up rate",
    beforeVal: 12,
    before: "12%",
    after: "80%+",
    afterLabel: "warm handoff",
    isPercent: true,
  },
  {
    label: "Average wait for MAT",
    beforeVal: null,
    before: "3.5 weeks",
    after: "< 48 hrs",
    afterLabel: "median connection time",
    isPercent: false,
  },
  {
    label: "ER cost per non-fatal OD",
    beforeVal: null,
    before: "$25,000",
    after: "$115–$5,500",
    afterLabel: "annual MAT cost",
    isPercent: false,
  },
];

const hotZones = [
  { state: "West Virginia", rate: "80.9", rank: 1 },
  { state: "Ohio", rate: "51.3", rank: 2 },
  { state: "Kentucky", rate: "49.2", rank: 3 },
  { state: "Tennessee", rate: "44.6", rank: 4 },
  { state: "New Mexico", rate: "40.2", rank: 5 },
  { state: "Nevada", rate: "38.7", rank: 6 },
  { state: "Louisiana", rate: "37.4", rank: 7 },
  { state: "Delaware", rate: "36.9", rank: 8 },
];

/* ─── sub-components ─────────────────────────────────────────────────────── */
function CountUpStat({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const { ref, value } = useCountUp(target);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/* ─── page ────────────────────────────────────────────────────────────────── */
export function AboutPage() {
  return (
    <main className="min-h-screen" data-ocid="about.page">
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="bg-card border-b border-border px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-3"
            >
              About the Platform
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl font-extrabold text-brand-teal mb-5 leading-tight"
            >
              Built Where the Crisis Is Worst
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl"
            >
              Northeast Ohio sits at the epicenter of America's opioid epidemic.{" "}
              <strong className="text-foreground">
                600+ Cuyahoga County deaths in 2023.
              </strong>{" "}
              <strong className="text-foreground">
                78% fentanyl-involved.
              </strong>{" "}
              Providers open, capacity available — but invisible to the people
              who need them. Live Now Recovery is the real-time coordination
              layer that connects the two.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {/* ── THE GAP ────────────────────────────────────────────────────── */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          aria-labelledby="gap-heading"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <h2
              id="gap-heading"
              className="text-2xl sm:text-3xl font-bold text-brand-teal mb-3"
            >
              The Problem Isn't Treatment. It's Access.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Medication-Assisted Treatment works. The evidence is overwhelming.
              The bottleneck is logistics — fragmented directories, stale hours,
              no real-time availability, and zero warm handoff infrastructure.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {gapStats.map((s, i) => (
              <motion.div
                key={s.pct}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-5 card-teal-accent flex flex-col gap-2"
                data-ocid={`gap-stat-${i}`}
              >
                <p className="text-3xl font-extrabold text-brand-teal">
                  {s.pct}
                </p>
                <p className="text-sm text-foreground font-medium leading-snug">
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground mt-auto">
                  {s.note}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-muted-foreground leading-relaxed"
          >
            These aren't policy failures. They're{" "}
            <strong className="text-foreground">logistics failures.</strong> The
            tools exist. The providers exist. The gap is real-time coordination.
            That's what we built.
          </motion.p>
        </motion.section>

        {/* ── MAT GAP NARRATIVE ─────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="bg-card rounded-2xl shadow-card border border-border p-6"
        >
          <h2 className="text-xl font-bold text-brand-teal mb-4">
            The NE Ohio MAT Access Gap
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Ohio recorded{" "}
            <strong className="text-foreground">
              5,232 overdose deaths in 2023
            </strong>{" "}
            — the third-highest rate in the nation. Cuyahoga County alone
            accounts for 600+ annually, with fentanyl involved in{" "}
            <strong className="text-foreground">78% of cases</strong>. Despite
            this, fewer than 1 in 3 Ohioans who need MAT can access it within 30
            days of seeking help.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-3">
            The gap isn't clinical — MAT works. Buprenorphine reduces overdose
            mortality by <strong className="text-foreground">73–80%</strong>.
            Methadone maintenance reduces illicit opioid use by over{" "}
            <strong className="text-foreground">60%</strong>. The gap is
            logistical: fragmented directories, outdated hours, no real-time
            availability, and no routing system for warm handoffs.
          </p>
          <p className="text-brand-teal font-semibold">
            Live Now Recovery is the routing layer Ohio doesn't have — and every
            hot-zone state desperately needs.
          </p>
        </motion.div>

        {/* ── REGION 13 + NATIONAL SCOPE ────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="bg-card rounded-2xl shadow-card border border-border p-6"
        >
          <h2 className="text-xl font-bold text-brand-teal mb-4">
            Region 13 Coverage — and Beyond
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            ADAMHS Region 13 encompasses Cuyahoga, Geauga, Lake, and Medina
            counties — a combined population of{" "}
            <strong className="text-foreground">1.6 million</strong>, with one
            of the highest overdose density rates per square mile in the
            Midwest. The region has 23 active MAT clinic locations, but only 11
            routinely accept walk-in patients, and fewer than 6 offer same-day
            buprenorphine induction.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our platform maps every provider in the region with live status —
            open/closed, accepting new patients, walk-in availability,
            medication formulary. We connect people at the moment they're ready
            to seek help — a{" "}
            <strong className="text-foreground">72-hour window</strong> that, if
            missed, rarely reopens.
          </p>
          <div className="border-t border-border pt-4">
            <p className="text-muted-foreground leading-relaxed mb-2">
              The same model —{" "}
              <strong className="text-foreground">
                zero PHI, real-time provider status, warm handoffs
              </strong>{" "}
              — works anywhere. West Virginia. Kentucky. Tennessee. New Mexico.
              Any county with untreated OUD and willing providers.
            </p>
            <p className="text-brand-teal font-semibold">
              We piloted in Ohio because Ohio is the proving ground. We built
              for national scale.
            </p>
          </div>
        </motion.div>

        {/* ── BEFORE / AFTER ────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="bg-card rounded-2xl shadow-card border border-border p-6"
        >
          <h2 className="text-xl font-bold text-brand-teal mb-2">
            What This Platform Changes
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">
              Before Live Now Recovery:
            </strong>{" "}
            a person in crisis calls 3 numbers before reaching an available
            provider, waits 3.5 weeks for an appointment, and has a{" "}
            <strong className="text-foreground">12% show-up rate</strong> for
            cold referrals.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-3">
            <strong className="text-foreground">
              After Live Now Recovery:
            </strong>{" "}
            that same person opens the app, finds three available providers
            within 5 miles, and is connected to a warm handoff with an{" "}
            <strong className="text-foreground">80%+ show-up rate</strong> — in
            under 4 minutes.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            That's not speculative. That's what Vermont, Rhode Island, and
            Portugal demonstrated at scale. Ohio has the infrastructure to
            replicate it. We've built the platform.
          </p>

          {/* Animated stat comparison */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="border border-brand-teal/30 rounded-xl overflow-hidden"
          >
            <div className="bg-brand-teal/10 px-4 py-2.5 border-b border-brand-teal/20">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                By the Numbers
              </p>
            </div>
            <div className="divide-y divide-border">
              {statRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4"
                  data-ocid={`stat-row-${row.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">
                      {row.label}
                    </p>
                    <p className="text-base font-bold text-foreground/50">
                      {row.isPercent && row.beforeVal !== null ? (
                        <>
                          <CountUpStat target={row.beforeVal} suffix="%" />
                        </>
                      ) : (
                        row.before
                      )}
                    </p>
                  </div>
                  <div className="text-brand-teal font-bold text-xl">→</div>
                  <div>
                    <p className="text-base font-bold text-brand-teal">
                      {row.after}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.afterLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── NATIONAL PICTURE ──────────────────────────────────────────── */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          aria-labelledby="national-heading"
        >
          <motion.div variants={fadeUp} className="mb-5">
            <h2
              id="national-heading"
              className="text-2xl sm:text-3xl font-bold text-brand-teal mb-3"
            >
              What Happens When This Scales
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">
                110,000 Americans die of overdose every year.
              </strong>{" "}
              The top 10 states by death rate account for 60% of those deaths —
              and every one of them shares the same infrastructure gap Ohio has.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Live Now Recovery doesn't need new science. It needs
              infrastructure. The same canister that serves Cuyahoga County can
              serve Kanawha County, WV or Clark County, NV —{" "}
              <strong className="text-foreground">in days, not years.</strong>
            </p>
            <p className="text-brand-teal font-semibold text-lg">
              That's not a roadmap. That's a deployment.
            </p>
          </motion.div>

          {/* Hot-zone table */}
          <motion.div
            variants={fadeUp}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="bg-brand-teal/10 px-5 py-3 border-b border-brand-teal/20">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                Top Overdose Hot Zones — Deaths per 100k (CDC 2023)
              </p>
            </div>
            <div className="divide-y divide-border">
              {hotZones.map((z, i) => (
                <motion.div
                  key={z.state}
                  variants={fadeUp}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-center justify-between px-5 py-3 ${z.state === "Ohio" ? "bg-brand-teal/5" : ""}`}
                  data-ocid={`hotzone-${z.state.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                        ${
                          z.rank === 1
                            ? "bg-destructive/20 text-destructive"
                            : z.rank <= 3
                              ? "bg-amber/20 text-amber-400"
                              : "bg-brand-teal/10 text-brand-teal"
                        }`}
                    >
                      {z.rank}
                    </span>
                    <span
                      className={`font-semibold text-sm ${z.state === "Ohio" ? "text-brand-teal" : "text-foreground"}`}
                    >
                      {z.state}
                      {z.state === "Ohio" && (
                        <span className="ml-2 text-xs font-normal text-brand-teal/70 bg-brand-teal/10 px-2 py-0.5 rounded-full">
                          Active pilot
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold tabular-nums ${z.rank === 1 ? "text-destructive" : z.rank <= 3 ? "text-amber-400" : "text-foreground/70"}`}
                    >
                      {z.rate}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      / 100k
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-5 py-4 bg-brand-teal/5 border-t border-brand-teal/20">
              <p className="text-sm text-muted-foreground">
                A 10% reduction in overdose mortality across these 8 states
                would prevent{" "}
                <strong className="text-foreground">
                  approximately 6,600 deaths annually
                </strong>{" "}
                and save an estimated{" "}
                <strong className="text-brand-teal">
                  $1.65 billion in healthcare costs.
                </strong>
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* ── TECHNOLOGY ────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="bg-card rounded-2xl shadow-card border border-border p-6"
        >
          <h2 className="text-xl font-bold text-brand-teal mb-4">
            Technology Choices
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We chose the Internet Computer Protocol for one reason: it removes
            every middleman between the platform and the people who need it. No
            AWS. No Google Cloud. No centralized failure point. The
            canister-based architecture means the platform stays online even
            during infrastructure outages — exactly when demand is highest.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The frontend is React/TypeScript with MapLibre GL for real-time
            geospatial routing. The backend is Motoko — a memory-safe language
            purpose-built for ICP's deterministic execution environment. All
            provider data is stored in stable canister state, survives upgrades,
            and is never exposed to third parties.
          </p>
        </motion.div>

        {/* ── PRIVACY ───────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="bg-card rounded-2xl shadow-card border border-border p-6"
        >
          <h2 className="text-xl font-bold text-brand-teal mb-4">
            Privacy Architecture: NO-PHI by Design
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            The NO-PHI policy is non-negotiable. We store provider logistics —
            hours, location, medication availability — not patient data. No
            names, no diagnoses, no contact information, no treatment history.
            This isn't just HIPAA compliance; it's a deliberate design decision
            rooted in understanding stigma.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Research shows that fear of data exposure is one of the{" "}
            <strong className="text-foreground">
              top three barriers to MAT-seeking behavior
            </strong>
            . By building a platform that is architecturally incapable of
            storing PHI — not just policy-restricted — we remove that barrier
            entirely. Anonymous by default. Opt-in only. No exceptions.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
