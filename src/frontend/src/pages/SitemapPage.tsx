import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

const sections = [
  {
    title: "Platform",
    links: [
      { to: "/", label: "Home" },
      { to: "/dashboard", label: "Recovery Intelligence Dashboard" },
      { to: "/videos", label: "Video Library" },
      { to: "/verify", label: "Verify Handoff" },
      { to: "/register", label: "Register as Provider" },
      { to: "/admin", label: "Admin Panel" },
      { to: "/national-impact", label: "National Impact" },
    ],
  },
  {
    title: "Community",
    links: [
      { to: "/citizens", label: "Citizens Hub" },
      { to: "/helper", label: "Be a Helper" },
      { to: "/my-recovery", label: "My Recovery Account" },
      { to: "/signup", label: "Sign Up" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/resources", label: "Ohio Resources" },
      { to: "/faq", label: "FAQ" },
      { to: "/how-it-works", label: "How It Works" },
      { to: "/ohio-stats", label: "Ohio Stats" },
      { to: "/blog", label: "Blog" },
      { to: "/integration", label: "Sentinel AI Integration" },
    ],
  },
  {
    title: "About",
    links: [
      { to: "/mission", label: "Our Mission" },
      { to: "/about", label: "About Us" },
      { to: "/founder", label: "Our Founder" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
      { to: "/cookies", label: "Cookie Policy" },
    ],
  },
  {
    title: "Ohio Cities",
    links: [
      { to: "/cleveland", label: "Cleveland" },
      { to: "/lakewood", label: "Lakewood" },
      { to: "/parma", label: "Parma" },
      { to: "/lorain", label: "Lorain" },
      { to: "/akron", label: "Akron" },
      { to: "/youngstown", label: "Youngstown" },
      { to: "/canton", label: "Canton" },
      { to: "/elyria", label: "Elyria" },
      { to: "/mentor", label: "Mentor" },
      { to: "/strongsville", label: "Strongsville" },
      { to: "/euclid", label: "Euclid" },
      { to: "/sandusky", label: "Sandusky" },
      { to: "/warren", label: "Warren" },
      { to: "/toledo", label: "Toledo" },
      { to: "/medina", label: "Medina" },
    ],
  },
];

export function SitemapPage() {
  return (
    <main className="min-h-screen" data-ocid="sitemap.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="w-4 h-4 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              Navigation
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Site <span className="text-live-green">Map</span>
          </h1>
          <p className="text-on-dark text-lg">
            Every page in the Live Now Recovery platform.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-10">
          {sections.map((section) => (
            <section key={section.title} data-ocid="sitemap.section">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">
                {section.title}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {section.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-white/5 flex items-center gap-1.5"
                    data-ocid="sitemap.link"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
