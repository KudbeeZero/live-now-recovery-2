import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Heart, Play, Shield, X } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { SEO } from "../components/SEO";

interface VideoItem {
  id: string;
  title: string;
  source: string;
  description: string;
  category: "recovery" | "mat" | "harm-reduction" | "family";
  badge?: string;
}

const CATEGORY_CONFIG = {
  recovery: {
    label: "Recovery Stories",
    color: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
    dot: "bg-emerald-500",
    heading: "text-emerald-400",
    bar: "bg-emerald-500",
    icon: Heart,
  },
  mat: {
    label: "Understanding MAT",
    color: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    dot: "bg-blue-500",
    heading: "text-blue-400",
    bar: "bg-blue-500",
    icon: BookOpen,
  },
  "harm-reduction": {
    label: "Harm Reduction",
    color: "bg-amber-600/20 text-amber-400 border-amber-600/30",
    dot: "bg-amber-500",
    heading: "text-amber-400",
    bar: "bg-amber-500",
    icon: Shield,
  },
  family: {
    label: "Family & Community",
    color: "bg-purple-600/20 text-purple-400 border-purple-600/30",
    dot: "bg-purple-500",
    heading: "text-purple-400",
    bar: "bg-purple-500",
    icon: Heart,
  },
} as const;

const FEATURED_VIDEO: VideoItem = {
  id: "8qQw2yy9p20",
  title: "A Woman's 17-Year Journey from Addiction to Recovery",
  source: "PBS Independent Lens",
  description:
    "An intimate documentary following one woman's 17-year journey through addiction and into lasting recovery — a reminder that recovery is always possible.",
  category: "recovery",
};

const RECOVERY_STORIES: VideoItem[] = [
  {
    id: "8qQw2yy9p20",
    title: "A Woman's 17-Year Journey from Addiction to Recovery",
    source: "PBS Independent Lens",
    description:
      "An intimate documentary following one woman's 17-year journey through addiction and into lasting recovery, produced by PBS Independent Lens.",
    category: "recovery",
    badge: "Featured",
  },
  {
    id: "fHk32gVWwis",
    title: "Recovery Story Highlights the Power of Treatment",
    source: "9NEWS",
    description:
      "A firsthand account of how medication-assisted treatment transformed one person's path to recovery, featured on 9NEWS.",
    category: "recovery",
  },
  {
    id: "hcUf9jrgjek",
    title: "Recovery Journey: Finding Help in Ohio",
    source: "Community Partners",
    description:
      "A powerful personal account of navigating Ohio's recovery system, finding MAT treatment, and rebuilding a life in recovery.",
    category: "recovery",
  },
];

const MAT_VIDEOS: VideoItem[] = [
  {
    id: "kyUF7T-qhMA",
    title: "Understanding Medication-Assisted Treatment",
    source: "Recovery Resources",
    description:
      "A comprehensive overview of how MAT works, why it is the gold standard for opioid use disorder treatment, and what to expect when starting treatment.",
    category: "mat",
  },
  {
    id: "mwHIVZvUTCA",
    title: "The Science of Addiction and Recovery",
    source: "Dr. Russell Surasky",
    description:
      "Dr. Russell Surasky explains the neuroscience of addiction — why it's a brain disease, not a moral failing, and how MAT works at the cellular level.",
    category: "mat",
  },
  {
    id: "J7yn4tJEmJU",
    title: "Tools for Overcoming Substance & Behavioral Addictions",
    source: "Huberman Lab",
    description:
      "A deep dive into evidence-based tools for overcoming addiction, featuring neuroscience research and clinical recovery frameworks.",
    category: "mat",
  },
  {
    id: "ZTxpIBk2F4c",
    title: "Dopamine and Addiction: Navigating Pleasure, Pain, and Recovery",
    source: "Medical Education",
    description:
      "How dopamine drives addictive behavior and the neurological path from dependency to sustainable recovery.",
    category: "mat",
  },
];

const HARM_REDUCTION_VIDEOS: VideoItem[] = [
  {
    id: "bUtYpbdUSus",
    title: "How to Use Narcan with the DOPE Project",
    source: "National Harm Reduction Coalition",
    description:
      "Step-by-step Narcan/naloxone training from the National Harm Reduction Coalition's Drug Overdose Prevention and Education Project.",
    category: "harm-reduction",
    badge: "Essential",
  },
  {
    id: "8eUUf5ssH_4",
    title: "How to Reverse Opioid Overdose: Naloxone and Rescue Breathing",
    source: "Johns Hopkins Bloomberg School of Public Health",
    description:
      "Johns Hopkins Bloomberg School of Public Health demonstrates naloxone administration and rescue breathing to reverse opioid overdose.",
    category: "harm-reduction",
  },
  {
    id: "Clg7jU15VZc",
    title: "How to Use a Fentanyl Test Strip",
    source: "Grayken Center for Addiction",
    description:
      "A clear demonstration of how to use fentanyl test strips to detect fentanyl in a substance before use — a critical harm reduction tool.",
    category: "harm-reduction",
  },
];

