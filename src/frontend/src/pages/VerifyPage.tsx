import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode } from "lucide-react";
import { HandoffImpact } from "../components/HandoffImpact";
import { SEO } from "../components/SEO";
import { ScanHandoff } from "../components/ScanHandoff";
import { VolunteerHandoff } from "../components/VolunteerHandoff";

export function VerifyPage() {
  return (
    <main className="min-h-screen" data-ocid="verify.page">
      <SEO
        title="Verify Warm Handoff | Live Now Recovery"
        description="Warm handoff verification — confirm in-person presence and complete the recovery coordination event on-chain."
        keywords="warm handoff verification, proof of presence, recovery coordination, Live Now Recovery verify"
        canonical="/verify"
      />
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 210) 0%, oklch(0.16 0.06 195) 50%, oklch(0.11 0.03 240) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.62 0.12 218 / 0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-14 md:py-18 text-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 mb-5">
            <QrCode className="w-3.5 h-3.5 text-teal-300" />
            <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest">
              Anonymous Verification
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-3 leading-tight">
            <span className="text-foreground">Verify </span>
            <span className="text-brand-teal">Warm Handoff</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Confirm your presence to complete this recovery coordination event
            and earn your credential.
          </p>
          <p className="text-teal-300/60 text-sm mt-2">
            Generate or scan a one-time handoff token. Anonymous. No PHI ever
            stored.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <Tabs defaultValue="scan" className="mb-8">
          <TabsList className="w-full" data-ocid="verify.tab">
            <TabsTrigger value="scan" className="flex-1">
              Scan QR
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex-1">
              Generate QR
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scan" className="mt-6">
            <ScanHandoff />
          </TabsContent>
          <TabsContent value="generate" className="mt-6">
            <VolunteerHandoff />
          </TabsContent>
        </Tabs>

        <HandoffImpact />
      </div>
    </main>
  );
}
