// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONSTANTS — Replace with your real campaign URLs before launch
// ─────────────────────────────────────────────────────────────────────────────
const GOFUNDME_URL = "YOUR_GOFUNDME_URL"; // Replace with your GoFundMe campaign URL
const KICKSTARTER_URL = "YOUR_KICKSTARTER_URL"; // Replace with your Kickstarter campaign URL
const PAYPAL_URL = "YOUR_PAYPAL_URL"; // Replace with your PayPal.me donation URL
const STRIPE_PAYMENT_LINK = "YOUR_STRIPE_PAYMENT_LINK"; // Replace with your Stripe Payment Link
// ─────────────────────────────────────────────────────────────────────────────

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ExternalLink,
  Heart,
  Info,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SEO } from "../components/SEO";

const DONATE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Live Now Recovery",
  url: "https://live-now-recovery-3f2.caffeine.xyz",
  description:
    "Privacy-first real-time MAT provider and harm reduction resource platform in Ohio. Helping connect people to life-saving addiction treatment.",
  address: {
    "@type": "PostalAddress",
    addressRegion: "OH",
    addressCountry: "US",
  },
  potentialAction: {
    "@type": "DonateAction",
    target: "https://live-now-recovery-3f2.caffeine.xyz/donate",
  },
};

const TIERS = [
  {
    amount: "$10/mo",
    label: "Community Starter",
    impact: "Funds 5 Narcan kits for a community kiosk",
    icon: Shield,
    color: "#6ee7d0",
  },
  {
    amount: "$25/mo",
    label: "Warm Handoff Sponsor",
    impact: "Covers warm handoff referral coordination for 1 week",
    icon: Heart,
    color: "#00ff88",
  },
  {
    amount: "$50/mo",
    label: "ZIP Code Guardian",
    impact: "Sponsors a month of real-time provider data for 1 ZIP code",
    icon: Zap,
    color: "#a78bfa",
  },
  {
    amount: "Custom",
    label: "Champion",
    impact: "Set your own amount — every dollar extends the reach",
    icon: TrendingUp,
    color: "#fbbf24",
  },
];

const PLATFORMS = [
  {
    label: "Donate on GoFundMe",
    url: GOFUNDME_URL,
    color: "#00b964",
    bg: "rgba(0,185,100,0.10)",
    border: "rgba(0,185,100,0.35)",
  },
  {
    label: "Back us on Kickstarter",
    url: KICKSTARTER_URL,
    color: "#05ce78",
    bg: "rgba(5,206,120,0.10)",
    border: "rgba(5,206,120,0.35)",
  },
  {
    label: "Donate via PayPal",
    url: PAYPAL_URL,
    color: "#009cde",
    bg: "rgba(0,156,222,0.10)",
    border: "rgba(0,156,222,0.35)",
  },
  {
    label: "Set Up Monthly Giving (Stripe)",
    url: STRIPE_PAYMENT_LINK,
    color: "#635bff",
    bg: "rgba(99,91,255,0.10)",
    border: "rgba(99,91,255,0.35)",
  },
];

const IS_PLACEHOLDER = PLATFORMS.some((p) => p.url.startsWith("YOUR_"));

