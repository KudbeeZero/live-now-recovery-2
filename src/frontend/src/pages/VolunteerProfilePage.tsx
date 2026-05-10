import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  Calendar,
  ExternalLink,
  Globe,
  Heart,
  Lock,
  MapPin,
  Share2,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { AchievementTimeline } from "../components/AchievementTimeline";
import { BadgeGrid } from "../components/BadgeGrid";
import { CredentialAwardModal } from "../components/CredentialAwardModal";
import { useCredentialAward } from "../hooks/useCredentialAward";
import type { Credential } from "../types/credentials";

// ─── Mock volunteer data (1–15) ──────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  Community: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  "Peer Support": "bg-blue-500/20 text-blue-300 border border-blue-500/40",
  Clinical: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  Leadership: "bg-purple-500/20 text-purple-300 border border-purple-500/40",
};

const COVER_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.24 0.08 218) 0%, oklch(0.18 0.12 195) 60%, oklch(0.14 0.06 240) 100%)",
  "linear-gradient(135deg, oklch(0.20 0.10 155) 0%, oklch(0.17 0.08 185) 60%, oklch(0.14 0.06 240) 100%)",
  "linear-gradient(135deg, oklch(0.22 0.07 270) 0%, oklch(0.18 0.10 218) 60%, oklch(0.14 0.05 200) 100%)",
  "linear-gradient(135deg, oklch(0.18 0.09 200) 0%, oklch(0.22 0.07 155) 60%, oklch(0.16 0.05 220) 100%)",
  "linear-gradient(135deg, oklch(0.16 0.10 210) 0%, oklch(0.21 0.09 175) 60%, oklch(0.18 0.06 240) 100%)",
];

function makeCred(
  id: number,
  credentialType: string,
  tier: string,
  name: string,
  description: string,
  impactScore: number,
  daysAgo: number,
): Credential {
  const msAgo = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  return {
    id: BigInt(id),
    owner: { toString: () => "2vxsx-fae" } as unknown as Credential["owner"],
    credentialType: credentialType as Credential["credentialType"],
    tier: tier as Credential["tier"],
    name,
    description,
    earnedAt: BigInt(msAgo * 1_000_000),
    metadata: undefined,
    verifier: undefined,
    badgeSvg: undefined,
    cardMetadata: undefined,
    impactScore: BigInt(impactScore),
  };
}

interface VolunteerMock {
  id: number;
  displayName: string;
  role: string;
  city: string;
  zip: string;
  bio: string;
  skills: string[];
  tier: string;
  coverGradient: string;
  privacyPublic: boolean;
  joinedAt: string;
  impactScore: number;
  reportsSubmitted: number;
  handoffsAssisted: number;
  credentials: Credential[];
}

