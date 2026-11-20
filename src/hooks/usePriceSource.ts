"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS, SYNC_EVENTS } from "@/lib/backupStorage";
import type { PriceSource } from "@/lib/costCalculator";

const STORAGE_KEY = STORAGE_KEYS.priceSource;

export const PRICE_SOURCE_UPDATED_EVENT = SYNC_EVENTS.priceSource;

export interface UsePriceSourceResult {
  priceSource: PriceSource;
  setPriceSource: (source: PriceSource) => void;
  isSupermarket: boolean;
  isHydrated: boolean;
}

function isPriceSource(value: unknown): value is PriceSource {
  return value === "palengke" || value === "supermarket";
}

function readPriceSource(): PriceSource {
  if (typeof window === "undefined") return "palengke";

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isPriceSource(raw) ? raw : "palengke";
  } catch {
    return "palengke";
  }
}

export function usePriceSource(): UsePriceSourceResult {
  const [priceSource, setPriceSourceState] = useState<PriceSource>("palengke");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setPriceSourceState(readPriceSource());
    setIsHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        setPriceSourceState(readPriceSource());
      }
    }

    function handlePriceSourceUpdated(event: Event) {
      const detail = (event as CustomEvent<unknown>).detail;
      setPriceSourceState(isPriceSource(detail) ? detail : readPriceSource());
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PRICE_SOURCE_UPDATED_EVENT, handlePriceSourceUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PRICE_SOURCE_UPDATED_EVENT, handlePriceSourceUpdated);
    };
  }, []);

  const setPriceSource = useCallback((source: PriceSource) => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, source);
    } catch {}

    setPriceSourceState(source);
    window.dispatchEvent(
      new CustomEvent<PriceSource>(PRICE_SOURCE_UPDATED_EVENT, { detail: source }),
    );
  }, []);

  return {
    priceSource,
    setPriceSource,
    isSupermarket: priceSource === "supermarket",
    isHydrated,
  };
}
