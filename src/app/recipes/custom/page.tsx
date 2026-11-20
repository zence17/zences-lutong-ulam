import type { Metadata } from "next";
import CustomRecipeView from "@/components/CustomRecipeViewer";

export const metadata: Metadata = {
  title: "Custom Ulam",
  description: "View a custom Filipino ulam saved locally on this device with palengke cost estimates.",
  openGraph: {
    title: "Custom Ulam",
    description:
      "View a custom Filipino ulam saved locally on this device with palengke cost estimates.",
    type: "website",
    images: ["/og-default.png"],
  },
};

export default function CustomRecipePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <CustomRecipeView />
    </div>
  );
}
