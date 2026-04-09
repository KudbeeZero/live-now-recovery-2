import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("cookie_consent");
    if (!existing) {
      setVisible(true);
    }
    setMounted(true);

    function handleUpdate() {
      setVisible(false);
    }
    window.addEventListener("cookie-consent-updated", handleUpdate);
    return () =>
      window.removeEventListener("cookie-consent-updated", handleUpdate);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[oklch(0.13_0.018_225)] border-t border-border shadow-lg transition-transform duration-500 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-label="Cookie consent"
      data-ocid="cookie-banner.panel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-sm text-[oklch(0.72_0.03_225)] leading-relaxed max-w-2xl">
            <span className="font-semibold text-foreground">
              We use essential cookies
            </span>{" "}
            to keep this platform working. We never track patients or collect
            health data.{" "}
            <Link
              to="/privacy"
              className="text-[oklch(0.62_0.17_155)] hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/cookies"
              onClick={() => {
                localStorage.setItem("cookie_consent", "managing");
                setVisible(false);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              data-ocid="cookie-banner.manage"
            >
              Manage Cookies
            </Link>
            <button
              type="button"
              onClick={accept}
              className="px-5 py-2 rounded-lg bg-[oklch(0.62_0.17_155)] hover:bg-[oklch(0.55_0.17_155)] text-[oklch(0.10_0.008_240)] text-sm font-semibold transition-colors"
              data-ocid="cookie-banner.accept"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
