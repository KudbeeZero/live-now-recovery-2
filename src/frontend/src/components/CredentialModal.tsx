import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import {
  formatEarnedAt,
  getCredentialDescription,
  getCredentialDisplayName,
  getShareUrl,
  getTierBgColor,
  getTierColor,
  getTierLabel,
  shortenPrincipal,
} from "../lib/credentials";
import type { Credential } from "../types/credentials";
import { ShareableCredentialCard } from "./ShareableCredentialCard";
import { getBadgeSvg } from "./badge-svgs";

interface CredentialModalProps {
  credential: Credential | null;
  onClose: () => void;
}

export function CredentialModal({ credential, onClose }: CredentialModalProps) {
  const [showShareCard, setShowShareCard] = useState(false);
  const isOpen = !!credential;

  const svgStr = credential
    ? (credential.badgeSvg ?? getBadgeSvg(credential.credentialType))
    : "";
  const tierColor = credential ? getTierColor(credential.tier) : "";
  const tierBg = credential ? getTierBgColor(credential.tier) : "";
  const tierLabel = credential ? getTierLabel(credential.tier) : "";
  const displayName = credential
    ? getCredentialDisplayName(credential.credentialType)
    : "";
  const description = credential
    ? getCredentialDescription(credential.credentialType)
    : "";
  const earnedDate = credential ? formatEarnedAt(credential.earnedAt) : "";
  const shareUrl = credential ? getShareUrl(credential) : "#";
  const ownerStr = credential ? shortenPrincipal(credential.owner) : "";
  const credId = credential ? Number(credential.id) : 0;
  const impactScore = credential ? Number(credential.impactScore) : 0;
  const metadata = credential?.metadata ?? null;

  function handleDownloadCert() {
    if (!credential) return;
    const text = [
      "LIVE NOW RECOVERY — SOUL-BOUND CREDENTIAL CERTIFICATE",
      "═══════════════════════════════════════════════════════",
      "",
      `Credential: ${displayName}`,
      `Tier: ${tierLabel}`,
      `Earned: ${earnedDate}`,
      `Owner: ${credential.owner.toString()}`,
      `Credential ID: ${credId}`,
      `Impact Score: ${impactScore}`,
      "",
      description,
      "",
      "This credential is permanently recorded on the Internet Computer blockchain.",
      "It is soul-bound — non-transferable, non-deletable, and verifiable by anyone.",
      "",
      "livenowrecovery.org",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LiveNowRecovery-${displayName.replace(/\s+/g, "-")}-Certificate.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          data-ocid="credential_modal.dialog"
          className="max-w-md w-full bg-card border-border"
        >
          <button
            type="button"
            data-ocid="credential_modal.close_button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <DialogHeader>
            <DialogTitle className="sr-only">
              {displayName} Credential
            </DialogTitle>
          </DialogHeader>

          {/* Badge hero */}
          <div
            className={`flex flex-col items-center gap-4 pt-2 pb-4 rounded-xl ${tierBg}`}
          >
            <div
              className={`h-20 w-20 rounded-full flex items-center justify-center ${tierColor}`}
              style={{ padding: "16px" }}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled SVG strings
              dangerouslySetInnerHTML={{ __html: svgStr }}
              aria-hidden="true"
            />
            <div className="text-center">
              <h2 className={`text-xl font-bold ${tierColor}`}>
                {displayName}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {tierLabel} Credential · Earned {earnedDate}
              </p>
            </div>
            <div
              className={`text-xs font-semibold px-3 py-1 rounded-full ${tierBg} ${tierColor}`}
            >
              Impact Score: +{impactScore}
            </div>
          </div>

          <Separator className="my-1" />

          <p className="text-sm text-foreground/90 leading-relaxed">
            {description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Owner</span>
              <span className="font-mono">{ownerStr}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Credential ID</span>
              <span className="font-mono">#{credId}</span>
            </div>
            {metadata && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Metadata</span>
                <span className="font-mono truncate max-w-[60%]">
                  {metadata}
                </span>
              </div>
            )}
          </div>

          <Separator className="my-1" />

          <div className="flex flex-col gap-2">
            {/* Primary CTA: Generate & Share Visual Card */}
            <Button
              type="button"
              data-ocid="credential_modal.generate_card_button"
              className={`w-full gap-2 font-semibold ${tierBg} ${tierColor} border hover:brightness-110 transition-all`}
              onClick={() => setShowShareCard(true)}
            >
              <Sparkles className="h-4 w-4" />
              Generate &amp; Share Visual Card
            </Button>

            <Button
              type="button"
              data-ocid="credential_modal.share_button"
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() =>
                window.open(shareUrl, "_blank", "noopener,noreferrer")
              }
            >
              <Share2 className="h-4 w-4" />
              Share on X (Twitter)
            </Button>

            <Button
              type="button"
              data-ocid="credential_modal.download_button"
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleDownloadCert}
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This credential is permanently recorded on the Internet Computer
              blockchain — verifiable by anyone, transferable by no one.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ShareableCredentialCard renders as its own overlay on top of the modal */}
      <ShareableCredentialCard
        credential={showShareCard ? credential : null}
        onClose={() => setShowShareCard(false)}
      />
    </>
  );
}
