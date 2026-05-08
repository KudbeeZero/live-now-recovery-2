// Public API mixin for the volunteer profile layer.
// Injected into main.mo; all state slices are passed by reference.
// Version: 1
// No PHI — all stored data is logistics-only.

import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Types "../types/volunteer-profiles";
import VolLib "../lib/volunteer-profiles";

mixin (
  volunteersById  : Map.Map<Nat, Types.VolunteerProfile>,
  nextVolunteerId : { var value : Nat },
) {

  // ── Update: register a new volunteer profile ───────────────────────────────
  /// Creates a new VolunteerProfile bound to the caller's principal.
  /// Anonymous callers are rejected.
  /// Returns the assigned profile id (Nat).
  public shared ({ caller }) func registerVolunteerProfile(
    displayName   : Text,
    role          : Text,
    city          : Text,
    zip           : Text,
    bio           : Text,
    skills        : [Text],
    privacyPublic : Bool,
  ) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot register a volunteer profile");
    };
    VolLib.register(volunteersById, nextVolunteerId, ?caller, displayName, role, city, zip, bio, skills, privacyPublic);
  };

  // ── Update: edit an existing volunteer profile ─────────────────────────────
  /// Updates mutable fields on the profile identified by `id`.
  /// Caller must own the profile (principal must match) or be admin.
  /// Returns true on success, false if profile not found.
  public shared ({ caller }) func updateVolunteerProfile(
    id  : Nat,
    upd : Types.ProfileUpdate,
  ) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot update a volunteer profile");
    };
    // Ownership check: caller must own the profile
    switch (volunteersById.get(id)) {
      case null { false };
      case (?existing) {
        switch (existing.principal) {
          case (?p) {
            if (p != caller) {
              Runtime.trap("Unauthorized: only the profile owner can update it");
            };
          };
          case null {
            Runtime.trap("Unauthorized: seed profiles cannot be updated");
          };
        };
        VolLib.update(volunteersById, id, upd);
      };
    };
  };

  // ── Query: get volunteer by id ─────────────────────────────────────────────
  /// Returns the profile at `id` regardless of privacy setting.
  /// Returns null if not found.
  public query func getVolunteer(id : Nat) : async ?Types.VolunteerProfile {
    volunteersById.get(id);
  };

  // ── Query: get all public volunteers ──────────────────────────────────────
  /// Returns only profiles where privacyPublic = true.
  public query func getAllPublicVolunteers() : async [Types.VolunteerProfile] {
    VolLib.getAllPublic(volunteersById);
  };

  // ── Query: get volunteer by principal ─────────────────────────────────────
  /// Looks up the profile whose principal matches the given `principal`.
  /// Returns null if not found.
  public query func getVolunteerByPrincipal(
    principal : Principal,
  ) : async ?Types.VolunteerProfile {
    VolLib.getByPrincipal(volunteersById, principal);
  };

  // ── Query: total volunteer count ───────────────────────────────────────────
  /// Returns total number of registered volunteers (public + private).
  public query func volunteerCount() : async Nat {
    VolLib.count(volunteersById);
  };

};
