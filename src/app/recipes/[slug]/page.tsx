import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DishIllustration } from "@/components/DishIllustration";
import { RecipeDetailClient } from "@/components/RecipeDetailClient";
import { priceMetadata } from "@/data/ingredients";
import { getRecipeBySlug, recipes } from "@/data/recipes";
import { calculateRecipeCost, formatPHP } from "@/lib/costCalculator";

export const dynamicParams = false;

export function generateStaticParams() {
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

function publicFileExists(publicPath: string): boolean {
  if (!publicPath.startsWith("/")) return false;
  return existsSync(path.join(process.cwd(), "public", publicPath.slice(1)));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) return { title: "Recipe not found" };

  const cost = calculateRecipeCost(recipe, recipe.baseServings);
  const title = `${recipe.title} Recipe (${formatPHP(cost.costPerServing)}/serving) | Zence's Lutong Ulam`;
  const description = `${recipe.tagline} — Est. ${formatPHP(cost.estimatedPalengkeOutOfPocket)} palengke total for ${recipe.baseServings} pax. Step-by-step lutong-bahay guide & checklist.`;
  const ogImage = recipe.image && publicFileExists(recipe.image) ? recipe.image : "/og-default.png";

  return {
    title: { absolute: title },
    description,
    openGraph: {
      type: "article",
      siteName: "Zence's Lutong Ulam",
      locale: "en_PH",
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) notFound();

  const totalTime = recipe.prepTimeMins + recipe.cookTimeMins;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="no-print">
        <Link
          href="/recipes"
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
              category={recipe.category}
              slug={recipe.slug}
              image={recipe.image}
              alt={recipe.title}
              variant="hero"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <CategoryBadge category={recipe.category} />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/75">
                <Clock size={14} aria-hidden="true" />
                {recipe.prepTimeMins} min prep
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/75">
                <Clock size={14} aria-hidden="true" />
                {recipe.cookTimeMins} min cook
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-adobo">
                <Clock size={14} aria-hidden="true" />
                {totalTime} min total
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{recipe.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
              {recipe.tagline}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal/75">
              <Users size={16} aria-hidden="true" />
              Base recipe: {recipe.baseServings} pax
            </p>
          </div>
        </div>
      </header>

      <RecipeDetailClient recipe={recipe} priceMetadata={priceMetadata} />
    </div>
  );
}
