import { ChefHat } from "lucide-react";
import { RecipeExplorer } from "@/components/RecipeExplorer";
import { priceMetadata } from "@/data/ingredients";
import { recipes } from "@/data/recipes";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-adobo/10 bg-gradient-to-b from-white/70 to-cream">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-adobo-soft px-3 py-1.5 text-xs font-bold text-adobo-dark">
            <ChefHat size={14} aria-hidden="true" />
            Lutong-Bahay + Presyong Palengke
          </span>

          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight text-charcoal sm:text-4xl">
            Anong ulam today?{" "}
            <span className="text-adobo">
              Honest lutong-bahay recipes with real palengke cost estimates.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
            Browse by budget or category, see cost per serving and the estimated palengke total for
            the whole family, then cook with confidence. Prices checked {priceMetadata.lastUpdated}.
          </p>
        </div>
      </section>

      <section id="recipes" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-adobo">The ulam list</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-charcoal">
            Pick today&apos;s lutong-bahay
          </h2>
        </div>

        <RecipeExplorer recipes={recipes} />
      </section>
    </>
  );
}
