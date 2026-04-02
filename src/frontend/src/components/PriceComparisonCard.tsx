import { Button } from "@/components/ui/button";
import { DollarSign, ExternalLink, TrendingDown } from "lucide-react";

// TRANSPARENCY MANDATE — mandatory on every provider view
export function PriceComparisonCard() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "oklch(0.13 0.03 240)",
        border: "1px solid oklch(0.22 0.05 240)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,229,255,0.04)",
      }}
      data-ocid="price.card"
    >
      <div className="mb-5">
        <h3
          className="font-bold text-xl"
          style={{ color: "oklch(0.90 0.01 200)" }}
        >
          Know Your Costs
        </h3>
        <p className="text-sm mt-1" style={{ color: "oklch(0.58 0.03 220)" }}>
          Buprenorphine/Naloxone 8mg/2mg Film (Generic Suboxone) — 60
          films/30-day supply
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Retail */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "oklch(0.12 0.025 25)",
            border: "1px solid oklch(0.62 0.18 25 / 0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.18 25)" }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "oklch(0.72 0.18 25)" }}
            >
              MAT Retail
            </span>
          </div>
          <p
            className="text-3xl font-bold"
            style={{ color: "oklch(0.78 0.18 25)" }}
          >
            $185.00
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.02 220)" }}>
            per month
          </p>
        </div>

        {/* Cost Plus */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "oklch(0.13 0.04 195)",
            border: "1px solid oklch(0.78 0.14 195 / 0.3)",
            boxShadow: "0 0 16px rgba(0,229,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown
              className="w-4 h-4"
              style={{ color: "oklch(0.78 0.14 195)" }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "oklch(0.78 0.14 195)" }}
            >
              Mark Cuban Cost Plus Drugs
            </span>
          </div>
          <p
            className="text-3xl font-bold"
            style={{
              color: "oklch(0.82 0.14 195)",
              textShadow: "0 0 12px rgba(0,229,255,0.3)",
            }}
          >
            $45.37
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.02 220)" }}>
            per month
          </p>
        </div>
      </div>

      <div
        className="flex items-center justify-between rounded-xl p-4 mb-5"
        style={{
          background: "oklch(0.14 0.05 195 / 0.4)",
          border: "1px solid oklch(0.78 0.14 195 / 0.2)",
        }}
      >
        <div>
          <p className="text-xs" style={{ color: "oklch(0.58 0.03 220)" }}>
            Monthly Savings
          </p>
          <p
            className="text-2xl font-bold"
            style={{
              color: "oklch(0.85 0.14 195)",
              textShadow: "0 0 10px rgba(0,229,255,0.35)",
            }}
          >
            $139.63
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "oklch(0.58 0.03 220)" }}>
            MCCPD NCPDP ID
          </p>
          <p
            className="text-sm font-mono font-semibold"
            style={{ color: "oklch(0.90 0.01 200)" }}
          >
            5755167
          </p>
        </div>
      </div>

      <Button
        asChild
        className="w-full min-h-[44px] font-semibold transition-all"
        style={{
          background: "oklch(0.78 0.14 195)",
          color: "oklch(0.10 0.02 240)",
          boxShadow: "0 0 16px rgba(0,229,255,0.2)",
        }}
        data-ocid="price.primary_button"
      >
        <a href="https://costplusdrugs.com" target="_blank" rel="noreferrer">
          Transfer Script to Cost Plus <ExternalLink className="ml-2 w-4 h-4" />
        </a>
      </Button>
    </div>
  );
}
