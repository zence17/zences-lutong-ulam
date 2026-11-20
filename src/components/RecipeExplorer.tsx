"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Heart, Search } from "lucide-react";
import { CustomRecipeModal } from "@/components/CustomRecipeModal";
import { getIngredientById, ingredients } from "@/data/ingredients";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { usePriceSource } from "@/hooks/usePriceSource";
import { SAVED_ULAM_FILTER_EVENT, useSavedUlam } from "@/hooks/useSavedUlam";
import {
  calculateRecipeCost,
  calculateRefMatch,
  type BudgetTier,
  type RecipeCostBreakdown,
  type RecipeRefMatch,
} from "@/lib/costCalculator";
import type { Recipe } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";

const budgetFilters: readonly ("All Budgets" | BudgetTier)[] = [
  "All Budgets",
  "Under ₱150",
  "₱150–₱300",
  "₱300+",
];
type BudgetFilter = (typeof budgetFilters)[number];

const categoryFilters = ["All", "Sabaw", "Prito / Gisa", "Gulay", "Karne"] as const;
type CategoryFilter = (typeof categoryFilters)[number];

const sortOptions = [
  { value: "default", label: "Recommended / Default Order" },
  { value: "cost-asc", label: "Lowest Cost per Serving" },
  { value: "time-asc", label: "Fastest Cook Time" },
  { value: "alpha-asc", label: "Alphabetical (A–Z)" },
] as const;
type SortBy = (typeof sortOptions)[number]["value"];

type IndexedRecipe = {
  recipe: Recipe;
  cost: RecipeCostBreakdown;
  refMatch: RecipeRefMatch;
  searchText: string;
  index: number;
};

function isSortBy(value: string): value is SortBy {
  return sortOptions.some((option) => option.value === value);
}

function compareBySortBy(a: IndexedRecipe, b: IndexedRecipe, sortBy: SortBy): number {
  switch (sortBy) {
    case "cost-asc":
      return a.cost.costPerServing - b.cost.costPerServing;
    case "time-asc":
      return (
        a.recipe.prepTimeMins +
        a.recipe.cookTimeMins -
        (b.recipe.prepTimeMins + b.recipe.cookTimeMins)
      );
    case "alpha-asc":
      return a.recipe.title.localeCompare(b.recipe.title);
    case "default":
      return 0;
  }
}

const refIngredientIds = [
  "garlic",
  "onion",
  "tomato",
  "egg",
  "chicken-thigh",
  "pork-kasim",
  "soy-sauce",
  "vinegar",
  "gata",
  "sardines",
  "misua",
  "malagkit",
] as const satisfies readonly (keyof typeof ingredients)[];

const refIngredients = refIngredientIds.map((id) => ({ id, name: ingredients[id].name }));

