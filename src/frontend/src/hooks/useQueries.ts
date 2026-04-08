import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CanisterStateSummary,
  ProviderWithStatus,
  RiskPacket,
  VerifyResult,
} from "../backend";
import { createActor } from "../backend";

export function useAllProviders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ProviderWithStatus[]>({
    queryKey: ["allProviders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProviders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useEmergencyProviders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ProviderWithStatus[]>({
    queryKey: ["emergencyProviders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmergencyActive();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useTotalHandoffs() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["totalHandoffs"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getTotalHandoffs();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useHandoffCountsByZip() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<[string, bigint][]>({
    queryKey: ["handoffCounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHandoffCountsByZip();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

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
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

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
      providerType?: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerProvider(id, name, lat, lng, providerType ?? "General");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allProviders"] });
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

export function useRegisterHelper() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      firstName,
      zip,
      phone,
      note,
    }: {
      firstName: string;
      zip: string;
      phone: string;
      note: string;
    }): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).registerHelper(firstName, zip, phone, note);
    },
  });
}
