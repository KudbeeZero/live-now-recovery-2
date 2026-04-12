import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CanisterStateSummary,
  ProviderWithStatus,
  RiskPacket,
  VerifyResult,
} from "../backend";
import { createActor } from "../backend";
import type {
  ActivityTypeValue,
  CitizenReport,
  CitizenRiskBoost,
  HarmReductionItem,
  ProviderPost,
  RecoveryProfile,
  Testimonial,
} from "../types/community";

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

// ─── Prediction Engine queries ────────────────────────────────────────────────

export function useGetPredictionEngineState() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["predictionEngineState"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPredictionEngineState();
      } catch (err) {
        console.error("[useGetPredictionEngineState] Failed:", err);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useGetRiskEvents() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["riskEvents"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRiskEvents();
      } catch (err) {
        console.error("[useGetRiskEvents] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

export function useGetWeatherRisk() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["weatherRisk"],
    queryFn: async () => {
      if (!actor) return 1.0;
      try {
        return await actor.getWeatherRisk();
      } catch (err) {
        console.error("[useGetWeatherRisk] Failed:", err);
        return 1.0;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 300_000, // 5 min — weather doesn't change rapidly
  });
}

export function useGetSocialStressBaseline() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<[string, number][]>({
    queryKey: ["socialStressBaseline"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSocialStressBaseline();
      } catch (err) {
        console.error("[useGetSocialStressBaseline] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    // Census data is static — fetch once per session, no polling
    staleTime: 30 * 60_000,
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

// ─── Simulation Stats hooks ───────────────────────────────────────────────────

export function useGetSimulationStats() {
  const { actor } = useActor(createActor);
  return useQuery({
    queryKey: ["simulationStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalSimHandoffs: 0n,
          totalSimScans: 0n,
          totalSimVolunteers: 47n,
          simulationStartTime: 0n,
        };
      try {
        return await actor.getSimulationStats();
      } catch (err) {
        console.error("[useGetSimulationStats] Failed:", err);
        return {
          totalSimHandoffs: 0n,
          totalSimScans: 0n,
          totalSimVolunteers: 47n,
          simulationStartTime: 0n,
        };
      }
    },
    enabled: !!actor,
    refetchInterval: 60_000,
    retry: 2,
  });
}

export function useIncrementSimulationStats() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      handoffs,
      scans,
    }: {
      handoffs: bigint;
      scans: bigint;
    }): Promise<void> => {
      if (!actor) return; // fire-and-forget: silently skip if no actor
      return actor.incrementSimulationStats(handoffs, scans);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["simulationStats"] });
    },
  });
}

export function useSetSimulationVolunteers() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (count: bigint): Promise<void> => {
      if (!actor) return;
      return actor.setSimulationVolunteers(count);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["simulationStats"] });
    },
  });
}

export function useInitSimulationTime() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (!actor) return;
      return actor.initSimulationTime();
    },
  });
}

// ─── Community Layer: Provider Posts ─────────────────────────────────────────

export function useGetProviderPosts(providerId: string) {
  return useQuery<ProviderPost[]>({
    queryKey: ["providerPosts", providerId],
    queryFn: async () => [],
    enabled: !!providerId,
    staleTime: 30_000,
  });
}

export function useAddProviderPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_payload: {
      providerId: string;
      content: string;
      imageUrl?: string;
    }): Promise<void> => {
      // stub — backend integration follows in a separate task
      return Promise.resolve();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["providerPosts", variables.providerId],
      });
    },
  });
}

// ─── Community Layer: Recovery Profiles ──────────────────────────────────────

export function useGetRecoveryProfile() {
  return useQuery<RecoveryProfile | null>({
    queryKey: ["recoveryProfile"],
    queryFn: async () => null,
    staleTime: 60_000,
  });
}

export function useCreateRecoveryProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_payload: {
      displayName: string;
      zip: string;
    }): Promise<void> => {
      return Promise.resolve();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recoveryProfile"] });
    },
  });
}

