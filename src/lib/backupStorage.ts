import { getIngredientById } from "@/data/ingredients";
import {
  DAYS_OF_WEEK,
  type DayOfWeek,
  type PriceOverrides,
  type PriceSource,
  type WeeklyMealPlan,
} from "@/lib/costCalculator";
import type {
  IngredientUnit,
  Recipe,
  RecipeCategory,
  RecipeIngredient,
  RecipeStep,
} from "@/types/recipe";

export const STORAGE_KEYS = {
  customRecipes: "zences_lutong_ulam_custom_recipes",
  mealPlan: "zences_lutong_ulam_meal_plan",
  savedSlugs: "zences_lutong_ulam_saved",
  priceSource: "zences_lutong_ulam_price_source",
  priceOverrides: "zences_lutong_ulam_price_overrides",
} as const;

export const SYNC_EVENTS = {
  customRecipes: "custom-recipes-updated",
  mealPlan: "meal-plan-updated",
  savedSlugs: "saved-ulam-updated",
  priceSource: "price-source-updated",
  priceOverrides: "price-overrides-updated",
} as const;

const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_RECIPE_COUNT = 100;
const MAX_VALIDATION_DEPTH = 64;
const MAX_VALIDATION_NODES = 20000;
const MAX_IMAGE_SOURCE_LENGTH = 120000;
const LOCAL_IMAGE_PATTERN = /^\/images\/[A-Za-z0-9._/-]+$/;
const DATA_IMAGE_PATTERN = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const RECIPE_CATEGORIES: readonly RecipeCategory[] = [
  "Karne",
  "Sabaw",
  "Prito / Gisa",
  "Gulay",
];
const INGREDIENT_UNITS: readonly IngredientUnit[] = [
  "g",
  "mL",
  "pcs",
  "cloves",
  "tali",
  "sachet",
];
const CATEGORY_EMOJI: Record<RecipeCategory, string> = {
  Karne: "🍖",
  Sabaw: "🍲",
  "Prito / Gisa": "🍳",
  Gulay: "🥬",
};

export interface ZenceBackupPayload {
  app: "zences-lutong-ulam";
  version: 1;
  exportedAt: string;
  data: {
    customRecipes?: unknown;
    mealPlan?: unknown;
    savedSlugs?: unknown;
    priceSource?: unknown;
    priceOverrides?: unknown;
  };
}

export interface BackupImportResult {
  ok: boolean;
  message: string;
}

interface BackupWrite {
  key: string;
  value: string;
  label: string;
  dispatch: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPriceSource(value: unknown): value is PriceSource {
  return value === "palengke" || value === "supermarket";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRecipeCategory(value: unknown): value is RecipeCategory {
  return RECIPE_CATEGORIES.some((category) => category === value);
}

function isIngredientUnit(value: unknown): value is IngredientUnit {
  return INGREDIENT_UNITS.some((unit) => unit === value);
}

function containsUnsafeKeys(value: unknown): boolean {
  const stack: { value: unknown; depth: number }[] = [{ value, depth: 0 }];
  let visited = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    visited += 1;
    if (visited > MAX_VALIDATION_NODES || current.depth > MAX_VALIDATION_DEPTH) return true;

    if (Array.isArray(current.value)) {
      for (const entry of current.value) {
        stack.push({ value: entry, depth: current.depth + 1 });
      }
      continue;
    }

    if (!isRecord(current.value)) continue;

    for (const [key, child] of Object.entries(current.value)) {
      if (UNSAFE_KEYS.has(key)) return true;
      stack.push({ value: child, depth: current.depth + 1 });
    }
  }

  return false;
}

export function isSafeImageSrc(src?: string): boolean {
  if (typeof src !== "string" || src.length === 0 || src.length > MAX_IMAGE_SOURCE_LENGTH) {
    return false;
  }
  if (src.includes("\\") || /[\u0000-\u001F\u007F]/.test(src)) return false;

  if (LOCAL_IMAGE_PATTERN.test(src)) {
    return !src.includes("..") && !src.includes("//") && !src.endsWith("/");
  }

  const match = DATA_IMAGE_PATTERN.exec(src);
  if (!match) return false;

  return match[1].length % 4 === 0;
}

function readStoredValue(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === "") return undefined;

