import { getIngredientById } from "@/data/ingredients";
import { recipes as staticRecipes } from "@/data/recipes";
import type { Ingredient, IngredientCategory, IngredientUnit, Recipe } from "@/types/recipe";

export type PriceOverrides = Record<string, number>;

export type BudgetTier = "Under ₱150" | "₱150–₱300" | "₱300+";

export type PriceSource = "palengke" | "supermarket";

export const SUPERMARKET_MULTIPLIER = 1.15;

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type WeeklyMealPlan = Record<DayOfWeek, string | null>;

export const DAYS_OF_WEEK: readonly DayOfWeek[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export interface ScaledRecipeIngredient {
  ingredientId: string;
  name: string;
  unit: IngredientUnit;
  amount: number;
  displayAmount: string;
  exactCost: number;
  palengkePackLabel: string;
  palengkePackPrice: number;
  packsNeeded: number;
  outOfPocketCost: number;
}

export interface RecipeCostBreakdown {
  targetServings: number;
  scaleFactor: number;
  priceSource: PriceSource;
  ingredients: ScaledRecipeIngredient[];
  totalExactCost: number;
  costPerServing: number;
  estimatedPalengkeOutOfPocket: number;
  budgetTier: BudgetTier;
}

export interface RecipeRefMatch {
  matchedIngredientIds: string[];
  matchCount: number;
  estimatedSavings: number;
  remainingOutOfPocket: number;
}

export interface WeeklyGroceryItem {
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  totalAmount: number;
  unit: IngredientUnit;
  exactCost: number;
  palengkePackLabel: string;
  estimatedPackCost: number;
}

export interface WeeklyPlanBreakdown {
  plannedDaysCount: number;
  priceSource: PriceSource;
  totalExactCost: number;
  consolidatedPalengkeCost: number;
  averagePerDay: number;
  consolidatedGroceryList: WeeklyGroceryItem[];
}

export type NegosyoFormat = "packed-meals" | "party-tray";

export interface NegosyoBatchInput {
  format: NegosyoFormat;
  batchServings: number;
  utilitiesBufferPct: number;
  targetProfitMarginPct: number;
  packagingUnitCost: number;
  trayCount: number;
}

export interface NegosyoBatchBreakdown {
  recipe: Recipe;
  input: NegosyoBatchInput;
  recipeCost: RecipeCostBreakdown;
  ingredientExactCost: number;
  utilitiesCost: number;
  packagingUnits: number;
  packagingTotal: number;
  totalPuhunan: number;
  palengkeCashOutlay: number;
  suggestedTotalRevenue: number;
  netTubo: number;
  suggestedSellingPricePerUnit: number;
  costPerUnit: number;
  unitLabel: string;
}

const FRACTION_VALUES: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
};

const numberFormatter = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 2,
});

const INGREDIENT_CATEGORY_ORDER: IngredientCategory[] = [
  "Karne & Isda",
  "Gulay & Prutas",
  "Pantry & Sari-Sari",
];

export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function applyPriceSource(amount: number, source: PriceSource = "palengke"): number {
  return source === "supermarket" ? roundToTwoDecimals(amount * SUPERMARKET_MULTIPLIER) : amount;
}

export function scaleAmount(amount: number, factor: number): number {
  return roundToTwoDecimals(amount * factor);
}

export function getBudgetTier(amount: number): BudgetTier {
  if (amount < 150) return "Under ₱150";
  if (amount <= 300) return "₱150–₱300";
  return "₱300+";
}

export function resolveIngredient(
  ingredientId: string,
  overrides: PriceOverrides = {},
): Ingredient | undefined {
  const baseIngredient = getIngredientById(ingredientId);
  if (!baseIngredient) return undefined;

  const customPackPrice = overrides[ingredientId];
  if (
    typeof customPackPrice !== "number" ||
    !Number.isFinite(customPackPrice) ||
    customPackPrice <= 0 ||
    !Number.isFinite(baseIngredient.palengkePackPrice) ||
    baseIngredient.palengkePackPrice <= 0
  ) {
    return baseIngredient;
  }

  const ratio = customPackPrice / baseIngredient.palengkePackPrice;
  return {
    ...baseIngredient,
    palengkePackPrice: customPackPrice,
    pricePerUnit: baseIngredient.pricePerUnit * ratio,
  };
}

