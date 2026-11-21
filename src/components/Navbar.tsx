"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, BookOpen, CalendarDays, ChefHat, ShoppingBasket, Wallet } from "lucide-react";
import { usePriceSource } from "@/hooks/usePriceSource";
import { requestSavedUlamFilter, useSavedUlam } from "@/hooks/useSavedUlam";

export function Navbar() {
  const { savedCount, isHydrated } = useSavedUlam();
  const { priceSource, setPriceSource, isHydrated: isPriceSourceHydrated } = usePriceSource();
  const priceSourceId = useId();
  const pathname = usePathname();
  const recipesActive = pathname.startsWith("/recipes");
  const mealPlanActive = pathname === "/meal-plan";
  const presyoActive = pathname === "/presyo";
  const negosyoActive = pathname === "/negosyo";
  const [isOnline, setIsOnline] = useState(true);
  const [onlineStatusReady, setOnlineStatusReady] = useState(false);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    setOnlineStatusReady(true);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-adobo/15 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="order-1 flex items-center gap-3 text-charcoal">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-adobo text-white shadow-card">
            <ChefHat size={20} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight sm:text-base">
              Zence&apos;s Lutong Ulam
            </span>
            <span className="mt-0.5 inline-block rounded-full bg-adobo-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-adobo-dark">
              Lutong-Bahay + Presyong Palengke
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="order-2 flex flex-wrap items-center gap-1.5 text-sm font-bold sm:gap-2 lg:order-none"
        >
          <Link
            href="/recipes"
            aria-label="Recipes"
            aria-current={recipesActive ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-adobo-soft hover:text-adobo-dark ${
              recipesActive ? "bg-adobo-soft text-adobo-dark" : "text-charcoal"
            }`}
          >
            <BookOpen size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Recipes</span>
          </Link>
          <Link
            href="/meal-plan"
            aria-label="Meal Plan"
            aria-current={mealPlanActive ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-adobo-soft hover:text-adobo-dark ${
              mealPlanActive ? "bg-adobo-soft text-adobo-dark" : "text-charcoal"
            }`}
          >
            <CalendarDays size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Meal Plan</span>
          </Link>
          <Link
            href="/presyo"
            aria-label="Presyong Palengke"
            aria-current={presyoActive ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-adobo-soft hover:text-adobo-dark ${
              presyoActive ? "bg-adobo-soft text-adobo-dark" : "text-charcoal"
            }`}
          >
            <Wallet size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Presyong Palengke</span>
          </Link>
          <Link
            href="/negosyo"
            aria-label="Negosyo"
            aria-current={negosyoActive ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-adobo-soft hover:text-adobo-dark ${
              negosyoActive ? "bg-adobo-soft text-adobo-dark" : "text-charcoal"
            }`}
          >
            <ShoppingBasket size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Negosyo</span>
          </Link>
          <Link
            href="/?saved=1"
            aria-label={isHydrated ? `Saved Ulam (${savedCount})` : "Saved Ulam"}
            onClick={() => requestSavedUlamFilter(true)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-adobo/20 bg-white px-3 py-2 text-adobo transition-colors hover:border-adobo hover:bg-adobo-soft"
          >
            <Bookmark size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Saved Ulam</span>
            {isHydrated ? (
              <span
                aria-hidden="true"
                className="flex h-6 min-w-6 items-center justify-center rounded-full bg-adobo px-1.5 text-[11px] font-black text-white"
              >
                {savedCount}
              </span>
            ) : null}
          </Link>
        </nav>

        <div className="order-3 flex w-full items-center justify-end gap-2 lg:order-none lg:w-auto lg:justify-start">
          {onlineStatusReady ? (
            <span
              role="status"
              aria-live="polite"
              className={`inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-xs font-extrabold ${
                isOnline
                  ? "border-calamansi/30 bg-calamansi/10 text-calamansi"
                  : "border-charcoal/15 bg-charcoal/5 text-charcoal/80"
              }`}
            >
              {isOnline ? "Offline Ready" : "Offline Mode"}
            </span>
          ) : null}
          <fieldset
            aria-busy={!isPriceSourceHydrated}
            className="inline-flex max-w-full flex-wrap items-center justify-end gap-0.5 rounded-full border border-charcoal/10 bg-white p-0.5 shadow-card"
          >
            <legend className="sr-only">Price source</legend>
            <label htmlFor={`${priceSourceId}-palengke`} className="cursor-pointer">
              <input
                id={`${priceSourceId}-palengke`}
                type="radio"
                name="price-source"
                value="palengke"
                checked={priceSource === "palengke"}
                onChange={() => setPriceSource("palengke")}
                disabled={!isPriceSourceHydrated}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-xs font-extrabold text-charcoal/75 transition-colors hover:text-adobo peer-checked:bg-adobo peer-checked:text-white peer-disabled:cursor-wait peer-disabled:opacity-60 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adobo">
                Palengke
              </span>
            </label>
            <label htmlFor={`${priceSourceId}-supermarket`} className="cursor-pointer">
              <input
                id={`${priceSourceId}-supermarket`}
                type="radio"
                name="price-source"
                value="supermarket"
                checked={priceSource === "supermarket"}
                onChange={() => setPriceSource("supermarket")}
                disabled={!isPriceSourceHydrated}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-xs font-extrabold text-charcoal/75 transition-colors hover:text-adobo peer-checked:bg-adobo peer-checked:text-white peer-disabled:cursor-wait peer-disabled:opacity-60 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adobo">
                Supermarket +15%
              </span>
            </label>
          </fieldset>
        </div>
      </div>
    </header>
  );
}
