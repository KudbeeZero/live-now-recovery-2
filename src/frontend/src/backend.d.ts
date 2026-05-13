import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type VerifyResult = {
    __kind__: "Ok";
    Ok: string;
} | {
    __kind__: "NotFound";
    NotFound: null;
} | {
    __kind__: "Expired";
    Expired: null;
} | {
    __kind__: "AlreadyUsed";
    AlreadyUsed: null;
};
export interface GlobalImpactStats {
    totalImpactScore: bigint;
    activeContributors: bigint;
    totalBadgesMinted: bigint;
}
export interface RiskEvent {
    id: string;
    multiplier: number;
    endDate: bigint;
    affectedZIPs: Array<string>;
    name: string;
    createdAt: bigint;
    startDate: bigint;
    fileUrl: string;
}
export interface ProfileUpdate {
    bio?: string;
    zip?: string;
    displayName?: string;
    city?: string;
    role?: string;
    privacyPublic?: boolean;
    skills?: Array<string>;
}
export interface CitizenReport {
    id: string;
    lat?: number;
    lng?: number;
    upvotes: bigint;
    activityType: string;
    content: string;
    createdAt: bigint;
    zipCode: string;
}
export interface AdminSettings {
    maintenanceModeEnabled: boolean;
    sentinelSensitivity: string;
    autoApproveProviders: boolean;
    emergencyBroadcastEnabled: boolean;
    emergencyBroadcastMessage: string;
    notifyOnNewProvider: boolean;
    notifyOnNewReport: boolean;
    notifyOnNewCredential: boolean;
    notifyOnNewVolunteer: boolean;
}
export interface Credential {
    id: bigint;
    verifier?: Principal;
    impactScore: bigint;
    badgeSvg?: string;
    owner: Principal;
    metadata?: string;
    name: string;
    credentialType: CredentialType;
    tier: Tier;
    description: string;
    cardMetadata?: string;
    earnedAt: bigint;
}
export interface VolunteerProfile {
    id: bigint;
    bio: string;
    zip: string;
    principal?: Principal;
    displayName: string;
    impactScore: bigint;
    city: string;
    joinedAt: bigint;
    role: string;
    privacyPublic: boolean;
    skills: Array<string>;
}
export interface ProviderWithStatus {
    id: string;
    lat: number;
    lng: number;
    status: ProviderStatus;
    reputationScore: bigint;
    inventory: string;
    name: string;
    isLive: boolean;
    lastVerified: bigint;
    is_verified: boolean;
    providerType: string;
    is_active: boolean;
}
export interface TouchpointRecord {
    touchpoints: bigint;
    agentId: string;
    totalSaved: number;
    isStabilized: boolean;
}
export interface RecoveryProfile {
    id: string;
    zip: string;
    resourcesUsed: Array<string>;
    displayName: string;
    createdAt: bigint;
    favoriteProviders: Array<string>;
}
export type Result = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface RiskPacket {
    status: boolean;
    data_source: string;
    last_update_time: bigint;
    provider_id: string;
    risk_score: bigint;
}
export interface ProviderPost {
    id: string;
    content: string;
    createdAt: bigint;
    imageUrl?: string;
    providerId: string;
}
export interface CanisterStateSummary {
    active_providers: Array<[string, bigint, boolean]>;
    total_active_providers: bigint;
    high_risk_window_active: boolean;
}
export interface Helper {
    id: string;
    zip: string;
    consent: boolean;
    note: string;
    createdAt: bigint;
    email: string;
    helpType: string;
    phone: string;
    lastName: string;
    firstName: string;
}
export interface PredictionEngineState {
    avgDailyHandoffCount: bigint;
    potencyToggle: boolean;
    sensitivitySlider: bigint;
    weatherToggle: boolean;
    simulationEnabled: boolean;
    stressToggle: boolean;
    paydayToggle: boolean;
}
export interface HarmReductionItem {
    available: boolean;
    notes?: string;
    itemType: string;
    quantity?: bigint;
}
export type Tier = string;
export interface UserProfile {
    name: string;
}
export interface Testimonial {
    id: string;
    isApproved: boolean;
    content: string;
    authorId: string;
    createdAt: bigint;
    zipCode: string;
    isHidden: boolean;
    authorDisplayName: string;
}
export enum CredentialType {
    BridgeProvider = "BridgeProvider",
    PolicyPioneer = "PolicyPioneer",
    NarcanHero = "NarcanHero",
    CommunityArchitect = "CommunityArchitect",
    MATChampion = "MATChampion",
    RecoveryNavigator = "RecoveryNavigator",
    SentinelVerified = "SentinelVerified",
    CommunitySentinel = "CommunitySentinel",
    StorySharer = "StorySharer",
    ThirtyDayGuide = "ThirtyDayGuide",
    RecoveryAlly = "RecoveryAlly",
    FirstResponder = "FirstResponder"
}
export enum ProviderStatus {
    Live = "Live",
    Offline = "Offline",
    Unknown = "Unknown"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFavoriteProvider(providerId: string): Promise<boolean>;
    addProviderPost(providerId: string, content: string, imageUrl: string | null): Promise<string>;
    addRiskEvent(event: RiskEvent): Promise<string>;
    adminMintCredential(owner: Principal, credType: CredentialType, metadata: string | null): Promise<bigint>;
    /**
     * / Populates 18 demo credential records across all 12 types and 4 tiers.
     * / Guard: no-op if credentials already exist.
     * / Call once after fresh deploy to populate the leaderboard and gallery.
     */
    adminSeedCredentials(): Promise<string>;
    approveTestimonial(id: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkAndAutoMint(owner: Principal, actionType: string, count: bigint): Promise<void>;
    createRecoveryProfile(displayName: string, zip: string): Promise<string>;
    flagCitizenReport(id: string): Promise<boolean>;
    generateHandoffToken(zipCode: string): Promise<string>;
    getActiveRiskBoosts(): Promise<Array<[string, number]>>;
    getAdminNotificationPrefs(): Promise<{
        notifyOnNewProvider: boolean;
        notifyOnNewReport: boolean;
        notifyOnNewCredential: boolean;
        notifyOnNewVolunteer: boolean;
    }>;
    getAdminSettings(): Promise<AdminSettings>;
    getAllHelpers(): Promise<Array<Helper>>;
    getAllProviders(): Promise<Array<ProviderWithStatus>>;
    getAllPublicBadges(): Promise<Array<[Principal, bigint]>>;
    getAllPublicVolunteers(): Promise<Array<VolunteerProfile>>;
    getAllReports(): Promise<Array<CitizenReport>>;
    getAllTestimonialsAdmin(): Promise<Array<Testimonial>>;
    getApprovedTestimonials(): Promise<Array<Testimonial>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCanisterState(): Promise<CanisterStateSummary>;
    getCostPlusReferralCount(providerId: string): Promise<bigint>;
    getCredentialById(id: bigint): Promise<Credential | null>;
    getEmergencyActive(): Promise<Array<ProviderWithStatus>>;
    getEmergencyBridgeStatus(): Promise<{
        activatedAt: bigint;
        activatedBy: string;
        isActive: boolean;
    }>;
    getFiscalData(): Promise<{
        communityReinvestmentFund: number;
        stabilityPipelinePercent: number;
        livesSaved: number;
        stabilizedAgents: bigint;
        touchpointCount: bigint;
        dollarsSaved: number;
    }>;
    getGlobalImpactStats(): Promise<GlobalImpactStats>;
    getHandoffCountsByZip(): Promise<Array<[string, bigint]>>;
    getHarmReductionInventory(providerId: string): Promise<Array<HarmReductionItem>>;
    getHelperCount(): Promise<bigint>;
    getMarketplaceGeoJSON(): Promise<string>;
    getPredictionEngineState(): Promise<PredictionEngineState>;
    getProviderPosts(providerId: string): Promise<Array<ProviderPost>>;
    getProvidersByHarmReductionItem(itemType: string): Promise<Array<ProviderWithStatus>>;
    getRecoveryProfile(): Promise<RecoveryProfile | null>;
    getReportsByZip(zipCode: string): Promise<Array<CitizenReport>>;
    getRiskEvents(): Promise<Array<RiskEvent>>;
    getSimulationStats(): Promise<{
        totalSimHandoffs: bigint;
        totalSimScans: bigint;
        totalSimVolunteers: bigint;
        simulationStartTime: bigint;
    }>;
    getSocialStressBaseline(): Promise<Array<[string, number]>>;
    getTestimonialCount(): Promise<bigint>;
    getTopContributors(limit: bigint): Promise<Array<[Principal, bigint, Array<string>]>>;
    getTotalCostPlusReferrals(): Promise<bigint>;
    getTotalHandoffs(): Promise<bigint>;
    getTouchpointData(): Promise<Array<TouchpointRecord>>;
    getUserCredentials(principal: Principal): Promise<Array<Credential>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTimeline(owner: Principal): Promise<Array<Credential>>;
    getVolunteer(id: bigint): Promise<VolunteerProfile | null>;
    getVolunteerByPrincipal(principal: Principal): Promise<VolunteerProfile | null>;
    getWeatherAlerts(): Promise<string>;
    getWeatherRisk(): Promise<number>;
    hasCredential(principal: Principal, credType: CredentialType): Promise<boolean>;
    hideTestimonial(id: string): Promise<boolean>;
    incrementSimulationStats(handoffs: bigint, scans: bigint): Promise<void>;
    initSimulationTime(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markResourceUsed(resourceCategory: string): Promise<boolean>;
    mintCredential(owner: Principal, credType: CredentialType, metadata: string | null, verifier: Principal | null): Promise<bigint>;
    receiveRiskPacket(packet: RiskPacket): Promise<void>;
    recordCostPlusReferral(providerId: string): Promise<void>;
    recordTouchpoint(agentId: string, _zip: string): Promise<void>;
    registerHelper(firstName: string, lastName: string, email: string, zip: string, phone: string, helpType: string, consent: boolean, note: string): Promise<void>;
    registerProvider(id: string, name: string, lat: number, lng: number, providerType: string): Promise<void>;
    registerVolunteerProfile(displayName: string, role: string, city: string, zip: string, bio: string, skills: Array<string>, privacyPublic: boolean): Promise<bigint>;
    removeFavoriteProvider(providerId: string): Promise<boolean>;
    removeRiskEvent(id: string): Promise<boolean>;
    resetFiscalData(): Promise<void>;
    runHeartbeat(): Promise<Array<string>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setEmergencyActive(isActive: boolean): Promise<void>;
    setHarmReductionInventory(providerId: string, items: Array<HarmReductionItem>): Promise<void>;
    setPredictionEngineState(state: PredictionEngineState): Promise<void>;
    setProviderActiveStatus(id: string, status: boolean): Promise<void>;
    setSimulationVolunteers(count: bigint): Promise<void>;
    storeTestimonial(displayName: string, zipCode: string, content: string): Promise<Result>;
    submitCitizenReport(zipCode: string, activityType: string, content: string, lat: number | null, lng: number | null): Promise<string>;
    toggleLive(id: string, status: boolean): Promise<void>;
    updateAdminSettings(settings: AdminSettings): Promise<void>;
    updateInventory(id: string, newInventory: string): Promise<void>;
    updateRiskEvent(id: string, event: RiskEvent): Promise<boolean>;
    updateVolunteerProfile(id: bigint, upd: ProfileUpdate): Promise<boolean>;
    upvoteCitizenReport(reportId: string): Promise<boolean>;
    verifyHandoff(token: string): Promise<VerifyResult>;
    verifyProvider(id: string): Promise<void>;
    volunteerCount(): Promise<bigint>;
}
