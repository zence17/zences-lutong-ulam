import type { RecipeCategory } from "@/types/recipe";

const categoryStyles: Record<RecipeCategory, string> = {
  Karne: "bg-adobo-soft text-adobo-dark",
  Sabaw: "bg-adobo/10 text-adobo-dark",
  "Prito / Gisa": "bg-adobo/15 text-adobo",
  Gulay: "bg-calamansi-soft text-calamansi",
};

export function CategoryBadge({ category }: { category: RecipeCategory }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${categoryStyles[category]}`}
    >
      {category}
    </span>
  );
}
