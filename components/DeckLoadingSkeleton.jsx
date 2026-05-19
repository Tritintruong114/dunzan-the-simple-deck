/** Mirrors [`CardDeck.jsx`] wrapper + slot sizing so layout doesn’t jump when real cards mount */
const DECK_WRAP_CLASS =
  "flex w-full min-w-0 flex-col items-center gap-4 md:flex-row md:flex-wrap md:justify-center md:items-start md:content-start md:gap-4 mx-auto md:max-w-[min(100%,calc(440px*3+2rem))]";

const SLOT_CLASS =
  "card-slot w-full max-w-[440px] md:w-[440px] aspect-[5/6] md:aspect-[5/7] rounded-none bg-[var(--fg)]/10 motion-safe:animate-pulse motion-reduce:animate-none";

export default function DeckLoadingSkeleton({ label = "Loading cards…" }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
      className={DECK_WRAP_CLASS}
    >
      <span className="sr-only">{label}</span>
      <div className={SLOT_CLASS} aria-hidden />
    </div>
  );
}
