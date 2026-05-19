"use client";

import Image from "next/image";

/** Tailwind `md` breakpoint — keep in sync with `sizes` below */
const MOBILE_MAX_WIDTH_PX = 767;

const CARD_FIXED_WIDTH_PX = 440;

/** Intrinsic size hint for optimizer (playing-card ~5:7); layout uses object-contain */
const CARD_IMAGE_HINT_HEIGHT = Math.round((CARD_FIXED_WIDTH_PX * 7) / 5);

/** Desktop deck never wider than three cards plus gaps (`gap-4` = 1rem × 2) */
const MAX_DECK_MD_CLASS =
  "md:max-w-[min(100%,calc(440px*3+2rem))]";

/** Visible deck cards are in-viewport — sizes drives `_next/image` width */
const IMAGE_SIZES =
  `(max-width: ${MOBILE_MAX_WIDTH_PX}px) min(100vw, ${CARD_FIXED_WIDTH_PX}px), ${CARD_FIXED_WIDTH_PX}px`;

/** Responsive slot sizing via CSS only — avoids SSR/client `matchMedia` mismatch flicker */
const SLOT_BASE =
  "card-slot relative h-fit min-h-0 shrink-0 overflow-hidden rounded-none bg-[var(--bg)] p-0 leading-none w-full max-w-[440px] md:w-[440px] md:max-w-full";

function CardSlot({ src, revealed, fetchPriority, eagerLoad }) {
  const sharedImgClass =
    "z-[1] m-0 object-contain p-0 align-middle pointer-events-none select-none";

  return (
    <div
      className={`${SLOT_BASE}${revealed ? "" : " aspect-[5/6] md:aspect-[5/7]"}`}
    >
      {revealed ? (
        <Image
          src={src}
          alt=""
          width={CARD_FIXED_WIDTH_PX}
          height={CARD_IMAGE_HINT_HEIGHT}
          sizes={IMAGE_SIZES}
          quality={82}
          priority={eagerLoad}
          decoding="async"
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
          priority={eagerLoad}
          decoding="async"
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
  return (
    <div
      className={`flex h-fit w-full min-w-0 flex-col items-center gap-4 md:flex-row md:flex-wrap md:justify-center md:items-start md:content-start md:gap-4 mx-auto ${MAX_DECK_MD_CLASS}`}
    >
      {paths.map((src, index) => (
        <CardSlot
          key={`${index}-${src}`}
          src={src}
          revealed={revealed}
          fetchPriority={index === 0 ? "high" : "auto"}
          eagerLoad={index < 3}
        />
      ))}
    </div>
  );
}
