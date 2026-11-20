"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyListButtonProps {
  getText: () => string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

type CopyStatus = "idle" | "copied" | "error";

const SUCCESS_TEXT = "Copied for Messenger/Viber!";
let lastCopyMessage = "";

function legacyCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;inset-block-start:0;opacity:0";
  document.body.appendChild(field);
  field.select();
  if (typeof field.setSelectionRange === "function") {
    field.setSelectionRange(0, field.value.length);
  }

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return legacyCopy(text);
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return legacyCopy(text);
  }
}

export function CopyListButton({
  getText,
  label = "Copy Palengke List",
  disabled = false,
  className = "",
}: CopyListButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [announcement, setAnnouncement] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function report(success: boolean) {
    let message = success ? SUCCESS_TEXT : "Copy failed — please try again.";
    if (message === lastCopyMessage) message += "\u00A0";
    lastCopyMessage = message;

    setStatus(success ? "copied" : "error");
    setAnnouncement(message);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setStatus("idle");
      setAnnouncement("");
    }, 2000);
  }

  async function handleClick() {
    let text = "";
    try {
      text = getText();
    } catch {
      report(false);
      return;
    }

    if (!text) {
      report(false);
      return;
    }

    const copied = await copyText(text);
    report(copied);
  }

  const buttonText =
    status === "copied" ? SUCCESS_TEXT : status === "error" ? "Copy failed — try again" : label;
  const successStyles = "border-calamansi bg-calamansi-soft text-calamansi";
  const defaultStyles =
    "border-adobo/20 bg-white text-adobo hover:border-adobo hover:bg-adobo-soft";

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          status === "copied" ? successStyles : defaultStyles
        } ${className}`}
      >
        {status === "copied" ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Copy size={16} aria-hidden="true" />
        )}
        {buttonText}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </span>
  );
}
