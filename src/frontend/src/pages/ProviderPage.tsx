import { Badge } from "@/components/ui/badge";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  ImageIcon,
  MapPin,
  Package,
  QrCode,
  Send,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PriceComparisonCard } from "../components/PriceComparisonCard";
import { VolunteerHandoff } from "../components/VolunteerHandoff";
import {
  useAddProviderPost,
  useAllProviders,
  useGetCostPlusReferralCount,
  useGetProviderPosts,
  useIsAdmin,
  useRecordCostPlusReferral,
} from "../hooks/useQueries";
import {
  isProviderStale,
  statusColor,
  statusLabel,
} from "../utils/providerUtils";

const COST_PLUS_URL =
  "https://costplusdrugs.com/medications/categories/opioid-dependence/";

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

// ─── QR Code ─────────────────────────────────────────────────────────────────
function QRCodeCanvas({ url, size = 120 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>("");
  useEffect(() => {
    const encoded = encodeURIComponent(url);
    setDataUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=0a1628&margin=6`,
    );
  }, [url, size]);
  if (!dataUrl) return null;
  return (
    <img
      src={dataUrl}
      alt="QR code for Cost Plus Drugs"
      width={size}
      height={size}
      className="rounded-lg"
      style={{ background: "#fff" }}
    />
  );
}

// ─── Cost Plus Rx Card (compact) ─────────────────────────────────────────────
function CostPlusRxCard({ providerId }: { providerId: string }) {
  const { data: referralCount, isLoading } =
    useGetCostPlusReferralCount(providerId);
  const recordReferral = useRecordCostPlusReferral();

  function handleOrder() {
    recordReferral.mutate(providerId);
    window.open(COST_PLUS_URL, "_blank", "noopener,noreferrer");
  }

  const count = referralCount !== undefined ? Number(referralCount) : null;

  return (
    <div
      className="bg-card rounded-xl border border-border/30 p-4 mb-4"
      data-ocid="provider.cost_plus_rx_card"
    >
      <div className="flex items-center gap-3">
        {/* QR compact */}
        <div className="shrink-0 hidden sm:block">
          <QRCodeCanvas url={COST_PLUS_URL} size={80} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <QrCode className="w-3.5 h-3.5 text-live-green shrink-0" />
            <h2 className="text-sm font-bold text-foreground">
              Cost Plus Drugs{" "}
              <span className="text-live-green font-semibold">Rx</span>
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-2 leading-snug">
            Generic Suboxone &amp; Naloxone — no insurance required.
          </p>
          {isLoading ? (
            <div className="h-3 w-32 rounded bg-muted animate-pulse mb-2" />
          ) : count !== null && count > 0 ? (
            <p className="text-xs text-muted-foreground mb-2">
              <span className="text-live-green font-semibold">{count}</span>{" "}
              referrals from this clinic
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleOrder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-live-green text-navy font-bold text-xs transition-all hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-green"
            data-ocid="provider.cost_plus_cta"
          >
            View Pricing &amp; Order
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Provider Type Badge ──────────────────────────────────────────────────────
function ProviderTypeBadge({ providerType }: { providerType: string }) {
  const styles: Record<string, string> = {
    "MAT Clinic": "bg-teal-500/20 text-teal-300 border border-teal-500/30",
    "Narcan Distribution":
      "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    "Emergency Room": "bg-red-500/20 text-red-300 border border-red-500/30",
    "Naloxone Kiosk / Vending Machine":
      "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    "Telehealth MAT":
      "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  };
  const cls =
    styles[providerType] ??
    "bg-muted/50 text-muted-foreground border border-border/30";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cls}`}
    >
      {providerType || "Unknown Type"}
    </span>
  );
}

// ─── Reputation Stars ─────────────────────────────────────────────────────────
function ReputationStars({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 5);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={`star-${n}`}
          className={`w-4 h-4 ${n <= filled ? "text-live-green fill-live-green" : "text-muted-foreground"}`}
        />
      ))}
      <span className="ml-1 text-sm font-bold text-live-green">{score}</span>
      <span className="text-xs text-muted-foreground">/100</span>
    </div>
  );
}

// ─── Cover photo upload button (visible on hover) ─────────────────────────────
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

  // Local optimistic posts for demo (before backend integration)
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
        <div className="w-1.5 h-5 rounded-full bg-live-green" />
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

