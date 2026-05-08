import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  Heart,
  Loader2,
  Menu,
  Phone,
  Radio,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useGetRecoveryProfile } from "../hooks/useQueries";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const { data: recoveryProfile } = useGetRecoveryProfile();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/mission", label: "Mission" },
    { to: "/resources", label: "Resources" },
    { to: "/volunteers", label: "Volunteers" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/gallery", label: "Gallery" },
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "About" },
  ];

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await login();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again.";
      setLoginError(msg);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 bg-navy border-b border-border"
      data-ocid="nav.panel"
    >
      {/* ── LANDSCAPE MOBILE: compact bar — logo + phone only, no hamburger ── */}
      <div className="hidden landscape:flex md:landscape:hidden h-12 px-4">
        <div className="flex items-center justify-between h-full w-full">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.link"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            <span className="font-bold text-sm leading-tight">
              <span className="text-teal-light">Live Now</span>{" "}
              <span className="text-foreground">Recovery</span>
            </span>
          </Link>
          <a
            href="tel:833-234-6343"
            className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90"
            data-ocid="nav.button"
          >
            <Phone className="w-3 h-3" />
            833-234-6343
          </a>
        </div>
      </div>

      {/* ── PORTRAIT MOBILE + DESKTOP: full header ── */}
      <div className="landscape:hidden md:landscape:flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0"
            data-ocid="nav.link"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-base leading-tight">
              <span className="text-teal-light">Live Now</span>{" "}
              <span className="text-foreground">Recovery</span>
            </span>
          </Link>

          {/* Desktop nav — constrained so items never stretch on widescreen */}
          <nav
            className="hidden md:flex items-center gap-1 shrink-0"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium transition-colors min-h-[44px] inline-flex items-center px-3 rounded-md text-on-dark hover:text-white hover:bg-white/5"
                activeProps={{ className: "text-teal-light font-semibold" }}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/citizens"
              className="text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-md text-teal-light hover:text-white hover:bg-white/5"
              activeProps={{ className: "text-teal-light font-semibold" }}
              data-ocid="nav.link"
            >
              <Radio className="w-3.5 h-3.5" />
              Citizens Hub
            </Link>
            <Link
              to="/impact"
              className="text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-md text-on-dark hover:text-white hover:bg-white/5"
              activeProps={{ className: "text-teal-light font-semibold" }}
              data-ocid="nav.link"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Impact
            </Link>
            <Link
              to="/helper"
              className="text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-md text-on-dark hover:text-white hover:bg-white/5"
              data-ocid="nav.link"
            >
              <Users className="w-3.5 h-3.5" />
              Be a Helper
            </Link>
            {recoveryProfile && (
              <Link
                to="/my-recovery"
                className="text-sm font-medium transition-colors min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-md text-teal-light hover:text-white hover:bg-white/5"
                activeProps={{ className: "text-teal-light font-semibold" }}
                data-ocid="nav.link"
              >
                <Heart className="w-3.5 h-3.5" />
                My Recovery
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Emergency phone */}
            <a
              href="tel:833-234-6343"
              className="hidden md:inline-flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-2 rounded-lg text-xs font-bold min-h-[44px] transition-opacity hover:opacity-90"
              data-ocid="nav.button"
            >
              <Phone className="w-3.5 h-3.5" />
              833-234-6343
            </a>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90"
                    data-ocid="nav.button"
                  >
                    My Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-border text-foreground"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-teal-light font-semibold"
                    >
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => clear()}
                    className="text-destructive"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex flex-col items-end gap-0.5">
                <Button
                  variant="default"
                  size="sm"
                  className="min-h-[44px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  data-ocid="nav.button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                {loginStatus === "loginError" || loginError ? (
                  <p className="text-[10px] text-destructive font-medium max-w-[140px] text-right leading-tight">
                    {loginError ?? "Sign in failed. Try again."}
                  </p>
                ) : null}
              </div>
            )}

            {/* Mobile portrait hamburger only */}
            <button
              type="button"
              className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md transition-colors text-on-dark hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              data-ocid="nav.toggle"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── PORTRAIT MOBILE DRAWER: full-height side-drawer style, sectioned ── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="landscape:hidden md:landscape:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setMenuOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="landscape:hidden md:landscape:hidden fixed top-0 right-0 bottom-0 z-40 w-72 bg-navy border-l border-border flex flex-col shadow-card overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="font-bold text-sm text-teal-light">Menu</span>
              <button
                type="button"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md transition-colors text-on-dark hover:text-white"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                data-ocid="nav.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sections */}
            <div className="flex-1 px-3 py-3 space-y-4">
              {/* Main */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-on-dark/50 px-2 mb-1">
                  Main
                </p>
                <Link
                  to="/"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Home
                </Link>
                <Link
                  to="/citizens"
                  className="drawer-link text-teal-light"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  <Radio className="w-3.5 h-3.5" /> Citizens Hub
                </Link>
                <Link
                  to="/resources"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Resources
                </Link>
                <Link
                  to="/videos"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Videos
                </Link>
                <Link
                  to="/donate"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Donate
                </Link>
                <Link
                  to="/leaderboard"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/impact"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Impact
                </Link>
              </div>
              {/* Community */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-on-dark/50 px-2 mb-1">
                  Community
                </p>
                <Link
                  to="/mission"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Mission
                </Link>
                <Link
                  to="/blog"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Blog
                </Link>
                <Link
                  to="/about"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  About
                </Link>
                <Link
                  to="/helper"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Be a Helper
                </Link>
                <Link
                  to="/volunteers"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  <Users className="w-3.5 h-3.5" /> Volunteers
                </Link>
              </div>
              {/* Tools */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-on-dark/50 px-2 mb-1">
                  Tools
                </p>
                <Link
                  to="/dashboard"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Dashboard
                </Link>
                <Link
                  to="/national-impact"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  National Impact
                </Link>
                <Link
                  to="/admin"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Admin
                </Link>
              </div>
              {/* Legal */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-on-dark/50 px-2 mb-1">
                  Legal
                </p>
                <Link
                  to="/privacy"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Terms
                </Link>
                <Link
                  to="/cookies"
                  className="drawer-link"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  Cookies
                </Link>
              </div>
            </div>

            {/* Drawer CTAs */}
            <div className="px-3 pb-4 pt-2 border-t border-border space-y-2 shrink-0">
              <a
                href="tel:833-234-6343"
                className="flex items-center justify-center gap-2 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg text-sm font-bold min-h-[44px] w-full transition-opacity hover:opacity-90"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.button"
              >
                <Phone className="w-4 h-4 shrink-0" />
                Call 833-234-6343
              </a>
              {!isLoggedIn && (
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    className="min-h-[44px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                    disabled={isLoggingIn}
                    onClick={async () => {
                      setLoginError(null);
                      try {
                        await login();
                        setMenuOpen(false);
                      } catch (err) {
                        setLoginError(
                          err instanceof Error
                            ? err.message
                            : "Sign in failed.",
                        );
                      }
                    }}
                    data-ocid="nav.button"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  {(loginStatus === "loginError" || loginError) && (
                    <p className="text-[10px] text-destructive font-medium text-center">
                      {loginError ?? "Sign in failed. Try again."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
