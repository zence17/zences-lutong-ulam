"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STORAGE_KEYS,
  SYNC_EVENTS,
  sanitizePriceOverrides,
} from "@/lib/backupStorage";
import type { PriceOverrides } from "@/lib/costCalculator";

const STORAGE_KEY = STORAGE_KEYS.priceOverrides;

export const PRICE_OVERRIDES_UPDATED_EVENT = SYNC_EVENTS.priceOverrides;

export interface UsePriceOverridesResult {
  overrides: PriceOverrides;
  setIngredientPrice: (ingredientId: string, price: number) => void;
  resetIngredientPrice: (ingredientId: string) => void;
  resetAllPrices: () => void;
  overrideCount: number;
  isHydrated: boolean;
}

function readOverrides(): PriceOverrides {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizePriceOverrides(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function writeOverrides(overrides: PriceOverrides): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {}

  window.dispatchEvent(
    new CustomEvent(PRICE_OVERRIDES_UPDATED_EVENT, { detail: { overrides } }),
  );
}

export function usePriceOverrides(): UsePriceOverridesResult {
  const [overrides, setOverrides] = useState<PriceOverrides>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setOverrides(readOverrides());
    setIsHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        setOverrides(readOverrides());
      }
    }

    function handleOverridesUpdated(event: Event) {
      const detail = (event as CustomEvent<{ overrides?: unknown }>).detail;
      setOverrides(detail ? sanitizePriceOverrides(detail.overrides) : readOverrides());
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PRICE_OVERRIDES_UPDATED_EVENT, handleOverridesUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PRICE_OVERRIDES_UPDATED_EVENT, handleOverridesUpdated);
    };
  }, []);

  const setIngredientPrice = useCallback((ingredientId: string, price: number) => {
    const sanitized = sanitizePriceOverrides({ [ingredientId]: price });
    if (Object.keys(sanitized).length === 0) return;

    const next = { ...readOverrides(), ...sanitized };
    writeOverrides(next);
    setOverrides(next);
  }, []);

  const resetIngredientPrice = useCallback((ingredientId: string) => {
    const next = { ...readOverrides() };
    delete next[ingredientId];
    writeOverrides(next);
    setOverrides(next);
  }, []);

  const resetAllPrices = useCallback(() => {
    writeOverrides({});
    setOverrides({});
  }, []);

  return {
    overrides,
    setIngredientPrice,
    resetIngredientPrice,
    resetAllPrices,
    overrideCount: Object.keys(overrides).length,
    isHydrated,
  };
}
