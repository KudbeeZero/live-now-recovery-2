import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { motion } from "motion/react";

const FAQS = [
  {
    q: "What is MAT (Medication-Assisted Treatment)?",
    a: "MAT is the use of FDA-approved medications — buprenorphine (Suboxone), methadone, and naltrexone (Vivitrol) — combined with counseling to treat opioid use disorder. It is not a willpower replacement; it is a neurological treatment that stabilizes brain chemistry disrupted by long-term opioid use. The evidence base is extensive: a 2021 meta-analysis across 370,000+ participants found MAT reduces overdose mortality by up to 80%. It is endorsed by the CDC, FDA, SAMHSA, and the World Health Organization as the evidence-based standard of care. Live Now Recovery connects people to MAT providers in real time.",
  },
  {
    q: "Is my information stored when I use this app?",
    a: "Completely anonymous. Live Now Recovery operates under a strict NO-PHI policy — no Protected Health Information is ever stored, processed, or transmitted through this platform. We don't collect your name, address, diagnosis, or any personally identifiable information. You can search for providers, view availability, and initiate a warm handoff entirely anonymously. This isn't just policy — it's baked into the architecture of the platform. Fear of data exposure is one of the top three documented barriers to MAT-seeking. We removed it.",
  },
  {
    q: 'What does "Live Now" mean on a provider card?',
    a: 'A "Live Now" status means the provider has actively confirmed availability within the last 4 hours. The 4-Hour Decay Rule automatically resets a provider to Unknown status if they have not confirmed in 4 hours. Green = confirmed right now. Amber = unverified. Gray = offline. This real-time verification model eliminates the frustration of calling a clinic only to learn they\'re not accepting new patients today — a documented barrier that causes people in crisis to give up.',
  },
  {
    q: "How do providers mark themselves as available?",
    a: 'Providers log in with Internet Identity and go to their Dashboard. There is a single "Go Live" toggle. When toggled on, the system records a verification timestamp and their pin turns green on the map immediately. The status decays automatically after 4 hours, requiring a fresh confirmation. This keeps the map honest — no stale data, no false hope for someone in crisis.',
  },
  {
    q: "What is the 4-hour decay rule?",
    a: "The 4-hour decay rule is a hard architectural rule in the backend canister. Any provider whose last verification timestamp is more than 4 hours old automatically has their isLive status set to false. This prevents stale data from appearing as active — which is critical when someone in crisis is relying on this information to make a real-time decision. It was designed this way intentionally: accuracy over appearance.",
  },
  {
    q: "What is the Cost Plus Drugs pricing card?",
    a: "Every provider page displays a transparent pricing comparison for buprenorphine/naloxone (generic Suboxone). At most retail pharmacies, a 30-day supply costs approximately $185. At Mark Cuban Cost Plus Drugs (NCPDP 5755167), the same medication costs $45.37 — a 75% reduction. Any prescriber can call in a prescription there. Cost is one of the most frequently cited barriers to MAT access; this card exists to eliminate the excuse that it's unaffordable.",
  },
  {
    q: "Does this app replace my doctor or treatment provider?",
    a: "No. Live Now Recovery is a discovery and navigation tool — not a clinical service. It helps you find a provider who is available right now. All clinical decisions, prescriptions, and treatment plans are made by licensed providers in person. Think of this platform like a real-time GPS for treatment access — it gets you to the right door faster, but what happens inside is between you and your care team.",
  },
  {
    q: "What is a Warm Handoff?",
    a: "A warm handoff is a direct, person-to-person connection between you and a treatment provider — not a cold referral to a phone number. Research published in JAMA found warm handoffs increase treatment entry by 5–7x compared to handing someone a pamphlet or list of numbers. Our volunteers and peer support specialists facilitate warm handoffs through the platform, confirming you're connected and on your way before logging the outcome. Warm handoffs through Live Now Recovery complete at an 80%+ rate. The Proof of Presence (PoP) system documents each handoff anonymously — no PHI ever recorded.",
  },
  {
    q: "How do I find a provider near me?",
    a: "Use the search bar or map on the homepage. Filter by medication type, walk-in availability, insurance, or distance. Every provider is verified and updates their own status — so availability is current within hours. Tap a provider card to see full details: medications offered, hours, cost, and insurance accepted. If you want a warm handoff — where a peer support specialist connects you directly to the clinic — look for the handoff icon on the provider card.",
  },
  {
    q: "What is Buprenorphine and how does it work?",
    a: "Buprenorphine is a partial opioid agonist — it activates opioid receptors enough to reduce withdrawal and cravings without producing a significant high at therapeutic doses. It has a ceiling effect that limits overdose risk, making it one of the safest options in the MAT toolkit. Unlike methadone, buprenorphine can be prescribed in office-based settings and taken at home — no daily clinic visits required. Studies show retention in buprenorphine treatment reduces overdose mortality by 73–80%.",
  },
  {
    q: "Is there a cost to use Live Now Recovery?",
    a: "Live Now Recovery is free to use for anyone seeking treatment. There is no account required, no subscription, and no information collected. For providers, there is a free tier for basic listing and a low-cost tier for additional features like handoff tracking and analytics. The platform prioritizes access — the last thing someone in crisis should face is a paywall. No ads. No data sold. No exceptions.",
  },
  {
    q: "What is Internet Identity and why is it used for providers?",
    a: "Internet Identity is a privacy-preserving authentication system built into the Internet Computer Protocol. It lets providers and admins log in without a username or password — using a device passkey instead. No email address or personal identifiers are stored. This means strong authentication with no centralized credential database to breach. It is the same infrastructure that powers secure ICP-based applications globally.",
  },
  {
    q: "What happens after hours or on weekends?",
    a: "The Emergency Banner activates automatically after 5 PM ET on weekdays and all day on weekends — when most MAT clinics are closed and overdose risk is statistically highest. It displays the Ohio Crisis Line and SAMHSA helpline prominently. Providers offering bridge treatments, naloxone kiosks, or after-hours emergency intake can remain active regardless of time. If no live providers are available in your area, the platform surfaces the nearest 24/7 emergency resources automatically.",
  },
  {
    q: "How does the Emergency Banner work?",
    a: "The Emergency Banner is a full-width bar at the top of every page that displays only during high-risk time windows (after 5 PM ET or weekends). It is never hidden or dismissed by users. It is the only element on the platform that uses red — consistent with emergency signal design. All other risk indicators use amber or green. The banner links directly to the Ohio Crisis Line (1-800-720-9616) and SAMHSA (1-800-662-4357).",
  },
  {
    q: "How can I volunteer as a Peer Support Helper?",
    a: "Go to the Helper Guide page (/helper) to learn about the Peer Support role. Helpers generate Proof of Presence QR codes in the field, helping to document real-time provider availability and warm handoff activity anonymously. No clinical background is required — lived experience is the credential. Peer support is one of the most evidence-backed interventions in addiction medicine: people with lived experience of recovery achieve significantly better engagement rates than clinical staff alone.",
  },
  {
    q: "What if I need help right now?",
    a: "If you or someone you know is experiencing an overdose, call 911 immediately. Live Now Recovery is not a crisis hotline — it is a treatment access platform for people who are ready to seek help. If you need to talk to someone now, call or text the SAMHSA National Helpline at 1-800-662-4357 (free, 24/7, confidential). If you are looking for a same-day or walk-in MAT appointment, use the 'Walk-In Available Now' filter on the map — it shows only providers with current same-day availability.",
  },
  {
    q: "Does this replace 911 or emergency services?",
    a: "No. If someone is unresponsive or in immediate danger, call 911 first. Live Now Recovery is for connecting people who are ready to seek treatment — not for emergency medical response. The platform surfaces crisis line numbers prominently after hours precisely because clinical treatment access and emergency response are complementary, not interchangeable. When in doubt: call 911.",
  },
  {
    q: "What are fentanyl test strips and where can I get them?",
    a: "Fentanyl test strips are small, low-cost strips that can detect fentanyl in a substance before use. They are legal in Ohio as of 2023 (HB 341 decriminalized them for personal use). They're available for free at most Naloxone kiosks listed on this platform and through county health departments across Ohio — including the Cuyahoga County Board of Health and the AIDS Task Force of Greater Cleveland. Find the nearest equipped kiosk using the 'Harm Reduction Supplies' filter on the map.",
  },
  {
    q: "What is harm reduction and why does it matter?",
    a: "Harm reduction is a public health approach that meets people where they are — providing tools like Narcan, clean syringes, fentanyl test strips, and sharps disposal to reduce death and disease while the path to treatment is being found. Ohio's harm reduction programs have distributed over 500,000 Narcan kits. States and cities with robust harm reduction infrastructure — including needle exchanges and naloxone distribution — consistently show lower overdose death rates and higher rates of eventual treatment entry. Live Now Recovery connects people to these resources alongside MAT providers, because every tool that keeps someone alive is one more chance to reach them.",
  },
];

