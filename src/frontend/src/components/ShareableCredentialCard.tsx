import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Link, Share2, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatEarnedAt,
  getCredentialDescription,
  getCredentialDisplayName,
  getTierLabel,
  shortenPrincipal,
} from "../lib/credentials";
import type { Credential } from "../types/credentials";
import { getBadgeSvg } from "./badge-svgs";

const QR_BASE = "https://api.qrserver.com/v1/create-qr-code";

interface Props {
  credential: Credential | null;
  onClose: () => void;
}

// Tier-specific raw hex/color values for canvas (can't use Tailwind classes on canvas)
const TIER_PALETTE: Record<
  string,
  {
    bg: [number, number, number];
    accent: [number, number, number];
    label: string;
  }
> = {
  Community: { bg: [22, 40, 28], accent: [52, 211, 153], label: "Community" },
  PeerSupport: {
    bg: [20, 30, 50],
    accent: [96, 165, 250],
    label: "Peer Support",
  },
  Clinical: { bg: [40, 30, 10], accent: [251, 191, 36], label: "Clinical" },
  Leadership: {
    bg: [30, 20, 45],
    accent: [167, 139, 250],
    label: "Leadership",
  },
};

function getTierPalette(tier: string) {
  return (
    TIER_PALETTE[tier] ?? {
      bg: [20, 22, 30],
      accent: [100, 200, 210],
      label: tier,
    }
  );
}

function rgba(rgb: [number, number, number], a = 1) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

