export function AboutPage() {
  return (
    <main className="min-h-screen py-16 px-4" data-ocid="about.page">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-navy mb-2">About</h1>
        <div className="h-1 w-16 bg-cplus-teal rounded-full mb-10" />

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
