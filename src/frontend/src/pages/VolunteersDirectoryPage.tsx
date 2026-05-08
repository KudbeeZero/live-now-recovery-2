import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Heart,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { CredentialType } from "../backend";
import { VolunteerCard } from "../components/VolunteerCard";
import type { VolunteerProfile } from "../components/VolunteerCard";
import type { Credential } from "../types/credentials";

// ─── Mock credential builder ───────────────────────────────────────────────
function mkCred(
  id: number,
  type: CredentialType,
  tier: string,
  score: number,
  earned: string,
): Credential {
  return {
    id: BigInt(id),
    owner: { toString: () => "anon" } as never,
    credentialType: type,
    tier: tier as never,
    name: String(type),
    description: "",
    earnedAt: BigInt(new Date(earned).getTime()) * 1_000_000n,
    impactScore: BigInt(score),
    verifier: [] as never,
    badgeSvg: [] as never,
    metadata: [] as never,
  };
}

// ─── Mock Volunteers ────────────────────────────────────────────────────────
const MOCK_VOLUNTEERS: VolunteerProfile[] = [
  {
    id: 1,
    displayName: "Marcus Johnson",
    role: "Recovery Coach",
    city: "Cleveland",
    zip: "44102",
    bio: "5 years in recovery. I walk with people through the hardest miles because someone did that for me. 25 warm handoffs completed through Live Now Recovery.",
    skills: ["Peer Coaching", "MAT Navigation", "Crisis De-escalation"],
    privacyPublic: true,
    joinedAt: new Date("2023-03-12").getTime(),
    impactScore: 245,
  },
  {
    id: 2,
    displayName: "Keisha Williams",
    role: "Peer Support Specialist",
    city: "Akron",
    zip: "44301",
    bio: "Certified peer supporter, CPRS credential holder. I sit with people in the ER waiting room so no one walks out alone into the night.",
    skills: ["Peer Support", "Trauma-Informed Care", "Resource Navigation"],
    privacyPublic: true,
    joinedAt: new Date("2023-05-20").getTime(),
    impactScore: 180,
  },
  {
    id: 3,
    displayName: "DeShawn Carter",
    role: "Community Outreach",
    city: "Columbus",
    zip: "43215",
    bio: "Former first responder turned harm reduction advocate. I distribute Narcan kits every Saturday morning in Franklinton — zero overdose deaths in my block this year.",
    skills: ["Harm Reduction", "Narcan Training", "Community Organizing"],
    privacyPublic: true,
    joinedAt: new Date("2023-08-01").getTime(),
    impactScore: 195,
  },
  {
    id: 4,
    displayName: "Rosa Alvarez",
    role: "Harm Reduction Worker",
    city: "Toledo",
    zip: "43604",
    bio: "Running a syringe services program for Lucas County. Clean equipment saves lives and builds trust that medication treatment alone never could.",
    skills: ["Syringe Services", "HIV Prevention", "Spanish Language Support"],
    privacyPublic: true,
    joinedAt: new Date("2023-11-14").getTime(),
    impactScore: 155,
  },
  {
    id: 5,
    displayName: "Anonymous Volunteer",
    role: "Peer Support",
    city: "Youngstown",
    zip: "44501",
    bio: "",
    skills: [],
    privacyPublic: false,
    joinedAt: new Date("2024-01-08").getTime(),
    impactScore: 75,
  },
  {
    id: 6,
    displayName: "Tyrone Bell",
    role: "Transportation Coordinator",
    city: "Dayton",
    zip: "45402",
    bio: "I drive people to their clinic appointments. Sounds simple. It changes everything. 47 rides completed since I signed up.",
    skills: ["Transportation", "Scheduling", "Patient Advocacy"],
    privacyPublic: true,
    joinedAt: new Date("2024-02-19").getTime(),
    impactScore: 120,
  },
  {
    id: 7,
    displayName: "Sandra Mitchell",
    role: "Recovery Coach",
    city: "Cincinnati",
    zip: "45202",
    bio: "15 years in recovery. Certified CPRS. I specialize in helping mothers navigate treatment while keeping their families together.",
    skills: ["Family Support", "Trauma Recovery", "Child Welfare Navigation"],
    privacyPublic: true,
    joinedAt: new Date("2023-07-04").getTime(),
    impactScore: 310,
  },
  {
    id: 8,
    displayName: "James Okafor",
    role: "Event Coordinator",
    city: "Cleveland",
    zip: "44105",
    bio: "Organizing quarterly recovery community events across Cuyahoga County. Building the village one gathering at a time.",
    skills: ["Event Planning", "Community Building", "Social Media"],
    privacyPublic: true,
    joinedAt: new Date("2023-09-22").getTime(),
    impactScore: 210,
  },
  {
    id: 9,
    displayName: "Maria Hernandez",
    role: "Peer Support Specialist",
    city: "Akron",
    zip: "44302",
    bio: "Bilingual peer specialist serving Summit County. No one should navigate recovery alone in a language they don't speak.",
    skills: ["Spanish Language", "Cultural Navigation", "MAT Support"],
    privacyPublic: true,
    joinedAt: new Date("2024-03-01").getTime(),
    impactScore: 140,
  },
  {
    id: 10,
    displayName: "Bobby Davis",
    role: "Community Outreach",
    city: "Cleveland",
    zip: "44108",
    bio: "Street outreach in East Cleveland. If people won't walk into a clinic, I walk to them. 200+ Narcan kits distributed.",
    skills: ["Street Outreach", "Narcan Distribution", "Trust Building"],
    privacyPublic: true,
    joinedAt: new Date("2023-04-15").getTime(),
    impactScore: 275,
  },
  {
    id: 11,
    displayName: "Lisa Thompson",
    role: "Recovery Coach",
    city: "Columbus",
    zip: "43219",
    bio: "I help people write their own recovery story — not the one the system writes for them. Chapter by chapter.",
    skills: [
      "Recovery Planning",
      "Motivational Interviewing",
      "Benefits Navigation",
    ],
    privacyPublic: true,
    joinedAt: new Date("2024-01-30").getTime(),
    impactScore: 165,
  },
  {
    id: 12,
    displayName: "Anonymous Volunteer",
    role: "Community Support",
    city: "Toledo",
    zip: "43605",
    bio: "",
    skills: [],
    privacyPublic: false,
    joinedAt: new Date("2024-04-05").getTime(),
    impactScore: 55,
  },
  {
    id: 13,
    displayName: "Anthony Green",
    role: "Harm Reduction Worker",
    city: "Youngstown",
    zip: "44507",
    bio: "Mahoning County harm reduction. We're winning ground here — overdose deaths down 18% last quarter in our service area.",
    skills: ["Harm Reduction", "Data Reporting", "Community Advocacy"],
    privacyPublic: true,
    joinedAt: new Date("2023-12-10").getTime(),
    impactScore: 185,
  },
  {
    id: 14,
    displayName: "Christine Park",
    role: "Event Coordinator",
    city: "Dayton",
    zip: "45403",
    bio: "Healthcare worker turned community organizer. I host monthly Recovery Cafe events connecting 50+ people in sustained recovery.",
    skills: [
      "Event Coordination",
      "Healthcare Navigation",
      "Group Facilitation",
    ],
    privacyPublic: true,
    joinedAt: new Date("2024-02-14").getTime(),
    impactScore: 200,
  },
  {
    id: 15,
    displayName: "Calvin Hughes",
    role: "Transportation Coordinator",
    city: "Cincinnati",
    zip: "45204",
    bio: "Volunteer driver network for Hamilton County. 12 drivers on call every weekday so a missed bus never means a missed appointment.",
    skills: ["Logistics", "Driver Coordination", "Appointment Scheduling"],
    privacyPublic: true,
    joinedAt: new Date("2023-10-08").getTime(),
    impactScore: 130,
  },
];

