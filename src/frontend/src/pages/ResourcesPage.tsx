import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ExternalLink,
  Heart,
  MapPin,
  Phone,
  Pill,
} from "lucide-react";

const HOTLINES = [
  {
    name: "SAMHSA National Helpline",
    number: "1-800-662-4357",
    description:
      "Free, confidential, 24/7 treatment referral and information in English and Spanish.",
    badge: "24/7 Free",
  },
  {
    name: "Ohio Crisis Line",
    number: "1-800-720-9616",
    description:
      "Statewide crisis support line connecting Ohioans to local mental health and addiction resources.",
    badge: "Ohio",
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    number: "988",
    description:
      "Call or text 988 for immediate mental health crisis support. Also available for substance use crises.",
    badge: "Call or Text",
  },
  {
    name: "Cuyahoga County Mobile Crisis",
    number: "216-623-6888",
    description:
      "Mobile crisis response team for Cuyahoga County residents. Dispatches trained responders directly.",
    badge: "Cuyahoga Co.",
  },
];

const TREATMENTS = [
  {
    name: "Buprenorphine (Suboxone)",
    icon: "\u{1F48A}",
    colorClass: "text-live",
    description:
      "A partial opioid agonist that reduces cravings and withdrawal symptoms. Prescribed in office-based settings — patients can take it at home. The most accessible form of MAT in Region 13.",
    notes: [
      "No daily clinic visit required",
      "Available at primary care offices",
      "Generic ~$45/mo via Cost Plus Drugs",
    ],
  },
  {
    name: "Methadone",
    icon: "\u{1F3E5}",
    colorClass: "text-primary",
    description:
      "A full opioid agonist dispensed daily at federally certified Opioid Treatment Programs (OTPs). Highly effective for long-term recovery, particularly for those with severe dependence.",
    notes: [
      "Daily clinic visit (initially)",
      "Take-homes earned over time",
      "Federally regulated — clinic-only",
    ],
  },
  {
    name: "Naltrexone (Vivitrol)",
    icon: "\u{1F6E1}\uFE0F",
    colorClass: "text-amber-recovery",
    description:
      "An opioid antagonist that blocks the effects of opioids entirely. Monthly injection or daily pill. Requires full detox before starting.",
    notes: [
      "Monthly injection available",
      "No opioids needed first",
      "Good fit post-detox or incarceration",
    ],
  },
];

const OHIO_LINKS = [
  {
    name: "Ohio MHAR — Treatment Finder",
    url: "https://mha.ohio.gov",
    desc: "Ohio Mental Health and Addiction Recovery agency. Find licensed treatment providers statewide.",
  },
  {
    name: "SAMHSA Treatment Locator",
    url: "https://findtreatment.gov",
    desc: "National treatment locator for MAT, detox, residential, and outpatient programs.",
  },
  {
    name: "Ohio Naloxone Standing Order",
    url: "https://pharmacy.ohio.gov",
    desc: "Any Ohio pharmacy can dispense naloxone without a prescription under the statewide standing order.",
  },
  {
    name: "NEXT Distro — Mail Naloxone",
    url: "https://nextdistro.org",
    desc: "Mail-based naloxone distribution for Ohio residents. Free and ships to your door.",
  },
];

export function ResourcesPage() {
  return (
    <main className="min-h-screen py-16 px-4" data-ocid="resources.page">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Ohio Recovery Resources
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Crisis support lines, naloxone access, and treatment explainers for
            people in Ohio Region 13.
          </p>
        </div>

        <div className="rounded-xl border border-amber-recovery/60 bg-amber-recovery/10 p-5 mb-12 flex gap-4 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-recovery mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground mb-1">
              In immediate crisis?
            </p>
            <p className="text-muted-foreground text-sm">
              Call{" "}
              <a
                href="tel:988"
                className="text-amber-recovery font-bold underline"
              >
                988
              </a>{" "}
              or{" "}
              <a
                href="tel:18006624357"
                className="text-amber-recovery font-bold underline"
              >
                1-800-662-4357
              </a>{" "}
              right now. No insurance or county residency required.
            </p>
          </div>
        </div>

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Crisis Hotlines
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HOTLINES.map((h) => (
              <div
                key={h.name}
                className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={`tel:${h.number.replace(/\D/g, "")}`}
                    className="text-2xl font-bold text-live hover:underline min-h-[44px] flex items-center"
                  >
                    {h.number}
                  </a>
                  <Badge className="bg-primary/10 text-primary border-0 text-xs hover:bg-primary/10 shrink-0">
                    {h.badge}
                  </Badge>
                </div>
                <p className="font-semibold text-foreground text-sm">
                  {h.name}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {h.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Naloxone (Narcan) Access in Ohio
            </h2>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <p className="text-foreground font-medium mb-3">
              No prescription required since 2022.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Ohio's statewide standing order allows any licensed pharmacy to
              dispense naloxone without a personal prescription. Many are
              covered under Medicaid at no cost.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "CVS / Walgreens / Rite Aid",
                  note: "No Rx required, most locations",
                },
                {
                  label: "Local independent pharmacies",
                  note: "Call ahead to confirm stock",
                },
                {
                  label: "Mail-order (NEXT Distro)",
                  note: "Free, ships to Ohio addresses",
                },
              ].map((item) => (
                <div key={item.label} className="bg-secondary rounded-lg p-4">
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {item.label}
                  </p>
                  <p className="text-muted-foreground text-xs">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Pill className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Treatment Types Explained
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TREATMENTS.map((t) => (
              <div
                key={t.name}
                className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3"
              >
                <div className="text-3xl">{t.icon}</div>
                <h3 className={`font-bold text-base ${t.colorClass}`}>
                  {t.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t.description}
                </p>
                <ul className="mt-auto space-y-1">
                  {t.notes.map((n) => (
                    <li
                      key={n}
                      className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Ohio State Resources
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OHIO_LINKS.map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="bg-card border border-border rounded-xl p-5 shadow-card flex gap-3 hover:border-primary/40 transition-colors min-h-[44px]"
              >
                <ExternalLink className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {l.name}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {l.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
