// Domain types for the soul-bound credential layer.
// Version: 1
// Schema: Credential records are keyed by Nat ID and indexed by Principal owner.
// No PHI — all principals are pseudonymous.

module {

  // ── Credential type variant ──────────────────────────────────────────────
  // All 12 soul-bound credential names as typed constructors.
  // Using these variants instead of raw Text prevents typos at mint time.
  public type CredentialType = {
    #FirstResponder;     // submitted 1 citizen report
    #CommunitySentinel;  // 10+ verified reports
    #NarcanHero;         // reported a successful Narcan deployment
    #RecoveryAlly;       // completed peer support training (admin-verified)
    #ThirtyDayGuide;     // supported a peer through first 30 days
    #StorySharer;        // published an approved recovery testimonial
    #MATChampion;        // actively prescribing to 10+ patients on platform
    #BridgeProvider;     // issued 5+ 72-hour bridge prescriptions
    #RecoveryNavigator;  // completed 25 warm handoffs through platform
    #SentinelVerified;   // passed platform provider verification process
    #CommunityArchitect; // organized a local outreach event logged on platform
    #PolicyPioneer;      // contributed data used in a public health report
  };

  // ── Credential tier labels ───────────────────────────────────────────────
  public type Tier = Text; // "Community" | "Peer Support" | "Clinical" | "Leadership"

  // ── Full credential record ───────────────────────────────────────────────
  // Immutable after minting — soul-bound to `owner`.
  // Digital-only: no physical reward fields. card_metadata holds a JSON string
  // with tier color, QR link, and display name for shareable card generation.
  public type Credential = {
    id             : Nat;
    owner          : Principal;
    credentialType : CredentialType;
    tier           : Tier;
    name           : Text;
    description    : Text;
    earnedAt       : Int;    // nanosecond timestamp (Time.now())
    metadata       : ?Text;  // free-form JSON string per credential type
    verifier       : ?Principal; // admin or system that approved/triggered mint
    badgeSvg       : ?Text;  // inline SVG string for on-chain rendering
    cardMetadata   : ?Text;  // JSON string: tierColor, qrLink, displayName for shareable PNG
    impactScore    : Nat;    // weighted contribution score (see Credentials lib)
  };

  // ── Impact scores per credential type ───────────────────────────────────
  // Returned as a record for frontend display and leaderboard ranking.
  public type ImpactScoreMap = {
    firstResponder    : Nat; // 1
    communitySentinel : Nat; // 10
    narcanHero        : Nat; // 15
    recoveryAlly      : Nat; // 5
    thirtyDayGuide    : Nat; // 10
    storySharer       : Nat; // 5
    matChampion       : Nat; // 30
    bridgeProvider    : Nat; // 20
    recoveryNavigator : Nat; // 50
    sentinelVerified  : Nat; // 25
    communityArchitect: Nat; // 20
    policyPioneer     : Nat; // 40
  };

  // ── Global stats snapshot ────────────────────────────────────────────────
  public type GlobalImpactStats = {
    totalBadgesMinted  : Nat;
    activeContributors : Nat;
    totalImpactScore   : Nat;
  };

  // ── Auto-mint trigger types ──────────────────────────────────────────────
  // actionType strings used by checkAndAutoMint.
  // "report", "handoff", "prescription", "narcan", "testimonial", "verification"
  public type ActionType = Text;

};
