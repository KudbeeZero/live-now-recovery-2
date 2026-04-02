import { ProviderStatus } from "../backend";

// HARD RULE: must be exactly 14_400_000_000_000n nanoseconds (4 hours)
const FOUR_HOURS_NS = 14_400_000_000_000n;

export function isProviderStale(lastVerified: bigint): boolean {
  const nowNs = BigInt(Date.now()) * 1_000_000n; // ms → ns
  return nowNs - lastVerified > FOUR_HOURS_NS;
}

export function statusLabel(status: ProviderStatus): string {
  if (status === ProviderStatus.Live) return "Live";
  if (status === ProviderStatus.Offline) return "Offline";
  return "Unknown";
}

export function statusColor(status: ProviderStatus): string {
  if (status === ProviderStatus.Live) return "#00A896";
  if (status === ProviderStatus.Offline) return "#6B7280";
  return "#F59E0B";
}
