// Domain logic for the volunteer profile layer.
// Version: 1
// Stateless functions that operate on injected state slices.
// All persistent state lives in main.mo and is passed by reference.

import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat64 "mo:core/Nat64";
import Int "mo:core/Int";
import Types "../types/volunteer-profiles";

module {

  // ── Type aliases ──────────────────────────────────────────────────────────
  public type VolunteerProfile = Types.VolunteerProfile;
  public type ProfileUpdate    = Types.ProfileUpdate;

  // ── State shape injected from main.mo ─────────────────────────────────────
  // volunteersById  : Map<Nat, VolunteerProfile>    — primary store keyed by id
  // nextVolunteerId : { var value : Nat }           — monotonic counter

  // ── Register a new volunteer profile ─────────────────────────────────────
  /// Creates a new VolunteerProfile, stores it, increments the counter.
  /// Returns the new profile id.
  public func register(
    volunteersById  : Map.Map<Nat, VolunteerProfile>,
    nextVolunteerId : { var value : Nat },
    principal       : ?Principal,
    displayName     : Text,
    role            : Text,
    city            : Text,
    zip             : Text,
    bio             : Text,
    skills          : [Text],
    privacyPublic   : Bool,
  ) : Nat {
    let id = nextVolunteerId.value;
    nextVolunteerId.value += 1;
    let profile : VolunteerProfile = {
      id;
      principal;
      displayName;
      role;
      city;
      zip;
      bio;
      skills;
      privacyPublic;
      joinedAt    = Nat64.fromNat(Int.abs(Time.now()));
      impactScore = 0;
    };
    volunteersById.add(id, profile);
    id;
  };

  // ── Update an existing volunteer profile ──────────────────────────────────
  /// Applies partial updates from ProfileUpdate to the profile at `id`.
  /// Returns true if found and updated, false if not found.
  public func update(
    volunteersById : Map.Map<Nat, VolunteerProfile>,
    id             : Nat,
    upd            : ProfileUpdate,
  ) : Bool {
    switch (volunteersById.get(id)) {
      case null { false };
      case (?existing) {
        let updated : VolunteerProfile = {
          existing with
          displayName   = switch (upd.displayName)   { case null { existing.displayName };   case (?v) { v } };
          role          = switch (upd.role)          { case null { existing.role };          case (?v) { v } };
          city          = switch (upd.city)          { case null { existing.city };          case (?v) { v } };
          zip           = switch (upd.zip)           { case null { existing.zip };           case (?v) { v } };
          bio           = switch (upd.bio)           { case null { existing.bio };           case (?v) { v } };
          skills        = switch (upd.skills)        { case null { existing.skills };        case (?v) { v } };
          privacyPublic = switch (upd.privacyPublic) { case null { existing.privacyPublic }; case (?v) { v } };
        };
        volunteersById.add(id, updated);
        true;
      };
    };
  };

  // ── Sync impact score from credential layer ────────────────────────────────
  /// Called when credentials are minted; updates impactScore on the profile
  /// whose principal matches `owner`.  No-op if principal not found.
  public func syncImpactScore(
    volunteersById : Map.Map<Nat, VolunteerProfile>,
    owner          : Principal,
    newScore       : Nat,
  ) : () {
    for ((id, profile) in volunteersById.entries()) {
      switch (profile.principal) {
        case (?p) {
          if (p == owner) {
            volunteersById.add(id, { profile with impactScore = newScore });
          };
        };
        case null {};
      };
    };
  };

  // ── Get profile by id ─────────────────────────────────────────────────────
  public func getById(
    volunteersById : Map.Map<Nat, VolunteerProfile>,
    id             : Nat,
  ) : ?VolunteerProfile {
    volunteersById.get(id);
  };

  // ── Get profile by principal ──────────────────────────────────────────────
  public func getByPrincipal(
    volunteersById : Map.Map<Nat, VolunteerProfile>,
    owner          : Principal,
  ) : ?VolunteerProfile {
    volunteersById.values().find(func(p : VolunteerProfile) : Bool {
      switch (p.principal) {
        case (?pr) { pr == owner };
        case null  { false };
      };
    });
  };

  // ── Get all public volunteers ─────────────────────────────────────────────
  /// Returns only profiles where privacyPublic = true.
  public func getAllPublic(
    volunteersById : Map.Map<Nat, VolunteerProfile>,
  ) : [VolunteerProfile] {
    volunteersById.values().filter(func(p : VolunteerProfile) : Bool {
      p.privacyPublic
    }).toArray();
  };

  // ── Count all volunteers ──────────────────────────────────────────────────
  public func count(
    volunteersById : Map.Map<Nat, VolunteerProfile>,
  ) : Nat {
    volunteersById.size();
  };

  // ── Seed 15 realistic Ohio volunteers ─────────────────────────────────────
  /// Called from main.mo init block only when volunteersById is empty.
  public func seedMockVolunteers(
    volunteersById  : Map.Map<Nat, VolunteerProfile>,
    nextVolunteerId : { var value : Nat },
  ) : () {
    type Seed = (Text, Text, Text, Text, Text, [Text], Bool, Nat);
    let seeds : [Seed] = [
      ("CommunityAlly_Marcus", "Peer Support Specialist", "Cleveland", "44101",
       "Former person in recovery turned certified peer support specialist. Connects people to MAT resources.",
       ["Peer Support", "MAT Navigation", "Crisis Intervention"], true, 420),
      ("NarcanHero_Tamara", "Community Health Worker", "Akron", "44105",
       "Distributing Narcan kits across Summit County for 3 years. Every kit is a life saved.",
       ["Harm Reduction", "Narcan Distribution", "Community Outreach"], true, 380),
      ("RideShare_Derek", "Transportation Volunteer", "Cleveland", "44115",
       "Drives people to MAT appointments with no judgment, just showing up.",
       ["Transportation", "MAT Support", "Scheduling"], true, 290),
      ("NaloxoneNurse_Lisa", "Naloxone Distributor", "Stow", "44202",
       "RN running naloxone training sessions at community centers and shelters on weekends.",
       ["Medical Training", "Naloxone", "Education"], true, 510),
      ("RecoveryCoach_James", "Recovery Coach", "Columbus", "43201",
       "CPRS-certified coach with 8 years in recovery. Specializes in the first 90 days.",
       ["Recovery Coaching", "Mentorship", "CPRS"], true, 650),
      ("FamilyAdvocate_Angela", "Family Support Advocate", "Cincinnati", "45201",
       "Supporting families of people in recovery. You cannot do this alone and neither can your family.",
       ["Family Support", "Counseling", "Group Facilitation"], true, 310),
      ("WarmHandoff_Kevin", "Warm Handoff Coordinator", "Parma", "44135",
       "Connecting ER patients to MAT providers in real time. Warm handoffs save lives.",
       ["Warm Handoffs", "ER Liaison", "Care Coordination"], true, 725),
      ("Outreach_Renee", "Volunteer Outreach Worker", "Westerville", "43235",
       "Street outreach in central Ohio meeting people where they are with resources, not judgment.",
       ["Street Outreach", "Resource Navigation", "Harm Reduction"], true, 275),
      ("SentinelWatch_Darius", "Community Sentinel", "Youngstown", "44503",
       "Filing community reports and tracking risk patterns in the Mahoning Valley.",
       ["Community Reporting", "Data Collection", "Harm Reduction"], true, 195),
      ("TelehealthNav_Priya", "Telehealth Navigator", "Toledo", "43601",
       "Helping rural Ohioans connect to telehealth MAT when the nearest clinic is an hour away.",
       ["Telehealth", "MAT Navigation", "Digital Literacy"], true, 340),
      ("PolicyPioneer_Robert", "Policy Advocate", "Columbus", "43215",
       "Advocate for evidence-based addiction policy. Testimony at state legislature and county boards.",
       ["Policy Advocacy", "Public Speaking", "Legislative Process"], true, 480),
      ("CommunityArch_Yolanda", "Community Architect", "Dayton", "45402",
       "Organized 4 community outreach events reaching 600+ residents in Montgomery County.",
       ["Event Organization", "Community Building", "Outreach"], true, 530),
      ("PrivateHelper_Sam", "Peer Support Specialist", "Akron", "44311",
       "Volunteering quietly behind the scenes. Helping when needed.",
       ["Peer Support"], false, 120),
      ("StorySharer_Maria", "Recovery Story Contributor", "Cleveland", "44106",
       "In recovery for 5 years. Sharing my story so others know it is possible.",
       ["Storytelling", "Peer Support", "Community Engagement"], true, 390),
      ("BridgeProv_Terrence", "Bridge Provider Liaison", "Canton", "44702",
       "Connecting patients to 72-hour bridge prescriptions after ER discharge.",
       ["Bridge Prescriptions", "ER Coordination", "MAT"], true, 610),
    ];
    var offset : Nat = 0;
    for ((displayName, role, city, zip, bio, skills, privacyPublic, impactScore) in seeds.vals()) {
      let id = nextVolunteerId.value;
      nextVolunteerId.value += 1;
      let profile : VolunteerProfile = {
        id;
        principal     = null;
        displayName;
        role;
        city;
        zip;
        bio;
        skills;
        privacyPublic;
        joinedAt      = Nat64.fromNat(Int.abs(Time.now()) - (offset * 86_400_000_000_000));
        impactScore;
      };
      volunteersById.add(id, profile);
      offset += 1;
    };
  };

};