    try {
      const parsed = JSON.parse(raw) as unknown;
      return containsUnsafeKeys(parsed) ? undefined : parsed;
    } catch {
      return raw;
    }
  } catch {
    return undefined;
  }
}

export function sanitizePriceOverrides(value: unknown): PriceOverrides {
  if (!isRecord(value)) return {};

  const sanitized: PriceOverrides = {};
  for (const [ingredientId, price] of Object.entries(value)) {
    if (ingredientId.length === 0 || UNSAFE_KEYS.has(ingredientId)) continue;
    if (!isFiniteNumber(price) || price <= 0 || price >= 100000) continue;

    const rounded = Math.round((price + Number.EPSILON) * 100) / 100;
    if (rounded > 0 && rounded < 100000) {
      sanitized[ingredientId] = rounded;
    }
  }

  return sanitized;
}

function sanitizeRecipeIngredient(value: unknown): RecipeIngredient | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.ingredientId) || value.ingredientId.length > 120) return null;
  if (!isFiniteNumber(value.amount) || value.amount <= 0 || value.amount > 1000000) return null;
  if (!isIngredientUnit(value.unit)) return null;

  const ingredient = getIngredientById(value.ingredientId);
  if (!ingredient || ingredient.unit !== value.unit) return null;

  const displayAmount =
    typeof value.displayAmount === "string" && value.displayAmount.length <= 120
      ? value.displayAmount
      : `${value.amount} ${value.unit}`;

  return {
    ingredientId: ingredient.id,
    amount: value.amount,
    displayAmount,
    unit: value.unit,
  };
}

function sanitizeRecipeStep(value: unknown): RecipeStep | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.id) || value.id.length > 120) return null;
  if (!isNonEmptyString(value.instruction) || value.instruction.length > 2000) return null;

  let durationMins: number | undefined;
  if (value.durationMins !== undefined) {
    if (!isFiniteNumber(value.durationMins) || value.durationMins < 0 || value.durationMins > 10000) {
      return null;
    }
    durationMins = Math.round(value.durationMins);
  }

  return {
    id: value.id.trim(),
    instruction: value.instruction.trim(),
    ...(durationMins === undefined ? {} : { durationMins }),
  };
}

function sanitizeBackupRecipe(value: unknown): Recipe | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.slug) || !value.slug.startsWith("custom-") || value.slug.length > 120) {
    return null;
  }
  if (!isNonEmptyString(value.title) || value.title.length > 120) return null;
  if (!isRecipeCategory(value.category)) return null;
  if (!isFiniteNumber(value.baseServings) || value.baseServings <= 0 || value.baseServings > 100) {
    return null;
  }
  if (!Array.isArray(value.ingredients) || value.ingredients.length === 0 || value.ingredients.length > 50) {
    return null;
  }
  if (!Array.isArray(value.steps) || value.steps.length === 0 || value.steps.length > 100) {
    return null;
  }

  const prepTimeMins = value.prepTimeMins === undefined ? 15 : value.prepTimeMins;
  const cookTimeMins = value.cookTimeMins === undefined ? 30 : value.cookTimeMins;
  if (!isFiniteNumber(prepTimeMins) || prepTimeMins < 0 || prepTimeMins > 10000) return null;
  if (!isFiniteNumber(cookTimeMins) || cookTimeMins < 0 || cookTimeMins > 10000) return null;

  const ingredients = value.ingredients
    .map(sanitizeRecipeIngredient)
    .filter((ingredient): ingredient is RecipeIngredient => ingredient !== null);
  const steps = value.steps
    .map(sanitizeRecipeStep)
    .filter((step): step is RecipeStep => step !== null);
  if (ingredients.length === 0 || steps.length === 0) return null;

  const tagline = typeof value.tagline === "string" ? value.tagline.slice(0, 200) : "";
  const emoji = isNonEmptyString(value.emoji)
    ? value.emoji.slice(0, 16)
    : CATEGORY_EMOJI[value.category];
  const tipidTip = isNonEmptyString(value.tipidTip)
    ? value.tipidTip.slice(0, 1000)
    : "Plan your ingredients first, then cook and enjoy your own lutong-bahay ulam.";
  const image =
    typeof value.image === "string" && isSafeImageSrc(value.image) ? value.image : undefined;

  return {
    slug: value.slug.trim(),
    title: value.title.trim(),
    tagline,
    category: value.category,
    prepTimeMins: Math.round(prepTimeMins),
    cookTimeMins: Math.round(cookTimeMins),
    baseServings: value.baseServings,
    emoji,
    ...(image === undefined ? {} : { image }),
    ingredients,
    steps,
    tipidTip,
    isCustom: true,
  };
}

