/**
 * PredictionEnginePanel — Full-width admin panel for the Sentinel
 * Prediction Engine. Sections:
 *   1. Weather Sentinel Status
 *   2. Rules & Toggles (4 toggles + sensitivity slider)
 *   3. Gaussian Curve Visualizer
 *   4. Risk Factor Manager (custom events)
 *   5. Simulation Controls
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Brain,
  CalendarClock,
  CloudLightning,
  FlaskConical,
  Loader2,
  MapPin,
  Plus,
  Shield,
  ToggleRight,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { createActor } from "../backend";
import type { PredictionEngineState, RiskEvent } from "../backend";
import { usePredictionEngineStore } from "../store/predictionEngineStore";
import {
  expectedHandoffs,
  generateGaussianCurveData,
  getPaydayMultiplier,
  peakHour,
  riskScoreToColor,
} from "../utils/riskCalculator";
import { ImpactOdometer } from "./ImpactOdometer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMs(bigintNs: bigint): number {
  return Number(bigintNs) / 1_000_000;
}

function msToNs(ms: number): bigint {
  return BigInt(Math.round(ms * 1_000_000));
}

function settingsToBackend(s: {
  weatherToggle: boolean;
  paydayToggle: boolean;
  stressToggle: boolean;
  potencyToggle: boolean;
  sensitivitySlider: number;
  avgDailyHandoffCount: number;
  simulationEnabled: boolean;
}): PredictionEngineState {
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

function eventStatus(
  startMs: number,
  endMs: number,
): "Active" | "Upcoming" | "Expired" {
  const now = Date.now();
  if (now > endMs) return "Expired";
  if (now < startMs) return "Upcoming";
  return "Active";
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const HOUR_LABELS: Record<number, string> = {
  0: "Midnight",
  6: "6am",
  12: "Noon",
  18: "6pm",
  23: "11pm",
};

const RISK_LEVELS = [
  { label: "Low (1.25×)", value: 1.25 },
  { label: "Medium (1.5×)", value: 1.5 },
  { label: "High (2.0×)", value: 2.0 },
];

// ─── Demo scenario ────────────────────────────────────────────────────────────

const DEMO_SETTINGS = {
  weatherToggle: true,
  paydayToggle: true,
  stressToggle: true,
  potencyToggle: false,
  sensitivitySlider: 75,
  avgDailyHandoffCount: 12,
  simulationEnabled: true,
};

function buildDemoRiskEvent(): RiskEvent {
  const now = new Date();
  // Current month's 15th
  const start = new Date(now.getFullYear(), now.getMonth(), 15, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), 16, 23, 59, 59);
  return {
    id: "demo-cuyahoga-cold-payday",
    name: "Cuyahoga County Cold Snap + Payday",
    startDate: msToNs(start.getTime()),
    endDate: msToNs(end.getTime()),
    affectedZIPs: ["44105", "44115", "44120", "44128", "44130"],
    multiplier: 2.0,
    fileUrl: "",
    createdAt: msToNs(Date.now()),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-navy/60">
        <span className="text-live-green">{icon}</span>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
      <span className="text-live-green mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={title}
        className="data-[state=checked]:bg-live-green mt-0.5"
      />
    </div>
  );
}

// ─── Weather Sentinel Status ──────────────────────────────────────────────────

function WeatherSentinelSection({
  weatherRisk,
  weatherAlerts,
  isLoading,
}: {
  weatherRisk: number;
  weatherAlerts: string;
  isLoading: boolean;
}) {
  const color = riskScoreToColor(weatherRisk);

  // 7-hour simulated trend window
  const trendData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const h = (now.getHours() - 6 + i + 24) % 24;
      // Slightly vary around current risk for demo realism
      const jitter = 1 + Math.sin(i * 0.9 + 1.2) * 0.06;
      return {
        label: `${h}:00`,
        risk: Math.max(
          1.0,
          Number.parseFloat((weatherRisk * jitter).toFixed(2)),
        ),
      };
    });
  }, [weatherRisk]);

  return (
    <SectionCard
      icon={<CloudLightning className="w-4 h-4" />}
      title="Weather Sentinel Status"
    >
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1 space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching NWS data…
            </div>
          ) : (
            <>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${color.bg} ${color.text}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    weatherRisk >= 1.25
                      ? "bg-red-400 animate-pulse"
                      : weatherRisk >= 1.1
                        ? "bg-yellow-400"
                        : "bg-live-green"
                  }`}
                />
                {weatherRisk >= 1.25
                  ? "HIGH RISK — Storm Alert"
                  : weatherRisk >= 1.1
                    ? "Elevated — Cold Snap"
                    : "Normal Conditions"}
                <span className="opacity-70 font-normal">
                  {weatherRisk.toFixed(2)}×
                </span>
              </div>
              {weatherAlerts && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{weatherAlerts}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Source: National Weather Service — NE Ohio
              </p>
            </>
          )}
        </div>

        <div className="flex-1 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="weatherGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.62 0.17 155)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.62 0.17 155)"
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.26 0.012 240)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "oklch(0.65 0.01 220)" }}
              />
              <YAxis
                domain={[0.9, "auto"]}
                tick={{ fontSize: 9, fill: "oklch(0.65 0.01 220)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.008 240)",
                  border: "1px solid oklch(0.26 0.012 240)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="oklch(0.62 0.17 155)"
                strokeWidth={2}
                fill="url(#weatherGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Gaussian Curve Visualizer ────────────────────────────────────────────────

function GaussianCurveSection({
  settings,
}: {
  settings: {
    weatherToggle: boolean;
    paydayToggle: boolean;
    stressToggle: boolean;
    potencyToggle: boolean;
    sensitivitySlider: number;
    avgDailyHandoffCount: number;
  };
}) {
  const curveData = useMemo(
    () => generateGaussianCurveData(settings),
    [settings],
  );
  const peak = peakHour(curveData);
  const handoffs = expectedHandoffs(curveData, settings.avgDailyHandoffCount);

  // Compute composite multiplier for the label
  let mult = 1.0;
  if (settings.weatherToggle) mult *= 1.1;
  if (settings.paydayToggle) mult *= getPaydayMultiplier();
  if (settings.stressToggle) mult *= 1.05;
  if (settings.potencyToggle) mult *= 1.6;
  const riskColor = riskScoreToColor(mult);

  const chartData = curveData.map((pt) => ({
    hour: pt.hour,
    label: HOUR_LABELS[pt.hour] ?? `${pt.hour}:00`,
    probability: pt.probability,
  }));

  return (
    <SectionCard
      icon={<TrendingUp className="w-4 h-4" />}
      title="Predicted Activity Window — 24-Hour Forecast"
    >
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.62 0.17 155)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.62 0.17 155)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.26 0.012 240)"
            />
            <XAxis
              dataKey="hour"
              tickFormatter={(h: number) => HOUR_LABELS[h] ?? `${h}`}
              tick={{ fontSize: 10, fill: "oklch(0.65 0.01 220)" }}
              ticks={[0, 6, 12, 18, 23]}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 10, fill: "oklch(0.65 0.01 220)" }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Probability"]}
              labelFormatter={(h: number) => HOUR_LABELS[h] ?? `${h}:00`}
              contentStyle={{
                background: "oklch(0.18 0.008 240)",
                border: "1px solid oklch(0.26 0.012 240)",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="probability"
              stroke="oklch(0.62 0.17 155)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "oklch(0.62 0.17 155)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-card border border-live-green/30 text-foreground text-xs font-medium">
          <Activity className="w-3 h-3 mr-1 text-live-green" />
          Peak Hour:{" "}
          {peak < 12 ? `${peak}am` : peak === 12 ? "Noon" : `${peak - 12}pm`}
        </Badge>
        <Badge className="bg-card border border-border text-foreground text-xs font-medium">
          <Users className="w-3 h-3 mr-1 text-muted-foreground" />
          Expected Handoffs Today: {handoffs}
        </Badge>
        <Badge
          className={`text-xs font-medium border ${riskColor.bg} ${riskColor.text} border-current/20`}
        >
          <Shield className="w-3 h-3 mr-1" />
          Risk Level: {riskColor.label}
        </Badge>
      </div>
    </SectionCard>
  );
}

// ─── Risk Factor Manager ──────────────────────────────────────────────────────

function RiskFactorManager({
  events,
  onAdd,
  onRemove,
  isAdding,
}: {
  events: RiskEvent[];
  onAdd: (event: RiskEvent) => void;
  onRemove: (id: string) => void;
  isAdding: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    affectedZIPs: "",
    multiplier: 1.25,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Please fill in Event Name, Start Date, and End Date.");
      return;
    }
    const startMs = new Date(form.startDate).getTime();
    const endMs = new Date(form.endDate).getTime();
    if (endMs <= startMs) {
      toast.error("End date must be after start date.");
      return;
    }
    const zips = form.affectedZIPs
      .split(",")
      .map((z) => z.trim())
      .filter(Boolean);
    onAdd({
      id: crypto.randomUUID(),
      name: form.name,
      startDate: msToNs(startMs),
      endDate: msToNs(endMs),
      affectedZIPs: zips,
      multiplier: form.multiplier,
      fileUrl: "",
      createdAt: msToNs(Date.now()),
    });
    setForm({
      name: "",
      startDate: "",
      endDate: "",
      affectedZIPs: "",
      multiplier: 1.25,
    });
  };

  return (
    <SectionCard
      icon={<CalendarClock className="w-4 h-4" />}
      title="Risk Factor Manager"
    >
      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Event Name</Label>
            <Input
              placeholder="e.g. Cuyahoga County Fair"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-card border-border text-foreground"
              data-ocid="prediction.event_name"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Risk Level</Label>
            <select
              value={form.multiplier}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  multiplier: Number.parseFloat(e.target.value),
                }))
              }
              className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="prediction.event_risk_level"
            >
              {RISK_LEVELS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className="bg-card border-border text-foreground"
              data-ocid="prediction.event_start_date"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">End Date</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
              className="bg-card border-border text-foreground"
              data-ocid="prediction.event_end_date"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Affected ZIPs (comma-separated)
          </Label>
          <Input
            placeholder="44105, 44115, 44120"
            value={form.affectedZIPs}
            onChange={(e) =>
              setForm((f) => ({ ...f, affectedZIPs: e.target.value }))
            }
            className="bg-card border-border text-foreground"
            data-ocid="prediction.event_zips"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground italic">
            File upload for event flyers coming in the next update.
          </p>
          <Button
            type="submit"
            disabled={isAdding}
            className="bg-live-green text-navy font-semibold hover:bg-live-green/90 min-h-[36px]"
            data-ocid="prediction.add_event_button"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            Add Event
          </Button>
        </div>
      </form>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-4">
          No custom risk events added yet.
        </p>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => {
            const startMs = toMs(ev.startDate);
            const endMs = toMs(ev.endDate);
            const status = eventStatus(startMs, endMs);
            return (
              <div
                key={ev.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20"
                data-ocid={`prediction.event_item.${ev.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">
                      {ev.name}
                    </span>
                    <Badge
                      className={`text-xs ${
                        status === "Active"
                          ? "bg-live-green/20 text-live-green border-live-green/30"
                          : status === "Upcoming"
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-muted text-muted-foreground border-border"
                      } border`}
                    >
                      {status}
                    </Badge>
                    <Badge className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {ev.multiplier}×
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(startMs)} → {formatDate(endMs)}
                    {ev.affectedZIPs.length > 0 && (
                      <span className="ml-2">
                        <MapPin className="w-3 h-3 inline mr-0.5" />
                        {ev.affectedZIPs.join(", ")}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(ev.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                  aria-label={`Remove ${ev.name}`}
                  data-ocid={`prediction.event_delete.${ev.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Main Panel Component ─────────────────────────────────────────────────────

export function PredictionEnginePanel() {
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();

  const { settings, updateSettings } = usePredictionEngineStore();

  // Local toggle state — starts from store, syncs to backend on change
  const [localSettings, setLocalSettings] = useState(settings);
  const [potencyAlertText, setPotencyAlertText] = useState("");
  const [potencyZIPs, setPotencyZIPs] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Keep local in sync when store updates from backend fetch
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Fetch engine state from backend
  const hasAppliedDemo = useRef(false);

  useQuery({
    queryKey: ["predictionEngineState"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const raw = await actor.getPredictionEngineState();
        const mapped = {
          weatherToggle: raw.weatherToggle,
          paydayToggle: raw.paydayToggle,
          stressToggle: raw.stressToggle,
          potencyToggle: raw.potencyToggle,
          sensitivitySlider: Number(raw.sensitivitySlider),
          avgDailyHandoffCount: Number(raw.avgDailyHandoffCount),
          simulationEnabled: raw.simulationEnabled,
        };
        updateSettings(mapped);

        // Auto-apply demo scenario if all toggles are off and sensitivity is default
        // (blank/fresh canister state). Only fires once per session.
        if (
          !hasAppliedDemo.current &&
          !raw.weatherToggle &&
          !raw.paydayToggle &&
          !raw.stressToggle &&
          !raw.potencyToggle &&
          Number(raw.sensitivitySlider) === 50
        ) {
          hasAppliedDemo.current = true;
          setLocalSettings({ ...mapped, ...DEMO_SETTINGS });
          updateSettings(DEMO_SETTINGS);
          try {
            await actor.setPredictionEngineState(
              settingsToBackend({ ...mapped, ...DEMO_SETTINGS }),
            );
          } catch {
            /* admin-only — silently skip if not admin */
          }
        }

        return mapped;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  // Weather data
  const { data: weatherRisk = 1.0, isLoading: weatherLoading } = useQuery({
    queryKey: ["predictionWeatherRisk"],
    queryFn: async () => {
      if (!actor) return 1.0;
      try {
        return await actor.getWeatherRisk();
      } catch {
        return 1.0;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });

  const { data: weatherAlerts = "" } = useQuery({
    queryKey: ["predictionWeatherAlerts"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        return await actor.getWeatherAlerts();
      } catch {
        return "";
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });

  const hasSeededDemoEvent = useRef(false);

  // Risk events
  const { data: riskEvents = [] } = useQuery({
    queryKey: ["predictionRiskEvents"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const events = await actor.getRiskEvents();
        // Seed a demo event if none exist (fires once per session)
        if (events.length === 0 && !hasSeededDemoEvent.current) {
          hasSeededDemoEvent.current = true;
          try {
            await actor.addRiskEvent(buildDemoRiskEvent());
            qc.invalidateQueries({ queryKey: ["predictionRiskEvents"] });
          } catch {
            /* admin-only — silently skip */
          }
        }
        return events;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });

  const addEventMutation = useMutation({
    mutationFn: async (ev: RiskEvent) => {
      if (!actor) throw new Error("Not connected");
      return actor.addRiskEvent(ev);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictionRiskEvents"] });
      toast.success("Risk event added to the Sentinel overlay.");
    },
    onError: () => toast.error("Failed to add event. Admin access required."),
  });

  const removeEventMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeRiskEvent(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictionRiskEvents"] });
      toast.success("Risk event removed.");
    },
    onError: () => toast.error("Failed to remove event."),
  });

  async function saveSettings(patch: Partial<typeof localSettings>) {
    const merged = { ...localSettings, ...patch };
    setLocalSettings(merged);
    updateSettings(patch);
    setIsSaving(true);
    try {
      if (actor) {
        await actor.setPredictionEngineState(settingsToBackend(merged));
        qc.invalidateQueries({ queryKey: ["predictionEngineState"] });
      }
    } catch {
      toast.error("Settings not saved — admin access required.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6" data-ocid="prediction_engine_panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-live-green/10 border border-live-green/30">
            <Brain className="w-5 h-5 text-live-green" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">
              Sentinel Prediction Engine
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time risk intelligence powered by NWS, Census ACS & payday
              logic
            </p>
          </div>
        </div>
        {isSaving && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving…
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-xs font-semibold border-live-green/40 text-live-green hover:bg-live-green/10"
          onClick={() => saveSettings(DEMO_SETTINGS)}
          disabled={isSaving}
          data-ocid="prediction.reset_demo_button"
        >
          Reset to Demo Mode
        </Button>
      </div>

      {/* Section 1 — Weather Sentinel */}
      <WeatherSentinelSection
        weatherRisk={weatherRisk}
        weatherAlerts={weatherAlerts}
        isLoading={weatherLoading}
      />

      {/* Section 2 — Rules & Toggles */}
      <SectionCard
        icon={<ToggleRight className="w-4 h-4" />}
        title="Rules & Toggles"
      >
        <div className="space-y-1">
          <ToggleRow
            icon={<CloudLightning className="w-4 h-4" />}
            title="Weather Sentinel"
            description="Use NWS weather data to elevate risk in cold or storm conditions (+25% multiplier)"
            checked={localSettings.weatherToggle}
            onCheckedChange={(v) => saveSettings({ weatherToggle: v })}
            data-ocid="prediction.toggle_weather"
          />
          <ToggleRow
            icon={<CalendarClock className="w-4 h-4" />}
            title="Payday Cycle"
            description="1st and 15th of month, Friday evenings — trigger +30–40% risk elevation"
            checked={localSettings.paydayToggle}
            onCheckedChange={(v) => saveSettings({ paydayToggle: v })}
            data-ocid="prediction.toggle_payday"
          />
          <ToggleRow
            icon={<Users className="w-4 h-4" />}
            title="Social Stress Baseline"
            description="Apply 1.15× multiplier to high divorce/separation rate ZIPs from Census ACS S1201"
            checked={localSettings.stressToggle}
            onCheckedChange={(v) => saveSettings({ stressToggle: v })}
            data-ocid="prediction.toggle_stress"
          />
          <ToggleRow
            icon={<FlaskConical className="w-4 h-4" />}
            title="Potency Alert — MANUAL OVERRIDE"
            description="Apply 2.0× lethality multiplier. Enter alert details below when activated."
            checked={localSettings.potencyToggle}
            onCheckedChange={(v) => saveSettings({ potencyToggle: v })}
            data-ocid="prediction.toggle_potency"
          />
        </div>

        {localSettings.potencyToggle && (
          <div className="mt-4 p-4 rounded-xl border border-destructive/40 bg-destructive/10 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">
                Potency Alert Active — 2.0× Lethality Multiplier
              </span>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Alert Details
              </Label>
              <Input
                placeholder="e.g. Xylazine detected in Cuyahoga County, ZIP 44105"
                value={potencyAlertText}
                onChange={(e) => setPotencyAlertText(e.target.value)}
                className="bg-card border-destructive/40 text-foreground"
                data-ocid="prediction.potency_alert_text"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Affected ZIPs (comma-separated)
              </Label>
              <Input
                placeholder="44105, 44115"
                value={potencyZIPs}
                onChange={(e) => setPotencyZIPs(e.target.value)}
                className="bg-card border-destructive/40 text-foreground"
                data-ocid="prediction.potency_zips"
              />
            </div>
          </div>
        )}

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground">
              Risk Sensitivity
            </Label>
            <span className="text-sm font-mono text-live-green">
              {localSettings.sensitivitySlider}
            </span>
          </div>
          <Slider
            value={[localSettings.sensitivitySlider]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) =>
              setLocalSettings((s) => ({ ...s, sensitivitySlider: v }))
            }
            onValueCommit={([v]) => saveSettings({ sensitivitySlider: v })}
            className="w-full"
            data-ocid="prediction.sensitivity_slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground select-none">
            <span>Off</span>
            <span>25</span>
            <span>Normal (50)</span>
            <span>75</span>
            <span>Max</span>
          </div>
        </div>
      </SectionCard>

      {/* Section 3 — Gaussian Curve */}
      <GaussianCurveSection settings={localSettings} />

      {/* Section 3b — Fiscal Impact */}
      <SectionCard
        icon={<TrendingUp className="w-4 h-4" />}
        title="Fiscal Impact Engine"
      >
        <ImpactOdometer
          sensitivity={localSettings.sensitivitySlider}
          accelerated={localSettings.potencyToggle}
        />

        {/* 7-Attempts Model mini-table */}
        <div className="mt-6 rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-navy/60 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              7-Attempts Persistence Model
            </p>
          </div>
          <div className="divide-y divide-border">
            {[
              {
                n: 1,
                stability: "15%",
                saved: "$25,000",
                note: "Cost avoidance — ER/EMS prevented",
                highlight: false,
              },
              {
                n: 3,
                stability: "39%",
                saved: "$75,000",
                note: "3× cost avoidance accumulated",
                highlight: false,
              },
              {
                n: 7,
                stability: "68%",
                saved: "$120,000+",
                note: "$45k community ROI unlocked",
                highlight: true,
              },
            ].map((row) => (
              <div
                key={row.n}
                className="flex items-center gap-3 px-4 py-3"
                style={
                  row.highlight ? { background: "oklch(0.15 0.05 155)" } : {}
                }
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                  style={
                    row.highlight
                      ? {
                          background: "oklch(0.62 0.17 155)",
                          color: "oklch(0.10 0.04 240)",
                        }
                      : {
                          background: "oklch(0.18 0.03 240)",
                          color: "oklch(0.72 0.03 225)",
                        }
                  }
                >
                  {row.n}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: row.highlight ? "oklch(0.88 0.12 155)" : undefined,
                    }}
                  >
                    Touchpoint {row.n} — {row.stability} stability
                  </p>
                  <p className="text-xs text-muted-foreground">{row.note}</p>
                </div>
                <Badge
                  className="shrink-0 text-xs font-bold"
                  style={
                    row.highlight
                      ? {
                          background: "oklch(0.62 0.17 155)",
                          color: "oklch(0.10 0.04 240)",
                          border: "none",
                        }
                      : {
                          background: "oklch(0.18 0.03 240)",
                          color: "oklch(0.72 0.03 225)",
                        }
                  }
                >
                  {row.saved}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Section 4 — Risk Factor Manager */}
      <RiskFactorManager
        events={riskEvents}
        onAdd={(ev) => addEventMutation.mutate(ev)}
        onRemove={(id) => removeEventMutation.mutate(id)}
        isAdding={addEventMutation.isPending}
      />

      {/* Section 5 — Simulation Controls */}
      <SectionCard
        icon={<Activity className="w-4 h-4" />}
        title="Simulation Controls"
      >
        <div className="space-y-4">
          <ToggleRow
            icon={<Brain className="w-4 h-4" />}
            title="Activity Simulation"
            description="Simulated warm handoff notifications appear in the bottom-left corner to demonstrate platform engagement."
            checked={localSettings.simulationEnabled}
            onCheckedChange={(v) => saveSettings({ simulationEnabled: v })}
            data-ocid="prediction.toggle_simulation"
          />
          <div className="space-y-1.5">
            <Label
              htmlFor="avgHandoffs"
              className="text-sm font-medium text-foreground"
            >
              Average Daily Handoff Count
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="avgHandoffs"
                type="number"
                min={1}
                max={50}
                value={localSettings.avgDailyHandoffCount}
                onChange={(e) =>
                  setLocalSettings((s) => ({
                    ...s,
                    avgDailyHandoffCount: Math.max(
                      1,
                      Math.min(50, Number.parseInt(e.target.value) || 12),
                    ),
                  }))
                }
                onBlur={() =>
                  saveSettings({
                    avgDailyHandoffCount: localSettings.avgDailyHandoffCount,
                  })
                }
                className="w-24 bg-card border-border text-foreground"
                data-ocid="prediction.avg_handoffs_input"
              />
              <p className="text-xs text-muted-foreground">
                Notifications distribute throughout the day weighted toward the
                evening peak window (5–10pm ET).
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
