import { Heart } from "lucide-react";

const timeline = [
  {
    year: "2014",
    title: "First Treatment",
    description:
      "Walked into Brightside Health in Cleveland. Didn't know if it would work. Tried anyway.",
    isLast: false,
  },
  {
    year: "2017",
    title: "3 Years Sober",
    description:
      "Started volunteering as a peer support specialist in Cuyahoga County.",
    isLast: false,
  },
  {
    year: "2019",
    title: "5 Years Clean",
    description:
      "Began mapping the gaps — which clinics were open, which weren't, and when people fell through.",
    isLast: false,
  },
  {
    year: "2024",
    title: "10 Years Clean",
    description:
      "The data was clear: the after-hours gap was killing people. Started building the solution.",
    isLast: false,
  },
  {
    year: "2025",
    title: "Live Now Launches",
    description:
      "Live Now Recovery goes live. Real-time MAT availability for Ohio Region 13. Built by a peer.",
    isLast: true,
  },
];

export function FounderPage() {
  return (
    <main className="min-h-screen" data-ocid="founder.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-live-green/20 flex items-center justify-center mx-auto mb-6 border border-live-green/30">
            <Heart className="w-7 h-7 text-live-green" fill="currentColor" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-live-green mb-3">
            The Founder
          </p>
          <h1 className="text-4xl font-bold text-white mb-3">
            Built by a peer.
          </h1>
          <p className="text-on-dark text-lg">
            10 years clean. Your data is never stored. You are not alone.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-card rounded-xl shadow-card border border-border p-8 text-left space-y-5 mb-16">
          <p className="text-muted-foreground leading-relaxed">
            I started building Live Now Recovery in early sobriety, when I kept
            hitting the same wall: nobody knew which providers were actually
            taking patients right now. Calls went to voicemail. Websites hadn't
            been updated in months. People in crisis — including people I cared
            about — gave up and went home.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The information existed. It was just locked in silos, stale, and
            inaccessible to the people who needed it most. That felt like a
            solvable problem.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Privacy was non-negotiable from the start. The stigma around
            addiction is real. The fear of surveillance is real. Anyone should
            be able to find a provider without leaving any trace. No account. No
            login. No data.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Ten years clean, I've watched this crisis take people who deserved
            better. Every minute a provider's status is unknown is a minute
            someone might walk away. This platform exists to close that gap —
            one real-time ping at a time.
          </p>
          <p className="text-foreground font-semibold">
            If you're in the middle of it right now: call 833-234-6343. Ohio MAR
            NOW. We built this because you matter.
          </p>
        </div>

        {/* Recovery Timeline */}
        <div
          className="max-w-2xl mx-auto mt-4 px-0"
          data-ocid="founder.section"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-live-green" />
            <h2 className="text-2xl font-bold text-foreground">
              A Recovery Timeline
            </h2>
          </div>

          <div className="relative">
            {/* Spine line */}
            <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-live-green/30" />

            <ol className="space-y-8">
              {timeline.map((item, index) => (
                <li
                  key={item.year}
                  className="relative flex gap-5 text-left"
                  data-ocid={`founder.item.${index + 1}`}
                >
                  {/* Dot */}
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      item.isLast
                        ? "bg-live-green border-live-green/60"
                        : "bg-card border-live-green/30"
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${item.isLast ? "bg-background" : "bg-live-green"}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="bg-card border border-border text-muted-foreground text-xs font-mono px-2.5 py-1 rounded-md">
                        {item.year}
                      </span>
                      <span className="text-live-green font-semibold text-sm">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
