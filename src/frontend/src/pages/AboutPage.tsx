export function AboutPage() {
  return (
    <main className="min-h-screen" data-ocid="about.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-live-green mb-3">
            About
          </p>
          <h1 className="text-4xl font-bold text-white mb-3">
            Built for <span className="text-live-green">NE Ohio</span>
          </h1>
          <p className="text-on-dark text-lg">
            Real-time MAT availability on the Internet Computer — privacy-first,
            no PHI, no cloud.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-card border border-border p-6">
            <h2 className="text-xl font-bold text-navy mb-3">
              The NE Ohio MAT Access Gap
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Northeast Ohio's Region 13 faces one of the most severe
              medication-assisted treatment access crises in the state.
              Buprenorphine-waivered providers are scarce, appointment wait
              times run weeks, and real-time availability is invisible to the
              people who need it most. Live Now Recovery was built to close that
              gap with technology.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-border p-6">
            <h2 className="text-xl font-bold text-navy mb-3">
              Region 13 Coverage
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We cover Cuyahoga, Lorain, Lake, Geauga, Medina, Summit, and
              surrounding counties — the full footprint of Ohio's Region 13
              behavioral health network. Every provider on the map has been
              verified to prescribe or administer buprenorphine, naltrexone, or
              methadone as part of a MAT protocol.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-border p-6">
            <h2 className="text-xl font-bold text-navy mb-3">
              Technology Choices
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Live Now Recovery runs entirely on the Internet Computer Protocol
              (ICP), a decentralized compute network developed by DFINITY. Smart
              contracts (canisters) written in Motoko handle all state. The
              frontend is a React/TypeScript single-page app served directly
              from the canister.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We chose ICP because it provides cryptographic guarantees about
              data integrity, serverless deployment with no cloud provider
              dependencies, and a trust model that eliminates centralized data
              breaches as a threat vector.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-border p-6">
            <h2 className="text-xl font-bold text-navy mb-3">
              Privacy Architecture
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The system was designed from day one around a strict no-PHI
              policy. Provider records store only logistics: ID, name,
              coordinates, live status, and verification timestamp. Patient
              interactions generate only anonymous ZIP-code presence counts. No
              user accounts for patients. No session tracking. No analytics.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
