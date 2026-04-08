import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="bg-[oklch(0.10_0.008_240)] border-t border-border"
      data-ocid="footer.panel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-lg text-foreground">
                Live Now Recovery
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Real-time, privacy-first MAT provider availability for Ohio Region
              13. Zero PHI. Always anonymous.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Crisis Line:{" "}
              <a href="tel:8332346343" className="hover:underline text-primary">
                833-234-6343
              </a>
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-primary">
              Platform
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Live Map" },
                { to: "/verify", label: "Verify Handoff" },
                { to: "/helper", label: "Helper Guide" },
                { to: "/admin", label: "Admin" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm transition-colors hover:text-foreground text-muted-foreground"
                    data-ocid="footer.link"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-primary">
              Resources
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/resources", label: "Ohio Resources" },
                { to: "/faq", label: "FAQ" },
                { to: "/how-it-works", label: "How It Works" },
                { to: "/ohio-stats", label: "Ohio Stats" },
                { to: "/blog", label: "Blog" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm transition-colors hover:text-foreground text-muted-foreground"
                    data-ocid="footer.link"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-primary">
              About
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/mission", label: "Our Mission" },
                { to: "/about", label: "About" },
                { to: "/founder", label: "Founder" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm transition-colors hover:text-foreground text-muted-foreground"
                    data-ocid="footer.link"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            &copy; {year}. Built with{" "}
            <Heart
              className="inline w-3 h-3 text-primary"
              fill="currentColor"
            />{" "}
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-primary"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4">
            {[
              { href: "#", icon: SiX, label: "X (Twitter)" },
              {
                href: "#",
                icon: SiFacebook,
                label: "Facebook",
              },
              {
                href: "#",
                icon: SiInstagram,
                label: "Instagram",
              },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                aria-label={label}
                className="transition-colors hover:text-foreground text-muted-foreground"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
