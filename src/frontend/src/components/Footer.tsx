import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { SiFacebook, SiInstagram, SiX, SiYoutube } from "react-icons/si";

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 xl:col-span-1">
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
                { to: "/integration", label: "AI Integration" },
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

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 text-primary">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm transition-colors hover:text-foreground text-muted-foreground"
                  data-ocid="footer.link"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm transition-colors hover:text-foreground text-muted-foreground"
                  data-ocid="footer.link"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-sm transition-colors hover:text-foreground text-muted-foreground"
                  data-ocid="footer.link"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a
                  href="https://costplusdrugs.com/hipaa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:text-foreground text-muted-foreground"
                  data-ocid="footer.link"
                >
                  HIPAA Notice ↗
                </a>
              </li>
              <li>
                <a
                  href="https://costplusdrugs.com/privacy/california/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:text-foreground text-muted-foreground"
                  data-ocid="footer.link"
                >
                  CA Privacy ↗
                </a>
              </li>
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
              { icon: SiX, label: "X (Twitter)" },
              { icon: SiFacebook, label: "Facebook" },
              { icon: SiInstagram, label: "Instagram" },
              { icon: FaLinkedin, label: "LinkedIn" },
              { icon: SiYoutube, label: "YouTube" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="transition-colors text-muted-foreground hover:text-[oklch(0.62_0.17_155)] cursor-pointer bg-transparent border-0 p-0"
                data-ocid="footer.social"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
