"use client";

import { Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Trash2, Users } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DishIllustration } from "@/components/DishIllustration";
import { RecipeDetailClient } from "@/components/RecipeDetailClient";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";

export function CustomRecipeLoading() {
  return (
    <div className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-card">
      <div className="h-4 w-32 animate-pulse rounded-full bg-charcoal/10" />
      <div className="mt-4 h-9 w-72 max-w-full animate-pulse rounded-full bg-charcoal/10" />
      <p className="mt-6 text-sm font-semibold text-charcoal/75">Loading your custom ulam…</p>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="rounded-3xl border border-dashed border-adobo/30 bg-white px-6 py-16 text-center shadow-card">
      <p className="text-lg font-black text-charcoal">That custom ulam isn&apos;t on this device.</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/75">
        Custom recipes stay in this browser only. The link may be from another device, or the recipe
        may have been deleted.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-adobo px-5 text-sm font-black text-white transition-colors hover:bg-adobo-dark"
      >
        Back to All Ulam
      </Link>
    </div>
  );
}

function CustomRecipeViewer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const { customRecipes, deleteCustomRecipe, isHydrated } = useCustomRecipes();
  const customRecipe = id ? customRecipes.find((recipe) => recipe.slug === id) : undefined;

  if (!isHydrated) return <CustomRecipeLoading />;
  if (!customRecipe) return <NotFoundState />;

  const totalTime = customRecipe.prepTimeMins + customRecipe.cookTimeMins;

  function handleDelete() {
    if (!customRecipe) return;
    deleteCustomRecipe(customRecipe.slug);
    router.push("/");
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="no-print">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-bold text-charcoal/75 transition-colors hover:text-adobo"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to All Ulam
        </Link>
      </nav>

      <header className="mt-6 overflow-hidden rounded-3xl border border-adobo/10 bg-white shadow-card">
        <div className="flex flex-col gap-6 bg-gradient-to-br from-adobo-soft via-cream to-calamansi-soft p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="w-full shrink-0 overflow-hidden rounded-2xl shadow-card sm:w-56">
            <DishIllustration
              category={customRecipe.category}
              slug={customRecipe.slug}
              image={customRecipe.image}
              alt={customRecipe.title}
              variant="hero"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <CategoryBadge category={customRecipe.category} />
              <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-xs font-black text-adobo">
                My Recipe
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/75">
                <Clock size={14} aria-hidden="true" />
                {customRecipe.prepTimeMins} min prep
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/75">
                <Clock size={14} aria-hidden="true" />
                {customRecipe.cookTimeMins} min cook
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-adobo">
                <Clock size={14} aria-hidden="true" />
                {totalTime} min total
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {customRecipe.title}
            </h1>
            {customRecipe.tagline ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
                {customRecipe.tagline}
              </p>
            ) : null}
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal/75">
              <Users size={16} aria-hidden="true" />
              Base recipe: {customRecipe.baseServings} pax
            </p>

            <button
              type="button"
              onClick={() => deleteDialogRef.current?.showModal()}
              className="no-print mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-adobo/25 bg-white px-4 text-sm font-black text-adobo transition-colors hover:border-adobo hover:bg-adobo-soft"
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete Custom Ulam
            </button>
          </div>
        </div>
      </header>

      <RecipeDetailClient recipe={customRecipe} />

      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-custom-title"
        className="no-print w-[calc(100%-1rem)] max-w-md rounded-3xl border border-charcoal/10 bg-white p-6 shadow-2xl backdrop:bg-charcoal/60"
      >
        <h2 id="delete-custom-title" className="text-xl font-black text-charcoal">
          Delete this custom ulam?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
          &quot;{customRecipe.title}&quot; will be removed from this browser. This cannot be undone.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <form method="dialog">
            <button
              value="cancel"
              autoFocus
              className="inline-flex min-h-11 items-center rounded-full border border-charcoal/15 px-5 text-sm font-black text-charcoal/75 transition-colors hover:border-adobo/40 hover:text-adobo"
            >
              Keep recipe
            </button>
          </form>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex min-h-11 items-center rounded-full bg-adobo px-5 text-sm font-black text-white transition-colors hover:bg-adobo-dark"
          >
            Delete Custom Ulam
          </button>
        </div>
      </dialog>
    </>
  );
}

export default function CustomRecipeView() {
  return (
    <Suspense fallback={<CustomRecipeLoading />}>
      <CustomRecipeViewer />
    </Suspense>
  );
}
