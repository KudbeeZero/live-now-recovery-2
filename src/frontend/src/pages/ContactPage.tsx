import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  AtSign,
  BookOpen,
  Building2,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  Github,
  Heart,
  Link2,
  MessageCircle,
  Newspaper,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── SEO data ────────────────────────────────────────────────────────────────
const SEO_TITLE =
  "Contact Live Now Recovery | Recovery Platform Partnership & Media Inquiries";
const SEO_DESCRIPTION =
  "Partner with Live Now Recovery — Ohio's real-time MAT coordination and harm reduction platform. Contact us for healthcare partnerships, media, volunteer opportunities, or general inquiries. 501(c)(3) filing in progress.";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Live Now Recovery",
  url: "https://livenowrecovery.org",
  description:
    "Ohio's real-time Medication-Assisted Treatment coordination and harm reduction platform. Privacy-first, nonprofit, built on Internet Computer Protocol.",
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "Healthcare Partnership",
      description:
        "Hospital systems, county health departments, MAT providers, harm reduction organizations, technology partners.",
      areaServed: "OH",
      availableLanguage: "English",
    },
    {
      "@type": "ContactPoint",
      contactType: "Media & Press",
      description:
        "Interviews, expert commentary, data briefings on the opioid crisis and harm reduction technology.",
      areaServed: "US",
    },
    {
      "@type": "ContactPoint",
      contactType: "Volunteer Coordinator",
      description:
        "Volunteer, peer support specialist, and community outreach coordinator inquiries.",
      areaServed: "OH",
    },
    {
      "@type": "ContactPoint",
      contactType: "General Inquiry",
      description: "General platform questions, feedback, and feature ideas.",
      areaServed: "US",
    },
  ],
};

const LOCAL_BIZ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Live Now Recovery",
  url: "https://livenowrecovery.org",
  description:
    "Real-time MAT coordination, harm reduction resource platform, and community recovery infrastructure for Ohio.",
  serviceArea: {
    "@type": "State",
    name: "Ohio",
  },
  knowsAbout: [
    "Medication-Assisted Treatment",
    "Harm Reduction",
    "Opioid Crisis Intervention",
    "Warm Handoffs",
    "Naloxone Distribution",
    "Recovery Navigation",
  ],
};

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const steps = 50;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 1800 / steps);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Inquiry path cards ───────────────────────────────────────────────────────
const INQUIRY_PATHS = [
  {
    id: "partnership",
    icon: Link2,
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/15",
    borderHover: "hover:border-teal-500/60",
    title: "Partnerships & Integrations",
    description:
      "Are you a hospital system, county health department, MAT provider, harm reduction org, or technology partner? Let's talk about how Live Now Recovery fits your workflow.",
    detail:
      "EHR integrations · Narcan kiosk data · County referral network onboarding",
    cta: "Partner With Us",
    anchor: "#form",
    inquiryValue: "Partnership",
  },
  {
    id: "media",
    icon: Newspaper,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
    borderHover: "hover:border-blue-500/60",
    title: "Media & Press",
    description:
      "Covering the opioid crisis, harm reduction, or healthcare technology? We're available for interviews, expert commentary, and data briefings. All platform statistics and anonymized data are available for press use.",
    detail: "Press kit available on request",
    cta: "Press Inquiry",
    anchor: "#form",
    inquiryValue: "Media",
  },
  {
    id: "volunteer",
    icon: Heart,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    borderHover: "hover:border-emerald-500/60",
    title: "Volunteer & Community",
    description:
      "Want to become a volunteer, peer support specialist, or community outreach coordinator? Join our growing team of Ohio recovery workers.",
    detail: "See /helper and /volunteers for the full onboarding flow",
    cta: "Learn About Volunteering",
    anchor: "/helper",
    inquiryValue: "Volunteer",
    isLink: true,
  },
  {
    id: "general",
    icon: MessageCircle,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15",
    borderHover: "hover:border-purple-500/60",
    title: "General Inquiries",
    description:
      "Questions about the platform, feedback, or ideas for new features? We read every message.",
    detail: "Response within 48 business hours",
    cta: "Send a Message",
    anchor: "#form",
    inquiryValue: "General",
  },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Is my information private?",
    a: 'No PHI (Protected Health Information) is ever collected. All data is logistics-only — provider availability, resource locations, and anonymized activity. Full details at <a href="/privacy" class="text-teal-400 underline">our Privacy Policy</a>.',
  },
  {
    q: "How do I list my organization as a provider?",
    a: 'Visit <a href="/register" class="text-teal-400 underline">/register</a> to submit your provider listing. Approval takes 24–48 hours. No cost to list. We currently serve Ohio and are expanding nationally.',
  },
  {
    q: "Is Live Now Recovery free to use?",
    a: "Yes. The platform is free for providers, volunteers, and community members. It is sustained by grants and donations. We are currently awaiting the outcome of a $145,000 Michigan Opioid Settlement Fund grant (expected June 2026) and are registering as a 501(c)(3) nonprofit.",
  },
  {
    q: "What is the Sentinel Prediction Engine?",
    a: 'Sentinel is our real-time risk intelligence layer that combines federal weather data (NWS), economic stress indicators (Census ACS), payday cycle patterns, and community citizen reports to predict crisis windows before they happen. <a href="/integration" class="text-teal-400 underline">Learn more at /integration</a>.',
  },
  {
    q: "When will Live Now Recovery be available in my state?",
    a: 'We are piloting in Ohio and expanding to national hot zones — West Virginia, Kentucky, Tennessee — in 2026–2027. See <a href="/national-impact" class="text-teal-400 underline">/national-impact</a> for the full expansion roadmap and state-level impact projections.',
  },
  {
    q: "How do I donate or support the mission?",
    a: 'Visit <a href="/donate" class="text-teal-400 underline">/donate</a> to support via GoFundMe, PayPal, Stripe, or native $ICP cryptocurrency. Every dollar directly funds harm reduction supply distribution, MAT coordination infrastructure, and platform development.',
  },
];

