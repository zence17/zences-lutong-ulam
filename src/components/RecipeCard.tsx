"use client";

import Link from "next/link";
import { ArrowRight, Clock, Heart } from "lucide-react";
import { usePriceOverrides } from "@/hooks/usePriceOverrides";
import { usePriceSource } from "@/hooks/usePriceSource";
import { useSavedUlam } from "@/hooks/useSavedUlam";
import { calculateRecipeCost, calculateRefMatch, formatPHP } from "@/lib/costCalculator";
import type { Recipe } from "@/types/recipe";
import { CategoryBadge } from "./CategoryBadge";
import { DishIllustration } from "./DishIllustration";

export function RecipeCard({
  recipe,
  ownedIngredientIds = [],
}: {
  recipe: Recipe;
  ownedIngredientIds?: string[];
}) {
  const { priceSource, isSupermarket } = usePriceSource();
  const { overrides } = usePriceOverrides();
  const cost = calculateRecipeCost(recipe, recipe.baseServings, priceSource, overrides);
  const refMatch = calculateRefMatch(
    recipe,
    ownedIngredientIds,
    recipe.baseServings,
    priceSource,
    overrides,
  );
  const totalTime = recipe.prepTimeMins + recipe.cookTimeMins;
  const { isSaved, toggleSaved, isHydrated } = useSavedUlam();
  const saved = isSaved(recipe.slug);
  const href = recipe.isCustom
    ? `/recipes/custom?id=${encodeURIComponent(recipe.slug)}`
    : `/recipes/${recipe.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-adobo/40 hover:shadow-lg">
      <button
        type="button"
        aria-label={
          isHydrated
            ? saved
              ? `Remove ${recipe.title} from Saved Ulam`
              : `Save ${recipe.title}`
            : "Loading saved ulam state"
        }
        aria-pressed={isHydrated ? saved : undefined}
        aria-busy={!isHydrated}
        disabled={!isHydrated}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleSaved(recipe.slug);
        }}
        className={`no-print absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition-colors disabled:cursor-wait disabled:opacity-60 ${
          saved
            ? "border-adobo bg-adobo text-white hover:bg-adobo-dark"
            : "border-charcoal/15 text-charcoal/75 hover:border-adobo hover:text-adobo"
        }`}
      >
        <Heart size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      </button>

      <Link
        href={href}
        className="flex h-full flex-col rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adobo"
      >
        <div className="relative">
          <DishIllustration
            category={recipe.category}
            slug={recipe.slug}
            image={recipe.image}
            alt={recipe.title}
            variant="card"
          />
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 shadow-sm backdrop-blur">
            <CategoryBadge category={recipe.category} />
          </span>
          {recipe.isCustom ? (
            <span className="absolute left-3 top-14 z-10 rounded-full bg-adobo px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
              My Recipe
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/75">
            <Clock size={13} aria-hidden="true" />
            {totalTime} mins total · {recipe.baseServings} pax
          </p>

          <h3 className="mt-2 text-lg font-extrabold leading-tight tracking-tight text-charcoal">
            {recipe.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">{recipe.tagline}</p>

          <div className="mt-auto pt-4">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-cream p-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-charcoal/75">
                  Cost per serving
                </p>
                <p className="mt-1 text-xl font-black tracking-tight text-adobo">
                  {formatPHP(cost.costPerServing, { forceDecimals: true })}
                </p>
              </div>
              <div className="border-l border-charcoal/10 pl-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-charcoal/75">
                  {isSupermarket ? "Est. Supermarket Total" : "Est. Palengke Total"}
                </p>
                <p className="mt-1 text-sm font-extrabold leading-snug text-charcoal">
                  ~{formatPHP(cost.estimatedPalengkeOutOfPocket)}{" "}
                  {isSupermarket ? "supermarket (+15%) total" : "palengke total"}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-charcoal/75">
                  for {recipe.baseServings} pax
                </p>
              </div>
            </div>

            {refMatch.matchCount > 0 && (
              <span className="mt-3 inline-flex rounded-full bg-calamansi px-2.5 py-1 text-[11px] font-bold text-white">
                Has {refMatch.matchCount} ref item{refMatch.matchCount === 1 ? "" : "s"} • Save ~{formatPHP(refMatch.estimatedSavings)}
              </span>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-calamansi-soft px-2.5 py-1 text-[11px] font-bold text-calamansi">
                {cost.budgetTier}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-adobo transition-colors group-hover:text-adobo-dark">
                View recipe
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
