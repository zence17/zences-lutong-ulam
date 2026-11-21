"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ClipboardList, ShoppingBasket, Sparkles, Wallet } from "lucide-react";
import { CopyListButton } from "@/components/CopyListButton";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { usePriceOverrides } from "@/hooks/usePriceOverrides";
import { usePriceSource } from "@/hooks/usePriceSource";
import {
  calculateNegosyoBatch,
  formatAmount,
  formatBulkAmount,
  formatNegosyoPalengkeText,
  formatPHP,
  type NegosyoBatchInput,
  type NegosyoFormat,
} from "@/lib/costCalculator";
import type { Recipe } from "@/types/recipe";

interface NegosyoClientProps {
  recipes: Recipe[];
}

interface MetricProps {
  label: string;
  value: string;
  hint: string;
  featured?: boolean;
}

const BATCH_PRESETS = [20, 30, 40, 50] as const;
const MARGIN_PRESETS = [30, 40, 50] as const;
const DEFAULT_BATCH_SERVINGS = 30;
const DEFAULT_TRAY_COUNT = 2;
const DEFAULT_UTILITIES_BUFFER_PCT = 12;
const DEFAULT_TARGET_MARGIN_PCT = 40;
const PACKAGING_DEFAULTS: Record<NegosyoFormat, number> = {
  "packed-meals": 8,
  "party-tray": 45,
};

function parseSetting(value: string, minimum: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  return Math.max(minimum, parsed);
}

function parseCount(value: string, minimum: number): number {
  return Math.round(parseSetting(value, minimum));
}

function Metric({ label, value, hint, featured = false }: MetricProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        featured
          ? "border-adobo/25 bg-adobo-soft"
          : "border-charcoal/10 bg-cream/60"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-charcoal/60">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-black tracking-tight sm:text-3xl ${
          featured ? "text-adobo-dark" : "text-charcoal"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-charcoal/65">{hint}</p>
    </div>
  );
}