export function formatAmount(value: number): string {
  return numberFormatter.format(roundToTwoDecimals(value));
}

export function formatBulkAmount(unit: IngredientUnit, amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  if (unit === "g" && Math.abs(safeAmount) >= 1000) {
    return `${formatAmount(safeAmount / 1000)} kg`;
  }
  if (unit === "mL" && Math.abs(safeAmount) >= 1000) {
    return `${formatAmount(safeAmount / 1000)} L`;
  }
  return `${formatAmount(safeAmount)} ${formatPlainTextUnit(unit, safeAmount)}`;
}

export function scaleDisplayAmount(displayAmount: string, factor: number): string {
  if (factor === 1) return displayAmount;

  const match = displayAmount.match(/^(\d+\/\d+|\d+(?:\.\d+)?|[½¼¾⅓⅔])\s*(.*)$/);
  if (!match) return displayAmount;

  const token = match[1];
  const baseAmount = token.includes("/")
    ? Number(token.split("/")[0]) / Number(token.split("/")[1])
    : FRACTION_VALUES[token] ?? Number(token);

  if (!Number.isFinite(baseAmount)) return displayAmount;

  const scaled = roundToTwoDecimals(baseAmount * factor);
  let unitLabel = match[2];

  if (scaled === 1) {
    unitLabel = unitLabel.replace(/^sachets\b/, "sachet").replace(/^pcs\b/, "pc");
  } else if (scaled > 1) {
    unitLabel = unitLabel.replace(/^pc\b/, "pcs").replace(/^sachet\b/, "sachets");
  }

  return `${formatAmount(scaled)} ${unitLabel}`.trim();
}

export function formatPHP(amount: number, options?: { forceDecimals?: boolean }): string {
  const safeAmount = roundToTwoDecimals(Number.isFinite(amount) ? amount : 0);
  const hasCentavos = Math.abs(safeAmount % 1) > 0.000001;
  const fractionDigits = options?.forceDecimals || hasCentavos ? 2 : 0;

  return `₱${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(safeAmount)}`;
}

function formatPlainTextUnit(unit: IngredientUnit, amount: number): string {
  if (unit === "pcs") return amount === 1 ? "pc" : "pcs";
  if (unit === "cloves") return amount === 1 ? "clove" : "cloves";
  if (unit === "sachet") return amount === 1 ? "sachet" : "sachets";
  return unit;
}

function checklistMarker(useStatus: boolean, checked: boolean): string {
  if (!useStatus) return "-";
  return checked ? "☑" : "☐";
}

function createRecipeLookup(availableRecipes: Recipe[]): Map<string, Recipe> {
  return new Map(availableRecipes.map((recipe) => [recipe.slug, recipe]));
}

