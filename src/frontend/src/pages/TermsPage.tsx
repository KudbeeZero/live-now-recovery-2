export function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[oklch(0.14_0.018_225)] border-b border-border py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[oklch(0.62_0.17_155)] mb-2">
            Terms of Service
          </h1>
          <p className="text-[oklch(0.72_0.03_225)] text-lg">
            Effective April 2026
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {sections.map((s) => (
          <div
            key={s.title}
            className="bg-card/50 border border-border rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-[oklch(0.80_0.12_196)] mb-3">
              {s.title}
            </h2>
            <div className="text-[oklch(0.72_0.03_225)] leading-relaxed space-y-2">
              {s.content}
            </div>
          </div>
        ))}

        <p className="text-sm text-muted-foreground text-center pb-8">
          Legal questions?{" "}
          <a
            href="mailto:legal@livenowrecovery.org"
            className="text-[oklch(0.62_0.17_155)] hover:underline"
          >
            legal@livenowrecovery.org
          </a>
        </p>
      </div>
    </div>
  );
}

const sections = [
  {
    title: "Platform Purpose",
    content: (
      <p>
        Live Now Recovery is a{" "}
        <strong className="text-foreground">directory service</strong>, not a
        healthcare provider. We connect individuals seeking Medication-Assisted
        Treatment (MAT) resources with independently operated providers in Ohio.
        We do not provide medical services, prescribe medications, or render
        clinical judgments of any kind.
      </p>
    ),
  },
  {
    title: "No Medical Advice",
    content: (
      <p>
        Nothing on this platform constitutes medical advice, diagnosis, or
        treatment. Information about providers, medications, and treatment
        options is provided for general informational purposes only. Always
        consult a licensed healthcare professional before making any medical
        decision. In an emergency, call 911 or go to your nearest emergency room
        immediately.
      </p>
    ),
  },
  {
    title: "Provider Listings",
    content: (
      <p>
        Provider listings reflect independently verified logistics data — name,
        address, availability status, and provider type. Provider availability
        may change without notice. Live Now Recovery does not guarantee that a
        listed provider will be available, accepting new patients, or able to
        provide the services you need at any given time. Always call a provider
        before traveling to confirm availability.
      </p>
    ),
  },
  {
    title: "No Liability",
    content: (
      <p>
        Live Now Recovery is not liable for any outcome, harm, loss, or damage
        related to treatment accessed, declined, or sought via this platform. We
        are a directory service. Outcomes are determined by the clinical
        decisions of licensed healthcare providers, not by this platform. To the
        maximum extent permitted by applicable law, we disclaim all warranties,
        express or implied.
      </p>
    ),
  },
  {
    title: "Provider Responsibilities",
    content: (
      <>
        <p>
          Providers who list their services on Live Now Recovery agree that:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>All listed information is accurate and kept current.</li>
          <li>
            Availability status accurately reflects actual operational status.
          </li>
          <li>
            They hold all required licenses and certifications to provide the
            services listed.
          </li>
          <li>
            They will not use the platform to submit false or misleading
            information.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "User Responsibilities",
    content: (
      <>
        <p>By using this platform, you agree that you will not:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Submit false, fraudulent, or misleading information.</li>
          <li>Use the platform for any unlawful purpose.</li>
          <li>
            Attempt to disrupt, damage, or gain unauthorized access to the
            platform or its systems.
          </li>
          <li>
            Collect or harvest personal data about other users or providers.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Minors",
    content: (
      <p>
        This platform is intended for use by adults aged 18 and older. If you
        are under 18, a parent or legal guardian should assist you in using this
        platform. If you are experiencing a crisis and are under 18, please call
        the Crisis Line at{" "}
        <a
          href="tel:8332346343"
          className="text-[oklch(0.62_0.17_155)] hover:underline"
        >
          833-234-6343
        </a>{" "}
        or go to your nearest emergency room.
      </p>
    ),
  },
  {
    title: "Governing Law",
    content: (
      <p>
        These Terms of Service are governed by and construed in accordance with
        the laws of the State of Ohio, United States of America, without regard
        to its conflict of law provisions. Any disputes arising under these
        terms shall be resolved in the courts of Ohio.
      </p>
    ),
  },
  {
    title: "Changes to These Terms",
    content: (
      <p>
        We reserve the right to modify these Terms of Service at any time. The
        effective date at the top of this page will be updated when changes are
        made. Continued use of the platform after changes are posted constitutes
        your acceptance of the revised terms.
      </p>
    ),
  },
];
