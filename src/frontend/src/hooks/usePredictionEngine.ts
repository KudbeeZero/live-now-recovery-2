/**
 * usePredictionEngine — React hook that bridges the Zustand store with the
 * backend canister and React Query cache.
 *
 * On mount it fetches:
 *   1. PredictionEngineState from the canister → hydrates store.settings
 *   2. RiskEvents from the canister → hydrates store.events
 *   3. WeatherRisk multiplier → hydrates store.weatherRisk
 *   4. SocialStressBaseline → hydrates store.socialStressMap
 *   5. WeatherAlerts → hydrates store.weatherAlerts
 *
 * Also exposes useFiscalImpact() which polls backend for fiscal state every
 * 30 seconds and falls back to simulated values from total handoffs.
 */

import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { createActor } from "../backend";
import { usePredictionEngineStore } from "../store/predictionEngineStore";
import type {
  FiscalImpactSummary,
  PredictionEngineSettings,
  RiskEvent,
} from "../types/predictionEngine";
import {
  dollarsSavedAtTouchpoint,
  stabilityProbability,
} from "../utils/riskCalculator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert backend bigint fields to JS numbers for the store */
function backendStateToSettings(
  raw: import("../backend").PredictionEngineState,
): PredictionEngineSettings {
  return {
    weatherToggle: raw.weatherToggle,
    paydayToggle: raw.paydayToggle,
    stressToggle: raw.stressToggle,
    potencyToggle: raw.potencyToggle,
    sensitivitySlider: Number(raw.sensitivitySlider),
    avgDailyHandoffCount: Number(raw.avgDailyHandoffCount),
    simulationEnabled: raw.simulationEnabled,
  };
}

/** Convert store settings back to backend bigint format */
function settingsToBackendState(
  s: PredictionEngineSettings,
): import("../backend").PredictionEngineState {
  return {
    weatherToggle: s.weatherToggle,
    paydayToggle: s.paydayToggle,
    stressToggle: s.stressToggle,
    potencyToggle: s.potencyToggle,
    sensitivitySlider: BigInt(Math.round(s.sensitivitySlider)),
    avgDailyHandoffCount: BigInt(Math.round(s.avgDailyHandoffCount)),
    simulationEnabled: s.simulationEnabled,
  };
}

/** Convert backend RiskEvent (bigint timestamps) to store RiskEvent (number) */
function backendEventToRiskEvent(
  ev: import("../backend").RiskEvent,
): RiskEvent {
  return {
    id: ev.id,
    name: ev.name,
    startDate: Number(ev.startDate),
    endDate: Number(ev.endDate),
    affectedZIPs: ev.affectedZIPs,
    multiplier: ev.multiplier,
    fileUrl: ev.fileUrl,
    createdAt: Number(ev.createdAt),
  };
}

/** Convert store RiskEvent back to backend format */
function riskEventToBackend(ev: RiskEvent): import("../backend").RiskEvent {
  return {
    id: ev.id,
    name: ev.name,
    startDate: BigInt(ev.startDate),
    endDate: BigInt(ev.endDate),
    affectedZIPs: ev.affectedZIPs,
    multiplier: ev.multiplier,
    fileUrl: ev.fileUrl,
    createdAt: BigInt(ev.createdAt),
  };
}

/**
 * Compute a simulated FiscalImpactSummary from total handoffs.
 * Used as fallback when the backend getFiscalData function isn't available.
 */
