import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, FileText, Rss } from "lucide-react";
import { useEffect, useState } from "react";
import { SEO } from "../components/SEO";

export const BLOG_POSTS = [
  {
    slug: "mat-access-ohio",
    title: "Breaking Barriers: MAT Access in Ohio Region 13",
    excerpt:
      "Ohio Region 13 faces a critical shortage of buprenorphine providers. Here's what the data shows — and what Live Now Recovery is doing about it.",
    date: "March 15, 2026",
    category: "Access & Policy",
  },

  {
    slug: "peer-recovery-proof-of-presence",
    title:
      "Proof of Presence: How Peer Specialists Are Changing the Recovery Map",
    excerpt:
      "Anonymous QR codes, ZIP-level presence counts, no PHI. Peer specialists across NE Ohio are using PoP to make the invisible visible.",
    date: "January 20, 2026",
    category: "Peer Recovery",
  },
  {
    slug: "buprenorphine-vs-methadone",
    title: "Buprenorphine vs. Methadone: What the Science Says",
    excerpt:
      "Both are gold-standard MAT options. But they work differently, fit different patients, and carry different logistics. Here's the clinical breakdown without the jargon.",
    date: "March 22, 2026",
    category: "Clinical",
  },
  {
    slug: "naloxone-access-ohio",
    title: "Naloxone Access in Ohio: A ZIP Code Guide",
    excerpt:
      "Ohio's statewide standing order means any pharmacy can dispense Narcan without a prescription. But access is uneven. We mapped where the gaps are.",
    date: "March 10, 2026",
    category: "Access & Policy",
  },
  {
    slug: "stigma-killing-people",
    title: "The Stigma Is Killing People: A Data-Driven Argument for MAT",
    excerpt:
      "The science is unambiguous. MAT works. The barrier isn't clinical — it's cultural. Here's the evidence that should end the debate.",
    date: "February 14, 2026",
    category: "Advocacy",
  },
  {
    slug: "fentanyl-third-wave",
    title: "Fentanyl and the Third Wave: Ohio's Overdose Crisis Explained",
    excerpt:
      "Ohio went from prescription pills to heroin to fentanyl in a decade. Understanding the third wave is essential to understanding why MAT access is a life-or-death infrastructure problem.",
    date: "January 30, 2026",
    category: "Access & Policy",
  },
  {
    slug: "warm-handoff-saves-lives",
    title: "What Is a Warm Handoff and Why Does It Save Lives?",
    excerpt:
      "A phone number is not a referral. A warm handoff is a human connection — and the data shows it dramatically increases treatment uptake. Here's what it looks like in practice.",
    date: "January 10, 2026",
    category: "Peer Recovery",
  },
  {
    slug: "recovery-housing-ohio",
    title: "Recovery Housing in Northeast Ohio: What to Know",
    excerpt:
      "MAT alone isn't enough if someone has nowhere safe to go. A guide to recovery housing options in NE Ohio, what they cost, and how to access them without losing MAT coverage.",
    date: "December 20, 2025",
    category: "Access & Policy",
  },
  {
    slug: "samhsa-guidelines-mat",
    title: "SAMHSA Guidelines on MAT: What They Mean for You",
    excerpt:
      "SAMHSA's updated MAT guidelines removed the X-waiver requirement in 2023. Here's what that means for provider access and why it matters for patients in Ohio.",
    date: "December 5, 2025",
    category: "Clinical",
  },
  {
    slug: "anonymous-technology-privacy",
    title: "How Anonymous Technology Protects People Seeking Help",
    excerpt:
      "Surveillance fear is real and rational. We explain the technical architecture of Live Now Recovery — why no account means no trace, and why that design choice is a clinical decision.",
    date: "November 18, 2025",
    category: "Technology",
  },
  {
    slug: "economics-of-addiction",
    title: "The Economics of Addiction: Why Cost Transparency Matters",
    excerpt:
      "The economic case for expanding MAT access is overwhelming. Every dollar invested in treatment returns $4–$7 in reduced crime, healthcare costs, and lost productivity. The information gap is solvable.",
    date: "November 2, 2025",
    category: "Access & Policy",
  },
  {
    slug: "peer-support-specialists",
    title: "Peer Support Specialists: The Bridge Between Crisis and Care",
    excerpt:
      "Peer specialists have the trust and community presence that clinical systems often lack. Here's how they work, what they do, and how Live Now Recovery is built around their role.",
    date: "October 15, 2025",
    category: "Peer Recovery",
  },
  {
    slug: "er-72-hour-bridge",
    title: "The 72-Hour Bridge: What Ohio ERs Can Do Right Now",
    excerpt:
      "Federal law allows emergency physicians to prescribe buprenorphine for up to 72 hours without a DEA waiver. Here is what that means for someone in crisis tonight.",
    date: "2025-09-15",
    category: "Clinical",
  },
  {
    slug: "volunteer-warm-handoff",
    title:
      "What It Means to Be a Recovery Volunteer: The Warm Handoff Explained",
    excerpt:
      "A warm handoff is not a referral — it is a human hand between crisis and care. Here is what volunteers actually do and why it works.",
    date: "2025-10-01",
    category: "Peer Recovery",
  },
];

