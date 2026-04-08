import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import List "mo:core/List";
import Iter "mo:core/Iter";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";

actor {
  let DECAY_NS = 14_400_000_000_000;
  let TOKEN_EXPIRY_NS = 300_000_000_000;
  let HIGH_RISK_THRESHOLD = 80;

  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Helper Volunteer Type
  public type Helper = {
    id : Text;
    firstName : Text;
    zip : Text;
    phone : Text;
    note : Text;
    createdAt : Int;
  };

  type Provider = {
    id : Text;
    name : Text;
    lat : Float;
    lng : Float;
    isLive : Bool;
    lastVerified : Int;
  };

  module Provider {
    public func compare(provider1 : Provider, provider2 : Provider) : Order.Order {
      Text.compare(provider1.id, provider2.id);
    };
  };

  type ProviderStatus = { #Live; #Offline; #Unknown };

  type ProviderWithStatus = {
    id : Text;
    name : Text;
    lat : Float;
    lng : Float;
    isLive : Bool;
    lastVerified : Int;
    status : ProviderStatus;
  };

  type Handoff = {
    zipCode : Text;
    timestamp : Int;
    tokenId : Text;
  };

  type HandoffToken = {
    token : Text;
    zipCode : Text;
    createdAt : Int;
    used : Bool;
  };

  type VerifyResult = {
    #Ok : Text;
    #Expired;
    #NotFound;
    #AlreadyUsed;
  };

  type RiskPacket = {
    provider_id : Text;
    data_source : Text;
    risk_score : Nat;
    last_update_time : Nat;
    status : Bool;
  };

  type RiskPacketHistory = {
    packets : [RiskPacket];
    current_status : Bool;
    latest_risk_score : Nat;
    latest_update_time : Nat;
  };

  type CanisterStateSummary = {
    active_providers : [(Text, Nat, Bool)];
    high_risk_window_active : Bool;
    total_active_providers : Nat;
  };

  // Stable variables for upgrades
  var providerEntries : [(Text, Provider)] = [];
  var handoffEntries : [(Text, Handoff)] = [];
  var tokenEntries : [(Text, HandoffToken)] = [];
  var zipCountEntries : [(Text, Nat)] = [];
  var riskPacketEntries : [(Text, RiskPacketHistory)] = [];
  var helperEntries : [(Text, Helper)] = [];
  var tokenNonce : Nat = 0;
  var adminPrincipals : [Principal] = [];

  // Runtime state
  let providers = Map.empty<Text, Provider>();
  let handoffs = Map.empty<Text, Handoff>();
  let tokens = Map.empty<Text, HandoffToken>();
  let zipCounts = Map.empty<Text, Nat>();
  let riskPackets = Map.empty<Text, RiskPacketHistory>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let helpers = Map.empty<Text, Helper>();

  // Restore state from stable variables
  system func preupgrade() {
    providerEntries := providers.entries().toArray();
    handoffEntries := handoffs.entries().toArray();
    tokenEntries := tokens.entries().toArray();
    zipCountEntries := zipCounts.entries().toArray();
    riskPacketEntries := riskPackets.entries().toArray();
    helperEntries := helpers.entries().toArray();
  };

  system func postupgrade() {
    for ((k, v) in providerEntries.vals()) {
      providers.add(k, v);
    };
    for ((k, v) in handoffEntries.vals()) {
      handoffs.add(k, v);
    };
    for ((k, v) in tokenEntries.vals()) {
      tokens.add(k, v);
    };
    for ((k, v) in zipCountEntries.vals()) {
      zipCounts.add(k, v);
    };
    for ((k, v) in riskPacketEntries.vals()) {
      riskPackets.add(k, v);
    };
    for ((k, v) in helperEntries.vals()) {
      helpers.add(k, v);
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper Volunteer Functions
  public shared ({ caller }) func registerHelper(firstName : Text, zip : Text, phone : Text, note : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    let id = caller.toText();
    let helper : Helper = {
      id;
      firstName;
      zip;
      phone;
      note;
      createdAt = Time.now();
    };
    helpers.add(id, helper);
  };

  public query ({ caller }) func getAllHelpers() : async [Helper] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view helpers");
    };
    helpers.values().toArray();
  };

  // Helper function to check if caller is admin (legacy adminPrincipals list)
  func isAdminLegacy(caller : Principal) : Bool {
    adminPrincipals.find<Principal>(func(p) { Principal.equal(p, caller) }) != null;
  };

  // Provider Management Functions
  public query ({ caller }) func getAllProviders() : async [ProviderWithStatus] {
    providers.values().toArray().map(
      func(p) {
        {
          id = p.id;
          name = p.name;
          lat = p.lat;
          lng = p.lng;
          isLive = p.isLive;
          lastVerified = p.lastVerified;
          status = resolveStatus(p);
        };
      }
    );
  };

  public query ({ caller }) func getEmergencyActive() : async [ProviderWithStatus] {
    let now = Time.now();
    providers.values().toArray().filter(
      func(p) {
        p.isLive and (now - p.lastVerified) <= DECAY_NS;
      }
    ).map(
      func(p) {
        {
          id = p.id;
          name = p.name;
          lat = p.lat;
          lng = p.lng;
          isLive = p.isLive;
          lastVerified = p.lastVerified;
          status = #Live : ProviderStatus;
        };
      }
    );
  };

  public shared ({ caller }) func toggleLive(id : Text, status : Bool) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    // Admin-only check
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can toggle provider status");
    };
    let existing = switch (providers.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?p) { p };
    };
    providers.add(
      id,
      {
        id = existing.id;
        name = existing.name;
        lat = existing.lat;
        lng = existing.lng;
        isLive = status;
        lastVerified = Time.now();
      },
    );
  };

  public shared ({ caller }) func registerProvider(id : Text, name : Text, lat : Float, lng : Float) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    let newProvider : Provider = {
      id;
      name;
      lat;
      lng;
      isLive = false;
      lastVerified = Time.now();
    };
    providers.add(id, newProvider);
  };

  // Handoff Token Functions
  public shared ({ caller }) func generateHandoffToken(zipCode : Text) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    tokenNonce += 1;
    let token = "TOKEN-".concat(tokenNonce.toText());
    let now = Time.now();
    let handoffToken : HandoffToken = {
      token;
      zipCode;
      createdAt = now;
      used = false;
    };
    tokens.add(token, handoffToken);
    let handoff : Handoff = {
      zipCode;
      timestamp = now;
      tokenId = token;
    };
    handoffs.add(token, handoff);
    token;
  };

  public shared ({ caller }) func verifyHandoff(token : Text) : async VerifyResult {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    switch (tokens.get(token)) {
      case (null) { #NotFound };
      case (?t) {
        if (t.used) {
          return #AlreadyUsed;
        };
        let now = Time.now();
        if (now - t.createdAt > TOKEN_EXPIRY_NS) {
          return #Expired;
        };
        // Mark as used
        tokens.add(
          token,
          {
            token = t.token;
            zipCode = t.zipCode;
            createdAt = t.createdAt;
            used = true;
          },
        );
        // Increment zip count
        let currentCount = switch (zipCounts.get(t.zipCode)) {
          case (null) { 0 };
          case (?c) { c };
        };
        zipCounts.add(t.zipCode, currentCount + 1);
        #Ok(t.zipCode);
      };
    };
  };

  public query ({ caller }) func getHandoffCountsByZip() : async [(Text, Nat)] {
    zipCounts.entries().toArray();
  };

  public query ({ caller }) func getTotalHandoffs() : async Nat {
    var total : Nat = 0;
    for ((_, count) in zipCounts.entries()) {
      total += count;
    };
    total;
  };

  // Risk Packet Functions
  public shared ({ caller }) func receiveRiskPacket(packet : RiskPacket) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    // Admin-only check
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can submit risk packets");
    };
    let providerId = packet.provider_id;
    let history = switch (riskPackets.get(providerId)) {
      case (null) {
        {
          packets = [packet];
          current_status = packet.status;
          latest_risk_score = packet.risk_score;
          latest_update_time = packet.last_update_time;
        };
      };
      case (?h) {
        let newPackets = h.packets.concat([packet]);
        {
          packets = newPackets;
          current_status = packet.status;
          latest_risk_score = packet.risk_score;
          latest_update_time = packet.last_update_time;
        };
      };
    };
    riskPackets.add(providerId, history);
  };

  public shared ({ caller }) func heartbeat() : async [Text] {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    // Admin-only check
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can trigger heartbeat");
    };
    let now = Time.now();
    // Decay check: set isLive=false for stale providers
    for ((id, provider) in providers.entries()) {
      if (now - provider.lastVerified > DECAY_NS) {
        providers.add(
          id,
          {
            id = provider.id;
            name = provider.name;
            lat = provider.lat;
            lng = provider.lng;
            isLive = false;
            lastVerified = provider.lastVerified;
          },
        );
      };
    };
    // Collect high-risk providers
    var highRiskProviders : [Text] = [];
    for ((providerId, history) in riskPackets.entries()) {
      if (history.latest_risk_score > HIGH_RISK_THRESHOLD and history.current_status) {
        highRiskProviders := highRiskProviders.concat([providerId]);
      };
    };
    highRiskProviders;
  };

  public query ({ caller }) func getCanisterState() : async CanisterStateSummary {
    var activeProviders : [(Text, Nat, Bool)] = [];
    var totalActive : Nat = 0;
    let now = Time.now();
    for ((id, provider) in providers.entries()) {
      if (provider.isLive and (now - provider.lastVerified) <= DECAY_NS) {
        totalActive += 1;
        let riskScore = switch (riskPackets.get(id)) {
          case (null) { 0 };
          case (?h) { h.latest_risk_score };
        };
        let highRisk = switch (riskPackets.get(id)) {
          case (null) { false };
          case (?h) { h.latest_risk_score > HIGH_RISK_THRESHOLD and h.current_status };
        };
        activeProviders := activeProviders.concat([(id, riskScore, highRisk)]);
      };
    };
    // Check if any high-risk window is active
    var highRiskWindowActive = false;
    for ((_, _, isHighRisk) in activeProviders.vals()) {
      if (isHighRisk) {
        highRiskWindowActive := true;
      };
    };
    {
      active_providers = activeProviders;
      high_risk_window_active = highRiskWindowActive;
      total_active_providers = totalActive;
    };
  };

  // Internal helper function
  func resolveStatus(provider : Provider) : ProviderStatus {
    let age = Time.now() - provider.lastVerified;
    if (not provider.isLive) {
      return #Offline;
    };
    if (age > DECAY_NS) {
      return #Unknown;
    };
    #Live;
  };
}
