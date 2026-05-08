// Soul-bound credential badge SVGs — one per credential type
// All use currentColor so Tailwind text-color classes work
// 24x24 viewBox, clean single-path or grouped paths

export const BADGE_SVGS: Record<string, string> = {
  // ─── Community Tier (Emerald / Shield motifs) ───────────────────────────
  FirstResponder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L4 6v6c0 4.5 3.5 8.7 8 10 4.5-1.3 8-5.5 8-10V6L12 2z"/>
  <path d="M9 12l2 2 4-4"/>
</svg>`,

  CommunitySentinel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L4 6v6c0 4.5 3.5 8.7 8 10 4.5-1.3 8-5.5 8-10V6L12 2z"/>
  <circle cx="12" cy="11" r="2.5"/>
  <path d="M12 2v3M12 20v-3M4 11H7M17 11h3"/>
</svg>`,

  NarcanHero: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L4 6v6c0 4.5 3.5 8.7 8 10 4.5-1.3 8-5.5 8-10V6L12 2z"/>
  <path d="M12 7v10M7 12h10"/>
</svg>`,

  // ─── Peer Support Tier (Blue / Heart & hands motifs) ───────────────────
  RecoveryAlly: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>`,

  ThirtyDayGuide: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  <path d="M12 9v3l2 2"/>
  <text x="8" y="13" font-size="4" fill="currentColor" stroke="none">30</text>
</svg>`,

  StorySharer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  <path d="M8 10h8M8 14h5"/>
</svg>`,

  // ─── Clinical Tier (Amber / Medical motifs) ────────────────────────────
  MATChampion: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
  <path d="M12 7v10M7 12h10"/>
</svg>`,

  BridgeProvider: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 17c2-4 4-6 9-6s7 2 9 6"/>
  <path d="M3 17v-2M21 17v-2M9 11V7M15 11V7"/>
  <rect x="10" y="4" width="4" height="3" rx="1"/>
</svg>`,

  RecoveryNavigator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" stroke="none" opacity="0.3"/>
  <path d="M12 8l1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5L12 8z"/>
</svg>`,

  SentinelVerified: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L4 6v6c0 4.5 3.5 8.7 8 10 4.5-1.3 8-5.5 8-10V6L12 2z"/>
  <path d="M9 12l2 2 4-4"/>
  <circle cx="12" cy="12" r="3" stroke-dasharray="2 1"/>
</svg>`,

  // ─── Leadership Tier (Purple / Star & compass motifs) ──────────────────
  CommunityArchitect: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 9l1.5 3-3 0z" fill="currentColor" stroke="none"/>
</svg>`,

  PolicyPioneer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
</svg>`,
};

// Returns the SVG string for a given credential type key
export function getBadgeSvg(credentialType: string): string {
  return BADGE_SVGS[credentialType] ?? BADGE_SVGS.FirstResponder;
}