// ─── Mock credentials per volunteer ──────────────────────────────────────────
const MOCK_CREDENTIALS: Record<number, Credential[]> = {
  1: [
    mkCred(101, CredentialType.RecoveryNavigator, "Clinical", 75, "2023-09-01"),
    mkCred(
      102,
      CredentialType.CommunitySentinel,
      "Community",
      10,
      "2023-06-15",
    ),
    mkCred(103, CredentialType.SentinelVerified, "Clinical", 30, "2024-01-20"),
  ],
  2: [
    mkCred(201, CredentialType.RecoveryAlly, "PeerSupport", 20, "2023-07-12"),
    mkCred(202, CredentialType.ThirtyDayGuide, "PeerSupport", 35, "2023-11-03"),
  ],
  3: [
    mkCred(301, CredentialType.NarcanHero, "Community", 25, "2023-09-18"),
    mkCred(
      302,
      CredentialType.CommunitySentinel,
      "Community",
      10,
      "2023-12-01",
    ),
  ],
  4: [
    mkCred(401, CredentialType.FirstResponder, "Community", 1, "2023-11-20"),
    mkCred(402, CredentialType.NarcanHero, "Community", 25, "2024-01-15"),
  ],
  5: [mkCred(501, CredentialType.FirstResponder, "Community", 1, "2024-01-10")],
  6: [
    mkCred(
      601,
      CredentialType.CommunitySentinel,
      "Community",
      10,
      "2024-05-01",
    ),
  ],
  7: [
    mkCred(701, CredentialType.RecoveryAlly, "PeerSupport", 20, "2023-08-10"),
    mkCred(702, CredentialType.ThirtyDayGuide, "PeerSupport", 35, "2023-10-22"),
    mkCred(703, CredentialType.StorySharer, "PeerSupport", 15, "2024-01-05"),
    mkCred(
      704,
      CredentialType.CommunityArchitect,
      "Leadership",
      60,
      "2024-03-18",
    ),
  ],
  8: [
    mkCred(
      801,
      CredentialType.CommunityArchitect,
      "Leadership",
      60,
      "2024-02-14",
    ),
    mkCred(
      802,
      CredentialType.CommunitySentinel,
      "Community",
      10,
      "2024-04-01",
    ),
  ],
  9: [
    mkCred(901, CredentialType.RecoveryAlly, "PeerSupport", 20, "2024-03-15"),
  ],
  10: [
    mkCred(1001, CredentialType.NarcanHero, "Community", 25, "2023-06-01"),
    mkCred(
      1002,
      CredentialType.CommunitySentinel,
      "Community",
      10,
      "2023-08-20",
    ),
    mkCred(1003, CredentialType.FirstResponder, "Community", 1, "2023-05-10"),
  ],
  11: [
    mkCred(1101, CredentialType.StorySharer, "PeerSupport", 15, "2024-02-05"),
    mkCred(1102, CredentialType.RecoveryAlly, "PeerSupport", 20, "2024-03-01"),
  ],
  12: [
    mkCred(1201, CredentialType.FirstResponder, "Community", 1, "2024-04-08"),
  ],
  13: [
    mkCred(
      1301,
      CredentialType.CommunitySentinel,
      "Community",
      10,
      "2024-01-25",
    ),
    mkCred(1302, CredentialType.NarcanHero, "Community", 25, "2024-03-10"),
    mkCred(1303, CredentialType.PolicyPioneer, "Leadership", 80, "2024-04-20"),
  ],
  14: [
    mkCred(
      1401,
      CredentialType.CommunityArchitect,
      "Leadership",
      60,
      "2024-03-20",
    ),
    mkCred(1402, CredentialType.StorySharer, "PeerSupport", 15, "2024-05-01"),
  ],
  15: [
    mkCred(
      1501,
      CredentialType.CommunitySentinel,
      "Community",
      10,
      "2023-11-01",
    ),
  ],
};

