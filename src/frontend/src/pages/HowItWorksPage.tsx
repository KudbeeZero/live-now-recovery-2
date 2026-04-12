import { Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  PATIENT_STEPS,
  PROBLEM_CALLOUTS,
  PROVIDER_STEPS,
} from "./HowItWorksData";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function HowItWorksPage() {
  return (
    <main className="min-h-screen" data-ocid="how_it_works.page">
      {/* Hero */}
      <section className="bg-navy px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-live-green mb-3">
              The Platform
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-teal mb-4 leading-tight">
              How Live Now Recovery Works
            </h1>
            <p className="text-on-dark text-lg max-w-2xl leading-relaxed">
              From crisis moment to provider contact in minutes. Here's exactly
              how it works — for people in need and for providers who want to
              help.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* ── Why This Matters ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-brand-teal mb-3">
              The Problem With How Recovery Access Worked Before
            </h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              The existing system wasn't broken by bad intentions. It was broken
              by friction — and friction kills in a crisis.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
          >
            {PROBLEM_CALLOUTS.map(({ icon: Icon, stat, text }) => (
              <motion.div
                key={stat}
                variants={cardVariants}
                className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3"
                data-ocid={`how_it_works.problem.${stat.replace("%", "pct")}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-2xl font-bold text-brand-teal">
                    {stat}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {text}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-foreground font-semibold text-base bg-primary/5 border border-primary/20 rounded-xl px-6 py-4"
          >
            Live Now Recovery compresses that entire chain into a single screen.
          </motion.p>
        </section>

        {/* ── Patient Steps ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-brand-teal mb-2">
              For Patients &amp; Community
            </h2>
            <p className="text-muted-foreground text-sm">
              No login. No data stored. Just the fastest path to care.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PATIENT_STEPS.map(
              ({ icon: Icon, step, title, desc, evidence, color, bg }, idx) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-4"
                  data-ocid={`how_it_works.step.${step}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tracking-widest">
                      STEP {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-base">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {desc}
                  </p>
                  {evidence && (
                    <p className="text-xs font-semibold text-brand-teal border-t border-border pt-3 leading-relaxed">
                      ↳ {evidence}
                    </p>
                  )}
                </motion.div>
              ),
            )}
          </div>
        </section>

        {/* ── Proof of Presence callout ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-xl border border-live-green/30 bg-live-green/5 p-6"
        >
          <h3 className="font-bold text-live-green mb-2">
            What is Proof of Presence (PoP)?
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            PoP is the anonymous signal that someone was physically at a
            provider location. A peer specialist generates a one-time QR code
            from the Helper page. It expires in 5 minutes. When scanned at the
            clinic, the system records one anonymous presence count for that ZIP
            code — no names, no patient IDs, no PHI. Aggregated across hundreds
            of events, these counts reveal where care is actually being accessed
            and help counties allocate resources to working access points.
          </p>
        </motion.div>

        {/* ── Provider Steps ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-brand-teal mb-2">
              For Providers
            </h2>
            <p className="text-muted-foreground text-sm">
              Three steps to go live and start appearing on the map.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {PROVIDER_STEPS.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3"
              >
                <Icon className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-foreground text-base">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── Why Warm Handoffs Work ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-6 md:p-8 mb-10"
            data-ocid="how_it_works.warm_handoff_explainer"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground text-lg">
                Why Warm Handoffs Work
              </h3>
            </div>
            <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
              <p>
                A warm handoff is the difference between "here's a number to
                call" and "someone is coming." Research consistently shows warm
                handoffs increase treatment entry by{" "}
                <span className="text-foreground font-semibold">
                  5–7x compared to cold referrals.
                </span>
              </p>
              <p>
                The National Institute on Drug Abuse reports that every dollar
                invested in addiction treatment returns{" "}
                <span className="text-foreground font-semibold">
                  $4–$7 in reduced drug-related crime, criminal justice costs,
                  and theft.
                </span>{" "}
                Every warm handoff that completes through Live Now Recovery is a
                data point in that return.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {[
                {
                  stat: "80%",
                  label: "warm handoff show-up rate via Live Now Recovery",
                  color: "text-live",
                },
                {
                  stat: "12%",
                  label: "average show-up rate for cold directory referrals",
                  color: "text-amber-recovery",
                },
              ].map((item) => (
                <div key={item.stat} className="bg-secondary rounded-lg p-4">
                  <p className={`text-3xl font-bold ${item.color} mb-1`}>
                    {item.stat}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── CTAs ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Register as a Provider
            </Link>
            <Link
              to="/helper"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors min-h-[44px]"
            >
              Become a Peer Helper
            </Link>
          </div>
        </section>

        {/* ── What Happens At Scale ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-brand-teal/30 bg-card p-8 md:p-10 shadow-card"
            data-ocid="how_it_works.scale_section"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-brand-teal mb-4">
              This Is What Coordinated Recovery Infrastructure Looks Like
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
              <p>
                <span className="text-foreground font-semibold">
                  Vermont built a Hub-and-Spoke model
                </span>{" "}
                and reduced untreated opioid use disorder by{" "}
                <span className="text-brand-teal font-semibold">
                  40% statewide.
                </span>{" "}
                <span className="text-foreground font-semibold">
                  Rhode Island extended MAT into jails
                </span>{" "}
                and cut post-release overdose deaths by{" "}
                <span className="text-brand-teal font-semibold">60%.</span>
              </p>
              <p>
                These aren't theories. They are documented outcomes from states
                that chose coordination over fragmentation. The interventions
                existed everywhere. What changed was{" "}
                <em>infrastructure and access.</em>
              </p>
              <p>
                Live Now Recovery digitizes both models into a single platform —
                deployable in any county with willing providers. The Sentinel
                Prediction Engine identifies where outreach is needed before the
                crisis peaks. The fiscal impact layer proves the ROI to every
                county health department that has to justify budget to a board.
              </p>
            </div>
            <Link
              to="/national-impact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-teal text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]"
              data-ocid="how_it_works.national_impact_cta"
            >
              See the National Impact →
            </Link>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