const MOCK_VOLUNTEERS: Record<number, VolunteerMock> = {
  1: {
    id: 1,
    displayName: "Maria Santos",
    role: "Peer Support Specialist",
    city: "Cleveland",
    zip: "44102",
    tier: "Peer Support",
    bio: "8-year recovery journey. I know firsthand what it takes to find help at 2am in a city that feels like it's sleeping. Now I spend my weekends at naloxone distribution events and connecting people with MAT providers before they give up looking.",
    skills: [
      "Naloxone Training",
      "Peer Mentorship",
      "Crisis De-escalation",
      "Spanish Interpreter",
      "Transportation Coordination",
    ],
    coverGradient: COVER_GRADIENTS[0],
    privacyPublic: true,
    joinedAt: "March 2023",
    impactScore: 310,
    reportsSubmitted: 24,
    handoffsAssisted: 18,
    credentials: [
      makeCred(
        101,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training, verified by the Live Now Recovery team.",
        20,
        320,
      ),
      makeCred(
        102,
        "ThirtyDayGuide",
        "PeerSupport",
        "30-Day Guide",
        "Supported a peer through their first 30 days of recovery.",
        35,
        180,
      ),
      makeCred(
        103,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        95,
      ),
      makeCred(
        104,
        "StorySharer",
        "PeerSupport",
        "Story Sharer",
        "Published an approved recovery testimonial.",
        15,
        45,
      ),
    ],
  },
  2: {
    id: 2,
    displayName: "James Okafor",
    role: "Community Health Navigator",
    city: "Akron",
    zip: "44302",
    tier: "Community",
    bio: "Former ER intake coordinator turned community advocate. I've seen what the 72-hour gap does to families. The warm handoff protocol we run through Live Now Recovery has changed the equation — people arrive at the clinic because someone stayed with them until they got there.",
    skills: [
      "Warm Handoffs",
      "ER Liaison",
      "Case Navigation",
      "Resource Directory",
      "MAT Intake",
    ],
    coverGradient: COVER_GRADIENTS[1],
    privacyPublic: true,
    joinedAt: "January 2023",
    impactScore: 465,
    reportsSubmitted: 31,
    handoffsAssisted: 34,
    credentials: [
      makeCred(
        201,
        "FirstResponder",
        "Community",
        "First Responder",
        "Submitted the first citizen report — eyes on the ground when it matters most.",
        1,
        410,
      ),
      makeCred(
        202,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        310,
      ),
      makeCred(
        203,
        "NarcanHero",
        "Community",
        "Narcan Hero",
        "Reported a successful Narcan deployment in the community.",
        25,
        220,
      ),
      makeCred(
        204,
        "RecoveryNavigator",
        "Clinical",
        "Recovery Navigator",
        "Completed 25 warm handoffs through the platform.",
        75,
        90,
      ),
      makeCred(
        205,
        "CommunityArchitect",
        "Leadership",
        "Community Architect",
        "Organized a local outreach event logged on the platform.",
        60,
        40,
      ),
    ],
  },
  3: {
    id: 3,
    displayName: "Priya Anand",
    role: "MAT Outreach Coordinator",
    city: "Columbus",
    zip: "43201",
    tier: "Clinical",
    bio: "Public health graduate student at OSU. My research focuses on access barriers to MAT in underserved zip codes. What I've learned building this volunteer network has been worth more than any classroom hour.",
    skills: [
      "Data Analysis",
      "Outreach Planning",
      "Grant Writing",
      "Provider Liaison",
      "Community Mapping",
    ],
    coverGradient: COVER_GRADIENTS[2],
    privacyPublic: true,
    joinedAt: "June 2023",
    impactScore: 225,
    reportsSubmitted: 12,
    handoffsAssisted: 9,
    credentials: [
      makeCred(
        301,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        280,
      ),
      makeCred(
        302,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training.",
        20,
        190,
      ),
      makeCred(
        303,
        "PolicyPioneer",
        "Leadership",
        "Policy Pioneer",
        "Contributed data used in a public health report.",
        80,
        60,
      ),
    ],
  },
  4: {
    id: 4,
    displayName: "Kevin Malone",
    role: "Naloxone Distribution Lead",
    city: "Youngstown",
    zip: "44501",
    tier: "Community",
    bio: "Lost my brother in 2019. The county health department didn't have Narcan kits at the site where he overdosed. I carry 6 kits at all times and I've trained 47 people to use them. This platform is how I find the next 47.",
    skills: [
      "Narcan Administration",
      "Overdose Response Training",
      "Supply Chain",
      "Community Outreach",
      "Peer Training",
    ],
    coverGradient: COVER_GRADIENTS[3],
    privacyPublic: true,
    joinedAt: "September 2022",
    impactScore: 385,
    reportsSubmitted: 28,
    handoffsAssisted: 11,
    credentials: [
      makeCred(
        401,
        "FirstResponder",
        "Community",
        "First Responder",
        "Submitted the first citizen report.",
        1,
        520,
      ),
      makeCred(
        402,
        "NarcanHero",
        "Community",
        "Narcan Hero",
        "Reported a successful Narcan deployment.",
        25,
        380,
      ),
      makeCred(
        403,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        250,
      ),
      makeCred(
        404,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training.",
        20,
        140,
      ),
    ],
  },
  5: {
    id: 5,
    displayName: "Dr. Alicia Reyes",
    role: "Clinical Volunteer — MAT",
    city: "Toledo",
    zip: "43604",
    tier: "Clinical",
    bio: "Board-certified addiction medicine physician. I volunteer two evenings a week to help patients navigate the system — telehealth prescriptions, insurance appeals, and bridge prescriptions for people who can't wait 3 weeks for an appointment.",
    skills: [
      "MAT Prescribing",
      "Buprenorphine",
      "Bridge Prescriptions",
      "Telehealth",
      "Insurance Navigation",
    ],
    coverGradient: COVER_GRADIENTS[4],
    privacyPublic: true,
    joinedAt: "November 2022",
    impactScore: 620,
    reportsSubmitted: 8,
    handoffsAssisted: 47,
    credentials: [
      makeCred(
        501,
        "SentinelVerified",
        "Clinical",
        "Sentinel Verified",
        "Passed the Live Now Recovery provider verification process.",
        30,
        440,
      ),
      makeCred(
        502,
        "BridgeProvider",
        "Clinical",
        "Bridge Provider",
        "Issued 5+ 72-hour bridge prescriptions.",
        40,
        330,
      ),
      makeCred(
        503,
        "MATChampion",
        "Clinical",
        "MAT Champion",
        "Actively prescribing MAT to 10+ patients.",
        50,
        210,
      ),
      makeCred(
        504,
        "RecoveryNavigator",
        "Clinical",
        "Recovery Navigator",
        "Completed 25 warm handoffs through the platform.",
        75,
        80,
      ),
      makeCred(
        505,
        "PolicyPioneer",
        "Leadership",
        "Policy Pioneer",
        "Contributed data used in a public health report.",
        80,
        30,
      ),
    ],
  },
  6: {
    id: 6,
    displayName: "Darnell Brooks",
    role: "Transportation Volunteer",
    city: "Dayton",
    zip: "45402",
    tier: "Community",
    bio: "I drive 12-15 people a month to MAT appointments. Sounds simple. But when you don't have a car and the clinic is 14 miles away, that ride is the difference between starting treatment and not.",
    skills: [
      "Transportation",
      "Appointment Scheduling",
      "Crisis Support",
      "Resource Navigation",
      "First Aid",
    ],
    coverGradient: COVER_GRADIENTS[0],
    privacyPublic: true,
    joinedAt: "April 2023",
    impactScore: 180,
    reportsSubmitted: 7,
    handoffsAssisted: 22,
    credentials: [
      makeCred(
        601,
        "FirstResponder",
        "Community",
        "First Responder",
        "Submitted the first citizen report.",
        1,
        290,
      ),
      makeCred(
        602,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        130,
      ),
    ],
  },
  7: {
    id: 7,
    displayName: "Tamara Willis",
    role: "Recovery Coach",
    city: "Cincinnati",
    zip: "45202",
    tier: "Peer Support",
    bio: "4 years clean. Working toward CPRS certification. I work one-on-one with people in early recovery — the daily check-ins, the ride to court, the call at midnight when they're about to slip. I believe in accountability through love.",
    skills: [
      "Recovery Coaching",
      "Accountability Partners",
      "CPRS Track",
      "Family Support",
      "Harm Reduction",
    ],
    coverGradient: COVER_GRADIENTS[1],
    privacyPublic: true,
    joinedAt: "February 2024",
    impactScore: 155,
    reportsSubmitted: 5,
    handoffsAssisted: 14,
    credentials: [
      makeCred(
        701,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training.",
        20,
        190,
      ),
      makeCred(
        702,
        "ThirtyDayGuide",
        "PeerSupport",
        "30-Day Guide",
        "Supported a peer through their first 30 days.",
        35,
        75,
      ),
    ],
  },
  8: {
    id: 8,
    displayName: "Ricky Delgado",
    role: "Outreach Street Team",
    city: "Lorain",
    zip: "44052",
    tier: "Community",
    bio: "6 nights a week in the streets of Lorain doing street outreach. Syringes, test strips, Narcan — but mostly just showing up. People in active use need to know someone gives a damn before they'll even consider treatment.",
    skills: [
      "Street Outreach",
      "Harm Reduction Supply",
      "Fentanyl Test Strips",
      "Syringe Exchange",
      "Motivational Interviewing",
    ],
    coverGradient: COVER_GRADIENTS[2],
    privacyPublic: true,
    joinedAt: "July 2022",
    impactScore: 255,
    reportsSubmitted: 41,
    handoffsAssisted: 6,
    credentials: [
      makeCred(
        801,
        "FirstResponder",
        "Community",
        "First Responder",
        "Submitted the first citizen report.",
        1,
        600,
      ),
      makeCred(
        802,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        450,
      ),
      makeCred(
        803,
        "NarcanHero",
        "Community",
        "Narcan Hero",
        "Reported a successful Narcan deployment.",
        25,
        300,
      ),
    ],
  },
  9: {
    id: 9,
    displayName: "Linda Park",
    role: "Social Work Intern",
    city: "Canton",
    zip: "44702",
    tier: "Peer Support",
    bio: "MSW candidate at Case Western. My internship focus is on housing instability as a relapse trigger. Live Now Recovery gave me a way to actually do something with that research — connecting clients to emergency shelter options alongside their MAT referrals.",
    skills: [
      "Housing Navigation",
      "Social Work",
      "Case Management",
      "Resource Referrals",
      "Trauma-Informed Care",
    ],
    coverGradient: COVER_GRADIENTS[3],
    privacyPublic: true,
    joinedAt: "August 2023",
    impactScore: 115,
    reportsSubmitted: 4,
    handoffsAssisted: 8,
    credentials: [
      makeCred(
        901,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training.",
        20,
        210,
      ),
      makeCred(
        902,
        "StorySharer",
        "PeerSupport",
        "Story Sharer",
        "Published an approved recovery testimonial.",
        15,
        85,
      ),
    ],
  },
  10: {
    id: 10,
    displayName: "Marcus Thompson",
    role: "Faith Community Liaison",
    city: "Elyria",
    zip: "44035",
    tier: "Leadership",
    bio: "Pastor at New Covenant Church, Elyria. We opened our fellowship hall as a recovery meeting space two years ago. I use this platform to coordinate transportation, connect families with providers, and track who showed up this week. Faith and science — they aren't opposites when a life is on the line.",
    skills: [
      "Community Organizing",
      "Faith-Based Outreach",
      "Event Coordination",
      "Family Counseling",
      "Volunteer Management",
    ],
    coverGradient: COVER_GRADIENTS[4],
    privacyPublic: true,
    joinedAt: "October 2022",
    impactScore: 520,
    reportsSubmitted: 16,
    handoffsAssisted: 29,
    credentials: [
      makeCred(
        1001,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        500,
      ),
      makeCred(
        1002,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training.",
        20,
        380,
      ),
      makeCred(
        1003,
        "NarcanHero",
        "Community",
        "Narcan Hero",
        "Reported a successful Narcan deployment.",
        25,
        260,
      ),
      makeCred(
        1004,
        "CommunityArchitect",
        "Leadership",
        "Community Architect",
        "Organized a local outreach event.",
        60,
        150,
      ),
      makeCred(
        1005,
        "PolicyPioneer",
        "Leadership",
        "Policy Pioneer",
        "Contributed data used in a public health report.",
        80,
        50,
      ),
    ],
  },
  11: {
    id: 11,
    displayName: "Sarah Kowalski",
    role: "Certified Peer Recovery Supporter",
    city: "Warren",
    zip: "44481",
    tier: "Peer Support",
    bio: "CPRS certified through Ohio. I specialize in working with women in recovery who are also navigating child welfare and custody situations. The stigma is crushing — I exist to be proof that you can come out the other side.",
    skills: [
      "CPRS Certified",
      "Women's Recovery",
      "Child Welfare Navigation",
      "Court Advocacy",
      "Trauma Recovery",
    ],
    coverGradient: COVER_GRADIENTS[0],
    privacyPublic: true,
    joinedAt: "May 2023",
    impactScore: 195,
    reportsSubmitted: 9,
    handoffsAssisted: 16,
    credentials: [
      makeCred(
        1101,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training.",
        20,
        350,
      ),
      makeCred(
        1102,
        "ThirtyDayGuide",
        "PeerSupport",
        "30-Day Guide",
        "Supported a peer through their first 30 days.",
        35,
        200,
      ),
      makeCred(
        1103,
        "StorySharer",
        "PeerSupport",
        "Story Sharer",
        "Published an approved recovery testimonial.",
        15,
        60,
      ),
    ],
  },
  12: {
    id: 12,
    displayName: "Devon Hayes",
    role: "Harm Reduction Specialist",
    city: "Sandusky",
    zip: "44870",
    tier: "Community",
    bio: "Stocking the kiosks, training the teams, filing the reports. I'm the boring backbone of harm reduction in Erie County — and I wouldn't have it any other way.",
    skills: [
      "Kiosk Operations",
      "Narcan Training",
      "Supply Management",
      "Volunteer Coordination",
      "Data Entry",
    ],
    coverGradient: COVER_GRADIENTS[1],
    privacyPublic: true,
    joinedAt: "December 2022",
    impactScore: 145,
    reportsSubmitted: 19,
    handoffsAssisted: 5,
    credentials: [
      makeCred(
        1201,
        "FirstResponder",
        "Community",
        "First Responder",
        "Submitted the first citizen report.",
        1,
        400,
      ),
      makeCred(
        1202,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        240,
      ),
    ],
  },
  13: {
    id: 13,
    displayName: "Vanessa Monroe",
    role: "Recovery Housing Advocate",
    city: "Mentor",
    zip: "44060",
    tier: "Leadership",
    bio: "I run a recovery housing referral network in Lake County. 90% of relapse happens when people have nowhere stable to go after treatment. I'm building the infrastructure that treatment centers assume exists.",
    skills: [
      "Housing Referrals",
      "Sober Living Networks",
      "Transitional Housing",
      "Landlord Outreach",
      "Funding Applications",
    ],
    coverGradient: COVER_GRADIENTS[2],
    privacyPublic: true,
    joinedAt: "August 2022",
    impactScore: 440,
    reportsSubmitted: 11,
    handoffsAssisted: 24,
    credentials: [
      makeCred(
        1301,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        550,
      ),
      makeCred(
        1302,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training.",
        20,
        400,
      ),
      makeCred(
        1303,
        "RecoveryNavigator",
        "Clinical",
        "Recovery Navigator",
        "Completed 25 warm handoffs through the platform.",
        75,
        180,
      ),
      makeCred(
        1304,
        "CommunityArchitect",
        "Leadership",
        "Community Architect",
        "Organized a local outreach event.",
        60,
        70,
      ),
    ],
  },
  14: {
    id: 14,
    displayName: "Erika Johnson",
    role: "Youth Outreach Volunteer",
    city: "Strongsville",
    zip: "44136",
    tier: "Community",
    bio: "High school counselor by day, recovery advocate nights and weekends. The pipeline from fentanyl-laced pills to overdose is tragically short for teenagers. I focus on early intervention, school-based naloxone training, and connecting families before crisis.",
    skills: [
      "Youth Outreach",
      "School-Based Programs",
      "Family Support",
      "Early Intervention",
      "Narcan Training",
    ],
    coverGradient: COVER_GRADIENTS[3],
    privacyPublic: true,
    joinedAt: "January 2024",
    impactScore: 90,
    reportsSubmitted: 3,
    handoffsAssisted: 7,
    credentials: [
      makeCred(
        1401,
        "FirstResponder",
        "Community",
        "First Responder",
        "Submitted the first citizen report.",
        1,
        120,
      ),
      makeCred(
        1402,
        "RecoveryAlly",
        "PeerSupport",
        "Recovery Ally",
        "Completed peer support training.",
        20,
        55,
      ),
    ],
  },
  15: {
    id: 15,
    displayName: "Ray Okonkwo",
    role: "Digital Health Volunteer",
    city: "Cleveland",
    zip: "44114",
    tier: "Leadership",
    bio: "Software engineer contributing tech skills to public health. I helped build parts of this platform and I maintain the data pipelines that power the Sentinel prediction engine. Technology in recovery isn't a gimmick — it's the scale we've been missing for 40 years.",
    skills: [
      "Full-Stack Dev",
      "Data Engineering",
      "ICP / Motoko",
      "Mapping",
      "Analytics",
    ],
    coverGradient: COVER_GRADIENTS[4],
    privacyPublic: true,
    joinedAt: "October 2022",
    impactScore: 695,
    reportsSubmitted: 14,
    handoffsAssisted: 22,
    credentials: [
      makeCred(
        1501,
        "CommunitySentinel",
        "Community",
        "Community Sentinel",
        "Submitted 10+ verified community reports.",
        10,
        600,
      ),
      makeCred(
        1502,
        "RecoveryNavigator",
        "Clinical",
        "Recovery Navigator",
        "Completed 25 warm handoffs through the platform.",
        75,
        350,
      ),
      makeCred(
        1503,
        "CommunityArchitect",
        "Leadership",
        "Community Architect",
        "Organized a local outreach event.",
        60,
        200,
      ),
      makeCred(
        1504,
        "PolicyPioneer",
        "Leadership",
        "Policy Pioneer",
        "Contributed data used in a public health report.",
        80,
        90,
      ),
    ],
  },
};

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border/30 p-4 flex flex-col items-center text-center gap-1">
      <Icon className="w-5 h-5 text-primary mb-1" />
      <span
        className="text-2xl font-extrabold"
        style={{ color: "var(--brand-teal)" }}
      >
        {value}
      </span>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ─── Cover + Avatar header ────────────────────────────────────────────────────