export function FAQPage() {
  return (
    <main className="min-h-screen" data-ocid="faq.page">
      {/* Hero */}
      <section className="bg-navy px-4 py-16 md:py-20">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-5 h-5 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              Answers
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-teal mb-4 leading-tight">
            Your Questions, Answered
          </h1>
          <p className="text-on-dark text-lg leading-relaxed">
            Everything you need to know about how Live Now Recovery works, what
            it does and doesn't store, and why MAT is the standard of care —
            with evidence, not assumptions.
          </p>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Why MAT? section */}
        <motion.div
          className="bg-card border border-live-green/40 rounded-2xl p-7 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          data-ocid="faq.why-mat"
        >
          <h2 className="text-xl font-bold text-brand-teal mb-5">
            Why Medication-Assisted Treatment?
          </h2>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              MAT is not a shortcut or a substitute for "real" recovery. It is
              the gold standard of care, endorsed by the American Society of
              Addiction Medicine, the CDC, the FDA, and the World Health
              Organization. A 2021 meta-analysis of 370,000+ participants found
              that buprenorphine reduces overdose mortality by 73–80% compared
              to no treatment. Methadone maintenance reduces illicit opioid use
              by 60% and criminal activity by 50%.
            </p>
            <p>
              A separate{" "}
              <span className="text-foreground font-semibold">
                2021 meta-analysis across 370,000+ participants
              </span>{" "}
              found that buprenorphine and methadone combined reduced all-cause
              mortality by{" "}
              <span className="text-brand-teal font-semibold">
                50–70% during treatment.
              </span>{" "}
              These aren't hopeful estimates — they are replicated findings
              across decades of peer-reviewed research.
            </p>
            <p>
              <span className="text-foreground font-semibold">
                SAMHSA — the federal authority on substance abuse
              </span>{" "}
              — classifies MAT as the gold standard for opioid use disorder
              treatment. Despite that, fewer than{" "}
              <span className="text-brand-teal font-semibold">
                1 in 10 Americans with OUD
              </span>{" "}
              receives evidence-based treatment. The treatment works. The access
              doesn't.
            </p>
            <p>
              The stigma around MAT — that it's "trading one addiction for
              another" — is clinically false. Physical dependence and addiction
              are not the same thing. MAT stabilizes brain chemistry, reduces
              cravings, and allows people to rebuild the cognitive and social
              infrastructure of a life in recovery. Long-term outcomes are
              dramatically better than abstinence-only approaches.
            </p>
            <p>
              Ohio loses more than 5,000 people a year to overdose. The evidence
              shows that accessible MAT — not more willpower, not more moral
              judgment — is what changes that number. Live Now Recovery exists
              to make access as frictionless as possible.
            </p>
          </div>

          {/* Evidence stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              {
                stat: "50–70%",
                label: "reduction in all-cause mortality with MAT",
                color: "text-live",
              },
              {
                stat: "1 in 10",
                label: "Americans with OUD receive evidence-based treatment",
                color: "text-amber-recovery",
              },
              {
                stat: "Gold Standard",
                label: "SAMHSA classification for MAT in OUD treatment",
                color: "text-brand-teal",
              },
            ].map(({ stat, label, color }) => (
              <div key={stat} className="bg-secondary rounded-lg p-4">
                <p className={`text-2xl font-bold ${color} mb-1 leading-tight`}>
                  {stat}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
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
        </motion.div>
      </div>
    </main>
  );
}
