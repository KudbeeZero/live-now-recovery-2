export function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[oklch(0.14_0.018_225)] border-b border-border py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[oklch(0.62_0.17_155)] mb-2">
            Privacy Policy
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
          Questions about this policy?{" "}
          <a
            href="mailto:privacy@livenowrecovery.org"
            className="text-[oklch(0.62_0.17_155)] hover:underline"
          >
            privacy@livenowrecovery.org
          </a>
        </p>
      </div>
    </div>
  );
}

const sections = [
  {
    title: "Our Commitment to Privacy",
    content: (
      <p>
        Live Now Recovery is a real-time provider availability directory for
        Medication-Assisted Treatment (MAT) resources in Ohio. We were built
        from the ground up with a strict{" "}
        <strong className="text-foreground">NO-PHI policy</strong> — we do not
        collect, store, process, or transmit any Protected Health Information.
        Period.
      </p>
    ),
  },
  {
    title: "What We Collect",
    content: (
      <>
        <p>
          We collect only the minimum data required to operate the platform:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong className="text-foreground">
              ZIP codes and anonymous timestamps
            </strong>{" "}
            — when you search for providers, we log your ZIP code and the time
            of the request for aggregate analytics. No name, no device ID, no IP
            address is stored.
          </li>
          <li>
            <strong className="text-foreground">Provider logistics data</strong>{" "}
            — provider name, address, phone number, hours of operation, and
            availability status. This is operational data only — no treatment
            records, no patient lists.
          </li>
          <li>
            <strong className="text-foreground">Volunteer sign-up data</strong>{" "}
            — if you choose to sign up as a helper, we collect your first name,
            last name, email, ZIP, and your area of volunteer interest. This is
            stored securely and never shared with third parties.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "NO-PHI Guarantee",
    content: (
      <>
        <p>
          We are{" "}
          <strong className="text-foreground">
            not a covered entity under HIPAA
          </strong>
          . We do not provide healthcare services, process insurance claims, or
          maintain medical records of any kind.
        </p>
        <p className="mt-2">
          Patients never authenticate on this platform. Treatment-seeking is
          fully anonymous. We cannot link a search to a person, and we have
          designed the system so that is impossible by construction.
        </p>
      </>
    ),
  },
  {
    title: "Analytics",
    content: (
      <p>
        We use anonymous, aggregate analytics to understand how the platform is
        used and where treatment access gaps exist. We do not use tracking
        cookies, advertising pixels, Google Analytics, Meta Pixel, or any
        third-party analytics SDK. All analytics are derived from anonymized
        aggregate data stored in our own canister.
      </p>
    ),
  },
  {
    title: "Third-Party Links",
    content: (
      <p>
        This platform includes links to third-party services, including Cost
        Plus Drugs (costplusdrugs.com) for medication pricing transparency. When
        you follow a link to a third-party site, you leave the Live Now Recovery
        platform and that site's own privacy policy applies. We encourage you to
        review the privacy policies of any site you visit.
      </p>
    ),
  },
  {
    title: "Data Retention",
    content: (
      <p>
        Anonymous search logs (ZIP code + timestamp) are automatically purged
        after <strong className="text-foreground">30 days</strong>. Provider
        logistics data is retained for as long as the provider is active on the
        platform. Volunteer sign-up data is retained until a volunteer requests
        removal.
      </p>
    ),
  },
  {
    title: "Your Rights",
    content: (
      <p>
        If you have signed up as a volunteer helper and wish to have your
        information removed, contact us at{" "}
        <a
          href="mailto:privacy@livenowrecovery.org"
          className="text-[oklch(0.62_0.17_155)] hover:underline"
        >
          privacy@livenowrecovery.org
        </a>
        . We will process your request within 30 days. Because patient searches
        are fully anonymous, there is no personal data to delete for
        treatment-seeking users.
      </p>
    ),
  },
  {
    title: "Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. The effective date
        at the top of this page will be updated when changes are made. We
        encourage you to review this policy periodically.
      </p>
    ),
  },
];
