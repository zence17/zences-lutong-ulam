"use client";

import { useCallback, useEffect, useState } from "react";
import { recipes } from "@/data/recipes";
import { STORAGE_KEYS, SYNC_EVENTS } from "@/lib/backupStorage";
import { DAYS_OF_WEEK, calculateRecipeCost, roundToTwoDecimals } from "@/lib/costCalculator";
import type { DayOfWeek, WeeklyMealPlan } from "@/lib/costCalculator";
import type { Recipe, RecipeCategory } from "@/types/recipe";

const STORAGE_KEY = STORAGE_KEYS.mealPlan;
const DEFAULT_SERVINGS = 4;
const DEFAULT_WEEKLY_BUDGET = 1500;

export const MEAL_PLAN_UPDATED_EVENT = SYNC_EVENTS.mealPlan;

interface StoredMealPlanState {
  plan: WeeklyMealPlan;
  servings: number;
  weeklyBudget: number;
}

export interface UseMealPlanResult extends StoredMealPlanState {
  assignRecipe: (day: DayOfWeek, slug: string | null) => void;
  setServings: (value: number) => void;
  setWeeklyBudget: (value: number) => void;
  autoFillTipidWeek: () => void;
  clearWeek: () => void;
  isHydrated: boolean;
}

function createEmptyPlan(): WeeklyMealPlan {
  return {
    Mon: null,
    Tue: null,
    Wed: null,
    Thu: null,
    Fri: null,
    Sat: null,
    Sun: null,
  };
}

function createDefaultState(): StoredMealPlanState {
  return {
    plan: createEmptyPlan(),
    servings: DEFAULT_SERVINGS,
    weeklyBudget: DEFAULT_WEEKLY_BUDGET,
  };
}

function sanitizePlan(
  value: unknown,
  availableRecipes: Recipe[],
  extraSlugs: string[] = [],
): WeeklyMealPlan {
  const plan = createEmptyPlan();
  if (!value || typeof value !== "object") return plan;

  const validSlugs = new Set([
    ...availableRecipes.map((recipe) => recipe.slug),
    ...extraSlugs,
  ]);
  const source = value as Record<string, unknown>;
  for (const day of DAYS_OF_WEEK) {
    const slug = source[day];
    if (typeof slug === "string" && validSlugs.has(slug)) {
      plan[day] = slug;
    }
  }

  return plan;
}

function sanitizeServings(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
    return DEFAULT_SERVINGS;
  }

  return Math.round(value);
}

function sanitizeWeeklyBudget(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return DEFAULT_WEEKLY_BUDGET;
  }

  return roundToTwoDecimals(value);
}

function readStoredState(
  availableRecipes: Recipe[],
  extraSlugs: string[] = [],
): StoredMealPlanState {
  if (typeof window === "undefined") return createDefaultState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return createDefaultState();

    const source = parsed as Record<string, unknown>;
    return {
      plan: sanitizePlan(source.plan, availableRecipes, extraSlugs),
      servings: sanitizeServings(source.servings),
      weeklyBudget: sanitizeWeeklyBudget(source.weeklyBudget),
    };
  } catch {
    return createDefaultState();
  }
}

function buildTipidSlugs(availableRecipes: Recipe[]): string[] {
  const ranked = [...availableRecipes]
    .map((recipe) => ({
      recipe,
      costPerServing: calculateRecipeCost(recipe, recipe.baseServings).costPerServing,
    }))
    .sort((a, b) => a.costPerServing - b.costPerServing);

  const categoryOrder: RecipeCategory[] = ["Gulay", "Sabaw", "Prito / Gisa", "Karne"];
  const picked: string[] = [];
  const seen = new Set<string>();

  function add(slug: string) {
    if (seen.has(slug) || picked.length === DAYS_OF_WEEK.length) return;
    seen.add(slug);
    picked.push(slug);
  }

  for (const category of categoryOrder) {
    const match = ranked.find((entry) => entry.recipe.category === category);
    if (match) add(match.recipe.slug);
  }

  for (const entry of ranked) {
    add(entry.recipe.slug);
  }

  return picked;
}

export function useMealPlan(availableRecipes: Recipe[] = recipes): UseMealPlanResult {
  const [plan, setPlan] = useState<WeeklyMealPlan>(createEmptyPlan);
  const [servings, setServingsState] = useState(DEFAULT_SERVINGS);
  const [weeklyBudget, setWeeklyBudgetState] = useState(DEFAULT_WEEKLY_BUDGET);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredState(availableRecipes);
    setPlan(stored.plan);
    setServingsState(stored.servings);
    setWeeklyBudgetState(stored.weeklyBudget);
    setIsHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        const next = readStoredState(availableRecipes);
        setPlan(next.plan);
        setServingsState(next.servings);
        setWeeklyBudgetState(next.weeklyBudget);
      }
    }

    function handleMealPlanUpdated(event: Event) {
      const detail = (event as CustomEvent<{ customSlugs?: unknown }>).detail;
      const extraSlugs = Array.isArray(detail?.customSlugs)
        ? detail.customSlugs.filter((slug): slug is string => typeof slug === "string")
        : [];
      const next = readStoredState(availableRecipes, extraSlugs);
      setPlan(next.plan);
      setServingsState(next.servings);
      setWeeklyBudgetState(next.weeklyBudget);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(MEAL_PLAN_UPDATED_EVENT, handleMealPlanUpdated);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(MEAL_PLAN_UPDATED_EVENT, handleMealPlanUpdated);
    };
  }, [availableRecipes]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan, servings, weeklyBudget }));
    } catch {}
  }, [isHydrated, plan, servings, weeklyBudget]);

  const assignRecipe = useCallback(
    (day: DayOfWeek, slug: string | null) => {
      const validSlug =
        slug && availableRecipes.some((recipe) => recipe.slug === slug) ? slug : null;
      setPlan((current) => ({ ...current, [day]: validSlug }));
    },
    [availableRecipes],
  );

  const setServings = useCallback((value: number) => {
    setServingsState(sanitizeServings(value));
  }, []);

  const setWeeklyBudget = useCallback((value: number) => {
    setWeeklyBudgetState(sanitizeWeeklyBudget(value));
  }, []);

  const autoFillTipidWeek = useCallback(() => {
    const tipidSlugs = buildTipidSlugs(availableRecipes);
    const next = createEmptyPlan();
    DAYS_OF_WEEK.forEach((day, index) => {
      next[day] = tipidSlugs[index] ?? null;
    });
    setPlan(next);
  }, [availableRecipes]);

  const clearWeek = useCallback(() => {
    setPlan(createEmptyPlan());
  }, []);

  return {
    plan,
    servings,
    weeklyBudget,
    assignRecipe,
    setServings,
    setWeeklyBudget,
    autoFillTipidWeek,
    clearWeek,
    isHydrated,
  };
}
