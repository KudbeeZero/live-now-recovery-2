import { useParams } from "@tanstack/react-router";
import { AlertCircle, Phone } from "lucide-react";
import {
  BRIGHTSIDE_LOCATIONS,
  BrightsideAnchor,
} from "../components/BrightsideAnchor";
import { DopplerMap } from "../components/DopplerMap";
import { PriceComparisonCard } from "../components/PriceComparisonCard";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function LocationPage({ townOverride }: { townOverride?: string }) {
  const params = useParams({ strict: false }) as { town?: string };
  const town = townOverride ?? params.town ?? "";
  const cityName = capitalize(town);
  const hasBrightside = BRIGHTSIDE_LOCATIONS.some(
    (l) => l.name.toLowerCase() === town.toLowerCase(),
  );

  return (
    <main className="min-h-screen py-10 px-4" data-ocid="location.page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            MAT Providers in {cityName}, Ohio
          </h1>
          <p className="text-muted-foreground">
            Real-time availability for medication-assisted treatment in{" "}
            {cityName}. Region 13 coverage.
          </p>
        </div>

        {/* Crisis banner */}
        <div
          className="mb-8 p-4 rounded-xl bg-crisis-banner/10 border border-crisis-banner/20 flex items-start gap-3"
          data-ocid="location.panel"
        >
          <AlertCircle className="w-5 h-5 text-crisis-banner shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-crisis-banner text-sm">
              Need help right now?
            </p>
            <p className="text-sm text-foreground/80">
              Call Ohio MAR NOW:{" "}
              <a
                href="tel:833-234-6343"
                className="font-bold text-crisis-banner hover:underline"
              >
                833-234-6343
              </a>{" "}
              — 24/7 crisis support
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          <div className="xl:col-span-2">
            <div className="rounded-2xl overflow-hidden shadow-card border border-border">
              <DopplerMap height="400px" />
            </div>
          </div>
          <div>
            <PriceComparisonCard />
          </div>
        </div>

        {/* Brightside always first */}
        {hasBrightside && (
          <div className="mb-10">
            <BrightsideAnchor filterCity={cityName} />
          </div>
        )}

        {/* Local resources */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-6">
          <h2 className="font-bold text-navy mb-4">
            Local Crisis Resources — {cityName}
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-crisis-banner" />
              <span>
                <strong>Ohio MAR NOW:</strong>{" "}
                <a
                  href="tel:833-234-6343"
                  className="text-crisis-banner hover:underline font-bold"
                >
                  833-234-6343
                </a>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-action-blue" />
              <span>
                <strong>SAMHSA Helpline:</strong>{" "}
                <a
                  href="tel:1-800-662-4357"
                  className="text-action-blue hover:underline"
                >
                  1-800-662-HELP (4357)
                </a>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>
                <strong>988 Suicide & Crisis Lifeline:</strong>{" "}
                <a href="tel:988" className="text-action-blue hover:underline">
                  988
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