// ─── FAQ Accordion item ───────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-border/60 rounded-xl overflow-hidden transition-all duration-200"
      data-ocid="contact.faq.item"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors gap-3"
        aria-expanded={open}
        data-ocid="contact.faq.toggle"
      >
        <span className="font-semibold text-foreground text-sm leading-snug">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div
          className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted FAQ content with internal links
          dangerouslySetInnerHTML={{ __html: a }}
        />
      )}
    </div>
  );
}

// ─── Main ContactPage ─────────────────────────────────────────────────────────
export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    inquiryType: "",
    subject: "",
    message: "",
  });

  const scrollToForm = (inquiryValue?: string) => {
    if (inquiryValue) {
      setForm((f) => ({ ...f, inquiryType: inquiryValue }));
      setSelectedInquiry(inquiryValue);
    }
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);

    const subject = `[Contact Form] ${form.subject || form.inquiryType || "General Inquiry"}`;
    const body = [
      `Inquiry Type: ${form.inquiryType || "Not specified"}`,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Subject: ${form.subject || "(none)"}`,
      "",
      `Message:\n${form.message}`,
      "",
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n");

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "admin@livenowrecovery.org",
          subject,
          body,
        }),
      });
      if (!res.ok) throw new Error(`Email endpoint returned ${res.status}`);
      setSubmitted(true);
    } catch {
      // Fallback: mailto link
      try {
        const mailto = `mailto:admin@livenowrecovery.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
        setSubmitted(true);
      } catch {
        setSendError(
          "Unable to send your message. Please try again or email us directly.",
        );
      }
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSendError(null);
    setForm({ name: "", email: "", inquiryType: "", subject: "", message: "" });
    setAgreedToPrivacy(false);
    setSelectedInquiry("");
  };

  return (
    <>
      <SEO
        title={SEO_TITLE}
        description={SEO_DESCRIPTION}
        canonical="/contact"
        keywords="contact Live Now Recovery, healthcare partnership Ohio, MAT provider inquiry, harm reduction partnership, opioid crisis media contact, volunteer recovery platform"
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BIZ_JSON_LD) }}
      />

      <main className="min-h-screen bg-background" data-ocid="contact.page">
        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.10 0.018 240) 0%, oklch(0.14 0.025 210) 50%, oklch(0.12 0.022 220) 100%)",
            minHeight: "480px",
          }}
          data-ocid="contact.hero"
        >
          {/* Animated background nodes */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {[
              { cx: "8%", cy: "15%", r: 180, delay: 0 },
              { cx: "85%", cy: "25%", r: 240, delay: 2 },
              { cx: "55%", cy: "75%", r: 160, delay: 4 },
              { cx: "20%", cy: "80%", r: 120, delay: 1 },
            ].map((node) => (
              <svg
                key={`${node.cx}-${node.cy}`}
                aria-hidden="true"
                className="absolute"
                style={{
                  left: node.cx,
                  top: node.cy,
                  transform: "translate(-50%, -50%)",
                  opacity: 0.06,
                  animation: `pulse ${4 + node.delay * 0.5}s ease-in-out infinite`,
                  animationDelay: `${node.delay}s`,
                }}
                width={node.r * 2}
                height={node.r * 2}
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="45" fill="oklch(0.68 0.1 218)" />
              </svg>
            ))}
            {/* Connection lines */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full"
              style={{ opacity: 0.04 }}
            >
              <line
                x1="8%"
                y1="15%"
                x2="85%"
                y2="25%"
                stroke="oklch(0.68 0.1 218)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <line
                x1="85%"
                y1="25%"
                x2="55%"
                y2="75%"
                stroke="oklch(0.68 0.1 218)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <line
                x1="55%"
                y1="75%"
                x2="20%"
                y2="80%"
                stroke="oklch(0.68 0.1 218)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 md:py-28">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-xs font-bold uppercase tracking-widest text-teal-400">
                <Building2 className="w-3 h-3" />
                Get in Touch
              </span>
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-400 text-xs"
              >
                501(c)(3) Filing In Progress
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-4">
              Let's Build <span className="text-brand-teal">Recovery</span>{" "}
              Together
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Whether you're a healthcare partner, a journalist, a researcher,
              or someone who wants to get involved — we want to hear from you.
              Live Now Recovery is registering as a{" "}
              <strong className="text-foreground">501(c)(3) nonprofit</strong>{" "}
              and building the infrastructure Ohio's recovery ecosystem needs.
            </p>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Active Provider Partners",
                  target: 36,
                  suffix: "+",
                  note: "Across Ohio",
                  color: "border-teal-500/40 bg-teal-500/8",
                  textColor: "text-teal-400",
                },
                {
                  label: "Grant Pending",
                  target: 145,
                  prefix: "$",
                  suffix: "K",
                  note: "Michigan Opioid Settlement Fund · June 2026",
                  color: "border-amber-500/40 bg-amber-500/8",
                  textColor: "text-amber-400",
                },
                {
                  label: "501(c)(3) Status",
                  target: 100,
                  suffix: "%",
                  note: "Filing in progress · Spring 2026",
                  color: "border-purple-500/40 bg-purple-500/8",
                  textColor: "text-purple-400",
                  isProgress: true,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`border ${stat.color} rounded-2xl px-5 py-4 backdrop-blur-sm`}
                >
                  <p
                    className={`text-3xl font-extrabold ${stat.textColor} tabular-nums`}
                  >
                    {stat.isProgress ? (
                      "In Progress"
                    ) : (
                      <AnimatedCounter
                        target={stat.target}
                        suffix={stat.suffix}
                        prefix={stat.prefix}
                      />
                    )}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {stat.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INQUIRY PATHS ─────────────────────────────────────────────────── */}
        <section
          className="max-w-5xl mx-auto px-4 py-16"
          data-ocid="contact.inquiry_paths"
        >
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-2">
              How Can We Help?
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Choose Your Path
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl mx-auto">
              Tell us who you are and we'll make sure your message reaches the
              right team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {INQUIRY_PATHS.map((path, i) => {
              const Icon = path.icon;
              return (
                <div
                  key={path.id}
                  className={`relative border border-border/60 ${path.borderHover} rounded-2xl p-6 bg-card transition-all duration-200 group cursor-pointer hover:-translate-y-0.5 hover:shadow-lg`}
                  data-ocid={`contact.inquiry_path.${i + 1}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 ${path.iconBg} rounded-xl flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${path.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground mb-1.5">
                        {path.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {path.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 italic mb-4">
                        {path.detail}
                      </p>
                      {path.isLink ? (
                        <Link
                          to={path.anchor}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${path.iconColor} hover:opacity-80 transition-opacity`}
                          data-ocid={`contact.inquiry_cta.${i + 1}`}
                        >
                          {path.cta}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => scrollToForm(path.inquiryValue)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${path.iconColor} hover:opacity-80 transition-opacity`}
                          data-ocid={`contact.inquiry_cta.${i + 1}`}
                        >
                          {path.cta} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── QUICK ANSWERS (FAQ) ────────────────────────────────────────────── */}
        <section
          className="py-14"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.12 0.012 230) 0%, oklch(0.14 0.008 240) 100%)",
          }}
          data-ocid="contact.faq"
        >
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-2">
                Quick Answers
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Common Questions
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Before you write — your answer might already be here.
              </p>
            </div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT FORM ──────────────────────────────────────────────────── */}
        <section
          id="form"
          className="max-w-2xl mx-auto px-4 py-16"
          data-ocid="contact.form_section"
        >
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-2">
              Send a Message
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              We're Listening
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              No PHI collected. We'll respond within 48 business hours.
            </p>
          </div>

          {submitted ? (
            <div
              className="flex flex-col items-center gap-5 py-14 text-center border border-teal-500/30 rounded-2xl bg-teal-500/5"
              data-ocid="contact.success_state"
            >
              <div className="w-14 h-14 bg-teal-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Message Received
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Thank you — we'll be in touch within 48 hours. No personal
                  data was stored on our servers.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="min-h-[44px] border-teal-500/40 text-teal-400 hover:bg-teal-500/10"
                data-ocid="contact.secondary_button"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 space-y-5 shadow-xl shadow-black/20"
              data-ocid="contact.form"
            >
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="contact-name"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Name <span className="text-teal-400">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Your name or organization"
                    className="min-h-[44px] bg-background/60"
                    required
                    data-ocid="contact.name_input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contact-email"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Email <span className="text-teal-400">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    className="min-h-[44px] bg-background/60"
                    required
                    data-ocid="contact.email_input"
                  />
                </div>
              </div>

              {/* Inquiry type */}
              <div>
                <Label
                  htmlFor="contact-inquiry"
                  className="text-sm font-medium text-foreground mb-1.5 block"
                >
                  Inquiry Type
                </Label>
                <select
                  id="contact-inquiry"
                  value={form.inquiryType || selectedInquiry}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, inquiryType: e.target.value }))
                  }
                  className="w-full min-h-[44px] rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  data-ocid="contact.inquiry_select"
                >
                  <option value="">Select inquiry type…</option>
                  <option value="Partnership">
                    Partnership &amp; Integration
                  </option>
                  <option value="Media">Media &amp; Press</option>
                  <option value="Volunteer">Volunteer &amp; Community</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <Label
                  htmlFor="contact-subject"
                  className="text-sm font-medium text-foreground mb-1.5 block"
                >
                  Subject
                </Label>
                <Input
                  id="contact-subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  placeholder="Brief subject line"
                  className="min-h-[44px] bg-background/60"
                  data-ocid="contact.subject_input"
                />
              </div>

              {/* Message */}
              <div>
                <Label
                  htmlFor="contact-message"
                  className="text-sm font-medium text-foreground mb-1.5 block"
                >
                  Message <span className="text-teal-400">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="How can we help? Tell us about your organization, your question, or how you'd like to get involved…"
                  className="min-h-[140px] bg-background/60 resize-y"
                  required
                  data-ocid="contact.message_textarea"
                />
              </div>

              {/* Privacy checkbox */}
              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="contact-privacy"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  required
                  className="mt-0.5 w-4 h-4 rounded border-input accent-teal-500 cursor-pointer"
                  data-ocid="contact.privacy_checkbox"
                />
                <label
                  htmlFor="contact-privacy"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I understand that no PHI will be collected and I agree to the{" "}
                  <Link
                    to="/privacy"
                    className="text-teal-400 underline hover:opacity-80"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={!agreedToPrivacy || sending}
                className="w-full min-h-[48px] font-semibold text-base bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                data-ocid="contact.submit_button"
              >
                {sending ? "Sending…" : "Send Message"}
              </Button>

              {sendError && (
                <p
                  className="text-center text-sm text-red-400 mt-2"
                  data-ocid="contact.error_state"
                >
                  {sendError}
                </p>
              )}

              {/* Mailto fallback */}
              <p className="text-center text-xs text-muted-foreground">
                Or email us directly at{" "}
                <a
                  href="mailto:contact@livenowrecovery.org"
                  className="text-teal-400 hover:underline"
                >
                  contact@livenowrecovery.org
                </a>
              </p>
            </form>
          )}
        </section>

        {/* ── INFO STRIP ────────────────────────────────────────────────────── */}
        <section
          className="border-t border-border/40 py-10"
          style={{
            background: "oklch(0.12 0.010 235)",
          }}
          data-ocid="contact.info_strip"
        >
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Mailing Address
                  </p>
                  <p className="text-sm text-foreground">
                    Ohio
                    <br />
                    <span className="text-muted-foreground text-xs">
                      Exact address TBD upon nonprofit registration
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <AtSign className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Follow on X
                  </p>
                  <a
                    href="https://x.com/LiveNowRecovery"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline"
                    data-ocid="contact.twitter_link"
                  >
                    @LiveNowRecovery
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Github className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Open Source
                  </p>
                  <a
                    href="https://github.com/KudbeeZero/live-now-recovery-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:underline flex items-center gap-1"
                    data-ocid="contact.github_link"
                  >
                    GitHub Repo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Response Time
                  </p>
                  <p className="text-sm text-foreground">48 business hours</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Fiscal sponsorship inquiries for the $145K Michigan Opioid
                    Settlement grant welcome
                  </p>
                </div>
              </div>
            </div>

            {/* Callout strip */}
            <div className="mt-8 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                <span className="text-foreground font-medium">
                  Live Now Recovery
                </span>{" "}
                is registering as a 501(c)(3) nonprofit in Spring 2026. All
                operations are currently sustained by grants, donations, and
                founder contributions.
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors"
                  data-ocid="contact.donate_button"
                >
                  <Heart className="w-3.5 h-3.5" /> Support the Mission
                </Link>
                <Link
                  to="/mission"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent border border-border/60 hover:bg-white/5 text-foreground text-xs font-semibold rounded-lg transition-colors"
                  data-ocid="contact.mission_link"
                >
                  <Users className="w-3.5 h-3.5" /> Our Mission
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
