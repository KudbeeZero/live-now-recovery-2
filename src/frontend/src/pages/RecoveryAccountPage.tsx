import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  CheckSquare,
  Heart,
  Info,
  MapPin,
  ShieldCheck,
  Square,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import {
  useAddFavoriteProvider,
  useAllProviders,
  useCreateRecoveryProfile,
  useGetRecoveryProfile,
} from "../hooks/useQueries";

// ─── Resource categories the user can mark as explored ───────────────────────

const RESOURCE_CATEGORIES = [
  { id: "food", label: "Food Assistance", emoji: "🛒" },
  { id: "housing", label: "Housing & Sober Living", emoji: "🏠" },
  { id: "employment", label: "Employment Resources", emoji: "💼" },
  { id: "peer-support", label: "Peer Support & Groups", emoji: "🤝" },
  { id: "bill-assistance", label: "Bill Assistance", emoji: "💳" },
];

// ─── Create profile card ──────────────────────────────────────────────────────

function CreateProfileCard() {
  const [displayName, setDisplayName] = useState("");
  const [zip, setZip] = useState("");
  const createProfile = useCreateRecoveryProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !zip.trim()) return;
    createProfile.mutate({ displayName: displayName.trim(), zip: zip.trim() });
  };

  return (
    <div className="max-w-md mx-auto">
      <div
        className="bg-card border border-border rounded-2xl p-8 shadow-card"
        data-ocid="recovery.signup.card"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6 mx-auto">
          <User className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground text-center mb-2">
          Create a Recovery Account
        </h2>
        <p className="text-muted-foreground text-sm text-center mb-6 leading-relaxed">
          Save providers and track resources — no medical details, ever.
        </p>

        {/* NO-PHI notice */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">
              We never store medical details.
            </span>{" "}
            This account only saves your favorite providers and the resource
            categories you've explored.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="displayName"
              className="text-sm font-medium text-foreground"
            >
              Display Name{" "}
              <span className="text-muted-foreground font-normal">
                (alias, not your real name)
              </span>
            </Label>
            <Input
              id="displayName"
              placeholder="e.g. NE Ohio Strong, Phoenix44105…"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              required
              data-ocid="recovery.input.name"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="zip"
              className="text-sm font-medium text-foreground"
            >
              ZIP Code
            </Label>
            <Input
              id="zip"
              placeholder="44105"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              maxLength={5}
              pattern="[0-9]{5}"
              required
              data-ocid="recovery.input.zip"
            />
          </div>
          <Button
            type="submit"
            className="w-full min-h-[44px] font-semibold"
            disabled={
              !displayName.trim() || zip.length !== 5 || createProfile.isPending
            }
            data-ocid="recovery.submit"
          >
            {createProfile.isPending ? "Creating Account…" : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Saved providers section ──────────────────────────────────────────────────

function SavedProvidersSection({ favoriteIds }: { favoriteIds: string[] }) {
  const { data: allProviders = [], isLoading } = useAllProviders();
  const removeFavorite = useAddFavoriteProvider();

  const saved = allProviders.filter((p) => {
    const pid = typeof p.id === "string" ? p.id : String(p.id);
    return favoriteIds.includes(pid);
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div
        className="border border-dashed border-border rounded-xl p-8 text-center"
        data-ocid="recovery.empty.providers"
      >
        <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-foreground font-medium mb-1">
          No saved providers yet
        </p>
        <p className="text-muted-foreground text-sm mb-4">
          Browse the map and save providers you want to return to.
        </p>
        <Link to="/">
          <Button variant="outline" size="sm" className="border-border">
            Browse Providers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      data-ocid="recovery.saved.providers"
    >
      {saved.map((p) => {
        const pid = typeof p.id === "string" ? p.id : String(p.id);
        const name = typeof p.name === "string" ? p.name : "Provider";
        const city = "city" in p && typeof p.city === "string" ? p.city : "";
        const ptype =
          typeof p.providerType === "string" ? p.providerType : "MAT Clinic";
        return (
          <div
            key={pid}
            className="bg-card border border-border rounded-xl p-4 shadow-card flex items-start justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {name}
              </p>
              {city && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {city}
                </p>
              )}
              <Badge className="mt-2 text-[10px] bg-primary/10 text-primary border-0 hover:bg-primary/10">
                {ptype}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link to="/provider/$id" params={{ id: pid }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-border"
                >
                  View
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                onClick={() =>
                  removeFavorite.mutate({ providerId: pid, remove: true })
                }
                aria-label="Remove from saved"
                data-ocid="recovery.remove.provider"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Resources explored section ───────────────────────────────────────────────

function ResourcesExploredSection({
  resourcesUsed,
}: { resourcesUsed: string[] }) {
  const [checked, setChecked] = useState<string[]>(resourcesUsed);

  const toggle = (id: string) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-2" data-ocid="recovery.resources.explored">
      {RESOURCE_CATEGORIES.map((cat) => {
        const isChecked = checked.includes(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggle(cat.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left min-h-[52px] ${
              isChecked
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card hover:border-primary/20"
            }`}
            data-ocid={`recovery.category.${cat.id}`}
          >
            <span className="text-lg">{cat.emoji}</span>
            <span className="flex-1 text-sm font-medium text-foreground">
              {cat.label}
            </span>
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </button>
        );
      })}
      <p className="text-xs text-muted-foreground pt-2 flex items-center gap-1.5">
        <Info className="w-3 h-3" />
        Checking a category helps you track which resources you've looked into.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RecoveryAccountPage() {
  const { data: profile, isLoading } = useGetRecoveryProfile();

  return (
    <main className="min-h-screen" data-ocid="recovery.page">
      {/* Hero */}
      <section className="bg-navy px-4 py-14">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              Your Recovery Journey
            </p>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            My Recovery <span className="text-live-green">Account</span>
          </h1>
          <p className="text-on-dark text-base max-w-lg">
            Save providers and track resources — no medical details stored,
            ever. Completely anonymous and voluntary.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : !profile ? (
          <CreateProfileCard />
        ) : (
          <div className="space-y-10">
            {/* Welcome bar */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">
                  {profile.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  ZIP {profile.zip} · Member since{" "}
                  {new Date(profile.createdAt / 1_000_000).toLocaleDateString()}
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs hover:bg-primary/10">
                Recovery Account
              </Badge>
            </div>

            {/* Saved Providers */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Saved Providers
                </h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  {profile.favoriteProviders.length} saved
                </span>
              </div>
              <SavedProvidersSection favoriteIds={profile.favoriteProviders} />
            </section>

            {/* Resources Explored */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Resources I've Explored
                </h2>
              </div>
              <ResourcesExploredSection resourcesUsed={profile.resourcesUsed} />
            </section>

            {/* Link to directory */}
            <div className="bg-muted/40 border border-border rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Browse the full resource directory
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Food, housing, employment, peer support, and more.
                </p>
              </div>
              <Link to="/resources">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border shrink-0"
                >
                  View Resources
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
