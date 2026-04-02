import { Link } from "@tanstack/react-router";
import {
  Car,
  MapPin,
  PhoneCall,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  ToggleRight,
} from "lucide-react";

const PATIENT_STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Search by ZIP or GPS",
    desc: 'Enter your ZIP code in the search bar or tap "Near Me" to use your device location. No account required. Nothing is recorded.',
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MapPin,
    step: "02",
    title: "See Who's Live Right Now",
    desc: "The map updates in real time. Green pins = live now. Amber = status unverified. Gray = offline. Only providers active in the last 4 hours show as green.",
    color: "text-live",
    bg: "bg-live/10",
  },
  {
    icon: PhoneCall,
    step: "03",
    title: "Tap a Provider",
    desc: "Every provider card shows real-time status, phone number, address, and the Cost Plus Drugs pricing card. One tap calls them directly.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Car,
    step: "04",
    title: "Get a Ride (Gated)",
    desc: 'On the provider page, tap "Need a Ride?" Two checkboxes appear: confirm you have your Photo ID and are at your pickup location. Both checked → Uber and Lyft deep links activate.',
    color: "text-amber-recovery",
    bg: "bg-amber-recovery/10",
  },
  {
    icon: QrCode,
    step: "05",
    title: "Warm Handoff via QR",
    desc: "A peer specialist generates a one-time QR code tied to your ZIP. When scanned at the provider, it anonymously records a presence count — proving real access, no PHI.",
    color: "text-live",
    bg: "bg-live/10",
  },
  {
    icon: RefreshCw,
    step: "06",
    title: "4-Hour Cycle Resets",
    desc: "Providers re-verify every 4 hours by hitting their Go Live toggle. If they don't, status goes to amber. Real-time means real accountability.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const PROVIDER_STEPS = [
  {
    icon: ShieldCheck,
    title: "Register & Get Verified",
    desc: "Submit your clinic name, NPI number, address, and phone. An admin verifies your NPI against the provider registry. You appear on the map once verified.",
  },
  {
    icon: ToggleRight,
    title: "Use the Live Toggle",
    desc: 'Log into your Dashboard with Internet Identity. Hit "Go Live." Your pin turns green instantly. The 4-hour timer starts. Confirm again before it expires.',
  },
  {
    icon: RefreshCw,
    title: "Stay Active — or Go Offline",
    desc: "Closing early? Toggle off. The system respects your choices and protects patients from showing up when you can't help.",
  },
];

export function HowItWorksPage() {
  return (
    <main className="min-h-screen py-16 px-4" data-ocid="how_it_works.page">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Six steps from crisis moment to provider contact — anonymous,
            real-time, no account needed.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-2">
            For Patients & Community
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            No login. No data stored. Just the fastest path to care.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PATIENT_STEPS.map(
              ({ icon: Icon, step, title, desc, color, bg }) => (
                <div
                  key={step}
                  className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-4"
                  data-ocid={`how_it_works.step.${step}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tracking-widest">
                      STEP {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-base">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        <div className="rounded-xl border border-live/30 bg-live/5 p-6 mb-16">
          <h3 className="font-bold text-live mb-2">
            What is Proof of Presence (PoP)?
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            PoP is the anonymous signal that someone was physically at a
            provider location. A peer specialist generates a one-time QR code
            from the Helper page. It expires in 5 minutes. When scanned at the
            clinic, the system records one anonymous presence count for that ZIP
            code — no names, no patient IDs, no PHI. Aggregated across hundreds
            of events, these counts reveal where care is actually being
            accessed.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">
            For Providers
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Three steps to go live and start appearing on the map.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {PROVIDER_STEPS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-3"
              >
                <Icon className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-foreground text-base">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Register as a Provider
            </Link>
            <Link
              to="/helper"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors min-h-[44px]"
            >
              Become a Peer Helper
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
