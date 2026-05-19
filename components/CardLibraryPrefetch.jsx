"use client";

import { useEffect } from "react";
import cardManifest from "@/lib/cardManifest.json";

/**
 * After first paint settles, prefetch every manifest image so Random / history
 * can hit disk cache sooner. Uses idle time + prefetch (not preload) to stay
 * out of critical path contention with visible cards.
 */
export default function CardLibraryPrefetch() {
  useEffect(() => {
    let cancelled = false;
    const links = [];

    const enqueueAllPrefetchHints = () => {
      if (cancelled) return;
      for (const href of cardManifest) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "image";
        link.href = href;
        document.head.appendChild(link);
        links.push(link);
      }
    };

    let idleId;
    let timeoutId;

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enqueueAllPrefetchHints, {
        timeout: 5000,
      });
    } else {
      timeoutId = window.setTimeout(enqueueAllPrefetchHints, 300);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      for (const link of links) {
        link.parentNode?.removeChild(link);
      }
    };
  }, []);

  return null;
}
