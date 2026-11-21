import type { PriceOverrides } from "@/lib/costCalculator";

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

function isPriceSource(value: unknown): value is "palengke" | "supermarket" {
  return value === "palengke" || value === "supermarket";
}

function readStoredValue(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === "") return undefined;

    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return raw;
    }
  } catch {
    return undefined;
  }
}

function collectCustomSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const slugs: string[] = [];
  for (const item of value) {
    if (isRecord(item) && typeof item.slug === "string" && item.slug.length > 0) {
      slugs.push(item.slug);
    }
  }

  return [...new Set(slugs)];
}

function sanitizeSavedSlugs(value: unknown[]): string[] {
  return [...new Set(value.filter((slug): slug is string => typeof slug === "string"))];
}

export function sanitizePriceOverrides(value: unknown): PriceOverrides {
  if (!isRecord(value)) return {};

  const sanitized: PriceOverrides = {};
  for (const [ingredientId, price] of Object.entries(value)) {
    if (typeof price === "number" && Number.isFinite(price) && price > 0) {
      sanitized[ingredientId] = Math.round((price + Number.EPSILON) * 100) / 100;
    }
  }

  return sanitized;
}

function buildWrites(data: Record<string, unknown>): BackupWrite[] {
  const writes: BackupWrite[] = [];
  const customSlugs = collectCustomSlugs(data.customRecipes);

  if (data.customRecipes !== undefined) {
    if (!Array.isArray(data.customRecipes)) return [];

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
    if (!Array.isArray(data.savedSlugs)) return [];

    const slugs = sanitizeSavedSlugs(data.savedSlugs);
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
    if (!isPriceSource(data.priceSource)) return [];

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
    if (!isRecord(data.mealPlan)) return [];

    writes.push({
      key: STORAGE_KEYS.mealPlan,
      value: JSON.stringify(data.mealPlan),
      label: "meal plan",
      dispatch: () => {
        window.dispatchEvent(
          new CustomEvent(SYNC_EVENTS.mealPlan, { detail: { customSlugs } }),
        );
      },
    });
  }

  if (data.priceOverrides !== undefined) {
    const overrides = sanitizePriceOverrides(data.priceOverrides);
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

  if (!isRecord(parsed) || parsed.app !== "zences-lutong-ulam") {
    return { ok: false, message: "This file is not a Zence's Lutong Ulam backup." };
  }

  if (parsed.version !== 1) {
    return { ok: false, message: "This backup version is not supported." };
  }

  if (!isRecord(parsed.data)) {
    return { ok: false, message: "The backup file has invalid data." };
  }

  const writes = buildWrites(parsed.data);
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
