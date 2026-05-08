// Public API mixin for the soul-bound credential layer.
// Injected into main.mo; all state slices are passed by reference.
// Version: 1
// No PHI -- principals are pseudonymous identifiers only.
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/credentials";
import CredLib "../lib/credentials";

mixin (
  credentialsById  : Map.Map<Nat, Types.Credential>,
  ownerIndex       : Map.Map<Principal, List.List<Nat>>,
  impactIndex      : Map.Map<Principal, Nat>,
  nextCredentialId : { var value : Nat },
  accessControlState : AccessControl.AccessControlState,
) {

  // ── Public update: mint (authorized callers only) ───────────────────────────
  /// Mints a credential for `owner`.  Only callable by admins.
  /// Performs dedup -- returns existing ID if owner already holds the same credential type.
  public shared ({ caller }) func mintCredential(
    owner    : Principal,
    credType : Types.CredentialType,
    metadata : ?Text,
    verifier : ?Principal,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only authorized principals can mint credentials");
    };
    if (CredLib.hasCredential(credentialsById, ownerIndex, owner, credType)) {
      // Return existing ID -- dedup
      let existingId = switch (ownerIndex.get(owner)) {
        case null { Runtime.trap("Credential index inconsistency") };
        case (?ids) {
          switch (ids.find(func(id : Nat) : Bool {
            switch (credentialsById.get(id)) {
              case null { false };
              case (?c) { c.credentialType == credType };
            };
          })) {
            case null { Runtime.trap("Credential index inconsistency") };
            case (?id) { id };
          };
        };
      };
      existingId;
    } else {
      CredLib.mint(credentialsById, ownerIndex, impactIndex, nextCredentialId, owner, credType, metadata, verifier);
    };
  };

  // ── Public update: auto-mint (system hook) ─────────────────────────────────
  /// Called by main.mo after logHandoff, citizen report, prescription events.
  /// Evaluates thresholds and mints qualifying credentials automatically.
  public shared ({ caller }) func checkAndAutoMint(
    owner      : Principal,
    actionType : Text,
    count      : Nat,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only authorized principals can trigger auto-mint");
    };
    CredLib.autoMint(credentialsById, ownerIndex, impactIndex, nextCredentialId, owner, actionType, count);
  };

  // ── Admin: manual mint ─────────────────────────────────────────────────────────
  /// Admin-only: mint any credential for any principal, bypassing thresholds.
  /// Used for: RecoveryAlly, StorySharer, SentinelVerified, etc.
  public shared ({ caller }) func adminMintCredential(
    owner    : Principal,
    credType : Types.CredentialType,
    metadata : ?Text,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can mint credentials");
    };
    if (CredLib.hasCredential(credentialsById, ownerIndex, owner, credType)) {
      let existingId = switch (ownerIndex.get(owner)) {
        case null { Runtime.trap("Credential index inconsistency") };
        case (?ids) {
          switch (ids.find(func(id : Nat) : Bool {
            switch (credentialsById.get(id)) {
              case null { false };
              case (?c) { c.credentialType == credType };
            };
          })) {
            case null { Runtime.trap("Credential index inconsistency") };
            case (?id) { id };
          };
        };
      };
      existingId;
    } else {
      CredLib.mint(credentialsById, ownerIndex, impactIndex, nextCredentialId, owner, credType, metadata, ?caller);
    };
  };

  // ── Public query: credential lookup ─────────────────────────────────────────
  /// Returns all credentials owned by `principal` sorted by earnedAt.
  public query func getUserCredentials(principal : Principal) : async [Types.Credential] {
    CredLib.getUserCredentials(credentialsById, ownerIndex, principal);
  };

  /// Returns a single credential by ID, or null.
  public query func getCredentialById(id : Nat) : async ?Types.Credential {
    CredLib.getById(credentialsById, id);
  };

  /// Returns true if `principal` holds a credential of `credType`.
  public query func hasCredential(
    principal : Principal,
    credType  : Types.CredentialType,
  ) : async Bool {
    CredLib.hasCredential(credentialsById, ownerIndex, principal, credType);
  };

  /// Returns all (principal, totalImpactScore) pairs for the leaderboard.
  public query func getAllPublicBadges() : async [(Principal, Nat)] {
    CredLib.getAllPublicBadges(impactIndex);
  };

  // ── Public query: leaderboard ────────────────────────────────────────────────
  /// Returns top-N contributors (principal, impactScore, [credentialNames]).
  public query func getTopContributors(limit : Nat) : async [(Principal, Nat, [Text])] {
    CredLib.getTopContributors(credentialsById, ownerIndex, impactIndex, limit);
  };

  // ── Public query: global stats ────────────────────────────────────────────────
  public query func getGlobalImpactStats() : async Types.GlobalImpactStats {
    CredLib.getGlobalImpactStats(credentialsById, impactIndex);
  };

  // ── Public query: timeline ───────────────────────────────────────────────────────
  /// Returns all credentials for `owner` sorted chronologically.
  public query func getUserTimeline(owner : Principal) : async [Types.Credential] {
    CredLib.getUserTimeline(credentialsById, ownerIndex, owner);
  };


};
