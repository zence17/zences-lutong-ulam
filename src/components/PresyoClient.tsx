"use client";

import Link from "next/link";
import { useId, useMemo, useState, type FormEvent } from "react";
import { Pencil, RotateCcw, Search, UtensilsCrossed, Wallet } from "lucide-react";
import { usePriceOverrides } from "@/hooks/usePriceOverrides";
import { usePriceSource } from "@/hooks/usePriceSource";
import {
  applyPriceSource,
  formatPHP,
  resolveIngredient,
  type PriceSource,
} from "@/lib/costCalculator";
import type { Ingredient, IngredientCategory, IngredientUnit, Recipe } from "@/types/recipe";

const categoryFilters: readonly ("All" | IngredientCategory)[] = [
  "All",
  "Karne & Isda",
  "Gulay & Prutas",
  "Pantry & Sari-Sari",
];
type CategoryFilter = (typeof categoryFilters)[number];

const unitLabels: Record<IngredientUnit, string> = {
  g: "g",
  mL: "mL",
  pcs: "pc",
  cloves: "clove",
  tali: "tali",
  sachet: "sachet",
};

function packDescriptor(label: string): string {
  const separatorIndex = label.indexOf("—");
  return separatorIndex === -1 ? label : label.slice(0, separatorIndex).trim();
}

interface IngredientUsage {
  count: number;
  firstRecipe: Recipe | undefined;
}

interface PresyoClientProps {
  ingredients: Ingredient[];
  lastUpdated: string;
  recipes: Recipe[];
}

