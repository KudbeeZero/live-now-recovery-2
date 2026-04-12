import { useGetHarmReductionInventory } from "../hooks/useQueries";
import { HARM_REDUCTION_ITEMS } from "../types/community";

interface Props {
  providerId: string;
  showTitle?: boolean;
}

// ─── Skeleton shimmer chip ─────────────────────────────────────────────────────
function SkeletonChip() {
  return <div className="h-8 w-32 rounded-full bg-muted/50 animate-pulse" />;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function HarmReductionInventoryPanel({
  providerId,
  showTitle = true,
}: Props) {
  const { data: inventory = [], isLoading } =
    useGetHarmReductionInventory(providerId);

  const hasAnyAvailable = inventory.some((item) => item.available);

  return (
    <div
      className="bg-card rounded-xl border border-border/30 p-4"
      data-ocid="provider.harm_reduction_panel"
    >
      {showTitle && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base" aria-hidden="true">
            💊
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-live-green">
            Available at This Location
          </h2>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <SkeletonChip key={`skeleton-${k}`} />
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Contact provider for supply availability. Many locations distribute
          Narcan kits, fentanyl test strips, and clean syringes free of charge
          through programs like the{" "}
          <span className="text-foreground/80">
            Cuyahoga County Board of Health
          </span>{" "}
          and the{" "}
          <span className="text-foreground/80">
            AIDS Task Force of Greater Cleveland
          </span>
          .
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {HARM_REDUCTION_ITEMS.map((meta) => {
              const record = inventory.find(
                (item) => item.itemType === meta.key,
              );
              const available = record?.available ?? false;
              const qty =
                record?.quantity && record.quantity.length > 0
                  ? Number(record.quantity[0])
                  : null;
              const note =
                record?.notes && record.notes.length > 0
                  ? record.notes[0]
                  : null;

              return (
                <div
                  key={meta.key}
                  title={note ?? meta.label}
                  aria-label={`${meta.label}: ${available ? "available" : "unavailable"}${qty !== null ? `, ${qty} in stock` : ""}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    available
                      ? "bg-teal-500/15 border-teal-500/40 text-teal-200"
                      : "bg-muted/30 border-border/20 text-muted-foreground/50"
                  }`}
                >
                  <span aria-hidden="true">{meta.icon}</span>
                  <span>{meta.label}</span>
                  {available ? (
                    <span className="text-teal-400 font-bold">✓</span>
                  ) : (
                    <span className="opacity-40">✗</span>
                  )}
                  {available && qty !== null && (
                    <span className="ml-0.5 text-teal-400/80">({qty})</span>
                  )}
                </div>
              );
            })}
          </div>

          {hasAnyAvailable && (
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="text-live-green font-semibold">Free</span>, no
              questions asked. Distributed in partnership with{" "}
              <span className="text-foreground/70">
                FrontLine Service &amp; Recovery Resources
              </span>
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}
