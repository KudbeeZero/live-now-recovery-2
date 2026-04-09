import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  ChevronRight,
  ExternalLink,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import type { ProviderWithStatus } from "../backend";
import {
  useAllProviders,
  useCanisterState,
  useIsAdmin,
} from "../hooks/useQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

type Intent =
  | "find-providers"
  | "find-by-city"
  | "register-provider"
  | "become-volunteer"
  | "cost-plus-drugs"
  | "how-it-works"
  | "need-help-now"
  | "view-map"
  | "contact-us"
  | "unrecognized";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string | React.ReactNode;
  timestamp: Date;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_REPLIES: { label: string; intent: Intent }[] = [
  { label: "Find Live Providers", intent: "find-providers" },
  { label: "Find by City", intent: "find-by-city" },
  { label: "Register as Provider", intent: "register-provider" },
  { label: "Become a Volunteer", intent: "become-volunteer" },
  { label: "Cost Plus Drugs", intent: "cost-plus-drugs" },
  { label: "How It Works", intent: "how-it-works" },
  { label: "I Need Help Now", intent: "need-help-now" },
  { label: "View Map", intent: "view-map" },
  { label: "Contact Us", intent: "contact-us" },
];

const OHIO_CITIES = [
  { label: "Cleveland", slug: "cleveland" },
  { label: "Akron", slug: "akron" },
  { label: "Columbus", slug: "columbus" },
  { label: "Youngstown", slug: "youngstown" },
  { label: "Canton", slug: "canton" },
  { label: "Lorain", slug: "lorain" },
  { label: "Elyria", slug: "elyria" },
  { label: "Mentor", slug: "mentor" },
  { label: "Parma", slug: "parma" },
  { label: "Lakewood", slug: "lakewood" },
  { label: "Medina", slug: "medina" },
  { label: "Mansfield", slug: "mansfield" },
  { label: "Warren", slug: "warren" },
  { label: "Ashtabula", slug: "ashtabula" },
  { label: "Sandusky", slug: "sandusky" },
];

// ─── Keyword intent classifier ────────────────────────────────────────────────

function classifyIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/find|provider|clinic|mat|nearest/.test(t)) return "find-providers";
  if (
    /city|location|town|ohio|cleveland|akron|columbus|youngstown|canton|lorain|elyria|mentor|parma|lakewood|medina|mansfield|warren|ashtabula|sandusky/.test(
      t,
    )
  )
    return "find-by-city";
  if (/register|sign up|become a provider|add clinic/.test(t))
    return "register-provider";
  if (/volunteer|helper|help others|narcan carrier|peer support/.test(t))
    return "become-volunteer";
  if (/cost|price|suboxone|buprenorphine|drugs|cuban/.test(t))
    return "cost-plus-drugs";
  if (/how|proof|presence|qr|handoff|beacon/.test(t)) return "how-it-works";
  if (/help|emergency|now|crisis|overdose|\bod\b/.test(t))
    return "need-help-now";
  if (/map|see all/.test(t)) return "view-map";
  if (/contact|email|reach/.test(t)) return "contact-us";
  return "unrecognized";
}

// ─── Provider type badge ──────────────────────────────────────────────────────

function ProviderTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    "MAT Clinic": "bg-teal-500/20 text-teal-300 border-teal-500/40",
    "Narcan Distribution": "bg-amber-500/20 text-amber-300 border-amber-500/40",
    "Emergency Room": "bg-red-500/20 text-red-300 border-red-500/40",
    "Naloxone Kiosk/Vending Machine":
      "bg-purple-500/20 text-purple-300 border-purple-500/40",
    "Telehealth MAT": "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  };
  const cls = styles[type] ?? "bg-muted/30 text-muted-foreground border-border";
  return (
    <span
      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}
    >
      {type || "Provider"}
    </span>
  );
}

// ─── Response card components ─────────────────────────────────────────────────