export function DonatePage() {
  return (
    <main className="min-h-screen bg-background" data-ocid="donate.page">
      <SEO
        title="Donate | Fund Recovery in Ohio | Live Now Recovery"
        description="Support medication-assisted treatment access in Ohio. Your donation funds Narcan kits, warm handoffs, and real-time recovery resources for communities hit hardest by the opioid crisis."
        keywords="donate recovery Ohio, fund MAT treatment, opioid crisis donation, Narcan kits fund, harm reduction donation Ohio"
        canonical="/donate"
        jsonLd={DONATE_JSON_LD}
      />

      {/* ── Hero ── */}
      <section
        className="w-full px-4 pt-16 pb-14"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.042 225), oklch(0.22 0.050 225), oklch(0.30 0.072 196))",
        }}
        data-ocid="donate.section"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5"
            style={{
              background: "oklch(0.68 0.1 218 / 0.12)",
              border: "1px solid oklch(0.68 0.1 218 / 0.35)",
              color: "oklch(0.78 0.14 196)",
            }}
          >
            <Heart className="w-3.5 h-3.5" />
            Fund the Movement
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-foreground mb-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Fund the{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #6ee7d0, #00ff88)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Future of Recovery
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-foreground/75 max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Every dollar you give puts real-time recovery resources in the hands
            of someone in crisis — before the ER, before the next dose, before
            it's too late.
          </motion.p>

          {/* Stats bar */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              {
                stat: "5,232",
                label: "Ohioans died from overdose in 2023",
                color: "#f87171",
              },
              {
                stat: "50–70%",
                label: "overdose mortality reduction with MAT",
                color: "#00ff88",
              },
              {
                stat: "$25,000",
                label: "saved per prevented ER/OD event",
                color: "#6ee7d0",
              },
            ].map(({ stat, label, color }) => (
              <div
                key={stat}
                className="rounded-xl px-4 py-3 text-left"
                style={{
                  background: "oklch(0.20 0.038 225 / 0.7)",
                  border: "1px solid oklch(0.30 0.04 225 / 0.5)",
                }}
              >
                <p
                  className="text-2xl font-extrabold tabular-nums leading-none mb-1"
                  style={{ color }}
                >
                  {stat}
                </p>
                <p className="text-xs text-foreground/60 leading-snug">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Impact Tiers ── */}
      <section
        className="w-full px-4 py-14"
        style={{ background: "oklch(0.12 0.020 240)" }}
        data-ocid="donate.section"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2">
            Your Impact, Tier by Tier
          </h2>
          <p className="text-center text-foreground/60 mb-10 text-sm">
            Every contribution level maps directly to a real community outcome.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TIERS.map(({ amount, label, impact, icon: Icon, color }, i) => (
              <motion.div
                key={amount}
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{
                  background: "oklch(0.15 0.030 240)",
                  border: `1px solid ${color}33`,
                  boxShadow: `0 0 24px ${color}10`,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                data-ocid={`donate.tier.${i + 1}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xl font-extrabold leading-none mb-0.5"
                      style={{ color }}
                    >
                      {amount}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                      {label}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  {impact}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Donation Platforms ── */}
      <section
        className="w-full px-4 py-14"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.14 0.028 240) 0%, oklch(0.12 0.020 240) 100%)",
        }}
        data-ocid="donate.section"
      >
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2">
            Choose How to Give
          </h2>
          <p className="text-center text-foreground/60 mb-10 text-sm">
            All major donation platforms supported.
          </p>

          <div className="flex flex-col gap-4">
            {PLATFORMS.map(({ label, url, color, bg, border }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl px-6 py-4 font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2"
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  color,
                }}
                data-ocid="donate.platform_button"
              >
                <span>{label}</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            ))}
          </div>

          {/* Placeholder notice */}
          {IS_PLACEHOLDER && (
            <div
              className="mt-6 rounded-xl px-5 py-4 flex items-start gap-3"
              style={{
                background: "oklch(0.26 0.09 60 / 0.15)",
                border: "1px solid oklch(0.75 0.15 60 / 0.30)",
              }}
              data-ocid="donate.placeholder_notice"
            >
              <Info
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: "oklch(0.82 0.15 60)" }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(0.75 0.08 60)" }}
              >
                <strong>Developer note:</strong> Donation links above are
                placeholders. To activate, replace the{" "}
                <code className="font-mono text-[11px]">GOFUNDME_URL</code>,{" "}
                <code className="font-mono text-[11px]">KICKSTARTER_URL</code>,{" "}
                <code className="font-mono text-[11px]">PAYPAL_URL</code>, and{" "}
                <code className="font-mono text-[11px]">
                  STRIPE_PAYMENT_LINK
                </code>{" "}
                constants at the top of{" "}
                <code className="font-mono text-[11px]">DonatePage.tsx</code>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Volunteer CTA ── */}
      <section
        className="w-full px-4 py-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.042 225), oklch(0.20 0.060 196))",
          borderTop: "1px solid oklch(0.26 0.040 225 / 0.5)",
        }}
        data-ocid="donate.section"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users
              className="w-5 h-5"
              style={{ color: "oklch(0.78 0.14 196)" }}
            />
            <p
              className="text-lg font-bold"
              style={{ color: "oklch(0.90 0.02 200)" }}
            >
              Join 47+ community volunteers already making a difference.
            </p>
          </div>
          <p className="text-foreground/60 text-sm mb-6">
            Not able to donate right now? Your time is just as valuable.
          </p>
          <Button
            asChild
            className="min-h-[48px] px-8 font-bold text-base rounded-xl gap-2 hover:-translate-y-0.5 transition-all duration-200"
            style={{
              background: "oklch(0.68 0.18 196 / 0.15)",
              border: "1px solid oklch(0.68 0.18 196 / 0.40)",
              color: "oklch(0.82 0.14 196)",
            }}
            data-ocid="donate.volunteer_link"
          >
            <Link to="/helper">
              Volunteer Instead <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
