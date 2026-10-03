"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then(async (registration) => { await registration.update(); console.log("CashCoin service worker registered:", registration.scope); })
        .catch((error) => console.log("CashCoin service worker registration failed:", error));
    }
  }, []);

  return null;
}