function sanitizeCustomRecipes(value: unknown): Recipe[] | null {
  if (!Array.isArray(value) || value.length > MAX_RECIPE_COUNT) return null;

  const recipes: Recipe[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const recipe = sanitizeBackupRecipe(item);
    if (!recipe || seen.has(recipe.slug)) return null;
    seen.add(recipe.slug);
    recipes.push(recipe);
  }

  return recipes;
}

function sanitizeSavedSlugs(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 500) return null;

  const slugs: string[] = [];
  for (const slug of value) {
    if (!isNonEmptyString(slug) || slug.length > 120) return null;
    slugs.push(slug);
  }

  return [...new Set(slugs)];
}

function sanitizeMealPlan(value: unknown): WeeklyMealPlan | null {
  if (!isRecord(value)) return null;

  const plan = Object.fromEntries(
    DAYS_OF_WEEK.map((day) => [day, null]),
  ) as WeeklyMealPlan;

  for (const [key, entry] of Object.entries(value)) {
    if (!DAYS_OF_WEEK.some((day) => day === key)) return null;
    if (entry === null) continue;
    if (!isNonEmptyString(entry) || entry.length > 120) return null;
    plan[key as DayOfWeek] = entry;
  }

  return plan;
}

interface SanitizedBackupData {
  customRecipes?: Recipe[];
  savedSlugs?: string[];
  priceSource?: PriceSource;
  mealPlan?: WeeklyMealPlan;
  priceOverrides?: PriceOverrides;
}

function sanitizeBackupData(data: Record<string, unknown>): SanitizedBackupData | null {
  const allowedKeys = new Set(Object.keys(SYNC_EVENTS));
  for (const key of Object.keys(data)) {
    if (!allowedKeys.has(key)) return null;
  }

  const sanitized: SanitizedBackupData = {};

  if (data.customRecipes !== undefined) {
    const recipes = sanitizeCustomRecipes(data.customRecipes);
    if (!recipes) return null;
    sanitized.customRecipes = recipes;
  }

  if (data.savedSlugs !== undefined) {
    const slugs = sanitizeSavedSlugs(data.savedSlugs);
    if (!slugs) return null;
    sanitized.savedSlugs = slugs;
  }

  if (data.priceSource !== undefined) {
    if (!isPriceSource(data.priceSource)) return null;
    sanitized.priceSource = data.priceSource;
  }

  if (data.mealPlan !== undefined) {
    const plan = sanitizeMealPlan(data.mealPlan);
    if (!plan) return null;
    sanitized.mealPlan = plan;
  }

  if (data.priceOverrides !== undefined) {
    sanitized.priceOverrides = sanitizePriceOverrides(data.priceOverrides);
  }

  return sanitized;
}

