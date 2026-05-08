// Credential Layer Types — NO PHI, soul-bound on ICP
import type {
  Credential as BackendCredential,
  GlobalImpactStats,
} from "../backend";
import { CredentialType } from "../backend";

// Re-export for consumers
export type { GlobalImpactStats } from "../backend";
export { CredentialType } from "../backend";

// Frontend-friendly Credential alias (keeps bigint fields from backend)
export type Credential = BackendCredential;

// Tier strings matching backend Tier type
export type Tier = "Community" | "PeerSupport" | "Clinical" | "Leadership";

// Leaderboard entry returned from getTopContributors
import type { Principal } from "@icp-sdk/core/principal";

export interface LeaderboardEntry {
  principal: Principal;
  impactScore: bigint;
  credentialTypes: string[];
  rank: number;
}

// User timeline entry (ordered chronologically)
export type UserTimelineEntry = Credential;

// Credential display metadata
export interface CredentialMeta {
  type: CredentialType;
  tier: Tier;
  displayName: string;
  description: string;
  impactWeight: number;
  tierColor: string;
  tierBg: string;
}

// Credential type display data map — keyed by enum value
export const CREDENTIAL_META: Record<CredentialType, CredentialMeta> = {
  [CredentialType.FirstResponder]: {
    type: CredentialType.FirstResponder,
    tier: "Community",
    displayName: "First Responder",
    description:
      "Submitted the first citizen report — eyes on the ground when it matters most.",
    impactWeight: 1,
    tierColor: "text-emerald-400",
    tierBg: "bg-emerald-500/10 border-emerald-500/30",
  },
  [CredentialType.CommunitySentinel]: {
    type: CredentialType.CommunitySentinel,
    tier: "Community",
    displayName: "Community Sentinel",
    description:
      "Submitted 10+ verified community reports, building a live picture of local risk.",
    impactWeight: 10,
    tierColor: "text-emerald-400",
    tierBg: "bg-emerald-500/10 border-emerald-500/30",
  },
  [CredentialType.NarcanHero]: {
    type: CredentialType.NarcanHero,
    tier: "Community",
    displayName: "Narcan Hero",
    description:
      "Reported a successful Narcan deployment in the community — a life in the balance, acted.",
    impactWeight: 25,
    tierColor: "text-emerald-400",
    tierBg: "bg-emerald-500/10 border-emerald-500/30",
  },
  [CredentialType.RecoveryAlly]: {
    type: CredentialType.RecoveryAlly,
    tier: "PeerSupport",
    displayName: "Recovery Ally",
    description:
      "Completed peer support training, verified by the Live Now Recovery team.",
    impactWeight: 20,
    tierColor: "text-blue-400",
    tierBg: "bg-blue-500/10 border-blue-500/30",
  },
  [CredentialType.ThirtyDayGuide]: {
    type: CredentialType.ThirtyDayGuide,
    tier: "PeerSupport",
    displayName: "30-Day Guide",
    description:
      "Supported a peer through their first 30 days of recovery. The hardest stretch, together.",
    impactWeight: 35,
    tierColor: "text-blue-400",
    tierBg: "bg-blue-500/10 border-blue-500/30",
  },
  [CredentialType.StorySharer]: {
    type: CredentialType.StorySharer,
    tier: "PeerSupport",
    displayName: "Story Sharer",
    description:
      "Published an approved recovery testimonial. Your story gives others permission to try.",
    impactWeight: 15,
    tierColor: "text-blue-400",
    tierBg: "bg-blue-500/10 border-blue-500/30",
  },
  [CredentialType.MATChampion]: {
    type: CredentialType.MATChampion,
    tier: "Clinical",
    displayName: "MAT Champion",
    description:
      "Actively prescribing medication-assisted treatment to 10+ patients through the platform.",
    impactWeight: 50,
    tierColor: "text-amber-400",
    tierBg: "bg-amber-500/10 border-amber-500/30",
  },
  [CredentialType.BridgeProvider]: {
    type: CredentialType.BridgeProvider,
    tier: "Clinical",
    displayName: "Bridge Provider",
    description:
      "Issued 5+ 72-hour bridge prescriptions, eliminating the deadly gap between ER and clinic.",
    impactWeight: 40,
    tierColor: "text-amber-400",
    tierBg: "bg-amber-500/10 border-amber-500/30",
  },
  [CredentialType.RecoveryNavigator]: {
    type: CredentialType.RecoveryNavigator,
    tier: "Clinical",
    displayName: "Recovery Navigator",
    description:
      "Completed 25 warm handoffs through the platform — a direct pipeline from crisis to care.",
    impactWeight: 75,
    tierColor: "text-amber-400",
    tierBg: "bg-amber-500/10 border-amber-500/30",
  },
  [CredentialType.SentinelVerified]: {
    type: CredentialType.SentinelVerified,
    tier: "Clinical",
    displayName: "Sentinel Verified",
    description:
      "Passed the Live Now Recovery provider verification process. Trusted, confirmed, credentialed.",
    impactWeight: 30,
    tierColor: "text-amber-400",
    tierBg: "bg-amber-500/10 border-amber-500/30",
  },
  [CredentialType.CommunityArchitect]: {
    type: CredentialType.CommunityArchitect,
    tier: "Leadership",
    displayName: "Community Architect",
    description:
      "Organized a local outreach event logged on the platform. Building recovery infrastructure from the ground up.",
    impactWeight: 60,
    tierColor: "text-purple-400",
    tierBg: "bg-purple-500/10 border-purple-500/30",
  },
  [CredentialType.PolicyPioneer]: {
    type: CredentialType.PolicyPioneer,
    tier: "Leadership",
    displayName: "Policy Pioneer",
    description:
      "Contributed data used in a public health report generated by the platform. Turning data into policy.",
    impactWeight: 80,
    tierColor: "text-purple-400",
    tierBg: "bg-purple-500/10 border-purple-500/30",
  },
};

export const TIER_LABELS: Record<Tier, string> = {
  Community: "Community",
  PeerSupport: "Peer Support",
  Clinical: "Clinical",
  Leadership: "Leadership",
};

export const ALL_CREDENTIAL_TYPES = [
  "FirstResponder",
  "CommunitySentinel",
  "NarcanHero",
  "RecoveryAlly",
  "ThirtyDayGuide",
  "StorySharer",
  "MATChampion",
  "BridgeProvider",
  "RecoveryNavigator",
  "SentinelVerified",
  "CommunityArchitect",
  "PolicyPioneer",
] as const;
