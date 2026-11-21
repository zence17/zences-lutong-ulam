import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Sparkles, Wallet } from "lucide-react";
import NegosyoClient from "@/components/NegosyoClient";
import { recipes } from "@/data/recipes";

const pageDescription =
  "Price packed meals and party trays for karinderya, catering, and small food businesses. Compute puhunan, utilities, packaging, target tubo, and selling price per order.";
const pageTitle = "Karinderya & Negosyo Batch Pricing";
const fullPageTitle = `${pageTitle} | Zence's Lutong Ulam`;

export const metadata: Metadata = {
  title: { absolute: fullPageTitle },
  description: pageDescription,
  openGraph: {
    type: "website",
    siteName: "Zence's Lutong Ulam",
    locale: "en_PH",
    title: fullPageTitle,
    description: pageDescription,
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: fullPageTitle,
    description: pageDescription,
    images: ["/og-default.png"],
  },
};

export default function NegosyoPage() {
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
            Karinderya &amp; Negosyo
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-charcoal sm:text-5xl">
            Batch pricing for your lutong-ulam side hustle.
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-charcoal/75 sm:text-base">
            Scale any ulam to 20–50 pax, price packed meals or party trays, and see puhunan,
            utilities, packaging, target tubo, and suggested selling price. Copy the bulk palengke
            list for your next supplier trip.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/10 bg-cream px-4 py-2 text-xs font-bold text-charcoal/70">
              <ClipboardList size={14} aria-hidden="true" className="text-adobo" />
              Bulk palengke list
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/10 bg-cream px-4 py-2 text-xs font-bold text-charcoal/70">
              <Wallet size={14} aria-hidden="true" className="text-adobo" />
              Puhunan &amp; tubo
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/10 bg-cream px-4 py-2 text-xs font-bold text-charcoal/70">
              <Sparkles size={14} aria-hidden="true" className="text-adobo" />
              Saved palengke prices
            </span>
          </div>
        </header>

        <div className="mt-8">
          <NegosyoClient recipes={recipes} />
        </div>
      </div>
    </div>
  );
}