export function calculateRecipeCost(
  recipe: Recipe,
  targetServings: number,
  priceSource: PriceSource = "palengke",
  overrides: PriceOverrides = {},
): RecipeCostBreakdown {
  if (!Number.isFinite(targetServings) || targetServings <= 0) {
    throw new RangeError("targetServings must be a positive number");
  }
  if (!Number.isFinite(recipe.baseServings) || recipe.baseServings <= 0) {
    throw new RangeError("recipe.baseServings must be a positive number");
  }

  const scaleFactor = targetServings / recipe.baseServings;

  const scaledIngredients = recipe.ingredients.map((recipeIngredient): ScaledRecipeIngredient => {
    const ingredient = resolveIngredient(recipeIngredient.ingredientId, overrides);
    if (!ingredient) {
      throw new Error(`Unknown ingredientId: ${recipeIngredient.ingredientId}`);
    }
    if (ingredient.unit !== recipeIngredient.unit) {
      throw new Error(`Unit mismatch for ingredient: ${recipeIngredient.ingredientId}`);
    }
    if (!Number.isFinite(ingredient.palengkePackSize) || ingredient.palengkePackSize <= 0) {
      throw new Error(`Invalid palengke pack size for ingredient: ${recipeIngredient.ingredientId}`);
    }

    const amount = scaleAmount(recipeIngredient.amount, scaleFactor);
    const packsNeeded = Math.max(1, Math.ceil(amount / ingredient.palengkePackSize));
    const unitPrice = applyPriceSource(ingredient.pricePerUnit, priceSource);
    const packPrice = applyPriceSource(ingredient.palengkePackPrice, priceSource);

    return {
      ingredientId: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      amount,
      displayAmount: scaleDisplayAmount(recipeIngredient.displayAmount, scaleFactor),
      exactCost: roundToTwoDecimals(amount * unitPrice),
      palengkePackLabel: ingredient.palengkePackLabel,
      palengkePackPrice: packPrice,
      packsNeeded,
      outOfPocketCost: roundToTwoDecimals(packsNeeded * packPrice),
    };
  });

  const totalExactCost = roundToTwoDecimals(
    scaledIngredients.reduce((sum, item) => sum + item.exactCost, 0),
  );
  const estimatedPalengkeOutOfPocket = roundToTwoDecimals(
    scaledIngredients.reduce((sum, item) => sum + item.outOfPocketCost, 0),
  );

  return {
    targetServings,
    scaleFactor,
    priceSource,
    ingredients: scaledIngredients,
    totalExactCost,
    costPerServing: roundToTwoDecimals(totalExactCost / targetServings),
    estimatedPalengkeOutOfPocket,
    budgetTier: getBudgetTier(estimatedPalengkeOutOfPocket),
  };
}

export function calculateRefMatch(
  recipe: Recipe,
  ownedIngredientIds: string[],
  targetServings: number = recipe.baseServings,
  priceSource: PriceSource = "palengke",
  overrides: PriceOverrides = {},
): RecipeRefMatch {
  const cost = calculateRecipeCost(recipe, targetServings, priceSource, overrides);
  const ownedIds = new Set(ownedIngredientIds);

  const matchedIngredientIds = cost.ingredients
    .filter((item) => ownedIds.has(item.ingredientId))
    .map((item) => item.ingredientId);

  const estimatedSavings = roundToTwoDecimals(
    cost.ingredients.reduce(
      (total, item) => (ownedIds.has(item.ingredientId) ? total + item.exactCost : total),
      0,
    ),
  );

  return {
    matchedIngredientIds,
    matchCount: matchedIngredientIds.length,
    estimatedSavings,
    remainingOutOfPocket: roundToTwoDecimals(
      Math.max(0, cost.estimatedPalengkeOutOfPocket - estimatedSavings),
    ),
  };
}

