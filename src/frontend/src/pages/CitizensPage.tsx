/**
 * CitizensPage — Full-screen community hub, Citizen-app style.
 * Full-viewport MapLibre map with two pin types:
 *   1. Citizen report pins (community-submitted)
 *   2. Provider pins (MAT clinics, Narcan, ERs, Kiosks, Telehealth)
 * Slide-up bottom drawer with Feed | Stories | Resources tabs.
 */

import {
  BookOpen,
  Briefcase,
  ChevronUp,
  Filter,
  Heart,
  Home,
  Layers,
  MessageSquare,
  Phone,
  Quote,
  Radio,
  Send,
  ShieldCheck,
  Utensils,
  X,
} from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { SEO } from "../components/SEO";
import {
  COUNTY_CENTERS,
  MOCK_SENTINEL_SCORES,
  OHIO_STATEWIDE_AVERAGE,
  SENTINEL_DATA_IS_DEMO,
  TOP_RISK_COUNTIES,
} from "../data/mockSentinelScores";
import {
  useAllProviders,
  useGetAllReports,
  useGetApprovedTestimonials,
  useStoreTestimonial,
  useSubmitCitizenReport,
  useUpvoteCitizenReport,
} from "../hooks/useQueries";
import type { CitizenReport, Testimonial } from "../types/community";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#5eead4"; // brand teal accent
const DARK_BG = "rgba(6,13,20,0.96)";

const ACTIVITY_META: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  "narcan-used": {
    label: "Narcan Used",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    dot: "#22c55e",
  },
  "suspected-od": {
    label: "Suspected OD",
    color: "#f87171",
    bg: "rgba(248,113,113,0.15)",
    dot: "#ef4444",
  },
  "bad-batch-alert": {
    label: "Bad Batch",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.15)",
    dot: "#f97316",
  },
  "area-concern": {
    label: "Area Concern",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.15)",
    dot: "#a855f7",
  },
  "resource-found": {
    label: "Resource Found",
    color: TEAL,
    bg: "rgba(94,234,212,0.15)",
    dot: TEAL,
  },
  "check-in": {
    label: "Check-In",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.15)",
    dot: "#16a34a",
  },
  other: {
    label: "Other",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.15)",
    dot: "#64748b",
  },
};

const PROVIDER_COLORS: Record<string, string> = {
  "MAT Clinic": "#22c55e",
  "Narcan Distribution": "#eab308",
  "Emergency Room": "#ef4444",
  "Naloxone Kiosk": "#a855f7",
  "Telehealth MAT": "#6366f1",
};

const SEED_REPORTS: CitizenReport[] = [
  {
    id: "s1",
    zipCode: "44105",
    activityType: "narcan-used",
    content: "Narcan administered near W. 25th. Person stabilized, EMS called.",
    upvotes: 14,
    lat: 41.468,
    lng: -81.7,
    createdAt: Date.now() - 12 * 60_000,
  },
  {
    id: "s2",
    zipCode: "44102",
    activityType: "resource-found",
    content:
      "Kiosk at Walgreens on Lorain Ave still stocked. No lines, quick access.",
    upvotes: 9,
    lat: 41.477,
    lng: -81.752,
    createdAt: Date.now() - 45 * 60_000,
  },
  {
    id: "s3",
    zipCode: "44115",
    activityType: "check-in",
    content:
      "Day 30 clean. Checked in at Recovery Resources of Northeast Ohio. Staff was great.",
    upvotes: 23,
    lat: 41.493,
    lng: -81.667,
    createdAt: Date.now() - 2 * 3_600_000,
  },
  {
    id: "s4",
    zipCode: "44306",
    activityType: "area-concern",
    content:
      "Seeing more activity near the park on East Ave. Could use more outreach presence.",
    upvotes: 6,
    lat: 41.064,
    lng: -81.492,
    createdAt: Date.now() - 4 * 3_600_000,
  },
  {
    id: "s5",
    zipCode: "44107",
    activityType: "narcan-used",
    content:
      "Second Narcan use this week near Lakewood Park. Community stepping up.",
    upvotes: 18,
    lat: 41.485,
    lng: -81.8,
    createdAt: Date.now() - 6 * 3_600_000,
  },
  {
    id: "s6",
    zipCode: "44303",
    activityType: "resource-found",
    content:
      "Portage Path Behavioral Health has same-day MAT intake slots open this week.",
    upvotes: 31,
    lat: 41.098,
    lng: -81.52,
    createdAt: Date.now() - 9 * 3_600_000,
  },
];

const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    authorId: "",
    authorDisplayName: "Marcus T.",
    zipCode: "44105",
    content:
      "I found my MAT clinic through this app at 2am when I had nowhere else to turn. The map showed me there was help 4 blocks away. I am 11 months clean now.",
    isApproved: true,
    isHidden: false,
    createdAt: BigInt(Date.now() - 30 * 24 * 3_600_000),
  },
  {
    id: "t2",
    authorId: "",
    authorDisplayName: "Anonymous Community Member",
    zipCode: "44107",
    content:
      "My son was in crisis and I didn't know where to start. Live Now Recovery showed us the nearest ER with a 72-hour bridge program. He got buprenorphine started that same night.",
    isApproved: true,
    isHidden: false,
    createdAt: BigInt(Date.now() - 14 * 24 * 3_600_000),
  },
  {
    id: "t3",
    authorId: "",
    authorDisplayName: "Denise R.",
    zipCode: "44203",
    content:
      "As a peer support worker, this tool has changed how I connect people. I pull it up on my phone and within a minute I can show someone their closest naloxone kiosk.",
    isApproved: true,
    isHidden: false,
    createdAt: BigInt(Date.now() - 7 * 24 * 3_600_000),
  },
];

