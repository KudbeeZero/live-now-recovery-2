import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  Lock,
  Plus,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import {
  useAllProviders,
  useCanisterState,
  useIsAdmin,
  useRegisterProvider,
  useToggleLive,
  useVerifyProvider,
} from "../hooks/useQueries";
import { isProviderStale, statusLabel } from "../utils/providerUtils";

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  MAT: "MAT Clinic",
  Narcan: "Narcan Distribution",
  ER: "Emergency Room",
};

const SEED_PROVIDERS = [
  // MAT Clinics
  {
    id: "seed-mat-001",
    name: "Signature Health – Cleveland",
    lat: 41.4849,
    lng: -81.7984,
    providerType: "MAT",
    inventory:
      "Buprenorphine/naloxone (Suboxone), Vivitrol injections, intake appointments available same week",
  },
  {
    id: "seed-mat-002",
    name: "FrontLine Service – Broadway",
    lat: 41.4578,
    lng: -81.6645,
    providerType: "MAT",
    inventory:
      "Suboxone, Subutex, sliding scale fees, walk-ins accepted Mon–Fri",
  },
  {
    id: "seed-mat-003",
    name: "Oriana House – Akron",
    lat: 41.0814,
    lng: -81.519,
    providerType: "MAT",
    inventory:
      "Buprenorphine, methadone, residential and outpatient MAT, peer support specialists on staff",
  },
  {
    id: "seed-mat-004",
    name: "Cornerstone of Recovery – Akron",
    lat: 41.057,
    lng: -81.5544,
    providerType: "MAT",
    inventory: "Suboxone, Vivitrol, telehealth MAT available, accepts Medicaid",
  },
  {
    id: "seed-mat-005",
    name: "Meridian Health Services – Youngstown",
    lat: 41.0891,
    lng: -80.6551,
    providerType: "MAT",
    inventory:
      "Buprenorphine/naloxone, outpatient MAT, behavioral health integration",
  },
  {
    id: "seed-mat-006",
    name: "Signature Health – Elyria",
    lat: 41.3683,
    lng: -82.1077,
    providerType: "MAT",
    inventory:
      "Suboxone, Vivitrol, same-day assessments, accepts most insurance and Medicaid",
  },
  // Narcan Distribution
  {
    id: "seed-narcan-001",
    name: "AIDS Taskforce of Greater Cleveland",
    lat: 41.5078,
    lng: -81.6621,
    providerType: "Narcan",
    inventory:
      "Naloxone kits available at no cost, no prescription required, overdose response training offered",
  },
  {
    id: "seed-narcan-002",
    name: "Community Health Center of Akron",
    lat: 41.08,
    lng: -81.4967,
    providerType: "Narcan",
    inventory:
      "Free naloxone kits, sharps disposal, harm reduction supplies, peer navigator on site",
  },
  {
    id: "seed-narcan-003",
    name: "Mahoning County Public Health",
    lat: 41.1119,
    lng: -80.728,
    providerType: "Narcan",
    inventory:
      "Naloxone kits (2-dose), fentanyl test strips, overdose education, walk-in hours Mon–Fri",
  },
  {
    id: "seed-narcan-004",
    name: "Stark County Health Dept – North Canton",
    lat: 40.8756,
    lng: -81.4234,
    providerType: "Narcan",
    inventory:
      "Free Narcan distribution, training classes weekly, no ID required",
  },
  {
    id: "seed-narcan-005",
    name: "Lorain County Health & Dentistry",
    lat: 41.4534,
    lng: -82.1824,
    providerType: "Narcan",
    inventory:
      "Naloxone kits, harm reduction counseling, referrals to MAT providers",
  },
  {
    id: "seed-narcan-006",
    name: "Quest Recovery – Canton Narcan Dist.",
    lat: 40.7735,
    lng: -81.3859,
    providerType: "Narcan",
    inventory:
      "Naloxone kits, recovery coaching, warm handoff to MAT available on request",
  },
  // Emergency Rooms
  {
    id: "seed-er-001",
    name: "MetroHealth Medical Center ER",
    lat: 41.4714,
    lng: -81.6997,
    providerType: "ER",
    inventory:
      "Naloxone administration, bridge buprenorphine prescription, warm handoff to MAT coordinator",
  },
  {
    id: "seed-er-002",
    name: "Cleveland Clinic Main Campus ER",
    lat: 41.5036,
    lng: -81.6203,
    providerType: "ER",
    inventory:
      "Overdose intervention, naloxone, ED-initiated buprenorphine, behavioral health consult",
  },
  {
    id: "seed-er-003",
    name: "Summa Health – Akron City Hospital ER",
    lat: 41.0839,
    lng: -81.5063,
    providerType: "ER",
    inventory:
      "Naloxone administration, bridge prescription, peer recovery specialist on duty",
  },
  {
    id: "seed-er-004",
    name: "St. Elizabeth Youngstown Hospital ER",
    lat: 41.1064,
    lng: -80.6639,
    providerType: "ER",
    inventory:
      "Overdose treatment, ED-initiated MAT, 72-hour bridge prescriptions available",
  },
  {
    id: "seed-er-005",
    name: "Aultman Hospital ER – Canton",
    lat: 40.782,
    lng: -81.4191,
    providerType: "ER",
    inventory:
      "Naloxone, withdrawal management, warm handoff to Stark County MAT providers",
  },
  {
    id: "seed-er-006",
    name: "UH Elyria Medical Center ER",
    lat: 41.37,
    lng: -82.1035,
    providerType: "ER",
    inventory:
      "Overdose intervention, bridge buprenorphine, referral to Signature Health Elyria",
  },
];