export function useAddFavoriteProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_payload: {
      providerId: string;
      remove?: boolean;
    }): Promise<void> => {
      return Promise.resolve();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recoveryProfile"] });
    },
  });
}

// ─── Community Layer: Citizen Reports ────────────────────────────────────────

export function useGetAllReports() {
  const { actor } = useActor(createActor);
  return useQuery<CitizenReport[]>({
    queryKey: ["citizenReports"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const raw = await actor.getAllReports();
        // Backend CitizenReport uses bigint for upvotes/createdAt; normalize to number
        return raw.map((r) => ({
          ...r,
          upvotes: Number(r.upvotes),
          createdAt: Number(r.createdAt),
          activityType: r.activityType as CitizenReport["activityType"],
        }));
      } catch (err) {
        console.error("[useGetAllReports] Failed:", err);
        return [];
      }
    },
    enabled: !!actor,
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useSubmitCitizenReport() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      report: Omit<CitizenReport, "id" | "upvotes" | "createdAt">,
    ): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      await actor.submitCitizenReport(
        report.zipCode,
        report.activityType,
        report.content,
        report.lat ?? null,
        report.lng ?? null,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["citizenReports"] });
      qc.invalidateQueries({ queryKey: ["activeRiskBoosts"] });
    },
  });
}

export function useUpvoteCitizenReport() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      await actor.upvoteCitizenReport(reportId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["citizenReports"] });
    },
  });
}

// ─── Community Layer: Citizen Report Flagging ─────────────────────────────────

export function useFlagCitizenReport() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (
          actor as unknown as Record<string, (a: string) => Promise<void>>
        ).flagCitizenReport(reportId);
      } catch (err) {
        console.error("[useFlagCitizenReport] Failed:", err);
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["citizenReports"] });
    },
  });
}

// ─── Community Layer: Active Risk Boosts ─────────────────────────────────────

export function useGetActiveRiskBoosts() {
  const { actor } = useActor(createActor);
  return useQuery<CitizenRiskBoost[]>({
    queryKey: ["activeRiskBoosts"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await (
          actor as unknown as Record<string, () => Promise<unknown>>
        ).getActiveRiskBoosts();
        return raw as CitizenRiskBoost[];
      } catch (err) {
        console.error("[useGetActiveRiskBoosts] Failed:", err);
        return [];
      }
    },
    enabled: !!actor,
    refetchInterval: 30_000,
    retry: 2,
  });
}

// ─── Community Layer: Testimonials ───────────────────────────────────────────

export function useStoreTestimonial() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      authorDisplayName: string;
      zipCode: string;
      content: string;
    }): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (
          actor as unknown as Record<
            string,
            (a: string, b: string, c: string) => Promise<void>
          >
        ).storeTestimonial(
          payload.authorDisplayName,
          payload.zipCode,
          payload.content,
        );
      } catch (err) {
        console.error("[useStoreTestimonial] Failed:", err);
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvedTestimonials"] });
    },
  });
}

export function useGetApprovedTestimonials() {
  const { actor } = useActor(createActor);
  return useQuery<Testimonial[]>({
    queryKey: ["approvedTestimonials"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await (
          actor as unknown as Record<string, () => Promise<unknown>>
        ).getApprovedTestimonials();
        return raw as Testimonial[];
      } catch (err) {
        console.error("[useGetApprovedTestimonials] Failed:", err);
        return [];
      }
    },
    enabled: !!actor,
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useGetAllTestimonialsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Testimonial[]>({
    queryKey: ["allTestimonialsAdmin"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await (
          actor as unknown as Record<string, () => Promise<unknown>>
        ).getAllTestimonialsAdmin();
        return raw as Testimonial[];
      } catch (err) {
        console.error("[useGetAllTestimonialsAdmin] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
    retry: 2,
  });
}

export function useApproveTestimonial() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testimonialId: string): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (
          actor as unknown as Record<string, (a: string) => Promise<void>>
        ).approveTestimonial(testimonialId);
      } catch (err) {
        console.error("[useApproveTestimonial] Failed:", err);
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTestimonialsAdmin"] });
      qc.invalidateQueries({ queryKey: ["approvedTestimonials"] });
    },
  });
}

