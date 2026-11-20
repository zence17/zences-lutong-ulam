import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ClipboardList, Sparkles } from "lucide-react";
import MealPlanClient from "@/components/MealPlanClient";
import { recipes } from "@/data/recipes";

const pageTitle = "Weekly Ulam & Budget Planner";
const pageDescription =
  "Plan seven days of ulam, scale recipes to your household, and build one consolidated palengke grocery list on a weekly budget.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    type: "website",
    siteName: "Zence's Lutong Ulam",
    locale: "en_PH",
    title: pageTitle,
    description: pageDescription,
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/og-default.png"],
  },
};

export default function MealPlanPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-bold text-charcoal/75 transition-colors hover:text-adobo"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>

        <header className="mt-5 rounded-3xl border border-adobo/15 bg-white p-6 shadow-card sm:p-9">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-adobo">
            Weekly Ulam & Budget Planner
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-charcoal sm:text-5xl">
            Seven days of ulam, one smart palengke trip.
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-charcoal/75 sm:text-base">
            Assign a dish to each day, set your household servings and weekly budget, then shop from
            a single list of combined ingredient quantities. Your plan stays saved in this browser.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/10 bg-cream px-4 py-2 text-xs font-bold text-charcoal/70">
              <CalendarDays size={14} aria-hidden="true" className="text-adobo" />
              7-day schedule
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/10 bg-cream px-4 py-2 text-xs font-bold text-charcoal/70">
              <ClipboardList size={14} aria-hidden="true" className="text-adobo" />
              Consolidated palengke list
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/10 bg-cream px-4 py-2 text-xs font-bold text-charcoal/70">
              <Sparkles size={14} aria-hidden="true" className="text-adobo" />
              Tipid auto-fill
            </span>
          </div>
        </header>

        <div className="mt-8">
          <MealPlanClient recipes={recipes} />
        </div>
      </div>
    </div>
  );
}