function buildWrites(data: SanitizedBackupData): BackupWrite[] {
  const writes: BackupWrite[] = [];
  const customSlugs = data.customRecipes?.map((recipe) => recipe.slug) ?? [];

  if (data.customRecipes !== undefined) {
    const recipes = data.customRecipes;
    writes.push({
      key: STORAGE_KEYS.customRecipes,
      value: JSON.stringify(recipes),
      label: "custom recipes",
      dispatch: () => {
        window.dispatchEvent(
          new CustomEvent(SYNC_EVENTS.customRecipes, { detail: { recipes } }),
        );
      },
    });
  }

  if (data.savedSlugs !== undefined) {
    const slugs = data.savedSlugs;
    writes.push({
      key: STORAGE_KEYS.savedSlugs,
      value: JSON.stringify(slugs),
      label: "saved ulam",
      dispatch: () => {
        window.dispatchEvent(
          new CustomEvent(SYNC_EVENTS.savedSlugs, { detail: { slugs } }),
        );
      },
    });
  }

  if (data.priceSource !== undefined) {
    const source = data.priceSource;
    writes.push({
      key: STORAGE_KEYS.priceSource,
      value: source,
      label: "price source",
      dispatch: () => {
        window.dispatchEvent(
          new CustomEvent(SYNC_EVENTS.priceSource, { detail: source }),
        );
      },
    });
  }

  if (data.mealPlan !== undefined) {
    const plan = data.mealPlan;
    writes.push({
      key: STORAGE_KEYS.mealPlan,
      value: JSON.stringify(plan),
      label: "meal plan",
      dispatch: () => {
        window.dispatchEvent(
          new CustomEvent(SYNC_EVENTS.mealPlan, { detail: { customSlugs } }),
        );
      },
    });
  }

  if (data.priceOverrides !== undefined) {
    const overrides = data.priceOverrides;
    writes.push({
      key: STORAGE_KEYS.priceOverrides,
      value: JSON.stringify(overrides),
      label: "palengke price overrides",
      dispatch: () => {
        window.dispatchEvent(
          new CustomEvent(SYNC_EVENTS.priceOverrides, { detail: { overrides } }),
        );
      },
    });
  }

  return writes;
}

export function exportBackupJson(): void {
  if (typeof window === "undefined") return;

  const data: ZenceBackupPayload["data"] = {};
  const customRecipes = readStoredValue(STORAGE_KEYS.customRecipes);
  const mealPlan = readStoredValue(STORAGE_KEYS.mealPlan);
  const savedSlugs = readStoredValue(STORAGE_KEYS.savedSlugs);
  const priceSource = readStoredValue(STORAGE_KEYS.priceSource);
  const priceOverrides = readStoredValue(STORAGE_KEYS.priceOverrides);

  if (customRecipes !== undefined) data.customRecipes = customRecipes;
  if (mealPlan !== undefined) data.mealPlan = mealPlan;
  if (savedSlugs !== undefined) data.savedSlugs = savedSlugs;
  if (priceSource !== undefined) data.priceSource = priceSource;
  if (priceOverrides !== undefined) data.priceOverrides = sanitizePriceOverrides(priceOverrides);

  const now = new Date();
  const payload: ZenceBackupPayload = {
    app: "zences-lutong-ulam",
    version: 1,
    exportedAt: now.toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `zences-lutong-ulam-backup-${now.toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importBackupJson(fileContent: string): BackupImportResult {
  if (typeof window === "undefined") {
    return { ok: false, message: "Import is only available in the browser." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent) as unknown;
  } catch {
    return { ok: false, message: "That file is not valid JSON." };
  }

  if (containsUnsafeKeys(parsed)) {
    return { ok: false, message: "This backup file contains unsafe keys." };
  }

  if (!isRecord(parsed) || parsed.app !== "zences-lutong-ulam") {
    return { ok: false, message: "This file is not a Zence's Lutong Ulam backup." };
  }

  if (parsed.version !== 1) {
    return { ok: false, message: "This backup version is not supported." };
  }

  if (!isRecord(parsed.data)) {
    return { ok: false, message: "The backup file has invalid data." };
  }

  const sanitized = sanitizeBackupData(parsed.data);
  if (!sanitized) {
    return { ok: false, message: "The backup file has invalid data." };
  }

  const writes = buildWrites(sanitized);
  if (writes.length === 0) {
    return { ok: false, message: "The backup file has no data to restore." };
  }

  const failed: string[] = [];
  for (const write of writes) {
    try {
      window.localStorage.setItem(write.key, write.value);
      write.dispatch();
    } catch {
      failed.push(write.label);
    }
  }

  if (failed.length > 0) {
    return {
      ok: false,
      message: `Could not restore: ${failed.join(", ")}.`,
    };
  }

  return {
    ok: true,
    message: `Backup restored: ${writes.map((write) => write.label).join(", ")}.`,
  };
}
