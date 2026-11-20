# Project: Zence's Lutong Ulam
A lightweight, static-first Filipino home-cooking guide and recipe cost estimator built for everyday households in the Philippines.

## Tech Stack & Constraints
- **Framework:** Next.js (App Router) configured strictly for static export (`output: 'export'`, `images: { unoptimized: true }`).
- **Language:** TypeScript (strict mode, no `any`).
- **Styling:** Tailwind CSS.
- **No Backend / No External APIs:** All data lives locally in `src/data/` and user bookmarks persist via `localStorage` only.
- **No Unapproved Dependencies:** Do not install third-party UI libraries or state managers without explicit approval. Use `lucide-react` for icons only if needed.

## Architecture & Coding Standards
- **Single Source of Truth for Prices:** Ingredient prices (in PHP `₱`) must ONLY exist in `src/data/ingredients.ts`. Recipes in `src/data/recipes.ts` must reference ingredients by `ingredientId` and quantity—never hardcode prices inside recipes or UI components.
- **Separation of Concerns:** Keep all scaling, rounding, and cost estimation logic inside pure functions in `src/lib/costCalculator.ts`.
- **UI/UX Direction:** Warm, appetizing Filipino home-kitchen aesthetic (warm cream `#FAF7F2` background, deep charcoal `#1F2937` text, terracotta/adobo-amber `#C2410C` primary accents, calamansi-green `#15803D` for budget badges). Mobile-first, fast, clean typography, with clear loading/empty states and hydration-safe `localStorage` hooks.
- **Static Dynamic Routes:** Every dynamic route (e.g., `src/app/recipes/[slug]/page.tsx`) MUST implement `generateStaticParams()`.