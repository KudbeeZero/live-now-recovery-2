import { Badge } from "@/components/ui/badge";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { PriceComparisonCard } from "../components/PriceComparisonCard";
import { VolunteerHandoff } from "../components/VolunteerHandoff";
import { useAllProviders } from "../hooks/useQueries";
import {
  isProviderStale,
  statusColor,
  statusLabel,
} from "../utils/providerUtils";

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

        <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-navy">{provider.name}</h1>
            <Badge
              style={{ background: color, color: "white" }}
              className="shrink-0"
            >
              {statusLabel(provider.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
              className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200"
              data-ocid="provider.error_state"
            >
              <p className="text-amber-700 text-sm font-medium">
                ⚠ Status may be stale — last verified over 4 hours ago
              </p>
            </div>
          )}
        </div>

        {/* MANDATORY: PriceComparisonCard on every provider view */}
        <div className="mb-6">
          <PriceComparisonCard />
        </div>

        <VolunteerHandoff />
      </div>
    </main>
  );
}
