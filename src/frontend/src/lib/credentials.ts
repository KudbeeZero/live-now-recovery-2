import type { Credential, CredentialType, Tier } from "../types/credentials";
import { CREDENTIAL_META } from "../types/credentials";

// Impact score weights per credential type
export const IMPACT_SCORES: Record<string, number> = {
  FirstResponder: 1,
  CommunitySentinel: 10,
  NarcanHero: 25,
  RecoveryAlly: 20,
  ThirtyDayGuide: 35,
  StorySharer: 15,
  MATChampion: 50,
  BridgeProvider: 40,
  RecoveryNavigator: 75,
  SentinelVerified: 30,
  CommunityArchitect: 60,
  PolicyPioneer: 80,
};

// Returns Tailwind text-color class for a tier
export function getTierColor(tier: string): string {
  switch (tier) {
    case "Community":
      return "text-emerald-400";
    case "PeerSupport":
      return "text-blue-400";
    case "Clinical":
      return "text-amber-400";
    case "Leadership":
      return "text-purple-400";
    default:
      return "text-muted-foreground";
  }
}

// Returns Tailwind bg+border classes for a tier
export function getTierBgColor(tier: string): string {
  switch (tier) {
    case "Community":
      return "bg-emerald-500/10 border border-emerald-500/30";
    case "PeerSupport":
      return "bg-blue-500/10 border border-blue-500/30";
    case "Clinical":
      return "bg-amber-500/10 border border-amber-500/30";
    case "Leadership":
      return "bg-purple-500/10 border border-purple-500/30";
    default:
      return "bg-muted border border-border";
  }
}

// Returns a tier label appropriate for UI display
export function getTierLabel(tier: string): string {
  switch (tier) {
    case "Community":
      return "Community";
    case "PeerSupport":
      return "Peer Support";
    case "Clinical":
      return "Clinical";
    case "Leadership":
      return "Leadership";
    default:
      return tier;
  }
}

// Returns the credential display name
export function getCredentialDisplayName(
  credType: CredentialType | string,
): string {
  const meta = CREDENTIAL_META[credType as CredentialType];
  if (meta) return meta.displayName;
  // Fallback: split camelCase
  return String(credType)
    .replace(/([A-Z])/g, " $1")
    .trim();
}

// Returns the credential description
export function getCredentialDescription(
  credType: CredentialType | string,
): string {
  const meta = CREDENTIAL_META[credType as CredentialType];
  return (
    meta?.description ??
    "Earned through verified contribution to the Live Now Recovery platform."
  );
}

// Formats earnedAt bigint (nanoseconds) to human-readable date string
export function formatEarnedAt(earnedAt: bigint): string {
  const ms = Number(earnedAt / 1_000_000n);
  if (ms === 0) return "Recently earned";
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Returns the pre-filled X (Twitter) tweet text for sharing a credential
export function getShareText(
  credential: Credential,
  username?: string,
): string {
  const name = getCredentialDisplayName(credential.credentialType);
  const tier = getTierLabel(credential.tier);
  const userPart = username ? `@${username} ` : "";
  return encodeURIComponent(
    `${userPart}Just earned the "${name}" credential on @LiveNowRecovery — a verified ${tier} badge on ICP. Join the movement to end the opioid crisis. #RecoveryIsPossible #LiveNowRecovery https://livenowrecovery.org`,
  );
}

// Returns the X share URL
export function getShareUrl(credential: Credential, username?: string): string {
  return `https://twitter.com/intent/tweet?text=${getShareText(credential, username)}`;
}

// Returns whether a credential qualifies for a physical reward
// (Backend doesn't store physicalClaimed — eligibility is tier-only)
export function isPhysicalRewardEligible(credential: Credential): boolean {
  const tier = credential.tier;
  return tier === "Clinical" || tier === "Leadership";
}

// Shortens a Principal to a display-friendly string
export function shortenPrincipal(
  principal: { toString(): string } | string,
): string {
  const str = typeof principal === "string" ? principal : principal.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 5)}...${str.slice(-5)}`;
}

// Groups credentials by tier for display
export function groupByTier(
  credentials: Credential[],
): Record<string, Credential[]> {
  return credentials.reduce<Record<string, Credential[]>>((acc, cred) => {
    const tier = cred.tier || "Community";
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(cred);
    return acc;
  }, {});
}