// Draw a rounded rect path helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function ShareableCredentialCard({ credential, onClose }: Props) {
  const isOpen = !!credential;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const displayName = credential
    ? getCredentialDisplayName(credential.credentialType)
    : "";
  const tierLabel = credential ? getTierLabel(credential.tier) : "";
  const description = credential
    ? getCredentialDescription(credential.credentialType)
    : "";
  const earnedDate = credential ? formatEarnedAt(credential.earnedAt) : "";
  const ownerStr = credential ? shortenPrincipal(credential.owner) : "";
  const svgStr = credential
    ? (credential.badgeSvg ?? getBadgeSvg(credential.credentialType))
    : "";
  const credId = credential ? Number(credential.id) : 0;
  const impactScore = credential ? Number(credential.impactScore) : 0;
  const palette = credential
    ? getTierPalette(credential.tier)
    : TIER_PALETTE.Community;

  const qrUrl = `${QR_BASE}/?size=160x160&data=${encodeURIComponent(
    `https://livenowrecovery.org/leaderboard?credential=${credId}`,
  )}&color=${palette.accent.map((v) => v.toString(16).padStart(2, "0")).join("")}&bgcolor=${palette.bg.map((v) => v.toString(16).padStart(2, "0")).join("")}&format=svg`;

  // Regenerate card whenever the credential changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: regenerate on identity change
  useEffect(() => {
    if (!credential || !canvasRef.current) return;
    setPreviewUrl(null);
    setGenerating(true);

    const canvas = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 640;
    const H = 360;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const { bg, accent } = palette;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, rgba(bg));
    bgGrad.addColorStop(1, rgba([bg[0] + 12, bg[1] + 10, bg[2] + 18]));
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, W, H, 20);
    ctx.fill();

    // Soft glow orb (top-right)
    const orb = ctx.createRadialGradient(
      W * 0.78,
      H * 0.28,
      0,
      W * 0.78,
      H * 0.28,
      170,
    );
    orb.addColorStop(0, rgba(accent, 0.18));
    orb.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, W, H);

    // Border glow
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.lineWidth = 2;
    roundRect(ctx, 1, 1, W - 2, H - 2, 20);
    ctx.stroke();

    // Tier pill
    const pillText = `${palette.label.toUpperCase()} TIER`;
    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    const pillW = ctx.measureText(pillText).width + 24;
    const pillH = 22;
    ctx.fillStyle = rgba(accent, 0.2);
    roundRect(ctx, 28, 22, pillW, pillH, 11);
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.lineWidth = 1;
    roundRect(ctx, 28, 22, pillW, pillH, 11);
    ctx.stroke();
    ctx.fillStyle = rgba(accent);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pillText, 28 + pillW / 2, 22 + pillH / 2);

    // Credential name
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = rgba(accent);
    ctx.font = "bold 30px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(displayName, 28, 90);

    // Short description
    const shortDesc =
      description.length > 68
        ? `${description.slice(0, 65)}\u2026`
        : description;
    ctx.fillStyle = "rgba(210,215,230,0.82)";
    ctx.font = "13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(shortDesc, 28, 115);

    // Impact score
    ctx.fillStyle = "rgba(180,185,200,0.7)";
    ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`Impact Score: +${impactScore}`, 28, 145);

    // Earned date
    ctx.fillText(`Earned: ${earnedDate}`, 28, 165);

    // Owner principal
    ctx.fillStyle = rgba(accent, 0.8);
    ctx.font = "11px monospace";
    ctx.fillText(ownerStr, 28, 185);

    // Divider
    ctx.strokeStyle = rgba(accent, 0.18);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(28, 200);
    ctx.lineTo(W - 200, 200);
    ctx.stroke();

    // Footer verification text
    ctx.fillStyle = "rgba(180,185,200,0.55)";
    ctx.font = "italic 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(
      "Soul-bound on Internet Computer \u00b7 Verified by Live Now Recovery",
      28,
      218,
    );

    // Bottom brand
    ctx.fillStyle = rgba(accent, 0.4);
    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("livenowrecovery.org", 28, H - 18);

    // Badge SVG (right column)
    const svgBlob = new Blob(
      [
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>${svgStr}</svg>`,
      ],
      { type: "image/svg+xml" },
    );
    const svgObjUrl = URL.createObjectURL(svgBlob);
    const badgeImg = new Image();
    badgeImg.onload = () => {
      const bx = W - 210;
      const by = 52;
      const br = 60;
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx + br, by + br, br, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accent, 0.15);
      ctx.fill();
      ctx.strokeStyle = rgba(accent, 0.45);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(badgeImg, bx, by, br * 2, br * 2);
      ctx.restore();
      URL.revokeObjectURL(svgObjUrl);

      // QR code (bottom-right)
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.onload = () => {
        const qSize = 88;
        const qx = W - qSize - 24;
        const qy = H - qSize - 28;
        ctx.save();
        roundRect(ctx, qx - 6, qy - 6, qSize + 12, qSize + 12, 8);
        ctx.fillStyle = rgba(accent, 0.08);
        ctx.fill();
        ctx.strokeStyle = rgba(accent, 0.3);
        ctx.lineWidth = 1;
        roundRect(ctx, qx - 6, qy - 6, qSize + 12, qSize + 12, 8);
        ctx.stroke();
        ctx.drawImage(qrImg, qx, qy, qSize, qSize);
        ctx.restore();
        ctx.fillStyle = "rgba(180,185,200,0.5)";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Scan to verify", qx + qSize / 2, qy + qSize + 13);
        setPreviewUrl(canvas.toDataURL("image/png"));
        setGenerating(false);
      };
      qrImg.onerror = () => {
        // QR unavailable — finish without it
        setPreviewUrl(canvas.toDataURL("image/png"));
        setGenerating(false);
      };
      qrImg.src = qrUrl;
    };
    badgeImg.onerror = () => {
      URL.revokeObjectURL(svgObjUrl);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setGenerating(false);
    };
    badgeImg.src = svgObjUrl;
  }, [credential]);

  function handleDownload() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `LiveNowRecovery-${displayName.replace(/\s+/g, "-")}-Card.png`;
    a.click();
  }

  function handleCopyLink() {
    const owner = credential?.owner ? credential.owner.toText() : "";
    const url = owner
      ? `https://livenowrecovery.org/leaderboard?principal=${encodeURIComponent(owner)}`
      : `${window.location.origin}/leaderboard`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShareOnX() {
    const text = encodeURIComponent(
      `I just earned the \"${displayName}\" credential on @LiveNowRecovery \u2014 a verified ${tierLabel} badge permanently recorded on the Internet Computer. Join the movement. #RecoveryIsPossible #LiveNowRecovery https://livenowrecovery.org`,
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="shareable_card.dialog"
        className="max-w-lg w-full bg-card border-border p-0 overflow-hidden"
      >
        <button
          type="button"
          data-ocid="shareable_card.close_button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close shareable card"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Generate Visual Credential Card
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Download a beautiful PNG card and share it on X to prove your
            soul-bound contribution.
          </p>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="relative w-full rounded-xl overflow-hidden border border-border/40">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              aria-label={`${displayName} credential card preview`}
            />
            {generating && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  <p className="text-xs text-muted-foreground">
                    Generating card\u2026
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-6 pb-6">
          <Button
            type="button"
            data-ocid="shareable_card.download_button"
            disabled={!previewUrl}
            onClick={handleDownload}
            className="w-full gap-2 font-semibold"
          >
            <Download className="h-4 w-4" />
            Download PNG Card
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              data-ocid="shareable_card.share_x_button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleShareOnX}
            >
              <Share2 className="h-4 w-4" />
              Post to X
            </Button>
            <Button
              type="button"
              data-ocid="shareable_card.copy_link_button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopyLink}
              aria-label="Copy credential link to clipboard"
            >
              <Link className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-1">
            Soul-bound on the Internet Computer \u00b7 non-transferable \u00b7
            verifiable by anyone
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
