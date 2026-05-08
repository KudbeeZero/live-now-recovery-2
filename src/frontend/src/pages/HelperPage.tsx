import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { GlobalImpactStats } from "@/types/credentials";
import { CREDENTIAL_META } from "@/types/credentials";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CheckCircle,
  ChevronRight,
  Heart,
  LayoutGrid,
  Loader2,
  Share2,
  Shield,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import {
  useRegisterVolunteerProfile,
  useVolunteerCount,
} from "../hooks/useVolunteers";

// ─── Mock social proof data ─────────────────────────────────────────────────
const SOCIAL_PROOF = [
  {
    initials: "MJ",
    name: "Marcus J.",
    city: "Cleveland",
    credential: "Recovery Navigator",
    color: "bg-amber-500",
  },
  {
    initials: "DW",
    name: "Danielle W.",
    city: "Akron",
    credential: "30-Day Guide",
    color: "bg-blue-500",
  },
  {
    initials: "TR",
    name: "Tyrone R.",
    city: "Youngstown",
    credential: "Community Sentinel",
    color: "bg-emerald-500",
  },
  {
    initials: "SL",
    name: "Sarah L.",
    city: "Canton",
    credential: "Recovery Ally",
    color: "bg-blue-600",
  },
];

// ─── Role definitions ────────────────────────────────────────────────────────
const ROLES = [
  {
    value: "Peer Support Specialist",
    icon: Heart,
    color: "border-blue-500/50 hover:border-blue-400",
    selectedColor: "border-blue-400 bg-blue-500/10",
    tagColor: "bg-blue-500/20 text-blue-300",
    description:
      "Connect 1-on-1 with people in early recovery. Share lived experience to guide their journey.",
    credentials: ["Recovery Ally", "30-Day Guide", "Story Sharer"],
  },
  {
    value: "Community Outreach",
    icon: Users,
    color: "border-emerald-500/50 hover:border-emerald-400",
    selectedColor: "border-emerald-400 bg-emerald-500/10",
    tagColor: "bg-emerald-500/20 text-emerald-300",
    description:
      "Distribute harm reduction supplies, connect community members to resources, and reduce stigma.",
    credentials: ["First Responder", "Community Sentinel", "Narcan Hero"],
  },
  {
    value: "Harm Reduction Worker",
    icon: Shield,
    color: "border-teal-500/50 hover:border-teal-400",
    selectedColor: "border-teal-400 bg-teal-500/10",
    tagColor: "bg-teal-500/20 text-teal-300",
    description:
      "Deploy Narcan, distribute clean supplies, and operate kiosk locations across NE Ohio.",
    credentials: ["Narcan Hero", "Community Sentinel", "Community Architect"],
  },
  {
    value: "Recovery Coach",
    icon: TrendingUp,
    color: "border-amber-500/50 hover:border-amber-400",
    selectedColor: "border-amber-400 bg-amber-500/10",
    tagColor: "bg-amber-500/20 text-amber-300",
    description:
      "Guide individuals through sustained recovery milestones, treatment navigation, and relapse prevention.",
    credentials: ["Recovery Navigator", "Bridge Provider", "Recovery Ally"],
  },
  {
    value: "Transportation Volunteer",
    icon: ChevronRight,
    color: "border-purple-500/50 hover:border-purple-400",
    selectedColor: "border-purple-400 bg-purple-500/10",
    tagColor: "bg-purple-500/20 text-purple-300",
    description:
      "Drive individuals to appointments, treatment centers, and harm reduction sites.",
    credentials: ["Recovery Navigator", "Community Architect"],
  },
  {
    value: "Event Coordinator",
    icon: LayoutGrid,
    color: "border-rose-500/50 hover:border-rose-400",
    selectedColor: "border-rose-400 bg-rose-500/10",
    tagColor: "bg-rose-500/20 text-rose-300",
    description:
      "Organize community outreach events, awareness campaigns, and recovery celebrations.",
    credentials: ["Community Architect", "Policy Pioneer", "Story Sharer"],
  },
];

