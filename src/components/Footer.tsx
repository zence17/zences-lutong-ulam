import { priceMetadata } from "@/data/ingredients";
import { DataBackupControls } from "@/components/DataBackupControls";

export function Footer() {
  return (
    <footer className="no-print border-t border-charcoal/10 bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-charcoal/75 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-extrabold text-charcoal/80">Zence&apos;s Lutong Ulam</p>
            <p className="mt-1 font-semibold text-adobo">Last Price Check: {priceMetadata.lastUpdated}</p>
          </div>
          <p className="max-w-md leading-relaxed">
            Estimates reflect average {priceMetadata.location} palengke and sari-sari store prices.
            Actual costs may vary by vendor, season, and location.
          </p>
        </div>
        <div className="mt-6 border-t border-charcoal/10 pt-5 print:hidden">
          <DataBackupControls />
          <p className="mt-2 leading-relaxed">
            Your custom recipes and meal plans stay on this device. Export a backup anytime.
          </p>
        </div>
      </div>
    </footer>
  );
}
