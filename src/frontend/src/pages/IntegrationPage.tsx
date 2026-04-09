import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Eye,
    title: "Monitor",
    desc: "Sentinel continuously monitors provider availability signals across the network, detecting when providers go offline unexpectedly or demand surges in a ZIP code.",
  },
  {
    step: 2,
    icon: Activity,
    title: "Score",
    desc: "Each provider session is assigned a real-time risk score (0–100). Scores above 80 trigger a high-risk window alert visible to admins on the platform.",
  },
  {
    step: 3,
    icon: AlertTriangle,
    title: "Alert",
    desc: "When a high-risk window is detected, admins receive an in-app alert and the platform surfaces emergency providers automatically to reduce gap time.",
  },
];

const TECH_ROWS = [
  { label: "Canister endpoint", value: "receiveRiskPacket" },
  {
    label: "Payload fields",
    value:
      "provider_id, data_source, risk_score (0–100), last_update_time, status",
  },
  {
    label: "Push frequency",
    value: "Every 5 minutes during active monitoring windows",
  },
  {
    label: "Alert threshold",
    value: "Risk score > 80 activates high-risk window in admin panel",
  },
  {
    label: "Data retention",
    value: "Risk packets stored in canister state for current session only",
  },
];

export function IntegrationPage() {
  const [techOpen, setTechOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background" data-ocid="integration.page">
      {/* ── Header ── */}
      <section className="bg-navy px-4 py-16" data-ocid="integration.section">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-live-green mb-3">
            AI-Powered Safety
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Lightning AI <span className="text-live-green">Sentinel</span>{" "}
            Integration
          </h1>
          <p className="text-on-dark text-lg max-w-2xl">
            Real-time risk detection powered by Lightning AI — keeping providers
            and patients safer.
          </p>
        </div>
      </section>

      {/* ── Section 1: What is Sentinel ── */}
      <section className="py-14 px-4" data-ocid="integration.section">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            What is Lightning AI Sentinel?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Live Now Recovery integrates with Lightning AI's Sentinel system
                to provide real-time risk scoring for provider sessions.
                Sentinel monitors provider availability signals and flags
                high-risk windows — periods when demand spikes, providers drop
                offline suddenly, or unusual access patterns emerge.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When a high-risk window is active, admins are alerted
                immediately inside the platform. Emergency providers are
                surfaced automatically so patients are never left without
                options during a critical gap.
              </p>
            </div>

            {/* Mock Sentinel status card */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "oklch(0.13 0.03 240)",
                border: "1px solid oklch(0.28 0.06 145 / 0.5)",
                boxShadow: "0 0 24px oklch(0.82 0.18 145 / 0.06)",
              }}
              data-ocid="integration.panel"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "oklch(0.60 0.04 220)" }}
                >
                  Sentinel Status
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      background: "#00ff88",
                      boxShadow: "0 0 6px rgba(0,255,136,0.8)",
                    }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#00ff88" }}
                  >
                    ACTIVE
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Last risk scan", value: "2 minutes ago" },
                  { label: "Current risk window", value: "NORMAL" },
                  { label: "Providers monitored", value: "18" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="text-sm"
                      style={{ color: "oklch(0.58 0.03 220)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.88 0.08 195)" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 pt-4 text-xs"
                style={{
                  borderTop: "1px solid oklch(0.20 0.04 240)",
                  color: "oklch(0.45 0.03 220)",
                }}
              >
                Next scan in ~3 minutes · Region 13 · Ohio
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: How it Works ── */}
      <section
        className="py-14 px-4"
        style={{ background: "oklch(0.13 0.02 230)" }}
        data-ocid="integration.section"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            How Sentinel Protects Recovery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="rounded-2xl p-6"
                style={{
                  background: "oklch(0.16 0.03 240)",
                  border: "1px solid oklch(0.24 0.05 240)",
                }}
                data-ocid={`integration.item.${step}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "oklch(0.82 0.18 145 / 0.12)",
                      border: "1px solid oklch(0.82 0.18 145 / 0.25)",
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#00ff88" }} />
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "oklch(0.50 0.04 220)" }}
                  >
                    Step {step}
                  </span>
                </div>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: "oklch(0.90 0.01 200)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.60 0.03 220)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Privacy First ── */}
      <section className="py-14 px-4" data-ocid="integration.section">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Privacy-First Risk Detection
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
            Sentinel operates entirely on anonymized provider logistics data. No
            patient information is ever transmitted. Risk scores are computed on
            session patterns and availability signals only — never on individual
            patient identity or search behavior.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-live-green/10 border border-live-green/30">
            <Shield className="w-4 h-4 text-live-green" />
            <Badge
              variant="outline"
              className="border-live-green/40 text-live-green bg-transparent font-bold tracking-wider"
            >
              NO-PHI
            </Badge>
            <span className="text-sm text-live-green font-medium">
              Zero patient data transmitted
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 4: Technical Details (accordion) ── */}
      <section
        className="py-14 px-4"
        style={{ background: "oklch(0.13 0.02 230)" }}
        data-ocid="integration.section"
      >
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => setTechOpen((v) => !v)}
            className="w-full flex items-center justify-between p-6 rounded-2xl text-left min-h-[64px] transition-colors hover:opacity-90"
            style={{
              background: "oklch(0.16 0.03 240)",
              border: "1px solid oklch(0.24 0.05 240)",
            }}
            data-ocid="integration.open_modal_button"
            aria-expanded={techOpen}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5" style={{ color: "#00ff88" }} />
              <span
                className="font-bold text-lg"
                style={{ color: "oklch(0.90 0.01 200)" }}
              >
                Technical Integration
              </span>
            </div>
            {techOpen ? (
              <ChevronUp
                className="w-5 h-5 shrink-0"
                style={{ color: "oklch(0.55 0.03 220)" }}
              />
            ) : (
              <ChevronDown
                className="w-5 h-5 shrink-0"
                style={{ color: "oklch(0.55 0.03 220)" }}
              />
            )}
          </button>

          {techOpen && (
            <div
              className="rounded-b-2xl -mt-1 px-6 pb-6 pt-5"
              style={{
                background: "oklch(0.16 0.03 240)",
                border: "1px solid oklch(0.24 0.05 240)",
                borderTop: "1px solid oklch(0.20 0.04 240)",
              }}
              data-ocid="integration.panel"
            >
              <div
                className="divide-y"
                style={{ borderColor: "oklch(0.20 0.04 240)" }}
              >
                {TECH_ROWS.map(({ label, value }) => (
                  <div
                    key={label}
                    className="py-3 grid grid-cols-1 sm:grid-cols-5 gap-1 sm:gap-4"
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wide sm:col-span-2"
                      style={{ color: "oklch(0.55 0.04 220)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm font-mono sm:col-span-3"
                      style={{ color: "oklch(0.82 0.10 175)" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
