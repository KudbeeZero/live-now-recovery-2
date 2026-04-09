import { AlertTriangle, MapPin, MessageSquare, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSubmitCitizenReport } from "../hooks/useQueries";
import type { ActivityTypeValue } from "../types/community";

interface Props {
  onClose: () => void;
}

const ACTIVITY_OPTIONS: {
  value: ActivityTypeValue;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: "narcan-used", label: "Narcan Used", emoji: "💚", color: "#22c55e" },
  {
    value: "area-concern",
    label: "Area Concern",
    emoji: "⚠️",
    color: "#f97316",
  },
  {
    value: "resource-found",
    label: "Resource Found",
    emoji: "📍",
    color: "#60a5fa",
  },
  { value: "check-in", label: "Check In", emoji: "✅", color: "#a78bfa" },
];

export function CitizenReportComposer({ onClose }: Props) {
  const [zip, setZip] = useState("");
  const [activityType, setActivityType] =
    useState<ActivityTypeValue>("narcan-used");
  const [description, setDescription] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitMutation = useSubmitCitizenReport();
  const backdropRef = useRef<HTMLDivElement>(null);

  const remaining = 280 - description.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!zip.trim() || zip.length < 5) {
      toast.error("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setSubmitting(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      if (useLocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, {
              timeout: 6000,
            }),
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          /* geolocation denied — continue without coords */
        }
      }
      await submitMutation.mutateAsync({
        zipCode: zip.trim(),
        activityType,
        content: description.trim() || "No additional details.",
        lat,
        lng,
      });
      toast.success(
        "Report submitted. Thank you for keeping the community safe.",
      );
      onClose();
    } catch {
      toast.error("Could not submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      onKeyDown={handleBackdropKeyDown}
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      data-ocid="citizen-report.modal_backdrop"
    >
      <dialog
        open
        className="w-full max-w-md rounded-2xl overflow-hidden p-0 m-0"
        style={{
          background: "#0d1b2a",
          border: "1px solid rgba(0,255,136,0.18)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,136,0.06)",
          position: "relative",
        }}
        aria-label="Submit a community report"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "rgba(0,255,136,0.12)",
                border: "1px solid rgba(0,255,136,0.25)",
              }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: "#00ff88" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                Report Activity
              </p>
              <p
                className="text-[11px]"
                style={{ color: "rgba(110,231,208,0.65)" }}
              >
                Anonymous · No personal info required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report composer"
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            data-ocid="citizen-report.modal_close"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* NO-PHI notice */}
        <div
          className="mx-5 mt-4 mb-3 flex items-start gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: "rgba(249,115,22,0.08)",
            border: "1px solid rgba(249,115,22,0.2)",
          }}
        >
          <AlertTriangle
            className="w-3.5 h-3.5 mt-0.5 shrink-0"
            style={{ color: "#fb923c" }}
          />
          <p className="text-[11px] leading-snug" style={{ color: "#fdba74" }}>
            <span className="font-semibold">NO-PHI:</span> Please do not include
            personal names, identifying details, or medical information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          {/* ZIP code */}
          <div className="space-y-1.5">
            <label
              htmlFor="cr-zip"
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "rgba(110,231,208,0.8)" }}
            >
              ZIP Code <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              id="cr-zip"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              placeholder="e.g. 44105"
              value={zip}
              onChange={(e) =>
                setZip(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              data-ocid="citizen-report.zip_input"
            />
          </div>

          {/* Activity type */}
          <fieldset className="space-y-1.5 border-none p-0 m-0">
            <legend
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "rgba(110,231,208,0.8)" }}
            >
              Activity Type
            </legend>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActivityType(opt.value)}
                  aria-pressed={activityType === opt.value}
                  data-ocid={`citizen-report.type_${opt.value}`}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={{
                    background:
                      activityType === opt.value
                        ? `${opt.color}22`
                        : "rgba(255,255,255,0.04)",
                    border:
                      activityType === opt.value
                        ? `1px solid ${opt.color}55`
                        : "1px solid rgba(255,255,255,0.08)",
                    color:
                      activityType === opt.value
                        ? opt.color
                        : "rgba(255,255,255,0.55)",
                  }}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <span className="text-xs leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="cr-description"
              className="block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "rgba(110,231,208,0.8)" }}
            >
              Details{" "}
              <span
                className="font-normal normal-case"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                (optional)
              </span>
            </label>
            <textarea
              id="cr-description"
              rows={3}
              maxLength={280}
              placeholder="Describe what you observed. Location and activity only — no personal details."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 resize-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              data-ocid="citizen-report.description_input"
            />
            <p
              className="text-right text-[11px]"
              style={{
                color: remaining < 40 ? "#f87171" : "rgba(255,255,255,0.3)",
              }}
            >
              {remaining} characters remaining
            </p>
          </div>

          {/* Optional location */}
          <label
            htmlFor="cr-use-location"
            className="flex items-center gap-2.5 cursor-pointer"
            data-ocid="citizen-report.use_location_toggle"
          >
            <div className="relative w-5 h-5 shrink-0">
              <input
                type="checkbox"
                id="cr-use-location"
                checked={useLocation}
                onChange={(e) => setUseLocation(e.target.checked)}
                className="sr-only"
              />
              <div
                aria-hidden="true"
                className="w-5 h-5 rounded flex items-center justify-center transition-all"
                style={{
                  background: useLocation
                    ? "rgba(0,255,136,0.2)"
                    : "rgba(255,255,255,0.05)",
                  border: useLocation
                    ? "1px solid rgba(0,255,136,0.5)"
                    : "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {useLocation && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <title>Checked</title>
                    <path
                      d="M1.5 5L4 7.5L8.5 2.5"
                      stroke="#00ff88"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <MapPin
                className="w-3 h-3 shrink-0"
                style={{ color: "rgba(0,255,136,0.6)" }}
              />
              Share approximate location (helps accuracy)
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !zip || zip.length < 5}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: submitting
                ? "rgba(0,255,136,0.1)"
                : "rgba(0,255,136,0.15)",
              border: "1px solid rgba(0,255,136,0.35)",
              color: "#00ff88",
              boxShadow: submitting ? "none" : "0 0 12px rgba(0,255,136,0.15)",
            }}
            data-ocid="citizen-report.submit_btn"
          >
            {submitting ? "Submitting…" : "Submit Report"}
          </button>
        </form>
      </dialog>
    </div>
  );
}