export function calculateWeeklyPlan(
  plan: WeeklyMealPlan,
  targetServings: number,
  priceSource: PriceSource = "palengke",
  availableRecipes: Recipe[] = staticRecipes,
  overrides: PriceOverrides = {},
): WeeklyPlanBreakdown {
  if (!Number.isFinite(targetServings) || targetServings <= 0) {
    throw new RangeError("targetServings must be a positive number");
  }

  const recipeLookup = createRecipeLookup(availableRecipes);
  const totals = new Map<string, { ingredient: Ingredient; totalAmount: number }>();
  let plannedDaysCount = 0;

  for (const day of DAYS_OF_WEEK) {
    const slug = plan[day];
    if (!slug) continue;

    const recipe = recipeLookup.get(slug);
    if (!recipe) continue;
    if (!Number.isFinite(recipe.baseServings) || recipe.baseServings <= 0) {
      throw new RangeError(`Invalid baseServings for recipe: ${recipe.slug}`);
    }

    plannedDaysCount += 1;
    const scaleFactor = targetServings / recipe.baseServings;

    for (const recipeIngredient of recipe.ingredients) {
      const ingredient = resolveIngredient(recipeIngredient.ingredientId, overrides);
      if (!ingredient) {
        throw new Error(`Unknown ingredientId: ${recipeIngredient.ingredientId}`);
      }
      if (ingredient.unit !== recipeIngredient.unit) {
        throw new Error(`Unit mismatch for ingredient: ${recipeIngredient.ingredientId}`);
      }
      if (!Number.isFinite(ingredient.palengkePackSize) || ingredient.palengkePackSize <= 0) {
        throw new Error(`Invalid palengke pack size for ingredient: ${recipeIngredient.ingredientId}`);
      }

      const amount = scaleAmount(recipeIngredient.amount, scaleFactor);
      const current = totals.get(ingredient.id) ?? { ingredient, totalAmount: 0 };
      current.totalAmount += amount;
      totals.set(ingredient.id, current);
    }
  }

  const consolidatedGroceryList = [...totals.values()]
    .map(({ ingredient, totalAmount }): WeeklyGroceryItem => {
      const roundedAmount = roundToTwoDecimals(totalAmount);
      const packsNeeded = Math.max(1, Math.ceil(roundedAmount / ingredient.palengkePackSize));
      const unitPrice = applyPriceSource(ingredient.pricePerUnit, priceSource);
      const packPrice = applyPriceSource(ingredient.palengkePackPrice, priceSource);

      return {
        ingredientId: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
        totalAmount: roundedAmount,
        unit: ingredient.unit,
        exactCost: roundToTwoDecimals(roundedAmount * unitPrice),
        palengkePackLabel: ingredient.palengkePackLabel,
        estimatedPackCost: roundToTwoDecimals(packsNeeded * packPrice),
      };
    })
    .sort((a, b) => {
      const categoryDifference =
        INGREDIENT_CATEGORY_ORDER.indexOf(a.category) -
        INGREDIENT_CATEGORY_ORDER.indexOf(b.category);
      return categoryDifference !== 0 ? categoryDifference : a.name.localeCompare(b.name);
    });

  const totalExactCost = roundToTwoDecimals(
    consolidatedGroceryList.reduce((sum, item) => sum + item.exactCost, 0),
  );
  const consolidatedPalengkeCost = roundToTwoDecimals(
    consolidatedGroceryList.reduce((sum, item) => sum + item.estimatedPackCost, 0),
  );

  return {
    plannedDaysCount,
    priceSource,
    totalExactCost,
    consolidatedPalengkeCost,
    averagePerDay:
      plannedDaysCount > 0 ? roundToTwoDecimals(totalExactCost / plannedDaysCount) : 0,
    consolidatedGroceryList,
  };
}

export function formatRecipePalengkeText(
  recipe: Recipe,
  targetServings: number,
  checkedIngredientIds: string[] = [],
  priceSource: PriceSource = "palengke",
  overrides: PriceOverrides = {},
): string {
  const cost = calculateRecipeCost(recipe, targetServings, priceSource, overrides);
  const checkedIds = new Set(checkedIngredientIds);
  const useStatus = checkedIds.size > 0;
  const isSupermarket = priceSource === "supermarket";
  const sourceLabel = isSupermarket ? "Supermarket" : "Palengke";
  const packLabel = isSupermarket ? "supermarket pack" : "retail pack";

  const lines = [
    isSupermarket
      ? "Zence's Lutong Ulam - Supermarket List (+15% est.)"
      : "Zence's Lutong Ulam - Palengke List",
    "",
    `${recipe.title} (${formatAmount(targetServings)} pax)`,
    "",
  ];

  for (const item of cost.ingredients) {
    lines.push(
      `${checklistMarker(useStatus, checkedIds.has(item.ingredientId))} ${formatAmount(item.amount)} ${formatPlainTextUnit(item.unit, item.amount)} ${item.name} — ${formatPHP(item.exactCost)} exact (${formatPHP(item.outOfPocketCost)} ${packLabel})`,
    );
  }

  lines.push(
    "",
    `Est. ${sourceLabel} Total: ${formatPHP(cost.estimatedPalengkeOutOfPocket)}`,
    `Cost per Serving: ${formatPHP(cost.costPerServing)}`,
  );

  if (isSupermarket) {
    lines.push("", "Estimate: +15% over palengke reference prices.");
  }

  return lines.join("\n");
}