function VolunteerCoverHeader({ volunteer }: { volunteer: VolunteerMock }) {
  const initials = volunteer.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="rounded-2xl overflow-hidden border border-border/30 shadow-lg mb-6"
      data-ocid="volunteer_profile.cover_section"
    >
      {/* Cover photo */}
      <div
        className="relative w-full h-40 sm:h-56"
        style={{ background: volunteer.coverGradient }}
        data-ocid="volunteer_profile.cover_photo"
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, oklch(0.68 0.1 218 / 0.4) 0px, oklch(0.68 0.1 218 / 0.4) 1px, transparent 1px, transparent 14px)",
          }}
        />
        {/* Privacy badge */}
        <div className="absolute top-3 right-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-sm border border-white/10"
            style={{ color: "var(--brand-teal)" }}
          >
            <Globe className="w-3 h-3" />
            Public Profile
          </span>
        </div>
      </div>

      {/* Avatar + header info */}
      <div className="bg-card px-5 pb-5">
        <div className="flex items-end justify-between -mt-9 sm:-mt-11 mb-4">
          {/* Avatar */}
          <div className="relative" data-ocid="volunteer_profile.avatar">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-card flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.14 218), oklch(0.68 0.12 155))",
                color: "white",
              }}
            >
              {initials}
            </div>
          </div>

          {/* Share button */}
          <ShareOnXButton volunteer={volunteer} />
        </div>

        {/* Name + role */}
        <h1
          className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1"
          style={{ color: "var(--brand-teal)" }}
          data-ocid="volunteer_profile.display_name"
        >
          {volunteer.displayName}
        </h1>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              TIER_COLORS[volunteer.tier] ??
              "bg-muted text-muted-foreground border border-border"
            }`}
            data-ocid="volunteer_profile.role_badge"
          >
            <Shield className="w-3 h-3" />
            {volunteer.role}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "var(--brand-teal)" }}
            />
            {volunteer.city}, OH {volunteer.zip}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "var(--brand-teal)" }}
            />
            Joined {volunteer.joinedAt}
          </span>
          <span
            className="flex items-center gap-1.5 font-semibold"
            style={{ color: "var(--brand-teal)" }}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            Impact Score: {volunteer.impactScore}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Share on X button ────────────────────────────────────────────────────────
function ShareOnXButton({ volunteer }: { volunteer: VolunteerMock }) {
  const profileUrl = `${window.location.origin}/volunteer/${volunteer.id}`;
  const credCount = volunteer.credentials.length;
  const tweet = `Check out ${volunteer.displayName}'s recovery contribution on @LiveNowRecovery — Impact Score ${volunteer.impactScore}, ${credCount} credential${credCount !== 1 ? "s" : ""} earned! ${profileUrl} #RecoveryWorks #Ohio`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="volunteer_profile.share_x_button"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        background: "oklch(0.12 0.02 240)",
        borderColor: "oklch(0.3 0.01 240)",
        color: "oklch(0.90 0 0)",
      }}
      aria-label="Share on X (Twitter)"
    >
      <Share2 className="w-3.5 h-3.5" />
      Share on X
      <ExternalLink className="w-3 h-3 opacity-60" />
    </a>
  );
}

