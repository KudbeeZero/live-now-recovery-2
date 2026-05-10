import { Badge } from "@/components/ui/badge";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Heart,
  ImageIcon,
  Link2,
  MapPin,
  Package,
  Send,
  Share2,
  Shield,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AchievementTimeline } from "../components/AchievementTimeline";
import { BadgeGrid } from "../components/BadgeGrid";
import { CredentialAwardModal } from "../components/CredentialAwardModal";
import { HarmReductionInventoryPanel } from "../components/HarmReductionInventoryPanel";
import { VolunteerHandoff } from "../components/VolunteerHandoff";
import { useCredentialAward } from "../hooks/useCredentialAward";
import { useUserCredentials, useUserTimeline } from "../hooks/useCredentials";
import {
  useAddProviderPost,
  useAllProviders,
  useGetProviderPosts,
  useIsAdmin,
} from "../hooks/useQueries";
import { getShareUrl } from "../lib/credentials";
import {
  isProviderStale,
  statusColor,
  statusLabel,
} from "../utils/providerUtils";

// ─── Provider type color maps ─────────────────────────────────────────────────
const PROVIDER_TYPE_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; coverGradient: string }
> = {
  "MAT Clinic": {
    bg: "bg-emerald-500/20",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    coverGradient:
      "linear-gradient(135deg, oklch(0.20 0.12 155) 0%, oklch(0.17 0.08 185) 60%, oklch(0.14 0.06 240) 100%)",
  },
  "Narcan Distribution": {
    bg: "bg-teal-500/20",
    text: "text-teal-300",
    border: "border-teal-500/40",
    coverGradient:
      "linear-gradient(135deg, oklch(0.19 0.09 195) 0%, oklch(0.17 0.07 210) 60%, oklch(0.14 0.05 240) 100%)",
  },
  "Outpatient Clinic": {
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    border: "border-blue-500/40",
    coverGradient:
      "linear-gradient(135deg, oklch(0.20 0.10 240) 0%, oklch(0.17 0.08 218) 60%, oklch(0.14 0.06 200) 100%)",
  },
  "Emergency Room": {
    bg: "bg-red-500/20",
    text: "text-red-300",
    border: "border-red-500/40",
    coverGradient:
      "linear-gradient(135deg, oklch(0.22 0.10 25) 0%, oklch(0.18 0.08 15) 60%, oklch(0.14 0.05 340) 100%)",
  },
  "Telehealth MAT": {
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-500/40",
    coverGradient:
      "linear-gradient(135deg, oklch(0.20 0.12 290) 0%, oklch(0.17 0.09 315) 60%, oklch(0.14 0.06 240) 100%)",
  },
  "Naloxone Kiosk / Vending Machine": {
    bg: "bg-amber-500/20",
    text: "text-amber-300",
    border: "border-amber-500/40",
    coverGradient:
      "linear-gradient(135deg, oklch(0.22 0.10 65) 0%, oklch(0.18 0.08 85) 60%, oklch(0.14 0.06 240) 100%)",
  },
};

const DEFAULT_PROVIDER_CONFIG = {
  bg: "bg-teal-500/20",
  text: "text-teal-300",
  border: "border-teal-500/40",
  coverGradient:
    "linear-gradient(135deg, oklch(0.20 0.08 210) 0%, oklch(0.17 0.06 220) 60%, oklch(0.14 0.05 240) 100%)",
};

