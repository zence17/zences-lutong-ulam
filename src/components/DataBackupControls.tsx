"use client";

import { Download, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { exportBackupJson, importBackupJson } from "@/lib/backupStorage";

interface Feedback {
  message: string;
  tone: "success" | "error";
}

const BUTTON_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/15 bg-white px-4 py-2 text-xs font-bold text-charcoal transition hover:border-adobo hover:text-adobo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adobo";

export function DataBackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleExport = useCallback(() => {
    exportBackupJson();
    setFeedback({ message: "Backup downloaded!", tone: "success" });
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const content = typeof reader.result === "string" ? reader.result : "";
        const result = importBackupJson(content);
        setFeedback({
          message: result.message,
          tone: result.ok ? "success" : "error",
        });
      };
      reader.onerror = () => {
        setFeedback({ message: "Could not read that file. Try again.", tone: "error" });
      };
      reader.readAsText(file);
    },
    [],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button className={BUTTON_CLASS} onClick={handleExport} type="button">
          <Download aria-hidden="true" className="h-4 w-4" />
          Export Backup
        </button>
        <button className={BUTTON_CLASS} onClick={handleImportClick} type="button">
          <Upload aria-hidden="true" className="h-4 w-4" />
          Import Backup
        </button>
        <label className="sr-only" htmlFor="backup-file-input">
          Import backup JSON file
        </label>
        <input
          accept=".json,application/json"
          className="sr-only"
          id="backup-file-input"
          name="backupFile"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
      </div>
      <div className="min-h-5">
        {feedback ? (
          <p
            aria-atomic="true"
            aria-live={feedback.tone === "error" ? "assertive" : "polite"}
            className={`text-[11px] font-bold ${
              feedback.tone === "error" ? "text-red-700" : "text-calamansi"
            }`}
            role={feedback.tone === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
