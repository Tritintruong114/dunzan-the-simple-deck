/** Fisher–Yates shuffle (returns new array). */
export function shuffle(paths) {
  const a = [...paths];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `count` distinct random paths from `paths`. */
export function pickRandom(paths, count) {
  const n = Math.min(Math.max(count, 0), paths.length);
  return shuffle(paths).slice(0, n);
}