// ─── Twitter/X Profile Header ─────────────────────────────────────────────────
function ProfileHeader({
  name,
  providerType,
  canEdit,
}: {
  name: string;
  providerType: string;
  canEdit: boolean;
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  function handleCoverFile(f: File) {
    setCoverUrl(URL.createObjectURL(f));
  }

  function handleAvatarFile(f: File) {
    setAvatarUrl(URL.createObjectURL(f));
  }

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-border/30 shadow-card">
      {/* Cover photo */}
      <div
        className="relative w-full h-36 sm:h-48"
        style={{
          background: coverUrl
            ? `url(${coverUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, oklch(0.18 0.04 240) 0%, oklch(0.14 0.06 220) 50%, oklch(0.12 0.08 200) 100%)",
        }}
        data-ocid="provider.cover_photo"
      >
        {/* Cover pattern overlay if no photo */}
        {!coverUrl && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, oklch(0.62 0.17 155 / 0.3) 0px, oklch(0.62 0.17 155 / 0.3) 1px, transparent 1px, transparent 12px)",
            }}
          />
        )}
        {canEdit && (
          <div className="absolute bottom-3 right-3">
            <PhotoUploadOverlay label="Edit cover" onFile={handleCoverFile} />
          </div>
        )}
      </div>

      {/* Avatar row */}
      <div className="bg-card px-4 pb-4">
        <div className="flex items-end justify-between -mt-8 sm:-mt-10 mb-3">
          {/* Avatar */}
          <div className="relative" data-ocid="provider.avatar">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-card overflow-hidden bg-muted flex items-center justify-center"
              style={
                avatarUrl
                  ? {
                      backgroundImage: `url(${avatarUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >
              {!avatarUrl && (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
              )}
            </div>
            {canEdit && (
              <div className="absolute bottom-0 right-0">
                <button
                  type="button"
                  onClick={() => {
                    const inp = document.createElement("input");
                    inp.type = "file";
                    inp.accept = "image/*";
                    inp.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) handleAvatarFile(f);
                    };
                    inp.click();
                  }}
                  className="w-6 h-6 rounded-full bg-live-green text-navy flex items-center justify-center hover:brightness-110 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-green"
                  aria-label="Upload profile photo"
                  data-ocid="provider.avatar_upload_btn"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Name + type */}
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
          {name}
        </h1>
        {providerType && (
          <div className="mt-1">
            <ProviderTypeBadge providerType={providerType} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ProviderPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id ?? "";
  const { data: providers = [], isLoading } = useAllProviders();
  const { data: isAdmin = false } = useIsAdmin();
  const provider = providers.find((p) => p.id === id);

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
        <p className="text-foreground font-semibold">Provider not found</p>
        <Link to="/" className="text-primary hover:underline text-sm">
          ← Back to map
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

  return (
    <main className="min-h-screen py-6 px-4" data-ocid="provider.page">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          data-ocid="provider.link"
        >
          <ArrowLeft className="w-4 h-4" /> Back to map
        </Link>

        {/* Twitter/X-style profile header */}
        <ProfileHeader
          name={provider.name}
          providerType={providerType}
          canEdit={isAdmin}
        />

        {/* Status row */}
        <div className="flex items-center gap-2 mb-4">
          <Badge style={{ background: color, color: "white" }}>
            {statusLabel(provider.status)}
          </Badge>
          {isVerified && <CheckCircle2 className="w-4 h-4 text-live-green" />}
        </div>

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

        {/* Meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div
            className="bg-card rounded-xl border border-border/30 p-4 flex items-center gap-3"
            data-ocid="provider.verification_badge"
          >
            {isVerified ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-live-green shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Verification
                  </p>
                  <p className="text-sm font-semibold text-live-green">
                    Verified
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Verification
                  </p>
                  <p className="text-sm font-semibold text-amber-400">
                    Pending
                  </p>
                </div>
              </>
            )}
          </div>

          <div
            className="bg-card rounded-xl border border-border/30 p-4 flex items-center gap-3"
            data-ocid="provider.active_status"
          >
            {isActive ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-live-green animate-pulse shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-live-green">
                    Accepting Patients
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Not Currently Active
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Location + verified time */}
        <div className="bg-card rounded-xl border border-border/30 p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>
                {provider.lat.toFixed(4)}, {provider.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate">
                Verified: {lastVerifiedDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory */}
        {inventory && (
          <div
            className="bg-card rounded-xl border border-border/30 p-4 mb-4"
            data-ocid="provider.inventory_section"
          >
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-live-green" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-live-green">
                Current Availability
              </h2>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {inventory}
            </p>
          </div>
        )}

        {/* Reputation */}
        {reputationScore > 0 && (
          <div
            className="bg-card rounded-xl border border-border/30 p-4 mb-4"
            data-ocid="provider.reputation_section"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Community Trust Score
            </p>
            <ReputationStars score={reputationScore} />
          </div>
        )}

        {/* Price comparison */}
        <div className="mb-4">
          <PriceComparisonCard />
        </div>

        {/* Cost Plus Rx — compact */}
        <CostPlusRxCard providerId={id} />

        {/* Volunteer handoff */}
        <VolunteerHandoff />

        {/* Provider updates feed */}
        <ProviderUpdatesFeed providerId={id} canPost={isAdmin} />
      </div>
    </main>
  );
}
