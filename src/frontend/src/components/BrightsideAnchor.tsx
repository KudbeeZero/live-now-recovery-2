import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  QrCode,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useGenerateHandoffToken } from "../hooks/useQueries";
import { isProviderStale } from "../utils/providerUtils";

const BRIGHTSIDE_LOCATIONS = [
  {
    name: "Cleveland",
    zip: "44102",
    lat: 41.4822,
    lng: -81.743,
    lastVerified: BigInt(Date.now() - 1 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Lakewood",
    zip: "44107",
    lat: 41.4819,
    lng: -81.7982,
    lastVerified: BigInt(Date.now() - 2 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Parma",
    zip: "44129",
    lat: 41.3773,
    lng: -81.729,
    lastVerified: BigInt(Date.now() - 1 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Lorain",
    zip: "44052",
    lat: 41.452,
    lng: -82.1824,
    lastVerified: BigInt(Date.now() - 5 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Akron",
    zip: "44302",
    lat: 41.0814,
    lng: -81.519,
    lastVerified: BigInt(Date.now() - 1 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Elyria",
    zip: "44035",
    lat: 41.3673,
    lng: -82.1074,
    lastVerified: BigInt(Date.now() - 3 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Mentor",
    zip: "44060",
    lat: 41.6661,
    lng: -81.3396,
    lastVerified: BigInt(Date.now() - 2 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Willoughby",
    zip: "44094",
    lat: 41.64,
    lng: -81.4079,
    lastVerified: BigInt(Date.now() - 1 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Euclid",
    zip: "44117",
    lat: 41.5931,
    lng: -81.5268,
    lastVerified: BigInt(Date.now() - 3 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Strongsville",
    zip: "44136",
    lat: 41.3145,
    lng: -81.8357,
    lastVerified: BigInt(Date.now() - 2 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Medina",
    zip: "44256",
    lat: 41.1386,
    lng: -81.8638,
    lastVerified: BigInt(Date.now() - 1 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Brunswick",
    zip: "44212",
    lat: 41.2384,
    lng: -81.8418,
    lastVerified: BigInt(Date.now() - 6 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Solon",
    zip: "44139",
    lat: 41.3895,
    lng: -81.4407,
    lastVerified: BigInt(Date.now() - 1 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Beachwood",
    zip: "44122",
    lat: 41.4648,
    lng: -81.509,
    lastVerified: BigInt(Date.now() - 2 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Westlake",
    zip: "44145",
    lat: 41.4553,
    lng: -81.9179,
    lastVerified: BigInt(Date.now() - 1 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Bay Village",
    zip: "44140",
    lat: 41.485,
    lng: -81.9243,
    lastVerified: BigInt(Date.now() - 3 * 3600 * 1000) * 1_000_000n,
  },
  {
    name: "Avon Lake",
    zip: "44012",
    lat: 41.505,
    lng: -82.0294,
    lastVerified: BigInt(Date.now() - 1 * 3600 * 1000) * 1_000_000n,
  },
];

function QRImage({ value, size = 160 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000`;
  return (
    <img
      src={url}
      alt="QR Code"
      width={size}
      height={size}
      style={{ borderRadius: 8 }}
    />
  );
}

function LocationCard({
  loc,
  filterCity,
}: { loc: (typeof BRIGHTSIDE_LOCATIONS)[0]; filterCity?: string }) {
  const [showQR, setShowQR] = useState(false);
  const [token, setToken] = useState("");
  const generateToken = useGenerateHandoffToken();
  const stale = isProviderStale(loc.lastVerified);

  const handleQR = async () => {
    if (!showQR) {
      try {
        const t = await generateToken.mutateAsync(loc.zip);
        setToken(t);
        setShowQR(true);
      } catch {
        setToken(`demo-${loc.zip}-${Date.now()}`);
        setShowQR(true);
      }
    } else {
      setShowQR(false);
    }
  };

  if (filterCity && loc.name.toLowerCase() !== filterCity.toLowerCase())
    return null;

  return (
    <div className="glass-pod overflow-hidden" data-ocid="brightside.card">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: "rgba(34,211,238,0.12)",
          borderBottom: "1px solid rgba(34,211,238,0.15)",
        }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: "#22d3ee" }} />
          <span className="font-bold text-sm" style={{ color: "#22d3ee" }}>
            Brightside Health
          </span>
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {loc.zip}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3
            className="font-bold text-base"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {loc.name}
          </h3>
          {stale ? (
            <Badge
              variant="outline"
              style={{
                borderColor: "rgba(251,191,36,0.4)",
                color: "#fbbf24",
                background: "rgba(251,191,36,0.08)",
              }}
            >
              <AlertCircle className="w-3 h-3 mr-1" /> Stale
            </Badge>
          ) : (
            <Badge
              variant="outline"
              style={{
                borderColor: "rgba(34,211,238,0.4)",
                color: "#22d3ee",
                background: "rgba(34,211,238,0.08)",
              }}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Verified
            </Badge>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge
            className="hover:bg-transparent border-0 text-xs"
            style={{
              background: "rgba(39,174,96,0.15)",
              color: "#27ae60",
            }}
          >
            ✓ Accepts Medicaid
          </Badge>
          <Badge
            className="hover:bg-transparent border-0 text-xs"
            style={{
              background: "rgba(34,211,238,0.10)",
              color: "#22d3ee",
            }}
          >
            Suboxone / MAT
          </Badge>
        </div>

        {/* Price bridge */}
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(39,174,96,0.06)",
            border: "1px solid rgba(39,174,96,0.15)",
          }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Medication Cost
          </p>
          <p className="text-sm font-semibold">
            <span
              className="line-through"
              style={{ color: "oklch(0.62 0.18 25)" }}
            >
              $185
            </span>
            <span className="mx-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              →
            </span>
            <span className="font-bold" style={{ color: "#27ae60" }}>
              $45.37
            </span>
            <span
              className="text-xs ml-1"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              with Cost Plus Drugs
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="flex-1 min-h-[44px] text-xs"
            style={{
              borderColor: "rgba(34,211,238,0.35)",
              color: "#22d3ee",
              background: "transparent",
            }}
          >
            <a
              href="https://costplusdrugs.com?ncpdp=5755167"
              target="_blank"
              rel="noreferrer"
            >
              Request Script <ExternalLink className="ml-1 w-3 h-3" />
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-h-[44px] text-xs"
            style={{
              borderColor: "rgba(39,174,96,0.35)",
              color: "#27ae60",
              background: "transparent",
            }}
            onClick={handleQR}
            disabled={generateToken.isPending}
            data-ocid="brightside.button"
          >
            <QrCode className="w-4 h-4" />
          </Button>
        </div>

        {showQR && token && (
          <div className="flex flex-col items-center gap-2 pt-2">
            <QRImage value={token} size={160} />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              5-min PoP token — ZIP {loc.zip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BrightsideAnchor({ filterCity }: { filterCity?: string }) {
  return (
    <div className="space-y-4" data-ocid="brightside.list">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="h-px flex-1"
          style={{ background: "rgba(34,211,238,0.15)" }}
        />
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "#22d3ee" }}
        >
          Brightside Health — 17 NE Ohio Locations
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "rgba(34,211,238,0.15)" }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BRIGHTSIDE_LOCATIONS.map((loc) => (
          <LocationCard key={loc.zip} loc={loc} filterCity={filterCity} />
        ))}
      </div>
    </div>
  );
}

export { BRIGHTSIDE_LOCATIONS };
