"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

/** Tailwind `md` starts at 768px — single-column deck below this width */
const MOBILE_MAX_WIDTH_PX = 767;

/** Fixed card width when viewport fits; capped by max-w-full / parent on narrow widths */
const CARD_FIXED_WIDTH_PX = 440;

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

/** Layout hints for intrinsic sizing (`sizes` width map when `fill`/`width` are set). */
const IMAGE_SIZES =
  `(max-width: ${MOBILE_MAX_WIDTH_PX}px) min(100vw, ${CARD_FIXED_WIDTH_PX}px), ${CARD_FIXED_WIDTH_PX}px`;

function subscribeMobileMaxWidth(cb) {
  const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMobileMaxWidthMatches() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;
}

const SLOT_BASE =
  "card-slot card-slot-enter relative h-fit min-h-0 shrink-0 overflow-hidden rounded-none bg-[var(--bg)] p-0 leading-none";

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

  const sharedImgClass =
    "z-[1] m-0 object-contain p-0 align-middle pointer-events-none select-none";

  return (
    <div
      className={SLOT_BASE}
      style={{
        ...sizingStyle,
        aspectRatio,
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
  const narrowViewport = useSyncExternalStore(
    subscribeMobileMaxWidth,
    getMobileMaxWidthMatches,
    () => false,
  );

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