const RESOURCES = [
  {
    icon: Heart,
    title: "Naloxone / Narcan",
    color: "#22c55e",
    items: [
      {
        name: "NEXT Distro — Free Naloxone Mail",
        link: "https://nextdistro.org",
        phone: null,
      },
      {
        name: "Ohio Dept. of Health Naloxone Locator",
        link: "https://odh.ohio.gov",
        phone: null,
      },
      {
        name: "SAMHSA Treatment Locator",
        link: "https://findtreatment.samhsa.gov",
        phone: null,
      },
    ],
  },
  {
    icon: Phone,
    title: "Crisis Lines",
    color: "#f87171",
    items: [
      { name: "988 Suicide & Crisis Lifeline", link: null, phone: "988" },
      {
        name: "SAMHSA National Helpline (24/7, free, confidential)",
        link: null,
        phone: "1-800-662-4357",
      },
      {
        name: "Crisis Text Line — text HOME to 741741",
        link: null,
        phone: null,
      },
    ],
  },
  {
    icon: Utensils,
    title: "Food Assistance",
    color: "#fb923c",
    items: [
      {
        name: "Ohio Association of Food Banks",
        link: "https://ohiofoodbanks.org",
        phone: null,
      },
      {
        name: "Second Harvest Food Bank (NE Ohio)",
        link: "https://secondharvestfoodbank.org",
        phone: "330-792-5522",
      },
      {
        name: "Greater Cleveland Food Bank",
        link: "https://greaterclevelandfoodbank.org",
        phone: "216-738-2265",
      },
    ],
  },
  {
    icon: Home,
    title: "Housing & Sober Living",
    color: "#a855f7",
    items: [
      {
        name: "Ohio Coalition for the Homeless",
        link: "https://cohhio.org",
        phone: "614-280-1984",
      },
      {
        name: "National Alliance to End Homelessness",
        link: "https://endhomelessness.org",
        phone: null,
      },
      {
        name: "SAMHSA Housing Locator",
        link: "https://findtreatment.samhsa.gov",
        phone: null,
      },
    ],
  },
  {
    icon: Briefcase,
    title: "Employment",
    color: TEAL,
    items: [
      {
        name: "OhioMeansJobs — Ohio Career Services",
        link: "https://ohiomeansjobs.gov",
        phone: null,
      },
      {
        name: "Cascade Employment Recovery-Friendly Employers",
        link: "https://cascadeemployment.com",
        phone: null,
      },
    ],
  },
  {
    icon: BookOpen,
    title: "Legal Aid",
    color: "#6366f1",
    items: [
      {
        name: "Ohio Legal Help",
        link: "https://ohiolegalhelp.org",
        phone: null,
      },
      {
        name: "Legal Aid Society of Cleveland",
        link: "https://lasclev.org",
        phone: "216-687-1900",
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Bill & Utility Assistance",
    color: "#eab308",
    items: [
      {
        name: "Ohio Development Services Agency — HEAP",
        link: "https://energyhelp.ohio.gov",
        phone: "800-282-0880",
      },
      {
        name: "Ohio Benefits — Benefits.ohio.gov",
        link: "https://benefits.ohio.gov",
        phone: null,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isThisWeek(ts: number): boolean {
  return Date.now() - ts < 7 * 24 * 3_600_000;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReportCard({ report }: { report: CitizenReport }) {
  const meta = ACTIVITY_META[report.activityType] ?? ACTIVITY_META.other;
  const upvoteMutation = useUpvoteCitizenReport();
  const [localUpvotes, setLocalUpvotes] = useState(report.upvotes);
  const [upvoted, setUpvoted] = useState(false);

  function handleUpvote() {
    if (upvoted) return;
    setUpvoted(true);
    setLocalUpvotes((v) => v + 1);
    upvoteMutation.mutate(report.id);
  }

  return (
    <article
      className="flex flex-col gap-2 px-4 py-3 border-b"
      style={{ borderColor: "rgba(255,255,255,0.05)" }}
      data-ocid={`citizens.report_${report.id}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{ background: meta.bg, color: meta.color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: meta.dot }}
            aria-hidden="true"
          />
          {meta.label}
        </span>
        <span
          className="text-[10px]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {timeAgo(report.createdAt)}
        </span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span
            className="text-xs font-bold mr-2"
            style={{ color: meta.color }}
          >
            {report.zipCode}
          </span>
          <span
            className="text-xs leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            {report.content.length > 120
              ? `${report.content.slice(0, 120)}…`
              : report.content}
          </span>
        </div>
        <button
          type="button"
          onClick={handleUpvote}
          disabled={upvoted}
          aria-label={`Upvote — ${localUpvotes}`}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all"
          style={{
            background: upvoted
              ? "rgba(94,234,212,0.15)"
              : "rgba(255,255,255,0.05)",
            border: upvoted
              ? "1px solid rgba(94,234,212,0.4)"
              : "1px solid rgba(255,255,255,0.08)",
            color: upvoted ? TEAL : "rgba(255,255,255,0.4)",
          }}
          data-ocid={`citizens.upvote_${report.id}`}
        >
          <ChevronUp className="w-3 h-3" />
          {localUpvotes}
        </button>
      </div>
    </article>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article
      className="px-4 py-4 border-b"
      style={{ borderColor: "rgba(255,255,255,0.05)" }}
      data-ocid={`citizens.story_${t.id}`}
    >
      <Quote
        className="w-4 h-4 mb-2 opacity-30"
        style={{ color: TEAL }}
        aria-hidden="true"
      />
      <p
        className="text-xs leading-relaxed mb-3"
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        &ldquo;
        {t.content.length > 220 ? `${t.content.slice(0, 220)}…` : t.content}
        &rdquo;
      </p>
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{
            background: "rgba(94,234,212,0.12)",
            color: TEAL,
            border: "1px solid rgba(94,234,212,0.25)",
          }}
          aria-hidden="true"
        >
          {t.authorDisplayName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p
            className="text-[11px] font-semibold leading-none"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {t.authorDisplayName}
          </p>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            ZIP {t.zipCode}
          </p>
        </div>
      </div>
    </article>
  );
}

// ─── Report Composer ──────────────────────────────────────────────────────────

function ReportComposer({ onClose }: { onClose: () => void }) {
  const submitMutation = useSubmitCitizenReport();
  const [type, setType] =
    useState<CitizenReport["activityType"]>("narcan-used");
  const [content, setContent] = useState("");
  const [zip, setZip] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !zip.trim()) return;
    await submitMutation.mutateAsync({
      activityType: type,
      content: content.trim(),
      zipCode: zip.trim(),
    });
    setDone(true);
    setTimeout(onClose, 1400);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          <ShieldCheck className="w-5 h-5" style={{ color: "#22c55e" }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
          Report submitted!
        </p>
        <p
          className="text-xs text-center"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Thank you for keeping the community informed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between mb-1">
        <p
          className="text-sm font-bold"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          New Community Report
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          className="p-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <X
            className="w-3.5 h-3.5"
            style={{ color: "rgba(255,255,255,0.5)" }}
          />
        </button>
      </div>
      <select
        value={type}
        onChange={(e) =>
          setType(e.target.value as CitizenReport["activityType"])
        }
        className="w-full rounded-xl px-3 py-2 text-xs font-medium"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.85)",
        }}
        data-ocid="citizens.report_type_select"
      >
        {Object.entries(ACTIVITY_META).map(([key, m]) => (
          <option key={key} value={key} style={{ background: "#0d1a24" }}>
            {m.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="ZIP Code (e.g. 44105)"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        maxLength={10}
        className="w-full rounded-xl px-3 py-2 text-xs"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.85)",
        }}
        data-ocid="citizens.report_zip"
      />
      <textarea
        placeholder="What did you see or experience? Be specific but brief."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={500}
        className="w-full rounded-xl px-3 py-2 text-xs resize-none"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.85)",
        }}
        data-ocid="citizens.report_content"
      />
      <button
        type="submit"
        disabled={!content.trim() || !zip.trim() || submitMutation.isPending}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{
          background:
            content.trim() && zip.trim()
              ? "rgba(94,234,212,0.18)"
              : "rgba(255,255,255,0.05)",
          border:
            content.trim() && zip.trim()
              ? "1px solid rgba(94,234,212,0.4)"
              : "1px solid rgba(255,255,255,0.08)",
          color: content.trim() && zip.trim() ? TEAL : "rgba(255,255,255,0.25)",
        }}
        data-ocid="citizens.report_submit"
      >
        <Send className="w-3.5 h-3.5" />
        {submitMutation.isPending ? "Submitting…" : "Submit Report"}
      </button>
    </form>
  );
}

// ─── Story Composer ───────────────────────────────────────────────────────────

function StoryComposer({ onClose }: { onClose: () => void }) {
  const storeMutation = useStoreTestimonial();
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [story, setStory] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!story.trim()) return;
    await storeMutation.mutateAsync({
      authorDisplayName: name.trim() || "Anonymous",
      zipCode: zip.trim() || "OH",
      content: story.trim(),
    });
    setDone(true);
    setTimeout(onClose, 1600);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(94,234,212,0.12)",
            border: "1px solid rgba(94,234,212,0.25)",
          }}
        >
          <Heart className="w-5 h-5" style={{ color: TEAL }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: TEAL }}>
          Story received!
        </p>
        <p
          className="text-xs text-center"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          It'll appear after review. Thank you for sharing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between mb-1">
        <p
          className="text-sm font-bold"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Share Your Story
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          className="p-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <X
            className="w-3.5 h-3.5"
            style={{ color: "rgba(255,255,255,0.5)" }}
          />
        </button>
      </div>
      <input
        type="text"
        placeholder="Display name (optional — leave blank for anonymous)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={50}
        className="w-full rounded-xl px-3 py-2 text-xs"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.85)",
        }}
        data-ocid="citizens.story_name"
      />
      <input
        type="text"
        placeholder="ZIP Code (optional)"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        maxLength={10}
        className="w-full rounded-xl px-3 py-2 text-xs"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.85)",
        }}
        data-ocid="citizens.story_zip"
      />
      <textarea
        placeholder="Your recovery journey, how you found help, or how you've helped others. No medical details needed — your words matter."
        value={story}
        onChange={(e) => setStory(e.target.value.slice(0, 500))}
        rows={4}
        maxLength={500}
        className="w-full rounded-xl px-3 py-2 text-xs resize-none"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.85)",
        }}
        data-ocid="citizens.story_content"
      />
      <p
        className="text-[10px] text-right"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        {story.length}/500
      </p>
      <button
        type="submit"
        disabled={!story.trim() || storeMutation.isPending}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{
          background: story.trim()
            ? "rgba(94,234,212,0.18)"
            : "rgba(255,255,255,0.05)",
          border: story.trim()
            ? "1px solid rgba(94,234,212,0.4)"
            : "1px solid rgba(255,255,255,0.08)",
          color: story.trim() ? TEAL : "rgba(255,255,255,0.25)",
        }}
        data-ocid="citizens.story_submit"
      >
        <Heart className="w-3.5 h-3.5" />
        {storeMutation.isPending ? "Submitting…" : "Share Story"}
      </button>
    </form>
  );
}

// ─── Resources Tab ────────────────────────────────────────────────────────────

function ResourcesTab() {
  return (
    <div className="flex flex-col gap-1 pb-4">
      {RESOURCES.map((cat) => (
        <div
          key={cat.title}
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <cat.icon
              className="w-4 h-4 shrink-0"
              style={{ color: cat.color }}
              aria-hidden="true"
            />
            <span className="text-xs font-bold" style={{ color: cat.color }}>
              {cat.title}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 pl-6">
            {cat.items.map((item) => (
              <div
                key={item.name}
                className="flex items-start justify-between gap-2"
              >
                <span
                  className="text-xs leading-snug"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  {item.name}
                </span>
                {item.phone && (
                  <a
                    href={`tel:${item.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-1 shrink-0 text-[11px] font-semibold rounded-full px-2 py-0.5 transition-all"
                    style={{
                      background: "rgba(248,113,113,0.12)",
                      color: "#f87171",
                      border: "1px solid rgba(248,113,113,0.2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Phone className="w-2.5 h-2.5" /> {item.phone}
                  </a>
                )}
                {item.link && !item.phone && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[11px] font-semibold rounded-full px-2 py-0.5 transition-all"
                    style={{
                      background: "rgba(94,234,212,0.08)",
                      color: TEAL,
                      border: "1px solid rgba(94,234,212,0.18)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Bottom Drawer ────────────────────────────────────────────────────────────

type DrawerState = "collapsed" | "peek" | "expanded";
type DrawerTab = "feed" | "stories" | "resources" | "sentinel";

interface DrawerProps {
  reports: CitizenReport[];
  testimonials: Testimonial[];
  reportsWeek: number;
  narcanLocations: number;
  storiesCount: number;
  drawerState: DrawerState;
  setDrawerState: (s: DrawerState) => void;
  drawerTab: DrawerTab;
  setDrawerTab: (t: DrawerTab) => void;
  selectedCounty: string | null;
}

function BottomDrawer({
  reports,
  testimonials,
  reportsWeek,
  narcanLocations,
  storiesCount,
  drawerState: state,
  setDrawerState: setState,
  drawerTab: tab,
  setDrawerTab: setTab,
  selectedCounty,
}: DrawerProps) {
  const [showReportComposer, setShowReportComposer] = useState(false);
  const [showStoryComposer, setShowStoryComposer] = useState(false);
  const startYRef = useRef(0);
  const startStateRef = useRef<DrawerState>("peek");

  const heightMap: Record<DrawerState, string> = {
    collapsed: "52px",
    peek: "100px",
    expanded: "62vh",
  };

  function onTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
    startStateRef.current = state;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dy = startYRef.current - e.changedTouches[0].clientY;
    if (dy > 40)
      setState(startStateRef.current === "collapsed" ? "peek" : "expanded");
    else if (dy < -40)
      setState(startStateRef.current === "expanded" ? "peek" : "collapsed");
  }
  function toggleExpand() {
    setState(
      state === "expanded" ? "peek" : state === "peek" ? "expanded" : "peek",
    );
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex flex-col"
      style={{
        height: heightMap[state],
        transition: "height 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
        background: DARK_BG,
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px 20px 0 0",
      }}
      data-ocid="citizens.bottom_drawer"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="flex flex-col items-center pt-3 pb-1 shrink-0 w-full"
        style={{ background: "transparent", border: "none" }}
        onClick={toggleExpand}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label={state === "expanded" ? "Collapse drawer" : "Expand drawer"}
        data-ocid="citizens.drawer_handle"
      >
        <div
          className="w-10 h-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.18)" }}
          aria-hidden="true"
        />
      </button>

      {/* Stats row — visible in peek */}
      {state !== "collapsed" && (
        <div className="flex items-center justify-between px-5 py-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#22c55e" }}
              aria-hidden="true"
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <span style={{ color: "#22c55e" }}>{reportsWeek}</span> reports
              this week
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <span style={{ color: TEAL }}>{narcanLocations}</span> Narcan
              locations &bull;{" "}
              <span style={{ color: TEAL }}>{storiesCount}</span> stories
            </span>
          </div>
          <Radio
            className="w-3 h-3 shrink-0"
            style={{ color: "rgba(255,255,255,0.2)" }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Expanded content */}
      {state === "expanded" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Tab bar */}
          <div
            className="flex shrink-0 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {(["feed", "stories", "resources", "sentinel"] as DrawerTab[]).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setShowReportComposer(false);
                    setShowStoryComposer(false);
                  }}
                  className="flex-1 py-2.5 text-xs font-semibold transition-colors capitalize"
                  style={{
                    color: tab === t ? TEAL : "rgba(255,255,255,0.35)",
                    borderBottom:
                      tab === t ? `2px solid ${TEAL}` : "2px solid transparent",
                  }}
                  data-ocid={`citizens.tab_${t}`}
                >
                  {t === "feed"
                    ? `Feed (${reports.length})`
                    : t === "stories"
                      ? `Stories (${testimonials.length})`
                      : t === "sentinel"
                        ? "Sentinel"
                        : "Resources"}
                </button>
              ),
            )}
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {tab === "feed" && (
              <>
                {/* Action bar */}
                {!showReportComposer && (
                  <div
                    className="px-4 py-2.5 border-b flex items-center justify-between"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <p
                      className="text-[11px]"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Community reports — anonymous, no PHI
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowReportComposer(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                      style={{
                        background: "rgba(94,234,212,0.12)",
                        border: "1px solid rgba(94,234,212,0.3)",
                        color: TEAL,
                      }}
                      data-ocid="citizens.new_report_btn"
                    >
                      <MessageSquare className="w-3 h-3" /> New Report
                    </button>
                  </div>
                )}
                {showReportComposer && (
                  <ReportComposer
                    onClose={() => setShowReportComposer(false)}
                  />
                )}
                {reports.length > 0
                  ? reports.map((r) => <ReportCard key={r.id} report={r} />)
                  : !showReportComposer && (
                      <div
                        className="flex flex-col items-center justify-center py-10 gap-3"
                        data-ocid="citizens.feed_empty"
                      >
                        <MessageSquare
                          className="w-8 h-8 opacity-20"
                          style={{ color: TEAL }}
                        />
                        <p
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          No reports yet — be the first.
                        </p>
                      </div>
                    )}
              </>
            )}

            {tab === "stories" && (
              <>
                {!showStoryComposer && (
                  <div
                    className="px-4 py-2.5 border-b flex items-center justify-between"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <p
                      className="text-[11px]"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Peer support stories — reviewed before posting
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowStoryComposer(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                      style={{
                        background: "rgba(94,234,212,0.12)",
                        border: "1px solid rgba(94,234,212,0.3)",
                        color: TEAL,
                      }}
                      data-ocid="citizens.share_story_btn"
                    >
                      <Heart className="w-3 h-3" /> Share Story
                    </button>
                  </div>
                )}
                {showStoryComposer && (
                  <StoryComposer onClose={() => setShowStoryComposer(false)} />
                )}
                {testimonials.length > 0
                  ? testimonials.map((t) => (
                      <TestimonialCard key={t.id} t={t} />
                    ))
                  : !showStoryComposer && (
                      <div
                        className="flex flex-col items-center justify-center py-10 gap-3"
                        data-ocid="citizens.stories_empty"
                      >
                        <Quote
                          className="w-8 h-8 opacity-20"
                          style={{ color: TEAL }}
                        />
                        <p
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          No stories yet. Be the first to share.
                        </p>
                      </div>
                    )}
              </>
            )}

            {tab === "resources" && <ResourcesTab />}

            {tab === "sentinel" && (
              <div
                style={{
                  padding: "12px 16px",
                  overflowY: "auto",
                  maxHeight: "100%",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#f5f5f0",
                    }}
                  >
                    {selectedCounty
                      ? `${selectedCounty} County`
                      : "Ohio Statewide"}{" "}
                    — Signal Breakdown
                  </h3>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: "2px",
                    }}
                  >
                    {selectedCounty
                      ? "Hover counties on map to switch"
                      : "No county selected — showing statewide average"}
                  </p>
                </div>

                {(() => {
                  const data = selectedCounty
                    ? MOCK_SENTINEL_SCORES[selectedCounty]
                    : OHIO_STATEWIDE_AVERAGE;
                  if (!data) return null;
                  const signals: { name: string; value: number }[] = [
                    {
                      name: "Govt Payment Proximity",
                      value: data.signals.governmentPaymentProximity,
                    },
                    { name: "Heat Index", value: data.signals.heatIndex },
                    { name: "Cold Weather", value: data.signals.coldWeather },
                    {
                      name: "Unemployment Rate",
                      value: data.signals.unemploymentRate,
                    },
                    {
                      name: "Eviction Rate Index",
                      value: data.signals.evictionRate,
                    },
                    {
                      name: "Seasonal Depression",
                      value: data.signals.seasonalDepression,
                    },
                    {
                      name: "Provider Gap",
                      value: data.signals.providerAvailabilityGap,
                    },
                  ];
                  return signals.map((sig) => {
                    const color =
                      sig.value >= 70
                        ? "#ef4444"
                        : sig.value >= 50
                          ? "#f59e0b"
                          : "#00c896";
                    return (
                      <div key={sig.name} style={{ marginBottom: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "3px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.7)",
                            }}
                          >
                            {sig.name}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color,
                              }}
                            >
                              {sig.value}
                            </span>
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: color,
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            borderRadius: "3px",
                            height: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background: color,
                              height: "100%",
                              width: `${sig.value}%`,
                              borderRadius: "3px",
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}

                {selectedCounty &&
                  MOCK_SENTINEL_SCORES[selectedCounty]?.compound_risk && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "8px 10px",
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "8px",
                        color: "#ef4444",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      ⚠ COMPOUND RISK EVENT — Multiple converging signals
                    </div>
                  )}

                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <a
                    href="/integration"
                    style={{
                      color: "#00c896",
                      fontSize: "12px",
                      textDecoration: "none",
                    }}
                  >
                    Learn about Sentinel →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Filter Toggle Pill ───────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  dot,
  onClick,
}: { label: string; active: boolean; dot: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0"
      style={{
        background: active ? `rgba(${dot},0.18)` : "rgba(0,0,0,0.45)",
        border: active
          ? `1px solid rgba(${dot},0.5)`
          : "1px solid rgba(255,255,255,0.1)",
        color: active ? `rgb(${dot})` : "rgba(255,255,255,0.45)",
        backdropFilter: "blur(8px)",
      }}
      data-ocid={`citizens.filter_${label.toLowerCase()}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: active ? `rgb(${dot})` : "rgba(255,255,255,0.25)",
        }}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}

// ─── Main Map with Markers ────────────────────────────────────────────────────

interface MapLayerState {
  reports: boolean;
  narcan: boolean;
  clinics: boolean;
  ers: boolean;
  sentinel: boolean;
}

interface ProviderData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  providerType?: string;
  is_live?: boolean;
  phone?: string;
}

function CitizensMap({
  reports,
  providers,
  filters,
  onCountySelect,
}: {
  reports: CitizenReport[];
  providers: ProviderData[];
  filters: MapLayerState;
  onCountySelect: (county: string | null) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const reportMarkersRef = useRef<maplibregl.Marker[]>([]);
  const providerMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [-81.69, 41.5], // Ohio
      zoom: 9,
      attributionControl: false,
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right",
    );
    // Load Ohio county choropleth (Sentinel layer)
    map.on("load", () => {
      fetch(
        "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/us-states/OH-39-ohio-counties.json",
      )
        .then((r) => r.json())
        .then((topology) => {
          // Convert topojson to geojson using inline logic
          // The topology object has an 'objects' key with county features
          let geojson: object;
          if (topology.type === "Topology" && topology.objects) {
            // Use topojson-client if available, otherwise use a simple inline converter
            const key = Object.keys(topology.objects)[0];
            const arcArr: number[][][] = topology.arcs as number[][][];
            function decodeArc(arc: number[][]): number[][] {
              let x = 0;
              let y = 0;
              return arc.map(([dx, dy]) => {
                x += dx;
                y += dy;
                return [x, y];
              });
            }
            function toCoords(arcIdx: number): number[][] {
              const idx = arcIdx < 0 ? ~arcIdx : arcIdx;
              const pts = decodeArc(arcArr[idx]);
              return arcIdx < 0 ? pts.slice().reverse() : pts;
            }
            function scalePoint(pt: number[]): number[] {
              const t = topology.transform as {
                scale: number[];
                translate: number[];
              };
              if (!t) return pt;
              return [
                pt[0] * t.scale[0] + t.translate[0],
                pt[1] * t.scale[1] + t.translate[1],
              ];
            }
            const features = (
              topology.objects[key] as {
                geometries: Array<{
                  type: string;
                  arcs: number[][][];
                  properties: Record<string, string>;
                }>;
              }
            ).geometries.map((geom) => {
              const coordinates = geom.arcs.map((ring: number[][]) =>
                (ring as unknown as number[])
                  .flatMap((arcIdx: number) => toCoords(arcIdx))
                  .map(scalePoint),
              );
              return {
                type: "Feature" as const,
                properties: geom.properties ?? {},
                geometry: { type: "Polygon" as const, coordinates },
              };
            });
            geojson = { type: "FeatureCollection", features };
          } else {
            geojson = topology;
          }

          if (!map.getSource("ohio-counties")) {
            map.addSource("ohio-counties", {
              type: "geojson",
              data: geojson as GeoJSON.FeatureCollection,
            });
          }

          const matchParts: unknown[] = ["match", ["get", "NAME"]];
          for (const [county, data] of Object.entries(MOCK_SENTINEL_SCORES)) {
            let color: string;
            if (data.score >= 90) color = "rgba(239,68,68,0.55)";
            else if (data.score >= 70) color = "rgba(249,115,22,0.45)";
            else if (data.score >= 40) color = "rgba(245,158,11,0.35)";
            else color = "rgba(0,200,150,0.25)";
            matchParts.push(county, color);
          }
          matchParts.push("rgba(0,200,150,0.15)");
          const matchExpr =
            matchParts as unknown as maplibregl.ExpressionSpecification;

          if (!map.getLayer("sentinel-counties")) {
            map.addLayer({
              id: "sentinel-counties",
              type: "fill",
              source: "ohio-counties",
              paint: { "fill-color": matchExpr },
              layout: { visibility: "visible" },
            });
          }
          if (!map.getLayer("sentinel-county-borders")) {
            map.addLayer({
              id: "sentinel-county-borders",
              type: "line",
              source: "ohio-counties",
              paint: {
                "line-color": "rgba(255,255,255,0.10)",
                "line-width": 1,
              },
              layout: { visibility: "visible" },
            });
          }

          // Hover popup
          let sentinelPopup: maplibregl.Popup | null = null;
          map.on("mouseenter", "sentinel-counties", (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (!e.features || e.features.length === 0) return;
            const countyName = e.features[0].properties?.NAME as string;
            const data = MOCK_SENTINEL_SCORES[countyName];
            if (!data) return;
            onCountySelect(countyName);
            const bucketColors: Record<string, string> = {
              green: "#00c896",
              amber: "#f59e0b",
              orange: "#f97316",
              red: "#ef4444",
            };
            const bucketLabels: Record<string, string> = {
              green: "Low Risk",
              amber: "Moderate Risk",
              orange: "High Risk",
              red: "Critical",
            };
            sentinelPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="background:#0d1a24;padding:12px 14px;border-radius:10px;min-width:200px;font-family:inherit;">
                  <div style="font-weight:700;font-size:14px;color:#f5f5f0;margin-bottom:8px;">${countyName} County</div>
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span style="font-size:22px;font-weight:800;color:${bucketColors[data.bucket]}">${data.score}</span>
                    <span style="background:${bucketColors[data.bucket]}22;color:${bucketColors[data.bucket]};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;">${bucketLabels[data.bucket]}</span>
                  </div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:4px;">Primary signal: ${data.primarySignal}</div>
                  ${data.compound_risk ? '<div style="color:#ef4444;font-size:11px;font-weight:600;margin-top:6px;">⚠ COMPOUND RISK EVENT</div>' : ""}
                </div>
              `)
              .addTo(map);
          });
          map.on("mouseleave", "sentinel-counties", () => {
            map.getCanvas().style.cursor = "";
            sentinelPopup?.remove();
            sentinelPopup = null;
          });
        })
        .catch((err) => console.warn("Sentinel choropleth load failed:", err));
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onCountySelect]);

  // Render citizen report markers
  const renderReportMarkers = useCallback(() => {
    for (const m of reportMarkersRef.current) m.remove();
    reportMarkersRef.current = [];
    if (!mapRef.current || !filters.reports) return;

    for (const report of reports) {
      const lat = report.lat ?? 41.4 + Math.random() * 0.4;
      const lng = report.lng ?? -81.8 + Math.random() * 0.4;
      const meta = ACTIVITY_META[report.activityType] ?? ACTIVITY_META.other;

      const el = document.createElement("div");
      el.style.cssText = `
        width: 22px; height: 22px; border-radius: 50%;
        background: ${meta.dot}; border: 2px solid rgba(255,255,255,0.7);
        cursor: pointer; box-shadow: 0 0 8px ${meta.dot}88;
        display: flex; align-items: center; justify-content: center;
        animation: pulseMarker 2s ease-in-out infinite;
      `;

      const popup = new maplibregl.Popup({
        offset: 14,
        closeButton: true,
        maxWidth: "220px",
      }).setHTML(`
          <div style="background:#0d1a24;padding:10px 12px;border-radius:10px;min-width:180px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="background:${meta.bg};color:${meta.color};padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;">${meta.label}</span>
              <span style="color:rgba(255,255,255,0.35);font-size:10px;">ZIP ${report.zipCode}</span>
            </div>
            <p style="color:rgba(255,255,255,0.78);font-size:11px;line-height:1.5;margin:0 0 6px 0;">${report.content.slice(0, 120)}${report.content.length > 120 ? "…" : ""}</p>
            <div style="color:rgba(255,255,255,0.3);font-size:10px;">${report.upvotes} upvotes · ${timeAgo(report.createdAt)}</div>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      reportMarkersRef.current.push(marker);
    }
  }, [reports, filters.reports]);

  // Render provider markers
  const renderProviderMarkers = useCallback(() => {
    for (const m of providerMarkersRef.current) m.remove();
    providerMarkersRef.current = [];
    if (!mapRef.current) return;

    for (const p of providers) {
      const type = p.providerType ?? "MAT Clinic";
      const color = PROVIDER_COLORS[type] ?? "#6366f1";

      const isNarcan =
        type === "Narcan Distribution" || type === "Naloxone Kiosk";
      const isClinic = type === "MAT Clinic" || type === "Telehealth MAT";
      const isER = type === "Emergency Room";

      if (isNarcan && !filters.narcan) continue;
      if (isClinic && !filters.clinics) continue;
      if (isER && !filters.ers) continue;

      const el = document.createElement("div");
      el.style.cssText = `
        width: 26px; height: 26px; border-radius: 6px;
        background: ${color}22; border: 2px solid ${color};
        cursor: pointer; box-shadow: 0 0 10px ${color}44;
        display: flex; align-items: center; justify-content: center;
        color: ${color}; font-size: 11px; font-weight: 800;
      `;
      el.textContent =
        type === "Emergency Room"
          ? "ER"
          : type === "Telehealth MAT"
            ? "T"
            : type === "Naloxone Kiosk"
              ? "K"
              : type === "Narcan Distribution"
                ? "N"
                : "M";

      const liveIndicator = p.is_live
        ? `<span style="background:#22c55e;color:#000;padding:1px 6px;border-radius:999px;font-size:9px;font-weight:700;margin-left:4px;">LIVE</span>`
        : `<span style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);padding:1px 6px;border-radius:999px;font-size:9px;margin-left:4px;">OFFLINE</span>`;

      const popup = new maplibregl.Popup({
        offset: 14,
        closeButton: true,
        maxWidth: "240px",
      }).setHTML(`
          <div style="background:#0d1a24;padding:10px 12px;border-radius:10px;min-width:200px;">
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">
              <span style="background:${color}22;color:${color};padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;">${type}</span>
              ${liveIndicator}
            </div>
            <p style="color:rgba(255,255,255,0.9);font-size:13px;font-weight:700;margin:4px 0 2px 0;">${p.name}</p>
            ${p.phone ? `<p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0;">📞 ${p.phone}</p>` : ""}
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      providerMarkersRef.current.push(marker);
    }
  }, [providers, filters]);

  // Sync sentinel layer visibility with filter state
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const vis = filters.sentinel ? "visible" : "none";
    if (map.getLayer("sentinel-counties"))
      map.setLayoutProperty("sentinel-counties", "visibility", vis);
    if (map.getLayer("sentinel-county-borders"))
      map.setLayoutProperty("sentinel-county-borders", "visibility", vis);
  }, [filters.sentinel]);

  useEffect(() => {
    renderReportMarkers();
  }, [renderReportMarkers]);
  useEffect(() => {
    renderProviderMarkers();
  }, [renderProviderMarkers]);

  return (
    <>
      <style>{`
        @keyframes pulseMarker {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        .maplibregl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }
        .maplibregl-popup-tip { display: none !important; }
        .maplibregl-ctrl-group { background: rgba(6,13,20,0.85) !important; border: 1px solid rgba(255,255,255,0.1) !important; }
        .maplibregl-ctrl-group button { color: rgba(255,255,255,0.7) !important; }
        .maplibregl-ctrl-group button:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>
      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        aria-label="Community map"
      />

      {/* Sentinel Signal Snapshot Widget — desktop */}
      <div
        style={{
          position: "absolute",
          top: "72px",
          left: "12px",
          zIndex: 20,
          background: "rgba(6,13,20,0.92)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,200,150,0.2)",
          borderRadius: "10px",
          padding: "10px 12px",
          minWidth: "180px",
        }}
        className="hidden md:block"
      >
        <div
          style={{
            color: "#00c896",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          SENTINEL SIGNALS
        </div>
        {(
          [
            { name: "Payment Proximity", value: "3 days", dot: "#ef4444" },
            { name: "Cold Weather", value: "Active", dot: "#f97316" },
            { name: "Eviction Rate", value: "Elevated", dot: "#f59e0b" },
            { name: "Provider Gap", value: "High", dot: "#f59e0b" },
          ] as { name: string; value: string; dot: string }[]
        ).map((sig) => (
          <div
            key={sig.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginBottom: "5px",
            }}
          >
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>
              {sig.name}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{ fontSize: "11px", color: "#f5f5f0", fontWeight: 600 }}
              >
                {sig.value}
              </span>
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: sig.dot,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Mobile: collapsed SENTINEL pill */}
      <div
        style={{ position: "absolute", top: "72px", left: "12px", zIndex: 20 }}
        className="block md:hidden"
      >
        <button
          type="button"
          style={{
            background: "rgba(6,13,20,0.92)",
            border: "1px solid rgba(0,200,150,0.3)",
            color: "#00c896",
            borderRadius: "99px",
            padding: "5px 12px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
          }}
          aria-label="Sentinel signals"
        >
          SENTINEL ▾
        </button>
      </div>

      {/* Top Risk Counties Widget — desktop only */}
      <div
        style={{
          position: "absolute",
          top: "96px",
          right: "48px",
          zIndex: 20,
          background: "rgba(6,13,20,0.92)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          padding: "10px 12px",
          minWidth: "180px",
        }}
        className="hidden md:block"
      >
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          HIGHEST RISK NOW
        </div>
        {TOP_RISK_COUNTIES.map((county, i) => {
          const bucketColors: Record<string, string> = {
            green: "#00c896",
            amber: "#f59e0b",
            orange: "#f97316",
            red: "#ef4444",
          };
          const bucketLabels: Record<string, string> = {
            green: "Low",
            amber: "Mod",
            orange: "High",
            red: "Critical",
          };
          return (
            <button
              key={county.name}
              type="button"
              onClick={() => {
                const center = COUNTY_CENTERS[county.name];
                if (center && mapRef.current)
                  mapRef.current.flyTo({ center, zoom: 10, duration: 1200 });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 600,
                }}
              >
                {i + 1}. {county.name}
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: bucketColors[county.bucket],
                  }}
                >
                  {county.score}
                </span>
                <span
                  style={{
                    background: `${bucketColors[county.bucket]}22`,
                    color: bucketColors[county.bucket],
                    padding: "1px 6px",
                    borderRadius: "99px",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  {bucketLabels[county.bucket]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function MapLegend({ showProviders }: { showProviders: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute bottom-28 right-3 z-20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold"
        style={{
          background: "rgba(6,13,20,0.85)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.6)",
        }}
        data-ocid="citizens.legend_toggle"
        aria-label="Toggle map legend"
      >
        <Layers className="w-3.5 h-3.5" /> Legend
      </button>
      {open && (
        <div
          className="absolute bottom-9 right-0 flex flex-col gap-1.5 px-3 py-3 rounded-xl"
          style={{
            background: "rgba(6,13,20,0.94)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: 160,
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-1"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Community Reports
          </p>
          {Object.entries(ACTIVITY_META)
            .filter(([k]) => k !== "other")
            .map(([key, m]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: m.dot, boxShadow: `0 0 4px ${m.dot}` }}
                  aria-hidden="true"
                />
                <span
                  className="text-[10px]"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          {showProviders && (
            <>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mt-2 mb-1"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Providers
              </p>
              {Object.entries(PROVIDER_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded shrink-0"
                    style={{ background: color, boxShadow: `0 0 4px ${color}` }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {type}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CitizensPage() {
  const { data: rawReports = [] } = useGetAllReports();
  const { data: rawTestimonials = [] } = useGetApprovedTestimonials();
  const { data: rawProviders = [] } = useAllProviders();

  const [filters, setFilters] = useState<MapLayerState>({
    reports: true,
    narcan: true,
    clinics: true,
    ers: true,
    sentinel: true,
  });
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [sentinelDismissed, setSentinelDismissed] = useState(false);
  const [drawerState, setDrawerState] = useState<DrawerState>("peek");
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("feed");

  const reports: CitizenReport[] =
    rawReports.length > 0 ? rawReports.slice(0, 40) : SEED_REPORTS;
  const testimonials: Testimonial[] =
    rawTestimonials.length > 0 ? rawTestimonials : SEED_TESTIMONIALS;

  const providers: ProviderData[] = rawProviders
    .filter((p) => p.lat && p.lng)
    .map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      providerType: p.providerType,
      is_live: p.isLive,
      phone: undefined,
    }));

  const reportsWeek = reports.filter((r) => isThisWeek(r.createdAt)).length;
  const narcanLocations = providers.filter(
    (p) =>
      p.providerType === "Narcan Distribution" ||
      p.providerType === "Naloxone Kiosk",
  ).length;

  function toggleFilter(key: keyof MapLayerState) {
    setFilters((f) => ({ ...f, [key]: !f[key] }));
  }

  const filterDefs: { key: keyof MapLayerState; label: string; dot: string }[] =
    [
      { key: "reports", label: "Reports", dot: "34,197,94" },
      { key: "narcan", label: "Narcan", dot: "234,179,8" },
      { key: "clinics", label: "Clinics", dot: "99,102,241" },
      { key: "ers", label: "ERs", dot: "239,68,68" },
      { key: "sentinel", label: "Sentinel", dot: "0,200,150" },
    ];

  return (
    <div
      className="flex flex-col flex-1 min-h-0"
      style={{
        background: "#060d14",
        color: "rgba(255,255,255,0.9)",
      }}
      data-ocid="citizens.page"
    >
      <SEO
        title="Community Reports & Recovery Hub | Live Now Recovery"
        description="View live community reports, find nearby Narcan and harm reduction resources, and share recovery stories. Anonymous, real-time, privacy-first."
        keywords="community recovery reports, Narcan locations map, harm reduction community"
        canonical="/citizens"
      />
      {/* ── Compound risk banner ─────────────────────────────────────── */}
      {!sentinelDismissed && (
        <div
          style={{
            background: "rgba(239,68,68,0.15)",
            borderBottom: "1px solid rgba(239,68,68,0.4)",
            color: "#ef4444",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "13px",
            fontWeight: 600,
            zIndex: 30,
            flexShrink: 0,
          }}
          data-ocid="citizens.compound_risk_banner"
        >
          <span>
            <span
              style={{
                display: "inline-block",
                animation: "pulse 3s ease-in-out infinite",
              }}
            >
              ⚠
            </span>{" "}
            COMPOUND RISK EVENT — Cuyahoga, Franklin, Montgomery Counties
          </span>
          <button
            type="button"
            onClick={() => setSentinelDismissed(true)}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              cursor: "pointer",
              padding: "4px 8px",
              fontSize: "16px",
            }}
            aria-label="Dismiss compound risk banner"
            data-ocid="citizens.compound_risk_dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Map fills remaining height below header ───────────────────── */}
      <div className="relative flex-1 min-h-0" style={{ overflow: "hidden" }}>
        <CitizensMap
          reports={reports}
          providers={providers}
          filters={filters}
          onCountySelect={setSelectedCounty}
        />

        {/* ── Floating top bar ─────────────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex flex-col gap-2 px-4 pt-3 pb-2"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,13,20,0.9) 70%, transparent)",
            backdropFilter: "blur(2px)",
          }}
          data-ocid="citizens.topbar"
        >
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#22c55e" }}
                aria-hidden="true"
              />
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                Community Hub
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  color: "#22c55e",
                  border: "1px solid rgba(34,197,94,0.25)",
                }}
              >
                LIVE
              </span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(94,234,212,0.18)",
                border: "1px solid rgba(94,234,212,0.4)",
                color: TEAL,
                boxShadow: "0 0 12px rgba(94,234,212,0.15)",
              }}
              onClick={() => {
                setDrawerState("expanded");
                setDrawerTab("feed");
              }}
              data-ocid="citizens.report_btn"
              aria-label="Submit a community report"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              Report
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 hide-scrollbar">
            <Filter
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "rgba(255,255,255,0.3)" }}
              aria-hidden="true"
            />
            {filterDefs.map((f) => (
              <FilterPill
                key={f.key}
                label={f.label}
                active={filters[f.key]}
                dot={f.dot}
                onClick={() => toggleFilter(f.key)}
              />
            ))}
          </div>
        </div>

        {/* Demo Data badge — visible in bottom-right of map when Sentinel overlay is on */}
        {SENTINEL_DATA_IS_DEMO && filters.sentinel && (
          <div
            style={{
              position: "absolute",
              bottom: "56px",
              right: "12px",
              zIndex: 25,
              background: "rgba(245,158,11,0.18)",
              border: "1px solid rgba(245,158,11,0.45)",
              borderRadius: "6px",
              padding: "3px 8px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#f59e0b",
              letterSpacing: "0.04em",
              pointerEvents: "none",
            }}
            data-ocid="citizens.sentinel_demo_badge"
            aria-label="Sentinel overlay is using demo data"
          >
            DEMO DATA
          </div>
        )}

        {/* ── Legend ───────────────────────────────────────────────────── */}
        <MapLegend showProviders={providers.length > 0} />

        {/* ── Slide-up bottom drawer ───────────────────────────────────── */}
        <BottomDrawer
          reports={reports}
          testimonials={testimonials}
          reportsWeek={reportsWeek}
          narcanLocations={narcanLocations > 0 ? narcanLocations : 8}
          storiesCount={testimonials.length}
          drawerState={drawerState}
          setDrawerState={setDrawerState}
          drawerTab={drawerTab}
          setDrawerTab={setDrawerTab}
          selectedCounty={selectedCounty}
        />
      </div>
    </div>
  );
}
