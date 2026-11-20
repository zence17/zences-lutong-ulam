"use client";

import { Bookmark } from "lucide-react";
import { useSavedUlam } from "@/hooks/useSavedUlam";

interface BookmarkButtonProps {
  slug: string;
  title: string;
  className?: string;
  showLabel?: boolean;
}

export function BookmarkButton({
  slug,
  title,
  className = "",
  showLabel = false,
}: BookmarkButtonProps) {
  const { isSaved, toggleSaved, isHydrated } = useSavedUlam();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      aria-pressed={isHydrated ? saved : undefined}
      aria-busy={!isHydrated}
      aria-label={
        isHydrated
          ? saved
            ? `Remove ${title} from Saved Ulam`
            : `Save ${title}`
          : "Loading saved ulam state"
      }
      disabled={!isHydrated}
      onClick={() => toggleSaved(slug)}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
        saved
          ? "border-adobo bg-adobo text-white hover:bg-adobo-dark"
          : "border-charcoal/15 bg-white text-charcoal hover:border-adobo/40 hover:text-adobo"
      } ${className}`}
    >
      <Bookmark size={16} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      {showLabel ? <span>{saved ? "Saved" : "Save Ulam"}</span> : null}
    </button>
  );
}
