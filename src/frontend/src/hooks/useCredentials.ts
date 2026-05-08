import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Credential,
  GlobalImpactStats,
  LeaderboardEntry,
} from "../types/credentials";

// ─── Public credential queries (no auth required) ───────────────────────────

export function useUserCredentials(principal?: Principal | null) {
  const { actor } = useActor(createActor);
  return useQuery<Credential[]>({
    queryKey: ["userCredentials", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      try {
        return await actor.getUserCredentials(principal);
      } catch (err) {
        console.error("[useUserCredentials] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !!principal,
    staleTime: 5 * 60_000, // 5 minutes
    retry: 2,
  });
}

export function useTopContributors(limit = 50) {
  const { actor } = useActor(createActor);
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["topContributors", limit],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const raw = await actor.getTopContributors(BigInt(limit));
        return raw.map(([principal, impactScore, credentialTypes], index) => ({
          principal,
          impactScore,
          credentialTypes,
          rank: index + 1,
        }));
      } catch (err) {
        console.error("[useTopContributors] Failed:", err);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 5 * 60_000,
    refetchInterval: 60_000,
    retry: 2,
  });
}

export function useGlobalImpactStats() {
  const { actor } = useActor(createActor);
  return useQuery<GlobalImpactStats>({
    queryKey: ["globalImpactStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalBadgesMinted: 0n,
          activeContributors: 0n,
          totalImpactScore: 0n,
        };
      try {
        return await actor.getGlobalImpactStats();
      } catch (err) {
        console.error("[useGlobalImpactStats] Failed:", err);
        return {
          totalBadgesMinted: 0n,
          activeContributors: 0n,
          totalImpactScore: 0n,
        };
      }
    },
    enabled: !!actor,
    staleTime: 5 * 60_000,
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useUserTimeline(principal?: Principal | null) {
  const { actor } = useActor(createActor);
  return useQuery<Credential[]>({
    queryKey: ["userTimeline", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      try {
        const raw = await actor.getUserTimeline(principal);
        // Sort chronologically
        return [...raw].sort((a, b) => Number(a.earnedAt - b.earnedAt));
      } catch (err) {
        console.error("[useUserTimeline] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !!principal,
    staleTime: 5 * 60_000,
    retry: 2,
  });
}

// Physical fulfillment is not yet implemented in the backend — returns empty list
export function usePendingPhysicalFulfillments() {
  return useQuery<Credential[]>({
    queryKey: ["pendingPhysicalFulfillments"],
    queryFn: async () => [],
    staleTime: 5 * 60_000,
  });
}