function IngredientCard({
  ingredient,
  lastUpdated,
  usage,
  priceSource,
  override,
  isHydrated,
  setIngredientPrice,
  resetIngredientPrice,
}: {
  ingredient: Ingredient;
  lastUpdated: string;
  usage: IngredientUsage;
  priceSource: PriceSource;
  override: number | undefined;
  isHydrated: boolean;
  setIngredientPrice: (ingredientId: string, price: number) => void;
  resetIngredientPrice: (ingredientId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState("");
  const priceInputId = useId();
  const isSupermarket = priceSource === "supermarket";
  const hasOverride = override !== undefined;
  const resolved =
    resolveIngredient(
      ingredient.id,
      override === undefined ? {} : { [ingredient.id]: override },
    ) ?? ingredient;
  const packPrice = applyPriceSource(resolved.palengkePackPrice, priceSource);
  const unitPrice = applyPriceSource(resolved.pricePerUnit, priceSource);

  function handleEdit() {
    setDraftPrice(String(resolved.palengkePackPrice));
    setIsEditing(true);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(draftPrice);
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    setIngredientPrice(ingredient.id, parsed);
    setIsEditing(false);
  }

  function handleReset() {
    resetIngredientPrice(ingredient.id);
    setIsEditing(false);
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-charcoal/10 bg-cream/60 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-adobo-dark">
            {ingredient.category}
          </p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight tracking-tight text-charcoal">
            {ingredient.name}
          </h3>
          {hasOverride ? (
            <span className="mt-1.5 inline-flex rounded-full bg-calamansi px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              My Palengke
            </span>
          ) : null}
        </div>

        {usage.count > 0 && usage.firstRecipe ? (
          <Link
            href={`/recipes/${usage.firstRecipe.slug}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-calamansi/25 bg-white px-3 py-1.5 text-[11px] font-bold text-calamansi transition-colors hover:border-calamansi hover:bg-calamansi-soft"
          >
            <UtensilsCrossed size={13} aria-hidden="true" />
            Used in {usage.count} ulam
            <span className="sr-only">, for example {usage.firstRecipe.title}</span>
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-full border border-charcoal/15 bg-white px-3 py-1.5 text-[11px] font-bold text-charcoal/75">
            Not in a recipe yet
          </span>
        )}
      </header>

      <div className="grid flex-1 gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <div className="rounded-xl border border-adobo/15 bg-adobo-soft/40 p-3">
          <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.1em] text-adobo-dark">
            {isSupermarket
              ? "Supermarket Retail Buy (+15% est.)"
              : "Palengke / Sari-Sari Retail Buy"}
          </p>
          <p className="mt-2 text-xl font-black tracking-tight text-adobo">
            {formatPHP(packPrice)}
          </p>
          <p className="mt-1 text-xs font-semibold leading-snug text-charcoal/75">
            {hasOverride ? packDescriptor(ingredient.palengkePackLabel) : ingredient.palengkePackLabel}
          </p>
          {hasOverride ? (
            <p className="mt-1 text-[11px] font-semibold text-adobo-dark">
              Metro Manila baseline:{" "}
              <span className="line-through text-charcoal/60">
                {formatPHP(ingredient.palengkePackPrice)}
              </span>
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-calamansi/15 bg-calamansi-soft/40 p-3">
          <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.1em] text-calamansi">
            {isSupermarket ? "Supermarket Recipe Rate (+15% est.)" : "Base Recipe Rate"}
          </p>
          <p className="mt-2 text-lg font-black tracking-tight text-calamansi">
            {formatPHP(unitPrice, { forceDecimals: true })}
            <span className="text-xs font-bold"> / {unitLabels[ingredient.unit]}</span>
          </p>
          <p className="mt-1 text-xs font-semibold leading-snug text-charcoal/75">
            Used by the cost estimator for exact recipe costing.
          </p>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-charcoal/10 px-4 py-3 text-[11px] font-medium text-charcoal/75 sm:px-5">
        <span className="inline-flex items-center gap-1.5">
          <Wallet size={13} aria-hidden="true" />
          {hasOverride ? "Saved on this device" : `Metro Manila reference · ${lastUpdated}`}
        </span>
        <button
          type="button"
          disabled={!isHydrated}
          onClick={handleEdit}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-adobo/20 bg-white px-3 font-bold text-adobo transition-colors hover:border-adobo hover:bg-adobo-soft disabled:cursor-wait disabled:opacity-60"
        >
          <Pencil size={13} aria-hidden="true" />
          Edit
        </button>
      </footer>

      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="border-t border-adobo/10 bg-adobo-soft/40 px-4 py-4 sm:px-5"
        >
          <label
            htmlFor={priceInputId}
            className="block text-[10px] font-bold uppercase tracking-[0.12em] text-adobo-dark"
          >
            My palengke pack price
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-charcoal/75">
              {packDescriptor(ingredient.palengkePackLabel)}
            </span>
            <div className="flex min-h-11 items-center gap-1 rounded-xl border border-charcoal/15 bg-white px-3">
              <span aria-hidden="true" className="font-black text-adobo">
                ₱
              </span>
              <input
                id={priceInputId}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={draftPrice}
                onChange={(event) => setDraftPrice(event.target.value)}
                required
                className="w-24 bg-transparent text-base font-bold text-charcoal outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full bg-adobo px-4 text-xs font-bold text-white transition-colors hover:bg-adobo-dark"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex min-h-11 items-center rounded-full border border-charcoal/15 bg-white px-3 text-xs font-bold text-charcoal/75 transition-colors hover:border-adobo hover:text-adobo"
            >
              Cancel
            </button>
            {hasOverride ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-11 items-center rounded-full border border-calamansi/30 bg-white px-3 text-xs font-bold text-calamansi transition-colors hover:bg-calamansi-soft"
              >
                Reset item
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </article>
  );
}

export function PresyoClient({ ingredients, lastUpdated, recipes }: PresyoClientProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const { priceSource, isSupermarket } = usePriceSource();
  const {
    overrides,
    setIngredientPrice,
    resetIngredientPrice,
    resetAllPrices,
    overrideCount,
    isHydrated,
  } = usePriceOverrides();
  const searchId = useId();
  const filtersHeadingId = useId();
  const categoryLegendId = useId();

  const usageByIngredientId = useMemo(() => {
    const usage = new Map<string, IngredientUsage>();

    for (const recipe of recipes) {
      const seenInRecipe = new Set<string>();

      for (const item of recipe.ingredients) {
        if (seenInRecipe.has(item.ingredientId)) continue;
        seenInRecipe.add(item.ingredientId);

        const current = usage.get(item.ingredientId) ?? { count: 0, firstRecipe: recipe };
        current.count += 1;
        usage.set(item.ingredientId, current);
      }
    }

    return usage;
  }, [recipes]);

  const filteredIngredients = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    return ingredients.filter((ingredient) => {
      const matchesCategory =
        categoryFilter === "All" || ingredient.category === categoryFilter;
      const searchText = `${ingredient.name} ${ingredient.palengkePackLabel}`.toLocaleLowerCase();
      const matchesSearch = term.length === 0 || searchText.includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, ingredients, query]);

  const groupedIngredients = useMemo(() => {
    if (categoryFilter === "All") {
      return categoryFilters
        .filter((category): category is IngredientCategory => category !== "All")
        .map((category) => ({
          category,
          items: filteredIngredients.filter((ingredient) => ingredient.category === category),
        }))
        .filter((group) => group.items.length > 0);
    }

    return [{ category: categoryFilter, items: filteredIngredients }];
  }, [categoryFilter, filteredIngredients]);

  function resetFilters() {
    setQuery("");
    setCategoryFilter("All");
  }

  return (
    <div>
      <search aria-labelledby={filtersHeadingId}>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="rounded-2xl border border-charcoal/10 bg-white p-4 shadow-card sm:p-5"
        >
          <h2 id={filtersHeadingId} className="text-sm font-extrabold text-charcoal">
            Find an ingredient
          </h2>

          <label
            htmlFor={searchId}
            className="mt-4 block text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal/75"
          >
            Search by ingredient or palengke pack
          </label>
          <div className="relative mt-2">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40"
            />
            <input
              id={searchId}
              name="q"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try pork, sachet, 1/4 kg…"
              className="w-full rounded-xl border border-charcoal/15 bg-cream py-3 pl-11 pr-3 text-base outline-none transition-colors placeholder:text-charcoal/60 focus:border-adobo focus:bg-white"
            />
          </div>

          <fieldset className="mt-5">
            <legend
              id={categoryLegendId}
              className="text-[10px] font-bold uppercase tracking-[0.14em] text-charcoal/75"
            >
              Market section
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <label key={filter} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="presyo-category"
                    value={filter}
                    checked={categoryFilter === filter}
                    onChange={() => setCategoryFilter(filter)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex min-h-11 items-center rounded-full border border-charcoal/15 bg-cream px-4 py-2 text-xs font-bold text-charcoal/75 transition-colors hover:border-adobo/40 hover:text-adobo peer-checked:border-adobo peer-checked:bg-adobo peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adobo">
                    {filter}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </form>
      </search>

      {isHydrated && overrideCount > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-calamansi/25 bg-calamansi-soft px-4 py-2">
          <p className="text-xs font-bold text-calamansi">
            {overrideCount} ingredient price{overrideCount === 1 ? "" : "s"} set to your palengke.
          </p>
          <button
            type="button"
            onClick={resetAllPrices}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-calamansi/30 bg-white px-3 py-1.5 text-xs font-bold text-calamansi transition-colors hover:border-calamansi"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset All to Metro Manila Defaults
          </button>
        </div>
      ) : null}

      {isSupermarket ? (
        <p className="mt-4 rounded-xl border border-adobo/15 bg-adobo-soft/60 px-4 py-2 text-xs font-semibold text-adobo-dark">
          Supermarket estimate active: reference prices include the +15% grocery markup.
        </p>
      ) : null}

      <p className="mt-6 text-sm font-semibold text-charcoal/75">
        Showing {filteredIngredients.length} of {ingredients.length} ingredients
      </p>

      {groupedIngredients.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-adobo/30 bg-white/70 px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-adobo-soft text-adobo">
            <Search size={24} aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-extrabold text-charcoal">Wala pang presyo para diyan.</p>
          <p className="mt-1 text-sm text-charcoal/75">
            Try another ingredient or palengke pack description.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-adobo px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-adobo-dark"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset Search
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {groupedIngredients.map((group) => (
            <section key={group.category}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-adobo/15 pb-3">
                <h2 className="text-xl font-black tracking-tight text-charcoal">{group.category}</h2>
                <p className="text-xs font-bold text-charcoal/75">
                  {group.items.length} ingredient{group.items.length === 1 ? "" : "s"}
                </p>
              </div>

              <ul role="list" className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((ingredient) => (
                  <li key={ingredient.id}>
                    <IngredientCard
                      ingredient={ingredient}
                      lastUpdated={lastUpdated}
                      usage={usageByIngredientId.get(ingredient.id) ?? { count: 0, firstRecipe: undefined }}
                      priceSource={priceSource}
                      override={overrides[ingredient.id]}
                      isHydrated={isHydrated}
                      setIngredientPrice={setIngredientPrice}
                      resetIngredientPrice={resetIngredientPrice}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