// ─── Relative time helper ────────────────────────────────────────────────────
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Provider Type Badge ──────────────────────────────────────────────────────
function ProviderTypeBadge({ providerType }: { providerType: string }) {
  const cfg = PROVIDER_TYPE_CONFIG[providerType] ?? DEFAULT_PROVIDER_CONFIG;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
    >
      <Shield className="w-3 h-3" />
      {providerType || "Recovery Provider"}
    </span>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border/30 p-4 flex flex-col items-center text-center gap-1">
      <Icon className="w-5 h-5 text-primary mb-1" />
      <span
        className="text-2xl font-extrabold"
        style={{ color: "var(--brand-teal)" }}
      >
        {value}
      </span>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ─── Cover photo upload button ────────────────────────────────────────────────
function PhotoUploadOverlay({
  label,
  onFile,
  className = "",
}: {
  label: string;
  onFile: (f: File) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`flex items-center gap-1.5 text-xs font-medium text-white/90 bg-black/50 hover:bg-black/70 rounded-lg px-2.5 py-1.5 transition-colors backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-green ${className}`}
        aria-label={label}
        data-ocid="provider.photo_upload_btn"
      >
        <Camera className="w-3.5 h-3.5" />
        {label}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

// ─── Post Composer ────────────────────────────────────────────────────────────
function PostComposer({
  providerId: _providerId,
  onPost,
}: {
  providerId: string;
  onPost: (content: string, imageUrl?: string) => void;
}) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageSelect(f: File) {
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  }

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onPost(trimmed, imagePreview ?? undefined);
    setText("");
    setImagePreview(null);
  }

  return (
    <div
      className="bg-card border border-border/30 rounded-xl p-4 mb-4"
      data-ocid="provider.post_composer"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share an update with patients… (availability, services, hours)"
        rows={3}
        className="w-full bg-background rounded-lg border border-input text-sm text-foreground placeholder:text-muted-foreground p-3 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-green"
        data-ocid="provider.post_textarea"
      />
      {imagePreview && (
        <div className="mt-2 relative inline-block">
          <img
            src={imagePreview}
            alt="Post attachment preview"
            className="h-28 rounded-lg object-cover border border-border/30"
          />
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center hover:brightness-110"
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Attach image"
        >
          <ImageIcon className="w-4 h-4" />
          Add image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageSelect(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-live-green text-navy text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-green"
          data-ocid="provider.post_submit"
        >
          <Send className="w-3.5 h-3.5" />
          Post Update
        </button>
      </div>
    </div>
  );
}

// ─── Provider Updates Feed ────────────────────────────────────────────────────
function ProviderUpdatesFeed({
  providerId,
  canPost,
}: {
  providerId: string;
  canPost: boolean;
}) {
  const { data: posts = [] } = useGetProviderPosts(providerId);
  const addPost = useAddProviderPost();

  const [localPosts, setLocalPosts] = useState<
    { id: string; content: string; imageUrl?: string; createdAt: number }[]
  >([]);

  const allPosts = [
    ...localPosts,
    ...(posts as {
      id: string;
      content: string;
      imageUrl?: string;
      createdAt: number;
    }[]),
  ].sort((a, b) => b.createdAt - a.createdAt);

  function handlePost(content: string, imageUrl?: string) {
    const newPost = {
      id: crypto.randomUUID(),
      content,
      imageUrl,
      createdAt: Date.now(),
    };
    setLocalPosts((prev) => [newPost, ...prev]);
    addPost.mutate({ providerId, content, imageUrl });
  }

  return (
    <section
      className="mt-6"
      aria-label="Provider updates feed"
      data-ocid="provider.updates_feed"
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-1.5 h-5 rounded-full"
          style={{ background: "var(--brand-teal)" }}
        />
        <h2 className="text-base font-bold text-foreground">
          Provider Updates
        </h2>
      </div>

      {canPost && <PostComposer providerId={providerId} onPost={handlePost} />}

      {allPosts.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border/30 rounded-xl"
          data-ocid="provider.updates_empty"
        >
          <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-3">
            <Send className="w-5 h-5 opacity-40" />
          </div>
          <p>No updates yet.</p>
          <p className="text-xs mt-1 opacity-70">
            Follow this provider to stay informed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allPosts.map((post) => (
            <article
              key={post.id}
              className="bg-card border border-border/30 rounded-xl p-4"
              data-ocid="provider.update_card"
            >
              <p className="text-xs text-muted-foreground mb-2">
                {timeAgo(post.createdAt)}
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {post.content}
              </p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post attachment"
                  className="mt-3 rounded-lg w-full max-h-48 object-cover border border-border/20"
                />
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Provider Cover Header ────────────────────────────────────────────────────
function ProviderCoverHeader({
  name,
  providerType,
  isVerified,
  isActive,
  isEmergencyActive,
  city,
  lastVerifiedDate,
  reputationScore,
  canEdit,
}: {
  name: string;
  providerType: string;
  isVerified: boolean;
  isActive: boolean;
  isEmergencyActive: boolean;
  city?: string;
  lastVerifiedDate: Date;
  reputationScore: number;
  canEdit: boolean;
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cfg = PROVIDER_TYPE_CONFIG[providerType] ?? DEFAULT_PROVIDER_CONFIG;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const profileUrl = window.location.href;
  const tweetText = `Verified recovery provider${city ? ` in ${city}` : ""} — ${name} is part of the Live Now Recovery network. Find help near you: livenowrecovery.org #RecoveryIsPossible #MAT #OhioRecovery`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(profileUrl)}`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + (city ? ` ${city} Ohio` : " Ohio"))}`;

  return (
    <div
      className="rounded-2xl overflow-hidden border border-border/30 shadow-lg mb-6"
      data-ocid="provider.cover_section"
    >
      {/* Cover */}
      <div
        className="relative w-full h-40 sm:h-56"
        style={{
          background: coverUrl
            ? `url(${coverUrl}) center/cover no-repeat`
            : cfg.coverGradient,
        }}
        data-ocid="provider.cover_photo"
      >
        {/* Pattern overlay */}
        {!coverUrl && (
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, oklch(0.68 0.1 218 / 0.4) 0px, oklch(0.68 0.1 218 / 0.4) 1px, transparent 1px, transparent 14px)",
            }}
          />
        )}

        {/* Emergency badge */}
        {isEmergencyActive && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-amber-950 backdrop-blur-sm animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              72-Hour Bridge Active
            </span>
          </div>
        )}

        {/* Verified badge */}
        {isVerified && (
          <div className="absolute top-3 right-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-sm border border-white/10"
              style={{ color: "var(--brand-teal)" }}
            >
              <CheckCircle2 className="w-3 h-3" />
              Verified Provider
            </span>
          </div>
        )}

        {canEdit && (
          <div className="absolute bottom-3 right-3">
            <PhotoUploadOverlay
              label="Edit cover"
              onFile={(f) => setCoverUrl(URL.createObjectURL(f))}
            />
          </div>
        )}
      </div>

      {/* Avatar + info row */}
      <div className="bg-card px-5 pb-5">
        <div className="flex items-end justify-between -mt-9 sm:-mt-11 mb-4">
          {/* Avatar */}
          <div className="relative" data-ocid="provider.avatar">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-card flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-lg overflow-hidden"
              style={{
                background: avatarUrl
                  ? `url(${avatarUrl}) center/cover`
                  : "linear-gradient(135deg, oklch(0.58 0.14 218), oklch(0.68 0.12 155))",
                color: "white",
              }}
            >
              {!avatarUrl && initials}
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  const inp = document.createElement("input");
                  inp.type = "file";
                  inp.accept = "image/*";
                  inp.onchange = (e) => {
                    const f = (e.target as HTMLInputElement).files?.[0];
                    if (f) setAvatarUrl(URL.createObjectURL(f));
                  };
                  inp.click();
                }}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-live-green text-navy flex items-center justify-center hover:brightness-110 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-green"
                aria-label="Upload profile photo"
                data-ocid="provider.avatar_upload_btn"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="provider.share_x_button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: "oklch(0.12 0.02 240)",
                borderColor: "oklch(0.3 0.01 240)",
                color: "oklch(0.90 0 0)",
              }}
              aria-label="Share on X"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share on X</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="provider.directions_button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: "var(--brand-teal)",
                borderColor: "var(--brand-teal)",
                color: "oklch(0.12 0.04 240)",
              }}
              aria-label="Get Directions"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Directions</span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              data-ocid="provider.copy_link_button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Copy link"
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-live-green" />
              ) : (
                <Link2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied!" : "Copy link"}
              </span>
            </button>
          </div>
        </div>

        {/* Name */}
        <h1
          className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1"
          style={{ color: "var(--brand-teal)" }}
          data-ocid="provider.display_name"
        >
          {name}
        </h1>

        {/* Type + status badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {providerType && <ProviderTypeBadge providerType={providerType} />}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-muted/40 text-muted-foreground border border-border/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"}`}
            />
            {isActive ? "Accepting Patients" : "Not Currently Active"}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {city && (
            <span className="flex items-center gap-1.5">
              <MapPin
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "var(--brand-teal)" }}
              />
              {city}, OH
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "var(--brand-teal)" }}
            />
            Verified {lastVerifiedDate.toLocaleDateString()}
          </span>
          {reputationScore > 0 && (
            <span
              className="flex items-center gap-1.5 font-semibold"
              style={{ color: "var(--brand-teal)" }}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              Trust Score: {reputationScore}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Credentials & Achievements Section ─────────────────────────────────────
function ProviderCredentialsSection({
  credentialCount,
}: {
  credentialCount: number;
}) {
  // Provider credentials are fetched globally (no per-provider principal yet)
  const { data: credentials = [], isLoading: credsLoading } =
    useUserCredentials(null);
  const { data: timeline = [], isLoading: timelineLoading } =
    useUserTimeline(null);

  const topCred = credentials[0] ?? null;
  const shareUrl = topCred ? getShareUrl(topCred) : null;

  return (
    <section
      className="mb-5 bg-card rounded-2xl border border-border/30 p-5 shadow-lg"
      data-ocid="provider.credentials_section"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-5 rounded-full"
            style={{ background: "var(--brand-teal)" }}
          />
          <h2
            className="text-base font-bold"
            style={{ color: "var(--brand-teal)" }}
          >
            Credentials &amp; Achievements
          </h2>
        </div>
        {shareUrl && (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="provider.share_achievements_btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share on X
          </a>
        )}
      </div>

      <BadgeGrid
        credentials={credentials}
        isLoading={credsLoading}
        emptyText="This provider hasn't earned credentials yet — complete a warm handoff to earn your first badge."
      />

      {/* ICP trust note */}
      <p className="mt-4 text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <Shield
          className="w-3.5 h-3.5"
          style={{ color: "var(--brand-teal)" }}
        />
        {credentialCount > 0
          ? `This provider has earned ${credentialCount} verified credential${credentialCount !== 1 ? "s" : ""} on the Internet Computer`
          : "Credentials are soul-bound on the Internet Computer — permanent & non-transferable"}
      </p>

      {timeline.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-1.5 h-5 rounded-full"
              style={{ background: "var(--brand-teal)" }}
            />
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--brand-teal)" }}
            >
              Achievement Timeline
            </h3>
          </div>
          <AchievementTimeline
            credentials={timeline}
            isLoading={timelineLoading}
          />
        </div>
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ProviderPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id ?? "";
  const { data: providers = [], isLoading } = useAllProviders();
  const { data: isAdmin = false } = useIsAdmin();
  const provider = providers.find((p) => p.id === id);
  const { awardedCredential, dismissAward } = useCredentialAward();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="provider.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading provider…</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        data-ocid="provider.error_state"
      >
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-foreground font-semibold">Provider not found</p>
        <p className="text-sm text-muted-foreground">
          This provider may have been removed or the link is invalid.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-border/40 text-foreground hover:bg-muted/40 transition-colors"
          data-ocid="provider.back_to_map_link"
        >
          <ArrowLeft className="w-4 h-4" /> Back to map
        </Link>
      </div>
    );
  }

  const stale = isProviderStale(provider.lastVerified);
  const color = statusColor(provider.status);
  const lastVerifiedDate = new Date(Number(provider.lastVerified / 1_000_000n));
  const providerType =
    "providerType" in provider
      ? (provider as { providerType: string }).providerType
      : "";
  const isVerified =
    "is_verified" in provider
      ? (provider as { is_verified: boolean }).is_verified
      : false;
  const isActive =
    "is_active" in provider
      ? (provider as { is_active: boolean }).is_active
      : false;
  const inventory =
    "inventory" in provider
      ? (provider as { inventory: string }).inventory
      : "";
  const reputationScore =
    "reputationScore" in provider
      ? Number(
          (provider as { reputationScore: bigint | number }).reputationScore,
        )
      : 0;
  const services: string[] =
    "services" in provider
      ? ((provider as { services: string[] }).services ?? [])
      : [];
  const phone: string =
    "phone" in provider
      ? String((provider as { phone: string }).phone ?? "")
      : "";
  const hours: string =
    "hours" in provider
      ? String((provider as { hours: string }).hours ?? "")
      : "";
  const emergencyActive =
    "emergencyActive" in provider
      ? Boolean((provider as { emergencyActive: boolean }).emergencyActive)
      : false;

  // City from name heuristic (fallback)
  const cityMatch = provider.name.match(
    /(Cleveland|Columbus|Cincinnati|Dayton|Akron|Toledo|Youngstown|Canton|Lorain|Elyria|Mentor|Sandusky|Warren)/i,
  );
  const city = cityMatch?.[1] ?? undefined;

  const pageTitle = `${provider.name} — Recovery Provider | Live Now Recovery`;
  const pageDesc = `${provider.name}${city ? ` in ${city}, Ohio` : ""} — verified recovery provider offering ${
    services.length > 0
      ? services.slice(0, 3).join(", ")
      : providerType || "MAT and harm reduction services"
  }. Find help on the Live Now Recovery platform.`;
  const pageUrl = `https://livenowrecovery.org/provider/${id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: provider.name,
    url: pageUrl,
    ...(city
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: city,
            addressRegion: "OH",
          },
        }
      : {}),
    medicalSpecialty: providerType || "Addiction Medicine",
    isAcceptingNewPatients: isActive,
  };

  return (
    <main className="min-h-screen py-6 px-4" data-ocid="provider.page">
      <CredentialAwardModal
        credential={awardedCredential}
        onDismiss={dismissAward}
      />

      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="profile" />
      </Helmet>

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          data-ocid="provider.back_link"
        >
          <ArrowLeft className="w-4 h-4" /> Back to map
        </Link>

        {/* Cover header — full Twitter/X style */}
        <ProviderCoverHeader
          name={provider.name}
          providerType={providerType}
          isVerified={isVerified}
          isActive={isActive}
          isEmergencyActive={emergencyActive}
          city={city}
          lastVerifiedDate={lastVerifiedDate}
          reputationScore={reputationScore}
          canEdit={isAdmin}
        />

        {/* Status alert */}
        {stale && (
          <div
            className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4"
            data-ocid="provider.stale_warning"
          >
            <p className="text-amber-300 text-sm font-medium">
              ⚠ Status may be stale — last verified over 4 hours ago
            </p>
          </div>
        )}

        {/* Impact stats row */}
        <section
          className="mb-5"
          aria-label="Provider statistics"
          data-ocid="provider.stats_section"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-1.5 h-5 rounded-full"
              style={{ background: "var(--brand-teal)" }}
            />
            <h2
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: "var(--brand-teal)" }}
            >
              Provider at a Glance
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={isVerified ? CheckCircle2 : XCircle}
              label="Verification"
              value={isVerified ? "✓ Verified" : "Pending"}
              sub="Network status"
            />
            <StatCard
              icon={Star}
              label="Trust Score"
              value={reputationScore > 0 ? reputationScore : "—"}
              sub="Community rating"
            />
            <StatCard
              icon={Award}
              label="Credentials"
              value={0}
              sub="Soul-bound on ICP"
            />
            <StatCard
              icon={Heart}
              label="Warm Handoffs"
              value="24+"
              sub="Connections made"
            />
          </div>
        </section>

        {/* Credentials & Achievements — above the fold */}
        <ProviderCredentialsSection credentialCount={0} />

        {/* Services */}
        {services.length > 0 && (
          <section
            className="bg-card rounded-2xl border border-border/30 p-5 mb-5"
            data-ocid="provider.services_section"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-1.5 h-5 rounded-full"
                style={{ background: "var(--brand-teal)" }}
              />
              <h2
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: "var(--brand-teal)" }}
              >
                Services Offered
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.map((svc) => (
                <Badge
                  key={svc}
                  variant="outline"
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    borderColor: "var(--brand-teal)",
                    color: "var(--brand-teal)",
                    background: "oklch(0.68 0.1 218 / 0.08)",
                  }}
                  data-ocid="provider.service_badge"
                >
                  {svc}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Phone + hours */}
        {(phone || hours) && (
          <div className="bg-card rounded-xl border border-border/30 p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--brand-teal)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href={`tel:${phone}`}
                  className="hover:underline"
                  style={{ color: "var(--brand-teal)" }}
                >
                  {phone}
                </a>
              </div>
            )}
            {hours && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--brand-teal)" }}
                />
                <span>{hours}</span>
              </div>
            )}
          </div>
        )}

        {/* Status badge row */}
        <div className="flex items-center gap-2 mb-4">
          <Badge style={{ background: color, color: "white" }}>
            {statusLabel(provider.status)}
          </Badge>
          {isVerified && <CheckCircle2 className="w-4 h-4 text-live-green" />}
        </div>

        {/* Inventory */}
        {inventory && (
          <div
            className="bg-card rounded-xl border border-border/30 p-4 mb-4"
            data-ocid="provider.inventory_section"
          >
            <div className="flex items-center gap-2 mb-2">
              <Package
                className="w-4 h-4"
                style={{ color: "var(--brand-teal)" }}
              />
              <h2
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--brand-teal)" }}
              >
                Current Availability
              </h2>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {inventory}
            </p>
          </div>
        )}

        {/* Harm Reduction Supplies */}
        {(providerType === "Naloxone Kiosk" ||
          providerType === "Naloxone Kiosk / Vending Machine" ||
          providerType === "Narcan" ||
          providerType === "Narcan Distribution") && (
          <div className="mb-4" data-ocid="provider.harm_reduction_section">
            <div className="flex items-center gap-2 mb-2 mt-2">
              <div
                className="w-1.5 h-5 rounded-full"
                style={{ background: "oklch(0.68 0.1 218)" }}
              />
              <h2 className="text-base font-bold text-foreground">
                Harm Reduction Supplies
              </h2>
            </div>
            <HarmReductionInventoryPanel providerId={id} showTitle={false} />
          </div>
        )}

        {/* Volunteer handoff */}
        <VolunteerHandoff />

        {/* Provider updates feed */}
        <ProviderUpdatesFeed providerId={id} canPost={isAdmin} />

        {/* ICP / Blockchain section */}
        <section
          className="mt-6 rounded-2xl border border-border/30 p-5 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.06 218 / 0.5), oklch(0.14 0.08 200 / 0.4))",
          }}
          data-ocid="provider.icp_section"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{
              background: "var(--brand-teal)",
              color: "oklch(0.12 0.04 240)",
            }}
          >
            <Shield className="w-5 h-5" />
          </div>
          <h3
            className="text-base font-bold mb-2"
            style={{ color: "var(--brand-teal)" }}
          >
            Verified on Internet Computer
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Provider credentials and warm handoffs are permanently recorded
            on-chain via Internet Identity. Soul-bound, non-transferable, and
            verifiable by anyone — with zero patient data stored.
          </p>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-border/40 text-foreground hover:bg-muted/40 transition-colors"
              data-ocid="provider.view_leaderboard_link"
            >
              <TrendingUp className="w-4 h-4" />
              View Leaderboard
            </Link>
            <Link
              to="/helper"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.02]"
              style={{
                background: "var(--brand-teal)",
                color: "oklch(0.12 0.04 240)",
              }}
              data-ocid="provider.volunteer_cta"
            >
              <Users className="w-4 h-4" />
              Join as a Volunteer
            </Link>
          </div>
        </section>

        {/* Calendar spacing */}
        <div className="pb-8" />
      </div>
    </main>
  );
}
