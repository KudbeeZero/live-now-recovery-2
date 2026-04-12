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

// ─── Harm Reduction Inventory ──────────────────────────────────────────────────

export interface HarmReductionItem {
  /** "clean_syringes" | "sharps_disposal" | "fentanyl_test_strips" | "narcan_kits" | "wound_care" | "alcohol_swabs" */
  itemType: string;
  available: boolean;
  quantity: [] | [bigint];
  notes: [] | [string];
}

export const HARM_REDUCTION_ITEMS = [
  {
    key: "narcan_kits",
    label: "Narcan / Naloxone Kits",
    icon: "💊",
    color: "text-green-400",
  },
  {
    key: "fentanyl_test_strips",
    label: "Fentanyl Test Strips",
    icon: "🔬",
    color: "text-blue-400",
  },
  {
    key: "clean_syringes",
    label: "Clean Syringes",
    icon: "💉",
    color: "text-teal-400",
  },
  {
    key: "sharps_disposal",
    label: "Sharps Disposal",
    icon: "🗑️",
    color: "text-amber-400",
  },
  {
    key: "wound_care",
    label: "Wound Care Supplies",
    icon: "🩹",
    color: "text-rose-400",
  },
  {
    key: "alcohol_swabs",
    label: "Alcohol Swabs",
    icon: "🧴",
    color: "text-purple-400",
  },
] as const;