export function formatWeeklyPalengkeText(
  plan: WeeklyMealPlan,
  targetServings: number,
  checkedIngredientIds: string[] = [],
  priceSource: PriceSource = "palengke",
  availableRecipes: Recipe[] = staticRecipes,
  overrides: PriceOverrides = {},
): string {
  const weekly = calculateWeeklyPlan(plan, targetServings, priceSource, availableRecipes, overrides);
  const recipeLookup = createRecipeLookup(availableRecipes);
  const checkedIds = new Set(checkedIngredientIds);
  const useStatus = checkedIds.size > 0;
  const isSupermarket = priceSource === "supermarket";
  const sourceLabel = isSupermarket ? "Supermarket" : "Palengke";
  const retailLabel = isSupermarket ? "supermarket retail" : "retail";
  const plannedDays: string[] = [];

  for (const day of DAYS_OF_WEEK) {
    const slug = plan[day];
    if (!slug) continue;

    const recipe = recipeLookup.get(slug);
    if (recipe) plannedDays.push(`${day}: ${recipe.title}`);
  }

  const lines = [
    isSupermarket
      ? `Zence's Lutong Ulam - Weekly Supermarket List (+15% est.) (${formatAmount(targetServings)} pax)`
      : `Zence's Lutong Ulam - Weekly Palengke List (${formatAmount(targetServings)} pax)`,
    "",
    "This week:",
    ...(plannedDays.length > 0 ? plannedDays : ["- No days planned yet."]),
    "",
    `${sourceLabel} list:`,
  ];

  let activeCategory: IngredientCategory | null = null;

  for (const item of weekly.consolidatedGroceryList) {
    if (item.category !== activeCategory) {
      if (activeCategory !== null) lines.push("");
      lines.push(item.category);
      activeCategory = item.category;
    }

    lines.push(
      `${checklistMarker(useStatus, checkedIds.has(item.ingredientId))} ${formatAmount(item.totalAmount)} ${formatPlainTextUnit(item.unit, item.totalAmount)} ${item.name} — ${formatPHP(item.estimatedPackCost)} ${retailLabel} (exact ${formatPHP(item.exactCost)})`,
    );
  }

  if (weekly.consolidatedGroceryList.length === 0) {
    lines.push("- No ingredients yet.");
  }

  lines.push("", `Est. Weekly ${sourceLabel} Total: ${formatPHP(weekly.consolidatedPalengkeCost)}`);

  if (isSupermarket) {
    lines.push("Estimate: +15% over palengke reference prices.");
  }

  return lines.join("\n");
}

function assertNonNegativeNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a non-negative number`);
  }
}

function negosyoUnitLabel(format: NegosyoFormat): string {
  return format === "packed-meals" ? "tub" : "tray";
}

function negosyoFormatLabel(format: NegosyoFormat): string {
  return format === "packed-meals" ? "Packed Meals" : "Party Tray";
}

export function calculateNegosyoBatch(
  recipe: Recipe,
  input: NegosyoBatchInput,
  priceSource: PriceSource = "palengke",
  overrides: PriceOverrides = {},
): NegosyoBatchBreakdown {
  if (!Number.isFinite(input.batchServings) || input.batchServings <= 0) {
    throw new RangeError("batchServings must be a positive number");
  }
  assertNonNegativeNumber(input.utilitiesBufferPct, "utilitiesBufferPct");
  assertNonNegativeNumber(input.targetProfitMarginPct, "targetProfitMarginPct");
  assertNonNegativeNumber(input.packagingUnitCost, "packagingUnitCost");
  assertNonNegativeNumber(input.trayCount, "trayCount");

  const recipeCost = calculateRecipeCost(recipe, input.batchServings, priceSource, overrides);
  const ingredientExactCost = recipeCost.totalExactCost;
  const utilitiesCost = roundToTwoDecimals(
    ingredientExactCost * (input.utilitiesBufferPct / 100),
  );
  const packagingUnits =
    input.format === "packed-meals" ? input.batchServings : input.trayCount;
  const packagingTotal = roundToTwoDecimals(packagingUnits * input.packagingUnitCost);
  const totalPuhunan = roundToTwoDecimals(ingredientExactCost + utilitiesCost + packagingTotal);
  const palengkeCashOutlay = roundToTwoDecimals(
    recipeCost.estimatedPalengkeOutOfPocket + utilitiesCost + packagingTotal,
  );
  const suggestedTotalRevenue = roundToTwoDecimals(
    totalPuhunan * (1 + input.targetProfitMarginPct / 100),
  );
  const netTubo = roundToTwoDecimals(suggestedTotalRevenue - totalPuhunan);

  return {
    recipe,
    input,
    recipeCost,
    ingredientExactCost,
    utilitiesCost,
    packagingUnits,
    packagingTotal,
    totalPuhunan,
    palengkeCashOutlay,
    suggestedTotalRevenue,
    netTubo,
    suggestedSellingPricePerUnit:
      packagingUnits > 0 ? roundToTwoDecimals(suggestedTotalRevenue / packagingUnits) : 0,
    costPerUnit: packagingUnits > 0 ? roundToTwoDecimals(totalPuhunan / packagingUnits) : 0,
    unitLabel: negosyoUnitLabel(input.format),
  };
}

export function formatNegosyoPalengkeText(
  recipe: Recipe,
  input: NegosyoBatchInput,
  breakdown: NegosyoBatchBreakdown,
  priceSource: PriceSource = "palengke",
  overrides: PriceOverrides = {},
): string {
  const isSupermarket = priceSource === "supermarket";
  const sourceLabel = isSupermarket ? "Supermarket" : "Palengke";
  const retailLabel = isSupermarket ? "supermarket retail" : "retail pack";
  const overrideCount = Object.keys(overrides).length;
  const unitLabel = breakdown.unitLabel;
  const unitText = `${formatAmount(breakdown.packagingUnits)} ${unitLabel}${
    breakdown.packagingUnits === 1 ? "" : "s"
  }`;

  const lines = [
    isSupermarket
      ? "Zence's Lutong Ulam - Negosyo Supermarket List (+15% est.)"
      : "Zence's Lutong Ulam - Negosyo Palengke List",
    "",
    `${recipe.title} (${formatAmount(input.batchServings)} pax)`,
    `Format: ${negosyoFormatLabel(input.format)} — ${unitText}`,
    `Price source: ${sourceLabel}`,
    "",
    "Bulk ingredients:",
  ];

  for (const item of breakdown.recipeCost.ingredients) {
    lines.push(
      `- ${formatBulkAmount(item.unit, item.amount)} ${item.name} — ${formatPHP(
        item.exactCost,
      )} exact (${formatPHP(item.outOfPocketCost)} ${retailLabel})`,
    );
  }

  lines.push(
    "",
    "Puhunan summary:",
    `- Ingredients (exact): ${formatPHP(breakdown.ingredientExactCost)}`,
    `- Ingredients (${sourceLabel} retail): ${formatPHP(
      breakdown.recipeCost.estimatedPalengkeOutOfPocket,
    )}`,
    `- LPG & Utilities Buffer (${formatAmount(input.utilitiesBufferPct)}%): ${formatPHP(
      breakdown.utilitiesCost,
    )}`,
    `- Packaging (${formatAmount(breakdown.packagingUnits)} x ${formatPHP(
      input.packagingUnitCost,
    )}): ${formatPHP(breakdown.packagingTotal)}`,
    `- Total Puhunan: ${formatPHP(breakdown.totalPuhunan)}`,
    `- ${sourceLabel} Cash Outlay: ${formatPHP(breakdown.palengkeCashOutlay)}`,
    `- Target Markup / Tubo: ${formatAmount(input.targetProfitMarginPct)}%`,
    `- Suggested Total Revenue: ${formatPHP(breakdown.suggestedTotalRevenue)}`,
    `- Net Tubo: ${formatPHP(breakdown.netTubo)}`,
    `- Cost per ${unitLabel}: ${formatPHP(breakdown.costPerUnit)}`,
    `- Suggested price per ${unitLabel}: ${formatPHP(breakdown.suggestedSellingPricePerUnit)}`,
  );

  if (overrideCount > 0) {
    lines.push(
      "",
      `Using ${overrideCount} custom palengke price${overrideCount === 1 ? "" : "s"}.`,
    );
  }

  if (isSupermarket) {
    lines.push("", "Estimate: +15% over palengke reference prices.");
  }

  return lines.join("\n");
}
