import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Play, X } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  badge?: string;
  description?: string;
}

const FEATURED_VIDEO: VideoItem = {
  id: "j_xPEn73Jq4",
  title: "Real Stories of Addiction and Hope",
  duration: "56 min",
  description:
    "Raw, first-person accounts from people who have walked the road of addiction and found their way to recovery. These are the stories that remind us why this work matters.",
};

const PEER_SUPPORT_VIDEOS: VideoItem[] = [
  {
    id: "9_PdIJOVFyI",
    title: "How Opioid Addiction Changed a Mother's Life",
    duration: "15 min",
    description: "Tahira's story of founding a recovery home for women.",
  },
  {
    id: "8CF5rjGQ_Ks",
    title: "Untreated & Unheard: The Addiction Crisis in America",
    duration: "77 min",
    description:
      "Families on the frontline of the opioid crisis, turning toward hope.",
  },
  {
    id: "pAbzLCL6gls",
    title: "Cleveland Recovery Voices: Life After Opioid Addiction",
    duration: "22 min",
    badge: "Ohio Story",
    description:
      "Northeast Ohio community members share their journeys through recovery.",
  },
];

const EDUCATION_VIDEOS: VideoItem[] = [
  {
    id: "YSTxz7RatPo",
    title: "What is Medication-Assisted Treatment (MAT)?",
    duration: "8 min",
    description:
      "An accessible introduction to how MAT works and why it saves lives.",
  },
  {
    id: "gkHU7KhHLI0",
    title: "How Buprenorphine Works: The Science Behind MAT",
    duration: "12 min",
    description:
      "A clear look at the science of buprenorphine-naloxone and why it's effective.",
  },
  {
    id: "DblVjqtABn4",
    title: "Naloxone (Narcan): Recognizing and Reversing an Overdose",
    duration: "7 min",
    description:
      "Every person should know how to use Narcan. This video could save a life.",
  },
];

function VideoThumbnail({
  videoId,
  title,
}: { videoId: string; title: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <img
      src={
        imgError
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
      alt={title}
      className="w-full h-full object-cover"
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
}

function VideoCard({ video, onPlay }: VideoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_oklch(0.62_0.17_155_/_0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(var(--live))]"
      data-ocid="video-card"
      aria-label={`Play ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[oklch(0.1_0_0)]">
        <VideoThumbnail videoId={video.id} title={video.title} />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[oklch(0.62_0.17_155)] shadow-[0_0_24px_oklch(0.62_0.17_155_/_0.6)]">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-medium">
          {video.duration}
        </div>
        {video.badge && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-[oklch(0.62_0.17_155)] text-white border-0 text-xs">
              {video.badge}
            </Badge>
          </div>
        )}
      </div>
      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-[oklch(0.72_0.2_142)] transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {video.description}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center gap-1 text-xs text-[oklch(0.62_0.17_155)] font-medium">
          <Play className="w-3 h-3 fill-current" />
          <span>Watch now</span>
        </div>
      </div>
    </button>
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
      aria-label={video.title}
      data-ocid="video-lightbox"
    >
      <div className="relative w-full max-w-5xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          aria-label="Close video"
          data-ocid="video-lightbox-close"
        >
          <X className="w-5 h-5" />
          <span>Close</span>
        </button>
        {/* Video embed */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-[0_0_80px_black]">
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        </div>
        {/* Caption */}
        <div className="mt-3 text-center">
          <p className="text-white/80 text-sm font-medium">{video.title}</p>
          <p className="text-white/40 text-xs mt-0.5">{video.duration}</p>
        </div>
      </div>
    </dialog>
  );
}

export function VideosPage() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.09 0 0)" }}
    >
      {/* Breadcrumb */}
      <div
        className="border-b border-border/40"
        style={{ backgroundColor: "oklch(0.11 0.005 240)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            to="/"
            className="hover:text-foreground transition-colors"
            data-ocid="breadcrumb-home"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Videos</span>
        </div>
      </div>

      {/* Page Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.13 0.015 240) 0%, oklch(0.09 0 0) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[oklch(0.62_0.17_155_/_0.4)] bg-[oklch(0.62_0.17_155_/_0.08)] mb-5">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.62_0.17_155)] animate-pulse" />
            <span className="text-xs font-semibold text-[oklch(0.72_0.2_142)] tracking-wide uppercase">
              Peer Support & Education
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Stories of Recovery.{" "}
            <span className="text-[oklch(0.72_0.2_142)]">Tools to Heal.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/60 leading-relaxed">
            Real stories and information to help you or someone you care about
            find a path to recovery. Sometimes hearing someone else's story is
            what makes recovery feel possible.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-16">
        {/* Featured Video */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-[oklch(0.72_0.2_142)]" />
            <h2 className="text-xl font-bold text-[oklch(0.72_0.2_142)] uppercase tracking-widest text-sm">
              Featured Documentary
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveVideo(FEATURED_VIDEO)}
            className="group relative w-full rounded-2xl overflow-hidden bg-card border border-border text-left transition-all duration-300 hover:shadow-[0_0_60px_oklch(0.62_0.17_155_/_0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(var(--live))]"
            data-ocid="featured-video"
            aria-label={`Play featured documentary: ${FEATURED_VIDEO.title}`}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-[oklch(0.07_0_0)]">
              <VideoThumbnail
                videoId={FEATURED_VIDEO.id}
                title={FEATURED_VIDEO.title}
              />
              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-white/30 bg-black/40 backdrop-blur-sm group-hover:bg-[oklch(0.62_0.17_155_/_0.8)] group-hover:border-[oklch(0.72_0.2_142)] transition-all duration-300 shadow-[0_0_40px_black]">
                  <Play className="w-9 h-9 text-white fill-white ml-1" />
                </div>
              </div>
              {/* Duration */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded bg-black/70 text-white text-sm font-medium backdrop-blur-sm">
                {FEATURED_VIDEO.duration}
              </div>
            </div>
            {/* Caption bar */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[oklch(0.72_0.2_142)] transition-colors">
                  {FEATURED_VIDEO.title}
                </h3>
                <p className="text-sm text-white/50 mt-1">
                  {FEATURED_VIDEO.description}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-[oklch(0.62_0.17_155)] font-semibold text-sm">
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Documentary</span>
              </div>
            </div>
          </button>
        </section>

        {/* Peer Support Stories */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full bg-[oklch(0.72_0.2_142)]" />
            <h2 className="text-xl font-bold text-[oklch(0.72_0.2_142)] uppercase tracking-widest text-sm">
              Peer Support Stories
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6 ml-4">
            Real voices from people who have lived it — and found their way
            through.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PEER_SUPPORT_VIDEOS.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
            ))}
          </div>
        </section>

        {/* MAT Education */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full bg-[oklch(0.62_0.12_218)]" />
            <h2 className="text-xl font-bold text-[oklch(0.62_0.12_218)] uppercase tracking-widest text-sm">
              Understanding MAT &amp; Treatment
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6 ml-4">
            Evidence-based information about Medication-Assisted Treatment,
            naloxone, and the recovery process.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {EDUCATION_VIDEOS.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="rounded-2xl border border-[oklch(0.62_0.17_155_/_0.3)] bg-[oklch(0.12_0.01_240)] p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to find a provider near you?
          </h3>
          <p className="text-white/50 text-sm mb-5">
            Every MAT clinic on our platform is real-time verified and
            privacy-first.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[oklch(0.62_0.17_155)] hover:bg-[oklch(0.68_0.18_155)] text-white font-semibold text-sm transition-colors"
            data-ocid="videos-cta-find-provider"
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
