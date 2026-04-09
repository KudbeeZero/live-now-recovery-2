import { useState } from "react";
import { useRegisterHelper } from "../hooks/useQueries";

type ActiveForm = "helper" | "provider" | null;

// ── SVG Icons ──────────────────────────────────────────────────────────────
function MapPinIcon() {
  return (
    <svg
      aria-hidden="true"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-live-green"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ShieldHeartIcon() {
  return (
    <svg
      aria-hidden="true"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-live-green"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 11.5C9.5 10.12 10.62 9 12 9s2.5 1.12 2.5 2.5c0 2-2.5 4-2.5 4s-2.5-2-2.5-4z" />
    </svg>
  );
}

function MedicalCrossIcon() {
  return (
    <svg
      aria-hidden="true"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-live-green"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-live-green"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Shared form field component ─────────────────────────────────────────────
interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium text-sm text-foreground">
        {label}
      </label>
      <input
        id={id}
        data-ocid={`signup.${id}.input`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full rounded-lg px-3 py-2.5 text-sm bg-background text-foreground",
          "border transition-colors outline-none",
          "focus-visible:ring-2 focus-visible:ring-live-green focus-visible:ring-offset-1",
          error ? "border-destructive" : "border-input",
        ].join(" ")}
      />
      {error && (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      )}
    </div>
  );
}

// ── Helper Form ─────────────────────────────────────────────────────────────
function HelperForm({ onBack }: { onBack: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const registerHelper = useRegisterHelper();

  function validate() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!/^\d{5}$/.test(zip.trim()))
      errs.zip = "Please enter a valid 5-digit zip code";
    if (!phone.trim()) errs.phone = "Phone number is required";
    if (!email.trim()) errs.email = "Email is required";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitError("");
    try {
      await registerHelper.mutateAsync({
        firstName: firstName.trim(),
        lastName: "",
        email: email.trim() || phone.trim(),
        zip: zip.trim(),
        helpType: reason.trim() || "general-volunteer",
        agreed: true,
      });
      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div
        data-ocid="signup.helper.success_state"
        className="bg-navy/80 rounded-xl p-10 max-w-lg mx-auto text-center border border-live-green/20"
      >
        <div className="w-14 h-14 rounded-full bg-live-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckIcon />
        </div>
        <p className="text-lg font-semibold text-white leading-relaxed m-0">
          You're in. We'll notify you when your community needs you.
        </p>
      </div>
    );
  }

  return (
    <div
      data-ocid="signup.helper.panel"
      className="bg-card rounded-xl p-8 max-w-lg mx-auto border border-border/40 shadow-card"
    >
      <button
        type="button"
        data-ocid="signup.helper.close_button"
        onClick={onBack}
        className="text-live-green text-sm font-medium mb-4 flex items-center gap-1 hover:opacity-80 transition-opacity bg-transparent border-none p-0 cursor-pointer"
      >
        ← Back
      </button>
      <h2 className="text-xl font-bold text-foreground mb-6">
        Community Helper Sign Up
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          label="First name"
          id="helper-firstname"
          value={firstName}
          onChange={setFirstName}
          error={errors.firstName}
        />
        <Field
          label="Zip code"
          id="helper-zip"
          placeholder="e.g. 44101"
          value={zip}
          onChange={setZip}
          error={errors.zip}
        />
        <Field
          label="Phone number"
          id="helper-phone"
          type="tel"
          placeholder="000-000-0000"
          value={phone}
          onChange={setPhone}
          error={errors.phone}
        />
        <Field
          label="Email"
          id="helper-email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <Field
          label="Password"
          id="helper-password"
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
        <Field
          label="Why do you want to volunteer? (optional)"
          id="helper-reason"
          placeholder="Tell us a little about yourself..."
          value={reason}
          onChange={setReason}
        />
        {submitError && (
          <span role="alert" className="text-destructive text-sm text-center">
            {submitError}
          </span>
        )}
        <button
          data-ocid="signup.helper.submit_button"
          type="submit"
          disabled={registerHelper.isPending}
          className="bg-live-green text-navy font-bold text-base rounded-lg py-3 mt-2 w-full cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-default border-none"
        >
          {registerHelper.isPending ? "Signing up..." : "Sign Up as Helper"}
        </button>
      </form>
    </div>
  );
}