function simulateFiscalFromHandoffs(
  totalHandoffs: number,
): FiscalImpactSummary {
  // Distribute handoffs across agents (avg ~4 touchpoints per agent)
  const avgTouchpoints = 4;
  const agentCount = Math.max(1, Math.round(totalHandoffs / avgTouchpoints));

  let dollarsSaved = 0;
  let stabilizedAgents = 0;

  // Simulate agents cycling through touchpoints
  for (let a = 0; a < agentCount; a++) {
    // Each agent gets a random touchpoint count 1–7 (biased toward completion)
    const n = Math.min(7, Math.ceil(Math.random() * 8));
    for (let t = 1; t <= n; t++) {
      dollarsSaved += dollarsSavedAtTouchpoint(t);
    }
    if (n >= 7) stabilizedAgents++;
  }

  const livesSaved = totalHandoffs * 0.08;
  const communityReinvestmentFund = dollarsSaved * 0.15;
  const stabilityPipelinePercent =
    agentCount > 0 ? (stabilizedAgents / agentCount) * 100 : 0;

  return {
    totalDollarsSaved: dollarsSaved,
    livesSaved,
    communityReinvestmentFund,
    stabilizedAgents,
    stabilityPipelinePercent,
  };
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function usePredictionEngine() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  const {
    settings,
    events,
    weatherRisk,
    socialStressMap,
    weatherAlerts,
    isLoading,
    updateSettings: storeUpdateSettings,
    setEvents,
    setWeatherRisk,
    setSocialStress,
    setWeatherAlerts,
    setIsLoading,
  } = usePredictionEngineStore();

  const enabled = !!actor && !isFetching;

  // ── 1. Fetch engine settings from backend ─────────────────────────────────
  useQuery({
    queryKey: ["predictionEngineState"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const raw = await actor.getPredictionEngineState();
        const mapped = backendStateToSettings(raw);
        storeUpdateSettings(mapped);
        return mapped;
      } catch (err) {
        console.error(
          "[usePredictionEngine] getPredictionEngineState failed:",
          err,
        );
        return null;
      }
    },
    enabled,
    staleTime: 60_000,
  });

  // ── 2. Fetch risk events ───────────────────────────────────────────────────
  useQuery({
    queryKey: ["predictionRiskEvents"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const raw = await actor.getRiskEvents();
        const mapped = raw.map(backendEventToRiskEvent);
        setEvents(mapped);
        return mapped;
      } catch (err) {
        console.error("[usePredictionEngine] getRiskEvents failed:", err);
        return [];
      }
    },
    enabled,
    staleTime: 30_000,
  });

  // ── 3. Fetch weather risk ─────────────────────────────────────────────────
  useQuery({
    queryKey: ["predictionWeatherRisk"],
    queryFn: async () => {
      if (!actor) return 1.0;
      try {
        const risk = await actor.getWeatherRisk();
        setWeatherRisk(risk);
        return risk;
      } catch (err) {
        console.error("[usePredictionEngine] getWeatherRisk failed:", err);
        return 1.0;
      }
    },
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });

  // ── 4. Fetch social stress baseline ───────────────────────────────────────
  useQuery({
    queryKey: ["predictionSocialStress"],
    queryFn: async () => {
      if (!actor) return {};
      try {
        const pairs = await actor.getSocialStressBaseline();
        const map: Record<string, number> = {};
        for (const [zip, multiplier] of pairs) {
          map[zip] = multiplier;
        }
        setSocialStress(map);
        return map;
      } catch (err) {
        console.error(
          "[usePredictionEngine] getSocialStressBaseline failed:",
          err,
        );
        return {};
      }
    },
    enabled,
    staleTime: 60 * 60_000,
    refetchInterval: 60 * 60_000,
  });

  // ── 5. Fetch weather alerts ───────────────────────────────────────────────
  useQuery({
    queryKey: ["predictionWeatherAlerts"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        const alerts = await actor.getWeatherAlerts();
        setWeatherAlerts(alerts);
        return alerts;
      } catch (err) {
        console.error("[usePredictionEngine] getWeatherAlerts failed:", err);
        return "";
      }
    },
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: PredictionEngineSettings) => {
      if (!actor) throw new Error("Not connected");
      await actor.setPredictionEngineState(settingsToBackendState(newSettings));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictionEngineState"] });
    },
    onError: (err) => {
      console.error(
        "[usePredictionEngine] setPredictionEngineState failed:",
        err,
      );
    },
  });

  const updateSettings = useCallback(
    async (partial: Partial<PredictionEngineSettings>) => {
      const merged = { ...settings, ...partial };
      storeUpdateSettings(partial);
      await saveSettingsMutation.mutateAsync(merged);
    },
    [settings, storeUpdateSettings, saveSettingsMutation],
  );

  const addEventMutation = useMutation({
    mutationFn: async (event: RiskEvent) => {
      if (!actor) throw new Error("Not connected");
      return actor.addRiskEvent(riskEventToBackend(event));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictionRiskEvents"] });
    },
  });

  const addEvent = useCallback(
    async (event: RiskEvent) => {
      const id = await addEventMutation.mutateAsync(event);
      setEvents([...events, { ...event, id }]);
    },
    [addEventMutation, events, setEvents],
  );

  const removeEventMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeRiskEvent(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictionRiskEvents"] });
    },
  });

  const removeEvent = useCallback(
    async (id: string) => {
      setEvents(events.filter((ev) => ev.id !== id));
      await removeEventMutation.mutateAsync(id);
    },
    [removeEventMutation, events, setEvents],
  );

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, event }: { id: string; event: RiskEvent }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateRiskEvent(id, riskEventToBackend(event));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictionRiskEvents"] });
    },
  });

  const updateEvent = useCallback(
    async (id: string, event: RiskEvent) => {
      setEvents(events.map((ev) => (ev.id === id ? event : ev)));
      await updateEventMutation.mutateAsync({ id, event });
    },
    [updateEventMutation, events, setEvents],
  );

  return {
    settings,
    events,
    weatherRisk,
    socialStressMap,
    weatherAlerts,
    isLoading,
    updateSettings,
    addEvent,
    removeEvent,
    updateEvent,
    isSavingSettings: saveSettingsMutation.isPending,
    isAddingEvent: addEventMutation.isPending,
    isRemovingEvent: removeEventMutation.isPending,
    isUpdatingEvent: updateEventMutation.isPending,
    setIsLoading,
  };
}

