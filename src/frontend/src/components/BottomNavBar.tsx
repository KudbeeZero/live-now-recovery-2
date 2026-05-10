/**
 * BottomNavBar — Landscape-mobile navigation.
 * Visible only in landscape orientation on non-desktop viewports.
 * Fixed bottom tab bar (52px) with 5 primary tabs + "More" slide-up panel.
 */
// Note: previously hidden on /citizens — now visible on all pages

import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Heart,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  Menu,
  MessageSquare,
  PenLine,
  Play,
  Radio,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PRIMARY_TABS = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/citizens" as const, label: "Citizens", icon: Radio },
  { to: "/resources" as const, label: "Resources", icon: BookOpen },
  { to: "/videos" as const, label: "Videos", icon: Play },
  { to: "/donate" as const, label: "Donate", icon: Heart },
];

const MORE_SECTIONS = [
  {
    label: "Community",
    links: [
      { to: "/mission" as const, label: "Mission", icon: ShieldCheck },
      { to: "/blog" as const, label: "Blog", icon: PenLine },
      { to: "/about" as const, label: "About", icon: Info },
      { to: "/helper" as const, label: "Be a Helper", icon: Users },
    ],
  },
  {
    label: "Tools",
    links: [
      { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
      { to: "/gallery" as const, label: "Gallery", icon: Play },
      { to: "/national-impact" as const, label: "Impact Map", icon: Play },
      { to: "/admin" as const, label: "Admin", icon: ShieldCheck },
    ],
  },
  {
    label: "Learn",
    links: [
      { to: "/how-it-works" as const, label: "How It Works", icon: HelpCircle },
      { to: "/faq" as const, label: "FAQ", icon: MessageSquare },
      { to: "/ohio-stats" as const, label: "Ohio Stats", icon: FileText },
      { to: "/contact" as const, label: "Contact", icon: MessageSquare },
    ],
  },
  {
    label: "Legal",
    links: [
      { to: "/privacy" as const, label: "Privacy", icon: FileText },
      { to: "/terms" as const, label: "Terms", icon: FileText },
      { to: "/cookies" as const, label: "Cookies", icon: FileText },
    ],
  },
];

export function BottomNavBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { location } = useRouterState();
  const currentPath = location.pathname;

  // Close panel on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname change triggers close
  useEffect(() => {
    setMoreOpen(false);
  }, [currentPath]);

  // Escape key closes panel
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [moreOpen]);

  // Close panel on outside tap
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    // Use capture phase so it fires before React synthetic events
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, true);
    return () => {
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("touchstart", handler, true);
    };
  }, [moreOpen]);

  const isActive = (to: string) => {
    if (to === "/") return currentPath === "/";
    return currentPath.startsWith(to);
  };

  return (
    // Only visible in landscape mode on non-md viewports
    <div
      className="hidden landscape:flex lg:landscape:hidden fixed bottom-0 left-0 right-0 z-50 flex-col"
      data-ocid="bottom-nav.panel"
    >
      {/* More slide-up panel — always in DOM for smooth transition */}
      {/* Backdrop — aria-hidden, keyboard handled by Escape key effect */}
      <div
        className={[
          "fixed inset-0 bg-black/50 transition-opacity duration-200",
          moreOpen
            ? "opacity-100 pointer-events-auto z-[45]"
            : "opacity-0 pointer-events-none z-[45]",
        ].join(" ")}
        onClick={() => setMoreOpen(false)}
        onTouchEnd={(e) => {
          e.preventDefault();
          setMoreOpen(false);
        }}
        onKeyDown={(e) => e.key === "Escape" && setMoreOpen(false)}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Panel — slides up/down */}
      <div
        ref={panelRef}
        className={[
          "fixed left-0 right-0 bg-navy border-t border-border rounded-t-2xl px-4 pt-3 pb-2 shadow-card transition-all duration-300 ease-in-out",
          moreOpen
            ? "opacity-100 translate-y-0 pointer-events-auto z-[50]"
            : "opacity-0 translate-y-full pointer-events-none z-[50]",
        ].join(" ")}
        style={{
          bottom: "52px",
          maxHeight: "55dvh",
          /* dvh fallback for older browsers */
          ...(typeof CSS !== "undefined" && !CSS.supports("height", "55dvh")
            ? { maxHeight: "55vh" }
            : {}),
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
        aria-modal="true"
        aria-label="More navigation options"
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-1 rounded-full bg-border mx-auto" />
          <button
            type="button"
            onClick={() => setMoreOpen(false)}
            className="absolute right-4 top-3 p-1.5 rounded-full text-on-dark hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
            data-ocid="bottom-nav.close_button"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Links grid — 2 columns */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {MORE_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-on-dark/50 mb-1 mt-2">
                {section.label}
              </p>
              {section.links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-xs font-medium transition-colors min-h-[44px] ${
                      active
                        ? "text-teal-light bg-white/5"
                        : "text-on-dark hover:text-white hover:bg-white/5"
                    }`}
                    data-ocid="bottom-nav.link"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <nav
        className="flex bg-navy border-t border-border relative z-50"
        style={{ height: "52px" }}
        aria-label="Landscape navigation"
      >
        {PRIMARY_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                active ? "text-teal-light" : "text-on-dark hover:text-white"
              }`}
              data-ocid={`bottom-nav.tab.${tab.label.toLowerCase()}`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-teal-light" />
              )}
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-semibold tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* More tab */}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
            moreOpen ? "text-teal-light" : "text-on-dark hover:text-white"
          }`}
          aria-label="More navigation options"
          aria-expanded={moreOpen}
          aria-controls="bottom-nav-more-panel"
          data-ocid="bottom-nav.more_button"
        >
          {moreOpen && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-teal-light" />
          )}
          {moreOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="text-[9px] font-semibold tracking-wide">More</span>
        </button>
      </nav>
    </div>
  );
}
