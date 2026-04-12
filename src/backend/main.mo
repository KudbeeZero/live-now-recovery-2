import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Int "mo:core/Int";
import CoreTypes "mo:core/Types";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";

actor {
  // Management canister actor type alias for ICP HTTP outcalls
  type ICManagement = actor {
    http_request : ({
      url : Text;
      max_response_bytes : ?Nat64;
      method : { #get; #head; #post };
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      transform : ?{
        function : shared query ({ response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
        context : Blob;
      };
      is_replicated : ?Bool;
    }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
  };
  let DECAY_NS = 14_400_000_000_000;
  let TOKEN_EXPIRY_NS = 300_000_000_000;
  let HIGH_RISK_THRESHOLD = 80;

  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ICP management canister for HTTP outcalls
  let ic : ICManagement = actor "aaaaa-aa";

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Helper Volunteer Type
  public type Helper = {
    id : Text;
    firstName : Text;
    lastName : Text;
    email : Text;
    zip : Text;
    phone : Text;
    helpType : Text;
    consent : Bool;
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
    providerType : Text;
    is_verified : Bool;
    is_active : Bool;
    inventory : Text;
    reputationScore : Nat;
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
    providerType : Text;
    is_verified : Bool;
    is_active : Bool;
    inventory : Text;
    reputationScore : Nat;
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

  var tokenNonce : Nat = 0;
  let adminPrincipals : [Principal] = [];

  // Emergency Bridge Status
  var emergencyBridgeStatus : { isActive : Bool; activatedAt : Int; activatedBy : Principal } = {
    isActive = false;
    activatedAt = 0;
    activatedBy = Principal.fromText("aaaaa-aa");
  };

  // Runtime state
  let providers = Map.empty<Text, Provider>();
  let handoffs = Map.empty<Text, Handoff>();
  let tokens = Map.empty<Text, HandoffToken>();
  let zipCounts = Map.empty<Text, Nat>();
  let riskPackets = Map.empty<Text, RiskPacketHistory>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let helpers = Map.empty<Text, Helper>();
  let costPlusReferrals = Map.empty<Text, Nat>();

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
  public shared ({ caller }) func registerHelper(firstName : Text, lastName : Text, email : Text, zip : Text, phone : Text, helpType : Text, consent : Bool, note : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    let id = caller.toText();
    let helper : Helper = {
      id;
      firstName;
      lastName;
      email;
      zip;
      phone;
      helpType;
      consent;
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

  // Emergency Bridge Status Functions
  public shared ({ caller }) func setEmergencyActive(isActive : Bool) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can set emergency bridge status");
    };
    emergencyBridgeStatus := { isActive; activatedAt = Time.now(); activatedBy = caller };
  };

  public query func getEmergencyBridgeStatus() : async { isActive : Bool; activatedAt : Int; activatedBy : Text } {
    {
      isActive = emergencyBridgeStatus.isActive;
      activatedAt = emergencyBridgeStatus.activatedAt;
      activatedBy = emergencyBridgeStatus.activatedBy.toText();
    };
  };

  // Helper function to check if caller is admin (legacy adminPrincipals list)
  func isAdminLegacy(caller : Principal) : Bool {
    adminPrincipals.find(func(p) { Principal.equal(p, caller) }) != null;
  };

  // Provider Management Functions
  public query func getAllProviders() : async [ProviderWithStatus] {
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
          providerType = p.providerType;
          is_verified = p.is_verified;
          is_active = p.is_active;
          inventory = p.inventory;
          reputationScore = p.reputationScore;
        };
      }
    );
  };

  public query func getEmergencyActive() : async [ProviderWithStatus] {
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
          providerType = p.providerType;
          is_verified = p.is_verified;
          is_active = p.is_active;
          inventory = p.inventory;
          reputationScore = p.reputationScore;
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
      { existing with isLive = status; lastVerified = Time.now() },
    );
  };

  public shared ({ caller }) func registerProvider(
    id : Text,
    name : Text,
    lat : Float,
    lng : Float,
    providerType : Text,
  ) : async () {
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
      providerType;
      is_verified = false;
      is_active = true;
      inventory = "";
      reputationScore = 0;
    };
    providers.add(id, newProvider);
  };

  // verifyProvider — admin-only, flips is_verified to true
  public shared ({ caller }) func verifyProvider(id : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can verify providers");
    };
    let existing = switch (providers.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?p) { p };
    };
    providers.add(id, { existing with is_verified = true });
  };

  // setProviderActiveStatus — authenticated caller, updates is_active
  public shared ({ caller }) func setProviderActiveStatus(id : Text, status : Bool) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    let existing = switch (providers.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?p) { p };
    };
    providers.add(id, { existing with is_active = status });
  };

  // updateInventory — authenticated caller, updates inventory text
  public shared ({ caller }) func updateInventory(id : Text, newInventory : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    let existing = switch (providers.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?p) { p };
    };
    providers.add(id, { existing with inventory = newInventory });
  };

  // getMarketplaceGeoJSON — public query, filters is_active AND is_verified, returns GeoJSON FeatureCollection string
  public query func getMarketplaceGeoJSON() : async Text {
    var features : [Text] = [];
    for ((_, p) in providers.entries()) {
      if (p.is_active and p.is_verified) {
        let feature =
          "{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":["
          # p.lng.toText() # "," # p.lat.toText()
          # "]},\"properties\":{\"id\":\"" # p.id
          # "\",\"name\":\"" # p.name
          # "\",\"providerType\":\"" # p.providerType
          # "\",\"is_verified\":true,\"is_active\":true"
          # ",\"reputationScore\":" # p.reputationScore.toText()
          # ",\"inventory\":\"" # p.inventory # "\"}}";
        features := features.concat([feature]);
      };
    };
    "{\"type\":\"FeatureCollection\",\"features\":[" # features.vals().join(",") # "]}";
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
          { t with used = true },
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

  public query func getHandoffCountsByZip() : async [(Text, Nat)] {
    zipCounts.entries().toArray();
  };

  public query func getTotalHandoffs() : async Nat {
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

  public shared ({ caller }) func runHeartbeat() : async [Text] {
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
          { provider with isLive = false },
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

  public query func getCanisterState() : async CanisterStateSummary {
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

  // Cost Plus Referral Tracking Functions

  // recordCostPlusReferral — public, anonymous callers allowed (no PHI)
  public shared func recordCostPlusReferral(providerId : Text) : async () {
    let current = switch (costPlusReferrals.get(providerId)) {
      case (null) { 0 };
      case (?n) { n };
    };
    costPlusReferrals.add(providerId, current + 1);
  };

  // getCostPlusReferralCount — returns referral count for a provider, 0 if not found
  public query func getCostPlusReferralCount(providerId : Text) : async Nat {
    switch (costPlusReferrals.get(providerId)) {
      case (null) { 0 };
      case (?n) { n };
    };
  };

  // getTotalCostPlusReferrals — sums all referral counts across all providers
  public query func getTotalCostPlusReferrals() : async Nat {
    var total : Nat = 0;
    for ((_, count) in costPlusReferrals.entries()) {
      total += count;
    };
    total;
  };

  // ── Fiscal Impact Engine Types ────────────────────────────────────────────────

  public type TouchpointRecord = {
    agentId : Text;
    touchpoints : Nat;
    isStabilized : Bool;
    totalSaved : Float;
  };

  // ── Fiscal Impact State ───────────────────────────────────────────────────────

  var dollarsSaved : Float = 0.0;
  var livesSaved : Float = 0.0;
  var stabilizedAgents : Nat = 0;
  var touchpointData : [TouchpointRecord] = [];

  // ── Simulation Stats State ────────────────────────────────────────────────────
  var totalSimHandoffs : Nat = 0;
  var totalSimScans : Nat = 0;
  var totalSimVolunteers : Nat = 47;
  var simulationStartTime : Int = 0;

  // ── Harm Reduction Inventory Types ───────────────────────────────────────────

  public type HarmReductionItem = {
    itemType : Text; // "clean_syringes" | "sharps_disposal" | "fentanyl_test_strips" | "narcan_kits" | "wound_care" | "alcohol_swabs"
    available : Bool;
    quantity : ?Nat;
    notes : ?Text;
  };

  // ── Community Feature State ───────────────────────────────────────────────────
  let providerPosts = Map.empty<Text, ProviderPost>();
  let citizenReports = Map.empty<Text, CitizenReport>();
  let recoveryProfiles = Map.empty<Principal, RecoveryProfile>();
  let harmReductionInventory = Map.empty<Text, [HarmReductionItem]>();

  // ── Testimonials & Citizen Risk Boost State ───────────────────────────────────
  // testimonials: array of (id, Testimonial) tuples — consistent with riskEvents/touchpointData patterns
  var testimonials : [(Text, Testimonial)] = [];
  // flaggedReports: list of flagged report IDs (separate from CitizenReport type to avoid schema change)
  var flaggedReports : [Text] = [];
  // citizenReportRiskBoosts: (zipCode, boostAmount, expiresAtNanoSecs)
  var citizenReportRiskBoosts : [(Text, Float, Int)] = [];

  // ── Fiscal Impact Functions ───────────────────────────────────────────────────

  // recordTouchpoint — public update (no PHI), implements 7-Attempts model
  public shared func recordTouchpoint(agentId : Text, _zip : Text) : async () {
    // Find existing record or create new one
    let existing : ?TouchpointRecord = touchpointData.find(func(r) { r.agentId == agentId });
    let currentTouchpoints : Nat = switch (existing) {
      case (?r) { r.touchpoints };
      case null { 0 };
    };
    let currentTotalSaved : Float = switch (existing) {
      case (?r) { r.totalSaved };
      case null { 0.0 };
    };
    let newTouchpoints = currentTouchpoints + 1;

    // 7-Attempts model: calculate incremental savings for this touchpoint
    let increment : Float = if (newTouchpoints <= 3) {
      25_000.0; // Cost avoidance
    } else if (newTouchpoints <= 6) {
      30_000.0; // $25k base + $5k productivity bonus
    } else {
      75_000.0; // $25k + $5k + $45k community ROI (touchpoint 7+)
    };

    let newTotalSaved = currentTotalSaved + increment;
    let isStabilized = newTouchpoints >= 7;

    // Update stabilizedAgents counter if newly stabilized on exactly touchpoint 7
    if (newTouchpoints == 7) {
      stabilizedAgents += 1;
    };

    // Update or insert the record
    let updatedRecord : TouchpointRecord = {
      agentId;
      touchpoints = newTouchpoints;
      isStabilized;
      totalSaved = newTotalSaved;
    };

    touchpointData := switch (existing) {
      case null { touchpointData.concat([updatedRecord]) };
      case (?_) {
        touchpointData.map(func(r) {
          if (r.agentId == agentId) { updatedRecord } else r
        })
      };
    };

    // Accumulate global dollars saved
    dollarsSaved += increment;

    // Recalculate livesSaved from total handoffs (0.08 lethality-to-handoff ratio)
    var totalHandoffCount : Nat = 0;
    for ((_, count) in zipCounts.entries()) {
      totalHandoffCount += count;
    };
    livesSaved := totalHandoffCount.toFloat() * 0.08;
  };

  // getFiscalData — public query, returns aggregated fiscal metrics
  public query func getFiscalData() : async {
    dollarsSaved : Float;
    livesSaved : Float;
    communityReinvestmentFund : Float;
    stabilizedAgents : Nat;
    touchpointCount : Nat;
    stabilityPipelinePercent : Float;
  } {
    let touchpointCount = touchpointData.size();
    let stabilityPipelinePercent : Float = if (touchpointCount == 0) {
      0.0;
    } else {
      (stabilizedAgents.toFloat() * 100.0) / touchpointCount.toFloat();
    };
    {
      dollarsSaved;
      livesSaved;
      communityReinvestmentFund = dollarsSaved * 0.15;
      stabilizedAgents;
      touchpointCount;
      stabilityPipelinePercent;
    };
  };

  // resetFiscalData — admin-only, resets all fiscal vars for demo
  public shared ({ caller }) func resetFiscalData() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can reset fiscal data");
    };
    dollarsSaved := 0.0;
    livesSaved := 0.0;
    stabilizedAgents := 0;
    touchpointData := [];
  };

  // getTouchpointData — admin-only query, returns full touchpoint records
  public query ({ caller }) func getTouchpointData() : async [TouchpointRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can view touchpoint data");
    };
    touchpointData;
  };

  // ── Community Feature Types ───────────────────────────────────────────────────

  public type ProviderPost = {
    id : Text;
    providerId : Text;
    content : Text;
    imageUrl : ?Text;
    createdAt : Int;
  };

  // NO-PHI: location/activity only, no names or patient data
  public type CitizenReport = {
    id : Text;
    zipCode : Text;
    activityType : Text;
    content : Text;
    upvotes : Nat;
    lat : ?Float;
    lng : ?Float;
    createdAt : Int;
  };

  public type RecoveryProfile = {
    id : Text;
    displayName : Text;
    zip : Text;
    favoriteProviders : [Text];
    resourcesUsed : [Text];
    createdAt : Int;
  };

  // Testimonial: peer support content; NO-PHI — displayName is alias, not real name
  public type Testimonial = {
    id : Text;
    authorId : Text;
    authorDisplayName : Text;
    zipCode : Text;
    content : Text; // max 500 chars enforced in storeTestimonial
    isApproved : Bool;
    isHidden : Bool;
    createdAt : Int;
  };

  // ── Prediction Engine Types ──────────────────────────────────────────────────

  public type RiskEvent = {
    id : Text;
    name : Text;
    startDate : Int;
    endDate : Int;
    affectedZIPs : [Text];
    multiplier : Float;
    fileUrl : Text;
    createdAt : Int;
  };

  public type PredictionEngineState = {
    weatherToggle : Bool;
    paydayToggle : Bool;
    stressToggle : Bool;
    potencyToggle : Bool;
    sensitivitySlider : Nat;
    avgDailyHandoffCount : Nat;
    simulationEnabled : Bool;
  };

  // ── Prediction Engine State ───────────────────────────────────────────────────

  var predictionEngineState : PredictionEngineState = {
    weatherToggle = false;
    paydayToggle = true;
    stressToggle = false;
    potencyToggle = false;
    sensitivitySlider = 50;
    avgDailyHandoffCount = 12;
    simulationEnabled = true;
  };

  var riskEvents : [RiskEvent] = [];

  // ── Seed Init ────────────────────────────────────────────────────────────────
  // One-time seed: only fires when canister is empty (fresh install, not upgrade)
  do {
    if (providers.isEmpty()) {
      let seedProviders : [(Text, Text, Float, Float, Text)] = [
        ("p-01", "Coleman Health Services - Akron", 41.0534, -81.5185, "MAT Clinic"),
        ("p-02", "Oriana House - Akron MAT", 41.0814, -81.5198, "MAT Clinic"),
        ("p-03", "Quest Recovery Center - Cleveland", 41.4993, -81.6944, "MAT Clinic"),
        ("p-04", "The Centers for Families and Children", 41.5085, -81.6954, "MAT Clinic"),
        ("p-05", "Signature Health - Mentor", 41.6662, -81.3396, "MAT Clinic"),
        ("p-06", "Meridian HealthCare - Youngstown", 41.0998, -80.6495, "MAT Clinic"),
        ("p-07", "Crossroads Health - Lake County", 41.5931, -81.5240, "Narcan Distribution"),
        ("p-08", "Northeast Ohio Neighborhood Health (NEON)", 41.4637, -81.6769, "Narcan Distribution"),
        ("p-09", "Recovery Resources Cleveland", 41.5140, -81.6023, "Narcan Distribution"),
        ("p-10", "Akron General Medical Center ER", 41.0814, -81.5198, "Emergency Room"),
        ("p-11", "MetroHealth Medical Center ER - Cleveland", 41.4732, -81.6996, "Emergency Room"),
        ("p-12", "Cleveland Clinic Main Campus ER", 41.5031, -81.6219, "Emergency Room"),
        ("p-13", "St. Elizabeth Youngstown Hospital ER", 41.0959, -80.6537, "Emergency Room"),
        ("p-14", "The Centers Naloxone Vending - Cuyahoga", 41.4993, -81.6944, "Naloxone Kiosk/Vending Machine"),
        ("p-15", "Massillon PD Naloxone Kiosk", 40.7967, -81.5218, "Naloxone Kiosk/Vending Machine"),
        ("p-16", "Jackson PD Naloxone Kiosk", 40.5534, -81.9985, "Naloxone Kiosk/Vending Machine"),
        ("p-17", "Spero Health Ohio - Telehealth MAT", 41.4993, -81.6944, "Telehealth MAT"),
        ("p-18", "Eagle HealthWorks - Telehealth MAT Ohio", 41.0534, -81.5185, "Telehealth MAT"),
      ];
      for ((id, name, lat, lng, providerType) in seedProviders.vals()) {
        providers.add(
          id,
          {
            id;
            name;
            lat;
            lng;
            isLive = true;
            lastVerified = Time.now();
            providerType;
            is_verified = true;
            is_active = true;
            inventory = "";
            reputationScore = 85;
          },
        );
      };
    };

    // Seed dummy Ohio community helpers if none exist
    if (helpers.isEmpty()) {
      let seedHelpers : [(Text, Text, Text, Text, Text, Text, Text)] = [
        ("h-01", "Marcus", "Johnson", "mjohnson@recoveryohio.org", "44101", "216-555-0142", "Peer Support Specialist"),
        ("h-02", "Tamara", "Williams", "t.williams@cuyahogahealth.org", "44105", "216-555-0287", "Community Health Worker"),
        ("h-03", "Derek", "Okonkwo", "derek.o@volunteerrides.org", "44115", "216-555-0319", "Transportation Volunteer"),
        ("h-04", "Lisa", "Hernandez", "lhernandez@narcanohio.org", "44202", "330-555-0461", "Naloxone Distributor"),
        ("h-05", "James", "Carter", "jcarter@recoverycoachnetwork.org", "43201", "614-555-0573", "Recovery Coach"),
        ("h-06", "Angela", "Moss", "angela.moss@familysupport.org", "45201", "513-555-0694", "Family Support Advocate"),
        ("h-07", "Kevin", "Patel", "kpatel@warmhandoffs.org", "44135", "216-555-0718", "Warm Handoff Coordinator"),
        ("h-08", "Renee", "Thompson", "rthompson@outreachohio.org", "43235", "614-555-0832", "Volunteer Outreach Worker"),
      ];
      var helperIdx : Nat = 0;
      for ((id, firstName, lastName, email, zip, phone, helpType) in seedHelpers.vals()) {
        helpers.add(id, {
          id;
          firstName;
          lastName;
          email;
          zip;
          phone;
          helpType;
          consent = true;
          note = "";
          createdAt = Time.now() - (helperIdx * 86_400_000_000_000);
        });
        helperIdx += 1;
      };
    };

    // Seed demo citizen reports if none exist
    if (citizenReports.isEmpty()) {
      let seedReports : [(Text, Text, Text, Text, Float, Float)] = [
        ("report-seed-01", "44101", "narcan-used", "Narcan administered near West Side Market. Person responsive.", 41.4842, -81.7022),
        ("report-seed-02", "44105", "check-in", "Community outreach team active on W. 25th. Resources available.", 41.4645, -81.7157),
        ("report-seed-03", "44115", "narcan-used", "Two kits distributed at laundromat on E. 55th. All safe.", 41.4937, -81.6601),
        ("report-seed-04", "44202", "area-concern", "Increased activity near Rt. 82 corridor. Peers checking in.", 41.2706, -81.3399),
        ("report-seed-05", "43201", "resource-found", "New drop-in hours at Columbus Recovery Center. Open weekends.", 39.9784, -82.9989),
        ("report-seed-06", "45201", "narcan-used", "Narcan kit from vending machine used successfully downtown.", 39.1031, -84.5120),
      ];
      var reportIdx : Nat = 0;
      for ((id, zipCode, activityType, content, lat, lng) in seedReports.vals()) {
        citizenReports.add(id, {
          id;
          zipCode;
          activityType;
          content;
          upvotes = 0;
          lat = ?lat;
          lng = ?lng;
          createdAt = Time.now() - (reportIdx * 3_600_000_000_000);
        });
        reportIdx += 1;
      };
    };

    // Seed harm reduction inventory for kiosk, ER, and MAT providers if not already seeded
    if (harmReductionInventory.isEmpty()) {
      let kioskItems : [HarmReductionItem] = [
        { itemType = "narcan_kits"; available = true; quantity = ?(20 : Nat); notes = ?"Free, no questions asked" },
        { itemType = "fentanyl_test_strips"; available = true; quantity = ?(50 : Nat); notes = ?"Free, legal in Ohio" },
        { itemType = "clean_syringes"; available = true; quantity = ?(100 : Nat); notes = ?"Needle exchange, no questions asked" },
        { itemType = "sharps_disposal"; available = true; quantity = null; notes = ?"Drop box available 24/7" },
        { itemType = "wound_care"; available = true; quantity = ?(30 : Nat); notes = ?"Basic wound care kits" },
        { itemType = "alcohol_swabs"; available = true; quantity = ?(200 : Nat); notes = ?"Available at all hours" },
      ];
      let erMatItems : [HarmReductionItem] = [
        { itemType = "narcan_kits"; available = true; quantity = null; notes = ?"Available on request" },
        { itemType = "wound_care"; available = true; quantity = null; notes = ?"Clinical wound care available" },
        { itemType = "alcohol_swabs"; available = true; quantity = null; notes = ?"Standard medical supplies" },
      ];
      for ((pid, p) in providers.entries()) {
        if (p.providerType == "Naloxone Kiosk/Vending Machine") {
          harmReductionInventory.add(pid, kioskItems);
        } else if (p.providerType == "Emergency Room" or p.providerType == "MAT Clinic") {
          harmReductionInventory.add(pid, erMatItems);
        };
      };
    };
  };

  // ── Prediction Engine Functions ───────────────────────────────────────────────

  public shared ({ caller }) func setPredictionEngineState(state : PredictionEngineState) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can update prediction engine state");
    };
    predictionEngineState := state;
  };

  public query func getPredictionEngineState() : async PredictionEngineState {
    predictionEngineState;
  };

  public shared ({ caller }) func addRiskEvent(event : RiskEvent) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can add risk events");
    };
    riskEvents := riskEvents.concat([event]);
    event.id;
  };

  public shared ({ caller }) func removeRiskEvent(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can remove risk events");
    };
    let before = riskEvents.size();
    riskEvents := riskEvents.filter(func(e) { e.id != id });
    riskEvents.size() < before;
  };

  public shared ({ caller }) func updateRiskEvent(id : Text, event : RiskEvent) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can update risk events");
    };
    var found = false;
    riskEvents := riskEvents.map(func(e) {
      if (e.id == id) { found := true; event } else e
    });
    found;
  };

  public query func getRiskEvents() : async [RiskEvent] {
    riskEvents;
  };

  // ── HTTP Outcall Cache State ──────────────────────────────────────────────────

  // Cache: last weather fetch timestamp (seconds) and result
  var lastWeatherFetchSecs : Int = 0;
  var cachedWeatherRisk : Float = 1.0;

  // Cache: last alerts fetch timestamp (seconds) and result
  var lastAlertsFetchSecs : Int = 0;
  var cachedAlertsText : Text = "No active weather alerts";

  // Cache: last social stress fetch timestamp (seconds) and result
  var lastStressFetchSecs : Int = 0;
  var cachedSocialStress : [(Text, Float)] = [];

  // ── Helper: nowSecs ───────────────────────────────────────────────────────────

  func nowSecs() : Int {
    Time.now() / 1_000_000_000;
  };

  // ── getWeatherRisk ────────────────────────────────────────────────────────────
  // Calls NWS gridpoint forecast for Cleveland. Returns 1.25 if temp < 32°F or
  // "Severe"/"Warning" in forecast. Returns 1.0 on any error. Caches 3600s.
  public func getWeatherRisk() : async Float {
    let nowS = nowSecs();
    // Return cached value if fresh
    if (nowS - lastWeatherFetchSecs < 3600 and lastWeatherFetchSecs > 0) {
      return cachedWeatherRisk;
    };

    let url = "https://api.weather.gov/gridpoints/CLE/66,75/forecast";
    try {
      let response = await (with cycles = 220_000_000_000) ic.http_request({
        url;
        max_response_bytes = ?(50_000 : Nat64);
        method = #get;
        headers = [
          { name = "Accept"; value = "application/geo+json" },
          { name = "User-Agent"; value = "LiveNowRecovery/1.0 (sentinel@livenowrecovery.org)" },
        ];
        body = null;
        transform = null;
        is_replicated = ?false;
      });

      if (response.status == 200) {
        let bodyText = switch (response.body.decodeUtf8()) {
          case null { "" };
          case (?t) { t };
        };

        // Check for severe/warning keywords (case-insensitive via toLower)
        let bodyLower = bodyText.toLower();
        let hasSevere = bodyLower.contains(#text "severe") or bodyLower.contains(#text "warning");

        // Look for first "temperature" field and check if < 32°F
        var isCold = false;
        // Split on "temperature": to get the part after the key, then read the number
        let tempParts = bodyText.split(#text "\"temperature\":").toArray();
        if (tempParts.size() > 1) {
          let afterKey = tempParts[1];
          let numText = Text.fromIter(afterKey.toIter().takeWhile(func(c : Char) : Bool {
            (c >= '0' and c <= '9') or c == '-'
          }));
          switch (Int.fromText(numText)) {
            case null {};
            case (?tempF) { if (tempF < 32) { isCold := true } };
          };
        };

        let risk : Float = if (hasSevere or isCold) 1.25 else 1.0;
        lastWeatherFetchSecs := nowS;
        cachedWeatherRisk := risk;
        risk;
      } else {
        1.0;
      };
    } catch (_) {
      1.0;
    };
  };

  // ── getWeatherAlerts ──────────────────────────────────────────────────────────
  // Calls NWS active alerts for Ohio. Returns summary string. Caches 900s (15 min).
  public func getWeatherAlerts() : async Text {
    let nowS = nowSecs();
    if (nowS - lastAlertsFetchSecs < 900 and lastAlertsFetchSecs > 0) {
      return cachedAlertsText;
    };

    let url = "https://api.weather.gov/alerts/active?area=OH";
    try {
      let response = await (with cycles = 220_000_000_000) ic.http_request({
        url;
        max_response_bytes = ?(100_000 : Nat64);
        method = #get;
        headers = [
          { name = "Accept"; value = "application/geo+json" },
          { name = "User-Agent"; value = "LiveNowRecovery/1.0 (sentinel@livenowrecovery.org)" },
        ];
        body = null;
        transform = null;
        is_replicated = ?false;
      });

      if (response.status == 200) {
        let bodyText = switch (response.body.decodeUtf8()) {
          case null { "" };
          case (?t) { t };
        };

        // Count "event": occurrences as proxy for alert count
        let alertCount = bodyText.split(#text "\"event\":").toArray().size();
        // split gives N+1 parts for N occurrences — subtract 1 for the part before first match
        let count = if (alertCount > 0) alertCount - 1 else 0;

        let result = if (count == 0) {
          "No active weather alerts";
        } else {
          count.toText() # " active weather alert(s) in Ohio";
        };

        lastAlertsFetchSecs := nowS;
        cachedAlertsText := result;
        result;
      } else {
        "Weather alert service unavailable";
      };
    } catch (_) {
      "Weather alert service unavailable";
    };
  };

  // ── getSocialStressBaseline ───────────────────────────────────────────────────
  // Calls Census ACS S1201 for Ohio ZIPs. Returns (ZIP, multiplier) pairs where
  // (divorced% + separated%) > 15% → 1.15x multiplier. Caches 14400s (4 hrs).
  public func getSocialStressBaseline() : async [(Text, Float)] {
    let nowS = nowSecs();
    if (nowS - lastStressFetchSecs < 14400 and lastStressFetchSecs > 0) {
      return cachedSocialStress;
    };

    // S1201_C04_001E = divorced %, S1201_C05_001E = separated % (Ohio ZIPs)
    let url = "https://api.census.gov/data/2022/acs/acs5/subject?get=NAME,S1201_C04_001E,S1201_C05_001E&for=zip+code+tabulation+area:*&in=state:39";
    try {
      let response = await (with cycles = 500_000_000_000) ic.http_request({
        url;
        max_response_bytes = ?(2_000_000 : Nat64);
        method = #get;
        headers = [
          { name = "Accept"; value = "application/json" },
          { name = "User-Agent"; value = "LiveNowRecovery/1.0 (sentinel@livenowrecovery.org)" },
        ];
        body = null;
        transform = null;
        is_replicated = ?false;
      });

      if (response.status == 200) {
        let bodyText = switch (response.body.decodeUtf8()) {
          case null { "" };
          case (?t) { t };
        };

        // Census returns JSON array of arrays. Each row (after header) is:
        // ["ZCTA5 44101","8","3","44101"]
        // fields: name, divorced%, separated%, zip
        // Split by row delimiter "]," — rows[0] is header, skip it.
        var results : [(Text, Float)] = [];
        let rows = bodyText.split(#text "],").toArray();
        var i = 1;
        while (i < rows.size()) {
          let row = rows[i];
          let fields = row.split(#text ",").toArray();
          // Need at least 4 fields: name, divorced%, separated%, zip
          if (fields.size() >= 4) {
            let rawZip = fields[fields.size() - 1];
            // Strip JSON syntax chars from zip
            let zip = rawZip
              .replace(#text "\"", "")
              .replace(#text "]", "")
              .replace(#text "[", "")
              .trim(#text " ");

            let divorcedRaw = fields[1].replace(#text "\"", "").trim(#text " ");
            let separatedRaw = fields[2].replace(#text "\"", "").trim(#text " ");

            switch (Nat.fromText(divorcedRaw), Nat.fromText(separatedRaw)) {
              case (?divorced, ?separated) {
                // Values are already percentages (e.g. 8 = 8%)
                let combinedPct : Float = (divorced + separated).toFloat();
                if (combinedPct > 15.0) {
                  results := results.concat([(zip, 1.15)]);
                };
              };
              case _ {};
            };
          };
          i += 1;
        };

        lastStressFetchSecs := nowS;
        cachedSocialStress := results;
        results;
      } else {
        [];
      };
    } catch (_) {
      [];
    };
  };

  // ── Internal helper function ─────────────────────────────────────────────────

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

  // ── Simulation Stats Functions ────────────────────────────────────────────────

  // getSimulationStats — public query, returns cumulative simulation counters
  public query func getSimulationStats() : async {
    totalSimHandoffs : Nat;
    totalSimScans : Nat;
    totalSimVolunteers : Nat;
    simulationStartTime : Int;
  } {
    {
      totalSimHandoffs;
      totalSimScans;
      totalSimVolunteers;
      simulationStartTime;
    };
  };

  // incrementSimulationStats — public update, accumulates handoff and scan counts
  public shared func incrementSimulationStats(handoffs : Nat, scans : Nat) : async () {
    totalSimHandoffs += handoffs;
    totalSimScans += scans;
  };

  // setSimulationVolunteers — public update, sets volunteer count
  public shared func setSimulationVolunteers(count : Nat) : async () {
    totalSimVolunteers := count;
  };

  // initSimulationTime — public update, sets simulationStartTime to now on first call only
  public shared func initSimulationTime() : async () {
    if (simulationStartTime == 0) {
      simulationStartTime := Time.now();
    };
  };

  // ── Provider Posts ────────────────────────────────────────────────────────────

  // addProviderPost — provider-only; returns new post ID
  public shared ({ caller }) func addProviderPost(providerId : Text, content : Text, imageUrl : ?Text) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    let id = "post-".concat(Time.now().toText());
    let post : ProviderPost = {
      id;
      providerId;
      content;
      imageUrl;
      createdAt = Time.now();
    };
    providerPosts.add(id, post);
    id;
  };

  // getProviderPosts — public query; returns all posts for a provider
  public query func getProviderPosts(providerId : Text) : async [ProviderPost] {
    let filtered = providerPosts.values().toArray().filter(
      func(p : ProviderPost) : Bool { p.providerId == providerId }
    );
    filtered.sort(func(a : ProviderPost, b : ProviderPost) : Order.Order {
      // descending: compare b to a
      Int.compare(b.createdAt, a.createdAt)
    });
  };

  // ── Citizen Reports (NO-PHI) ──────────────────────────────────────────────────

  // submitCitizenReport — anonymous OK; returns new report ID
  public shared func submitCitizenReport(zipCode : Text, activityType : Text, content : Text, lat : ?Float, lng : ?Float) : async Text {
    if (zipCode.size() == 0) {
      Runtime.trap("ZIP code is required");
    };
    if (content.size() > 280) {
      Runtime.trap("Content exceeds 280 character limit");
    };
    let id = "report-".concat(Time.now().toText());
    let report : CitizenReport = {
      id;
      zipCode;
      activityType;
      content;
      upvotes = 0;
      lat;
      lng;
      createdAt = Time.now();
    };
    citizenReports.add(id, report);
    // Add a risk boost entry for this report's ZIP based on activity type
    let boostAmount : Float = if (activityType == "overdose" or activityType == "bad-batch") {
      0.5;
    } else if (activityType == "narcan-used") {
      0.3;
    } else if (activityType == "area-concern") {
      0.2;
    } else {
      0.1; // check-in, resource-found, etc.
    };
    let expiresAt : Int = Time.now() + 86_400_000_000_000; // 24h in nanoseconds
    citizenReportRiskBoosts := citizenReportRiskBoosts.concat([(zipCode, boostAmount, expiresAt)]);
    id;
  };

  // getReportsByZip — public query; returns reports for a ZIP code
  public query func getReportsByZip(zipCode : Text) : async [CitizenReport] {
    let filtered = citizenReports.values().toArray().filter(
      func(r : CitizenReport) : Bool { r.zipCode == zipCode }
    );
    filtered.sort(func(a : CitizenReport, b : CitizenReport) : Order.Order {
      Int.compare(b.createdAt, a.createdAt)
    });
  };

  // getAllReports — public query; returns all reports for the map layer
  public query func getAllReports() : async [CitizenReport] {
    let all = citizenReports.values().toArray();
    let sorted = all.sort(func(a : CitizenReport, b : CitizenReport) : Order.Order {
      Int.compare(b.createdAt, a.createdAt)
    });
    // Limit to most recent 100 to prevent performance issues
    if (sorted.size() <= 100) {
      sorted;
    } else {
      sorted.sliceToArray(0, 100);
    };
  };

  // upvoteCitizenReport — anonymous OK; returns true if report was found and upvoted
  public shared func upvoteCitizenReport(reportId : Text) : async Bool {
    switch (citizenReports.get(reportId)) {
      case (null) { false };
      case (?report) {
        citizenReports.add(reportId, { report with upvotes = report.upvotes + 1 });
        true;
      };
    };
  };

  // ── Recovery Profiles ─────────────────────────────────────────────────────────

  // createRecoveryProfile — caller-authenticated; returns profile ID (principal text)
  public shared ({ caller }) func createRecoveryProfile(displayName : Text, zip : Text) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    // Idempotent: return existing profile ID if already exists
    let profileId = caller.toText();
    let profile : RecoveryProfile = {
      id = profileId;
      displayName;
      zip;
      favoriteProviders = [];
      resourcesUsed = [];
      createdAt = Time.now();
    };
    // Only create if not already present
    switch (recoveryProfiles.get(caller)) {
      case (?existing) { existing.id };
      case (null) {
        recoveryProfiles.add(caller, profile);
        profileId;
      };
    };
  };

  // getRecoveryProfile — caller-authenticated; returns caller's own profile
  public query ({ caller }) func getRecoveryProfile() : async ?RecoveryProfile {
    recoveryProfiles.get(caller);
  };

  // addFavoriteProvider — caller-authenticated; returns true on success
  public shared ({ caller }) func addFavoriteProvider(providerId : Text) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    switch (recoveryProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        // Deduplicate: only add if not already present
        let alreadyPresent = profile.favoriteProviders.find(func(id : Text) : Bool { id == providerId });
        switch (alreadyPresent) {
          case (?_) { true }; // already in list, no-op but success
          case (null) {
            let updated = { profile with favoriteProviders = profile.favoriteProviders.concat([providerId]) };
            recoveryProfiles.add(caller, updated);
            true;
          };
        };
      };
    };
  };

  // removeFavoriteProvider — caller-authenticated; returns true on success
  public shared ({ caller }) func removeFavoriteProvider(providerId : Text) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    switch (recoveryProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        let before = profile.favoriteProviders.size();
        let filtered = profile.favoriteProviders.filter(func(id : Text) : Bool { id != providerId });
        let removed = filtered.size() < before;
        if (removed) {
          recoveryProfiles.add(caller, { profile with favoriteProviders = filtered });
        };
        removed;
      };
    };
  };

  // markResourceUsed — caller-authenticated; returns true on success
  public shared ({ caller }) func markResourceUsed(resourceCategory : Text) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    switch (recoveryProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        let alreadyMarked = profile.resourcesUsed.find(func(r : Text) : Bool { r == resourceCategory });
        switch (alreadyMarked) {
          case (?_) { true }; // already marked, idempotent
          case (null) {
            let updated = { profile with resourcesUsed = profile.resourcesUsed.concat([resourceCategory]) };
            recoveryProfiles.add(caller, updated);
            true;
          };
        };
      };
    };
  };

  // ── Testimonials ──────────────────────────────────────────────────────────────

  // storeTestimonial — anonymous callers allowed; displayName is alias, not real name (NO-PHI)
  public shared ({ caller }) func storeTestimonial(displayName : Text, zipCode : Text, content : Text) : async CoreTypes.Result<Text, Text> {
    if (content.size() > 500) {
      return #err("Content exceeds 500 character limit");
    };
    if (displayName.size() == 0) {
      return #err("Display name is required");
    };
    if (zipCode.size() == 0) {
      return #err("ZIP code is required");
    };
    let id = "testimonial-" # Time.now().toText();
    let authorId = if (caller.isAnonymous()) { "anon-" # id } else { caller.toText() };
    let t : Testimonial = {
      id;
      authorId;
      authorDisplayName = displayName;
      zipCode;
      content;
      isApproved = false;
      isHidden = false;
      createdAt = Time.now();
    };
    testimonials := testimonials.concat([(id, t)]);
    #ok(id);
  };

  // getApprovedTestimonials — public query; returns only approved and not hidden
  public query func getApprovedTestimonials() : async [Testimonial] {
    testimonials
      .filter(func((_, t) : (Text, Testimonial)) : Bool { t.isApproved and not t.isHidden })
      .map(func((_, t) : (Text, Testimonial)) : Testimonial { t });
  };

  // getAllTestimonialsAdmin — admin-only query; returns all testimonials
  public query ({ caller }) func getAllTestimonialsAdmin() : async [Testimonial] {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can view all testimonials");
    };
    testimonials.map(func((_, t) : (Text, Testimonial)) : Testimonial { t });
  };

  // approveTestimonial — admin-only; sets isApproved=true
  public shared ({ caller }) func approveTestimonial(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can approve testimonials");
    };
    var found = false;
    testimonials := testimonials.map<(Text, Testimonial), (Text, Testimonial)>(func((tid, t) : (Text, Testimonial)) : (Text, Testimonial) {
      if (tid == id) {
        found := true;
        (tid, { t with isApproved = true });
      } else {
        (tid, t);
      }
    });
    found;
  };

  // hideTestimonial — admin-only; sets isHidden=true
  public shared ({ caller }) func hideTestimonial(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can hide testimonials");
    };
    var found = false;
    testimonials := testimonials.map<(Text, Testimonial), (Text, Testimonial)>(func((tid, t) : (Text, Testimonial)) : (Text, Testimonial) {
      if (tid == id) {
        found := true;
        (tid, { t with isHidden = true });
      } else {
        (tid, t);
      }
    });
    found;
  };

  // getTestimonialCount — public query; returns total count of all testimonials
  public query func getTestimonialCount() : async Nat {
    testimonials.size();
  };

  // ── Citizen Report Risk Boosts ────────────────────────────────────────────────

  // getActiveRiskBoosts — public query; returns (zipCode, boostAmount) for non-expired boosts
  // Expired entries are pruned on each call
  public shared func getActiveRiskBoosts() : async [(Text, Float)] {
    let now = Time.now();
    // Prune expired entries
    citizenReportRiskBoosts := citizenReportRiskBoosts.filter(
      func((_, _, expiresAt) : (Text, Float, Int)) : Bool { expiresAt > now }
    );
    // Return (zipCode, boostAmount) pairs, aggregating by ZIP
    let boostMap = Map.empty<Text, Float>();
    for ((zip, boost, _) in citizenReportRiskBoosts.vals()) {
      let current = switch (boostMap.get(zip)) {
        case null { 0.0 };
        case (?v) { v };
      };
      boostMap.add(zip, current + boost);
    };
    boostMap.entries().toArray();
  };

  // flagCitizenReport — admin-only; adds report ID to flaggedReports list
  public shared ({ caller }) func flagCitizenReport(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can flag reports");
    };
    // Check report exists
    switch (citizenReports.get(id)) {
      case null { false };
      case (?_) {
        // Idempotent: only add if not already flagged
        let alreadyFlagged = flaggedReports.find(func(fid : Text) : Bool { fid == id });
        switch (alreadyFlagged) {
          case (?_) { true };
          case null {
            flaggedReports := flaggedReports.concat([id]);
            true;
          };
        };
      };
    };
  };

  // ── Admin Overview Helpers ────────────────────────────────────────────────────

  // getHelperCount — public query; returns total number of helper signups
  public query func getHelperCount() : async Nat {
    helpers.size();
  };

  // ── Harm Reduction Inventory Functions ───────────────────────────────────────

  // setHarmReductionInventory — admin or provider; sets harm reduction items for a provider
  public shared ({ caller }) func setHarmReductionInventory(providerId : Text, items : [HarmReductionItem]) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers are not allowed");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or isAdminLegacy(caller))) {
      Runtime.trap("Unauthorized: Only admins can set harm reduction inventory");
    };
    harmReductionInventory.add(providerId, items);
  };

  // getHarmReductionInventory — public query; returns harm reduction items for a provider
  public query func getHarmReductionInventory(providerId : Text) : async [HarmReductionItem] {
    switch (harmReductionInventory.get(providerId)) {
      case null { [] };
      case (?items) { items };
    };
  };

  // getProvidersByHarmReductionItem — public query; returns providers stocking a specific item type
  public query func getProvidersByHarmReductionItem(itemType : Text) : async [ProviderWithStatus] {
    // Collect provider IDs that have the requested item available
    var matchingIds : [Text] = [];
    for ((pid, items) in harmReductionInventory.entries()) {
      let hasItem = items.find(func(item : HarmReductionItem) : Bool {
        item.itemType == itemType and item.available
      });
      switch (hasItem) {
        case (?_) { matchingIds := matchingIds.concat([pid]) };
        case null {};
      };
    };
    // Map matching IDs to ProviderWithStatus
    var results : [ProviderWithStatus] = [];
    for (pid in matchingIds.vals()) {
      switch (providers.get(pid)) {
        case null {};
        case (?p) {
          results := results.concat([{
            id = p.id;
            name = p.name;
            lat = p.lat;
            lng = p.lng;
            isLive = p.isLive;
            lastVerified = p.lastVerified;
            status = resolveStatus(p);
            providerType = p.providerType;
            is_verified = p.is_verified;
            is_active = p.is_active;
            inventory = p.inventory;
            reputationScore = p.reputationScore;
          }]);
        };
      };
    };
    results;
  };
}
