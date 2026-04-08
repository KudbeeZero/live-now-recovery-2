import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle,
  MapPin,
  Phone,
  QrCode,
  Shield,
} from "lucide-react";
import { useState } from "react";
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

const HELP_TYPES = [
  { value: "narcan-carrier", label: "Narcan carrier" },
  { value: "peer-support", label: "Peer support" },
  { value: "transportation", label: "Transportation" },
  { value: "general-volunteer", label: "General volunteer" },
];

type FormFields = {
  firstName: string;
  lastName: string;
  email: string;
  zip: string;
  helpType: string;
  agreed: boolean;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

const emptyForm: FormFields = {
  firstName: "",
  lastName: "",
  email: "",
  zip: "",
  helpType: "",
  agreed: false,
};

function VolunteerSignupForm() {
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "A valid email address is required.";
    if (!form.zip.trim() || !/^\d{5}$/.test(form.zip))
      e.zip = "Enter a valid 5-digit ZIP code.";
    if (!form.helpType) e.helpType = "Please select a type of help.";
    if (!form.agreed) e.agreed = "You must agree to be contacted.";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  }

  function handleReset() {
    setForm(emptyForm);
    setErrors({});
    setSubmitted(false);
  }

  function set<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  if (submitted) {
    return (
      <div
        className="bg-card border border-border rounded-2xl p-8 text-center"
        data-ocid="helper.form.confirmation"
      >
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-live-green" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Thank you for signing up!
        </h3>
        <p className="text-live-green font-semibold mb-2">
          A provider in your area may reach out to you soon.
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          Your information is kept private and will never be shared without your
          consent.
        </p>
        <Button
          variant="outline"
          className="min-h-[48px] px-6 rounded-lg font-semibold border-border text-foreground hover:bg-muted"
          onClick={handleReset}
          data-ocid="helper.form.reset"
        >
          Sign up another volunteer
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-card border border-border rounded-2xl p-6 md:p-8"
      data-ocid="helper.form"
    >
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-live-green" />
        <span className="text-xs font-bold uppercase tracking-widest text-live-green">
          Volunteer Signup
        </span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-1">
        Sign Up to <span className="text-live-green">Help</span>
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        Join the network of community volunteers supporting recovery in NE Ohio.
      </p>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="volunteer-first"
            className="block text-xs font-semibold text-on-dark mb-1"
          >
            First name <span className="text-destructive">*</span>
          </label>
          <input
            id="volunteer-first"
            type="text"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            placeholder="Jane"
            autoComplete="given-name"
            className="w-full rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-ocid="helper.form.firstName"
          />
          {errors.firstName && (
            <p className="text-destructive text-xs mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="volunteer-last"
            className="block text-xs font-semibold text-on-dark mb-1"
          >
            Last name <span className="text-destructive">*</span>
          </label>
          <input
            id="volunteer-last"
            type="text"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            placeholder="Doe"
            autoComplete="family-name"
            className="w-full rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-ocid="helper.form.lastName"
          />
          {errors.lastName && (
            <p className="text-destructive text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="volunteer-email"
          className="block text-xs font-semibold text-on-dark mb-1"
        >
          Email <span className="text-destructive">*</span>
        </label>
        <input
          id="volunteer-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="jane@example.com"
          autoComplete="email"
          className="w-full rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          data-ocid="helper.form.email"
        />
        {errors.email && (
          <p className="text-destructive text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* ZIP */}
      <div className="mb-4">
        <label
          htmlFor="volunteer-zip"
          className="block text-xs font-semibold text-on-dark mb-1"
        >
          ZIP code <span className="text-destructive">*</span>
        </label>
        <input
          id="volunteer-zip"
          type="text"
          value={form.zip}
          onChange={(e) =>
            set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))
          }
          placeholder="44101"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={5}
          className="w-full sm:w-40 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground py-3 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          data-ocid="helper.form.zip"
        />
        {errors.zip && (
          <p className="text-destructive text-xs mt-1">{errors.zip}</p>
        )}
      </div>

      {/* Help type */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-on-dark mb-2">
          Type of help <span className="text-destructive">*</span>
        </p>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          role="radiogroup"
          aria-label="Type of help"
        >
          {HELP_TYPES.map((opt) => {
            const checked = form.helpType === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  checked
                    ? "border-live-green bg-live-green/10 text-white"
                    : "border-border bg-muted text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
                data-ocid={`helper.form.helpType.${opt.value}`}
              >
                <input
                  type="radio"
                  name="helpType"
                  value={opt.value}
                  checked={checked}
                  onChange={() => set("helpType", opt.value)}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    checked ? "border-live-green" : "border-muted-foreground"
                  }`}
                >
                  {checked && (
                    <span className="w-2 h-2 rounded-full bg-live-green" />
                  )}
                </span>
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            );
          })}
        </div>
        {errors.helpType && (
          <p className="text-destructive text-xs mt-1">{errors.helpType}</p>
        )}
      </div>

      {/* Consent checkbox */}
      <div className="mb-6">
        <label
          className="flex items-start gap-3 cursor-pointer"
          data-ocid="helper.form.consent"
        >
          <input
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => set("agreed", e.target.checked)}
            className="sr-only"
          />
          <span
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              form.agreed
                ? "bg-live-green border-live-green"
                : "border-border bg-muted"
            }`}
            aria-hidden="true"
          >
            {form.agreed && (
              <svg
                className="w-3 h-3 text-navy"
                fill="none"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="text-sm text-muted-foreground leading-relaxed">
            I agree to be contacted by providers in my area
          </span>
        </label>
        {errors.agreed && (
          <p className="text-destructive text-xs mt-1 ml-8">{errors.agreed}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full min-h-[48px] rounded-lg font-semibold text-base bg-primary hover:bg-primary/90 text-primary-foreground"
        data-ocid="helper.form.submit"
      >
        Sign Up as a Volunteer
      </Button>
    </form>
  );
}

export function HelperPage() {
  return (
    <main className="min-h-screen" data-ocid="helper.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              Volunteer & Peer Specialist Guide
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            How to Use{" "}
            <span className="text-live-green">Live Now Recovery</span>
          </h1>
          <p className="text-on-dark text-lg">
            You're on the front lines of the recovery crisis. This guide helps
            you use every tool available.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl shadow-card border border-border p-5"
              data-ocid="helper.card"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-live-green/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-live-green" />
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

        {/* Volunteer signup form */}
        <div className="mb-10">
          <VolunteerSignupForm />
        </div>

        <VolunteerHandoff />
      </div>
    </main>
  );
}