export function useHideTestimonial() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testimonialId: string): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (
          actor as unknown as Record<string, (a: string) => Promise<void>>
        ).hideTestimonial(testimonialId);
      } catch (err) {
        console.error("[useHideTestimonial] Failed:", err);
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTestimonialsAdmin"] });
      qc.invalidateQueries({ queryKey: ["approvedTestimonials"] });
    },
  });
}

// ─── Community Layer: Aggregate Counts ───────────────────────────────────────

export function useGetHelperCount() {
  const { actor } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["helperCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (
          actor as unknown as Record<string, () => Promise<bigint>>
        ).getHelperCount();
      } catch (err) {
        // Fallback: count helpers from getAllHelpers
        try {
          const helpers = await actor.getAllHelpers();
          return BigInt(helpers.length);
        } catch {
          console.error("[useGetHelperCount] Failed:", err);
          return 0n;
        }
      }
    },
    enabled: !!actor,
    refetchInterval: 60_000,
    retry: 2,
  });
}

export function useAllHelpers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["allHelpers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllHelpers();
      } catch (err) {
        console.error("[useAllHelpers] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    retry: 2,
  });
}

export function useGetTestimonialCount() {
  const { actor } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["testimonialCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (
          actor as unknown as Record<string, () => Promise<bigint>>
        ).getTestimonialCount();
      } catch (err) {
        console.error("[useGetTestimonialCount] Failed:", err);
        return 0n;
      }
    },
    enabled: !!actor,
    refetchInterval: 60_000,
    retry: 2,
  });
}

// ─── Harm Reduction Inventory ─────────────────────────────────────────────────

export function useGetHarmReductionInventory(providerId: string) {
  const { actor } = useActor(createActor);
  return useQuery<HarmReductionItem[]>({
    queryKey: ["harmReductionInventory", providerId],
    queryFn: async () => {
      if (!actor || !providerId) return [];
      try {
        return await (
          actor as unknown as Record<
            string,
            (id: string) => Promise<HarmReductionItem[]>
          >
        ).getHarmReductionInventory(providerId);
      } catch (err) {
        console.error("[useGetHarmReductionInventory] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !!providerId,
    refetchInterval: 60_000,
    retry: 2,
  });
}

export function useSetHarmReductionInventory() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      providerId,
      items,
    }: {
      providerId: string;
      items: HarmReductionItem[];
    }): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      await (
        actor as unknown as Record<
          string,
          (id: string, items: HarmReductionItem[]) => Promise<undefined>
        >
      ).setHarmReductionInventory(providerId, items);
    },
    onSuccess: (_data, { providerId }) => {
      qc.invalidateQueries({
        queryKey: ["harmReductionInventory", providerId],
      });
      qc.invalidateQueries({
        queryKey: ["providersByHarmReductionItem"],
      });
    },
  });
}

export function useGetProvidersByHarmReductionItem(itemType: string) {
  const { actor } = useActor(createActor);
  return useQuery<ProviderWithStatus[]>({
    queryKey: ["providersByHarmReductionItem", itemType],
    queryFn: async () => {
      if (!actor || !itemType) return [];
      try {
        return await (
          actor as unknown as Record<
            string,
            (item: string) => Promise<ProviderWithStatus[]>
          >
        ).getProvidersByHarmReductionItem(itemType);
      } catch (err) {
        console.error("[useGetProvidersByHarmReductionItem] Failed:", err);
        return [];
      }
    },
    enabled: !!actor && !!itemType,
    refetchInterval: 60_000,
    retry: 2,
  });
}
