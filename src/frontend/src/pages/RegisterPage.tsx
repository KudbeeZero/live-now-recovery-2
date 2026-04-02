import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Lock,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRegisterProvider } from "../hooks/useQueries";

async function geocodeAddress(
  address: string,
  city: string,
  zip: string,
): Promise<{ lat: number; lng: number }> {
  const query = encodeURIComponent(`${address}, ${city}, OH ${zip}, USA`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (!data || data.length === 0) {
    throw new Error("Address not found");
  }
  return {
    lat: Number.parseFloat(data[0].lat),
    lng: Number.parseFloat(data[0].lon),
  };
}

export function RegisterPage() {
  const { login, loginStatus, isLoggingIn } = useInternetIdentity();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    clinicName: "",
    providerType: "",
    npiNumber: "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [providerTypeError, setProviderTypeError] = useState<string | null>(
    null,
  );
  const registerProvider = useRegisterProvider();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeocodeError(null);
    setProviderTypeError(null);

    if (!form.providerType) {
      setProviderTypeError("Please select a provider type.");
      return;
    }

    if (!form.address.trim() || !form.city.trim()) {
      setGeocodeError(
        "Street address and city are required to place your clinic on the map.",
      );
      return;
    }

    setIsGeocoding(true);
    try {
      const { lat, lng } = await geocodeAddress(
        form.address,
        form.city,
        form.zip,
      );
      await registerProvider.mutateAsync({
        id: form.npiNumber,
        name: form.clinicName,
        lat,
        lng,
        providerType: form.providerType,
      });
      setDone(true);
    } catch (err) {
      const isGeoError =
        err instanceof Error && err.message === "Address not found";
      if (isGeoError) {
        setGeocodeError(
          "We couldn't verify this address. Please check for typos or enter a more complete address.",
        );
      } else {
        toast.error(
          "Registration failed. Please ensure you're signed in and try again.",
        );
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Not logged in — show sign-in gate
  if (loginStatus !== "success") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-background"
        data-ocid="register.page"
      >
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border border-border">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-foreground mb-2">
            Provider Registration
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Verify your identity to register your practice. Your Internet
            Identity is never linked to patient searches.
          </p>
        </div>
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          className="min-h-[44px] min-w-[44px] bg-primary hover:bg-primary/90 text-white px-8"
          data-ocid="register.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting…
            </>
          ) : (
            "Sign In to Register"
          )}
        </Button>
      </main>
    );
  }

  // Success state
  if (done) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-background"
        data-ocid="register.success_state"
      >
        <div className="w-16 h-16 rounded-full bg-live/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-live" />
        </div>
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Application Submitted
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            An admin will verify your NPI against SAMHSA records and activate
            your listing within 24–48 hours. You'll appear in search results
            after verification.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setDone(false);
            setForm({
              clinicName: "",
              providerType: "",
              npiNumber: "",
              address: "",
              city: "",
              zip: "",
              phone: "",
            });
          }}
          className="min-h-[44px] border-border text-foreground hover:bg-secondary"
          data-ocid="register.secondary_button"
        >
          Register Another
        </Button>
      </main>
    );
  }

  // Main registration form
  return (
    <main
      className="min-h-screen py-16 px-4 bg-background"
      data-ocid="register.page"
    >
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Provider Registration
          </h1>
          <p className="text-muted-foreground text-sm">
            MAT clinic intake — Ohio Region 13
          </p>
        </div>

        {/* Info box */}
        <div
          className="flex gap-3 bg-primary/10 border border-primary/20 rounded-xl p-4 mb-5"
          data-ocid="register.panel"
        >
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-primary/90 leading-relaxed">
            Provider applications are reviewed manually. Your NPI will be
            verified against SAMHSA records before your clinic appears in search
            results.
          </p>
        </div>

        {/* NO-PHI notice */}
        <div className="flex gap-3 bg-amber/10 border border-amber/20 rounded-xl p-4 mb-6">
          <span className="text-amber text-base mt-0.5 shrink-0">⚠</span>
          <p className="text-sm text-amber/90 leading-relaxed">
            No patient data is ever collected or stored. Clinic logistics only.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5"
          data-ocid="register.modal"
        >
          {/* Clinic Name */}
          <div className="space-y-1.5">
            <Label htmlFor="clinicName" className="text-foreground font-medium">
              Clinic Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clinicName"
              value={form.clinicName}
              onChange={(e) =>
                setForm((f) => ({ ...f, clinicName: e.target.value }))
              }
              placeholder="Brightside Health — Cleveland"
              className="min-h-[44px] bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
              required
              data-ocid="register.input"
            />
          </div>

          {/* Provider Type */}
          <div className="space-y-1.5">
            <Label
              htmlFor="providerType"
              className="text-foreground font-medium"
            >
              Provider Type <span className="text-destructive">*</span>
            </Label>
            <select
              id="providerType"
              value={form.providerType}
              onChange={(e) => {
                setProviderTypeError(null);
                setForm((f) => ({ ...f, providerType: e.target.value }));
              }}
              className="min-h-[44px] w-full bg-secondary border border-border text-foreground rounded-md px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              data-ocid="register.select"
            >
              <option value="" disabled>
                Select a provider type…
              </option>
              <option value="MAT">MAT Clinic</option>
              <option value="Narcan">Narcan Distribution</option>
              <option value="ER">Emergency Room</option>
            </select>
            {providerTypeError && (
              <div
                className="flex gap-2 items-center"
                data-ocid="register.error_state"
              >
                <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                <p className="text-xs text-destructive">{providerTypeError}</p>
              </div>
            )}
          </div>

          {/* NPI Number */}
          <div className="space-y-1.5">
            <Label htmlFor="npiNumber" className="text-foreground font-medium">
              NPI Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="npiNumber"
              value={form.npiNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, npiNumber: e.target.value }))
              }
              placeholder="1234567890"
              className="min-h-[44px] bg-secondary border-border text-foreground placeholder:text-muted-foreground font-mono focus-visible:ring-primary focus-visible:border-primary"
              required
              maxLength={10}
              data-ocid="register.input"
            />
            <p className="text-xs text-muted-foreground">
              10-digit National Provider Identifier from SAMHSA
            </p>
          </div>

          {/* Practice Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-foreground font-medium">
              Practice Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => {
                setGeocodeError(null);
                setForm((f) => ({ ...f, address: e.target.value }));
              }}
              placeholder="1234 Main Street"
              className="min-h-[44px] bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
              required
              data-ocid="register.input"
            />
          </div>

          {/* City + ZIP */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-foreground font-medium">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => {
                  setGeocodeError(null);
                  setForm((f) => ({ ...f, city: e.target.value }));
                }}
                placeholder="Cleveland"
                className="min-h-[44px] bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
                required
                data-ocid="register.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip" className="text-foreground font-medium">
                ZIP Code
              </Label>
              <Input
                id="zip"
                value={form.zip}
                onChange={(e) =>
                  setForm((f) => ({ ...f, zip: e.target.value }))
                }
                placeholder="44101"
                className="min-h-[44px] bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
                data-ocid="register.input"
              />
            </div>
          </div>

          {/* Geocode error */}
          {geocodeError && (
            <div
              className="flex gap-3 items-start bg-destructive/10 border border-destructive/40 rounded-lg p-3"
              data-ocid="register.error_state"
            >
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive leading-snug">
                {geocodeError}
              </p>
            </div>
          )}

          {/* Geocoding info note */}
          <div className="flex gap-2 items-center text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>
              Your address is geocoded to place your clinic accurately on the
              map. A valid street address and city are required.
            </span>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-foreground font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="(216) 555-0100"
              className="min-h-[44px] bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
              data-ocid="register.input"
            />
          </div>

          <p className="text-xs text-muted-foreground border-t border-border pt-4">
            Address, city, ZIP, and phone are collected for admin review only
            and are not exposed to the public until admin verification is
            complete.
          </p>

          <Button
            type="submit"
            disabled={isGeocoding || registerProvider.isPending}
            className="w-full min-h-[44px] bg-live hover:bg-live/90 text-background font-semibold"
            data-ocid="register.submit_button"
          >
            {isGeocoding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
                address…
              </>
            ) : registerProvider.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
