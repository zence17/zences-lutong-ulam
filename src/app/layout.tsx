import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const siteName = "Zence's Lutong Ulam";
const siteDescription =
  "Honest Filipino lutong-bahay recipes with real Metro Manila palengke & sari-sari cost estimates, serving scalers, and weekly meal planning.";
const siteTitle = `${siteName} | Filipino Home Cooking & Palengke Cost Guide`;
const defaultOgImage = "/og-default.png";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://zences-lutong-ulam.netlify.app",
  ),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName,
    locale: "en_PH",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Zence's Lutong Ulam - Filipino Home Cooking & Palengke Cost Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [defaultOgImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#C2410C",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream font-sans text-charcoal">
        <a
          href="#main-content"
          className="sr-only rounded-full bg-adobo px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
