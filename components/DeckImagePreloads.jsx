"use client";

import { useEffect } from "react";

/**
 * Preload every visible card URL together so remote production does not visually
 * “waterfall” (local dev masks this because localhost RTT ~0).
 */
export default function DeckImagePreloads({ paths }) {
  useEffect(() => {
    const links = [];
    for (const src of paths) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
      links.push(link);
    }
    return () => {
      for (const link of links) {
        link.parentNode?.removeChild(link);
      }
    };
  }, [paths]);

  return null;
}
