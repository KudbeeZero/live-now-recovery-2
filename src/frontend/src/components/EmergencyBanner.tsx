import { AlertTriangle } from "lucide-react";
import { useEmergencyMode } from "../hooks/useEmergencyMode";

// HARD RULE: No toggle. No feature flag. No conditional hide. Always rendered.
export function EmergencyBanner() {
  const isEmergencyMode = useEmergencyMode();

  return (
    <div
      className="w-full bg-destructive text-destructive-foreground text-sm font-medium py-2.5 px-4"
      role="alert"
      aria-live="polite"
      aria-label="Emergency crisis resources"
      data-ocid="emergency.banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap text-center">
        <AlertTriangle
          className="w-4 h-4 shrink-0 pulse-slow"
          aria-hidden="true"
        />
        <span className="font-semibold">NEED HELP NOW? Call Ohio MAR NOW:</span>
        <a
          href="tel:833-234-6343"
          className="font-bold underline underline-offset-2 hover:opacity-90 transition-opacity min-h-[44px] inline-flex items-center"
          data-ocid="emergency.link"
        >
          833-234-6343
        </a>
        {isEmergencyMode && (
          <span className="opacity-90">
            | After Hours Crisis Support Available
          </span>
        )}
      </div>
    </div>
  );
}