const FAMILY_VIDEOS: VideoItem[] = [
  {
    id: "ZTxpIBk2F4c",
    title: "Understanding Addiction Science to Support Your Loved One",
    source: "Medical Education",
    description:
      "Understanding the science behind addiction helps families and communities support their loved ones with compassion and evidence-based approaches.",
    category: "family",
  },
  {
    id: "J7yn4tJEmJU",
    title: "Recovery Tools for Families and Community Members",
    source: "Huberman Lab",
    description:
      "Evidence-based tools families can use to support someone in recovery — covering communication, boundaries, and the role of community in long-term sobriety.",
    category: "family",
  },
];

const ALL_VIDEOS_FOR_SCHEMA = [
  FEATURED_VIDEO,
  ...RECOVERY_STORIES,
  ...MAT_VIDEOS,
  ...HARM_REDUCTION_VIDEOS,
  ...FAMILY_VIDEOS,
];

function VideoThumbnail({
  videoId,
  title,
}: { videoId: string; title: string }) {
  const [imgSrc, setImgSrc] = useState(
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  );
  return (
    <img
      src={imgSrc}
      alt={title}
      className="w-full h-full object-cover"
      onError={() =>
        setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
      }
      loading="lazy"
    />
  );
}

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
}

function VideoCard({ video, onPlay }: VideoCardProps) {
  const cat = CATEGORY_CONFIG[video.category];
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_oklch(0.62_0.17_155_/_0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      data-ocid="videos.video_card"
      aria-label={`Play: ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <VideoThumbnail videoId={video.id} title={video.title} />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-[0_0_24px_oklch(0.62_0.17_155_/_0.6)]">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${cat.color}`}
          >
            {video.badge ?? cat.label}
          </span>
        </div>
      </div>
      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {video.description}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">{video.source}</p>
        <div className="mt-auto pt-2 flex items-center gap-1 text-xs text-primary font-medium">
          <Play className="w-3 h-3 fill-current" />
          <span>Watch Now</span>
        </div>
      </div>
    </button>
  );
}

interface SectionProps {
  category: keyof typeof CATEGORY_CONFIG;
  videos: VideoItem[];
  subtitle: string;
  onPlay: (video: VideoItem) => void;
}

function VideoSection({ category, videos, subtitle, onPlay }: SectionProps) {
  const cat = CATEGORY_CONFIG[category];
  const Icon = cat.icon;
  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-1 h-6 rounded-full ${cat.bar}`} />
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${cat.heading}`} />
          <h2
            className={`text-sm font-bold uppercase tracking-widest ${cat.heading}`}
          >
            {cat.label}
          </h2>
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-6 ml-4">{subtitle}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((video) => (
          <VideoCard
            key={`${video.category}-${video.id}`}
            video={video}
            onPlay={onPlay}
          />
        ))}
      </div>
    </section>
  );
}

interface LightboxProps {
  video: VideoItem | null;
  onClose: () => void;
}

function Lightbox({ video, onClose }: LightboxProps) {
  const overlayRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!video) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  if (!video) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <dialog
      ref={overlayRef as RefObject<HTMLDialogElement>}
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm m-0 max-w-none w-full h-full border-0"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      data-ocid="videos.lightbox"
      aria-label={video.title}
    >
      <div className="relative w-full max-w-5xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          aria-label="Close video"
          data-ocid="videos.close_button"
        >
          <X className="w-5 h-5" />
          <span>Close</span>
        </button>
        {/* Embed */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-[0_0_80px_black]">
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 w-full h-full"
          />
        </div>
        {/* Caption */}
        <div className="mt-3 text-center">
          <p className="text-white/80 text-sm font-medium">{video.title}</p>
          <p className="text-white/40 text-xs mt-0.5">{video.source}</p>
        </div>
      </div>
    </dialog>
  );
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Learning Media Center | Live Now Recovery",
    description:
      "Evidence-based education for recovery, MAT, and harm reduction — because knowledge saves lives.",
    url: "https://livenowrecovery.org/videos",
    publisher: {
      "@type": "Organization",
      name: "Live Now Recovery",
      url: "https://livenowrecovery.org",
    },
    hasPart: ALL_VIDEOS_FOR_SCHEMA.map((v) => ({
      "@type": "VideoObject",
      name: v.title,
      description: v.description,
      thumbnailUrl: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
      uploadDate: "2024-01-01",
      publisher: { "@type": "Organization", name: v.source },
    })),
  },
];