export default function NegosyoClient({ recipes }: NegosyoClientProps) {
  const { customRecipes, isHydrated: areCustomRecipesHydrated } = useCustomRecipes();
  const {
    priceSource,
    isSupermarket,
    isHydrated: isPriceSourceHydrated,
  } = usePriceSource();
  const {
    overrides,
    overrideCount,
    isHydrated: areOverridesHydrated,
  } = usePriceOverrides();

  const allRecipes = useMemo(() => [...customRecipes, ...recipes], [customRecipes, recipes]);
  const [recipeSlug, setRecipeSlug] = useState(recipes[0]?.slug ?? "");
  const [format, setFormat] = useState<NegosyoFormat>("packed-meals");
  const [batchServingsText, setBatchServingsText] = useState(String(DEFAULT_BATCH_SERVINGS));
  const [trayCountText, setTrayCountText] = useState(String(DEFAULT_TRAY_COUNT));
  const [packagingUnitCostText, setPackagingUnitCostText] = useState(
    String(PACKAGING_DEFAULTS["packed-meals"]),
  );
  const [utilitiesBufferPctText, setUtilitiesBufferPctText] = useState(
    String(DEFAULT_UTILITIES_BUFFER_PCT),
  );
  const [targetMarginPctText, setTargetMarginPctText] = useState(
    String(DEFAULT_TARGET_MARGIN_PCT),
  );

  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const formHeadingId = `${uid}-form-heading`;
  const recipeSelectId = `${uid}-recipe`;
  const batchInputId = `${uid}-batch`;
  const batchHintId = `${uid}-batch-hint`;
  const batchPresetLabelId = `${uid}-batch-preset-label`;
  const trayCountInputId = `${uid}-trays`;
  const packagingInputId = `${uid}-packaging`;
  const utilitiesInputId = `${uid}-utilities`;
  const marginInputId = `${uid}-margin`;
  const marginPresetLabelId = `${uid}-margin-preset-label`;
  const summaryHeadingId = `${uid}-summary-heading`;
  const bulkHeadingId = `${uid}-bulk-heading`;

  const selectedRecipe = useMemo(
    () => allRecipes.find((recipe) => recipe.slug === recipeSlug) ?? allRecipes[0],
    [allRecipes, recipeSlug],
  );

  useEffect(() => {
    if (allRecipes.length > 0 && !allRecipes.some((recipe) => recipe.slug === recipeSlug)) {
      setRecipeSlug(allRecipes[0].slug);
    }
  }, [allRecipes, recipeSlug]);

  const input = useMemo<NegosyoBatchInput>(
    () => ({
      format,
      batchServings: Math.min(500, parseCount(batchServingsText, 1)),
      utilitiesBufferPct: parseSetting(utilitiesBufferPctText, 0),
      targetProfitMarginPct: parseSetting(targetMarginPctText, 0),
      packagingUnitCost: parseSetting(packagingUnitCostText, 0),
      trayCount: parseCount(trayCountText, 1),
    }),
    [
      batchServingsText,
      format,
      packagingUnitCostText,
      targetMarginPctText,
      trayCountText,
      utilitiesBufferPctText,
    ],
  );

  const breakdown = useMemo(
    () =>
      selectedRecipe
        ? calculateNegosyoBatch(selectedRecipe, input, priceSource, overrides)
        : null,
    [input, overrides, priceSource, selectedRecipe],
  );

  const isHydrated =
    areCustomRecipesHydrated && isPriceSourceHydrated && areOverridesHydrated;

  if (!isHydrated) {
    return (
      <div className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-card">
        <div className="h-4 w-40 animate-pulse rounded-full bg-charcoal/10" />
        <div className="mt-4 h-9 w-80 max-w-full animate-pulse rounded-full bg-charcoal/10" />
        <p className="mt-6 text-sm font-semibold text-charcoal/75">
          Loading your saved recipes and prices…
        </p>
      </div>
    );
  }

  if (!selectedRecipe || !breakdown) {
    return (
      <div className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-card">
        <h2 className="text-xl font-black text-charcoal">No ulam available yet.</h2>
        <p className="mt-2 text-sm font-medium text-charcoal/70">
          Add a recipe first, then return here to price your batch.
        </p>
      </div>
    );
  }

  const activeRecipe = selectedRecipe;
  const activeBreakdown = breakdown;
  const unitLabel = breakdown.unitLabel;
  const unitLabelPlural = `${unitLabel}s`;
  const formatOptions: { value: NegosyoFormat; title: string; detail: string }[] = [
    {
      value: "packed-meals",
      title: "Packed Meals",
      detail: `Default ${formatPHP(PACKAGING_DEFAULTS["packed-meals"])}/tub`,
    },
    {
      value: "party-tray",
      title: "Party Tray",
      detail: `${DEFAULT_TRAY_COUNT} trays at ${formatPHP(PACKAGING_DEFAULTS["party-tray"])}/tray`,
    },
  ];

  function handleFormatChange(nextFormat: NegosyoFormat) {
    setFormat(nextFormat);
    setPackagingUnitCostText(String(PACKAGING_DEFAULTS[nextFormat]));
    if (nextFormat === "party-tray") setTrayCountText(String(DEFAULT_TRAY_COUNT));
  }

  function getCopyText() {
    return formatNegosyoPalengkeText(
      activeRecipe,
      input,
      activeBreakdown,
      priceSource,
      overrides,
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form
          aria-labelledby={formHeadingId}
          onSubmit={(event) => event.preventDefault()}
          className="rounded-3xl border border-charcoal/10 bg-white p-5 shadow-card sm:p-7"
        >
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-adobo">
            <ShoppingBasket size={15} aria-hidden="true" />
            Batch setup
          </p>
          <h2 id={formHeadingId} className="mt-2 text-2xl font-black text-charcoal sm:text-3xl">
            Set your negosyo batch.
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-charcoal/75">
            Pick an ulam, choose how you will sell it, then set your costs and target tubo.
            Every figure updates from your saved palengke prices.
          </p>

          <fieldset className="mt-6 rounded-2xl border border-charcoal/10 bg-cream/60 p-4">
            <legend className="px-2 text-xs font-extrabold uppercase tracking-wider text-charcoal/75">
              Ulam &amp; batch size
            </legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={recipeSelectId}
                  className="text-xs font-extrabold uppercase tracking-wider text-charcoal/75"
                >
                  Recipe
                </label>
                <select
                  id={recipeSelectId}
                  name="recipe"
                  value={selectedRecipe.slug}
                  onChange={(event) => setRecipeSlug(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-xl border border-charcoal/15 bg-white px-3 text-sm font-bold text-charcoal"
                >
                  {customRecipes.length > 0 ? (
                    <optgroup label="My Recipes">
                      {customRecipes.map((recipe) => (
                        <option key={recipe.slug} value={recipe.slug}>
                          {recipe.title}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  <optgroup label="Built-in Recipes">
                    {recipes.map((recipe) => (
                      <option key={recipe.slug} value={recipe.slug}>
                        {recipe.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label
                  htmlFor={batchInputId}
                  className="text-xs font-extrabold uppercase tracking-wider text-charcoal/75"
                >
                  Custom batch size
                </label>
                <div className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3">
                  <input
                    id={batchInputId}
                    name="batchServings"
                    type="number"
                    min="1"
                    max="500"
                    step="1"
                    inputMode="numeric"
                    value={batchServingsText}
                    onChange={(event) => setBatchServingsText(event.target.value)}
                    aria-describedby={batchHintId}
                    className="w-full bg-transparent text-base font-bold text-charcoal outline-none"
                  />
                  <span aria-hidden="true" className="text-sm font-bold text-charcoal/60">
                    pax
                  </span>
                </div>
                <p id={batchHintId} className="mt-2 text-[11px] font-semibold text-charcoal/65">
                  Whole pax from 1 to 500.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p
                id={batchPresetLabelId}
                className="text-[11px] font-black uppercase tracking-wider text-charcoal/60"
              >
                Quick batch
              </p>
              <div
                role="group"
                aria-labelledby={batchPresetLabelId}
                className="mt-2 flex flex-wrap gap-2"
              >
                {BATCH_PRESETS.map((option) => (
                  <label
                    key={option}
                    htmlFor={`${uid}-batch-${option}`}
                    className={`flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-bold transition-colors ${
                      input.batchServings === option
                        ? "border-adobo bg-adobo text-white"
                        : "border-charcoal/15 bg-white text-charcoal/75 hover:border-adobo/40"
                    }`}
                  >
                    <input
                      id={`${uid}-batch-${option}`}
                      name="batchPreset"
                      type="radio"
                      value={option}
                      checked={input.batchServings === option}
                      onChange={() => setBatchServingsText(String(option))}
                      className="sr-only"
                    />
                    {option} pax
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="mt-5 rounded-2xl border border-charcoal/10 bg-cream/60 p-4">
            <legend className="px-2 text-xs font-extrabold uppercase tracking-wider text-charcoal/75">
              Sell format
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {formatOptions.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`${uid}-format-${option.value}`}
                  className={`flex min-h-14 cursor-pointer flex-col justify-center rounded-xl border px-4 py-2 text-left transition-colors ${
                    format === option.value
                      ? "border-adobo bg-adobo-soft text-adobo-dark"
                      : "border-charcoal/15 bg-white text-charcoal hover:border-adobo/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      id={`${uid}-format-${option.value}`}
                      name="format"
                      type="radio"
                      value={option.value}
                      checked={format === option.value}
                      onChange={() => handleFormatChange(option.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-black">{option.title}</span>
                  </span>
                  <span className="mt-0.5 text-[11px] font-semibold text-charcoal/65">
                    {option.detail}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5 rounded-2xl border border-charcoal/10 bg-cream/60 p-4">
            <legend className="px-2 text-xs font-extrabold uppercase tracking-wider text-charcoal/75">
              Costs &amp; markup
            </legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={packagingInputId}
                  className="text-xs font-extrabold uppercase tracking-wider text-charcoal/75"
                >
                  Packaging per {unitLabel}
                </label>
                <div className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3">
                  <span aria-hidden="true" className="font-black text-adobo">
                    ₱
                  </span>
                  <input
                    id={packagingInputId}
                    name="packagingUnitCost"
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    value={packagingUnitCostText}
                    onChange={(event) => setPackagingUnitCostText(event.target.value)}
                    className="w-full bg-transparent text-base font-bold text-charcoal outline-none"
                  />
                </div>
              </div>

              {format === "party-tray" ? (
                <div>
                  <label
                    htmlFor={trayCountInputId}
                    className="text-xs font-extrabold uppercase tracking-wider text-charcoal/75"
                  >
                    Tray count
                  </label>
                  <div className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3">
                    <input
                      id={trayCountInputId}
                      name="trayCount"
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={trayCountText}
                      onChange={(event) => setTrayCountText(event.target.value)}
                      className="w-full bg-transparent text-base font-bold text-charcoal outline-none"
                    />
                    <span aria-hidden="true" className="text-sm font-bold text-charcoal/60">
                      trays
                    </span>
                  </div>
                </div>
              ) : null}

              <div>
                <label
                  htmlFor={utilitiesInputId}
                  className="text-xs font-extrabold uppercase tracking-wider text-charcoal/75"
                >
                  LPG &amp; Utilities Buffer
                </label>
                <div className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3">
                  <input
                    id={utilitiesInputId}
                    name="utilitiesBufferPct"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={utilitiesBufferPctText}
                    onChange={(event) => setUtilitiesBufferPctText(event.target.value)}
                    className="w-full bg-transparent text-base font-bold text-charcoal outline-none"
                  />
                  <span aria-hidden="true" className="text-sm font-bold text-charcoal/60">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor={marginInputId}
                  className="text-xs font-extrabold uppercase tracking-wider text-charcoal/75"
                >
                  Target Markup / Tubo
                </label>
                <div className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3">
                  <input
                    id={marginInputId}
                    name="targetProfitMarginPct"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={targetMarginPctText}
                    onChange={(event) => setTargetMarginPctText(event.target.value)}
                    className="w-full bg-transparent text-base font-bold text-charcoal outline-none"
                  />
                  <span aria-hidden="true" className="text-sm font-bold text-charcoal/60">
                    %
                  </span>
                </div>
                <div className="mt-3">
                  <p
                    id={marginPresetLabelId}
                    className="text-[11px] font-black uppercase tracking-wider text-charcoal/60"
                  >
                    Quick markup
                  </p>
                  <div
                    role="group"
                    aria-labelledby={marginPresetLabelId}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {MARGIN_PRESETS.map((option) => (
                      <label
                        key={option}
                        htmlFor={`${uid}-margin-${option}`}
                        className={`flex min-h-11 cursor-pointer items-center rounded-full border px-3 text-xs font-bold transition-colors ${
                          input.targetProfitMarginPct === option
                            ? "border-calamansi bg-calamansi-soft text-calamansi"
                            : "border-charcoal/15 bg-white text-charcoal/70 hover:border-calamansi/40"
                        }`}
                      >
                        <input
                          id={`${uid}-margin-${option}`}
                          name="marginPreset"
                          type="radio"
                          value={option}
                          checked={input.targetProfitMarginPct === option}
                          onChange={() => setTargetMarginPctText(String(option))}
                          className="sr-only"
                        />
                        {option}%
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        </form>

        <section
          aria-labelledby={summaryHeadingId}
          className="rounded-3xl border border-adobo/15 bg-white p-5 shadow-card sm:p-7"
        >
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-adobo">
            <Wallet size={15} aria-hidden="true" />
            Cost snapshot
          </p>
          <h2 id={summaryHeadingId} className="mt-2 text-2xl font-black text-charcoal sm:text-3xl">
            Your proposed selling price.
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-charcoal/70">
            {selectedRecipe.title} scaled to {formatAmount(input.batchServings)} pax. Prices use your
            saved {isSupermarket ? "supermarket estimate" : "palengke reference"}.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Metric
              label="Total Puhunan"
              value={formatPHP(breakdown.totalPuhunan)}
              hint="Ingredients, utilities, packaging"
            />
            <Metric
              label="Palengke Cash Outlay"
              value={formatPHP(breakdown.palengkeCashOutlay)}
              hint="Retail packs, utilities, packaging"
            />
            <Metric
              label={`Suggested Price / ${unitLabel}`}
              value={formatPHP(breakdown.suggestedSellingPricePerUnit)}
              hint={`${formatAmount(breakdown.packagingUnits)} ${unitLabelPlural} at target tubo`}
              featured
            />
            <Metric
              label="Net Tubo"
              value={formatPHP(breakdown.netTubo)}
              hint={`${formatAmount(input.targetProfitMarginPct)}% target markup`}
            />
          </div>

          <dl className="mt-6 space-y-2 border-t border-charcoal/10 pt-5 text-sm font-semibold">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-charcoal/65">Ingredients (exact)</dt>
              <dd className="text-charcoal">{formatPHP(breakdown.ingredientExactCost)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-charcoal/65">LPG &amp; Utilities Buffer</dt>
              <dd className="text-charcoal">
                {formatPHP(breakdown.utilitiesCost)} (
                {formatAmount(input.utilitiesBufferPct)}%)
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-charcoal/65">Packaging</dt>
              <dd className="text-charcoal">{formatPHP(breakdown.packagingTotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-charcoal/65">Suggested Total Revenue</dt>
              <dd className="text-charcoal">{formatPHP(breakdown.suggestedTotalRevenue)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-charcoal/65">Cost per {unitLabel}</dt>
              <dd className="text-charcoal">{formatPHP(breakdown.costPerUnit)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-2xl bg-calamansi-soft p-4">
            <p className="flex items-start gap-2 text-xs font-semibold leading-5 text-calamansi">
              <Sparkles size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
              Sell at {formatPHP(breakdown.suggestedSellingPricePerUnit)} per {unitLabel} to hit a
              target tubo of {formatPHP(breakdown.netTubo)} for this batch.
            </p>
          </div>

          {overrideCount > 0 || isSupermarket ? (
            <p className="mt-4 text-[11px] font-semibold text-charcoal/60">
              {overrideCount > 0
                ? `Using ${overrideCount} custom palengke price${overrideCount === 1 ? "" : "s"}. `
                : ""}
              {isSupermarket ? "Supermarket estimate adds 15% over palengke reference prices." : ""}
            </p>
          ) : null}
        </section>
      </div>

      <section
        aria-labelledby={bulkHeadingId}
        className="rounded-3xl border border-charcoal/10 bg-white p-5 shadow-card sm:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-adobo">
              <ClipboardList size={15} aria-hidden="true" />
              Shopping list
            </p>
            <h2 id={bulkHeadingId} className="mt-2 text-2xl font-black text-charcoal sm:text-3xl">
              Bulk palengke list
            </h2>
          </div>
          <CopyListButton label="Copy Negosyo List" getText={getCopyText} />
        </div>

        <ul className="mt-5 grid gap-2 md:grid-cols-2">
          {breakdown.recipeCost.ingredients.map((item) => (
            <li
              key={item.ingredientId}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-xl border border-charcoal/10 bg-cream/50 px-4 py-3"
            >
              <span className="text-sm font-bold text-charcoal">
                {formatBulkAmount(item.unit, item.amount)} {item.name}
              </span>
              <span className="text-xs font-semibold text-charcoal/65">
                {formatPHP(item.exactCost)} exact
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs font-semibold leading-5 text-charcoal/65">
          Scaled for {formatAmount(input.batchServings)} pax. Exact cost uses your saved ingredient
          rates; cash outlay uses whole retail packs.
        </p>
      </section>
    </div>
  );
}
