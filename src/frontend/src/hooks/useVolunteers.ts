import { createActor } from "@/backend";
import type { VolunteerProfile } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Volunteer Profile Queries ────────────────────────────────────────────────

/**
 * Fetch all public volunteer profiles (privacyPublic === true).
 * Used for the volunteer directory.
 */
export function useAllPublicVolunteers() {
  const { actor } = useActor(createActor);
  return useQuery<VolunteerProfile[]>({
    queryKey: ["allPublicVolunteers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPublicVolunteers();
      } catch (err) {
        console.error("[useAllPublicVolunteers] Failed:", err);
        return [];
      }
    },
    enabled: !!actor,
    refetchInterval: 60_000,
    retry: 2,
  });
}

/**
 * Fetch a single volunteer profile by numeric ID.
 */
export function useGetVolunteer(id: bigint | null) {
  const { actor } = useActor(createActor);
  return useQuery<VolunteerProfile | null>({
    queryKey: ["volunteer", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      try {
        return await actor.getVolunteer(id);
      } catch (err) {
        console.error("[useGetVolunteer] Failed:", err);
        return null;
      }
    },
    enabled: !!actor && id !== null,
    staleTime: 30_000,
    retry: 2,
  });
}

/**
 * Total volunteer count — for stat bars and counters.
 */
export function useVolunteerCount() {
  const { actor } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["volunteerCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      try {
        return await actor.volunteerCount();
      } catch (err) {
        console.error("[useVolunteerCount] Failed:", err);
        return 0n;
      }
    },
    enabled: !!actor,
    refetchInterval: 60_000,
    retry: 2,
  });
}

// ─── Volunteer Profile Mutations ──────────────────────────────────────────────

export interface RegisterVolunteerInput {
  displayName: string;
  role: string;
  city: string;
  zip: string;
  bio: string;
  skills: string[];
  privacyPublic: boolean;
}

/**
 * Register a new volunteer profile on the backend.
 * Returns the new volunteer's bigint ID.
 */
export function useRegisterVolunteerProfile() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<bigint, Error, RegisterVolunteerInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerVolunteerProfile(
        input.displayName,
        input.role,
        input.city,
        input.zip,
        input.bio,
        input.skills,
        input.privacyPublic,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPublicVolunteers"] });
      qc.invalidateQueries({ queryKey: ["volunteerCount"] });
    },
  });
}
