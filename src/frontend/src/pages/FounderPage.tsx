import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Heart, MapPin } from "lucide-react";
import { motion } from "motion/react";

const timeline = [
  {
    year: "2014",
    title: "Rock Bottom",
    description:
      "'Rock bottom' isn't a place — it's a decision. For me, it was the moment I realized the next step was either treatment or not waking up. I chose treatment. That decision took everything I had.",
    isLast: false,
  },
  {
    year: "2015",
    title: "First MAT Appointment",
    description:
      "Buprenorphine changed everything within weeks. The literature is right: when the cravings step back, you get your life back. I started thinking about the future for the first time in years.",
    isLast: false,
  },
  {
    year: "2018",
    title: "Four Years Clean",
    description:
      "Started volunteering with community recovery programs. Saw firsthand that the people who didn't make it weren't weaker than me — they just hit different logistics walls at different moments. The same walls I almost hit.",
    isLast: false,
  },
  {
    year: "2021",
    title: "Mapping the Gap",
    description:
      "Spent 6 months mapping the provider landscape in NE Ohio. Discovered that 40% of listed providers were no longer accepting patients. Clinic hours were wrong. Phone numbers were dead. The system wasn't broken — it was invisible. I started documenting it before I wrote a single line of code.",
    isLast: false,
  },
  {
    year: "2024–25",
    title: "Live Now Recovery Launches",
    description:
      "This isn't a startup. It's a public health intervention wrapped in a technology platform. Every warm handoff that completes is a data point in the case for scaling this nationally. Every provider that goes live is a door that didn't exist yesterday.",
    isLast: true,
  },
];

const hotZones = [
  { state: "West Virginia", stat: "80.9 per 100k", rank: "#1 death rate" },
  { state: "Kentucky", stat: "56.2 per 100k", rank: "#2 death rate" },
  { state: "Tennessee", stat: "54.6 per 100k", rank: "#3 death rate" },
  { state: "New Mexico", stat: "51.3 per 100k", rank: "#4 death rate" },
  { state: "Nevada", stat: "47.1 per 100k", rank: "#5 death rate" },
];