export function VideosPage() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <div className="min-h-screen bg-[oklch(0.09_0_0)]">
      <SEO
        title="Learning Media Center | Live Now Recovery"
        description="Evidence-based recovery education — watch peer support documentaries, MAT science, harm reduction training, and family resources. Knowledge saves lives."
        keywords="MAT education videos, Narcan training, opioid recovery documentary, harm reduction Ohio, addiction science"
        canonical="/videos"
        jsonLd={jsonLd}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border/40 bg-[oklch(0.11_0.005_240)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            to="/"
            className="hover:text-foreground transition-colors"
            data-ocid="videos.breadcrumb_home"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">
            Learning Media Center
          </span>
        </div>
      </div>

      {/* Hero — IMAX cinema style */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.10 0.025 230) 0%, oklch(0.08 0.01 240) 60%, oklch(0.09 0 0) 100%)",
        }}
      >
        {/* Radial glow accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 30%, oklch(0.62 0.15 218 / 0.12) 0%, transparent 65%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">
              Evidence-Based Education
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Learning Media Center
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/60 leading-relaxed mb-3">
            Evidence-based education for recovery, MAT, and harm reduction —
            because{" "}
            <strong className="text-white/80">knowledge saves lives</strong>.
            Real stories, real science, real tools.
          </p>
          <p className="text-xs text-white/30 mb-8">
            All videos use privacy-enhanced YouTube embeds. No tracking cookies.
          </p>
          {/* Section quick-nav */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(
              [
                ["recovery", "Recovery Stories"],
                ["mat", "Understanding MAT"],
                ["harm-reduction", "Harm Reduction"],
                ["family", "Family Resources"],
              ] as const
            ).map(([key, label]) => (
              <a
                key={key}
                href={`#${key}`}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${CATEGORY_CONFIG[key].color}`}
                data-ocid={`videos.nav_${key}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-16">
        {/* Featured Film — always visible embed */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest">
              Featured Documentary
            </h2>
          </div>
          <div className="w-full rounded-2xl overflow-hidden border border-border shadow-[0_0_60px_oklch(0.62_0.17_155_/_0.2)]">
            {/* Letterbox embed — always playing inline */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${FEATURED_VIDEO.id}?rel=0&modestbranding=1`}
                title={FEATURED_VIDEO.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="p-5 bg-card flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {FEATURED_VIDEO.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {FEATURED_VIDEO.description}
                </p>
              </div>
              <Badge className="shrink-0 bg-primary/20 text-primary border-primary/40">
                PBS Independent Lens
              </Badge>
            </div>
          </div>
        </section>

        {/* Recovery Stories */}
        <section id="recovery">
          <VideoSection
            category="recovery"
            videos={RECOVERY_STORIES}
            subtitle="Real voices from people who have lived it — and found their way through."
            onPlay={setActiveVideo}
          />
        </section>

        {/* MAT */}
        <section id="mat">
          <VideoSection
            category="mat"
            videos={MAT_VIDEOS}
            subtitle="Evidence-based information about Medication-Assisted Treatment, the neuroscience of addiction, and the clinical tools that work."
            onPlay={setActiveVideo}
          />
        </section>

        {/* Harm Reduction */}
        <section id="harm-reduction">
          <VideoSection
            category="harm-reduction"
            videos={HARM_REDUCTION_VIDEOS}
            subtitle="Life-saving skills anyone can learn — Narcan administration, fentanyl test strip use, and overdose reversal."
            onPlay={setActiveVideo}
          />
        </section>

        {/* Family & Community */}
        <section id="family">
          <VideoSection
            category="family"
            videos={FAMILY_VIDEOS}
            subtitle="Resources for families and communities — how to understand addiction science and support your loved one with compassion."
            onPlay={setActiveVideo}
          />
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-primary/30 bg-[oklch(0.12_0.01_240)] p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to find a provider near you?
          </h3>
          <p className="text-white/50 text-sm mb-5">
            Every MAT clinic on our platform is real-time verified and
            privacy-first.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-colors"
            data-ocid="videos.find_provider_link"
          >
            Find a Provider
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </div>

      {/* Lightbox */}
      <Lightbox video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}
