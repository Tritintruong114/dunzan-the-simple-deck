/** Fisher–Yates shuffle (returns new array). */
export function shuffle(paths) {
  const a = [...paths];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `count` distinct random paths from `paths` (full replacement each time). */
export function pickRandom(paths, count) {
  const n = Math.min(Math.max(count, 0), paths.length);
  return shuffle(paths).slice(0, n);
}

/**
 * Draw `count` cards from `remainingPool` without replacement.
 * If the pool cannot satisfy `count`, refill from a fresh shuffle of `fullDeck`.
 *
 * @param {string[]} remainingPool
 * @param {number} count
 * @param {string[]} fullDeck
 * @returns {{ hand: string[], nextPool: string[] }}
 */
export function drawWithoutReplacement(remainingPool, count, fullDeck) {
  const need = Math.min(Math.max(count, 0), fullDeck.length);
  let pool = [...remainingPool];
  if (pool.length < need) {
    pool = shuffle([...fullDeck]);
  }
  const hand = pool.slice(0, need);
  const nextPool = pool.slice(need);
  return { hand, nextPool };
}

/**
 * Build a shuffled pool of cards not yet “committed” in history entries up to `index`.
 * If nothing is left, return a full fresh shuffle of `allCards`.
 */
export function buildRemainingPoolFromHistory(allCards, entries, index) {
  const used = new Set();
  for (let i = 0; i <= index && i < entries.length; i++) {
    for (const p of entries[i]) used.add(p);
  }
  const left = allCards.filter((p) => !used.has(p));
  return left.length > 0 ? shuffle(left) : shuffle([...allCards]);
}
