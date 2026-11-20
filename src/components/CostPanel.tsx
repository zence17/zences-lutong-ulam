"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBasket, Wallet } from "lucide-react";
import { priceMetadata } from "@/data/ingredients";
import { calculateRecipeCost, formatAmount, formatPHP } from "@/lib/costCalculator";
import type { Recipe } from "@/types/recipe";

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 20;

export function CostPanel({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState(recipe.baseServings);
  const cost = useMemo(() => calculateRecipeCost(recipe, servings), [recipe, servings]);

  return (
    <section className="overflow-hidden rounded-2xl border border-adobo/15 bg-white shadow-card">
      <div className="border-b border-adobo/10 bg-adobo-soft px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-adobo">
              Recipe cost estimator
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight">Scale your ulam</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease servings"
              disabled={servings <= MIN_SERVINGS}
              onClick={() => setServings((current) => Math.max(MIN_SERVINGS, current - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-adobo/20 bg-white text-adobo transition-colors hover:bg-adobo hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <label className="flex min-h-11 items-center gap-1.5 rounded-full border border-adobo/20 bg-white px-3 py-1.5 text-sm font-bold">
              <input
                type="number"
                min={MIN_SERVINGS}
                max={MAX_SERVINGS}
                value={servings}
                aria-label="Number of servings"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isInteger(next) && next >= MIN_SERVINGS && next <= MAX_SERVINGS) {
                    setServings(next);
                  }
                }}
                className="w-10 bg-transparent text-center text-base outline-none"
              />
              <span className="text-xs font-semibold text-charcoal/75">pax</span>
            </label>
            <button
              type="button"
              aria-label="Increase servings"
              disabled={servings >= MAX_SERVINGS}
              onClick={() => setServings((current) => Math.min(MAX_SERVINGS, current + 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-adobo/20 bg-white text-adobo transition-colors hover:bg-adobo hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-adobo-dark">
          Scaled from {recipe.baseServings} servings · {formatAmount(cost.scaleFactor)}x batch
        </p>
      </div>

      <div className="grid gap-px bg-charcoal/10 sm:grid-cols-3">
        <div className="bg-white px-5 py-4 sm:px-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal/75">
            Exact cost
          </p>
          <p className="mt-1 text-xl font-extrabold tracking-tight">{formatPHP(cost.totalExactCost)}</p>
        </div>
        <div className="bg-white px-5 py-4 sm:px-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal/75">
            Per serving
          </p>
          <p className="mt-1 text-xl font-extrabold tracking-tight">
            {formatPHP(cost.costPerServing, { forceDecimals: true })}
          </p>
        </div>
        <div className="bg-calamansi-soft px-5 py-4 sm:px-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-calamansi">
            Palengke budget
          </p>
          <p className="mt-1 text-xl font-extrabold tracking-tight text-calamansi">
            {formatPHP(cost.estimatedPalengkeOutOfPocket)}
          </p>
          <span className="mt-1 inline-block rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-calamansi">
            {cost.budgetTier}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="flex items-center gap-2 text-sm font-extrabold">
          <ShoppingBasket size={16} className="text-adobo" aria-hidden="true" />
          Scaled ingredients &amp; costs
        </h3>

        <div className="mt-3 divide-y divide-charcoal/10">
          {cost.ingredients.map((item) => (
            <div key={item.ingredientId} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold leading-snug">{item.name}</p>
                <p className="mt-0.5 text-xs text-charcoal/75">
                  {item.displayAmount} · {item.palengkePackLabel}
                  {item.packsNeeded > 1 ? ` × ${item.packsNeeded}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold">{formatPHP(item.exactCost, { forceDecimals: true })}</p>
                <p className="mt-0.5 text-[11px] font-medium text-adobo-dark">
                  buy {formatPHP(item.outOfPocketCost)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 border-t border-charcoal/10 bg-cream/70 px-5 py-4 text-xs leading-relaxed text-charcoal/75 sm:px-6">
        <Wallet size={15} className="mt-0.5 shrink-0 text-adobo" aria-hidden="true" />
        <p>
          Exact cost uses bulk rates. The palengke estimate rounds each ingredient up to its minimum
          retail pack. Prices: {priceMetadata.location}, {priceMetadata.lastUpdated}.
        </p>
      </div>
    </section>
  );
}
