import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Recipe Not Found",
  description: "That ulam page does not exist. Browse the full Filipino lutong-bahay recipe list.",
  openGraph: {
    title: "Recipe Not Found",
    description: "That ulam page does not exist. Browse the full Filipino lutong-bahay recipe list.",
    type: "website",
    images: ["/og-default.png"],
  },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl" aria-hidden="true">
        🍽️
      </p>
      <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
        {"Walang ulam dito! That recipe page doesn't exist."}
      </h1>
      <p className="mt-3 text-sm text-charcoal/75">
        Try the full ulam list instead, then cook something worth sharing.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-adobo px-5 py-2.5 text-sm font-bold text-white hover:bg-adobo-dark"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to home
      </Link>
    </div>
  );
}