// ─── Privacy gate ─────────────────────────────────────────────────────────────
function PrivateProfileCard() {
  return (
    <div
      className="flex flex-col items-center text-center py-16 px-6 rounded-2xl border border-border/30"
      style={{ background: "oklch(0.18 0.06 218 / 0.3)" }}
      data-ocid="volunteer_profile.private_card"
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: "oklch(0.24 0.08 218 / 0.4)" }}
      >
        <Lock className="w-7 h-7" style={{ color: "var(--brand-teal)" }} />
      </div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ color: "var(--brand-teal)" }}
      >
        This profile is private
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        This volunteer prefers to keep their profile private. Their credentials
        are real and permanently recorded on the Internet Computer — they've
        chosen to keep them hidden by choice. Privacy is a right, not a barrier.
      </p>
      <Link
        to="/helper"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: "var(--brand-teal)",
          color: "oklch(0.12 0.04 240)",
        }}
        data-ocid="volunteer_profile.back_to_directory_link"
      >
        <Users className="w-4 h-4" />
        View all volunteers
      </Link>
    </div>
  );
}

// ─── Not found state ──────────────────────────────────────────────────────────
function NotFoundCard() {
  return (
    <div
      className="flex flex-col items-center text-center py-16 px-6 rounded-2xl border border-border/30 bg-card"
      data-ocid="volunteer_profile.not_found_state"
    >
      <div className="text-4xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Volunteer not found
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        This volunteer profile doesn't exist or may have been removed.
      </p>
      <Link
        to="/helper"
        data-ocid="volunteer_profile.not_found_back_link"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-foreground border border-border/40 hover:bg-muted/40 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to volunteer directory
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function VolunteerProfilePage() {
  const params = useParams({ strict: false }) as { id?: string };
  const numId = Number(params.id ?? "");
  const volunteer = Number.isFinite(numId) ? MOCK_VOLUNTEERS[numId] : null;

  // Award modal for profile owner view
  const { awardedCredential, dismissAward } = useCredentialAward();

  const pageTitle = volunteer
    ? `${volunteer.displayName} — ${volunteer.role} Volunteer | Live Now Recovery`
    : "Volunteer Profile | Live Now Recovery";
  const pageDesc = volunteer
    ? `${volunteer.displayName} is a verified volunteer on Live Now Recovery with an impact score of ${volunteer.impactScore} and ${volunteer.credentials.length} earned credentials. Based in ${volunteer.city}, Ohio.`
    : "Volunteer profile on Live Now Recovery.";
  const pageUrl = `https://livenowrecovery.org/volunteer/${params.id ?? ""}`;

  // JSON-LD schema — Person with credentials
  const jsonLd = volunteer
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: volunteer.displayName,
        jobTitle: volunteer.role,
        address: {
          "@type": "PostalAddress",
          addressLocality: volunteer.city,
          addressRegion: "OH",
          postalCode: volunteer.zip,
        },
        url: pageUrl,
        hasCredential: volunteer.credentials.map((c) => ({
          "@type": "EducationalOccupationalCredential",
          name: c.name,
          description: c.description,
          credentialCategory: c.tier,
        })),
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: volunteer.impactScore,
        },
      }
    : null;

  return (
    <main className="min-h-screen py-6 px-4" data-ocid="volunteer_profile.page">
      <CredentialAwardModal
        credential={awardedCredential}
        onDismiss={dismissAward}
      />
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="profile" />
      </Helmet>

      {/* JSON-LD — placed outside Helmet as a sibling script element */}
      {jsonLd && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          to="/helper"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          data-ocid="volunteer_profile.back_link"
        >
          <ArrowLeft className="w-4 h-4" />
          View all volunteers
        </Link>

        {/* Not found */}
        {!volunteer && <NotFoundCard />}

        {/* Private profile gate */}
        {volunteer && !volunteer.privacyPublic && <PrivateProfileCard />}

        {/* Full public profile */}
        {volunteer?.privacyPublic && (
          <>
            {/* Cover + avatar */}
            <VolunteerCoverHeader volunteer={volunteer} />

            {/* Bio */}
            <section
              className="bg-card rounded-2xl border border-border/30 p-5 mb-5"
              data-ocid="volunteer_profile.bio_section"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-1.5 h-5 rounded-full"
                  style={{ background: "var(--brand-teal)" }}
                />
                <h2
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: "var(--brand-teal)" }}
                >
                  About
                </h2>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {volunteer.bio}
              </p>
            </section>

            {/* Skills */}
            {volunteer.skills.length > 0 && (
              <section
                className="bg-card rounded-2xl border border-border/30 p-5 mb-5"
                data-ocid="volunteer_profile.skills_section"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-1.5 h-5 rounded-full"
                    style={{ background: "var(--brand-teal)" }}
                  />
                  <h2
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ color: "var(--brand-teal)" }}
                  >
                    Skills & Specialties
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-xs px-2.5 py-1 rounded-full border"
                      style={{
                        borderColor: "var(--brand-teal)",
                        color: "var(--brand-teal)",
                        background: "oklch(0.68 0.1 218 / 0.08)",
                      }}
                      data-ocid="volunteer_profile.skill_badge"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Impact stats row */}
            <section
              className="mb-5"
              aria-label="Impact statistics"
              data-ocid="volunteer_profile.stats_section"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-1.5 h-5 rounded-full"
                  style={{ background: "var(--brand-teal)" }}
                />
                <h2
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: "var(--brand-teal)" }}
                >
                  Impact at a Glance
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={Award}
                  label="Credentials Earned"
                  value={volunteer.credentials.length}
                  sub="Soul-bound on ICP"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Impact Score"
                  value={volunteer.impactScore}
                  sub="Community-weighted"
                />
                <StatCard
                  icon={Shield}
                  label="Reports Submitted"
                  value={volunteer.reportsSubmitted}
                  sub="Verified reports"
                />
                <StatCard
                  icon={Heart}
                  label="Handoffs Assisted"
                  value={volunteer.handoffsAssisted}
                  sub="People connected to care"
                />
              </div>
            </section>

            {/* ─── CREDENTIAL BADGES — THE HERO ─────────────────────────── */}
            <section
              className="bg-card rounded-2xl border border-border/30 p-5 mb-5 shadow-lg"
              data-ocid="volunteer_profile.credentials_section"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-5 rounded-full"
                    style={{ background: "var(--brand-teal)" }}
                  />
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--brand-teal)" }}
                  >
                    Earned Credentials
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {volunteer.credentials.length} credential
                  {volunteer.credentials.length !== 1 ? "s" : ""} · Soul-bound
                  on ICP
                </span>
              </div>

              <BadgeGrid
                credentials={volunteer.credentials}
                isLoading={false}
                emptyText="This volunteer hasn't earned credentials yet — contributions are on the way."
              />
            </section>

            {/* Achievement timeline */}
            {volunteer.credentials.length > 0 && (
              <section
                className="bg-card rounded-2xl border border-border/30 p-5 mb-5"
                data-ocid="volunteer_profile.timeline_section"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-1.5 h-5 rounded-full"
                    style={{ background: "var(--brand-teal)" }}
                  />
                  <h2
                    className="text-base font-bold"
                    style={{ color: "var(--brand-teal)" }}
                  >
                    Achievement Timeline
                  </h2>
                </div>
                <AchievementTimeline
                  credentials={[...volunteer.credentials].sort((a, b) =>
                    Number(a.earnedAt - b.earnedAt),
                  )}
                  isLoading={false}
                />
              </section>
            )}

            {/* CTA — join the movement */}
            <div
              className="rounded-2xl border border-border/30 p-5 mb-5 text-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.06 218 / 0.5), oklch(0.14 0.08 200 / 0.4))",
              }}
              data-ocid="volunteer_profile.cta_section"
            >
              <Star
                className="w-8 h-8 mx-auto mb-3"
                style={{ color: "var(--brand-teal)" }}
              />
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--brand-teal)" }}
              >
                Earn your own credentials
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                Every report submitted, every handoff completed, every story
                shared earns a permanent, on-chain credential. Start your
                recovery journey with us.
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link
                  to="/helper"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "var(--brand-teal)",
                    color: "oklch(0.12 0.04 240)",
                  }}
                  data-ocid="volunteer_profile.become_volunteer_cta"
                >
                  <Users className="w-4 h-4" />
                  Become a Volunteer
                </Link>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-border/40 text-foreground hover:bg-muted/40 transition-colors"
                  data-ocid="volunteer_profile.view_leaderboard_link"
                >
                  <TrendingUp className="w-4 h-4" />
                  View Leaderboard
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
