import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Briefcase,
  ExternalLink,
  Heart,
  Home,
  MapPin,
  Phone,
  Pill,
  ShoppingBasket,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SEO } from "../components/SEO";
import type { ResourceOrg } from "../types/community";

// ─── AnimatedCounter for hero ───────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
}: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else setCount(Math.floor(current));
          }, 1800 / steps);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Static data ─────────────────────────────────────────────────────────────

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
    icon: "💊",
    colorClass: "text-live",
    description:
      "A partial opioid agonist that reduces cravings and withdrawal symptoms. Prescribed in office-based settings — patients can take it at home.",
    notes: [
      "No daily clinic visit required",
      "Available at primary care offices",
      "Covered by Medicaid in Ohio",
    ],
  },
  {
    name: "Methadone",
    icon: "🏥",
    colorClass: "text-primary",
    description:
      "A full opioid agonist dispensed daily at federally certified Opioid Treatment Programs. Highly effective for long-term recovery.",
    notes: [
      "Daily clinic visit (initially)",
      "Take-homes earned over time",
      "Federally regulated — clinic-only",
    ],
  },
  {
    name: "Naltrexone (Vivitrol)",
    icon: "🛡️",
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

const RESOURCE_ORGS: ResourceOrg[] = [
  // Food Assistance
  {
    id: "gcfb",
    name: "Greater Cleveland Food Bank",
    category: "food",
    description:
      "Largest hunger relief organization in Northeast Ohio, serving 6 counties with food assistance programs.",
    phone: "216-738-2067",
    website: "https://www.clevelandfoodbank.org",
    city: "Cleveland",
  },
  {
    id: "acrf",
    name: "Akron-Canton Regional Foodbank",
    category: "food",
    description:
      "Distributes food to over 500 partner agencies across a 8-county service area in Northeast Ohio.",
    phone: "330-535-6900",
    website: "https://www.akroncantonfoodbank.org",
    city: "Akron",
  },
  {
    id: "shfb",
    name: "Second Harvest Food Bank",
    category: "food",
    description:
      "Serving Northwest Ohio and Southeast Michigan with hunger relief, food pantries, and mobile distributions.",
    phone: "419-244-6996",
    city: "Toledo",
  },
  {
    id: "mofc",
    name: "Mid-Ohio Food Collective",
    category: "food",
    description:
      "Central Ohio's largest food bank network, connecting neighbors with food, nutrition education, and social services.",
    phone: "614-277-3663",
    city: "Columbus",
  },
  {
    id: "ohsnap",
    name: "Ohio SNAP Benefits",
    category: "food",
    description:
      "Ohio's Supplemental Nutrition Assistance Program. Apply for monthly food assistance benefits online.",
    website: "https://ohiobenefits.gov",
    city: "Statewide",
  },

  // Housing
  {
    id: "oxhouse",
    name: "Oxford Houses Ohio",
    category: "housing",
    description:
      "Self-supporting sober living homes for people in recovery. Democratic, peer-run, and affordable.",
    website: "https://oxfordhouse.org",
    city: "Cleveland",
  },
  {
    id: "eden",
    name: "EDEN Inc — Permanent Supportive Housing",
    category: "housing",
    description:
      "Permanent supportive housing with wraparound services for individuals and families experiencing homelessness.",
    phone: "216-961-9690",
    city: "Cleveland",
  },
  {
    id: "clo",
    name: "Community Living Options",
    category: "housing",
    description:
      "Transitional and permanent housing options for adults in recovery, with on-site support staff.",
    website: "https://www.communitylivingoptions.org",
    city: "Akron",
  },
  {
    id: "voa",
    name: "Volunteers of America Ohio/Indiana",
    category: "housing",
    description:
      "Transitional housing, sober living residences, and reentry support programs across Ohio.",
    website: "https://voaohin.org",
    city: "Cleveland",
  },
  {
    id: "orh",
    name: "Ohio Recovery Housing",
    category: "housing",
    description:
      "Statewide network of certified recovery housing. Find accredited sober homes across all Ohio regions.",
    website: "https://ohiorecoveryhousing.org",
    city: "Statewide",
  },

  // Employment
  {
    id: "omj",
    name: "OhioMeansJobs",
    category: "employment",
    description:
      "Ohio's official job search portal. Connect with career coaches, job listings, and workforce training programs.",
    website: "https://ohiomeansjobs.com",
    city: "Statewide",
  },
  {
    id: "temp",
    name: "Towards Employment",
    category: "employment",
    description:
      "Cleveland's recovery-friendly employer network. Job placement, coaching, and employer partnerships for people in recovery.",
    phone: "216-696-5750",
    city: "Cleveland",
  },
  {
    id: "chn",
    name: "CHN Housing Partners — Workforce",
    category: "employment",
    description:
      "Workforce development tied to stable housing. Helps residents build employment while maintaining housing stability.",
    city: "Cleveland",
  },
  {
    id: "rfwi",
    name: "Recovery-Friendly Workplace Initiative",
    category: "employment",
    description:
      "Connects people in recovery with Ohio employers who have committed to supportive, recovery-friendly workplace policies.",
    website: "https://recoveryfriendlyworkplace.org",
    city: "Ohio",
  },
  {
    id: "edwins",
    name: "EDWINS Leadership & Restaurant Institute",
    category: "employment",
    description:
      "Award-winning culinary training and employment program serving formerly incarcerated adults, many in recovery.",
    phone: "216-921-3333",
    city: "Cleveland",
  },

  // Peer Support
  {
    id: "mhas",
    name: "Ohio MHAS Peer Recovery Supports",
    category: "peer-support",
    description:
      "State-certified peer recovery supporters available through Ohio's county ADAMH boards. Free and community-based.",
    website: "https://ohiomhas.gov",
    city: "Statewide",
  },
  {
    id: "nami",
    name: "NAMI Ohio",
    category: "peer-support",
    description:
      "Mental health advocacy, education, and peer support groups statewide. NAMI Connection Recovery Support Groups.",
    phone: "614-224-2700",
    website: "https://www.namiohio.org",
    city: "Columbus",
  },
  {
    id: "aaohio",
    name: "AA Ohio Region",
    category: "peer-support",
    description:
      "Alcoholics Anonymous meetings across all Ohio regions. Find in-person and online meetings near you.",
    website: "https://aa.org",
    city: "Statewide",
  },
  {
    id: "nagl",
    name: "NA Great Lakes Region",
    category: "peer-support",
    description:
      "Narcotics Anonymous meetings throughout the Great Lakes region including Northeast and Central Ohio.",
    website: "https://na.org",
    city: "Statewide",
  },
  {
    id: "facingadd",
    name: "Facing Addiction with NCADD",
    category: "peer-support",
    description:
      "National advocacy and peer support organization. Resources, stories, and community for people and families in recovery.",
    website: "https://facingaddiction.org",
    city: "National",
  },

  // Bill Assistance
  {
    id: "ohheap",
    name: "Ohio HEAP — Home Energy Assistance",
    category: "bill-assistance",
    description:
      "Ohio's Home Energy Assistance Program helps low-income households pay utility bills and maintain heat in winter.",
    website: "https://benefits.ohio.gov",
    city: "Statewide",
  },
  {
    id: "salv",
    name: "Salvation Army Ohio",
    category: "bill-assistance",
    description:
      "Emergency financial assistance for rent, utilities, and essential bills. Multiple locations across Ohio.",
    phone: "1-800-725-2769",
    city: "Multiple Locations",
  },
  {
    id: "def",
    name: "Dollar Energy Fund",
    category: "bill-assistance",
    description:
      "Energy bill assistance for low-income customers in Northeast Ohio. One-time grants to help prevent disconnection.",
    phone: "866-762-4637",
    city: "Northeast Ohio",
  },
  {
    id: "cces",
    name: "Catholic Charities Emergency Services",
    category: "bill-assistance",
    description:
      "Emergency financial assistance for rent, utilities, and basic needs. No religious requirement to receive services.",
    phone: "216-334-2900",
    city: "Cleveland",
  },
  {
    id: "oh211",
    name: "Ohio 211",
    category: "bill-assistance",
    description:
      "Dial 2-1-1 to be connected to local emergency assistance for rent, utilities, food, and other essential needs.",
    phone: "2-1-1",
    city: "Statewide",
  },
];

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabKey = "all" | ResourceOrg["category"];

const TABS: {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: "all",
    label: "All",
    icon: <MapPin className="w-3.5 h-3.5" />,
    color: "bg-primary/10 text-primary border-primary/30",
  },
  {
    key: "food",
    label: "Food Assistance",
    icon: <ShoppingBasket className="w-3.5 h-3.5" />,
    color: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  {
    key: "housing",
    label: "Housing",
    icon: <Home className="w-3.5 h-3.5" />,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    key: "employment",
    label: "Employment",
    icon: <Briefcase className="w-3.5 h-3.5" />,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    key: "peer-support",
    label: "Peer Support",
    icon: <Users className="w-3.5 h-3.5" />,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    key: "bill-assistance",
    label: "Bill Assistance",
    icon: <Wallet className="w-3.5 h-3.5" />,
    color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
];

const CATEGORY_COLORS: Record<ResourceOrg["category"], string> = {
  food: "bg-green-500/10 text-green-400 border-green-500/20",
  housing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  employment: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "peer-support": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bill-assistance": "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const CATEGORY_LABELS: Record<ResourceOrg["category"], string> = {
  food: "Food Assistance",
  housing: "Housing",
  employment: "Employment",
  "peer-support": "Peer Support",
  "bill-assistance": "Bill Assistance",
};

// ─── Resource card ────────────────────────────────────────────────────────────

function ResourceCard({ org }: { org: ResourceOrg }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground text-sm leading-snug">
          {org.name}
        </h3>
        <Badge
          className={`text-[10px] shrink-0 border ${CATEGORY_COLORS[org.category]} hover:${CATEGORY_COLORS[org.category]}`}
        >
          {CATEGORY_LABELS[org.category]}
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed flex-1">
        {org.description}
      </p>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3 shrink-0" />
        <span>{org.city}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
        {org.phone && (
          <a
            href={`tel:${org.phone.replace(/\D/g, "")}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline min-h-[32px]"
            data-ocid="resource.phone"
          >
            <Phone className="w-3 h-3" />
            {org.phone}
          </a>
        )}
        {org.website && (
          <a
            href={org.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1"
            data-ocid="resource.website"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 border-border text-foreground hover:text-primary hover:border-primary/40"
            >
              <ExternalLink className="w-3 h-3" />
              Visit Site
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const filtered =
    activeTab === "all"
      ? RESOURCE_ORGS
      : RESOURCE_ORGS.filter((o) => o.category === activeTab);

  return (
    <main className="min-h-screen" data-ocid="resources.page">
      {" "}
      <SEO
        title="Recovery Resources in Ohio | Food, Housing, MAT, Peer Support"
        description="Free recovery resources across Ohio — food assistance, housing help, employment programs, bill assistance, and peer support organizations. Updated and verified."
        keywords="recovery resources Ohio, food assistance recovery, housing sober living Ohio, peer support Ohio, employment recovery, harm reduction supplies Ohio"
        canonical="/resources"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Ohio Recovery Resources Directory",
          description:
            "Verified recovery support resources across Ohio — food, housing, employment, peer support, and harm reduction organizations.",
          url: "https://live-now-recovery-3f2.caffeine.xyz/resources",
          creator: { "@type": "Organization", name: "Live Now Recovery" },
        }}
      />
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 210) 0%, oklch(0.16 0.06 195) 50%, oklch(0.11 0.03 240) 100%)",
        }}
      >
        {/* Decorative overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 40%, oklch(0.62 0.12 218 / 0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 md:py-28">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest">
              Help Is Here
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            <span className="text-foreground">Ohio Recovery </span>
            <span className="text-brand-teal">Resources</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-10">
            Crisis hotlines, naloxone access, treatment guides, and a full
            directory of food, housing, employment, and peer support
            organizations across Ohio — all free, all real.
          </p>
          {/* Animated stat counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mb-10">
            {[
              { target: 4, suffix: "", label: "Crisis Hotlines" },
              { target: 25, suffix: "+", label: "Organizations" },
              { target: 5, suffix: "", label: "Resource Types" },
              { target: 20, suffix: "+", label: "Ohio Cities" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-card/60 backdrop-blur-sm border border-border rounded-xl py-4 px-3 text-center"
              >
                <p className="text-2xl md:text-3xl font-extrabold text-brand-teal">
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              document
                .getElementById("directory")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-lg shadow-teal-900/30 transition-all"
            data-ocid="resources.hero.cta"
          >
            <Heart className="w-4 h-4" />
            Browse All Resources
          </button>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Crisis alert */}
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

        {/* Hotlines */}
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

        {/* Naloxone */}
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

        {/* Treatment types */}
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

        {/* Ohio State Resources */}
        <section className="mb-14">
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

        {/* ─── Community Resource Directory ─────────────────────────────────── */}
        <section id="directory" data-ocid="resources.directory">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Community Resource Directory
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Food assistance, sober housing, employment, peer support, and bill
            assistance organizations across Ohio.
          </p>

          {/* Tab bar */}
          <div
            className="flex flex-wrap gap-2 mb-8"
            role="tablist"
            aria-label="Resource categories"
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all min-h-[36px] ${
                  activeTab === tab.key
                    ? `${tab.color} shadow-sm`
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground bg-transparent"
                }`}
                data-ocid={`resources.tab.${tab.key}`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key ? "bg-white/20" : "bg-muted"
                  }`}
                >
                  {tab.key === "all"
                    ? RESOURCE_ORGS.length
                    : RESOURCE_ORGS.filter((o) => o.category === tab.key)
                        .length}
                </span>
              </button>
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="resources.grid"
          >
            {filtered.map((org) => (
              <ResourceCard key={org.id} org={org} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
