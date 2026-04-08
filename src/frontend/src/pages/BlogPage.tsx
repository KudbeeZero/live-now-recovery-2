import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, FileText, Rss } from "lucide-react";
import { useEffect, useState } from "react";

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
    slug: "cost-plus-drugs-suboxone",
    title: "How Mark Cuban's Cost Plus Drugs Saves $139/Month on Suboxone",
    excerpt:
      "Generic buprenorphine/naloxone 8mg/2mg costs $185 at retail. At Cost Plus Drugs it's $45.37. We explain how to transfer your prescription and save every month.",
    date: "February 28, 2026",
    category: "Cost Transparency",
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
      "A $185/month medication becomes $45 with the right pharmacy. Most patients are never told. The information gap is a financial barrier to recovery — and it's solvable.",
    date: "November 2, 2025",
    category: "Cost Transparency",
  },
  {
    slug: "peer-support-specialists",
    title: "Peer Support Specialists: The Bridge Between Crisis and Care",
    excerpt:
      "Peer specialists have the trust and community presence that clinical systems often lack. Here's how they work, what they do, and how Live Now Recovery is built around their role.",
    date: "October 15, 2025",
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
    <main className="min-h-screen bg-background" data-ocid="blog.page">
      {/* Dark hero header — explicit bg-navy on both wrapper and section to prevent bleed-through */}
      <div className="bg-navy w-full">
        <section className="bg-navy px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Rss className="w-4 h-4 text-live-green" />
              <p className="text-xs font-bold uppercase tracking-widest text-live-green">
                Latest
              </p>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Recovery <span className="text-live-green">Blog</span>
            </h1>
            <p className="text-white/70 text-lg">
              Recovery, access, and technology in NE Ohio.
            </p>
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
  );
}
