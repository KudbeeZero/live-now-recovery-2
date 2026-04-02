import { useEffect, useState } from "react";

function checkEmergencyMode(): boolean {
  try {
    const now = new Date();
    const etFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
      weekday: "short",
    });
    const parts = etFormatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === "hour");
    const weekdayPart = parts.find((p) => p.type === "weekday");
    const hour = hourPart ? Number.parseInt(hourPart.value, 10) : 0;
    const weekday = weekdayPart?.value ?? "";
    const isWeekend = weekday === "Sat" || weekday === "Sun";
    const isAfterHours = hour >= 17; // 5 PM ET
    return isWeekend || isAfterHours;
  } catch {
    return false;
  }
}

export function useEmergencyMode(): boolean {
  const [isEmergency, setIsEmergency] = useState(() => checkEmergencyMode());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsEmergency(checkEmergencyMode());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return isEmergency;
}
