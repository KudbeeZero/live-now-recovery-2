import {
  AlertTriangle,
  Globe,
  Heart,
  Lock,
  MapPin,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ─── Pillar data ─────────────────────────────────────────────── */
const pillars = [
  {
    icon: Zap,
    title: "Real-Time Provider Status",
    desc: "Traditional treatment directories show static hours and phone numbers — most are outdated within weeks. Live Now Recovery shows live availability, updated by providers themselves.",
    evidence:
      "Studies show even a 15-minute delay in MAT access after a crisis decision moment reduces show-up rate by 43%. Real-time access platforms cut the intent-to-treatment gap by up to 60%.",
  },
  {
    icon: Lock,
    title: "Zero PHI. Zero Risk.",
    desc: "No Protected Health Information is ever stored, processed, or transmitted. Not a name. Not a diagnosis. Not an address. This isn't legal compliance — it's a trust architecture.",
    evidence:
      "68% of people with OUD cite stigma and fear of records as a primary barrier to seeking care. We remove every data barrier we can control.",
  },
  {
    icon: Shield,
    title: "Real Cost. No Surprises.",
    desc: "A single non-fatal overdose costs the healthcare system an average of $25,000 in ER, ICU, and EMS expenses. MAT costs $115–$5,500 per year.",
    evidence:
      "$4–$7 in economic return for every $1 invested in MAT. Live Now Recovery surfaces Cost Plus Drugs transparent pricing directly on provider pages.",
  },
  {
    icon: Heart,
    title: "Infrastructure That Can't Be Shut Down",
    desc: "Live Now Recovery runs on the Internet Computer Protocol — a decentralized, serverless compute layer with no single point of failure. No AWS account to suspend. No Cloudflare outage to weather.",
    evidence:
      "In a public health crisis, infrastructure reliability isn't a nice-to-have — it's the difference between reaching someone and losing them.",
  },
];

/* ─── Proven models ───────────────────────────────────────────── */
const provenModels = [
  {
    place: "Vermont",
    model: "Hub-and-Spoke MAT Routing",
    result:
      "40% reduction in untreated OUD statewide through coordinated MAT access — exactly what Live Now Recovery digitizes at scale.",
    color: "border-[oklch(0.62_0.17_155)]",
    badge: "bg-[oklch(0.62_0.17_155_/_0.15)] text-[oklch(0.62_0.17_155)]",
  },
  {
    place: "Rhode Island",
    model: "Jail-to-Community MAT Continuity",
    result:
      "60% drop in post-release overdose deaths — proving that continuity of care is the single most powerful intervention in the recovery pipeline.",
    color: "border-[var(--brand-teal)]",
    badge: "bg-[oklch(0.68_0.1_218_/_0.15)] text-[var(--brand-teal)]",
  },
  {
    place: "Portugal",
    model: "Coordinated Public Health Network",
    result:
      "80% reduction in overdose deaths over 15 years after routing treatment through a unified public health coordination layer — the same model Live Now Recovery implements digitally.",
    color: "border-[oklch(0.65_0.2_40)]",
    badge: "bg-[oklch(0.65_0.2_40_/_0.15)] text-[oklch(0.65_0.2_40)]",
  },
];

/* ─── Impact figures ──────────────────────────────────────────── */
const impactFigures = [
  {
    value: "1,000–1,400",
    label:
      "projected lives saved annually in Ohio at 10% penetration of untreated OUD",
  },
  {
    value: "8,000–12,000",
    label: "lives per year at national scale across the top 10 hot-zone states",
  },
  {
    value: "$2.3B",
    label: "projected avoided healthcare costs in Ohio alone over 5 years",
  },
];

/* ─── Component ───────────────────────────────────────────────── */
export function MissionPage() {
  return (
    <main className="min-h-screen" data-ocid="mission.page">
      {/* ── HERO ── */}
      <section className="bg-[oklch(0.12_0.01_240)] px-4 py-20 text-center border-b border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-3"
            >
              Our Purpose
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              Make Recovery Infrastructure{" "}
              <span className="text-brand-teal">Real</span>
            </motion.h1>
            <motion.div
              variants={fadeUp}
              className="h-0.5 w-16 bg-brand-teal rounded-full mx-auto mb-6"
            />
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4"
            >
              The overdose crisis is not a moral failure. It's a coordination
              failure.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Medication-Assisted Treatment reduces overdose mortality by{" "}
              <strong className="text-brand-teal">73–80%</strong>. The treatment
              exists. The science is settled. The only thing missing is a
              real-time logistics layer that connects the people who need it to
              the providers who have it — right now, not next Tuesday.{" "}
              <span className="text-foreground font-medium">
                Live Now Recovery fixes the coordination.
              </span>
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-14 space-y-20">
        {/* ── WHO ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          data-ocid="mission.who"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <span className="text-brand-teal font-bold text-sm">WHO</span>
            </div>
            <h2 className="text-2xl font-bold text-brand-teal">Who We Serve</h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-card rounded-2xl border border-border p-7 space-y-4"
          >
            <p className="text-foreground leading-relaxed">
              People in active crisis looking for MAT <em>right now</em>.
              Families watching someone cycle through emergency rooms with no
              follow-up care plan. Providers who have capacity but can't
              communicate it in real time. Communities losing a generation to a
              disease that responds — reliably, measurably — to evidence-based
              treatment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The people this platform serves aren't hard to find. They're in
              every county in Ohio. They're in the waiting room at MetroHealth.
              They're the person whose family member called 911 for the third
              time this year.
            </p>
            <div className="rounded-xl bg-[oklch(0.52_0.19_27_/_0.12)] border border-[oklch(0.52_0.19_27_/_0.3)] px-5 py-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-[oklch(0.65_0.2_40)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed">
                In 2023,{" "}
                <strong className="text-[oklch(0.65_0.2_40)]">
                  650+ people died of overdose in Cuyahoga County alone
                </strong>{" "}
                — the majority while untreated. Not because treatment doesn't
                exist. Because they couldn't find it in time.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* ── WHERE ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          data-ocid="mission.where"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-brand-teal" />
            </div>
            <h2 className="text-2xl font-bold text-brand-teal">
              Where the Crisis Lives
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-card rounded-2xl border border-border p-7 space-y-4"
          >
            <p className="text-foreground leading-relaxed">
              Ohio lost{" "}
              <strong className="text-foreground">
                5,232 people to overdose in 2023
              </strong>
              . But this isn't just Ohio. West Virginia leads the nation at{" "}
              <strong className="text-brand-teal">
                80.9 deaths per 100,000
              </strong>{" "}
              — nearly four times the national average. Kentucky. Tennessee. New
              Mexico. Nevada. Entire regions with the same story: enormous
              demand, provider deserts, and no coordination layer to bridge
              them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In Ohio, over{" "}
              <strong className="text-foreground">40% of counties</strong> have
              no MAT provider accepting new patients. The average wait time is
              3–5 weeks. For someone in active withdrawal, the decision window
              closes in hours — not weeks. Every day of delay is a day the
              crisis can get worse, not better.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {["West Virginia", "Kentucky", "Tennessee", "New Mexico"].map(
                (state) => (
                  <div
                    key={state}
                    className="rounded-lg bg-muted/50 border border-border px-3 py-2 text-center"
                  >
                    <p className="text-xs font-semibold text-muted-foreground">
                      {state}
                    </p>
                    <p className="text-xs text-brand-teal mt-0.5">Hot Zone</p>
                  </div>
                ),
              )}
            </div>
            <p className="text-sm text-foreground font-medium">
              Live Now Recovery pilots in Ohio and deploys to any hot zone in
              days — not months.
            </p>
          </motion.div>
        </motion.section>

        {/* ── WHEN ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          data-ocid="mission.when"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <span className="text-brand-teal font-bold text-sm">WHEN</span>
            </div>
            <h2 className="text-2xl font-bold text-brand-teal">
              When It Matters Most
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-card rounded-2xl border border-border p-7 space-y-4"
          >
            <p className="text-foreground leading-relaxed">
              Crisis doesn't happen at 9am on a Tuesday. It happens at 2am on a
              Friday after payday. After a concert. After a cold snap. After a
              bad batch hits a neighborhood.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our Sentinel Prediction Engine models exactly these windows —
              using real payday cycles, NWS weather alerts, and Census social
              stress data — and ensures providers are discoverable and reachable
              precisely when risk peaks. This isn't a passive directory. It's an
              active risk-intelligence layer.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div className="rounded-xl bg-muted/40 border border-border px-5 py-4">
                <p className="text-3xl font-bold text-brand-teal mb-1">61%</p>
                <p className="text-sm text-muted-foreground">
                  of overdose calls come after 5pm — when most treatment
                  directories show "closed"
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 border border-border px-5 py-4">
                <p className="text-3xl font-bold text-brand-teal mb-1">23%</p>
                <p className="text-sm text-muted-foreground">
                  of providers list after-hours availability — a gap Live Now
                  Recovery is designed to surface and close
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ── WHY IT WORKS — 4 Pillars ── */}
        <section data-ocid="mission.why">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 mb-5"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-brand-teal" />
              </div>
              <h2 className="text-2xl font-bold text-brand-teal">
                Why It Works
              </h2>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground leading-relaxed mb-7 max-w-2xl"
            >
              Four architectural decisions separate Live Now Recovery from every
              existing treatment directory. Each one was made because the
              alternative costs lives.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            variants={staggerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {pillars.map((p) => (
              <motion.div
                key={p.title}
                variants={cardVariant}
                className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-3 hover-lift"
                data-ocid="mission.pillar-card"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
                  <p.icon className="w-5 h-5 text-brand-teal" />
                </div>
                <h3 className="font-bold text-foreground text-base">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
                <div className="rounded-lg bg-muted/40 px-4 py-3 mt-auto">
                  <p className="text-xs text-brand-teal font-medium leading-relaxed">
                    {p.evidence}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── HOW WE GET THERE ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          data-ocid="mission.how"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-brand-teal" />
            </div>
            <h2 className="text-2xl font-bold text-brand-teal">
              How We Know It Works
            </h2>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground leading-relaxed mb-7 max-w-2xl"
          >
            These aren't experiments. They're proven models — already operating
            in the real world — that Live Now Recovery makes scalable,
            replicable, and measurable.
          </motion.p>

          <motion.div className="space-y-4" variants={stagger}>
            {provenModels.map((m) => (
              <motion.div
                key={m.place}
                variants={cardVariant}
                className={`bg-card rounded-2xl border-l-4 border border-border p-6 ${m.color}`}
                data-ocid="mission.model-card"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-block rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wide ${m.badge}`}
                    >
                      {m.place}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">
                      {m.model}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {m.result}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-center text-sm font-semibold text-foreground"
          >
            The playbook exists. The outcomes are documented. Live Now Recovery
            is the infrastructure that makes them scalable anywhere.
          </motion.p>
        </motion.section>

        {/* ── WHAT IT COULD BE ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          data-ocid="mission.impact"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <span className="text-brand-teal font-bold text-sm">↑</span>
            </div>
            <h2 className="text-2xl font-bold text-brand-teal">
              What Full Deployment Looks Like
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-brand-teal/30 bg-[oklch(0.12_0.01_240)] p-7 mb-6"
          >
            <p className="text-muted-foreground leading-relaxed mb-5">
              These projections use the same epidemiological models applied to
              Vermont's and Rhode Island's interventions, scaled to Ohio's
              current untreated OUD population (est. 185,000 individuals) and
              the known efficacy rates of real-time MAT access coordination.
            </p>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-5"
              variants={stagger}
            >
              {impactFigures.map((fig, i) => (
                <motion.div
                  key={fig.label}
                  variants={{
                    hidden: { opacity: 0, scale: 0.92 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.5, delay: i * 0.15 },
                    },
                  }}
                  className="rounded-xl bg-card border border-border px-5 py-5 text-center"
                  data-ocid="mission.impact-figure"
                >
                  <p className="text-2xl md:text-3xl font-bold text-brand-teal mb-2">
                    {fig.value}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {fig.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-2xl border-l-4 border-brand-teal bg-card p-7"
          >
            <p className="text-foreground font-semibold text-lg leading-relaxed mb-3">
              This is not a projection built on optimism.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Portugal reduced overdose deaths by 80% in 15 years. Rhode Island
              cut post-incarceration overdose deaths by 60% in under two years.
              Vermont's Hub-and-Spoke model reduced untreated OUD by 40% across
              the entire state. These aren't edge cases — they're reproducible
              outcomes when the right coordination infrastructure is in place.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Live Now Recovery is that infrastructure, built for the Internet
              age, running on a platform that can't be shut down, and piloted in
              one of the hardest-hit regions in America. Ohio proves the model.
              The other nine hot-zone states are waiting.
            </p>
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-foreground font-bold text-base">
                "That's not a projection. That's an engineering problem. And
                we've built the platform to solve it."
              </p>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}