// ─── Filter constants ──────────────────────────────────────────────────────
const ROLES = [
  "All",
  "Peer Support Specialist",
  "Community Outreach",
  "Harm Reduction Worker",
  "Recovery Coach",
  "Transportation Coordinator",
  "Event Coordinator",
];

const CITIES = [
  "All",
  "Cleveland",
  "Akron",
  "Columbus",
  "Toledo",
  "Youngstown",
  "Dayton",
  "Cincinnati",
];

const TIERS = ["All", "Community", "PeerSupport", "Clinical", "Leadership"];
const TIER_LABELS: Record<string, string> = {
  All: "All Tiers",
  Community: "Community",
  PeerSupport: "Peer Support",
  Clinical: "Clinical",
  Leadership: "Leadership",
};

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="h-1 w-full bg-muted" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-card/60 rounded-xl px-4 py-3 border border-border/40">
      <span className="text-[var(--brand-teal)]">{icon}</span>
      <div>
        <p className="text-lg font-bold text-[var(--brand-teal)]">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
}

export function VolunteersDirectoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");

  useEffect(() => {
    const timer = setTimeout(() => {
      setVolunteers(MOCK_VOLUNTEERS);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      const creds = MOCK_CREDENTIALS[v.id] ?? [];
      const q = search.toLowerCase();
      if (
        q &&
        !v.displayName.toLowerCase().includes(q) &&
        !v.role.toLowerCase().includes(q) &&
        !v.city.toLowerCase().includes(q) &&
        !v.skills.some((s) => s.toLowerCase().includes(q)) &&
        !v.bio.toLowerCase().includes(q)
      )
        return false;
      if (roleFilter !== "All" && v.role !== roleFilter) return false;
      if (cityFilter !== "All" && v.city !== cityFilter) return false;
      if (tierFilter !== "All") {
        const hasTier = creds.some((c) => c.tier === tierFilter);
        if (!hasTier) return false;
      }
      return true;
    });
  }, [volunteers, search, roleFilter, cityFilter, tierFilter]);

  const totalCredentials = Object.values(MOCK_CREDENTIALS).flat().length;
  const representedCities = [...new Set(MOCK_VOLUNTEERS.map((v) => v.city))]
    .length;

  const hasFilters =
    search !== "" ||
    roleFilter !== "All" ||
    cityFilter !== "All" ||
    tierFilter !== "All";

  function clearFilters() {
    setSearch("");
    setRoleFilter("All");
    setCityFilter("All");
    setTierFilter("All");
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ohio Recovery Volunteers — Live Now Recovery",
    description:
      "Peer support specialists, recovery coaches, harm reduction workers serving Ohio.",
    numberOfItems: MOCK_VOLUNTEERS.filter((v) => v.privacyPublic).length,
    itemListElement: MOCK_VOLUNTEERS.filter((v) => v.privacyPublic).map(
      (v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: v.displayName,
          jobTitle: v.role,
          addressLocality: v.city,
          addressRegion: "OH",
        },
      }),
    ),
  };

  return (
    <>
      <Helmet>
        <title>Ohio Recovery Volunteers | Live Now Recovery</title>
        <meta
          name="description"
          content="Meet Ohio's peer support specialists, recovery coaches, and harm reduction workers on the front lines of the opioid crisis. Join the movement."
        />
        <meta
          property="og:title"
          content="Ohio Recovery Volunteers | Live Now Recovery"
        />
        <meta
          property="og:description"
          content="Real people doing real work. Browse our verified volunteer directory."
        />
        <link rel="canonical" href="https://livenowrecovery.org/volunteers" />
      </Helmet>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-background">
        {/* ── HERO */}
        <section className="relative bg-card border-b border-border/40 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[var(--brand-teal)] opacity-5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 right-0 w-80 h-80 rounded-full bg-purple-500 opacity-5 blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-[var(--brand-teal)]" />
                <span className="text-xs uppercase tracking-widest text-[var(--brand-teal)] font-semibold">
                  Live Now Recovery
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--brand-teal)] tracking-tight mb-4">
                Our Volunteer Community
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Every person on this page made a choice to show up — for a
                neighbor, a stranger, or a memory. Ohio's recovery movement is
                built by people like these.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <StatCard
                icon={<Users className="h-5 w-5" />}
                value={isLoading ? "—" : volunteers.length}
                label="Active Volunteers"
              />
              <StatCard
                icon={<Award className="h-5 w-5" />}
                value={totalCredentials}
                label="Credentials Earned"
              />
              <StatCard
                icon={<MapPin className="h-5 w-5" />}
                value={representedCities}
                label="Cities Represented"
              />
            </motion.div>
          </div>
        </section>

        {/* ── STICKY SEARCH + FILTERS */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="volunteers.search_input"
                type="search"
                placeholder="Search by name, role, city, or skill…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border/60 focus-visible:ring-[var(--brand-teal)]"
              />
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 items-center pb-1">
              {/* Role */}
              <div className="flex flex-wrap gap-1">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    data-ocid={`volunteers.role_filter.${role.toLowerCase().replace(/\s+/g, "_")}`}
                    onClick={() => setRoleFilter(role)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium border transition-colors whitespace-nowrap ${
                      roleFilter === role
                        ? "bg-[var(--brand-teal)] text-white border-[var(--brand-teal)]"
                        : "border-border/60 text-muted-foreground hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-border/50 hidden sm:block" />

              {/* City */}
              <div className="flex flex-wrap gap-1">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    data-ocid={`volunteers.city_filter.${city.toLowerCase()}`}
                    onClick={() => setCityFilter(city)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium border transition-colors whitespace-nowrap ${
                      cityFilter === city
                        ? "bg-[var(--brand-teal)] text-white border-[var(--brand-teal)]"
                        : "border-border/60 text-muted-foreground hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]"
                    }`}
                  >
                    {city === "All" ? "All Cities" : city}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-border/50 hidden sm:block" />

              {/* Tier */}
              <div className="flex flex-wrap gap-1">
                {TIERS.map((tier) => {
                  const activeTierClass: Record<string, string> = {
                    Community: "bg-emerald-600 border-emerald-600 text-white",
                    PeerSupport: "bg-blue-600 border-blue-600 text-white",
                    Clinical: "bg-amber-600 border-amber-600 text-white",
                    Leadership: "bg-purple-600 border-purple-600 text-white",
                  };
                  return (
                    <button
                      key={tier}
                      type="button"
                      data-ocid={`volunteers.tier_filter.${tier.toLowerCase()}`}
                      onClick={() => setTierFilter(tier)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium border transition-colors whitespace-nowrap ${
                        tierFilter === tier
                          ? (activeTierClass[tier] ??
                            "bg-[var(--brand-teal)] border-[var(--brand-teal)] text-white")
                          : "border-border/60 text-muted-foreground hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]"
                      }`}
                    >
                      {TIER_LABELS[tier]}
                    </button>
                  );
                })}
              </div>

              {hasFilters && (
                <button
                  type="button"
                  data-ocid="volunteers.clear_filters_button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)] transition-colors"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── DIRECTORY GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isLoading && (
            <p className="text-xs text-muted-foreground mb-5">
              Showing{" "}
              <span className="text-foreground font-semibold">
                {filtered.length}
              </span>{" "}
              of {volunteers.length} volunteers
              {hasFilters && " (filtered)"}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* JOIN CTA — always first in grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-[var(--brand-teal)]/40 bg-gradient-to-br from-[var(--brand-teal)]/10 to-card overflow-hidden flex flex-col justify-between p-6"
              data-ocid="volunteers.join_cta.card"
            >
              <div>
                <div className="h-10 w-10 rounded-full bg-[var(--brand-teal)]/20 flex items-center justify-center mb-4">
                  <Heart className="h-5 w-5 text-[var(--brand-teal)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--brand-teal)] mb-2">
                  Become a Volunteer
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Join{" "}
                  <span className="text-foreground font-semibold">
                    {MOCK_VOLUNTEERS.length}+ Ohioans
                  </span>{" "}
                  already on the front lines. Earn verified credentials, build
                  your impact score, and help save lives — one handoff at a
                  time.
                </p>
                <ul className="mt-4 space-y-1.5">
                  {[
                    "Earn blockchain-verified credentials",
                    "Connect with providers and peers",
                    "Track your real-world impact",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span className="mt-0.5 h-3 w-3 rounded-full bg-[var(--brand-teal)]/40 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                asChild
                className="mt-6 w-full bg-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/90 text-white font-semibold"
                data-ocid="volunteers.join_cta.primary_button"
              >
                <Link to="/helper">
                  Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Cards or skeletons */}
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  <CardSkeleton key={i} />
                ))
              : filtered.map((v, i) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(i * 0.05, 0.4),
                    }}
                  >
                    <VolunteerCard
                      volunteer={v}
                      credentials={MOCK_CREDENTIALS[v.id] ?? []}
                    />
                  </motion.div>
                ))}
          </div>

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="volunteers.empty_state"
              className="mt-12 text-center py-16 px-6 rounded-2xl border border-dashed border-border/50 bg-muted/20"
            >
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No volunteers match your filters
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Try adjusting your search or clearing the filters. Or be the
                first volunteer in that category.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  data-ocid="volunteers.empty_state.clear_button"
                >
                  Clear Filters
                </Button>
                <Button
                  asChild
                  className="bg-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/90 text-white"
                  data-ocid="volunteers.empty_state.join_button"
                >
                  <Link to="/helper">Become a Volunteer</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
