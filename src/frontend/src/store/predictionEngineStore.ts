/**
 * Zustand store for Prediction Engine settings.
 * Persists to localStorage so settings survive page reloads.
 * Also holds sentinel overlay runtime data (risk events, social stress, weather).
 * Also holds fiscal impact state (dollarsSaved, livesSaved, stabilizedAgents, etc.)
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FiscalImpactSummary,
  PredictionEngineSettings,
  RiskEvent,
} from "../types/predictionEngine";
import type { FrontendRiskEvent } from "../utils/riskCalculator";

interface PredictionEngineStoreState {
  settings: PredictionEngineSettings;
  updateSettings: (patch: Partial<PredictionEngineSettings>) => void;
  resetSettings: () => void;

  // ── Sentinel overlay runtime data ────────────────────────────────────────
  /** Live risk events from backend (converted to ms timestamps) */
  events: RiskEvent[];
  /** @deprecated use events — kept for map layer backward compat */
  riskEvents: FrontendRiskEvent[];
  /** ZIP → social stress multiplier from Census ACS */
  socialStressBaseline: Map<string, number>;
  /** ZIP → social stress multiplier (Record form for hook consumers) */
  socialStressMap: Record<string, number>;
  /** Global weather risk multiplier (1.0 = normal, 1.25 = cold/storm) */
  weatherRisk: number;
  /** @deprecated use weatherRisk */
  weatherRiskMultiplier: number;
  /** NWS alert text (empty = clear) */
  weatherAlerts: string;
  isLoading: boolean;

  setEvents: (events: RiskEvent[]) => void;
  setRiskEvents: (events: FrontendRiskEvent[]) => void;
  setSocialStress: (map: Record<string, number>) => void;
  setSocialStressBaseline: (data: [string, number][]) => void;
  setWeatherRisk: (risk: number) => void;
  setWeatherRiskMultiplier: (multiplier: number) => void;
  setWeatherAlerts: (alerts: string) => void;
  setIsLoading: (loading: boolean) => void;

  // ── Fiscal impact state (7-Attempts model) ───────────────────────────────
  fiscalData: FiscalImpactSummary;
  setFiscalData: (data: Partial<FiscalImpactSummary>) => void;
  resetFiscalData: () => void;
}

const DEFAULT_SETTINGS: PredictionEngineSettings = {
  weatherToggle: true,
  paydayToggle: true,
  stressToggle: false,
  potencyToggle: false,
  sensitivitySlider: 50,
  avgDailyHandoffCount: 12,
  simulationEnabled: true,
};

const DEFAULT_FISCAL: FiscalImpactSummary = {
  totalDollarsSaved: 0,
  livesSaved: 0,
  communityReinvestmentFund: 0,
  stabilizedAgents: 0,
  stabilityPipelinePercent: 0,
};

export const usePredictionEngineStore = create<PredictionEngineStoreState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((state) => ({
          settings: { ...state.settings, ...patch },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      // Sentinel runtime data (not persisted — fetched fresh from backend)
      events: [],
      riskEvents: [],
      socialStressBaseline: new Map(),
      socialStressMap: {},
      weatherRisk: 1.0,
      weatherRiskMultiplier: 1.0,
      weatherAlerts: "",
      isLoading: false,

      setEvents: (events) => set({ events }),
      setRiskEvents: (riskEvents) => set({ riskEvents }),
      setSocialStress: (map) =>
        set({
          socialStressMap: map,
          socialStressBaseline: new Map(Object.entries(map)),
        }),
      setSocialStressBaseline: (data) =>
        set({
          socialStressBaseline: new Map(data),
          socialStressMap: Object.fromEntries(data),
        }),
      setWeatherRisk: (risk) =>
        set({ weatherRisk: risk, weatherRiskMultiplier: risk }),
      setWeatherRiskMultiplier: (multiplier) =>
        set({ weatherRiskMultiplier: multiplier, weatherRisk: multiplier }),
      setWeatherAlerts: (alerts) => set({ weatherAlerts: alerts }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Fiscal impact
      fiscalData: DEFAULT_FISCAL,
      setFiscalData: (data) =>
        set((state) => ({
          fiscalData: { ...state.fiscalData, ...data },
        })),
      resetFiscalData: () => set({ fiscalData: DEFAULT_FISCAL }),
    }),
    {
      name: "prediction-engine-settings",
      // Persist settings AND fiscal data (so odometer survives page reload)
      partialize: (state) => ({
        settings: state.settings,
        fiscalData: state.fiscalData,
      }),
    },
  ),
);
