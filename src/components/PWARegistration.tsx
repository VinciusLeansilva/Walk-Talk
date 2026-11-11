"use client";
import { useEffect } from "react";
export function PWARegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => registration.update())
      .catch(() => {});
  }, []);
  return null;
}
