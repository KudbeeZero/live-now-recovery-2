// Community layer types — NO-PHI strict

export interface ProviderPost {
  id: string;
  providerId: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
}

export interface CitizenReport {
  id: string;
  zipCode: string;
  activityType:
    | "narcan-used"
    | "suspected-od"
    | "bad-batch-alert"
    | "resource-found"
    | "area-concern"
    | "check-in"
    | "other";
  content: string;
  upvotes: number;
  lat?: number;
  lng?: number;
  createdAt: number;
}

export interface RecoveryProfile {
  id: string;
  displayName: string;
  zip: string;
  favoriteProviders: string[];
  resourcesUsed: string[];
  createdAt: number;
}

export interface ResourceOrg {
  id: string;
  name: string;
  category:
    | "food"
    | "housing"
    | "employment"
    | "peer-support"
    | "bill-assistance";
  description: string;
  phone?: string;
  website?: string;
  address?: string;
  city: string;
}

export interface Testimonial {
  id: string;
  authorId: string;
  authorDisplayName: string;
  zipCode: string;
  content: string;
  isApproved: boolean;
  isHidden: boolean;
  createdAt: bigint;
}

export interface CitizenRiskBoost {
  zipCode: string;
  boostAmount: number;
  expiresAt: bigint;
}

export const ActivityType = {
  NARCAN_USED: "narcan-used",
  SUSPECTED_OD: "suspected-od",
  BAD_BATCH_ALERT: "bad-batch-alert",
  RESOURCE_FOUND: "resource-found",
  AREA_CONCERN: "area-concern",
  CHECK_IN: "check-in",
  OTHER: "other",
} as const;

export type ActivityTypeValue =
  (typeof ActivityType)[keyof typeof ActivityType];
