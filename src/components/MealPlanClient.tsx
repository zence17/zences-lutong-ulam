"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  RotateCcw,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { CopyListButton } from "@/components/CopyListButton";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useMealPlan } from "@/hooks/useMealPlan";
import { usePriceOverrides } from "@/hooks/usePriceOverrides";
import { usePriceSource } from "@/hooks/usePriceSource";
import {
  DAYS_OF_WEEK,
  calculateRecipeCost,
  calculateWeeklyPlan,
  formatAmount,
  formatPHP,
  formatWeeklyPalengkeText,
} from "@/lib/costCalculator";
import type { IngredientCategory, IngredientUnit, Recipe, RecipeCategory } from "@/types/recipe";

interface MealPlanClientProps {
  recipes: Recipe[];
}

interface RecipeCostOption {
  recipe: Recipe;
  perServing: number;
  householdPalengkeCost: number;
}

const SERVING_OPTIONS = [2, 4, 6, 8] as const;

const GROCERY_CATEGORY_ORDER: IngredientCategory[] = [
  "Karne & Isda",
  "Gulay & Prutas",
  "Pantry & Sari-Sari",
];

function formatUnitLabel(unit: IngredientUnit, amount: number): string {
  if (unit === "pcs") return amount === 1 ? "pc" : "pcs";
  if (unit === "cloves") return amount === 1 ? "clove" : "cloves";
  if (unit === "sachet") return amount === 1 ? "sachet" : "sachets";
  return unit;
}

