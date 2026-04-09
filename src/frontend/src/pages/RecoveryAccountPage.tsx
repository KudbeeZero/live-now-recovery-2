import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  CheckSquare,
  Heart,
  Info,
  MapPin,
  MessageCircleHeart,
  Send,
  ShieldCheck,
  Square,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  useAddFavoriteProvider,
  useAllProviders,
  useCreateRecoveryProfile,
  useGetApprovedTestimonials,
  useGetRecoveryProfile,
  useStoreTestimonial,
} from "../hooks/useQueries";
import type { Testimonial } from "../types/community";

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

// ─── Testimonial card ─────────────────────────────────────────────────────────

function TestimonialCard({ t }: { t: Testimonial }) {
  const date = new Date(Number(t.createdAt) / 1_000_000).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );
  const preview =
    t.content.length > 180
      ? `${t.content.slice(0, 180).trimEnd()}…`
      : t.content;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground truncate">
            {t.authorDisplayName}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {t.zipCode}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{preview}</p>
    </div>
  );
}

// ─── Share My Story section ───────────────────────────────────────────────────

function ShareMyStorySection({
  displayName,
  zip,
}: {
  displayName: string;
  zip: string;
}) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState(displayName);
  const [authorZip, setAuthorZip] = useState(zip);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");

  const storeTestimonial = useStoreTestimonial();
  const { data: testimonials = [], isLoading: loadingTestimonials } =
    useGetApprovedTestimonials();

  const recent = testimonials.slice(0, 6);
  const MAX = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!content.trim()) {
      setValidationError("Please write something before submitting.");
      return;
    }
    if (content.length > MAX) {
      setValidationError(`Your story must be ${MAX} characters or fewer.`);
      return;
    }

    storeTestimonial.mutate(
      {
        authorDisplayName: authorName.trim() || displayName,
        zipCode: authorZip.trim() || zip,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setContent("");
        },
        onError: () => {
          setValidationError("Something went wrong. Please try again.");
        },
      },
    );
  };

  return (
    <section data-ocid="recovery.share-story.section" className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <MessageCircleHeart className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Share My Story</h2>
      </div>
      <p className="text-muted-foreground text-sm -mt-3">
        Your recovery journey could help someone else take the first step.
      </p>

      {/* Submission form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        {submitted ? (
          <div
            className="flex flex-col items-center text-center py-6 gap-3"
            data-ocid="recovery.story.success"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <p className="font-semibold text-foreground">
              Thank you for sharing.
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your story has been submitted for review. Once approved, it will
              appear in the community feed.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-border mt-1"
              onClick={() => setSubmitted(false)}
            >
              Share another story
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NO-PHI reminder */}
            <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 rounded-xl p-3">
              <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  No medical details, please.
                </span>{" "}
                Share your experience and hope — not diagnoses, medications, or
                personal health information.
              </p>
            </div>

            {/* Story textarea */}
            <div className="space-y-1.5">
              <Label
                htmlFor="story-content"
                className="text-sm font-medium text-foreground"
              >
                Your story
              </Label>
              <Textarea
                id="story-content"
                placeholder="e.g. 'I wasn't sure if recovery was possible for me, but finding a clinic through this app changed everything…'"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (validationError) setValidationError("");
                }}
                rows={5}
                maxLength={MAX + 10}
                className="resize-none"
                data-ocid="recovery.story.textarea"
              />
              <div className="flex justify-between items-center">
                {validationError ? (
                  <p className="text-xs text-destructive">{validationError}</p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs ml-auto ${
                    content.length > MAX
                      ? "text-destructive font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {content.length}/{MAX}
                </span>
              </div>
            </div>

            {/* Display name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="story-name"
                  className="text-sm font-medium text-foreground"
                >
                  Display name{" "}
                  <span className="text-muted-foreground font-normal">
                    (alias)
                  </span>
                </Label>
                <Input
                  id="story-name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={40}
                  placeholder="Your alias"
                  data-ocid="recovery.story.name"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="story-zip"
                  className="text-sm font-medium text-foreground"
                >
                  ZIP Code
                </Label>
                <Input
                  id="story-zip"
                  value={authorZip}
                  onChange={(e) => setAuthorZip(e.target.value)}
                  maxLength={5}
                  pattern="[0-9]{5}"
                  placeholder="44105"
                  data-ocid="recovery.story.zip"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full min-h-[44px] font-semibold gap-2"
              disabled={
                !content.trim() ||
                content.length > MAX ||
                storeTestimonial.isPending
              }
              data-ocid="recovery.story.submit"
            >
              <Send className="w-4 h-4" />
              {storeTestimonial.isPending ? "Submitting…" : "Submit My Story"}
            </Button>
          </form>
        )}
      </div>

      {/* Community Stories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            Community Stories
          </h3>
          {testimonials.length > 0 && (
            <Badge className="ml-auto bg-primary/10 text-primary border-0 text-xs hover:bg-primary/10">
              {testimonials.length} shared
            </Badge>
          )}
        </div>

        {loadingTestimonials ? (
          <div className="space-y-3" data-ocid="recovery.stories.loading">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div
            className="border border-dashed border-border rounded-xl p-8 text-center"
            data-ocid="recovery.stories.empty"
          >
            <MessageCircleHeart className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-foreground font-medium mb-1">
              No stories yet — be the first
            </p>
            <p className="text-muted-foreground text-sm">
              Approved stories from the community will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="recovery.stories.feed">
            {recent.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
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
          <div className="space-y-10">
            <CreateProfileCard />
            {/* Soft prompt for Share My Story when no profile */}
            <div
              className="bg-muted/40 border border-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              data-ocid="recovery.story.no-profile-prompt"
            >
              <div className="flex items-start gap-3">
                <MessageCircleHeart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Share your story with the community
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Create a recovery account to share your story and access the
                    full community.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

            {/* Share My Story */}
            <ShareMyStorySection
              displayName={profile.displayName}
              zip={profile.zip}
            />
          </div>
        )}
      </div>
    </main>
  );
}
