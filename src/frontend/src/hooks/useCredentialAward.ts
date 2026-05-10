/**
 * useCredentialAward
 * Detects when a new credential appears for the current user and queues it
 * for display in CredentialAwardModal — one at a time, FIFO.
 *
 * - Reads from useUserCredentials (live canister data)
 * - Persists the set of seen credential IDs in sessionStorage so the modal
 *   doesn't re-fire on every page reload (only new ones trigger it)
 * - Returns { awardedCredential, dismissAward }
 */
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Credential } from "../types/credentials";
import { useUserCredentials } from "./useCredentials";

const STORAGE_KEY = "lnr_seen_credential_ids";

function loadSeenIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids: Set<string>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // sessionStorage unavailable — silently ignore
  }
}

export interface UseCredentialAwardReturn {
  awardedCredential: Credential | null;
  dismissAward: () => void;
}

export function useCredentialAward(): UseCredentialAwardReturn {
  const { identity } = useInternetIdentity();
  const principal = identity ? identity.getPrincipal() : null;
  const { data: credentials } = useUserCredentials(principal);

  const seenRef = useRef<Set<string>>(loadSeenIds());
  const queueRef = useRef<Credential[]>([]);
  const [awardedCredential, setAwardedCredential] = useState<Credential | null>(
    null,
  );
  // Guard: don't re-show while one is already visible
  const showingRef = useRef(false);

  const advanceRef = useRef<() => void>(() => {});
  advanceRef.current = () => {
    const next = queueRef.current.shift();
    if (next) {
      showingRef.current = true;
      setAwardedCredential(next);
    } else {
      showingRef.current = false;
      setAwardedCredential(null);
    }
  };

  const dismissAward = useCallback(() => {
    // Small delay so exit animation finishes before next badge triggers
    setTimeout(() => advanceRef.current(), 400);
  }, []);

  // Detect new credentials and advance queue
  useEffect(() => {
    if (!credentials || credentials.length === 0) return;

    const newOnes: Credential[] = [];
    for (const cred of credentials) {
      const key = cred.id.toString();
      if (!seenRef.current.has(key)) {
        seenRef.current.add(key);
        newOnes.push(cred);
      }
    }

    if (newOnes.length === 0) return;

    saveSeenIds(seenRef.current);
    newOnes.sort((a, b) => Number(a.earnedAt - b.earnedAt));
    queueRef.current.push(...newOnes);

    if (!showingRef.current) {
      advanceRef.current();
    }
  }, [credentials]);

  return { awardedCredential, dismissAward };
}
