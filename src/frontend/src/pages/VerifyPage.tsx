import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode } from "lucide-react";
import { HandoffImpact } from "../components/HandoffImpact";
import { ScanHandoff } from "../components/ScanHandoff";
import { VolunteerHandoff } from "../components/VolunteerHandoff";

export function VerifyPage() {
  return (
    <main className="min-h-screen" data-ocid="verify.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <QrCode className="w-5 h-5 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              Anonymous Verification
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Proof of <span className="text-live-green">Presence</span>
          </h1>
          <p className="text-on-dark">
            Generate or scan a one-time handoff token. Anonymous. No PHI.
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
