import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CanisterStateSummary,
  ProviderWithStatus,
  RiskPacket,
  VerifyResult,
} from "../backend";
import { createActor } from "../backend";

// ─── Public queries — no authentication required ────────────────────────────
// These call backend query methods that are publicly accessible on ICP.
// The actor for query calls does NOT need the user to be authenticated.
// We only gate on actor existing (not isFetching) so anonymous users can
// see providers on the map immediately without signing in.

export function useAllProviders() {
  const { actor } = useActor(createActor);
  return useQuery<ProviderWithStatus[]>({
    queryKey: ["allProviders"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllProviders();
        console.log(`[useAllProviders] Loaded ${result.length} providers`);
        return result;
      } catch (err) {
        console.error("[useAllProviders] Failed to fetch providers:", err);
        return [];
      }
    },
    // enabled when actor exists — does NOT require user authentication
    enabled: !!actor,
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useEmergencyProviders() {
  const { actor } = useActor(createActor);
  return useQuery<ProviderWithStatus[]>({
    queryKey: ["emergencyProviders"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getEmergencyActive();
      } catch (err) {
        console.error("[useEmergencyProviders] Failed:", err);
        return [];
      }
    },
    enabled: !!actor,
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useTotalHandoffs() {
  const { actor } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["totalHandoffs"],
    queryFn: async () => {
      if (!actor) return 0n;
      try {
        return await actor.getTotalHandoffs();
      } catch (err) {
        console.error("[useTotalHandoffs] Failed:", err);
        return 0n;
      }
    },
    enabled: !!actor,
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useHandoffCountsByZip() {
  const { actor } = useActor(createActor);
  return useQuery<[string, bigint][]>({
    queryKey: ["handoffCounts"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getHandoffCountsByZip();
      } catch (err) {
        console.error("[useHandoffCountsByZip] Failed:", err);
        return [];
      }
    },
    enabled: !!actor,
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useGetMarketplaceGeoJSON() {
  const { actor } = useActor(createActor);
  return useQuery<string>({
    queryKey: ["marketplaceGeoJSON"],
    queryFn: async () => {
      if (!actor) return '{"type":"FeatureCollection","features":[]}';
      try {
        return await actor.getMarketplaceGeoJSON();
      } catch (err) {
        console.error("[useGetMarketplaceGeoJSON] Failed:", err);
        return '{"type":"FeatureCollection","features":[]}';
      }
    },
    enabled: !!actor,
    refetchInterval: 30_000,
    retry: 2,
  });
}

// ─── Auth-gated queries — require actor + user auth to be meaningful ─────────

export function useCanisterState() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CanisterStateSummary>({
    queryKey: ["canisterState"],
    queryFn: async () => {
      if (!actor)
        return {
          active_providers: [],
          total_active_providers: 0n,
          high_risk_window_active: false,
        };
      return actor.getCanisterState();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations — all require authenticated actor ─────────────────────────────

export function useToggleLive() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleLive(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProviders"] });
      qc.invalidateQueries({ queryKey: ["emergencyProviders"] });
    },
  });
}

export function useRegisterProvider() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      lat,
      lng,
      providerType,
    }: {
      id: string;
      name: string;
      lat: number;
      lng: number;
      providerType: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerProvider(id, name, lat, lng, providerType);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProviders"] });
      qc.invalidateQueries({ queryKey: ["marketplaceGeoJSON"] });
    },
  });
}

export function useVerifyProvider() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.verifyProvider(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProviders"] });
      qc.invalidateQueries({ queryKey: ["marketplaceGeoJSON"] });
    },
  });
}

export function useSetProviderActiveStatus() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setProviderActiveStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProviders"] });
      qc.invalidateQueries({ queryKey: ["marketplaceGeoJSON"] });
    },
  });
}

export function useUpdateInventory() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      newInventory,
    }: {
      id: string;
      newInventory: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateInventory(id, newInventory);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProviders"] });
    },
  });
}

export function useGenerateHandoffToken() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (zipCode: string): Promise<string> => {
      if (!actor) throw new Error("Not connected");
      return actor.generateHandoffToken(zipCode);
    },
  });
}

export function useVerifyHandoff() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token: string): Promise<VerifyResult> => {
      if (!actor) throw new Error("Not connected");
      return actor.verifyHandoff(token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totalHandoffs"] });
      qc.invalidateQueries({ queryKey: ["handoffCounts"] });
    },
  });
}

export function useReceiveRiskPacket() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (packet: RiskPacket): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      return actor.receiveRiskPacket(packet);
    },
  });
}

// ─── Cost Plus Rx Router ─────────────────────────────────────────────────────

export function useGetCostPlusReferralCount(providerId: string) {
  const { actor } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["costPlusReferralCount", providerId],
    queryFn: async () => {
      if (!actor || !providerId) return 0n;
      try {
        return await actor.getCostPlusReferralCount(providerId);
      } catch (err) {
        console.error("[useGetCostPlusReferralCount] Failed:", err);
        return 0n;
      }
    },
    enabled: !!actor && !!providerId,
  });
}

export function useTotalCostPlusReferrals() {
  const { actor } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["totalCostPlusReferrals"],
    queryFn: async () => {
      if (!actor) return 0n;
      try {
        return await actor.getTotalCostPlusReferrals();
      } catch (err) {
        console.error("[useTotalCostPlusReferrals] Failed:", err);
        return 0n;
      }
    },
    enabled: !!actor,
    refetchInterval: 60_000,
  });
}

export function useRecordCostPlusReferral() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (providerId: string): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      return actor.recordCostPlusReferral(providerId);
    },
    onSuccess: (_data, providerId) => {
      qc.invalidateQueries({ queryKey: ["costPlusReferralCount", providerId] });
      qc.invalidateQueries({ queryKey: ["totalCostPlusReferrals"] });
    },
  });
}

export function useRegisterHelper() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      zip,
      helpType,
      agreed,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      zip: string;
      helpType: string;
      agreed: boolean;
    }): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      // Backend accepts 8 fields: firstName, lastName, email, zip, phone, helpType, consent, note
      return actor.registerHelper(
        firstName,
        lastName,
        email,
        zip,
        "", // phone — not collected in UI
        helpType,
        agreed,
        "", // note — not collected in UI
      );
    },
  });
}
