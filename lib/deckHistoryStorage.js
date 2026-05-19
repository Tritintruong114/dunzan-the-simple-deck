/** Persisted deck snapshots (paths[]) + timeline cursor */

export const DECK_HISTORY_STORAGE_KEY = "dunzan-deck-history-v1";

/** Oldest entries dropped when exceeded */
export const MAX_DECK_HISTORY_ENTRIES = 50;

/**
 * @param {{ entries: string[][], index: number }} state
 * @param {string[]} paths Next deck snapshot (distinct paths from manifest)
 * @returns {{ entries: string[][], index: number }}
 */
export function appendDeckSnapshot(state, paths) {
  const { entries, index } = state;
  const truncated = entries.slice(0, index + 1);
  let nextEntries = [...truncated, paths];
  let nextIndex = nextEntries.length - 1;

  while (nextEntries.length > MAX_DECK_HISTORY_ENTRIES) {
    nextEntries.shift();
    nextIndex--;
  }

  nextIndex = Math.max(0, Math.min(nextIndex, nextEntries.length - 1));
  return { entries: nextEntries, index: nextIndex };
}

/**
 * @param {string[][]} entries
 * @param {Set<string>} validPathsSet
 * @returns {string[][]}
 */
export function sanitizeEntries(entries, validPathsSet) {
  const out = [];
  for (const row of entries) {
    if (!Array.isArray(row)) continue;
    const filtered = row.filter((p) => typeof p === "string" && validPathsSet.has(p));
    if (filtered.length > 0) out.push(filtered);
  }
  return out;
}

/** @returns {{ entries: string[][], index: number } | null} */
export function loadDeckHistory() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DECK_HISTORY_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.entries)) return null;
    const index =
      typeof data.index === "number" ? data.index : Math.max(0, data.entries.length - 1);
    return { entries: data.entries, index };
  } catch {
    return null;
  }
}

/** @param {{ entries: string[][], index: number }} state */
export function saveDeckHistory(state) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DECK_HISTORY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

/**
 * @param {{ entries: string[][], index: number }} raw
 * @param {string[][]} sanitized
 */
export function clampLoadedHistory(raw, sanitized) {
  if (sanitized.length === 0) return null;
  let idx =
    typeof raw.index === "number" ? raw.index : sanitized.length - 1;
  idx = Math.max(0, Math.min(idx, sanitized.length - 1));
  return { entries: sanitized, index: idx };
}
