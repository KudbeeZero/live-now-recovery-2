import {
  AlertTriangle,
  Car,
  MapPin,
  PhoneCall,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  ToggleRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PatientStep {
  icon: LucideIcon;
  step: string;
  title: string;
  desc: string;
  evidence: string | null;
  color: string;
  bg: string;
}

export interface ProviderStep {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface ProblemCallout {
  icon: LucideIcon;
  stat: string;
  text: string;
}

export const PROBLEM_CALLOUTS: ProblemCallout[] = [
  {
    icon: AlertTriangle,
    stat: "43%",
    text: "of listed providers aren't available when called — Google results are outdated by months, sometimes years.",
  },
  {
    icon: PhoneCall,
    stat: "12%",
    text: "show-up rate for cold referrals. Phone-tag and friction kill follow-through. People give up before they ever arrive.",
  },
  {
    icon: RefreshCw,
    stat: "Minutes",
    text: "is the window to act in a crisis moment — not days. The old system was never designed for urgency.",
  },
];

export const PATIENT_STEPS: PatientStep[] = [
  {
    icon: Search,
    step: "01",
    title: "Search by ZIP or GPS",
    desc: "Open the app and describe what you need — MAT clinic, Naloxone, telehealth, or same-day walk-in. Our search layer cross-references provider type, current availability, and your location in real time. No account required. No insurance information asked.",
    evidence:
      "Finding an open provider in under 60 seconds vs. 45+ minutes of phone calls.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MapPin,
    step: "02",
    title: "See Who's Live Right Now",
    desc: "The live map shows every verified provider in your area, color-coded by type and availability status. Providers update their own status — so what you see is current within hours, not months. Filter by medication type, walk-in availability, 24/7 hours, or cost.",
    evidence: null,
    color: "text-live",
    bg: "bg-live/10",
  },
  {
    icon: PhoneCall,
    step: "03",
    title: "Tap a Provider — Start a Handoff",
    desc: "Tap any provider to see full details: medications offered, services available, cost and insurance accepted, and current availability. A peer support specialist connects you directly to the clinic in real time.",
    evidence:
      "Warm handoffs show an 80% show-up rate vs. 12% for cold referrals. The difference is connection.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Car,
    step: "04",
    title: "Get a Ride (Gated)",
    desc: "Transportation is one of the most common barriers to treatment. Live Now Recovery integrates ride-share deep links directly into provider cards — one tap to open Lyft or Uber pre-filled with the clinic address. Removing that friction saves lives.",
    evidence: null,
    color: "text-amber-recovery",
    bg: "bg-amber-recovery/10",
  },
  {
    icon: QrCode,
    step: "05",
    title: "Warm Handoff via QR",
    desc: "Providers use QR code check-in at intake to confirm the handoff completed. No PHI exchanged — just a confirmation that the connection succeeded. This data feeds the platform's analytics and helps counties understand which access points are working.",
    evidence:
      "Proof of Presence closes the loop — providers see confirmed arrivals, not estimates.",
    color: "text-live",
    bg: "bg-live/10",
  },
  {
    icon: RefreshCw,
    step: "06",
    title: "4-Hour Cycle Resets",
    desc: "The platform runs a continuous 4-hour heartbeat — providers confirm availability, update walk-in status, and flag capacity changes. If a clinic fills up, the system reroutes. If a new provider goes live, they're visible immediately.",
    evidence: null,
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export const PROVIDER_STEPS: ProviderStep[] = [
  {
    icon: ShieldCheck,
    title: "Register & Get Verified",
    desc: "Providers create a profile listing their clinic type, medications offered, insurance accepted, and operating hours. Verification happens through a standard credentialing check — no additional licensing required. Most providers are live on the map within 24 hours.",
  },
  {
    icon: ToggleRight,
    title: "Use the Live Toggle",
    desc: "A simple toggle keeps your availability current. Walk-ins open? One tap. Reached capacity? One tap. The 4-hour heartbeat prompts updates automatically — reducing stale data. Providers who keep status current see 3x more warm handoff referrals.",
  },
  {
    icon: RefreshCw,
    title: "Receive Handoffs",
    desc: "When a warm handoff is completed, the provider receives a notification through their dashboard — not a cold call, not a fax. The patient is already on the way. Warm handoffs complete at an 80% rate. The platform tracks outcomes so providers can demonstrate impact to funders and state partners.",
  },
];
