import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { AdminSettings } from "../backend";

/** Polls AdminSettings every 5 minutes and renders site-wide banners. */
function useAdminBanners() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminSettings | null>({
    queryKey: ["adminSettings", "banners"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getAdminSettings();
      } catch (err) {
        console.warn("[SiteBanners] getAdminSettings failed:", err);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5 * 60_000, // 5 minutes
    staleTime: 4 * 60_000,
    retry: 1,
  });
}

export function SiteBanners() {
  const { data: settings } = useAdminBanners();

  if (!settings) return null;

  return (
    <>
      {/* Emergency Broadcast — highest priority */}
      {settings.emergencyBroadcastEnabled && (
        <div
          role="alert"
          aria-live="assertive"
          style={{ zIndex: 9999 }}
          className="fixed top-0 left-0 right-0 flex items-center justify-center gap-2 px-4 py-2.5
            bg-red-950/90 border-b border-red-700/70 text-red-200 text-sm font-medium
            backdrop-blur-sm"
          data-ocid="site.emergency_broadcast_banner"
        >
          <span className="text-red-400 animate-pulse" aria-hidden="true">
            ⚠
          </span>
          <span>
            {settings.emergencyBroadcastMessage?.trim() ||
              "Emergency Alert Active — Please check local resources"}
          </span>
        </div>
      )}

      {/* Maintenance Mode — below emergency if both active */}
      {settings.maintenanceModeEnabled && (
        <output
          aria-live="polite"
          style={{
            zIndex: 9998,
            top: settings.emergencyBroadcastEnabled ? "44px" : "0",
          }}
          className="fixed left-0 right-0 flex items-center justify-center gap-2 px-4 py-2
            bg-amber-950/80 border-b border-amber-700/60 text-amber-200 text-sm
            backdrop-blur-sm"
          data-ocid="site.maintenance_banner"
        >
          <span aria-hidden="true">🔧</span>
          <span>
            Scheduled maintenance in progress — some features may be temporarily
            unavailable
          </span>
        </output>
      )}
    </>
  );
}