export function BlogPage() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <SEO
        title="Recovery Blog | MAT Research, Harm Reduction, Opioid Crisis Insights | Live Now Recovery"
        description="Research-backed articles on MAT effectiveness, Narcan distribution, warm handoffs, fentanyl policy, and recovery housing. Updated regularly with Ohio and national data."
        keywords="MAT research blog, opioid crisis Ohio, harm reduction articles, medication-assisted treatment evidence, Narcan Ohio, warm handoff"
        canonical="/blog"
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Live Now Recovery Blog",
            description:
              "Evidence-based articles on MAT, harm reduction, and recovery infrastructure in Ohio.",
            url: "https://livenowrecovery.org/blog",
            publisher: {
              "@type": "Organization",
              name: "Live Now Recovery",
              url: "https://livenowrecovery.org",
            },
          }),
        }}
      />
      <main className="min-h-screen bg-background" data-ocid="blog.page">
        {/* Hero */}
        <div className="w-full">
          <section
            className="relative overflow-hidden px-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.12 0.04 210) 0%, oklch(0.16 0.06 195) 50%, oklch(0.11 0.03 240) 100%)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 60% 40%, oklch(0.62 0.12 218 / 0.08) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10 max-w-3xl mx-auto py-20 md:py-28">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 mb-6">
                <Rss className="w-3.5 h-3.5 text-teal-300" />
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest">
                  Latest
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                <span className="text-foreground">Recovery </span>
                <span className="text-brand-teal">Blog</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl leading-relaxed">
                Knowledge is the first step to recovery. Evidence-based writing
                on MAT, harm reduction, Ohio access, and what actually works.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "Access & Policy",
                    color: "bg-teal-500/10 text-teal-300 border-teal-500/30",
                  },
                  {
                    label: "Clinical",
                    color: "bg-blue-500/10 text-blue-300 border-blue-500/30",
                  },
                  {
                    label: "Peer Recovery",
                    color:
                      "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                  },
                  {
                    label: "Advocacy",
                    color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
                  },
                  {
                    label: "Technology",
                    color:
                      "bg-purple-500/10 text-purple-300 border-purple-500/30",
                  },
                ].map((cat) => (
                  <span
                    key={cat.label}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${cat.color}`}
                  >
                    {cat.label}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          {!loaded ? (
            <div className="space-y-5" data-ocid="blog.loading_state">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border p-6 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : BLOG_POSTS.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-64 rounded-xl bg-card border border-border"
              data-ocid="blog.empty_state"
            >
              <FileText className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">
                No posts yet — check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-5" data-ocid="blog.list">
              {BLOG_POSTS.map((post, i) => (
                <article
                  key={post.slug}
                  className="bg-card rounded-xl shadow-card border border-border p-6 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                  data-ocid={`blog.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs hover:bg-primary/10">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                    data-ocid="blog.link"
                  >
                    Read more <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
