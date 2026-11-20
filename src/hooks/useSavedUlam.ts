"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS, SYNC_EVENTS } from "@/lib/backupStorage";

const STORAGE_KEY = STORAGE_KEYS.savedSlugs;

export const SAVED_UPDATED_EVENT = SYNC_EVENTS.savedSlugs;
export const SAVED_ULAM_FILTER_EVENT = "saved-ulam-filter";

export interface UseSavedUlamResult {
  savedSlugs: string[];
  toggleSaved: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  savedCount: number;
  isHydrated: boolean;
}

function sanitizeSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.filter((slug): slug is string => typeof slug === "string"))];
}

function readSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeSlugs(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function requestSavedUlamFilter(saved: boolean): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(SAVED_ULAM_FILTER_EVENT, { detail: { saved } }));
}

export function useSavedUlam(): UseSavedUlamResult {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSavedSlugs(readSavedSlugs());
    setIsHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        setSavedSlugs(readSavedSlugs());
      }
    }

    function handleSavedUpdated(event: Event) {
      const detail = (event as CustomEvent<{ slugs?: unknown }>).detail;
      setSavedSlugs(detail && Array.isArray(detail.slugs) ? sanitizeSlugs(detail.slugs) : readSavedSlugs());
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(SAVED_UPDATED_EVENT, handleSavedUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SAVED_UPDATED_EVENT, handleSavedUpdated);
    };
  }, []);

  const toggleSaved = useCallback(
    (slug: string) => {
      const updated = savedSlugs.includes(slug)
        ? savedSlugs.filter((item) => item !== slug)
        : [...savedSlugs, slug];

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      setSavedSlugs(updated);
      window.dispatchEvent(new CustomEvent(SAVED_UPDATED_EVENT, { detail: { slugs: updated } }));
    },
    [savedSlugs],
  );

  const isSaved = useCallback(
    (slug: string) => isHydrated && savedSlugs.includes(slug),
    [isHydrated, savedSlugs],
  );

  return {
    savedSlugs,
    toggleSaved,
    isSaved,
    savedCount: isHydrated ? savedSlugs.length : 0,
    isHydrated,
  };
}
