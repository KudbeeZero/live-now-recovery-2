import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  TrendingDown,
  Users,
} from "lucide-react";

const STATS = [
  {
    icon: AlertTriangle,
    value: "~4,000+",
    label: "Overdose Deaths per Year",
    note: "Ohio statewide, estimated — CDC/ODHE data",
    color: "text-amber-recovery",
    bg: "bg-amber-recovery/10",
  },
  {
    icon: Users,
    value: "~3,500",
    label: "Buprenorphine Prescribers in Ohio",
    note: "DEA waivered providers as of 2024",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Activity,
    value: "~100,000+",
    label: "Ohioans on MAT",
    note: "Active treatment statewide estimate",
    color: "text-live",
    bg: "bg-live/10",
  },
  {
    icon: Clock,
    value: "<10%",
    label: "MAT Clinics with After-Hours Access",
    note: "Estimated from Ohio MHAR provider data",
    color: "text-amber-recovery",
    bg: "bg-amber-recovery/10",
  },
  {
    icon: TrendingDown,
    value: "2–4 weeks",
    label: "Average Wait Time for MAT",
    note: "National estimate; Ohio varies by county",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: DollarSign,
    value: "$1.2B+",
    label: "OneOhio Opioid Settlement Funds",
    note: "Available through OneOhio Recovery Foundation",
    color: "text-live",
    bg: "bg-live/10",
  },
];

const COUNTIES = [
  "Cuyahoga",
  "Lake",
  "Geauga",
  "Ashtabula",
  "Trumbull",
  "Mahoning",
  "Columbiana",
];

export function OhioStatsPage() {
  return (
    <main className="min-h-screen" data-ocid="ohio_stats.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              The Data
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Ohio MAT Access:{" "}
            <span className="text-live-green">The Numbers</span>
          </h1>
          <p className="text-on-dark text-lg max-w-2xl">
            The statistics behind the crisis — and why real-time availability
            infrastructure matters for Ohio Region 13.
          </p>
          <p className="text-xs text-on-dark/60 mt-3">
            All figures are estimates sourced from CDC, ODHE, SAMHSA, and Ohio
            MHAR. Live Now Recovery does not collect or report patient data.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {STATS.map(({ icon: Icon, value, label, note, color, bg }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-muted-foreground text-xs">{note}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-recovery/40 bg-amber-recovery/5 p-6 mb-10">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-amber-recovery mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-foreground text-lg mb-2">
                The After-Hours Gap
              </h3>
              <p className="text-3xl font-bold text-amber-recovery mb-3">90%</p>
              <p className="text-muted-foreground leading-relaxed">
                Estimated percentage of overdoses that do not occur between 9 AM
                and 5 PM on weekdays — the only window when most MAT clinics are
                open. When a clinic closes at 2 PM on a Friday, the next
                available access point is Monday morning. That gap is where
                people die.
              </p>
              <p className="text-muted-foreground text-sm mt-3">
                Live Now Recovery's emergency mode activates automatically after
                5 PM and on weekends, surfacing crisis resources and any
                provider with after-hours emergency availability.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-live-green/30 bg-live-green/5 p-6 mb-14">
          <h3 className="font-bold text-live-green text-lg mb-3">
            Impact Projection
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Real-time availability data reduces unnecessary emergency room
            visits for patients who cannot reach a MAT provider. When a patient
            in crisis can see — in seconds — that a specific clinic is live
            right now, the probability of follow-through increases
            significantly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                value: "73%",
                label:
                  "of patients who access same-day MAT continue treatment at 30 days (SAMHSA)",
                color: "text-live",
              },
              {
                value: "25%",
                label:
                  "no-show reduction with gated ride confirmation before departure",
                color: "text-primary",
              },
              {
                value: "$1,675",
                label:
                  "annual savings per patient via Cost Plus Drugs vs. retail buprenorphine",
                color: "text-amber-recovery",
              },
            ].map((item) => (
              <div key={item.label} className="bg-secondary rounded-lg p-4">
                <p className={`text-2xl font-bold ${item.color} mb-1`}>
                  {item.value}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Ohio Region 13 Coverage Area
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-5">
            Live Now Recovery currently serves providers and patients across
            these seven counties in Northeast Ohio.
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNTIES.map((county) => (
              <span
                key={county}
                className="px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm font-medium"
              >
                {county} County
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
