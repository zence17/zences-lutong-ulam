"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const swUrl = `${basePath}/sw.js`;

    navigator.serviceWorker.register(swUrl).catch(() => {});
  }, []);

  return null;
}