// ─── useFiscalImpact ──────────────────────────────────────────────────────────

/**
 * Polls the backend for fiscal impact data every 30 seconds.
 * Falls back to simulation from totalHandoffs if backend function is unavailable.
 * Updates predictionEngineStore.fiscalData on each successful fetch.
 */
export function useFiscalImpact() {
  const { actor, isFetching } = useActor(createActor);
  const { setFiscalData, fiscalData } = usePredictionEngineStore();
  const simulationRef = useRef<Map<string, number>>(new Map());
  const enabled = !!actor && !isFetching;

  // ── Backend fiscal data (with simulation fallback) ────────────────────────
  useQuery({
    queryKey: ["fiscalImpact"],
    queryFn: async (): Promise<FiscalImpactSummary> => {
      if (!actor) return fiscalData;

      // Try backend getFiscalData first
      try {
        const raw = await (
          actor as {
            getFiscalData?: () => Promise<{
              dollarsSaved: number;
              livesSaved: number;
              stabilizedAgents: bigint;
              stabilityPipelinePercent: number;
            }>;
          }
        ).getFiscalData?.();
        if (raw) {
          const result: FiscalImpactSummary = {
            totalDollarsSaved: raw.dollarsSaved,
            livesSaved: raw.livesSaved,
            communityReinvestmentFund: raw.dollarsSaved * 0.15,
            stabilizedAgents: Number(raw.stabilizedAgents),
            stabilityPipelinePercent: raw.stabilityPipelinePercent,
          };
          setFiscalData(result);
          return result;
        }
      } catch {
        // Expected — fallback to simulation
      }

      // Fallback: simulate from total handoffs
      try {
        const providers = await actor.getAllProviders();
        const totalHandoffs = providers.length * 3; // rough estimate
        const simulated = simulateFiscalFromHandoffs(totalHandoffs);
        setFiscalData(simulated);
        return simulated;
      } catch {
        return fiscalData;
      }
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  // ── Simulation engine: track agent touchpoints ────────────────────────────
  // Listen for handoff events dispatched by useActivitySimulation
  useEffect(() => {
    const handleHandoff = (e: Event) => {
      const detail = (
        e as CustomEvent<{ city: string; index: number; zip?: string }>
      ).detail;
      const agentId = `${detail.city}_${detail.index}`;
      const current = simulationRef.current.get(agentId) ?? 0;
      const next = Math.min(7, current + 1);
      simulationRef.current.set(agentId, next);

      const earned = dollarsSavedAtTouchpoint(next);
      const isStabilized = next >= 7;

      // Read current and increment
      const store = usePredictionEngineStore.getState();
      const current_fiscal = store.fiscalData;
      const newDollarsSaved = current_fiscal.totalDollarsSaved + earned;
      const newStabilized = isStabilized
        ? current_fiscal.stabilizedAgents + 1
        : current_fiscal.stabilizedAgents;
      const totalAgents = simulationRef.current.size;
      const newPipelinePercent =
        totalAgents > 0 ? (newStabilized / totalAgents) * 100 : 0;

      store.setFiscalData({
        totalDollarsSaved: newDollarsSaved,
        livesSaved: current_fiscal.livesSaved + 0.002,
        communityReinvestmentFund: newDollarsSaved * 0.15,
        stabilizedAgents: newStabilized,
        stabilityPipelinePercent: newPipelinePercent,
      });

      // Fire jackpot event when agent hits touchpoint 7
      if (isStabilized) {
        const zip = detail.zip ?? detail.city;
        window.dispatchEvent(
          new CustomEvent("sentinel:jackpot", { detail: { agentId, zip } }),
        );
      }
    };

    window.addEventListener("sentinel:handoff", handleHandoff);
    return () => window.removeEventListener("sentinel:handoff", handleHandoff);
  }, []);

  return {
    fiscalData,
    simulationRef,
    stabilityProbability,
  };
}