// ── Provider Form ────────────────────────────────────────────────────────────
function ProviderForm({ onBack }: { onBack: () => void }) {
  const [fullName, setFullName] = useState("");
  const [npi, setNpi] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!/^\d{10}$/.test(npi.trim())) errs.npi = "NPI number must be 10 digits";
    if (!practiceName.trim()) errs.practiceName = "Practice name is required";
    if (!/^\d{5}$/.test(zip.trim()))
      errs.zip = "Please enter a valid 5-digit zip code";
    if (!email.trim()) errs.email = "Email is required";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  }

  if (submitted) {
    return (
      <div
        data-ocid="signup.provider.success_state"
        className="bg-navy/80 rounded-xl p-10 max-w-lg mx-auto text-center border border-live-green/20"
      >
        <div className="w-14 h-14 rounded-full bg-live-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckIcon />
        </div>
        <p className="text-lg font-semibold text-white leading-relaxed m-0">
          You're listed. Patients in your area will be able to find you soon.
        </p>
      </div>
    );
  }

  return (
    <div
      data-ocid="signup.provider.panel"
      className="bg-card rounded-xl p-8 max-w-lg mx-auto border border-border/40 shadow-card"
    >
      <button
        type="button"
        data-ocid="signup.provider.close_button"
        onClick={onBack}
        className="text-live-green text-sm font-medium mb-4 flex items-center gap-1 hover:opacity-80 transition-opacity bg-transparent border-none p-0 cursor-pointer"
      >
        ← Back
      </button>
      <h2 className="text-xl font-bold text-foreground mb-6">
        Provider Sign Up
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          label="Full name"
          id="provider-fullname"
          value={fullName}
          onChange={setFullName}
          error={errors.fullName}
        />
        <Field
          label="NPI number"
          id="provider-npi"
          placeholder="10-digit NPI"
          value={npi}
          onChange={setNpi}
          error={errors.npi}
        />
        <Field
          label="Practice name"
          id="provider-practicename"
          value={practiceName}
          onChange={setPracticeName}
          error={errors.practiceName}
        />
        <Field
          label="Zip code"
          id="provider-zip"
          placeholder="e.g. 44101"
          value={zip}
          onChange={setZip}
          error={errors.zip}
        />
        <Field
          label="Email"
          id="provider-email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <Field
          label="Password"
          id="provider-password"
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
        <button
          data-ocid="signup.provider.submit_button"
          type="submit"
          disabled={submitting}
          className="bg-live-green text-navy font-bold text-base rounded-lg py-3 mt-2 w-full cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-default border-none"
        >
          {submitting ? "Submitting..." : "Join as Provider"}
        </button>
      </form>
    </div>
  );
}

// ── Role Card ───────────────────────────────────────────────────────────────
interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  blurb: string;
  buttonLabel: string;
  ocid: string;
  onClick: () => void;
}

function RoleCard({
  icon,
  title,
  description,
  blurb,
  buttonLabel,
  ocid,
  onClick,
}: RoleCardProps) {
  return (
    <div
      className={[
        "bg-navy-light rounded-xl p-8 flex flex-col items-center text-center flex-1 min-w-0",
        "border border-white/10 transition-all duration-200",
        "hover:border-live-green/50 hover:shadow-glow-green",
      ].join(" ")}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed mb-2 flex-1">
        {description}
      </p>
      <p className="text-xs text-white/50 leading-relaxed mb-6 italic">
        {blurb}
      </p>
      <button
        type="button"
        data-ocid={ocid}
        onClick={onClick}
        className="bg-live-green text-navy font-bold text-sm rounded-lg px-5 py-3 w-full cursor-pointer transition-opacity hover:opacity-90 border-none"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function SignupPage() {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-navy font-sans">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-10 text-center">
        {/* Logo / wordmark */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 text-live-green font-extrabold text-sm tracking-widest uppercase">
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Live Now Recovery
          </span>
        </div>

        <h1 className="text-[clamp(28px,5vw,44px)] font-extrabold text-white leading-tight mb-5">
          Be There Before It's Too Late
        </h1>
        <p className="text-lg text-white/70 leading-relaxed mb-4 max-w-xl mx-auto">
          Live Now Recovery uses real-time data to predict overdose hotspots and
          mobilize community helpers — before 911 gets called.
        </p>
        <p className="text-sm text-white/40 m-0">
          No account required to find help. Sign up to make a difference.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-5 items-stretch">
          <RoleCard
            icon={<MapPinIcon />}
            title="Find Help Now"
            description="Find Suboxone providers, naloxone locations, and support resources near you. No sign-up required."
            blurb="Browse all providers anonymously. No account needed — your search is completely private and never stored."
            buttonLabel="Continue Anonymously"
            ocid="signup.anonymous.primary_button"
            onClick={() => {
              window.location.href = "/";
            }}
          />
          <RoleCard
            icon={<ShieldHeartIcon />}
            title="Become a Community Helper"
            description="Get notified when overdose risk spikes in your zip code. Respond like a volunteer first responder."
            blurb="Volunteer to meet people at pickup points, drive them to clinics, or carry naloxone in your area. Your impact is tracked as anonymous warm handoffs."
            buttonLabel="Sign Up as Helper"
            ocid="signup.helper.primary_button"
            onClick={() => setActiveForm("helper")}
          />
          <RoleCard
            icon={<MedicalCrossIcon />}
            title="List as a Provider"
            description="Are you a Suboxone prescriber or MAT provider? Get found by people who need you right now."
            blurb="Register your clinic, ER, or distribution point. Patients find you in real time. Cost Plus Drugs pricing integration available for transparent medication costs."
            buttonLabel="Join as Provider"
            ocid="signup.provider.primary_button"
            onClick={() => setActiveForm("provider")}
          />
        </div>
      </div>

      {/* Inline form section */}
      {activeForm && (
        <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
          {activeForm === "helper" && (
            <HelperForm onBack={() => setActiveForm(null)} />
          )}
          {activeForm === "provider" && (
            <ProviderForm onBack={() => setActiveForm(null)} />
          )}
        </div>
      )}

      {/* Bottom padding when no form */}
      {!activeForm && <div className="h-16" />}
    </div>
  );
}
