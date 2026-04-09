import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { Heart, Loader2, Menu, Phone, Radio, Users, X } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
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
          <div className="flex items-center gap-2">
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

            {/* Mobile menu toggle */}
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

      {/* Mobile menu — portrait stacks vertically; landscape uses 2-col grid + side-by-side CTAs */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-navy max-h-[calc(100dvh-4rem)] overflow-y-auto">
          {/* Nav links: 1 col portrait → 2 col landscape */}
          <div className="px-4 py-3 landscape:py-1.5 grid grid-cols-1 landscape:grid-cols-2 gap-0.5 landscape:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="py-2.5 landscape:py-1.5 px-2 text-sm font-medium transition-colors min-h-[44px] landscape:min-h-[36px] flex items-center rounded-md text-on-dark hover:text-white hover:bg-white/5"
                activeProps={{ className: "text-teal-light font-semibold" }}
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/citizens"
              className="py-2.5 landscape:py-1.5 px-2 text-sm font-medium min-h-[44px] landscape:min-h-[36px] flex items-center gap-1.5 rounded-md text-teal-light hover:bg-white/5"
              activeProps={{ className: "text-teal-light font-semibold" }}
              onClick={() => setMenuOpen(false)}
              data-ocid="nav.link"
            >
              <Radio className="w-3.5 h-3.5" />
              Citizens Hub
            </Link>
            <Link
              to="/helper"
              className="py-2.5 landscape:py-1.5 px-2 text-sm font-medium min-h-[44px] landscape:min-h-[36px] flex items-center gap-1.5 rounded-md text-teal-light hover:bg-white/5"
              onClick={() => setMenuOpen(false)}
              data-ocid="nav.link"
            >
              <Users className="w-3.5 h-3.5" />
              Be a Helper
            </Link>
            {recoveryProfile && (
              <Link
                to="/my-recovery"
                className="py-2.5 landscape:py-1.5 px-2 text-sm font-medium min-h-[44px] landscape:min-h-[36px] flex items-center gap-1.5 rounded-md text-teal-light hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.link"
              >
                <Heart className="w-3.5 h-3.5" />
                My Recovery
              </Link>
            )}
          </div>
          {/* CTA row: stacked portrait → side by side landscape */}
          <div className="px-4 pb-4 landscape:pb-2 pt-1 flex flex-col landscape:flex-row gap-2">
            <a
              href="tel:833-234-6343"
              className="flex items-center justify-center gap-2 bg-destructive text-destructive-foreground px-4 py-3 landscape:py-2 rounded-lg text-sm font-bold min-h-[44px] landscape:min-h-[40px] landscape:flex-1 transition-opacity hover:opacity-90"
              onClick={() => setMenuOpen(false)}
              data-ocid="nav.button"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Call 833-234-6343</span>
            </a>
            {!isLoggedIn && (
              <div className="landscape:flex-1 flex flex-col gap-1">
                <Button
                  size="sm"
                  className="min-h-[44px] landscape:min-h-[40px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                  disabled={isLoggingIn}
                  onClick={async () => {
                    setLoginError(null);
                    try {
                      await login();
                      setMenuOpen(false);
                    } catch (err) {
                      setLoginError(
                        err instanceof Error ? err.message : "Sign in failed.",
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
      )}
    </header>
  );
}
