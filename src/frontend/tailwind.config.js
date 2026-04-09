import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      screens: {
        landscape: { raw: "(orientation: landscape)" },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        live: {
          DEFAULT: "oklch(var(--live) / <alpha-value>)",
        },
        amber: {
          recovery: "oklch(var(--amber) / <alpha-value>)",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
        // Semantic brand tokens
        navy: "oklch(0.22 0.038 225)",
        "navy-light": "oklch(0.28 0.038 225)",
        "teal-dark": "oklch(0.36 0.065 196)",
        "teal-mid": "oklch(0.44 0.078 196)",
        "teal-light": "oklch(0.80 0.12 196)",
        "on-dark": "oklch(0.72 0.03 225)",
        emergency: "oklch(var(--destructive) / <alpha-value>)",
        "trust-blue": "oklch(var(--primary) / <alpha-value>)",
        "live-green": "oklch(var(--live) / <alpha-value>)",
        // Sentinel Risk Intelligence heat gradient
        "risk-safe": "oklch(var(--risk-safe))",
        "risk-low": "oklch(var(--risk-low))",
        "risk-moderate": "oklch(var(--risk-moderate))",
        "risk-high": "oklch(var(--risk-high))",
        "risk-critical": "oklch(var(--risk-critical))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(45,156,219,0.25), 0 0 40px rgba(45,156,219,0.1)",
        "glow-green": "0 0 20px rgba(39,174,96,0.25), 0 0 40px rgba(39,174,96,0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shadowPulse: {
          "0%, 100%": { opacity: "0.15", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(1.08)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideOutLeft: {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(-24px)" },
        },
        gaussianPulse: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shadow-pulse-calm": "shadowPulse 4s ease-in-out infinite",
        "shadow-pulse-rush": "shadowPulse 0.8s ease-in-out infinite",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
        "slide-in-left": "slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-out-left": "slideOutLeft 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "gaussian-pulse": "gaussianPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
