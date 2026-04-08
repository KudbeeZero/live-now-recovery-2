import { Heart, Lock, Shield, Zap } from "lucide-react";

const pillars = [
  {
    icon: Zap,
    title: "Real-Time Availability",
    desc: "Provider status updates in real time. 4-hour decay law enforces accuracy — stale data is marked as unknown, never as active.",
  },
  {
    icon: Lock,
    title: "Absolute Privacy",
    desc: "Zero PHI. No patient names, diagnoses, or prescriptions ever stored or transmitted. Patients never authenticate. Anonymous ZIP-level presence counts only.",
  },
  {
    icon: Shield,
    title: "Cost Transparency",
    desc: "Every provider view shows the Cost Plus Drugs price bridge — $185 retail to $45.37 with Mark Cuban's pharmacy. $139.63 saved every month.",
  },
  {
    icon: Heart,
    title: "Built on ICP",
    desc: "Deployed on the Internet Computer Protocol. Your data never touches a centralized server. Decentralized, tamper-resistant, always-on.",
  },
];

export function MissionPage() {
  return (
    <main className="min-h-screen" data-ocid="mission.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-live-green mb-3">
            Our Purpose
          </p>
          <h1 className="text-4xl font-bold text-white mb-4">
            Our <span className="text-live-green">Mission</span>
          </h1>
          <div className="h-0.5 w-16 bg-live-green rounded-full mx-auto" />
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-card border border-border p-8 mb-10">
          <p className="text-xl text-navy font-medium leading-relaxed mb-6">
            Live Now Recovery exists because people in crisis deserve real
            information in real time.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We built this because every minute matters when someone is seeking
            medication-assisted treatment. Delays cost lives. Stale data costs
            lives. Privacy violations cost trust — and when people stop trusting
            systems, they stop seeking help.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our mission is simple: show who is available right now, protect
            patient privacy absolutely, and bridge the cost gap that keeps
            people from care. Generic Suboxone should not cost $185 a month when
            it's available for $45.37. That $139 difference is a barrier to
            recovery.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Built on the Internet Computer Protocol — your data never touches a
            centralized server. No cloud. No corporation. No surveillance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl shadow-card border border-border p-5"
              data-ocid="mission.card"
            >
              <div className="w-10 h-10 rounded-xl bg-live-green/10 flex items-center justify-center mb-3">
                <p.icon className="w-5 h-5 text-live-green" />
              </div>
              <h3 className="font-bold text-navy mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
