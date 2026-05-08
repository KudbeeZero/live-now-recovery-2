import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Award, BarChart3, Heart, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { ImpactDashboard } from "../components/ImpactDashboard";
import { SEO } from "../components/SEO";
import { useGlobalImpactStats } from "../hooks/useCredentials";

const MILESTONE_TIMELINE = [
  {
    milestone: "Platform Launch",
    description:
      "Live Now Recovery went live in Ohio Region 13 — the first real-time, privacy-first MAT provider platform on the Internet Computer.",
    status: "complete" as const,
    icon: <Zap className="w-5 h-5" />,
    color: "oklch(0.72 0.20 142)",
  },
  {
    milestone: "501(c)(3) Registration",
    description:
      "Officially registering as a nonprofit to unlock grant eligibility, including the Michigan Opioid Settlement Fund ($145K target).",
    status: "active" as const,
    icon: <Heart className="w-5 h-5" />,
    color: "oklch(0.68 0.1 218)",
  },
  {
    milestone: "100 Recovery Navigators",
    description:
      "When 100 platform users earn the Recovery Navigator credential (25 verified handoffs each), physical engraved recognition tokens are mailed.",
    status: "pending" as const,
    icon: <Users className="w-5 h-5" />,
    color: "oklch(0.75 0.14 55)",
  },
  {
    milestone: "Ohio Statewide Expansion",
    description:
      "All 88 Ohio counties covered with seeded provider data and active harm reduction supply inventory tracking.",
    status: "pending" as const,
    icon: <BarChart3 className="w-5 h-5" />,
    color: "oklch(0.68 0.1 218)",
  },
  {
    milestone: "National Hot Zone Deployment",
    description:
      "Deploy to the top 10 overdose-burden states — West Virginia, Kentucky, Tennessee, New Mexico, and beyond.",
    status: "pending" as const,
    icon: <TrendingUp className="w-5 h-5" />,
    color: "oklch(0.72 0.20 142)",
  },
];

const STATUS_STYLE = {
  complete: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    label: "Complete",
  },
  active: {
    bg: "bg-primary/15",
    border: "border-primary/40",
    text: "text-brand-teal",
    label: "In Progress",
  },
  pending: {
    bg: "bg-muted/30",
    border: "border-border",
    text: "text-muted-foreground",
    label: "Coming Soon",
  },
};

export function ImpactPage() {
  const { data: stats } = useGlobalImpactStats();

  const totalBadges = Number(stats?.totalBadgesMinted ?? 0);
  const contributors = Number(stats?.activeContributors ?? 0);

  return (
    <main className="min-h-screen bg-background" data-ocid="impact.page">
      <SEO
        title="Platform Impact | Live Now Recovery"
        description="Real-time impact metrics from the Live Now Recovery platform — badges minted on ICP, handoffs completed, and the nonprofit milestone timeline."
        keywords="recovery platform impact, MAT handoff statistics, opioid crisis Ohio blockchain credentials"
        canonical="/impact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Live Now Recovery Impact Dashboard",
          description:
            "Transparent, on-chain impact metrics for the Live Now Recovery platform",
        }}
      />

      {/* Hero */}
      <section
        className="w-full px-4 pt-14 pb-10 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.038 225), oklch(0.28 0.038 225), oklch(0.36 0.065 196))",
        }}
        data-ocid="impact.section"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-teal-light mb-4">
            <Award className="h-3 w-3" />
            Permanent On-Chain Record
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-3">
            The Movement's <span className="text-brand-teal">Impact</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            Every number here is real, verifiable, and stored permanently on the
            Internet Computer — no database to fake, no servers to game.
          </p>
          {(totalBadges > 0 || contributors > 0) && (
            <div className="flex justify-center gap-8 mt-7">
              <div className="text-center">
                <p className="text-3xl font-black text-brand-teal">
                  {totalBadges.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Badges minted
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-brand-teal">
                  {contributors.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contributors
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Animated stat cards */}
      <ImpactDashboard />

      {/* Nonprofit milestone timeline */}
      <section className="w-full px-4 py-16" data-ocid="impact.section">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-3">
              Roadmap
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              Milestones Unlocked by the Community
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
              Every credential earned, every donation made, and every handoff
              completed moves us closer to the next milestone. Help us reach
              501(c)(3).
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-5 top-0 bottom-0 w-px"
              style={{ background: "oklch(0.28 0.04 225)" }}
            />

            <div className="space-y-6">
              {MILESTONE_TIMELINE.map((item, idx) => {
                const s = STATUS_STYLE[item.status];
                return (
                  <motion.div
                    key={item.milestone}
                    className="flex gap-5 pl-14 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                      delay: idx * 0.1,
                    }}
                    data-ocid={`impact.timeline.${idx + 1}`}
                  >
                    {/* Node */}
                    <div
                      className={`absolute left-0 top-1 h-10 w-10 rounded-xl flex items-center justify-center border ${s.bg} ${s.border}`}
                      style={{ color: item.color }}
                    >
                      {item.icon}
                    </div>

                    <div
                      className={`flex-1 rounded-2xl p-5 border ${s.bg} ${s.border}`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <p className="font-bold text-foreground">
                          {item.milestone}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${s.bg} ${s.text} border ${s.border}`}
                        >
                          {s.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="text-base font-semibold text-foreground mb-4">
              Every action on this platform accelerates the timeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="min-h-[48px] px-8 bg-primary text-white font-bold hover:bg-primary/90"
                data-ocid="impact.donate_button"
              >
                <Link to="/donate">
                  <Heart className="w-4 h-4 mr-2" />
                  Support the Mission
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-[48px] px-7 border-primary/40 text-brand-teal hover:bg-primary/10 font-semibold"
                data-ocid="impact.leaderboard_button"
              >
                <Link to="/leaderboard">
                  <Award className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