export function RecipeExplorer({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState("");
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>("All Budgets");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [ownedIngredientIds, setOwnedIngredientIds] = useState<string[]>([]);
  const [savedFilter, setSavedFilter] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [sortAnnouncement, setSortAnnouncement] = useState("");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const { priceSource, isSupermarket } = usePriceSource();
  const { savedSlugs, savedCount, isHydrated } = useSavedUlam();
  const { customRecipes } = useCustomRecipes();

  const allRecipes = useMemo(
    () => [...customRecipes, ...recipes],
    [customRecipes, recipes],
  );

  useEffect(() => {
    function syncFromUrl() {
      setSavedFilter(new URLSearchParams(window.location.search).get("saved") === "1");
    }

    function handleSavedFilterRequest(event: Event) {
      const detail = (event as CustomEvent<{ saved?: unknown }>).detail;
      if (typeof detail?.saved === "boolean") {
        setSavedFilter(detail.saved);
      }
    }

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener(SAVED_ULAM_FILTER_EVENT, handleSavedFilterRequest);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener(SAVED_ULAM_FILTER_EVENT, handleSavedFilterRequest);
    };
  }, []);

  const indexedRecipes = useMemo(
    () =>
      allRecipes.map((recipe, index) => {
        const cost = calculateRecipeCost(recipe, recipe.baseServings, priceSource);
        const refMatch = calculateRefMatch(recipe, ownedIngredientIds, recipe.baseServings, priceSource);
        const ingredientNames = recipe.ingredients
          .map((item) => getIngredientById(item.ingredientId)?.name ?? "")
          .join(" ");

        return {
          recipe,
          cost,
          refMatch,
          searchText: `${recipe.title} ${recipe.tagline} ${ingredientNames}`.toLowerCase(),
          index,
        };
      }),
    [allRecipes, ownedIngredientIds, priceSource],
  );

  const visibleRecipes = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    const matches = indexedRecipes.filter(({ recipe, cost, refMatch, searchText }) => {
      const matchesSearch = searchTerm.length === 0 || searchText.includes(searchTerm);
      const matchesBudget = budgetFilter === "All Budgets" || cost.budgetTier === budgetFilter;
      const matchesCategory = categoryFilter === "All" || recipe.category === categoryFilter;
      const matchesRef = ownedIngredientIds.length === 0 || refMatch.matchCount > 0;
      const matchesSaved = !savedFilter || (isHydrated && savedSlugs.includes(recipe.slug));

      return matchesSearch && matchesBudget && matchesCategory && matchesRef && matchesSaved;
    });

    matches.sort((a, b) => {
      if (ownedIngredientIds.length > 0) {
        const matchDifference = b.refMatch.matchCount - a.refMatch.matchCount;
        if (matchDifference !== 0) return matchDifference;
      }

      const sortDifference = compareBySortBy(a, b, sortBy);
      return sortDifference !== 0 ? sortDifference : a.index - b.index;
    });

    return matches.map(({ recipe }) => recipe);
  }, [budgetFilter, categoryFilter, indexedRecipes, isHydrated, ownedIngredientIds, query, savedFilter, savedSlugs, sortBy]);

  function updateSavedFilter(next: boolean) {
    setSavedFilter(next);

    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    if (next) {
      url.searchParams.set("saved", "1");
    } else {
      url.searchParams.delete("saved");
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isSortBy(next)) return;

    const label = sortOptions.find((option) => option.value === next)?.label ?? "";
    setSortBy(next);
    setSortAnnouncement(`Sorted by ${label}, ${visibleRecipes.length} ulam`);
  }

  function toggleRefIngredient(id: string) {
    setOwnedIngredientIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function clearRefIngredients() {
    setOwnedIngredientIds([]);
  }

  function resetFilters() {
    setQuery("");
    setBudgetFilter("All Budgets");
    setCategoryFilter("All");
    clearRefIngredients();
    updateSavedFilter(false);
    setSortBy("default");
    setSortAnnouncement(`Sorted by ${sortOptions[0].label}, ${allRecipes.length} ulam`);
  }

  const isSavedFilterLoading = savedFilter && !isHydrated;
  const isSavedFilterEmpty = savedFilter && isHydrated && savedSlugs.length === 0;

  return (
    <div>
      <search className="no-print rounded-2xl border border-charcoal/10 bg-white p-4 shadow-card sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal/75">
            Find your next ulam
          </p>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="inline-flex min-h-11 items-center rounded-full bg-adobo px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-adobo-dark"
          >
            + Add My Ulam
          </button>
        </div>

        <label className="relative block">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40"
            aria-hidden="true"
          />
          <span className="sr-only">Search recipes or ingredients</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ulam or ingredient…"
            className="min-h-11 w-full rounded-xl border border-charcoal/15 bg-cream py-3 pl-11 pr-3 text-base font-medium outline-none transition-colors placeholder:text-charcoal/60 focus:border-adobo focus:bg-white"
          />
        </label>

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal/75">
            Saved Ulam
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={savedFilter}
              aria-busy={!isHydrated}
              onClick={() => updateSavedFilter(!savedFilter)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                savedFilter
                  ? "bg-adobo text-white"
                  : "bg-adobo-soft text-adobo-dark hover:brightness-95"
              }`}
            >
              <Heart size={14} fill={savedFilter ? "currentColor" : "none"} aria-hidden="true" />
              Saved Ulam{isHydrated ? ` (${savedCount})` : ""}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal/75">
            Budget
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {budgetFilters.map((filter) => {
              const active = budgetFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setBudgetFilter(filter)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "bg-calamansi text-white"
                      : "bg-calamansi-soft text-calamansi hover:brightness-95"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
          {isSupermarket ? (
            <p className="mt-2 text-[11px] font-semibold text-charcoal/75">
              Budget tiers, savings, and cost sorting use the Supermarket +15% estimate.
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal/75">
            Category
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categoryFilters.map((filter) => {
              const active = categoryFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategoryFilter(filter)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "bg-adobo text-white"
                      : "bg-adobo-soft text-adobo-dark hover:brightness-95"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <details className="mt-5 rounded-xl border border-calamansi/20 bg-calamansi-soft/40 px-4 py-3">
          <summary className="cursor-pointer text-sm font-extrabold text-charcoal">
            <span className="inline-flex flex-wrap items-center gap-2">
              What&apos;s in My Ref?
              {ownedIngredientIds.length > 0 && (
                <span className="rounded-full bg-calamansi px-2 py-0.5 text-[11px] font-bold text-white">
                  {ownedIngredientIds.length} selected
                </span>
              )}
            </span>
          </summary>

          <div className="mt-4 border-t border-calamansi/20 pt-4">
            <fieldset>
              <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal/75">
                Tap what you already have
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {refIngredients.map(({ id, name }) => (
                  <label key={id} className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ownedIngredientIds.includes(id)}
                      onChange={() => toggleRefIngredient(id)}
                      className="peer sr-only"
                    />
                    <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-charcoal/15 bg-white px-3 py-1.5 text-xs font-bold text-charcoal/75 transition-colors hover:border-calamansi hover:text-calamansi peer-checked:border-calamansi peer-checked:bg-calamansi peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-calamansi">
                      {name}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-charcoal/75">
                {ownedIngredientIds.length > 0
                  ? "Recipes with the most ref matches show up first."
                  : "We’ll estimate savings using current ingredient prices."}
              </p>
              {ownedIngredientIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearRefIngredients}
                  className="inline-flex min-h-11 items-center rounded-full border border-calamansi/30 bg-white px-3 py-1.5 text-xs font-bold text-calamansi transition-colors hover:bg-calamansi-soft"
                >
                  Clear Ref
                </button>
              )}
            </div>
          </div>
        </details>
      </search>

      {isSavedFilterLoading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading saved ulam">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-2xl border border-charcoal/10 bg-white/70"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm font-semibold text-charcoal/75">
              Showing {visibleRecipes.length} of {allRecipes.length} recipes
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="recipe-sort" className="text-sm font-bold text-charcoal/75">
                Sort by:
              </label>
              <select
                id="recipe-sort"
                name="sortBy"
                value={sortBy}
                onChange={handleSortChange}
                className="min-h-11 rounded-xl border border-charcoal/15 bg-white px-3 py-1.5 text-base font-semibold text-charcoal transition-colors hover:border-adobo hover:bg-cream focus:border-adobo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adobo"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p role="status" aria-atomic="true" className="sr-only">
            {sortAnnouncement}
          </p>

          {isSavedFilterEmpty ? (
            <div className="mt-4 rounded-2xl border border-dashed border-adobo/30 bg-white/70 px-6 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-adobo-soft text-adobo">
                <Heart size={24} aria-hidden="true" />
              </span>
              <p className="mt-4 text-lg font-extrabold text-charcoal">Wala pang saved ulam.</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-charcoal/75">
                Tap the heart on any dish to keep family favorites here. Saved ulam stays on this
                device only.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-adobo px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-adobo-dark"
              >
                Browse all recipes
              </button>
            </div>
          ) : visibleRecipes.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-adobo/30 bg-white/70 px-6 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-adobo-soft text-adobo">
                <Search size={24} aria-hidden="true" />
              </span>
              <p className="mt-4 text-lg font-extrabold text-charcoal">Wala pang recipe para diyan.</p>
              <p className="mt-1 text-sm text-charcoal/75">
                Try another ingredient or reset the filters to see all ulam.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-adobo px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-adobo-dark"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleRecipes.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} ownedIngredientIds={ownedIngredientIds} />
              ))}
            </div>
          )}
        </>
      )}

      <CustomRecipeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </div>
  );
}
