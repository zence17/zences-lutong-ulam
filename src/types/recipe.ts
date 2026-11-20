export type IngredientUnit = "g" | "mL" | "pcs" | "cloves" | "tali" | "sachet";

export type IngredientCategory = "Karne & Isda" | "Gulay & Prutas" | "Pantry & Sari-Sari";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unit: IngredientUnit;
  pricePerUnit: number;
  palengkePackLabel: string;
  palengkePackPrice: number;
  palengkePackSize: number;
  lastUpdated: string;
}

export type RecipeCategory = "Karne" | "Sabaw" | "Prito / Gisa" | "Gulay";

export interface RecipeIngredient {
  ingredientId: string;
  amount: number;
  displayAmount: string;
  unit: IngredientUnit;
}

export interface RecipeStep {
  id: string;
  instruction: string;
  durationMins?: number;
}

export interface Recipe {
  slug: string;
  title: string;
  tagline: string;
  category: RecipeCategory;
  prepTimeMins: number;
  cookTimeMins: number;
  baseServings: number;
  emoji: string;
  image?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tipidTip: string;
  isCustom?: boolean;
}
