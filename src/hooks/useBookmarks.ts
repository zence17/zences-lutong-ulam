"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "zences-lutong-ulam:bookmarks";

function readStoredBookmarks(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export interface UseBookmarksResult {
  bookmarks: string[];
  isReady: boolean;
  isBookmarked: (slug: string) => boolean;
  toggleBookmark: (slug: string) => void;
}

export function useBookmarks(): UseBookmarksResult {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setBookmarks(readStoredBookmarks());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      return;
    }
  }, [bookmarks, isReady]);

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarks((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }, []);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.includes(slug),
    [bookmarks],
  );

  return { bookmarks, isReady, isBookmarked, toggleBookmark };
}