function FindProvidersCard({
  providers,
  isLoading,
}: { providers: ProviderWithStatus[]; isLoading: boolean }) {
  const liveProviders = providers
    .filter((p) => p.is_active && p.is_verified)
    .sort((a, b) => Number(b.reputationScore) - Number(a.reputationScore))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (liveProviders.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-white/70">
          No providers are currently verified. Here's what's available 24/7:
        </p>
        <div className="space-y-1.5">
          <Link
            to="/location/$town"
            params={{ town: "cleveland" }}
            className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
          >
            <MapPin className="w-3 h-3 flex-shrink-0" /> Find ERs in Cleveland
          </Link>
          <Link
            to="/location/$town"
            params={{ town: "akron" }}
            className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
          >
            <MapPin className="w-3 h-3 flex-shrink-0" /> Find ERs in Akron
          </Link>
          <Link
            to="/helper"
            className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
          >
            <Users className="w-3 h-3 flex-shrink-0" /> Request volunteer
            support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/70">
        {liveProviders.length} verified provider
        {liveProviders.length !== 1 ? "s" : ""} found:
      </p>
      <div className="space-y-2">
        {liveProviders.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 bg-white/10 rounded-lg px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {p.name}
              </p>
              <ProviderTypeBadge type={p.providerType} />
            </div>
            <Link
              to="/provider/$id"
              params={{ id: p.id }}
              className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
              data-ocid="chat.provider_view_button"
            >
              View
            </Link>
          </div>
        ))}
      </div>
      <Link
        to="/"
        className="flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200 transition-colors font-medium"
      >
        See all on map <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function FindByCityCard() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-white/70">
        Select a city to browse providers:
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {OHIO_CITIES.map(({ label, slug }) => (
          <Link
            key={slug}
            to="/location/$town"
            params={{ town: slug }}
            className="text-center text-[10px] font-semibold px-2 py-1.5 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-white/80 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 transition-all"
            data-ocid="chat.city_link"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function RegisterProviderCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-white">
          Add your clinic to the map
        </p>
      </div>
      <p className="text-xs text-white/70">
        MAT clinics, ERs, Narcan distributors, and telehealth providers can
        register in minutes.
      </p>
      <div className="space-y-2">
        <Link
          to="/register"
          className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
          data-ocid="chat.register_cta"
        >
          Start Registration <ChevronRight className="w-3 h-3" />
        </Link>
        <Link
          to="/signup"
          className="block text-center text-xs text-emerald-300 hover:text-emerald-200 transition-colors underline"
        >
          Or create an account first
        </Link>
      </div>
    </div>
  );
}

function BecomeVolunteerCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-white">
          Join the recovery network
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          47+ volunteers
        </span>
        <span className="text-xs text-white/60">across Ohio</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          "Narcan carrier",
          "Peer support",
          "Transportation",
          "General volunteer",
        ].map((role) => (
          <div
            key={role}
            className="text-[10px] px-2 py-1.5 rounded-lg bg-white/10 text-white/70 border border-white/10 text-center"
          >
            {role}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Link
          to="/helper"
          className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
          data-ocid="chat.volunteer_cta"
        >
          Sign Up as Volunteer <ChevronRight className="w-3 h-3" />
        </Link>
        <Link
          to="/signup"
          className="block text-center text-xs text-emerald-300 hover:text-emerald-200 transition-colors underline"
        >
          Create account first
        </Link>
      </div>
    </div>
  );
}

function CostPlusDrugsCard() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">
        Affordable MAT medications
      </p>
      <p className="text-xs text-white/70">
        Mark Cuban's Cost Plus Drugs offers generic buprenorphine-naloxone at
        drastically reduced prices — no insurance required.
      </p>
      <div className="space-y-2">
        <a
          href="https://costplusdrugs.com/medications/categories/opioid-dependence/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
          data-ocid="chat.cost_plus_link"
        >
          View Pricing <ExternalLink className="w-3 h-3" />
        </a>
        <Link
          to="/resources"
          className="block text-center text-xs text-emerald-300 hover:text-emerald-200 transition-colors underline"
        >
          Full Resource List
        </Link>
      </div>
      <p className="text-[10px] text-white/40">
        Prices vary — visit their site for current cost.
      </p>
    </div>
  );
}

function HowItWorksCard() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">Proof of Presence</p>
      <p className="text-xs text-white/70">
        Our QR-based warm handoff system records anonymous recovery connections
        — no names, no PHI, just proof that someone crossed the threshold.
      </p>
      <div className="space-y-2">
        <Link
          to="/how-it-works"
          className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
          data-ocid="chat.how_it_works_cta"
        >
          Read Full Explainer <ChevronRight className="w-3 h-3" />
        </Link>
        <Link
          to="/verify"
          className="block text-center text-xs text-emerald-300 hover:text-emerald-200 transition-colors underline"
        >
          Verify a Handoff Token
        </Link>
      </div>
    </div>
  );
}

function NeedHelpNowCard({ providers }: { providers: ProviderWithStatus[] }) {
  const hasLive = providers.some(
    (p) => p.isLive && p.is_active && p.is_verified,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
        <p className="text-sm font-bold text-white">
          Ohio MAR NOW: 833-234-6343
        </p>
      </div>
      <p className="text-xs text-white/70">
        Available 24/7. You are not alone. Recovery is possible.
      </p>

      {hasLive && (
        <Link
          to="/"
          className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
          data-ocid="chat.find_live_help_cta"
        >
          Providers available right now <ChevronRight className="w-3 h-3" />
        </Link>
      )}

      <div className="space-y-1.5 pt-1 border-t border-white/10">
        <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
          Additional resources
        </p>
        <Link
          to="/location/$town"
          params={{ town: "cleveland" }}
          className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
        >
          <MapPin className="w-3 h-3 flex-shrink-0" /> Find ER in Cleveland
        </Link>
        <Link
          to="/location/$town"
          params={{ town: "akron" }}
          className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
        >
          <MapPin className="w-3 h-3 flex-shrink-0" /> Find ER in Akron
        </Link>
        <Link
          to="/helper"
          className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
        >
          <Users className="w-3 h-3 flex-shrink-0" /> Request volunteer support
        </Link>
      </div>
    </div>
  );
}

function ViewMapCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-white">Live Provider Map</p>
      </div>
      <p className="text-xs text-white/70">
        The live map shows all verified providers in Ohio — updated in real
        time.
      </p>
      <Link
        to="/"
        className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
        data-ocid="chat.open_map_cta"
      >
        Open Live Map <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function ContactUsCard() {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">Get in touch</p>
      <div className="space-y-2">
        <Link
          to="/contact"
          className="flex items-center justify-between w-full text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
          data-ocid="chat.contact_cta"
        >
          Contact Page <ChevronRight className="w-3 h-3" />
        </Link>
        <Link
          to="/mission"
          className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors underline"
        >
          Our Mission
        </Link>
        <Link
          to="/founder"
          className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors underline"
        >
          Meet the Founder
        </Link>
      </div>
    </div>
  );
}

function UnrecognizedCard() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-white/70">
        I can help you find live MAT providers, connect with volunteers,
        navigate resources, or understand how the platform works. Try one of the
        options below:
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SentinelChat() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: providers = [], isLoading: providersLoading } =
    useAllProviders();
  const { data: canisterState } = useCanisterState();
  const { data: isAdmin } = useIsAdmin();

  const liveCount = providers.filter((p) => p.isLive).length;

  const buildBotContent = (intent: Intent): React.ReactNode => {
    switch (intent) {
      case "find-providers":
        return (
          <FindProvidersCard
            providers={providers}
            isLoading={providersLoading}
          />
        );
      case "find-by-city":
        return <FindByCityCard />;
      case "register-provider":
        return <RegisterProviderCard />;
      case "become-volunteer":
        return <BecomeVolunteerCard />;
      case "cost-plus-drugs":
        return <CostPlusDrugsCard />;
      case "how-it-works":
        return <HowItWorksCard />;
      case "need-help-now":
        return <NeedHelpNowCard providers={providers} />;
      case "view-map":
        return <ViewMapCard />;
      case "contact-us":
        return <ContactUsCard />;
      default:
        return <UnrecognizedCard />;
    }
  };

  const initialGreeting: Message = {
    id: "greeting",
    role: "bot",
    content:
      "Hi! I'm your recovery assistant. I can help you find live MAT providers, connect with volunteers, and navigate resources across Ohio.",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);

  const handleIntent = (intent: Intent, userLabel: string) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userLabel,
      timestamp: new Date(),
    };
    const botMsg: Message = {
      id: `b-${Date.now() + 1}`,
      role: "bot",
      content: buildBotContent(intent),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const intent = classifyIntent(trimmed);
    handleIntent(intent, trimmed);
    setInputValue("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000]" data-ocid="chat.panel">
      {open && (
        <div
          className="mb-3 w-80 sm:w-80 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ background: "oklch(0.18 0.04 240)", maxHeight: "70vh" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
            style={{ background: "oklch(0.13 0.05 240)" }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-semibold text-sm">
                Recovery Assistant
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${providersLoading ? "bg-white/30 animate-pulse" : liveCount > 0 ? "bg-emerald-400" : "bg-red-400"}`}
                />
                {providersLoading ? "Loading..." : `${liveCount} live`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Close chat"
              data-ocid="chat.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-emerald-500 text-black font-medium rounded-tr-sm"
                      : "text-white rounded-tl-sm border border-white/10"
                  }`}
                  style={
                    m.role === "bot"
                      ? { background: "oklch(0.22 0.04 240)" }
                      : undefined
                  }
                >
                  {typeof m.content === "string" ? (
                    <p className="text-xs leading-relaxed">{m.content}</p>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Admin state */}
          {isAdmin && canisterState && (
            <div
              className="px-4 py-2 border-t border-white/10 flex-shrink-0"
              style={{ background: "oklch(0.13 0.05 240)" }}
            >
              <p className="text-[10px] font-semibold text-white/60 mb-0.5">
                Canister State
              </p>
              <p className="text-[10px] text-white/40">
                Active providers:{" "}
                {canisterState.total_active_providers.toString()} · High-risk:{" "}
                {canisterState.high_risk_window_active ? "YES" : "no"}
              </p>
            </div>
          )}

          {/* Quick replies */}
          <div
            className="p-3 border-t border-white/10 flex-shrink-0"
            style={{ background: "oklch(0.15 0.04 240)" }}
          >
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_REPLIES.map(({ label, intent }) => (
                <button
                  key={intent}
                  type="button"
                  onClick={() => handleIntent(intent, label)}
                  className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
                  data-ocid="chat.quick_reply_button"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Text input */}
            <form
              onSubmit={handleTextSubmit}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  style={{ background: "oklch(0.18 0.04 240)" }}
                  data-ocid="chat.text_input"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/20 text-black flex items-center justify-center transition-colors"
                aria-label="Send message"
                data-ocid="chat.send_button"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <Button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
        style={{ background: "oklch(0.55 0.2 155)", color: "black" }}
        aria-label={
          open ? "Close recovery assistant" : "Open recovery assistant"
        }
        data-ocid="chat.open_modal_button"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
