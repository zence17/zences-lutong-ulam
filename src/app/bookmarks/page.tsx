import type { Metadata } from "next";
import { BookmarkList } from "@/components/BookmarkList";
import { recipes } from "@/data/recipes";

export const metadata: Metadata = {
  title: "Saved Recipes",
  description: "Your saved Filipino lutong-bahay recipes, stored locally on this device.",
  openGraph: {
    title: "Saved Recipes",
    description: "Your saved Filipino lutong-bahay recipes, stored locally on this device.",
    type: "website",
    images: ["/og-default.png"],
  },
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-adobo">Your kitchen notes</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Saved ulam</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
        Your bookmarks stay in this browser only. Revisit the recipes your household loves and
        recalculate costs anytime.
      </p>

      <div className="mt-8">
        <h2 className="sr-only">Your saved ulam list</h2>
        <BookmarkList recipes={recipes} />
      </div>
    </div>
  );
}
