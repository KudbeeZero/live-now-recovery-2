import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AdminSettings } from "../backend";
import { createActor } from "../backend";

const DEFAULT_SETTINGS: AdminSettings = {
  emergencyBroadcastEnabled: false,
  emergencyBroadcastMessage: "",
  maintenanceModeEnabled: false,
  sentinelSensitivity: "Medium",
  autoApproveProviders: false,
  notifyOnNewProvider: true,
  notifyOnNewVolunteer: true,
  notifyOnNewReport: true,
  notifyOnNewCredential: false,
};

function useAdminSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminSettings>({
    queryKey: ["adminSettings", "full"],
    queryFn: async () => {
      if (!actor) return DEFAULT_SETTINGS;
      try {
        return await actor.getAdminSettings();
      } catch {
        return DEFAULT_SETTINGS;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

function useSaveAdminSettings() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: AdminSettings) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateAdminSettings(settings);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminSettings"] });
    },
  });
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-card rounded-2xl border border-border p-6 space-y-5"
      data-ocid="admin.settings.section"
    >
      <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  ocid,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  ocid: string;
}) {
  const id = `toggle-${ocid}`;
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label
          htmlFor={id}
          className="text-sm font-semibold text-foreground cursor-pointer"
        >
          {label}
        </label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        data-ocid={ocid}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          checked ? "bg-primary" : "bg-muted border border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Checkbox row ─────────────────────────────────────────────────────────────
function CheckboxRow({
  id,
  label,
  description,
  checked,
  onChange,
  ocid,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  ocid: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-ocid={ocid}
        className="mt-0.5 w-4 h-4 rounded border-input accent-primary cursor-pointer shrink-0"
      />
      <label htmlFor={id} className="cursor-pointer">
        <span className="text-sm font-semibold text-foreground block">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </label>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function AdminSettingsPage() {
  const { data: saved, isLoading } = useAdminSettings();
  const saveMutation = useSaveAdminSettings();

  const [local, setLocal] = useState<AdminSettings>(DEFAULT_SETTINGS);

  // Sync local state once backend data arrives
  useEffect(() => {
    if (saved) setLocal(saved);
  }, [saved]);

  function set<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    try {
      await saveMutation.mutateAsync(local);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background px-4 py-10 max-w-2xl mx-auto space-y-6"
        data-ocid="admin.settings.loading_state"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-background px-4 py-10"
      data-ocid="admin.settings.page"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure platform behavior and notifications
            </p>
          </div>
        </div>

        {/* Section 1 — Platform Alerts */}
        <Section title="Platform Alerts">
          <ToggleRow
            label="Emergency Broadcast"
            description="Show a site-wide banner to all visitors"
            checked={local.emergencyBroadcastEnabled}
            onChange={(v) => set("emergencyBroadcastEnabled", v)}
            ocid="admin.settings.emergency_broadcast_toggle"
          />
          {local.emergencyBroadcastEnabled && (
            <div>
              <label
                htmlFor="broadcast-msg"
                className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider"
              >
                Broadcast Message
              </label>
              <input
                id="broadcast-msg"
                type="text"
                value={local.emergencyBroadcastMessage}
                onChange={(e) =>
                  set("emergencyBroadcastMessage", e.target.value)
                }
                placeholder="Enter broadcast message…"
                className="w-full min-h-[44px] rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                data-ocid="admin.settings.broadcast_message_input"
              />
            </div>
          )}
          <ToggleRow
            label="Maintenance Mode"
            description="Show a maintenance banner to all visitors"
            checked={local.maintenanceModeEnabled}
            onChange={(v) => set("maintenanceModeEnabled", v)}
            ocid="admin.settings.maintenance_toggle"
          />
        </Section>

        {/* Section 2 — Sentinel Engine */}
        <Section title="Sentinel Engine">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Risk Score Sensitivity
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Controls compound risk event thresholds
            </p>
            <fieldset
              className="inline-flex rounded-xl border border-border overflow-hidden m-0 p-0"
              aria-label="Sentinel sensitivity"
            >
              {(["Low", "Medium", "High"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => set("sentinelSensitivity", level)}
                  data-ocid={`admin.settings.sentinel_${level.toLowerCase()}`}
                  className={`px-5 py-2.5 text-sm font-semibold transition-colors min-h-[44px] ${
                    local.sentinelSensitivity === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted border-l border-border first:border-l-0"
                  }`}
                >
                  {level}
                </button>
              ))}
            </fieldset>
          </div>
        </Section>

        {/* Section 3 — Provider Management */}
        <Section title="Provider Management">
          <ToggleRow
            label="Auto-Approve Providers"
            description="Automatically verify new provider registrations (not recommended for production)"
            checked={local.autoApproveProviders}
            onChange={(v) => set("autoApproveProviders", v)}
            ocid="admin.settings.auto_approve_toggle"
          />
        </Section>

        {/* Section 4 — Email Notifications */}
        <Section title="Email Notifications">
          <p className="text-xs text-muted-foreground -mt-2">
            Select which events trigger an email notification to
            admin@livenowrecovery.org
          </p>
          <div className="space-y-4">
            <CheckboxRow
              id="notify-provider"
              label="New Provider Registration"
              description="Sent when a clinic or provider submits a new listing"
              checked={local.notifyOnNewProvider}
              onChange={(v) => set("notifyOnNewProvider", v)}
              ocid="admin.settings.notify_provider_checkbox"
            />
            <CheckboxRow
              id="notify-volunteer"
              label="New Volunteer Signup"
              description="Sent when someone registers as a volunteer or helper"
              checked={local.notifyOnNewVolunteer}
              onChange={(v) => set("notifyOnNewVolunteer", v)}
              ocid="admin.settings.notify_volunteer_checkbox"
            />
            <CheckboxRow
              id="notify-report"
              label="New Citizen Report"
              description="Sent when a community member submits an incident report"
              checked={local.notifyOnNewReport}
              onChange={(v) => set("notifyOnNewReport", v)}
              ocid="admin.settings.notify_report_checkbox"
            />
            <CheckboxRow
              id="notify-credential"
              label="Credential Earned"
              description="Sent when a user earns a soul-bound credential"
              checked={local.notifyOnNewCredential}
              onChange={(v) => set("notifyOnNewCredential", v)}
              ocid="admin.settings.notify_credential_checkbox"
            />
          </div>
        </Section>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            data-ocid="admin.settings.save_button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </main>
  );
}
