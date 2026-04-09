# Design Brief

## Direction

Sentinel Prediction Engine — a real-time risk intelligence admin panel and map overlay for early detection and warm handoff optimization in recovery treatment.

## Tone

Professional medical analytics with dark, focused UI — predictive, data-driven, clear. No brightness, no distraction. The interface is subordinate to the data and the mission.

## Differentiation

Live risk heatmap that responds to external oracles (weather, social stress, events, paydays) — the admin can see risk shifting in real time and understand the mechanism of every decision.

## Color Palette

| Token            | OKLCH              | Role                                     |
|------------------|--------------------|------------------------------------------|
| background       | 0.14 0.008 240     | App canvas, deep navy                    |
| card             | 0.18 0.008 240     | Panels, toggles, form containers         |
| foreground       | 0.96 0 0           | Body text, default state                 |
| primary          | 0.62 0.12 218      | Trust-blue, secondary accents            |
| live-green       | 0.62 0.17 155      | Risk-safe baseline, call-to-action       |
| risk-low         | 0.75 0.15 120      | Elevated awareness, yellow-green         |
| risk-moderate    | 0.70 0.18 85       | Caution state, amber                     |
| risk-high        | 0.65 0.20 40       | Urgent state, orange                     |
| risk-critical    | 0.52 0.19 27       | Emergency state, red (pulsing)           |
| border           | 0.26 0.012 240     | Card boundaries, subtle divisions        |
| muted-foreground | 0.65 0.01 220      | Secondary text, labels                   |

## Typography

- Display: Plus Jakarta Sans (SemiBold 600) — panel headers, toggle labels, risk level callouts
- Body: Plus Jakarta Sans (Regular 400) — body text, form inputs, chart labels
- Scale: h1 24px / h2 20px / label 14px bold / body 14px regular

## Elevation & Depth

Four-level surface hierarchy: background (canvas) → card (panels) → elevated card (toggles, focused form inputs) → popover (tooltips, modal overlays). Subtle shadows (0 4px 24px rgba black 0.4) on cards only; no drop shadows on buttons or form fields.

## Structural Zones

| Zone      | Background          | Border                      | Notes                                         |
|-----------|---------------------|-----------------------------|-----------------------------------------------|
| Header    | navy (0.22 0.038)   | border-bottom live-green    | "Prediction Engine" title, admin-only badge   |
| Content   | background          | —                           | Two-column: toggles/form left, graph right    |
| Panel     | card (0.18 0.008)   | border (0.26 0.012)         | Rounded 12px, padding 16px, shadow-card       |
| Heatmap   | transparent overlay  | —                           | Risk gradient 5-level, opacity 0.15–0.45     |
| Toasts    | card with border    | border live-green on top    | Bottom-left, z-index 50, auto-dismiss 5s      |

## Spacing & Rhythm

16px base unit: section gaps 24px, panel padding 16px, toggle spacing 12px, input gap 8px. Grouped toggles share 12px vertical gap; form fields stack at 12px. Activity toasts layer at 8px vertical gap.

## Component Patterns

- Toggles: card background, rounded-lg, 48px width, live-green indicator dot (when active), hover: bg-[navy-light]
- Sliders: track in muted, thumb in live-green, label in muted-foreground, range 0–100
- Buttons: primary (live-green bg), hover (brightness +0.05), secondary (navy bg), small (px-3 py-1.5)
- Charts: Recharts Gaussian curve, fill live-green at 0.2 opacity, stroke live-green at 0.6 opacity, stroke-width 2
- Indicators: 12px circles, color-coded by risk level (safe/low/moderate/high/critical), critical level pulsing
- Cards: bg-card, border 1px border, rounded-lg, shadow-card, spacing 16px internal

## Motion

- Entrance: activity toast slides in from left (0.4s cubic-bezier(0.34, 1.56, 0.64, 1)), Gaussian curve fades in on toggle (0.3s ease-out)
- Hover: toggle hover scale 1.02, button hover brightness +0.05, no delay
- Decorative: critical risk indicator pulses (2s cycle), risk heatmap opacity breathes (0.15 → 0.45, 4s cycle), activity toast auto-dismisses after 5s with slide-out animation (0.3s)

## Constraints

- No glassmorphism, no blur overlays, no gradients on backgrounds
- Risk heat gradient never inverts — green always safe, red always critical
- Toggles always show current state via color (green = on, muted = off), never rely on text alone
- OKLCH values only — no hex, no rgb, no named colors in component code
- Sentinel overlay must render beneath map pins and clustering layer (z-index 5)
- Activity toasts should not overlap; stack vertically with 8px gap

## Signature Detail

Risk heatmap responds to admin toggles in real time — the Gaussian curve spikes visually when the "Potency Alert" or "Payday Logic" toggle is flipped. This creates a moment of understanding for the investor: you're not just collecting data, you're instrumenting the ground truth of overdose risk.
