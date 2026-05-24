"use client";

import Image from "next/image";
import {
  MOBILE_MAX_WIDTH_PX,
  useMobileViewport,
} from "@/lib/useMobileViewport";

/** Fixed card width when viewport fits; capped by max-w-full / parent on narrow widths */
/** Fits ~3 cards across on typical desktop frames (see deck max-width). */
const CARD_FIXED_WIDTH_PX = 300;

/** Matches Tailwind `gap-4` on the deck row — keep in sync when changing gap */
const DECK_GAP_REM = 1;

/** Desktop deck never wider than three cards plus gaps between them */
const MAX_DECK_WIDTH_THREE_CARDS = `min(100%, calc(${CARD_FIXED_WIDTH_PX * 3}px + ${2 * DECK_GAP_REM}rem))`;

/**
 * All bundled card PNGs are 621×432 → CSS ratio 23:16 (wide, not portrait).
 * A portrait placeholder (eg 5/7) tall frame plus object-contain adds big white bands,
 * looks like slots are “stretched tall” especially when several cards appear at once.
 */
const CARD_ASPECT_RATIO = "23 / 16";
const CARD_HEIGHT_RATIO = 16 / 23;

/** Layout hints for intrinsic sizing (`sizes` width map when `fill`/`width` are set). */
const IMAGE_SIZES =
  `(max-width: ${MOBILE_MAX_WIDTH_PX}px) min(100vw, ${CARD_FIXED_WIDTH_PX}px), ${CARD_FIXED_WIDTH_PX}px`;

const SLOT_BASE =
  "card-slot card-slot-enter relative w-full min-h-0 shrink-0 overflow-hidden rounded-none bg-[var(--bg)] p-0 leading-none";

function CardSlot({
  src,
  revealed,
  aspectRatio,
  narrowStack,
  fetchPriority,
  eagerPriority,
}) {
  const sizingStyle = narrowStack
    ? { width: "100%", maxWidth: CARD_FIXED_WIDTH_PX }
    : { width: CARD_FIXED_WIDTH_PX, maxWidth: "100%" };

  const minHeight = narrowStack
    ? `calc(min(100vw - 2rem, ${CARD_FIXED_WIDTH_PX}px) * ${CARD_HEIGHT_RATIO})`
    : `calc(min(100%, ${CARD_FIXED_WIDTH_PX}px) * ${CARD_HEIGHT_RATIO})`;

  const sharedImgClass =
    "z-[1] m-0 object-contain p-0 align-middle pointer-events-none select-none";

  return (
    <div
      className={SLOT_BASE}
      style={{
        ...sizingStyle,
        aspectRatio,
        minHeight,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={IMAGE_SIZES}
        quality={82}
        priority={eagerPriority}
        loading="eager"
        fetchPriority={fetchPriority}
        draggable={false}
        className={`${sharedImgClass} ${revealed ? "" : "opacity-0"}`}
      />
      {!revealed ? (
        <div className="absolute inset-0 z-[2] bg-[var(--bg)]" aria-hidden />
      ) : null}
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
          aspectRatio={CARD_ASPECT_RATIO}
          narrowStack={narrowViewport}
          fetchPriority={index < 5 ? "high" : "auto"}
          eagerPriority={index < 3}
        />
      ))}
    </div>
  );
}
