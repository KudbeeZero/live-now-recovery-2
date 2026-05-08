// Domain types for the volunteer profile layer.
// Version: 1
// No PHI — all fields are logistics-only (no medical/patient data).
// Privacy: volunteers control searchability via privacyPublic flag.

module {

  // ── VolunteerProfile record ───────────────────────────────────────────────
  // Immutable id, mutable profile fields controlled by the volunteer.
  // principal is optional: seed/mock volunteers don't have a real ICP identity.
  public type VolunteerProfile = {
    id            : Nat;
    principal     : ?Principal;   // Internet Identity principal, null for seeds
    displayName   : Text;         // public alias — NOT a real name requirement
    role          : Text;         // e.g. "Peer Support Specialist"
    city          : Text;         // Ohio city for display
    zip           : Text;         // 5-digit ZIP for proximity matching
    bio           : Text;         // short volunteer bio (<= 300 chars)
    skills        : [Text];       // e.g. ["Harm Reduction", "Transportation"]
    privacyPublic : Bool;         // true = visible in getAllPublicVolunteers()
    joinedAt      : Nat64;        // nanosecond timestamp (Time.now() cast to Nat64)
    impactScore   : Nat;          // mirrors credential impact score aggregate
  };

  // ── Mutable profile fields for updates ───────────────────────────────────
  // Passed to updateVolunteerProfile.  All fields are optional; nulls = no change.
  public type ProfileUpdate = {
    displayName   : ?Text;
    role          : ?Text;
    city          : ?Text;
    zip           : ?Text;
    bio           : ?Text;
    skills        : ?[Text];
    privacyPublic : ?Bool;
  };

};
