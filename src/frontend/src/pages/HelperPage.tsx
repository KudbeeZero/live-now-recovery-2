import { Badge } from "@/components/ui/badge";
import { BookOpen, MapPin, Phone, QrCode } from "lucide-react";
import { VolunteerHandoff } from "../components/VolunteerHandoff";

const steps = [
  {
    icon: QrCode,
    title: "Generate a PoP Token",
    desc: "Enter the 5-digit NE Ohio ZIP code where you're helping someone. A one-time QR code is generated — valid for 5 minutes.",
  },
  {
    icon: MapPin,
    title: "Show the QR Code",
    desc: "Display the QR on your phone screen. Have the person or provider scan it using the Verify Handoff page.",
  },
  {
    icon: BookOpen,
    title: "Count Is Recorded",
    desc: "When scanned, a presence count is anonymously recorded for that ZIP code. No names. No PHI.",
  },
  {
    icon: Phone,
    title: "Emergency Protocol",
    desc: "If someone is in immediate danger, call 911. For MAT/crisis support call Ohio MAR NOW: 833-234-6343 anytime.",
  },
];

export function HelperPage() {
  return (
    <main className="min-h-screen py-10 px-4" data-ocid="helper.page">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-cplus-teal/10 text-cplus-teal border-0 hover:bg-cplus-teal/10">
            Volunteer & Peer Specialist Guide
          </Badge>
          <h1 className="text-3xl font-bold text-navy mb-3">
            How to Use Live Now Recovery
          </h1>
          <p className="text-muted-foreground">
            You're on the front lines of the recovery crisis. This guide helps
            you use every tool available.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl shadow-card border border-border p-5"
              data-ocid="helper.card"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cplus-teal/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-cplus-teal" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-sm mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map reading guide */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-8">
          <h2 className="font-bold text-navy mb-4">Reading the Live Map</h2>
          <div className="space-y-3">
            {[
              {
                color: "#00A896",
                label: "Teal pin",
                desc: "Provider is live and verified within 4 hours",
              },
              {
                color: "#F59E0B",
                label: "Yellow pin",
                desc: "Unknown or stale — status not confirmed recently",
              },
              {
                color: "#6B7280",
                label: "Gray pin",
                desc: "Provider marked offline",
              },
              {
                color: "#003087",
                label: "Royal blue pin",
                desc: "Brightside Health location — always accepts Medicaid",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div
                  className="w-4 h-4 rounded-full mt-0.5 shrink-0"
                  style={{ background: item.color }}
                />
                <div>
                  <span className="font-semibold text-sm text-navy">
                    {item.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    — {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <VolunteerHandoff />
      </div>
    </main>
  );
}
