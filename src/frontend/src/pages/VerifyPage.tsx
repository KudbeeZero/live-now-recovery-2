import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HandoffImpact } from "../components/HandoffImpact";
import { ScanHandoff } from "../components/ScanHandoff";
import { VolunteerHandoff } from "../components/VolunteerHandoff";

export function VerifyPage() {
  return (
    <main className="min-h-screen py-10 px-4" data-ocid="verify.page">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy mb-2">
            Proof of Presence
          </h1>
          <p className="text-muted-foreground text-sm">
            Generate or scan a one-time handoff token. Anonymous. No PHI.
          </p>
        </div>

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
