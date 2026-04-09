import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

const COOKIE_TABLE = [
  {
    name: "session",
    purpose: "Keeps you signed in during your visit",
    duration: "Session (clears on close)",
  },
  {
    name: "auth_token",
    purpose: "Internet Identity authentication token",
    duration: "7 days",
  },
  {
    name: "cookie_consent",
    purpose: "Remembers your cookie preference",
    duration: "1 year",
  },
];

export function CookiesPage() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("cookie_analytics") === "true";
  });

  function savePreferences() {
    localStorage.setItem("cookie_consent", "accepted");
    localStorage.setItem(
      "cookie_analytics",
      analyticsEnabled ? "true" : "false",
    );
    window.dispatchEvent(new Event("cookie-consent-updated"));
    toast.success("Cookie preferences saved.");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[oklch(0.14_0.018_225)] border-b border-border py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[oklch(0.62_0.17_155)] mb-2">
            Cookie Policy
          </h1>
          <p className="text-[oklch(0.72_0.03_225)] text-lg">
            Effective April 2026
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Intro */}
        <div className="bg-card/50 border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[oklch(0.80_0.12_196)] mb-3">
            What Are Cookies?
          </h2>
          <p className="text-[oklch(0.72_0.03_225)] leading-relaxed">
            Cookies are small text files stored on your device when you visit a
            website. Live Now Recovery uses only{" "}
            <strong className="text-foreground">
              essential functional cookies
            </strong>{" "}
            — the minimum required to keep the platform working. We do not use
            advertising cookies, tracking pixels, or any third-party analytics
            SDKs.
          </p>
        </div>

        {/* Cookie Table */}
        <div className="bg-card/50 border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[oklch(0.80_0.12_196)] mb-4">
            Cookies We Use
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 font-semibold text-foreground">
                    Cookie
                  </th>
                  <th className="pb-3 pr-4 font-semibold text-foreground">
                    Purpose
                  </th>
                  <th className="pb-3 font-semibold text-foreground">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="text-[oklch(0.72_0.03_225)]">
                {COOKIE_TABLE.map((row) => (
                  <tr key={row.name} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-mono text-xs text-[oklch(0.62_0.17_155)]">
                      {row.name}
                    </td>
                    <td className="py-3 pr-4">{row.purpose}</td>
                    <td className="py-3 text-xs">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preference Center */}
        <div className="bg-card/50 border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[oklch(0.80_0.12_196)] mb-4">
            Manage Your Preferences
          </h2>
          <div className="space-y-4">
            {/* Essential — always on */}
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div>
                <p className="font-medium text-foreground">Essential Cookies</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Required for authentication and core platform functionality.
                  Cannot be disabled.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="text-xs text-muted-foreground">Always On</span>
                <Switch
                  checked={true}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                  aria-label="Essential cookies — always on"
                />
              </div>
            </div>

            {/* Analytics — user can toggle */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Analytics Cookies</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Helps us understand aggregate usage patterns to improve the
                  platform. Fully anonymous — no personal data.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="text-xs text-muted-foreground">
                  {analyticsEnabled ? "On" : "Off"}
                </span>
                <Switch
                  checked={analyticsEnabled}
                  onCheckedChange={setAnalyticsEnabled}
                  aria-label="Toggle analytics cookies"
                  data-ocid="cookies.analytics-toggle"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={savePreferences}
            className="mt-6 bg-[oklch(0.62_0.17_155)] hover:bg-[oklch(0.55_0.17_155)] text-[oklch(0.10_0.008_240)] font-semibold"
            data-ocid="cookies.save-preferences"
          >
            Save Preferences
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center pb-8">
          Cookie questions?{" "}
          <a
            href="mailto:privacy@livenowrecovery.org"
            className="text-[oklch(0.62_0.17_155)] hover:underline"
          >
            privacy@livenowrecovery.org
          </a>
        </p>
      </div>
    </div>
  );
}
