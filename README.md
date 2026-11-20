# Zence's Lutong Ulam

Zence's Lutong Ulam is a lightweight, static-first Filipino home-cooking guide and *palengke* cost estimator built for everyday households in the Philippines. It helps families decide what to cook, understand the real cost of each dish, and plan a week of ulam without an account or backend.

## Key Features

- **Transparent Dual Costing:** Shows both Exact Ingredient Cost and realistic *Palengke / Sari-Sari* Out-of-Pocket estimates, plus a global **Palengke vs. Supermarket (+15% est.)** mode toggle.
- **Smart Filtering & "What's in My Ref?" Matcher:** Filter by daily budget (`Under ₱150`, `₱150–₱300`, `₱300+`), dish category, cooking time, lowest cost, or ingredients you already have at home.
- **Interactive Recipe Guides (`/recipes/[slug]`):** Real-time serving size scaler (`2`–`20` pax), tappable *palengke* shopping checklist, Messenger/Viber copy-to-clipboard formatting, and a built-in **"Kain Na!" Kitchen Countdown Timer**.
- **Presyong Palengke Directory (`/presyo`):** Searchable Metro Manila reference price list grouped by *Karne & Isda*, *Gulay & Prutas*, and *Pantry & Sari-Sari*.
- **Weekly Ulam & Budget Planner (`/meal-plan`):** Mon–Sun meal scheduler with weekly budget tracking, one-click *Tipid Week* auto-fill, and a consolidated weekly grocery list.
- **Custom Ulam Creator & Offline Backup:** Add personal family recipes saved locally in `localStorage` and export/import JSON backups anytime—zero backend or account required.

## Tech Stack & Architecture

- **Next.js App Router** with `output: "export"` static generation and unoptimized images.
- **TypeScript** strict mode, **Tailwind CSS**, `lucide-react` icons, and browser `localStorage`.
- **Static by default:** every page is prerendered; dynamic recipe routes use `generateStaticParams()`.
- **Single source of truth for prices:** `src/data/ingredients.ts` holds all ingredient prices in PHP `₱`.
- **Recipes reference ingredients only:** `src/data/recipes.ts` stores `ingredientId` and quantity—never hardcoded prices.
- **Pure cost logic:** scaling, rounding, and cost estimates live in `src/lib/costCalculator.ts`.

```text
src/
├─ app/          # App Router pages, layouts, metadata, globals.css
├─ components/   # Recipe explorer, cards, cost panel, timer, backup controls
├─ data/         # ingredients.ts and recipes.ts
├─ hooks/        # hydration-safe localStorage hooks
├─ lib/          # costCalculator.ts and pure helpers
└─ types/        # shared TypeScript types
```

## Getting Started (Local Development & Static Build)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create the static production export:

```bash
npm run build
```

The deployable static site is generated in `out/`.

Optional checks:

```bash
npm run typecheck
npm run lint
```

## How to Update Palengke Prices & Add Recipes

### Update prices

Edit `src/data/ingredients.ts`. Change `pricePerUnit` for recipe costing, `palengkePackPrice` (and its label/size) for realistic pack-based buying, and `LAST_UPDATED` for the reference date. Because every recipe references ingredients by ID, all recipe costs, budget tiers, filters, meal plans, and the `/presyo` directory recalculate automatically.

```ts
const LAST_UPDATED = "December 2026" as const;

export const ingredients = {
  "pork-kasim": {
    id: "pork-kasim",
    name: "Pork kasim",
    category: "Karne & Isda",
    unit: "g",
    pricePerUnit: 0.36,
    palengkePackLabel: "1/4 kg (250 g) — ₱90",
    palengkePackPrice: 90,
    palengkePackSize: 250,
    lastUpdated: LAST_UPDATED,
  },
};
```

Keep `palengkePackLabel`, `palengkePackPrice`, and `palengkePackSize` consistent.

### Add a built-in dish

Add a new object to the `recipes` array in `src/data/recipes.ts`. Use a unique `slug`, reference existing ingredient IDs, and give each step a unique ID. Do not put prices in the recipe.

```ts
{
  slug: "new-ulam",
  title: "New Ulam",
  tagline: "Short, practical description.",
  category: "Karne", // Sabaw | Prito / Gisa | Gulay | Karne
  prepTimeMins: 15,
  cookTimeMins: 30,
  baseServings: 4,
  emoji: "🍲",
  ingredients: [
    { ingredientId: "pork-kasim", amount: 500, displayAmount: "500 g", unit: "g" },
  ],
  steps: [
    { id: "new-ulam-1", instruction: "Cook until done.", durationMins: 30 },
  ],
  tipidTip: "Practical budget tip.",
}
```

After changing data files, run `npm run typecheck`, `npm run lint`, and `npm run build`.