const BENEFITS = [
  {
    icon: Award,
    title: "Earn Soul-Bound Credentials",
    description:
      "Every action you take earns a permanent, on-chain credential tied to your identity — impossible to fake, impossible to lose.",
    badges: ["First Responder", "Recovery Ally", "Narcan Hero"],
    color: "text-brand-teal",
    bgColor: "bg-teal-500/10",
  },
  {
    icon: Trophy,
    title: "Appear on the Leaderboard",
    description:
      "Your impact score grows with every handoff, report, and credential earned. Top contributors are featured publicly.",
    badges: ["Community Sentinel", "Recovery Navigator"],
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Share2,
    title: "Share Your Achievements",
    description:
      "Generate beautiful shareable credential cards for X, LinkedIn, or anywhere you want to show your impact.",
    badges: ["MAT Champion", "Policy Pioneer"],
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
];

const STEPS = [
  {
    n: 1,
    label: "Choose Role",
    desc: "Pick the role that fits your skills",
    icon: Users,
  },
  {
    n: 2,
    label: "Build Profile",
    desc: "Add your name, city & bio",
    icon: Star,
  },
  {
    n: 3,
    label: "Privacy",
    desc: "Control who sees your profile",
    icon: Shield,
  },
  {
    n: 4,
    label: "Start Earning",
    desc: "Credentials unlock automatically",
    icon: Award,
  },
];

function AnimatedCounter({
  target,
  suffix = "",
}: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else setCount(Math.floor(current));
          }, 1800 / steps);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function SuccessPanel({
  role,
  displayName,
  id,
}: { role: string | null; displayName: string; id: bigint | null }) {
  const roleData = ROLES.find((r) => r.value === role);
  return (
    <main
      className="min-h-screen bg-background flex items-center justify-center px-4 py-20"
      data-ocid="helper.success.panel"
    >
      <div className="max-w-lg w-full bg-card border border-teal-500/30 rounded-3xl p-8 md:p-10 text-center shadow-xl shadow-teal-900/10">
        <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-teal-400" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-2">
          Welcome to the Movement
        </p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
          You're in, {displayName}!
        </h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          You've joined as a <strong className="text-foreground">{role}</strong>
          . Your first credential is waiting — every action you take from here
          earns a permanent, on-chain badge.
        </p>
        {roleData && (
          <div className="bg-background border border-border rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              Credentials unlocked for your role:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {roleData.credentials.map((c) => {
                const meta = Object.values(CREDENTIAL_META).find(
                  (m) => m.displayName === c,
                );
                return (
                  <Badge
                    key={c}
                    variant="outline"
                    className={`border ${meta?.tierBg ?? ""} ${meta?.tierColor ?? ""} text-xs`}
                  >
                    {c}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/leaderboard"
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl text-sm transition-all"
            data-ocid="helper.success.leaderboard_link"
          >
            <Trophy className="w-4 h-4" /> View Leaderboard
          </a>
          <a
            href="/helper"
            className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 rounded-xl text-sm transition-all border border-border"
            data-ocid="helper.success.register_another_link"
          >
            <Users className="w-4 h-4" /> Add Another
          </a>
        </div>
        {id !== null && (
          <p className="text-xs text-muted-foreground mt-4">
            Volunteer ID: #{id.toString()}
          </p>
        )}
      </div>
    </main>
  );
}

export function HelperPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    displayName: "",
    city: "",
    zip: "",
    bio: "",
    skills: [] as string[],
    skillInput: "",
    privacyPublic: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [newVolunteerId, setNewVolunteerId] = useState<bigint | null>(null);

  const registerMutation = useRegisterVolunteerProfile();
  const { data: volunteerCount } = useVolunteerCount();

  const { actor } = useActor(createActor);
  const { data: impactStats } = useQuery<GlobalImpactStats>({
    queryKey: ["globalImpactStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalBadgesMinted: 127n,
          activeContributors: 84n,
          totalImpactScore: 4230n,
        };
      try {
        return await actor.getGlobalImpactStats();
      } catch {
        return {
          totalBadgesMinted: 127n,
          activeContributors: 84n,
          totalImpactScore: 4230n,
        };
      }
    },
    enabled: !!actor,
    refetchInterval: 60_000,
  });

  const totalVolunteers = volunteerCount ? Number(volunteerCount) : 247;
  const totalBadges = impactStats ? Number(impactStats.totalBadgesMinted) : 127;
  const selectedRoleData = ROLES.find((r) => r.value === selectedRole);

  function validateForm() {
    const errs: Record<string, string> = {};
    if (!form.displayName.trim())
      errs.displayName = "Display name is required.";
    if (!form.city.trim()) errs.city = "City is required.";
    if (!form.zip.trim() || !/^\d{5}$/.test(form.zip))
      errs.zip = "Enter a valid 5-digit ZIP code.";
    if (!form.bio.trim() || form.bio.trim().length < 20)
      errs.bio = "Please write at least 20 characters about yourself.";
    return errs;
  }

  function addSkill() {
    const skill = form.skillInput.trim();
    if (skill && !form.skills.includes(skill) && form.skills.length < 10)
      setForm((p) => ({ ...p, skills: [...p.skills, skill], skillInput: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm();
    if (!selectedRole) {
      setStep(1);
      return;
    }
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    try {
      const id = await registerMutation.mutateAsync({
        displayName: form.displayName,
        role: selectedRole,
        city: form.city,
        zip: form.zip,
        bio: form.bio,
        skills: form.skills,
        privacyPublic: form.privacyPublic,
      });
      setNewVolunteerId(id);
      setSubmitted(true);
    } catch {
      setFormErrors({ submit: "Something went wrong. Please try again." });
    }
  }

  if (submitted)
    return (
      <SuccessPanel
        role={selectedRole}
        displayName={form.displayName}
        id={newVolunteerId}
      />
    );

  return (
    <main className="min-h-screen bg-background" data-ocid="helper.page">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "url(/assets/generated/volunteer-hero-bg.dim_1400x600.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest">
              Join the Recovery Movement
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="text-foreground">Become a </span>
            <span className="text-brand-teal">Volunteer</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-3 leading-relaxed">
            Ohio lost <strong className="text-foreground">5,232 lives</strong>{" "}
            to overdose in 2023 — 78% fentanyl-involved. Every volunteer in this
            network is a direct line between a person in crisis and the
            treatment they deserve.
          </p>
          <p className="text-teal-300 font-semibold mb-10 text-sm">
            You don't need a medical degree. You need to show up.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl py-4 px-2">
              <p className="text-2xl md:text-3xl font-extrabold text-brand-teal">
                <AnimatedCounter target={totalVolunteers} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Volunteers</p>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl py-4 px-2">
              <p className="text-2xl md:text-3xl font-extrabold text-brand-teal">
                <AnimatedCounter target={totalBadges} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Badges Earned
              </p>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl py-4 px-2">
              <p className="text-2xl md:text-3xl font-extrabold text-brand-teal">
                <AnimatedCounter target={18} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ohio Cities</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() =>
              document
                .getElementById("signup-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-8 py-3 rounded-xl text-base shadow-lg shadow-teal-900/30 transition-all"
            data-ocid="helper.hero.cta"
          >
            Sign Up Now — It's Free
          </Button>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-card border-b border-border py-5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {SOCIAL_PROOF.map((p) => (
              <div key={p.name} className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-9 h-9 rounded-full ${p.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {p.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {p.name},{" "}
                    <span className="text-muted-foreground">{p.city}</span>
                  </p>
                  <p className="text-xs text-teal-300 truncate">
                    earned <strong>{p.credential}</strong>
                  </p>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground text-center">
              <span className="text-brand-teal font-semibold">
                +{totalVolunteers - 4} others
              </span>{" "}
              joined this week
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Visual Path */}
      <section className="py-14 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-teal text-center mb-3">
            How It Works
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
            4 Steps to Start Making an Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border z-0" />
                )}
                <div
                  className={`relative z-10 flex flex-col items-center text-center p-4 rounded-xl border transition-all ${step >= s.n ? "border-teal-500/50 bg-teal-500/5" : "border-border bg-card"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${step >= s.n ? "bg-teal-500/20 text-teal-300" : "bg-muted text-muted-foreground"}`}
                  >
                    {step > s.n ? (
                      <CheckCircle className="w-5 h-5 text-teal-400" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  <p
                    className={`font-semibold text-sm mb-1 ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-14 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-teal text-center mb-3">
            What You Unlock
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
            Every Volunteer Earns Real Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
                data-ocid="helper.benefit.card"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${b.bgColor} flex items-center justify-center`}
                >
                  <b.icon className={`w-5 h-5 ${b.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1.5">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {b.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {b.badges.map((name) => (
                    <Badge
                      key={name}
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup-form" className="py-14 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-teal text-center mb-3">
            Join Now
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2">
            Choose Your Role
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10">
            Your role determines which credentials you can earn.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            data-ocid="helper.signup.form"
          >
            {/* Role Cards */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10"
              role="radiogroup"
              aria-label="Choose your volunteer role"
            >
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.value);
                      setStep(2);
                    }}
                    className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${isSelected ? role.selectedColor : role.color} bg-card hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                    aria-pressed={isSelected}
                    data-ocid={`helper.role.${role.value.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 absolute top-3 right-3 text-teal-400" />
                    )}
                    <div
                      className={`w-9 h-9 rounded-lg bg-card border flex items-center justify-center mb-3 ${isSelected ? "border-current" : "border-border"}`}
                    >
                      <role.icon className="w-4 h-4 text-foreground" />
                    </div>
                    <p className="font-bold text-sm text-foreground mb-1">
                      {role.value}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {role.description}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Earns:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.credentials.map((c) => (
                        <span
                          key={c}
                          className={`inline-block text-xs px-2 py-0.5 rounded-full ${role.tagColor} font-medium`}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {!selectedRole && (
              <p className="text-center text-muted-foreground text-sm mb-6">
                ↑ Select a role above to continue
              </p>
            )}

            <div
              className={`transition-all duration-300 ${selectedRole ? "opacity-100" : "opacity-40 pointer-events-none"}`}
            >
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-brand-teal" />
                  Build Your Profile
                </h3>
                <div className="mb-4">
                  <label
                    htmlFor="vol-displayName"
                    className="block text-xs font-semibold text-foreground mb-1"
                  >
                    Display name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="vol-displayName"
                    type="text"
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, displayName: e.target.value }))
                    }
                    placeholder="Marcus Johnson"
                    autoComplete="name"
                    className="w-full rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    data-ocid="helper.form.displayName"
                  />
                  {formErrors.displayName && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="helper.form.displayName.field_error"
                    >
                      {formErrors.displayName}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="vol-city"
                      className="block text-xs font-semibold text-foreground mb-1"
                    >
                      City <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="vol-city"
                      type="text"
                      value={form.city}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, city: e.target.value }))
                      }
                      placeholder="Cleveland"
                      autoComplete="address-level2"
                      className="w-full rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      data-ocid="helper.form.city"
                    />
                    {formErrors.city && (
                      <p
                        className="text-destructive text-xs mt-1"
                        data-ocid="helper.form.city.field_error"
                      >
                        {formErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="vol-zip"
                      className="block text-xs font-semibold text-foreground mb-1"
                    >
                      ZIP code <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="vol-zip"
                      type="text"
                      value={form.zip}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          zip: e.target.value.replace(/\D/g, "").slice(0, 5),
                        }))
                      }
                      placeholder="44101"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={5}
                      className="w-full rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      data-ocid="helper.form.zip"
                    />
                    {formErrors.zip && (
                      <p
                        className="text-destructive text-xs mt-1"
                        data-ocid="helper.form.zip.field_error"
                      >
                        {formErrors.zip}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="vol-bio"
                    className="block text-xs font-semibold text-foreground mb-1"
                  >
                    About you <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="vol-bio"
                    value={form.bio}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bio: e.target.value }))
                    }
                    placeholder="Tell us briefly who you are and why you want to volunteer..."
                    rows={3}
                    className="w-full rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-y min-h-[80px]"
                    data-ocid="helper.form.bio"
                  />
                  {formErrors.bio && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="helper.form.bio.field_error"
                    >
                      {formErrors.bio}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="vol-skill-input"
                    className="block text-xs font-semibold text-foreground mb-1"
                  >
                    Skills{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional — up to 10)
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="vol-skill-input"
                      type="text"
                      value={form.skillInput}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, skillInput: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="e.g. CPR, Narcan, Spanish"
                      className="flex-1 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      data-ocid="helper.form.skill_input"
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      variant="outline"
                      className="px-4 border-border"
                      data-ocid="helper.form.add_skill_button"
                    >
                      +
                    </Button>
                  </div>
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.skills.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              skills: p.skills.filter((x) => x !== s),
                            }))
                          }
                          className="inline-flex items-center gap-1 bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs px-2.5 py-1 rounded-full hover:bg-teal-500/25 transition-colors"
                          aria-label={`Remove skill ${s}`}
                          data-ocid="helper.form.skill_tag"
                        >
                          {s} <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-teal" />
                  Privacy Settings
                </h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-0.5">
                      Make my profile searchable
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When on, your display name, role, city, and credentials
                      appear in the volunteer directory. Your bio and contact
                      info are always private.
                    </p>
                  </div>
                  <Switch
                    checked={form.privacyPublic}
                    onCheckedChange={(v) =>
                      setForm((p) => ({ ...p, privacyPublic: v }))
                    }
                    aria-label="Make profile searchable"
                    data-ocid="helper.form.privacy_toggle"
                  />
                </div>
                <p
                  className={`mt-3 text-xs font-medium px-3 py-2 rounded-lg ${form.privacyPublic ? "bg-teal-500/10 text-teal-300" : "bg-muted text-muted-foreground"}`}
                >
                  {form.privacyPublic
                    ? "✓ Your profile will appear in the volunteer directory"
                    : "Your profile will be private — only you can see it"}
                </p>
              </div>

              {/* Credential Preview for selected role */}
              {selectedRoleData && (
                <div className="bg-card border border-teal-500/30 rounded-2xl p-5 mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-3">
                    Credentials You'll Unlock as {selectedRoleData.value}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoleData.credentials.map((c) => {
                      const meta = Object.values(CREDENTIAL_META).find(
                        (m) => m.displayName === c,
                      );
                      return (
                        <div
                          key={c}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${meta?.tierBg ?? "bg-muted border-border"}`}
                        >
                          <Award
                            className={`w-3.5 h-3.5 shrink-0 ${meta?.tierColor ?? "text-muted-foreground"}`}
                          />
                          <span
                            className={meta?.tierColor ?? "text-foreground"}
                          >
                            {c}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formErrors.submit && (
                <p
                  className="text-destructive text-sm mb-4 text-center"
                  data-ocid="helper.form.error_state"
                >
                  {formErrors.submit}
                </p>
              )}

              <Button
                type="submit"
                disabled={registerMutation.isPending || !selectedRole}
                className="w-full min-h-[52px] rounded-xl font-bold text-base bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/30 transition-all disabled:opacity-50"
                data-ocid="helper.form.submit_button"
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining the movement…
                  </span>
                ) : (
                  "Join the Recovery Movement →"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                No medical background required. No PHI collected. Free forever.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