export function AdminPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: providers = [] } = useAllProviders();
  const { data: canisterState } = useCanisterState();
  const registerProvider = useRegisterProvider();
  const toggleLive = useToggleLive();
  const verifyProvider = useVerifyProvider();
  const { actor } = useActor(createActor);

  const [form, setForm] = useState({ id: "", name: "", lat: "", lng: "" });
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [seedProgress, setSeedProgress] = useState<{
    running: boolean;
    done: number;
    total: number;
    errors: string[];
  }>({ running: false, done: 0, total: 18, errors: [] });

  // Option 4 workaround: is_verified not on backend yet; use !isLive as proxy
  // Only show newly registered providers (not yet toggled live by admin)
  const pendingProviders = providers.filter((p) => !p.isLive);

  const handleApprove = async (id: string) => {
    setApprovingIds((prev) => new Set(prev).add(id));
    try {
      await verifyProvider.mutateAsync(id);
      toast.success("Provider approved — now live on map");
    } catch {
      toast.error("Approval failed. Admin access required.");
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerProvider.mutateAsync({
        id: form.id,
        name: form.name,
        lat: Number.parseFloat(form.lat),
        lng: Number.parseFloat(form.lng),
      });
      toast.success("Provider registered!");
      setForm({ id: "", name: "", lat: "", lng: "" });
    } catch {
      toast.error("Registration failed. Admin access required.");
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleLive.mutateAsync({ id, status: !current });
      toast.success(`Provider ${!current ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Toggle failed.");
    }
  };

  const handleSeedDemoData = async () => {
    if (!actor) return;
    setSeedProgress({
      running: true,
      done: 0,
      total: SEED_PROVIDERS.length,
      errors: [],
    });
    const errors: string[] = [];
    let done = 0;

    for (const p of SEED_PROVIDERS) {
      try {
        // Option 4: use 4-arg registerProvider (current backend schema)
        // verifyProvider and updateInventory not yet on canister
        await (actor as any).registerProvider(p.id, p.name, p.lat, p.lng);
        // After registering, toggle live so provider appears on map
        await (actor as any).toggleLive(p.id, true);
        done++;
        setSeedProgress((prev) => ({ ...prev, done }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${p.name}: ${msg}`);
        setSeedProgress((prev) => ({
          ...prev,
          errors: [...prev.errors, `${p.name}: ${msg}`],
        }));
      }
    }

    setSeedProgress((prev) => ({ ...prev, running: false }));
    if (errors.length === 0) {
      toast.success("All 18 Ohio providers seeded successfully!");
    } else {
      toast.warning(
        `Seeded ${done} of ${SEED_PROVIDERS.length} providers. ${errors.length} errors.`,
      );
    }
  };

  if (adminLoading || loginStatus === "logging-in") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (loginStatus !== "success" || !isAdmin) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
        data-ocid="admin.page"
      >
        <Lock className="w-12 h-12 text-muted-foreground" />
        <div className="text-center">
          <h1 className="text-xl font-bold text-navy mb-2">
            Admin Access Required
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in with Internet Identity to access admin controls.
          </p>
        </div>
        <Button
          onClick={() => login()}
          className="min-h-[44px] bg-action-blue hover:bg-action-blue/90 text-white"
          data-ocid="admin.primary_button"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const seedDone =
    seedProgress.done === SEED_PROVIDERS.length &&
    !seedProgress.running &&
    seedProgress.done > 0;
  const seedPercent = Math.round(
    (seedProgress.done / seedProgress.total) * 100,
  );

  return (
    <main className="min-h-screen" data-ocid="admin.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              Admin
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Admin <span className="text-live-green">Panel</span>
          </h1>
          <p className="text-on-dark">
            Provider verification, seeding, and system controls.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* High-Risk Window */}
        {canisterState?.high_risk_window_active && (
          <div
            className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3"
            data-ocid="admin.error_state"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-800">
                High-Risk Window Active
              </p>
              <p className="text-sm text-amber-700">
                Risk score above threshold for one or more providers.
              </p>
            </div>
          </div>
        )}

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-5 h-5 text-live-green" />
            <h2 className="font-bold text-navy">Pending Verification</h2>
            {pendingProviders.length > 0 && (
              <Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200">
                {pendingProviders.length} pending
              </Badge>
            )}
          </div>

          {pendingProviders.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-8 text-center"
              data-ocid="admin.empty_state"
            >
              <CheckCircle2 className="w-8 h-8 text-live" />
              <p className="text-sm text-muted-foreground">
                No providers pending approval
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border" data-ocid="admin.list">
              {pendingProviders.map((p, i) => {
                const pAny = p as any;
                const typeLabel =
                  PROVIDER_TYPE_LABELS[pAny.providerType] ||
                  pAny.providerType ||
                  "Unknown";
                const isApproving = approvingIds.has(p.id);
                return (
                  <div
                    key={p.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        NPI: {p.id}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs self-start sm:self-auto"
                    >
                      {typeLabel}
                    </Badge>
                    <Button
                      size="sm"
                      disabled={isApproving}
                      onClick={() => handleApprove(p.id)}
                      className="min-h-[36px] bg-live-green hover:bg-live-green/90 text-navy font-semibold self-start sm:self-auto"
                      data-ocid={`admin.confirm_button.${i + 1}`}
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Approving…
                        </>
                      ) : (
                        "Approve"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seed Demo Providers */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-live-green" />
            <h2 className="font-bold text-navy">Seed Demo Providers</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Populate the map with verified Ohio providers for demo and pitch
            purposes.
          </p>

          {seedDone ? (
            <div
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200"
              data-ocid="admin.success_state"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium text-emerald-800">
                All 18 providers seeded successfully
              </p>
            </div>
          ) : (
            <>
              <Button
                onClick={handleSeedDemoData}
                disabled={seedProgress.running || !actor}
                className="min-h-[44px] bg-live-green hover:bg-live-green/90 text-navy font-semibold"
                data-ocid="admin.primary_button"
              >
                {seedProgress.running ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding… {seedProgress.done} / {seedProgress.total}
                  </>
                ) : (
                  "Seed 18 Ohio Providers"
                )}
              </Button>

              {seedProgress.running && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {seedProgress.done} / {seedProgress.total} seeded
                    </span>
                    <span>{seedPercent}%</span>
                  </div>
                  <div className="bg-muted rounded-full h-2 w-full overflow-hidden">
                    <div
                      className="bg-live-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${seedPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {seedProgress.errors.length > 0 && (
            <div className="mt-4 space-y-1" data-ocid="admin.error_state">
              <p className="text-xs font-semibold text-destructive">
                {seedProgress.errors.length} error
                {seedProgress.errors.length > 1 ? "s" : ""}:
              </p>
              <ul className="text-xs text-destructive/80 space-y-0.5 list-disc list-inside">
                {seedProgress.errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Register provider — NO PHI, NO ZIP */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Plus className="w-5 h-5 text-live-green" />
              <h2 className="font-bold text-navy">Register Provider</h2>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="reg-id">Provider ID</Label>
                <Input
                  id="reg-id"
                  value={form.id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, id: e.target.value }))
                  }
                  placeholder="provider-001"
                  className="mt-1 min-h-[44px]"
                  required
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label htmlFor="reg-name">Provider Name</Label>
                <Input
                  id="reg-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Brightside Health — Cleveland"
                  className="mt-1 min-h-[44px]"
                  required
                  data-ocid="admin.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reg-lat">Latitude</Label>
                  <Input
                    id="reg-lat"
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lat: e.target.value }))
                    }
                    placeholder="41.48"
                    className="mt-1 min-h-[44px]"
                    required
                    data-ocid="admin.input"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-lng">Longitude</Label>
                  <Input
                    id="reg-lng"
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lng: e.target.value }))
                    }
                    placeholder="-81.74"
                    className="mt-1 min-h-[44px]"
                    required
                    data-ocid="admin.input"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠ No ZIP code, no PHI stored.
              </p>
              <Button
                type="submit"
                disabled={registerProvider.isPending}
                className="w-full min-h-[44px] bg-live-green hover:bg-live-green/90 text-navy font-semibold"
                data-ocid="admin.submit_button"
              >
                {registerProvider.isPending
                  ? "Registering…"
                  : "Register Provider"}
              </Button>
            </form>
          </div>

          {/* Provider toggles */}
          <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-bold text-navy">Provider Controls</h2>
            </div>
            {providers.length === 0 ? (
              <div
                className="p-8 text-center text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                No providers yet.
              </div>
            ) : (
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {providers.map((p, i) => (
                  <div
                    key={p.id}
                    className="px-5 py-3 flex items-center gap-3"
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-navy truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isProviderStale(p.lastVerified)
                          ? "stale"
                          : statusLabel(p.status)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {p.isLive ? "Live" : "Offline"}
                    </Badge>
                    <Switch
                      checked={p.isLive}
                      onCheckedChange={() => handleToggle(p.id, p.isLive)}
                      data-ocid={`admin.toggle.${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
