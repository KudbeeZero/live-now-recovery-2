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
    approveTestimonial(id: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createRecoveryProfile(displayName: string, zip: string): Promise<string>;
    flagCitizenReport(id: string): Promise<boolean>;
    generateHandoffToken(zipCode: string): Promise<string>;
    getActiveRiskBoosts(): Promise<Array<[string, number]>>;
    getAllHelpers(): Promise<Array<Helper>>;
    getAllProviders(): Promise<Array<ProviderWithStatus>>;
    getAllReports(): Promise<Array<CitizenReport>>;
    getAllTestimonialsAdmin(): Promise<Array<Testimonial>>;
    getApprovedTestimonials(): Promise<Array<Testimonial>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCanisterState(): Promise<CanisterStateSummary>;
    getCostPlusReferralCount(providerId: string): Promise<bigint>;
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
    getTotalCostPlusReferrals(): Promise<bigint>;
    getTotalHandoffs(): Promise<bigint>;
    getTouchpointData(): Promise<Array<TouchpointRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeatherAlerts(): Promise<string>;
    getWeatherRisk(): Promise<number>;
    hideTestimonial(id: string): Promise<boolean>;
    incrementSimulationStats(handoffs: bigint, scans: bigint): Promise<void>;
    initSimulationTime(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markResourceUsed(resourceCategory: string): Promise<boolean>;
    receiveRiskPacket(packet: RiskPacket): Promise<void>;
    recordCostPlusReferral(providerId: string): Promise<void>;
    recordTouchpoint(agentId: string, _zip: string): Promise<void>;
    registerHelper(firstName: string, lastName: string, email: string, zip: string, phone: string, helpType: string, consent: boolean, note: string): Promise<void>;
    registerProvider(id: string, name: string, lat: number, lng: number, providerType: string): Promise<void>;
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
    updateInventory(id: string, newInventory: string): Promise<void>;
    updateRiskEvent(id: string, event: RiskEvent): Promise<boolean>;
    upvoteCitizenReport(reportId: string): Promise<boolean>;
    verifyHandoff(token: string): Promise<VerifyResult>;
    verifyProvider(id: string): Promise<void>;
}
