"use client";

function FlipDigit({ digit }) {
  const d = ((digit % 10) + 10) % 10;
  return (
    <span
      className="inline-flex min-w-[0.62em] justify-center tabular-nums text-xl font-medium text-[var(--fg)] md:text-2xl"
      aria-hidden
    >
      {d}
    </span>
  );
}

export default function FlipClock({ secondsLeft, className = "" }) {
  const v = Math.max(0, Math.floor(Number(secondsLeft)) || 0);
  const m = Math.floor(v / 60);
  const s = v % 60;
  const mt = Math.floor(m / 10) % 10;
  const mo = m % 10;
  const st = Math.floor(s / 10) % 10;
  const so = s % 10;

  return (
    <div
      className={`flex flex-row flex-wrap items-center justify-center gap-px tabular-nums ${className}`}
      role="timer"
    >
      <FlipDigit digit={mt} />
      <FlipDigit digit={mo} />
      <span
        className="mx-0.5 text-xl font-medium text-[var(--fg)] opacity-90 md:text-2xl"
        aria-hidden
      >
        :
      </span>
      <FlipDigit digit={st} />
      <FlipDigit digit={so} />
    </div>
  );
}
