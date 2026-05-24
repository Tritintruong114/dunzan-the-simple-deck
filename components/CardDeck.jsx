"use client";

import { useMobileViewport } from "@/lib/useMobileViewport";

/** Fixed card width when viewport fits; capped by max-w-full / parent on narrow widths */
/** Fits ~3 cards across on typical desktop frames (see deck max-width). */
const CARD_FIXED_WIDTH_PX = 300;

/** Matches Tailwind `gap-4` on the deck row — keep in sync when changing gap */
const DECK_GAP_REM = 1;

/** Desktop deck never wider than three cards plus gaps between them */
const MAX_DECK_WIDTH_THREE_CARDS = `min(100%, calc(${CARD_FIXED_WIDTH_PX * 3}px + ${2 * DECK_GAP_REM}rem))`;

/** All bundled card PNGs are 621×432 — intrinsic dimensions for legacy iOS Safari layout */
const CARD_INTRINSIC_WIDTH = 621;
const CARD_INTRINSIC_HEIGHT = 432;

const SLOT_OUTER =
  "card-slot card-slot-enter relative mx-auto shrink-0 overflow-hidden rounded-none bg-[var(--bg)] p-0 leading-none";

function CardSlot({ src, revealed, narrowStack, eagerPriority }) {
  const outerStyle = narrowStack
    ? { width: "100%", maxWidth: CARD_FIXED_WIDTH_PX }
    : { width: CARD_FIXED_WIDTH_PX, maxWidth: "100%" };

  return (
    <div className={SLOT_OUTER} style={outerStyle}>
      <div className="relative w-full">
        {/* Native img: next/image fill+sizes breaks on iOS 15 Safari (below Next 16 baseline) */}
        <img
          src={src}
          alt=""
          width={CARD_INTRINSIC_WIDTH}
          height={CARD_INTRINSIC_HEIGHT}
          loading={eagerPriority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={`block h-auto w-full max-w-full object-contain pointer-events-none select-none ${
            revealed ? "" : "opacity-0"
          }`}
        />
        {!revealed ? (
          <div className="absolute inset-0 z-[2] bg-[var(--bg)]" aria-hidden />
        ) : null}
      </div>
    </div>
  );
}

export default function CardDeck({ paths, revealed }) {
  const narrowViewport = useMobileViewport();

  const deckClassName = narrowViewport
    ? "flex h-fit w-full max-w-full min-w-0 flex-col items-center gap-4"
    : "flex h-fit w-full min-w-0 flex-row flex-wrap justify-center items-start content-start gap-4 mx-auto";

  return (
    <div
      className={deckClassName}
      style={
        narrowViewport
          ? undefined
          : { maxWidth: MAX_DECK_WIDTH_THREE_CARDS }
      }
    >
      {paths.map((src, index) => (
        <CardSlot
          key={`${index}-${src}`}
          src={src}
          revealed={revealed}
          narrowStack={narrowViewport}
          eagerPriority={index < 3}
        />
      ))}
    </div>
  );
}
