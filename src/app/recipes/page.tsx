import type { Metadata } from "next";
import { RecipeExplorer } from "@/components/RecipeExplorer";
import { recipes } from "@/data/recipes";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Browse Filipino lutong-bahay recipes with palengke-based cost estimates.",
  openGraph: {
    title: "Recipes",
    description: "Browse Filipino lutong-bahay recipes with palengke-based cost estimates.",
    type: "website",
    images: ["/og-default.png"],
  },
};

export default function RecipesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-adobo">The collection</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Lutong-bahay recipes</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
        Six everyday ulam, each with a transparent palengke budget. Pick a dish, choose your
        servings, and cook with confidence.
      </p>

      <div className="mt-8">
        <h2 className="sr-only">Recipe browser</h2>
        <RecipeExplorer recipes={recipes} />
      </div>
    </div>
  );
}
