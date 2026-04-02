import { useState } from "react";

type ActiveForm = "helper" | "provider" | null;

const CTA_COLOR = "#00C47C";
const HERO_BG = "#0A1628";
const CARD_BG = "#FFFFFF";

// ── SVG Icons ──────────────────────────────────────────────────────────────
function MapPinIcon() {
  return (
    <svg
      aria-hidden="true"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke={CTA_COLOR}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      stroke={CTA_COLOR}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      stroke={CTA_COLOR}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      stroke={CTA_COLOR}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
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
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        htmlFor={id}
        style={{
          fontWeight: 500,
          fontSize: 14,
          color: "#111827",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        data-ocid={`signup.${id}.input`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: error ? "1px solid #DC2626" : "1px solid #D1D5DB",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 15,
          fontFamily: "Inter, system-ui, sans-serif",
          outline: "none",
          transition: "outline 0.15s",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = `2px solid ${CTA_COLOR}`;
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
      />
      {error && (
        <span
          role="alert"
          style={{
            color: "#DC2626",
            fontSize: 12,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        data-ocid="signup.helper.success_state"
        style={{
          background: CARD_BG,
          borderRadius: 12,
          padding: "40px 32px",
          maxWidth: 480,
          margin: "0 auto",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckIcon />
        </div>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#111827",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          You’re in. We’ll notify you when your community needs you.
        </p>
      </div>
    );
  }

  return (
    <div
      data-ocid="signup.helper.panel"
      style={{
        background: CARD_BG,
        borderRadius: 12,
        padding: "32px",
        maxWidth: 480,
        margin: "0 auto",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <button
        type="button"
        data-ocid="signup.helper.close_button"
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: CTA_COLOR,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 16,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        ← Back
      </button>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#111827",
          fontFamily: "Inter, system-ui, sans-serif",
          margin: "0 0 24px",
        }}
      >
        Community Helper Sign Up
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
        noValidate
      >
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
        <button
          data-ocid="signup.helper.submit_button"
          type="submit"
          disabled={submitting}
          style={{
            background: CTA_COLOR,
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 16,
            fontFamily: "Inter, system-ui, sans-serif",
            border: "none",
            borderRadius: 8,
            padding: "12px",
            cursor: submitting ? "default" : "pointer",
            marginTop: 8,
            opacity: submitting ? 0.8 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {submitting ? "Submitting..." : "Sign Up as Helper"}
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
        style={{
          background: CARD_BG,
          borderRadius: 12,
          padding: "40px 32px",
          maxWidth: 480,
          margin: "0 auto",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckIcon />
        </div>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#111827",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          You’re listed. Patients in your area will be able to find you soon.
        </p>
      </div>
    );
  }

  return (
    <div
      data-ocid="signup.provider.panel"
      style={{
        background: CARD_BG,
        borderRadius: 12,
        padding: "32px",
        maxWidth: 480,
        margin: "0 auto",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <button
        type="button"
        data-ocid="signup.provider.close_button"
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: CTA_COLOR,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 16,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        ← Back
      </button>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#111827",
          fontFamily: "Inter, system-ui, sans-serif",
          margin: "0 0 24px",
        }}
      >
        Provider Sign Up
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
        noValidate
      >
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
          style={{
            background: CTA_COLOR,
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 16,
            fontFamily: "Inter, system-ui, sans-serif",
            border: "none",
            borderRadius: 8,
            padding: "12px",
            cursor: submitting ? "default" : "pointer",
            marginTop: 8,
            opacity: submitting ? 0.8 : 1,
            transition: "opacity 0.15s",
          }}
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
  buttonLabel: string;
  ocid: string;
  onClick: () => void;
}

function RoleCard({
  icon,
  title,
  description,
  buttonLabel,
  ocid,
  onClick,
}: RoleCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: CARD_BG,
        borderRadius: 12,
        padding: "32px 24px",
        boxShadow: hovered
          ? "0 8px 32px rgba(0,0,0,0.18)"
          : "0 4px 24px rgba(0,0,0,0.08)",
        border: hovered ? `1px solid ${CTA_COLOR}` : "1px solid transparent",
        transition: "box-shadow 0.2s, border 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        flex: 1,
        minWidth: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ marginBottom: 16 }}>{icon}</div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#111827",
          fontFamily: "Inter, system-ui, sans-serif",
          margin: "0 0 12px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "#6B7280",
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: 1.6,
          margin: "0 0 24px",
          flex: 1,
        }}
      >
        {description}
      </p>
      <button
        type="button"
        data-ocid={ocid}
        onClick={onClick}
        style={{
          background: CTA_COLOR,
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 15,
          fontFamily: "Inter, system-ui, sans-serif",
          border: "none",
          borderRadius: 8,
          padding: "11px 20px",
          cursor: "pointer",
          width: "100%",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.88";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflowY: "auto",
        background: HERO_BG,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "64px 24px 40px",
          textAlign: "center",
        }}
      >
        {/* Logo / wordmark */}
        <div style={{ marginBottom: 32 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: CTA_COLOR,
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
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

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.15,
            margin: "0 0 20px",
          }}
        >
          Be There Before It’s Too Late
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "#CBD5E1",
            lineHeight: 1.65,
            margin: "0 0 16px",
            maxWidth: 580,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Live Now Recovery uses real-time data to predict overdose hotspots and
          mobilize community helpers — before 911 gets called.
        </p>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
          No account required to find help. Sign up to make a difference.
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <style>{`
          .signup-cards {
            display: flex;
            gap: 20px;
            align-items: stretch;
          }
          @media (max-width: 768px) {
            .signup-cards {
              flex-direction: column;
            }
          }
        `}</style>
        <div className="signup-cards">
          <RoleCard
            icon={<MapPinIcon />}
            title="Find Help Now"
            description="Find Suboxone providers, naloxone locations, and support resources near you. No sign-up required."
            buttonLabel="Continue Anonymously"
            ocid="signup.anonymous.primary_button"
            onClick={() => {
              window.location.href = "/map";
            }}
          />
          <RoleCard
            icon={<ShieldHeartIcon />}
            title="Become a Community Helper"
            description="Get notified when overdose risk spikes in your zip code. Respond like a volunteer first responder. Your community needs you."
            buttonLabel="Sign Up as Helper"
            ocid="signup.helper.primary_button"
            onClick={() => setActiveForm("helper")}
          />
          <RoleCard
            icon={<MedicalCrossIcon />}
            title="List as a Provider"
            description="Are you a Suboxone prescriber or MAT provider? Get found by people who need you right now."
            buttonLabel="Join as Provider"
            ocid="signup.provider.primary_button"
            onClick={() => setActiveForm("provider")}
          />
        </div>
      </div>

      {/* Inline form section */}
      {activeForm && (
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "32px 24px 64px",
          }}
        >
          {activeForm === "helper" && (
            <HelperForm onBack={() => setActiveForm(null)} />
          )}
          {activeForm === "provider" && (
            <ProviderForm onBack={() => setActiveForm(null)} />
          )}
        </div>
      )}

      {/* Bottom padding when no form */}
      {!activeForm && <div style={{ height: 64 }} />}
    </div>
  );
}
