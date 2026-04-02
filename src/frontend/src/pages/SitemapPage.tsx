import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

const sections = [
  {
    title: "Platform",
    links: [
      { to: "/", label: "Home" },
      { to: "/helper", label: "Helper Guide" },
      { to: "/verify", label: "Verify Handoff" },
      { to: "/register", label: "Register as Provider" },
      { to: "/signup", label: "Sign Up" },
      { to: "/admin", label: "Admin Panel" },
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
    <main className="min-h-screen py-16 px-4" data-ocid="sitemap.page">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Navigation
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Site Map
          </h1>
          <p className="text-muted-foreground text-lg">
            Every page in the Live Now Recovery platform.
          </p>
        </div>

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
