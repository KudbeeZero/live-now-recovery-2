# Design Brief

## Direction

Credential Layer + Impact Gallery — soul-bound, shareable digital collectibles for recovery community contributors. Premium aesthetic combining clinical credibility with collectible appeal. Every credential is a permanent, on-chain proof of impact.

## Tone

Professional + aspirational. Premium digital artifacts that feel worth sharing. The design says: "Your contribution is permanent, verified, and celebrated." No generic achievements — each credential earned is a milestone.

## Differentiation

Tier-colored shareable PNG cards with blockchain soul-bound proof, QR linking to on-chain verification. Masonry gallery showcases real community contribution with transparent attribution. This isn't a leaderboard-as-punishment; it's a movement.

## Color Palette

| Token                  | OKLCH              | Role                                      |
|------------------------|--------------------|-------------------------------------------|
| background             | 0.14 0.008 240     | Deep navy canvas, dark mode                |
| card                   | 0.18 0.008 240     | Card backgrounds                           |
| foreground             | 0.96 0 0           | Body text, labels                          |
| primary                | 0.62 0.12 218      | Trust blue, trust indicators               |
| credential-community   | 0.62 0.15 155      | Emerald — participation, hope              |
| credential-peer        | 0.62 0.12 218      | Trust blue — support, guidance             |
| credential-clinical    | 0.75 0.14 55       | Amber — clinical authority, expertise      |
| credential-leadership  | 0.52 0.14 290      | Purple — visionary, strategy, growth       |
| border                 | 0.26 0.012 240     | Card boundaries, dividers                  |
| muted                  | 0.22 0.008 240     | Secondary containers, toggles              |
| muted-foreground       | 0.65 0.01 220      | Secondary text, hints                      |

## Typography

- Display: Plus Jakarta Sans (Bold 700, SemiBold 600) — credential names, titles, emphasis
- Body: Plus Jakarta Sans (Regular 400) — descriptions, taglines, dates
- Monospace: System mono — principals, QR labels
- Scale: credential name 24px bold, description 14px, tagline 11px all-caps, date 12px secondary

## Shareable Credential Card

| Component              | Spec                                                                                                                  |
|------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Container              | 560px wide × 720px tall (high-res PNG for X sharing), rounded 16px corners, no padding                              |
| Background             | Tier-colored gradient (emerald/blue/amber/purple), from-[color]_/_0.95 to-[color]_/_0.8, subtle texture overlay   |
| Badge Frame            | 140px circle, bg-white/10 border-2 border-white/20, centered, drop-shadow-lg                                        |
| Badge SVG              | 112px, centered inside frame, tier-specific symbol, white fill with 0.15 opacity inner shadow                       |
| Credential Name        | Plus Jakarta Sans Bold 24px, white, centered below badge, max 2 lines, letter-spacing 0.5px                        |
| Description            | Plus Jakarta Sans Regular 14px, white/90, centered, 2–3 lines, 280px max-width, leading 1.4                        |
| Earned Date            | "Earned on [Date]", Plus Jakarta Sans Regular 12px, white/70, centered, 8px gap above impact line                    |
| Impact Score           | "Impact Score: [Number]", Plus Jakarta Sans SemiBold 13px, white, centered                                           |
| Soul-bound Tagline     | "SOUL-BOUND ON INTERNET COMPUTER • VERIFIED BY LIVE NOW RECOVERY", all-caps, 11px, letter-spacing 1px, white/60     |
| Principal / Display    | Shortened principal (e.g., "abc1…xyz9") or optional display name, 12px monospace, white/50, centered                |
| QR Code                | 100px × 100px white SVG in bottom-right corner, 16px margin, links to on-chain credential detail                   |
| Accent Stripe          | 3px solid footer stripe matching tier color, full width at bottom                                                   |

## Impact Gallery Page

| Zone       | Spec                                                                                                |
|------------|-----------------------------------------------------------------------------------------------------|
| Header     | "Impact Gallery" title, optional hero text ("Every contribution is permanent on the blockchain")     |
| Filter Bar | Sticky top, 4 tier buttons (Community/Peer/Clinical/Leadership), time filter (week/month/all), sort   |
| Masonry    | 3 columns desktop (lg), 2 columns tablet (md), 1 column mobile (sm), gap-6 auto-rows-max            |
| Card       | Badge SVG (112px), credential name (18px bold), earner name (12px secondary), earned date (10px)    |
| Card Hover | Elevation via shadow-lg, slight upward translate, reveal share button on bottom overlay              |
| Footer     | Live mint feed (optional sidebar or inline counter)                                                 |

## Elevation & Depth

- Credential card PNG: flat gradient + subtle texture (no real shadows, baked into PNG for X clarity)
- Gallery cards: base shadow-card (0 4px 24px rgba black 0.4), hover shadow-lg, no blur or backdrop effects
- Filter bar: 1px border on all sides, no shadow, sits above masonry with z-10

## Spacing & Rhythm

- Credential card: 32px margins from edges, 24px gaps between sections (badge → name → description → date/impact → tagline → principal → QR)
- Gallery: 24px section gaps, 16px card padding, 6px gap between cards, 8px filter button gap
- Filter bar: 16px padding, 8px internal gaps

## Component Patterns

- **Credential Badge**: 112–140px circle, tier-colored SVG inside a subtle frame, drop-shadow for depth
- **Gallery Masonry Card**: Compact display-only version (not full PNG), shows badge, name, earner, date, hover to action
- **Filter Button**: px-3 py-1.5, 14px text, data-[active=true] toggles to primary color with border shift
- **Share Button**: Appears on hover overlay of gallery cards, one-click download + X share pre-filled

## Motion

- **Gallery card enter**: Fade in on load + subtle scale-up (0.95 → 1.0, 0.3s ease-out)
- **Gallery card hover**: Elevation + upward translate 4px, 0.2s ease-out, shadow strengthens
- **Filter button toggle**: Immediate color swap, no transition on data attribute change
- **Share button reveal**: Slide up from bottom of card on hover, 0.2s ease-out, z-index 20

## Constraints

- Credential card PNG must be 560×720px minimum for X preview clarity
- Tier colors always consistent: Community=emerald, Peer=blue, Clinical=amber, Leadership=purple (no swaps)
- QR code always white, always bottom-right, always 100×100px or proportionally scaled
- No glassmorphism, no animated backgrounds, no blur on gallery cards — pure clarity for social sharing
- OKLCH values only in code, no hex or rgb
- Credentials never render as red or destructive colors
- Gallery must be fully accessible (semantic HTML, alt text on badges, keyboard navigation)

## Signature Detail

When a user shares a credential card on X, the preview shows the full 560×720px card with tier color, badge, and name — creating an unmissable, scrollable visual signal of verified contribution. Every card in the gallery is a mini proof-of-work.
