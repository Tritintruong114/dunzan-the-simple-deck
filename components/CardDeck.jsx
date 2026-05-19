"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

/** Tailwind `md` starts at 768px — single-column deck below this width */
const MOBILE_MAX_WIDTH_PX = 767;

/** Fixed card width when viewport fits; capped by max-w-full / parent on narrow widths */
const CARD_FIXED_WIDTH_PX = 440;

/** Intrinsic size hint for optimizer (playing-card ~5:7); actual layout uses object-contain */
const CARD_IMAGE_HINT_HEIGHT = Math.round((CARD_FIXED_WIDTH_PX * 7) / 5);

/** Matches Tailwind `gap-4` on the deck row — keep in sync when changing gap */
const DECK_GAP_REM = 1;

/** Desktop deck never wider than three cards plus gaps between them */
const MAX_DECK_WIDTH_THREE_CARDS = `min(100%, calc(${CARD_FIXED_WIDTH_PX * 3}px + ${2 * DECK_GAP_REM}rem))`;

/** Playing-card portrait placeholder when face-down — tablet/desktop */
const CARD_ASPECT_RATIO_DESKTOP = "5 / 7";

/** Shorter placeholder on narrow viewports when face-down */
const CARD_ASPECT_RATIO_MOBILE = "5 / 6";

/** Visible deck cards are in-viewport — avoid lazy so PNGs start fetching immediately */
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

/** Stagger card enters slightly (capped so 7 cards stay snappy) */
const CARD_ENTER_STAGGER_MS = 22;
const CARD_ENTER_STAGGER_CAP_MS = 110;

const SLOT_BASE =
  "card-slot card-slot-enter relative h-fit min-h-0 shrink-0 overflow-hidden rounded-none bg-[var(--bg)] p-0 leading-none";

function CardSlot({
  src,
  revealed,
  aspectRatio,
  narrowStack,
  enterDelayMs,
  fetchPriority,
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
        animationDelay: `${enterDelayMs}ms`,
        ...(revealed ? {} : { aspectRatio }),
      }}
    >
      {revealed ? (
        <Image
          src={src}
          alt=""
          width={CARD_FIXED_WIDTH_PX}
          height={CARD_IMAGE_HINT_HEIGHT}
          sizes={IMAGE_SIZES}
          quality={82}
          priority
          fetchPriority={fetchPriority}
          draggable={false}
          className={`${sharedImgClass} relative h-auto w-full max-w-full`}
        />
      ) : (
        <Image
          src={src}
          alt=""
          fill
          sizes={IMAGE_SIZES}
          quality={82}
          priority
          fetchPriority={fetchPriority}
          draggable={false}
          className={`${sharedImgClass} absolute inset-0 h-full w-full opacity-0`}
        />
      )}
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

  const slotAspectRatio = narrowViewport
    ? CARD_ASPECT_RATIO_MOBILE
    : CARD_ASPECT_RATIO_DESKTOP;

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
          aspectRatio={slotAspectRatio}
          narrowStack={narrowViewport}
          enterDelayMs={Math.min(
            index * CARD_ENTER_STAGGER_MS,
            CARD_ENTER_STAGGER_CAP_MS,
          )}
          fetchPriority={index === 0 ? "high" : "auto"}
        />
      ))}
    </div>
  );
}
