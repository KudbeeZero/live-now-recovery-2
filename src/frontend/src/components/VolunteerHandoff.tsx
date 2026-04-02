import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, QrCode, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useGenerateHandoffToken } from "../hooks/useQueries";

const TOKEN_DURATION_SECS = 300; // 5 minutes

function useCountdown(expiresAt: number | null) {
  const [remaining, setRemaining] = useState<number>(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () =>
      setRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function QRImage({ value, size = 256 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000`;
  return (
    <img
      src={url}
      alt="QR Code"
      width={size}
      height={size}
      style={{ borderRadius: 12 }}
    />
  );
}

export function VolunteerHandoff({ prefillZip }: { prefillZip?: string }) {
  const [zip, setZip] = useState(prefillZip ?? "");
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const remaining = useCountdown(expiresAt);
  const generateToken = useGenerateHandoffToken();

  const isExpired = expiresAt !== null && remaining === 0;
  const isActive = !!token && !isExpired;

  const generate = async () => {
    if (!/^\d{5}$/.test(zip)) return;
    try {
      const t = await generateToken.mutateAsync(zip);
      setToken(t);
      setExpiresAt(Date.now() + TOKEN_DURATION_SECS * 1000);
    } catch {
      setToken(`offline-${zip}-${Date.now()}`);
      setExpiresAt(Date.now() + TOKEN_DURATION_SECS * 1000);
    }
  };

  return (
    <div className="glass-pod p-6" data-ocid="handoff.panel">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(39,174,96,0.12)" }}
        >
          <QrCode className="w-5 h-5" style={{ color: "#27ae60" }} />
        </div>
        <div>
          <h3
            className="font-bold text-base"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Generate Handoff Token
          </h3>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Proof of Presence — 5-minute window
          </p>
        </div>
      </div>

      {!isActive ? (
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="zip-input"
              className="text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              NE Ohio ZIP Code
            </Label>
            <Input
              id="zip-input"
              value={zip}
              onChange={(e) =>
                setZip(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="44102"
              maxLength={5}
              pattern="[0-9]{5}"
              className="mt-1 min-h-[44px] font-mono text-lg tracking-widest"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.9)",
              }}
              data-ocid="handoff.input"
            />
          </div>
          <Button
            onClick={generate}
            disabled={zip.length !== 5 || generateToken.isPending}
            className="w-full min-h-[44px] btn-glass-primary"
            style={{}}
            data-ocid="handoff.primary_button"
          >
            {generateToken.isPending ? "Generating…" : "Generate QR Token"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div
            className="p-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(39,174,96,0.3)",
            }}
          >
            <QRImage value={token} size={256} />
          </div>
          <div
            className="flex items-center gap-2 font-bold text-lg"
            style={{ color: "#27ae60" }}
          >
            <Clock className="w-5 h-5" />
            {fmt(remaining)}
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            ZIP: {zip} — One-time use
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setToken("");
              setExpiresAt(null);
            }}
            className="min-h-[44px]"
            style={{
              borderColor: "rgba(39,174,96,0.4)",
              color: "#27ae60",
              background: "transparent",
            }}
            data-ocid="handoff.secondary_button"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Generate New Token
          </Button>
        </div>
      )}

      {isExpired && (
        <div
          className="mt-4 p-3 rounded-xl text-center"
          style={{
            background: "rgba(242,153,74,0.10)",
            border: "1px solid rgba(242,153,74,0.25)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "#f2994a" }}>
            Token Expired — Generate a new one above
          </p>
        </div>
      )}
    </div>
  );
}
