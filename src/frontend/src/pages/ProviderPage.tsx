import { Badge } from "@/components/ui/badge";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  QrCode,
  Star,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PriceComparisonCard } from "../components/PriceComparisonCard";
import { VolunteerHandoff } from "../components/VolunteerHandoff";
import {
  useAllProviders,
  useGetCostPlusReferralCount,
  useRecordCostPlusReferral,
} from "../hooks/useQueries";
import {
  isProviderStale,
  statusColor,
  statusLabel,
} from "../utils/providerUtils";

const COST_PLUS_URL =
  "https://costplusdrugs.com/medications/categories/opioid-dependence/";

// ─── QR Code image via qrserver.com API ──────────────────────────────────────
function QRCodeCanvas({ url, size = 160 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    const encoded = encodeURIComponent(url);
    setDataUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=0a1628&margin=8`,
    );
  }, [url, size]);

  if (!dataUrl) return null;

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img
        src={dataUrl}
        alt="QR code for Cost Plus Drugs opioid-dependence medications"
        width={size}
        height={size}
        className="rounded-lg"
        style={{ background: "#fff" }}
      />
    </div>
  );
}

// ─── Cost Plus Rx Router Card ─────────────────────────────────────────────────
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
      className="bg-navy rounded-xl border border-live-green/20 p-6 mb-4"
      data-ocid="provider.cost_plus_rx_card"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <QrCode className="w-5 h-5 text-live-green shrink-0" />
        <h2 className="text-base font-bold text-white">
          Get Medication via{" "}
          <span className="text-live-green">Cost Plus Drugs</span>
        </h2>
      </div>
      <p className="text-xs text-on-dark mb-4 leading-relaxed">
        Mark Cuban's Cost Plus Drugs offers generic Suboxone and Naloxone at
        dramatically lower prices — no insurance required.
      </p>

      {/* Referral badge */}
      <div className="mb-4 h-5">
        {isLoading ? (
          <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
        ) : count !== null && count > 0 ? (
          <span className="text-xs text-on-dark">
            <span className="font-semibold text-live-green">{count}</span>{" "}
            {count === 1 ? "referral" : "referrals"} from this clinic
          </span>
        ) : (
          <span className="text-xs text-on-dark opacity-60">
            Be the first referral from this clinic
          </span>
        )}
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-2 mb-5">
        <QRCodeCanvas url={COST_PLUS_URL} size={160} />
        <p className="text-xs text-on-dark text-center opacity-70">
          Scan to access Cost Plus pricing for this medication
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleOrder}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-live-green text-navy font-bold text-sm transition-all hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-green focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        data-ocid="provider.cost_plus_cta"
      >
        View Pricing &amp; Order
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}

type ProviderTypeBadgeProps = { providerType: string };

function ProviderTypeBadge({ providerType }: ProviderTypeBadgeProps) {
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
    "bg-gray-500/20 text-gray-300 border border-gray-500/30";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {providerType || "Unknown Type"}
    </span>
  );
}

function ReputationStars({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 5);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
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

export function ProviderPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id ?? "";
  const { data: providers = [], isLoading } = useAllProviders();
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
        <p className="text-navy font-semibold">Provider not found</p>
        <Link to="/" className="text-action-blue hover:underline text-sm">
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
    <main className="min-h-screen py-10 px-4" data-ocid="provider.page">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy mb-6 transition-colors"
          data-ocid="provider.link"
        >
          <ArrowLeft className="w-4 h-4" /> Back to map
        </Link>

        {/* Main info card */}
        <div className="bg-navy rounded-2xl shadow-card border border-border/30 p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold text-white">{provider.name}</h1>
            <Badge
              style={{ background: color, color: "white" }}
              className="shrink-0"
            >
              {statusLabel(provider.status)}
            </Badge>
          </div>

          {/* Provider type badge */}
          {providerType && (
            <div className="mb-4">
              <ProviderTypeBadge providerType={providerType} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {provider.lat.toFixed(4)}, {provider.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Verified: {lastVerifiedDate.toLocaleString()}</span>
            </div>
          </div>

          {stale && (
            <div
              className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
              data-ocid="provider.error_state"
            >
              <p className="text-amber-300 text-sm font-medium">
                ⚠ Status may be stale — last verified over 4 hours ago
              </p>
            </div>
          )}
        </div>

        {/* Verification + Active Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Verification status */}
          <div
            className="bg-navy rounded-xl border border-border/30 p-4 flex items-center gap-3"
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
                    Pending Verification
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Active status */}
          <div
            className="bg-navy rounded-xl border border-border/30 p-4 flex items-center gap-3"
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

        {/* Inventory section — only shown if non-empty */}
        {inventory && (
          <div
            className="bg-navy rounded-xl border border-border/30 p-5 mb-4"
            data-ocid="provider.inventory_section"
          >
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-live-green" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-live-green">
                Current Availability
              </h2>
            </div>
            <p className="text-sm text-on-dark leading-relaxed">{inventory}</p>
          </div>
        )}

        {/* Reputation / Community Trust Score — only shown if > 0 */}
        {reputationScore > 0 && (
          <div
            className="bg-navy rounded-xl border border-border/30 p-5 mb-4"
            data-ocid="provider.reputation_section"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Community Trust Score
            </p>
            <ReputationStars score={reputationScore} />
          </div>
        )}

        {/* MANDATORY: PriceComparisonCard on every provider view */}
        <div className="mb-4">
          <PriceComparisonCard />
        </div>

        {/* Feature 2: Cost Plus Rx Router — trackable referral card with QR */}
        <CostPlusRxCard providerId={id} />

        <VolunteerHandoff />
      </div>
    </main>
  );
}
