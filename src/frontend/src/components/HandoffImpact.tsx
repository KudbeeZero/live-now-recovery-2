import { MapPin, TrendingUp } from "lucide-react";
import { useHandoffCountsByZip, useTotalHandoffs } from "../hooks/useQueries";

export function HandoffImpact() {
  const { data: total = 0n } = useTotalHandoffs();
  const { data: zipCounts = [] } = useHandoffCountsByZip();

  const sorted = [...zipCounts].sort((a, b) => (b[1] > a[1] ? 1 : -1));

  return (
    <div
      className="bg-white rounded-2xl shadow-card border border-border p-6"
      data-ocid="impact.panel"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cplus-teal/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-cplus-teal" />
        </div>
        <div>
          <h3 className="font-bold text-navy text-base">
            Proof of Presence Impact
          </h3>
          <p className="text-xs text-muted-foreground">
            Anonymous handoff verification counts
          </p>
        </div>
      </div>

      <div className="text-center py-4 mb-6 bg-cplus-teal/5 rounded-xl border border-cplus-teal/20">
        <p className="text-5xl font-bold text-cplus-teal">{total.toString()}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Total Verified Handoffs
        </p>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-2" data-ocid="impact.list">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            By ZIP Code
          </p>
          {sorted.map(([zip, count], i) => {
            const maxCount = sorted.length > 0 ? Number(sorted[0][1]) : 1;
            return (
              <div
                key={zip}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                data-ocid={`impact.item.${i + 1}`}
              >
                <MapPin className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className="font-mono text-sm font-semibold text-navy">
                  {zip}
                </span>
                <div className="flex-1 mx-2">
                  <div
                    className="h-2 rounded-full bg-cplus-teal/20"
                    style={{
                      width: `${Math.min(100, (Number(count) / maxCount) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-cplus-teal">
                  {count.toString()}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="text-center py-6 text-muted-foreground"
          data-ocid="impact.empty_state"
        >
          <p className="text-sm">No handoffs recorded yet.</p>
          <p className="text-xs mt-1">
            Generate a QR token to begin tracking presence.
          </p>
        </div>
      )}
    </div>
  );
}
