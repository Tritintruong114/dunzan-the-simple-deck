import { useSyncExternalStore } from "react";

/** Tailwind `md` starts at 768px — single-column / mobile layout below this width */
export const MOBILE_MAX_WIDTH_PX = 767;

function subscribeMobileMaxWidth(cb) {
  const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMobileMaxWidthMatches() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;
}

export function useMobileViewport() {
  return useSyncExternalStore(
    subscribeMobileMaxWidth,
    getMobileMaxWidthMatches,
    () => false,
  );
}
