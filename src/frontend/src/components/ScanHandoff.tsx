import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VerifyResult } from "../backend";
import { useVerifyHandoff } from "../hooks/useQueries";
import { useQRScanner } from "../qr-code/useQRScanner";

type ScanState = "idle" | "scanning" | "result";

export function ScanHandoff() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const verifyHandoff = useVerifyHandoff();
  const processedRef = useRef<string>("");

  const scanner = useQRScanner({
    facingMode: "environment",
    scanInterval: 500,
    maxResults: 1,
  });

  // Watch for new QR scan results
  useEffect(() => {
    if (scanState !== "scanning") return;
    const latest = scanner.qrResults[0];
    if (!latest || latest.data === processedRef.current) return;
    processedRef.current = latest.data;
    handleToken(latest.data);
  }, [scanner.qrResults, scanState]);

  const handleToken = async (token: string) => {
    scanner.stopScanning();
    try {
      const r = await verifyHandoff.mutateAsync(token);
      setResult(r);
    } catch {
      setResult({ __kind__: "NotFound", NotFound: null });
    }
    setScanState("result");
  };

  const startScan = async () => {
    setScanState("scanning");
    processedRef.current = "";
    await scanner.startScanning();
  };

  const reset = async () => {
    await scanner.stopScanning();
    scanner.clearResults();
    setResult(null);
    processedRef.current = "";
    setScanState("idle");
  };

  const ResultDisplay = () => {
    if (!result) return null;
    if (result.__kind__ === "Ok") {
      return (
        <div
          className="flex flex-col items-center gap-3 p-6 bg-green-50 rounded-xl border border-green-200"
          data-ocid="scan.success_state"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
          <p className="text-green-800 font-bold text-lg">Handoff Verified!</p>
          <p className="text-green-700 text-sm">ZIP: {result.Ok}</p>
        </div>
      );
    }
    if (result.__kind__ === "Expired") {
      return (
        <div
          className="flex flex-col items-center gap-3 p-6 bg-amber-50 rounded-xl border border-amber-200"
          data-ocid="scan.error_state"
        >
          <AlertCircle className="w-12 h-12 text-amber-500" />
          <p className="text-amber-800 font-bold">QR Code Expired</p>
          <p className="text-amber-700 text-sm">
            This QR code has expired (5-minute window).
          </p>
        </div>
      );
    }
    if (result.__kind__ === "AlreadyUsed") {
      return (
        <div
          className="flex flex-col items-center gap-3 p-6 bg-amber-50 rounded-xl border border-amber-200"
          data-ocid="scan.error_state"
        >
          <AlertCircle className="w-12 h-12 text-amber-500" />
          <p className="text-amber-800 font-bold">Already Counted</p>
          <p className="text-amber-700 text-sm">
            This handoff has already been recorded.
          </p>
        </div>
      );
    }
    return (
      <div
        className="flex flex-col items-center gap-3 p-6 bg-red-50 rounded-xl border border-red-200"
        data-ocid="scan.error_state"
      >
        <XCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-800 font-bold">Invalid QR Code</p>
        <p className="text-red-700 text-sm">
          Token not found. Please try again.
        </p>
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-card border border-border p-6 max-w-sm mx-auto"
      data-ocid="scan.panel"
    >
      <div className="text-center mb-5">
        <Camera className="w-10 h-10 text-cplus-teal mx-auto mb-2" />
        <h3 className="font-bold text-navy text-lg">Scan Handoff QR</h3>
        <p className="text-xs text-muted-foreground">
          Camera required — point at QR code
        </p>
      </div>

      {scanState === "idle" && (
        <Button
          onClick={startScan}
          disabled={scanner.canStartScanning === false}
          className="w-full min-h-[44px] bg-cplus-teal hover:bg-cplus-teal/90 text-white"
          data-ocid="scan.primary_button"
        >
          Start Scanning
        </Button>
      )}

      {scanState === "scanning" && (
        <div className="space-y-4">
          <div
            className="relative rounded-xl overflow-hidden bg-black"
            style={{ aspectRatio: "1" }}
          >
            <video
              ref={scanner.videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={scanner.canvasRef} className="hidden" />
            {/* Scan frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-cplus-teal rounded-lg" />
            </div>
          </div>
          {scanner.error && (
            <p className="text-xs text-destructive text-center">
              {scanner.error.message}
            </p>
          )}
          <Button
            variant="outline"
            onClick={reset}
            className="w-full min-h-[44px]"
            data-ocid="scan.cancel_button"
          >
            Cancel
          </Button>
        </div>
      )}

      {scanState === "result" && (
        <div className="space-y-4">
          <ResultDisplay />
          <Button
            variant="outline"
            onClick={reset}
            className="w-full min-h-[44px] border-cplus-teal text-cplus-teal hover:bg-cplus-teal hover:text-white"
            data-ocid="scan.secondary_button"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Scan Another
          </Button>
        </div>
      )}
    </div>
  );
}
