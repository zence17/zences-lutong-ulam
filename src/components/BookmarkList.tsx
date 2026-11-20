"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useSavedUlam } from "@/hooks/useSavedUlam";
import type { Recipe } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";

export function BookmarkList({ recipes }: { recipes: Recipe[] }) {
  const { savedSlugs, isHydrated } = useSavedUlam();
  const { customRecipes, isHydrated: areCustomRecipesHydrated } = useCustomRecipes();

  if (!isHydrated || !areCustomRecipesHydrated) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading saved recipes">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-2xl border border-charcoal/10 bg-white/70"
          />
        ))}
      </div>
    );
  }

  const savedRecipes = [...customRecipes, ...recipes].filter((recipe) =>
    savedSlugs.includes(recipe.slug),
  );

  if (savedRecipes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-charcoal/20 bg-white/60 px-6 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-adobo-soft text-adobo">
          <Heart size={24} aria-hidden="true" />
        </span>
        <p className="mt-4 text-lg font-extrabold">No saved ulam yet.</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-charcoal/75">
          Tap the heart on any recipe to keep your family favorites here. Saved recipes stay on this
          device only.
        </p>
        <Link
          href="/recipes"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-adobo px-5 py-2.5 text-sm font-bold text-white hover:bg-adobo-dark"
        >
          Browse recipes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-charcoal/75">
        {savedRecipes.length} saved {savedRecipes.length === 1 ? "recipe" : "recipes"}
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {savedRecipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
