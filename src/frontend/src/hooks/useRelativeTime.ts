import { useEffect, useRef, useState } from "react";

/**
 * Converts a nanosecond timestamp (bigint, number, or string) to milliseconds.
 */
function nanoToMs(nano: bigint | number | string): number {
  if (typeof nano === "bigint") return Number(nano / 1_000_000n);
  if (typeof nano === "string") {
    try {
      return Number(BigInt(nano) / 1_000_000n);
    } catch {
      return Number(nano) / 1_000_000;
    }
  }
  return nano / 1_000_000;
}

/**
 * Formats a millisecond timestamp as a human-readable relative string.
 */
export function formatRelativeMs(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

/**
 * A reactive hook that accepts a nanosecond timestamp and returns a live
 * relative-time string (e.g. "8 min ago") that refreshes every 30 seconds.
 *
 * Falls back gracefully to an empty string if the timestamp is nullish.
 */
export function useRelativeTime(
  rawTimestamp: bigint | number | string | null | undefined,
): string {
  const [label, setLabel] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (rawTimestamp === null || rawTimestamp === undefined) {
      setLabel("");
      return;
    }

    const ms = nanoToMs(rawTimestamp);

    const compute = () => setLabel(formatRelativeMs(ms));
    compute();

    intervalRef.current = setInterval(compute, 30_000);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [rawTimestamp]);

  return label;
}
