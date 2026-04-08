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
    note: string;
    createdAt: bigint;
    phone: string;
    firstName: string;
}
export interface ProviderWithStatus {
    id: string;
    lat: number;
    lng: number;
    status: ProviderStatus;
    name: string;
    isLive: boolean;
    lastVerified: bigint;
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
    getEmergencyActive(): Promise<Array<ProviderWithStatus>>;
    getHandoffCountsByZip(): Promise<Array<[string, bigint]>>;
    getTotalHandoffs(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    heartbeat(): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    receiveRiskPacket(packet: RiskPacket): Promise<void>;
    registerHelper(firstName: string, zip: string, phone: string, note: string): Promise<void>;
    registerProvider(id: string, name: string, lat: number, lng: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleLive(id: string, status: boolean): Promise<void>;
    verifyHandoff(token: string): Promise<VerifyResult>;
}
