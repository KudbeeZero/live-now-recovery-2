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
export interface RiskPacket {
    status: boolean;
    data_source: string;
    last_update_time: bigint;
    provider_id: string;
    risk_score: bigint;
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
export interface UserProfile {
    name: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateHandoffToken(zipCode: string): Promise<string>;
    getAllHelpers(): Promise<Array<Helper>>;
    getAllProviders(): Promise<Array<ProviderWithStatus>>;
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
    getHandoffCountsByZip(): Promise<Array<[string, bigint]>>;
    getMarketplaceGeoJSON(): Promise<string>;
    getTotalCostPlusReferrals(): Promise<bigint>;
    getTotalHandoffs(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    receiveRiskPacket(packet: RiskPacket): Promise<void>;
    recordCostPlusReferral(providerId: string): Promise<void>;
    registerHelper(firstName: string, lastName: string, email: string, zip: string, phone: string, helpType: string, consent: boolean, note: string): Promise<void>;
    registerProvider(id: string, name: string, lat: number, lng: number, providerType: string): Promise<void>;
    runHeartbeat(): Promise<Array<string>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setEmergencyActive(isActive: boolean): Promise<void>;
    setProviderActiveStatus(id: string, status: boolean): Promise<void>;
    toggleLive(id: string, status: boolean): Promise<void>;
    updateInventory(id: string, newInventory: string): Promise<void>;
    verifyHandoff(token: string): Promise<VerifyResult>;
    verifyProvider(id: string): Promise<void>;
}
