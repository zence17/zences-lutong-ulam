"use client";

import { useMemo, useState } from "react";
import { Clock, Heart, Lightbulb, Minus, Plus, RotateCcw, ShoppingBasket, Wallet } from "lucide-react";
import { CopyListButton } from "@/components/CopyListButton";
import { KitchenTimer } from "@/components/KitchenTimer";
import { priceMetadata as defaultPriceMetadata } from "@/data/ingredients";
import { usePriceSource } from "@/hooks/usePriceSource";
import { useSavedUlam } from "@/hooks/useSavedUlam";
import {
  calculateRecipeCost,
  formatAmount,
  formatPHP,
  formatRecipePalengkeText,
} from "@/lib/costCalculator";
import type { Recipe } from "@/types/recipe";

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 20;
const QUICK_SERVINGS = [2, 4, 6, 8] as const;

interface PriceMetadata {
  readonly location: string;
  readonly lastUpdated: string;
}

interface RecipeDetailClientProps {
  recipe: Recipe;
  priceMetadata?: PriceMetadata;
}

export function RecipeDetailClient({
  recipe,
  priceMetadata = defaultPriceMetadata,
}: RecipeDetailClientProps) {
  const [servings, setServings] = useState(recipe.baseServings);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set());
  const { priceSource, isSupermarket } = usePriceSource();
  const cost = useMemo(
    () => calculateRecipeCost(recipe, servings, priceSource),
    [priceSource, recipe, servings],
  );
  const { isSaved, toggleSaved, isHydrated } = useSavedUlam();
  const saved = isSaved(recipe.slug);

  const toggleIngredient = (ingredientId: string) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      return next;
    });
  };

  const resetChecklist = () => setCheckedIds(new Set());

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
      <div className="space-y-8">
        <section
          aria-labelledby="steps-heading"
          className="rounded-3xl border border-charcoal/10 bg-white p-6 shadow-card sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-adobo">Kitchen guide</p>
          <h2 id="steps-heading" className="mt-2 text-2xl font-black tracking-tight">
            How to cook
          </h2>

          <ol className="mt-7 space-y-7">
            {recipe.steps.map((step, index) => (
              <li key={step.id} className="flex gap-4 sm:gap-5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-adobo text-sm font-black text-white"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-base leading-8 text-charcoal/80 sm:text-lg">
                    {step.instruction}
                  </p>
                  {step.durationMins ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-adobo-dark">
                      <Clock size={14} aria-hidden="true" />
                      about {step.durationMins} min
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <KitchenTimer defaultCookMins={recipe.cookTimeMins} dishTitle={recipe.title} />

        <section
          aria-labelledby="tip-heading"
          className="rounded-3xl border border-adobo/20 bg-adobo-soft p-6 sm:p-8"
        >
          <h2 id="tip-heading" className="flex items-center gap-2 text-lg font-extrabold text-adobo-dark">
            <Lightbulb size={20} aria-hidden="true" />
            Zence&apos;s Tipid Kusina Tip
          </h2>
          <p className="mt-3 text-base leading-8 text-charcoal/75">{recipe.tipidTip}</p>
        </section>
      </div>

      <section
        aria-labelledby="cost-heading"
        className="overflow-hidden rounded-3xl border border-adobo/15 bg-white shadow-card lg:sticky lg:top-24"
      >
        <div className="border-b border-adobo/10 bg-adobo-soft px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-adobo">
                {isSupermarket ? "Supermarket cost planner (+15% est.)" : "Palengke cost planner"}
              </p>
              <h2 id="cost-heading" className="mt-1 text-lg font-extrabold tracking-tight">
                Scale your ulam
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                onClick={() => toggleSaved(recipe.slug)}
                className={`no-print inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                  saved
                    ? "border-adobo bg-adobo text-white hover:bg-adobo-dark"
                    : "border-adobo/20 bg-white text-adobo hover:border-adobo hover:bg-adobo-soft"
                }`}
              >
                <Heart size={16} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
                {saved ? "Saved" : "Save Ulam"}
              </button>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-adobo">
                {cost.budgetTier}
              </span>
            </div>
          </div>

          <fieldset className="mt-5">
            <legend className="text-xs font-bold uppercase tracking-[0.14em] text-adobo-dark">
              Serving size
            </legend>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="Decrease servings"
                disabled={servings <= MIN_SERVINGS}
                onClick={() => setServings((current) => Math.max(MIN_SERVINGS, current - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-adobo/20 bg-white text-adobo transition-colors hover:bg-adobo hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus size={18} aria-hidden="true" />
              </button>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Quick serving sizes">
                {QUICK_SERVINGS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={servings === preset}
                    onClick={() => setServings(preset)}
                    className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-bold transition-colors ${
                      servings === preset
                        ? "border-adobo bg-adobo text-white"
                        : "border-adobo/20 bg-white text-charcoal/70 hover:border-adobo/50 hover:text-adobo"
                    }`}
                  >
                    {preset} pax
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-label="Increase servings"
                disabled={servings >= MAX_SERVINGS}
                onClick={() => setServings((current) => Math.min(MAX_SERVINGS, current + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-adobo/20 bg-white text-adobo transition-colors hover:bg-adobo hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
            <p
              aria-live="polite"
              aria-atomic="true"
              className="mt-3 text-xs font-semibold text-adobo-dark"
            >
              Cooking for {servings} pax · {formatAmount(cost.scaleFactor)}× the base recipe
            </p>
          </fieldset>
        </div>

        <div className="grid gap-px bg-charcoal/10 sm:grid-cols-3">
          <div className="min-w-0 bg-white px-5 py-4 sm:px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-charcoal/75">
              Cost per serving
            </p>
            <p className="mt-1.5 text-lg font-black tracking-tight text-adobo sm:text-xl">
              {formatPHP(cost.costPerServing, { forceDecimals: true })}
              <span className="ml-1 text-xs font-bold text-charcoal/75">/ pax</span>
            </p>
          </div>
          <div className="min-w-0 bg-white px-5 py-4 sm:px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-charcoal/75">
              Exact ingredient cost
            </p>
            <p className="mt-1.5 text-lg font-black tracking-tight sm:text-xl">
              {formatPHP(cost.totalExactCost, { forceDecimals: true })}
            </p>
          </div>
          <div className="min-w-0 bg-calamansi-soft px-5 py-4 sm:px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-calamansi">
              {isSupermarket ? "Est. supermarket out-of-pocket" : "Est. palengke out-of-pocket"}
            </p>
            <p className="mt-1.5 text-lg font-black tracking-tight text-calamansi sm:text-xl">
              {formatPHP(cost.estimatedPalengkeOutOfPocket)}
            </p>
          </div>
        </div>

        <p className="border-b border-charcoal/10 bg-cream/70 px-5 py-3 text-xs leading-relaxed text-charcoal/75 sm:px-6">
          Exact cost is only what the recipe uses; out-of-pocket rounds each item up to the smallest
          pack you can actually buy.
          {isSupermarket ? " Supermarket values are a +15% estimate over palengke prices." : ""}
        </p>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <ShoppingBasket size={16} className="text-adobo" aria-hidden="true" />
              {isSupermarket ? "Supermarket & prep checklist" : "Palengke & prep checklist"}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <CopyListButton
                getText={() =>
                  formatRecipePalengkeText(recipe, servings, [...checkedIds], priceSource)
                }
                label={isSupermarket ? "Copy Supermarket List" : "Copy Palengke List"}
                className="text-xs"
              />
              {checkedIds.size > 0 ? (
                <button
                  type="button"
                  onClick={resetChecklist}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-charcoal/15 px-3 text-xs font-bold text-charcoal/75 transition-colors hover:border-adobo/40 hover:text-adobo"
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  Reset checklist
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-1 text-xs text-charcoal/75">Tap items as you shop or prep.</p>

          <div className="mt-3 divide-y divide-charcoal/10">
            {cost.ingredients.map((item) => {
              const checkboxId = `${recipe.slug}-${item.ingredientId}`;
              const checked = checkedIds.has(item.ingredientId);

              return (
                <div key={item.ingredientId} className="flex items-start gap-3 py-2.5">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleIngredient(item.ingredientId)}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-charcoal/30 accent-adobo"
                  />
                  <label
                    htmlFor={checkboxId}
                    className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-start justify-between gap-3 py-1"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span
                          className={`text-sm font-extrabold text-adobo ${
                            checked ? "text-charcoal/75 line-through decoration-charcoal/30" : ""
                          }`}
                        >
                          {formatAmount(item.amount)} {item.unit}
                        </span>
                        <span
                          className={`text-sm font-semibold leading-snug ${
                            checked ? "text-charcoal/75 line-through decoration-charcoal/30" : ""
                          }`}
                        >
                          {item.name}
                        </span>
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-charcoal/75">
                        {item.displayAmount} ·{" "}
                        {isSupermarket ? "Supermarket pack" : "Palengke ref"}: {item.palengkePackLabel}
                        {item.packsNeeded > 1 ? ` × ${item.packsNeeded}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span
                        className={`block text-sm font-bold ${
                          checked ? "text-charcoal/75 line-through decoration-charcoal/30" : ""
                        }`}
                      >
                        {formatPHP(item.exactCost, { forceDecimals: true })}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-adobo-dark">
                        buy {formatPHP(item.outOfPocketCost)}
                      </span>
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-2 border-t border-charcoal/10 bg-cream/70 px-5 py-4 text-xs leading-relaxed text-charcoal/75 sm:px-6">
          <Wallet size={15} className="mt-0.5 shrink-0 text-adobo" aria-hidden="true" />
          <p>
            Prices: {priceMetadata.location}, {priceMetadata.lastUpdated}. Actual costs may vary by
            vendor, season, and store.
          </p>
        </div>
      </section>
    </div>
  );
}