export default function MealPlanClient({ recipes }: MealPlanClientProps) {
  const { customRecipes } = useCustomRecipes();
  const allRecipes = useMemo(() => [...customRecipes, ...recipes], [customRecipes, recipes]);
  const { priceSource, isSupermarket } = usePriceSource();
  const { overrides, overrideCount } = usePriceOverrides();
  const {
    plan,
    servings,
    weeklyBudget,
    assignRecipe,
    setServings,
    setWeeklyBudget,
    autoFillTipidWeek,
    clearWeek,
    isHydrated,
  } = useMealPlan(allRecipes, priceSource, overrides);

  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    () => new Set<string>(),
  );

  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const budgetHeadingId = `${uid}-budget-heading`;
  const budgetInputId = `${uid}-budget-input`;
  const budgetHintId = `${uid}-budget-hint`;
  const progressLabelId = `${uid}-progress-label`;
  const scheduleHeadingId = `${uid}-schedule-heading`;
  const groceryHeadingId = `${uid}-grocery-heading`;

  const weekly = useMemo(
    () => calculateWeeklyPlan(plan, servings, priceSource, allRecipes, overrides),
    [allRecipes, overrides, plan, priceSource, servings],
  );

  const recipeCostById = useMemo(() => {
    const entries = allRecipes.map((recipe): [string, RecipeCostOption] => {
      const cost = calculateRecipeCost(recipe, recipe.baseServings, priceSource, overrides);
      const householdCost = calculateRecipeCost(recipe, servings, priceSource, overrides);
      return [
        recipe.slug,
        {
          recipe,
          perServing: cost.costPerServing,
          householdPalengkeCost: householdCost.estimatedPalengkeOutOfPocket,
        },
      ];
    });
    return new Map(entries);
  }, [allRecipes, overrides, priceSource, servings]);

  const recipeOptionsByCategory = useMemo(() => {
    const groups = new Map<RecipeCategory, Recipe[]>();
    for (const recipe of allRecipes) {
      const group = groups.get(recipe.category) ?? [];
      group.push(recipe);
      groups.set(recipe.category, group);
    }
    return [...groups.entries()];
  }, [allRecipes]);

  const groceryGroups = useMemo(
    () =>
      GROCERY_CATEGORY_ORDER.map((category) => ({
        category,
        items: weekly.consolidatedGroceryList.filter((item) => item.category === category),
      })).filter((group) => group.items.length > 0),
    [weekly.consolidatedGroceryList],
  );

  const budgetDifference = weeklyBudget - weekly.consolidatedPalengkeCost;
  const isOverBudget = budgetDifference < 0;
  const progressPercent =
    weeklyBudget > 0
      ? Math.min(100, Math.max(0, (weekly.consolidatedPalengkeCost / weeklyBudget) * 100))
      : weekly.consolidatedPalengkeCost > 0
        ? 100
        : 0;
  const checkedCount = weekly.consolidatedGroceryList.filter((item) =>
    checkedIngredients.has(item.ingredientId),
  ).length;

  function toggleIngredient(ingredientId: string) {
    setCheckedIngredients((current) => {
      const next = new Set(current);
      if (next.has(ingredientId)) next.delete(ingredientId);
      else next.add(ingredientId);
      return next;
    });
  }

  function handleAutoFill() {
    autoFillTipidWeek();
    setCheckedIngredients(new Set<string>());
  }

  function handleClear() {
    clearWeek();
    setCheckedIngredients(new Set<string>());
  }

  if (!isHydrated) {
    return (
      <div className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-card">
        <div className="h-4 w-32 animate-pulse rounded-full bg-charcoal/10" />
        <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded-full bg-charcoal/10" />
        <p className="mt-6 text-sm font-semibold text-charcoal/75">
          Loading your saved weekly plan…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-charcoal/10 bg-white p-5 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-adobo">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Budget overview
            </p>
            <h2 id={budgetHeadingId} className="mt-2 text-2xl font-black text-charcoal sm:text-3xl">
              Plan the week, shop once.
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal/75">
              Pick an ulam for each day. We scale every recipe to your household and combine
              repeated ingredients into one {isSupermarket ? "supermarket" : "palengke"} list.
            </p>
            {isSupermarket ? (
              <p className="mt-2 text-xs font-semibold text-adobo">
                Supermarket estimate active: +15% over palengke reference prices.
              </p>
            ) : null}
            {overrideCount > 0 ? (
              <p className="mt-2 text-xs font-semibold text-calamansi">
                Using {overrideCount} of your palengke price{overrideCount === 1 ? "" : "s"}.
              </p>
            ) : null}
          </div>

          <form onSubmit={(event) => event.preventDefault()} className="grid gap-4 sm:grid-cols-2">
            <fieldset className="rounded-2xl border border-charcoal/10 bg-cream/60 p-3">
              <legend className="px-1 text-xs font-extrabold uppercase tracking-wider text-charcoal/75">
                Household servings
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SERVING_OPTIONS.map((option) => (
                  <label
                    key={option}
                    htmlFor={`${uid}-servings-${option}`}
                    className={`flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-bold transition-colors ${
                      servings === option
                        ? "border-adobo bg-adobo text-white"
                        : "border-charcoal/15 bg-white text-charcoal/75 hover:border-adobo/40"
                    }`}
                  >
                    <input
                      id={`${uid}-servings-${option}`}
                      name="servings"
                      type="radio"
                      value={option}
                      checked={servings === option}
                      onChange={() => setServings(option)}
                      className="sr-only"
                    />
                    {option} pax
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="rounded-2xl border border-charcoal/10 bg-cream/60 p-3">
              <label
                htmlFor={budgetInputId}
                className="text-xs font-extrabold uppercase tracking-wider text-charcoal/75"
              >
                Weekly budget
              </label>
              <div className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3">
                <span aria-hidden="true" className="font-black text-adobo">
                  ₱
                </span>
                <input
                  id={budgetInputId}
                  name="weeklyBudget"
                  type="number"
                  min="0"
                  step="50"
                  inputMode="decimal"
                  value={weeklyBudget}
                  onChange={(event) =>
                    setWeeklyBudget(event.target.value === "" ? 0 : Number(event.target.value))
                  }
                  aria-describedby={budgetHintId}
                  className="w-full bg-transparent text-base font-bold text-charcoal outline-none"
                />
              </div>
              <p id={budgetHintId} className="mt-2 text-[11px] font-semibold text-charcoal/75">
                Target for one combined grocery trip.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="button"
                onClick={handleAutoFill}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-adobo px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-adobo-dark"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Auto-Fill Tipid Week
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/15 px-5 text-sm font-extrabold text-charcoal/75 transition-colors hover:border-adobo/40 hover:text-adobo"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear Week
              </button>
            </div>
          </form>
        </div>

        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-cream/70 p-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-charcoal/75">
              Weekly Exact Cost
            </dt>
            <dd className="mt-2 text-2xl font-black text-charcoal">
              {formatPHP(weekly.totalExactCost)}
            </dd>
            <p className="mt-1 text-[11px] font-semibold text-charcoal/75">
              Actual amount of ingredients used.
            </p>
          </div>
          <div className="rounded-2xl bg-calamansi-soft p-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-calamansi">
              {isSupermarket ? "Consolidated Supermarket Total" : "Consolidated Palengke Total"}
            </dt>
            <dd className="mt-2 text-2xl font-black text-calamansi">
              {formatPHP(weekly.consolidatedPalengkeCost)}
            </dd>
            <p className="mt-1 text-[11px] font-semibold text-calamansi">
              Minimum packs per ingredient, bought once.
            </p>
          </div>
          <div className="rounded-2xl bg-adobo-soft p-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-adobo">
              Avg. Cost / Day
            </dt>
            <dd className="mt-2 text-2xl font-black text-adobo">{formatPHP(weekly.averagePerDay)}</dd>
            <p className="mt-1 text-[11px] font-semibold text-adobo-dark">
              Exact cost across {weekly.plannedDaysCount} planned day
              {weekly.plannedDaysCount === 1 ? "" : "s"}.
            </p>
          </div>
        </dl>

        <div className="mt-6 rounded-2xl border border-charcoal/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p id={progressLabelId} className="text-xs font-extrabold uppercase tracking-wider text-charcoal/75">
              Budget used
            </p>
            <p className="text-sm font-bold text-charcoal">
              {formatPHP(weekly.consolidatedPalengkeCost)} / {formatPHP(weeklyBudget)}
            </p>
          </div>
          <progress
            max={100}
            value={Math.round(progressPercent)}
            aria-labelledby={progressLabelId}
            aria-valuetext={`${formatPHP(weekly.consolidatedPalengkeCost)} of ${formatPHP(weeklyBudget)}`}
            className={`mt-3 h-3 w-full ${
              isOverBudget ? "accent-adobo" : "accent-calamansi"
            }`}
          />
          <p
            className={`mt-2 text-sm font-extrabold ${
              isOverBudget ? "text-adobo" : "text-calamansi"
            }`}
          >
            {isOverBudget
              ? `Over budget by ${formatPHP(Math.abs(budgetDifference))}`
              : `${formatPHP(budgetDifference)} left for the week`}
          </p>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-adobo">
              7-Day schedule
            </p>
            <h2 id={scheduleHeadingId} className="mt-2 text-2xl font-black text-charcoal">
              Pick one ulam per day.
            </h2>
          </div>
          <p className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-charcoal shadow-card">
            {weekly.plannedDaysCount}/7 days planned
          </p>
        </div>

        <ul
          role="list"
          className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {DAYS_OF_WEEK.map((day, index) => {
            const slug = plan[day];
            const option = slug ? recipeCostById.get(slug) : undefined;
            const selectId = `${uid}-day-${day}`;

            return (
              <li key={day}>
                <article className="flex h-full flex-col rounded-3xl border border-charcoal/10 bg-white p-4 shadow-card">
                  <header className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-black text-charcoal">
                      <CalendarDays className="h-4 w-4 text-adobo" aria-hidden="true" />
                      {day}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/75">
                      Day {index + 1}
                    </span>
                  </header>

                  <div className="mt-4">
                    <label htmlFor={selectId} className="text-[11px] font-bold text-charcoal/75">
                      Ulam for {day}
                    </label>
                    <select
                      id={selectId}
                      name={`ulam-${day}`}
                      value={slug ?? ""}
                      onChange={(event) => assignRecipe(day, event.target.value || null)}
                      className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream/50 px-3 text-base font-bold text-charcoal outline-none focus:border-adobo"
                    >
                      <option value="">Choose ulam…</option>
                      {recipeOptionsByCategory.map(([category, items]) => (
                        <optgroup key={category} label={category}>
                          {items.map((recipe) => (
                            <option key={recipe.slug} value={recipe.slug}>
                              {recipe.title}
                              {recipe.isCustom ? " (My Recipe)" : ""} — {formatPHP(recipeCostById.get(recipe.slug)?.perServing ?? 0, { forceDecimals: true })}/serving
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {option ? (
                    <>
                      <div className="mt-4 flex-1 rounded-2xl bg-cream/60 p-3">
                        <p className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-adobo">
                          {option.recipe.category}
                          {option.recipe.isCustom ? (
                            <span className="rounded-full bg-adobo px-2 py-0.5 text-[10px] font-black text-white">
                              My Recipe
                            </span>
                          ) : null}
                        </p>
                        <h3 className="mt-1 text-base font-black leading-tight text-charcoal">
                          <Link
                            href={
                              option.recipe.isCustom
                                ? `/recipes/custom?id=${encodeURIComponent(option.recipe.slug)}`
                                : `/recipes/${option.recipe.slug}`
                            }
                            className="inline-flex min-h-11 items-center gap-1 hover:text-adobo"
                          >
                            <span aria-hidden="true">{option.recipe.emoji}</span>
                            <span>{option.recipe.title}</span>
                            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          </Link>
                        </h3>
                        <p className="mt-2 text-xs leading-5 text-charcoal/75">
                          {option.recipe.tagline}
                        </p>
                      </div>
                      <footer className="mt-3 flex items-center justify-between border-t border-charcoal/10 pt-3">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-charcoal/75">
                          Daily {isSupermarket ? "supermarket" : "palengke"}
                        </span>
                        <strong className="text-sm font-black text-calamansi">
                          {formatPHP(option.householdPalengkeCost)}
                        </strong>
                      </footer>
                    </>
                  ) : (
                    <div className="mt-4 flex flex-1 flex-col justify-center rounded-2xl border border-dashed border-charcoal/15 bg-cream/40 p-4 text-center">
                      <p className="text-sm font-bold text-charcoal/75">No ulam assigned yet.</p>
                      <Link
                        href="/recipes"
                        className="mt-2 inline-flex min-h-11 items-center justify-center gap-1 text-xs font-extrabold text-adobo hover:underline"
                      >
                        Browse recipes
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-adobo">
              Consolidated grocery list
            </p>
            <h2 id={groceryHeadingId} className="mt-2 text-2xl font-black text-charcoal">
              One list for the whole week.
            </h2>
            <p className="mt-1 text-sm text-charcoal/75">
              Quantities are combined by ingredient, then rounded up to the nearest retail pack.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-charcoal shadow-card">
              {checkedCount}/{weekly.consolidatedGroceryList.length} checked
            </p>
            <CopyListButton
              getText={() =>
                formatWeeklyPalengkeText(
                  plan,
                  servings,
                  [...checkedIngredients],
                  priceSource,
                  allRecipes,
                  overrides,
                )
              }
              label={isSupermarket ? "Copy Supermarket List" : "Copy Palengke List"}
              disabled={weekly.plannedDaysCount === 0}
            />
          </div>
        </div>

        {groceryGroups.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-charcoal/15 bg-white p-8 text-center shadow-card">
            <ClipboardList className="mx-auto h-8 w-8 text-adobo" aria-hidden="true" />
            <p className="mt-3 text-lg font-black text-charcoal">No groceries yet.</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-charcoal/75">
              Auto-fill a tipid week or choose dishes above to build your palengke list.
            </p>
            <button
              type="button"
              onClick={handleAutoFill}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-adobo px-5 text-sm font-extrabold text-white hover:bg-adobo-dark"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Auto-fill a tipid week
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {groceryGroups.map((group) => (
              <article key={group.category} className="rounded-3xl border border-charcoal/10 bg-white p-5 shadow-card">
                <h3 className="text-sm font-black uppercase tracking-wider text-charcoal">
                  {group.category}
                </h3>
                <div className="mt-4 grid gap-2">
                  {group.items.map((item) => {
                    const inputId = `${uid}-grocery-${item.ingredientId}`;
                    const checked = checkedIngredients.has(item.ingredientId);

                    return (
                      <label
                        key={item.ingredientId}
                        htmlFor={inputId}
                        className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
                          checked
                            ? "border-calamansi bg-calamansi-soft"
                            : "border-charcoal/10 bg-cream/40 hover:border-calamansi/40"
                        }`}
                      >
                        <input
                          id={inputId}
                          name={`grocery-${item.ingredientId}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleIngredient(item.ingredientId)}
                          className="mt-1 h-5 w-5 shrink-0 accent-calamansi"
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm font-black ${
                              checked ? "text-calamansi line-through" : "text-charcoal"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="mt-1 block text-xs font-semibold text-charcoal/75">
                            {formatAmount(item.totalAmount)} {formatUnitLabel(item.unit, item.totalAmount)} · {item.palengkePackLabel}
                          </span>
                          <span className="mt-1 block text-[11px] font-bold text-adobo">
                            Pack {formatPHP(item.estimatedPackCost)}
                            <span className="font-semibold text-charcoal/75">
                              {" "}· exact {formatPHP(item.exactCost)}
                            </span>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-charcoal/75">
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear Week resets the plan, not your saved recipes.
        </p>
      </section>
    </div>
  );
}
