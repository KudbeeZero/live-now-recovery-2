import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Shield } from "lucide-react";
import type { ProviderWithStatus } from "../backend";
import { ProviderStatus } from "../backend";
import { isProviderStale } from "../utils/providerUtils";

export interface ProviderCardProps {
  provider: ProviderWithStatus;
  index?: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Returns gradient classes based on provider type.
 * Used for both the top bar and the avatar background.
 */
function getProviderTypeGradient(providerType: string): string {
  const t = providerType.toLowerCase();
  if (t === "mat" || t === "mat clinic") return "from-teal-500 to-cyan-600";
  if (t.includes("er") || t.includes("emergency") || t.includes("hospital"))
    return "from-amber-500 to-orange-600";
  if (t === "naloxone kiosk" || t === "kiosk" || t.includes("vending"))
    return "from-emerald-500 to-emerald-700";
  if (t.includes("telehealth")) return "from-purple-500 to-purple-700";
  if (t.includes("pharmacy")) return "from-blue-500 to-blue-700";
  return "from-teal-500 to-teal-700";
}

/**
 * Returns the type label badge styling.
 */
function getProviderTypeBadgeStyle(providerType: string): string {
  const t = providerType.toLowerCase();
  if (t === "mat" || t === "mat clinic")
    return "text-teal-300 border-teal-500/40 bg-teal-500/10";
  if (t.includes("er") || t.includes("emergency") || t.includes("hospital"))
    return "text-amber-300 border-amber-500/40 bg-amber-500/10";
  if (t === "naloxone kiosk" || t === "kiosk" || t.includes("vending"))
    return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
  if (t.includes("telehealth"))
    return "text-purple-300 border-purple-500/40 bg-purple-500/10";
  if (t.includes("pharmacy"))
    return "text-blue-300 border-blue-500/40 bg-blue-500/10";
  return "text-teal-300 border-teal-500/40 bg-teal-500/10";
}

/**
 * Derives a short services preview from provider type.
 */
const SERVICES_MAP: Record<string, string[]> = {
  "mat clinic": ["Counseling", "Group Therapy", "Peer Support"],
  "narcan distribution": ["Free Narcan", "Training", "Referrals"],
  "emergency room": ["Crisis Care", "Bridge Rx", "Warm Handoff"],
  "naloxone kiosk": ["24/7 Access", "Anonymous", "No ID"],
  "telehealth mat": ["Video Visits", "e-Prescribing", "Remote Monitoring"],
  pharmacy: ["Rx Pickup", "Naloxone OTC", "Consultation"],
};

function getServiceTags(providerType: string): string[] {
  const t = providerType.toLowerCase();
  return SERVICES_MAP[t] ?? ["MAT Services", "Harm Reduction", "Support"];
}

/**
 * Extracts a rough phone number from the inventory JSON string if present.
 * The inventory field is free-form JSON — we try to parse a phone key.
 */
function extractPhone(inventory: string): string | null {
  try {
    const parsed = JSON.parse(inventory) as Record<string, unknown>;
    if (typeof parsed.phone === "string" && parsed.phone) return parsed.phone;
    if (typeof parsed.contact === "string" && parsed.contact)
      return parsed.contact;
  } catch {
    // not JSON — check if inventory is a plain phone string
    const match = inventory.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
    if (match) return match[0];
  }
  return null;
}

export function ProviderCard({ provider, index = 0 }: ProviderCardProps) {
  const gradient = getProviderTypeGradient(provider.providerType);
  const badgeStyle = getProviderTypeBadgeStyle(provider.providerType);
  const serviceTags = getServiceTags(provider.providerType).slice(0, 3);
  const phone = extractPhone(provider.inventory);
  const initials = getInitials(provider.name);

  const isStale = isProviderStale(provider.lastVerified);
  const isLive = provider.status === ProviderStatus.Live && !isStale;
  const isOffline = provider.status === ProviderStatus.Offline;

  const statusDot = isLive
    ? "bg-[#00ff88] animate-pulse"
    : isOffline
      ? "bg-muted-foreground"
      : "bg-amber-400";
  const statusText = isLive ? "LIVE NOW" : isOffline ? "Offline" : "Unverified";
  const statusColor = isLive
    ? "text-[#00ff88]"
    : isOffline
      ? "text-muted-foreground"
      : "text-amber-400";

  // Humanized type label
  const typeLabel =
    provider.providerType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Provider";

  return (
    <div
      data-ocid={`provider_card.item.${index + 1}`}
      className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[var(--brand-teal-glow)] hover:border-[var(--brand-teal)] flex flex-col cursor-pointer"
    >
      {/* Gradient top bar — matches VolunteerCard pattern */}
      <div className={`h-1 w-full bg-gradient-to-r ${gradient} opacity-80`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Top row: avatar + name + status */}
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shadow-md`}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground truncate">
              {provider.name}
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-4 mt-0.5 border ${badgeStyle}`}
            >
              {typeLabel}
            </Badge>
          </div>
          {/* Status indicator */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <span
              className={`flex items-center gap-1 text-[10px] font-bold ${statusColor}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              {statusText}
            </span>
          </div>
        </div>

        {/* Address / location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
            {provider.name.includes(",")
              ? provider.name.split(",").slice(-1)[0].trim()
              : "Northeast Ohio"}
          </span>
        </div>

        {/* Services preview tags */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
            <Shield className="h-3 w-3" /> Services
          </p>
          <div className="flex flex-wrap gap-1">
            {serviceTags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded-full border font-medium text-teal-300 border-teal-500/30 bg-teal-500/8"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Phone number if available */}
        {phone && (
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-teal transition-colors"
            onClick={(e) => e.stopPropagation()}
            data-ocid={`provider_card.phone.${index + 1}`}
          >
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{phone}</span>
          </a>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Verification badge */}
        {provider.is_verified && (
          <div className="flex items-center gap-1 text-[9px] text-teal-400 font-semibold">
            <Shield className="h-2.5 w-2.5" />
            Verified Provider
          </div>
        )}
      </div>

      {/* View Profile CTA — same full-width pattern as VolunteerCard */}
      <div className="px-5 pb-4">
        <Button
          asChild
          size="sm"
          className="w-full bg-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/90 text-white font-semibold text-xs"
          data-ocid={`provider_card.view_button.${index + 1}`}
        >
          <Link to="/provider/$id" params={{ id: provider.id }}>
            View Profile
          </Link>
        </Button>
      </div>
    </div>
  );
}