const itemVariants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0 },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function FounderPage() {
  return (
    <main className="min-h-screen" data-ocid="founder.page">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative bg-[oklch(0.12_0.01_240)] px-4 py-20 text-center overflow-hidden">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-brand-teal opacity-[0.04] blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="w-14 h-14 rounded-full bg-brand-teal/15 flex items-center justify-center mx-auto mb-6 border border-brand-teal/30">
              <Heart className="w-7 h-7 text-brand-teal" fill="currentColor" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-4">
              The Founder
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-teal mb-5 leading-tight">
              Built by Someone Who Needed It
            </h1>
            <p className="text-[oklch(0.78_0.01_220)] text-lg sm:text-xl leading-relaxed max-w-xl mx-auto">
              I didn't build this from a whiteboard. I built it because I
              remember the night I couldn't find a clinic that was open. And I
              know how that story ends.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOUNDING STORY ─────────────────────────────────────── */}
      <section className="bg-background py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-card rounded-xl border border-border p-8 text-left space-y-5 card-teal-accent"
          >
            <p className="text-muted-foreground leading-relaxed">
              I know what the gap feels like because I lived in it. When I was
              ready to get help, I called four numbers. Two were disconnected.
              One had a 6-week wait. The fourth got me in — and that single
              conversation changed everything. But it took{" "}
              <strong className="text-foreground">72 hours of searching</strong>{" "}
              to find it.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The difference between finding help and losing hope in those 72
              hours wasn't my character — it was a directory that hadn't been
              updated in 6 months.{" "}
              <strong className="text-foreground">
                That's a solvable problem.
              </strong>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              I searched for a MAT provider at 11pm on a Friday after a relapse.
              Every clinic I could find was closed. Every phone line rang out.
              The information existed — it just wasn't reachable.{" "}
              <strong className="text-foreground">
                That's the gap Live Now Recovery closes.
              </strong>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Live Now Recovery is the platform I wish had existed when I needed
              it. It's not built on sympathy. It's built on systems — because
              sympathy doesn't answer the phone at 2am, but a real-time provider
              database does.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Privacy was non-negotiable from day one. The stigma around
              addiction is real. Anyone should be able to find a provider
              without leaving any trace. No account. No login. No data.
            </p>
            <p className="text-foreground font-semibold border-t border-border pt-5">
              If you're in the middle of it right now: call{" "}
              <span className="text-brand-teal">833-234-6343</span>. Ohio MAR
              NOW. We built this because you matter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── RECOVERY TIMELINE ──────────────────────────────────── */}
      <section className="bg-[oklch(0.16_0.008_240)] py-16 px-4">
        <div className="max-w-2xl mx-auto" data-ocid="founder.section">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-1 h-8 rounded-full bg-brand-teal" />
            <h2 className="text-2xl font-bold text-brand-teal">
              A Recovery Timeline
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-brand-teal/25" />
            <ol className="space-y-8">
              {timeline.map((item, index) => (
                <motion.li
                  key={item.year}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    ease: "easeOut",
                    delay: index * 0.12,
                  }}
                  className="relative flex gap-5 text-left"
                  data-ocid={`founder.item.${index + 1}`}
                >
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      item.isLast
                        ? "bg-brand-teal border-brand-teal/70"
                        : "bg-card border-brand-teal/30"
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${item.isLast ? "bg-background" : "bg-brand-teal"}`}
                    />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="bg-card border border-border text-muted-foreground text-xs font-mono px-2.5 py-1 rounded-md">
                        {item.year}
                      </span>
                      <span className="text-brand-teal font-semibold text-sm">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── WHY TECHNOLOGY IS THE ANSWER ───────────────────────── */}
      <section className="bg-background py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-3">
              Why Technology
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-teal mb-8 leading-tight">
              The Crisis Doesn't Need More Compassion.
              <br />
              It Needs Better Infrastructure.
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                label: "Vermont",
                quote:
                  "Proved that coordinated MAT routing works. Their Hub-and-Spoke model connected rural patients to urban specialists via real-time provider matching — and overdose deaths dropped 30% in participating regions.",
              },
              {
                label: "Rhode Island",
                quote:
                  "Proved that continuity of care saves lives. By starting MAT in state prisons and maintaining it post-release, they cut post-incarceration overdose mortality by 60%.",
              },
              {
                label: "Portugal",
                quote:
                  "Proved that when you treat addiction as a health issue — not a moral one — overdose deaths drop 80%. They did it without new medications. They did it with better systems.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 card-teal-accent"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-brand-teal block mb-2">
                  {item.label}
                </span>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {item.quote}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
            className="text-foreground font-semibold text-lg mt-8 leading-relaxed"
          >
            The technology to build that coordination exists. I'm building it.
          </motion.p>
        </div>
      </section>

      {/* ── THE SCALE OF THE OPPORTUNITY ───────────────────────── */}
      <section className="bg-[oklch(0.16_0.008_240)] py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-3">
              National Scale
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-teal mb-4 leading-tight">
              This Isn't About Ohio
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Ohio is the pilot. But West Virginia has the highest overdose
              death rate in the country. Kentucky. Tennessee. New Mexico. Rural
              Nevada. These are communities with willing providers, people in
              crisis, and{" "}
              <strong className="text-foreground">
                zero real-time coordination.
              </strong>
            </p>
          </motion.div>

          {/* Hot zone table */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="bg-card rounded-xl border border-border overflow-hidden mb-8"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <MapPin className="w-4 h-4 text-brand-teal shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                Top 5 Overdose Hot Zones — US
              </span>
            </div>
            <ul className="divide-y divide-border">
              {hotZones.map((zone, i) => (
                <motion.li
                  key={zone.state}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: 0.15 + i * 0.07,
                  }}
                  className="flex items-center justify-between px-5 py-3.5"
                  data-ocid={`founder.hotzone.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs font-mono w-5">
                      {i + 1}.
                    </span>
                    <span className="text-foreground font-medium text-sm">
                      {zone.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-brand-teal font-semibold text-sm">
                      {zone.stat}
                    </span>
                    <span className="text-muted-foreground text-xs hidden sm:block">
                      {zone.rank}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
            className="space-y-3"
          >
            <p className="text-muted-foreground leading-relaxed">
              Live Now Recovery is the infrastructure layer they're all missing.
            </p>
            <p className="text-foreground font-semibold leading-relaxed">
              One platform. Deployable in any county.{" "}
              <span className="text-brand-teal">In days.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CALL TO ACTION ─────────────────────────────────────── */}
      <section className="bg-background py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="w-12 h-12 rounded-full bg-brand-teal/15 flex items-center justify-center mx-auto mb-6 border border-brand-teal/30">
              <BarChart3 className="w-6 h-6 text-brand-teal" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-teal mb-4 leading-tight">
              If you're a provider, a funder, or someone who's been where I've
              been — this platform is for you.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto">
              The technology is ready. The evidence is clear. The only thing
              missing is the will to build it at scale.
            </p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                asChild
                size="lg"
                className="bg-brand-teal text-background hover:bg-brand-teal/90 font-semibold px-8 transition-colors duration-200"
                data-ocid="founder.cta.platform"
              >
                <Link to="/">
                  Explore the Platform
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-brand-teal/40 text-brand-teal hover:bg-brand-teal/10 hover:border-brand-teal/60 font-semibold px-8 transition-colors duration-200"
                data-ocid="founder.cta.data"
              >
                <Link to="/ohio-stats">See the Data</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
