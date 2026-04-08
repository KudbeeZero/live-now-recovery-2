import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "What is MAT (Medication-Assisted Treatment)?",
    a: "MAT combines FDA-approved medications — buprenorphine, methadone, or naltrexone — with counseling and support to treat opioid use disorder. It is the clinical standard of care. MAT reduces overdose deaths, lowers illicit drug use, and improves long-term recovery outcomes significantly better than abstinence-only approaches.",
  },
  {
    q: "Is my information stored when I use this app?",
    a: "No. Live Now Recovery follows a strict No-PHI (No Protected Health Information) policy. Patients never create accounts or log in. Searching for a provider, using the map, or clicking a hotline number leaves no trace. The platform only stores provider logistics data: clinic name, location, and live status. Your identity is never involved.",
  },
  {
    q: 'What does "Live Now" mean on a provider card?',
    a: 'A "Live Now" status means the provider has actively confirmed availability within the last 4 hours. The 4-Hour Decay Rule automatically resets a provider to Unknown status if they have not confirmed in 4 hours. Green = confirmed right now. Amber = unverified. Gray = offline.',
  },
  {
    q: "How do providers mark themselves as available?",
    a: 'Providers log in with Internet Identity and go to their Dashboard. There is a single "Go Live" toggle. When toggled on, the system records a verification timestamp. Their pin turns green on the map immediately. The status decays automatically after 4 hours.',
  },
  {
    q: "What is the 4-hour decay rule?",
    a: "The 4-hour decay rule is a hard architectural rule in the backend canister. Any provider whose last verification timestamp is more than 4 hours old automatically has their isLive status set to false. This prevents stale data from appearing as active.",
  },
  {
    q: "What is the Cost Plus Drugs pricing card?",
    a: "Every provider page displays a transparent pricing comparison for buprenorphine/naloxone (generic Suboxone). At most retail pharmacies, a 30-day supply costs approximately $185. At Mark Cuban Cost Plus Drugs (NCPDP 5755167), the same medication costs $45.37. Any prescriber can call in a prescription there.",
  },
  {
    q: "Does this app replace my doctor or treatment provider?",
    a: "No. Live Now Recovery is a discovery and navigation tool — not a clinical service. It helps you find a provider who is available right now. All clinical decisions, prescriptions, and treatment plans are made by licensed providers in person.",
  },
  {
    q: "What is a Warm Handoff?",
    a: "A Warm Handoff is a direct, personal connection between a peer recovery specialist and a treatment provider. In this platform, the Proof of Presence (PoP) system supports warm handoffs by generating one-time QR codes that peer specialists use to verify they physically brought someone to a provider location, triggering an anonymous presence count. No PHI is ever recorded.",
  },
  {
    q: "How do I find a provider near me?",
    a: 'On the home page, type your ZIP code in the search bar or tap "Near Me" to use your device location. The map shows active providers. Green pins are live now. Tap any pin or card to see details — phone number, address, live status, and the cost transparency card.',
  },
  {
    q: "What is Buprenorphine and how does it work?",
    a: "Buprenorphine is a partial opioid agonist — it activates opioid receptors enough to reduce withdrawal and cravings without producing a significant high at therapeutic doses. It has a ceiling effect that limits overdose risk. Prescribed in office-based settings and can be taken at home — no daily clinic visits required.",
  },
  {
    q: "Is there a cost to use Live Now Recovery?",
    a: "No. Live Now Recovery is free for patients, peer specialists, and community members. It is built on the Internet Computer Protocol (ICP), which uses a decentralized compute model. Provider registration is also free. There are no ads, no subscriptions, and no data sold.",
  },
  {
    q: "What is Internet Identity and why is it used for providers?",
    a: "Internet Identity is a privacy-preserving authentication system built into the Internet Computer Protocol. It lets providers and admins log in without a username or password — using a device passkey instead. No email address or personal identifiers are stored. Strong authentication, no centralized credential database.",
  },
  {
    q: "What happens after hours or on weekends?",
    a: "The Emergency Banner activates automatically after 5 PM ET on weekdays and all day on weekends — when most MAT clinics are closed and overdose risk is highest. It displays the Ohio Crisis Line prominently. Providers offering bridge treatments or after-hours emergency intake can remain active regardless.",
  },
  {
    q: "How does the Emergency Banner work?",
    a: "The Emergency Banner is a full-width bar at the top of every page that displays only during high-risk time windows (after 5 PM ET or weekends). It is never hidden or dismissed by users. It is the only element on the platform that uses red — consistent with emergency signal design. All other risk indicators use amber or green.",
  },
  {
    q: "How can I volunteer as a Peer Support Helper?",
    a: "Go to the Helper Guide page (/helper) to learn about the Peer Support role. Helpers generate Proof of Presence QR codes in the field, helping to document real-time provider availability and warm handoff activity anonymously. No clinical background is required — lived experience is the credential.",
  },
];

export function FAQPage() {
  return (
    <main className="min-h-screen" data-ocid="faq.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-5 h-5 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              Answers
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Frequently Asked <span className="text-live-green">Questions</span>
          </h1>
          <p className="text-on-dark text-lg">
            How Live Now Recovery works, what MAT is, and how your privacy is
            protected.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="bg-card border border-border rounded-xl px-5 shadow-card"
              data-ocid={`faq.item.${i + 1}`}
            >
              <AccordionTrigger className="text-left text-foreground font-semibold text-sm hover:no-underline min-h-[44px] py-4">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  );
}
