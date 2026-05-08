import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { MapPin, Shield, Star } from "lucide-react";
import type { CredentialType } from "../backend";
import { getTierBgColor, getTierColor } from "../lib/credentials";
import type { Credential } from "../types/credentials";
import { CREDENTIAL_META } from "../types/credentials";

export interface VolunteerProfile {
  id: number;
  principal?: string;
  displayName: string;
  role: string;
  city: string;
  zip?: string;
  bio: string;
  skills: string[];
  privacyPublic: boolean;
  joinedAt: number;
  impactScore: number;
}

interface VolunteerCardProps {
  volunteer: VolunteerProfile;
  credentials?: Credential[];
  isAnonymous?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarTierColor(credentials?: Credential[]): string {
  if (!credentials || credentials.length === 0)
    return "from-teal-500 to-teal-700";
  const tiers = credentials.map((c) => c.tier);
  if (tiers.includes("Leadership")) return "from-purple-500 to-purple-700";
  if (tiers.includes("Clinical")) return "from-amber-500 to-amber-700";
  if (tiers.includes("PeerSupport")) return "from-blue-500 to-blue-700";
  return "from-emerald-500 to-emerald-700";
}

function TierCircle({ tier, label }: { tier: string; label: string }) {
  const colorMap: Record<string, string> = {
    Community: "bg-emerald-500 ring-emerald-400",
    PeerSupport: "bg-blue-500 ring-blue-400",
    Clinical: "bg-amber-500 ring-amber-400",
    Leadership: "bg-purple-500 ring-purple-400",
  };
  const textMap: Record<string, string> = {
    Community: "C",
    PeerSupport: "P",
    Clinical: "Cl",
    Leadership: "L",
  };
  return (
    <span
      title={label}
      className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-offset-1 ring-offset-transparent ${colorMap[tier] ?? "bg-muted ring-border"}`}
    >
      {textMap[tier] ?? tier[0]}
    </span>
  );
}

export function VolunteerCard({
  volunteer,
  credentials = [],
  isAnonymous,
}: VolunteerCardProps) {
  const showAnon = isAnonymous || !volunteer.privacyPublic;
  const top3 = credentials.slice(0, 3);
  const avatarGradient = getAvatarTierColor(credentials);

  const tierCounts = credentials.reduce<Record<string, number>>((acc, c) => {
    acc[c.tier] = (acc[c.tier] ?? 0) + 1;
    return acc;
  }, {});
  const tierBadges = Object.entries(tierCounts).map(([tier, count]) => ({
    tier,
    count,
  }));

  return (
    <div
      data-ocid={`volunteer_card.item.${volunteer.id}`}
      className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[var(--brand-teal-glow)] hover:border-[var(--brand-teal)] flex flex-col"
    >
      {/* Gradient top bar */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${avatarGradient} opacity-80`}
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Top row: avatar + name + role */}
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-base shadow-md`}
            aria-hidden="true"
          >
            {showAnon ? "?" : getInitials(volunteer.displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground truncate">
              {showAnon ? "Anonymous Volunteer" : volunteer.displayName}
            </p>
            {!showAnon && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 mt-0.5 text-[var(--brand-teal)] border-[var(--brand-teal)] bg-transparent border"
              >
                {volunteer.role}
              </Badge>
            )}
          </div>
          {/* Impact score */}
          <div className="flex-shrink-0 flex flex-col items-end">
            <span className="flex items-center gap-0.5 text-[var(--brand-teal)] text-xs font-bold">
              <Star className="h-3 w-3 fill-current" />
              {volunteer.impactScore}
            </span>
            <span className="text-[9px] text-muted-foreground">impact</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span>{volunteer.city}, OH</span>
        </div>

        {/* Bio or tier count badges (anonymous) */}
        {showAnon ? (
          <div className="flex flex-wrap gap-1.5">
            {tierBadges.length > 0 ? (
              tierBadges.map(({ tier, count }) => (
                <span
                  key={tier}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getTierBgColor(tier)} ${getTierColor(tier)}`}
                >
                  {count} {tier === "PeerSupport" ? "Peer Support" : tier}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Privacy protected
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {volunteer.bio}
          </p>
        )}

        {/* TOP 3 CREDENTIALS — hero section */}
        {top3.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
              <Shield className="h-3 w-3" /> Credentials
            </p>
            <div className="flex items-center gap-2">
              {top3.map((cred) => {
                const meta =
                  CREDENTIAL_META[cred.credentialType as CredentialType];
                return (
                  <div
                    key={Number(cred.id)}
                    title={meta?.displayName ?? String(cred.credentialType)}
                  >
                    <TierCircle
                      tier={cred.tier}
                      label={meta?.displayName ?? String(cred.credentialType)}
                    />
                  </div>
                );
              })}
              {credentials.length > 3 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{credentials.length - 3} more
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {top3.map((cred) => {
                const meta =
                  CREDENTIAL_META[cred.credentialType as CredentialType];
                const tierColor = getTierColor(cred.tier);
                const tierBg = getTierBgColor(cred.tier);
                return (
                  <span
                    key={`label-${Number(cred.id)}`}
                    className={`text-[9px] px-1.5 py-0 rounded-full border font-semibold ${tierColor} ${tierBg}`}
                  >
                    {meta?.displayName ?? String(cred.credentialType)}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Skills (non-anon) */}
        {!showAnon && volunteer.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {volunteer.skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* View profile button */}
      <div className="px-5 pb-4">
        <Button
          asChild
          size="sm"
          className="w-full bg-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/90 text-white font-semibold text-xs"
          data-ocid={`volunteer_card.view_button.${volunteer.id}`}
        >
          <Link to="/volunteer/$id" params={{ id: String(volunteer.id) }}>
            View Profile
          </Link>
        </Button>
      </div>
    </div>
  );
}
