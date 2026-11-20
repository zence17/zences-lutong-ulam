"use client";

import { useCallback, useEffect, useState } from "react";
import { getIngredientById } from "@/data/ingredients";
import { STORAGE_KEYS, SYNC_EVENTS } from "@/lib/backupStorage";
import { isCompressedRecipePhoto } from "@/lib/imageCompressor";
import type { IngredientUnit, Recipe, RecipeCategory, RecipeIngredient, RecipeStep } from "@/types/recipe";

const STORAGE_KEY = STORAGE_KEYS.customRecipes;

export const CUSTOM_RECIPES_UPDATED_EVENT = SYNC_EVENTS.customRecipes;

export interface AddCustomRecipeResult {
  ok: boolean;
  message: string;
}

export interface UseCustomRecipesResult {
  customRecipes: Recipe[];
  addCustomRecipe: (recipe: Recipe) => AddCustomRecipeResult;
  deleteCustomRecipe: (slug: string) => void;
  isHydrated: boolean;
}

const RECIPE_CATEGORIES: readonly RecipeCategory[] = ["Karne", "Sabaw", "Prito / Gisa", "Gulay"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isRecipeCategory(value: unknown): value is RecipeCategory {
  return RECIPE_CATEGORIES.some((category) => category === value);
}

function isIngredientUnit(value: unknown): value is IngredientUnit {
  return value === "g" || value === "mL" || value === "pcs" || value === "cloves" || value === "tali" || value === "sachet";
}

function sanitizeIngredient(value: unknown): RecipeIngredient | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.ingredientId)) return null;
  if (!isPositiveNumber(value.amount)) return null;
  if (!isIngredientUnit(value.unit)) return null;

  const ingredient = getIngredientById(value.ingredientId);
  if (!ingredient || ingredient.unit !== value.unit) return null;

  return {
    ingredientId: ingredient.id,
    amount: value.amount,
    displayAmount: isNonEmptyString(value.displayAmount)
      ? value.displayAmount
      : `${value.amount} ${value.unit}`,
    unit: value.unit,
  };
}

function sanitizeStep(value: unknown): RecipeStep | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.instruction)) return null;

  const durationMins = isNonNegativeNumber(value.durationMins) ? value.durationMins : undefined;

  return {
    id: value.id.trim(),
    instruction: value.instruction.trim(),
    ...(durationMins === undefined ? {} : { durationMins }),
  };
}

function sanitizeRecipe(value: unknown): Recipe | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.slug) || !value.slug.startsWith("custom-")) return null;
  if (!isNonEmptyString(value.title)) return null;
  if (!isRecipeCategory(value.category)) return null;
  if (!isNonNegativeNumber(value.prepTimeMins)) return null;
  if (!isNonNegativeNumber(value.cookTimeMins)) return null;
  if (!isPositiveNumber(value.baseServings)) return null;
  if (!isNonEmptyString(value.emoji)) return null;
  if (!isNonEmptyString(value.tipidTip)) return null;
  if (!Array.isArray(value.ingredients) || !Array.isArray(value.steps)) return null;

  const ingredients = value.ingredients
    .map(sanitizeIngredient)
    .filter((ingredient): ingredient is RecipeIngredient => ingredient !== null);
  const steps = value.steps
    .map(sanitizeStep)
    .filter((step): step is RecipeStep => step !== null);

  if (ingredients.length === 0 || steps.length === 0) return null;

  const image = isCompressedRecipePhoto(value.image) ? value.image : undefined;

  return {
    slug: value.slug.trim(),
    title: value.title.trim(),
    tagline: typeof value.tagline === "string" ? value.tagline.trim() : "",
    category: value.category,
    prepTimeMins: value.prepTimeMins,
    cookTimeMins: value.cookTimeMins,
    baseServings: value.baseServings,
    emoji: value.emoji.trim(),
    ...(image === undefined ? {} : { image }),
    ingredients,
    steps,
    tipidTip: value.tipidTip.trim(),
    isCustom: true,
  };
}

function sanitizeRecipes(value: unknown): Recipe[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: Recipe[] = [];

  for (const item of value) {
    const recipe = sanitizeRecipe(item);
    if (!recipe || seen.has(recipe.slug)) continue;
    seen.add(recipe.slug);
    result.push(recipe);
  }

  return result;
}

function readCustomRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeRecipes(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function writeCustomRecipes(recipes: Recipe[]): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));

  window.dispatchEvent(
    new CustomEvent(CUSTOM_RECIPES_UPDATED_EVENT, { detail: { recipes } }),
  );
}

function persistCustomRecipes(recipes: Recipe[]): void {
  try {
    writeCustomRecipes(recipes);
  } catch {}
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22)
  );
}

function getAddCustomRecipeError(error: unknown): string {
  if (isQuotaExceededError(error)) {
    return "Storage is full. Remove an older custom ulam or use a smaller photo, then save again.";
  }

  return "We couldn't save this ulam on this device. Please try again.";
}

export function useCustomRecipes(): UseCustomRecipesResult {
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCustomRecipes(readCustomRecipes());
    setIsHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        setCustomRecipes(readCustomRecipes());
      }
    }

    function handleCustomRecipesUpdated(event: Event) {
      const detail = (event as CustomEvent<{ recipes?: unknown }>).detail;
      setCustomRecipes(
        detail && Array.isArray(detail.recipes)
          ? sanitizeRecipes(detail.recipes)
          : readCustomRecipes(),
      );
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CUSTOM_RECIPES_UPDATED_EVENT, handleCustomRecipesUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CUSTOM_RECIPES_UPDATED_EVENT, handleCustomRecipesUpdated);
    };
  }, []);

  const addCustomRecipe = useCallback((recipe: Recipe): AddCustomRecipeResult => {
    const sanitized = sanitizeRecipe(recipe);
    if (!sanitized) {
      return { ok: false, message: "Check the recipe details, then save again." };
    }

    const updated = [
      ...readCustomRecipes().filter((item) => item.slug !== sanitized.slug),
      sanitized,
    ];

    try {
      writeCustomRecipes(updated);
    } catch (error) {
      return { ok: false, message: getAddCustomRecipeError(error) };
    }

    setCustomRecipes(updated);
    return { ok: true, message: "Ulam saved." };
  }, []);

  const deleteCustomRecipe = useCallback((slug: string) => {
    const updated = readCustomRecipes().filter((item) => item.slug !== slug);
    persistCustomRecipes(updated);
    setCustomRecipes(updated);
  }, []);

  return {
    customRecipes,
    addCustomRecipe,
    deleteCustomRecipe,
    isHydrated,
  };
}
