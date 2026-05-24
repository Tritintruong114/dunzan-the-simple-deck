"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import cardManifest from "@/lib/cardManifest.json";
import {
  appendDeckSnapshot,
  clampLoadedHistory,
  loadDeckHistory,
  sanitizeEntries,
  saveDeckHistory,
} from "@/lib/deckHistoryStorage";
import {
  buildRemainingPoolFromHistory,
  drawWithoutReplacement,
  shuffle,
} from "@/lib/shuffle";
import CardDeck from "@/components/CardDeck";
import CardLibraryPrefetch from "@/components/CardLibraryPrefetch";
import ConfigDropdown from "@/components/ConfigDropdown";
import DeckImagePreloads from "@/components/DeckImagePreloads";
import FlipClock from "@/components/FlipClock";
import { useMobileViewport } from "@/lib/useMobileViewport";

const EMPTY_HISTORY = { entries: [], index: 0 };

function formatSecondsForAria(s) {
  const v = Math.max(0, Math.floor(Number(s)) || 0);
  if (v < 60) return `${v} seconds`;
  const m = Math.floor(v / 60);
  const sec = v % 60;
  return `${m} minutes ${sec} seconds`;
}

function PauseIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}

function PlayIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  );
}

export default function DeckHome() {
  const allCards = cardManifest;

  const [cardCount, setCardCount] = useState(1);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [countdownPaused, setCountdownPaused] = useState(false);

  const [deckHistory, setDeckHistory] = useState(EMPTY_HISTORY);
  const poolRef = useRef(shuffle([...allCards]));

  const [secondsLeft, setSecondsLeft] = useState(0);
  const cycleTransitionLockRef = useRef(false);

  const [configOpen, setConfigOpen] = useState(false);

  const isMobile = useMobileViewport();

  const displayedPaths =
    deckHistory.entries.length > 0 &&
    deckHistory.index >= 0 &&
    deckHistory.index < deckHistory.entries.length
      ? deckHistory.entries[deckHistory.index]
      : [];

  const pushDeckToHistory = useCallback((paths) => {
    setDeckHistory((prev) => {
      const next = appendDeckSnapshot(prev, paths);
      saveDeckHistory(next);
      return next;
    });
  }, []);

  useEffect(() => {
    startTransition(() => {
      const validSet = new Set(allCards);
      const raw = loadDeckHistory();
      if (raw?.entries?.length) {
        const sanitized = sanitizeEntries(raw.entries, validSet);
        const clamped = clampLoadedHistory(raw, sanitized);
        if (clamped) {
          const pathsNow = clamped.entries[clamped.index];
          const n = pathsNow?.length ?? 1;
          setCardCount(Math.min(7, Math.max(1, n)));
          setDeckHistory(clamped);
          saveDeckHistory(clamped);
          poolRef.current = buildRemainingPoolFromHistory(
            allCards,
            clamped.entries,
            clamped.index,
          );
          return;
        }
      }
      const pool0 = shuffle([...allCards]);
      const { hand, nextPool } = drawWithoutReplacement(pool0, 1, allCards);
      const initial = { entries: [hand], index: 0 };
      setDeckHistory(initial);
      saveDeckHistory(initial);
      setCardCount(1);
      poolRef.current = nextPool;
    });
  }, [allCards]);

  const commitDraw = useCallback(
    (paths) => {
      startTransition(() => pushDeckToHistory(paths));
    },
    [pushDeckToHistory],
  );

  const runDrawFromPool = useCallback(() => {
    const { hand, nextPool } = drawWithoutReplacement(
      poolRef.current,
      cardCount,
      allCards,
    );
    poolRef.current = nextPool;
    commitDraw(hand);
  }, [allCards, cardCount, commitDraw]);

  const reshuffleFromCountdown = useCallback(() => {
    const { hand, nextPool } = drawWithoutReplacement(
      poolRef.current,
      cardCount,
      allCards,
    );
    poolRef.current = nextPool;
    commitDraw(hand);
    setSecondsLeft(countdownSeconds);
  }, [allCards, cardCount, countdownSeconds, commitDraw]);

  useEffect(() => {
    if (!countdownEnabled || countdownPaused) return;
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (!cycleTransitionLockRef.current) {
            cycleTransitionLockRef.current = true;
            queueMicrotask(() => {
              reshuffleFromCountdown();
              cycleTransitionLockRef.current = false;
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearTimeout(id);
  }, [
    secondsLeft,
    countdownEnabled,
    countdownPaused,
    reshuffleFromCountdown,
  ]);

  const revealed = displayedPaths.length > 0;

  const canGoBack = deckHistory.index > 0;
  const canGoForward =
    deckHistory.entries.length > 0 &&
    deckHistory.index < deckHistory.entries.length - 1;

  const handleHistoryBack = () => {
    setDeckHistory((prev) => {
      if (prev.index <= 0) return prev;
      const next = { ...prev, index: prev.index - 1 };
      saveDeckHistory(next);
      return next;
    });
  };

  const handleHistoryForward = () => {
    setDeckHistory((prev) => {
      if (prev.index >= prev.entries.length - 1) return prev;
      const next = { ...prev, index: prev.index + 1 };
      saveDeckHistory(next);
      return next;
    });
  };

  const handleRandom = () => {
    runDrawFromPool();
    if (!countdownEnabled) {
      setSecondsLeft(0);
      return;
    }
    setSecondsLeft(countdownSeconds);
  };

  /**
   * Full shuffle of the draw pool, deal a fresh hand, and **replace** saved history — previous
   * ‹ / › snapshots are cleared. Resets the countdown when countdown mode is on.
   */
  const handleShuffleReset = () => {
    poolRef.current = shuffle([...allCards]);
    const { hand, nextPool } = drawWithoutReplacement(
      poolRef.current,
      cardCount,
      allCards,
    );
    poolRef.current = nextPool;
    const fresh = { entries: [hand], index: 0 };
    startTransition(() => {
      setDeckHistory(fresh);
      saveDeckHistory(fresh);
    });
    if (!countdownEnabled) {
      setSecondsLeft(0);
      return;
    }
    setSecondsLeft(countdownSeconds);
  };

  const handleApply = ({
    cardCount: n,
    countdownSeconds: sec,
    countdownEnabled: ce,
  }) => {
    setCardCount(n);
    setCountdownSeconds(sec);
    setCountdownEnabled(ce);
    setCountdownPaused(false);

    const { hand, nextPool } = drawWithoutReplacement(poolRef.current, n, allCards);
    poolRef.current = nextPool;
    commitDraw(hand);

    if (!ce) {
      setSecondsLeft(0);
      return;
    }

    setSecondsLeft(sec);
  };

  const navBtnClass =
    "cursor-pointer inline-flex shrink-0 items-center justify-center rounded-none border-none min-h-11 min-w-11 px-4 py-4 text-2xl leading-none font-medium tabular-nums text-[var(--fg)] max-md:min-h-9 max-md:min-w-9 max-md:px-2 max-md:py-2 max-md:text-xl md:min-h-12 md:min-w-12 md:text-3xl bg-transparent shadow-none outline-none hover:opacity-90 active:opacity-90 disabled:pointer-events-none disabled:opacity-25 focus-visible:ring-2 focus-visible:ring-[var(--fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

  const primaryBtnClass =
    "cursor-pointer shrink-0 rounded-none border-none px-6 py-3 text-base font-medium bg-[var(--fg)] text-[var(--bg)] max-md:px-3 max-md:py-2 max-md:text-sm shadow-none outline-none hover:opacity-90 active:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

  const secondaryBtnClass =
    "cursor-pointer shrink-0 rounded-none border border-black bg-white px-4 py-3 text-sm font-medium text-black max-md:px-2 max-md:py-2 max-md:text-[0.65rem] max-md:leading-tight shadow-none outline-none hover:opacity-90 active:opacity-90 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 touch-manipulation";

  const pauseResumeBtnClass =
    "cursor-pointer inline-flex shrink-0 items-center justify-center rounded-none border border-black bg-white min-h-8 min-w-8 max-md:min-h-7 max-md:min-w-7 p-0 text-black shadow-none outline-none hover:opacity-90 active:opacity-90 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 touch-manipulation";

  const shuffleTitle = isMobile
    ? undefined
    : `Shuffle full deck, clear saved hands, deal ${cardCount} new card${cardCount === 1 ? "" : "s"} (${allCards.length} in deck)`;

  const pauseResumeTitle = isMobile
    ? undefined
    : countdownPaused
      ? "Resume"
      : "Pause";

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-hidden bg-[var(--bg)] text-[var(--fg)] pb-[calc(9rem+env(safe-area-inset-bottom,0px))] pt-8 md:pt-12">
      <CardLibraryPrefetch />
      <header className="max-w-3xl mx-auto w-full px-4 text-center mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[var(--fg)]">
          Let It Be Simple
        </h1>
        <p className="mt-3 text-lg md:text-xl font-medium tracking-tight text-[var(--fg)]">
          SIMPLE Sayings
        </p>
      </header>

      <main className="flex min-h-0 flex-1 flex-col w-full items-center gap-4 md:gap-6">
        <section className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-1">
          {displayedPaths.length > 0 ? (
            <DeckImagePreloads paths={displayedPaths} />
          ) : null}
          <CardDeck paths={displayedPaths} revealed={revealed} />
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col gap-2 border-t border-transparent bg-[var(--bg)] px-[max(1rem,env(safe-area-inset-right),env(safe-area-inset-left))] pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-none">
        {countdownEnabled ? (
          <div
            className="flex flex-col items-center gap-2"
            aria-live="polite"
            aria-label={`Next cards in ${formatSecondsForAria(secondsLeft)}`}
          >
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--fg)] opacity-85 md:text-sm">
              Next cards in
            </span>
            <div className="flex flex-row items-center justify-center gap-4 max-md:gap-2 flex-wrap">
              <FlipClock secondsLeft={secondsLeft} />
              <button
                type="button"
                className={pauseResumeBtnClass}
                aria-pressed={countdownPaused}
                aria-label={countdownPaused ? "Resume countdown" : "Pause countdown"}
                title={pauseResumeTitle}
                onClick={() => setCountdownPaused((p) => !p)}
              >
                {countdownPaused ? (
                  <PlayIcon className="size-4 max-md:size-3.5" />
                ) : (
                  <PauseIcon className="size-4 max-md:size-3.5" />
                )}
              </button>
            </div>
          </div>
        ) : null}
        <div className="flex w-full flex-row items-center gap-1 md:gap-2">
          <div className="min-w-0 flex-1 shrink" aria-hidden />
          <div className="flex shrink-0 flex-row flex-wrap items-center justify-center gap-1 md:gap-2">
            <button
              type="button"
              className={navBtnClass}
              aria-label="Previous deck"
              disabled={!canGoBack}
              onClick={handleHistoryBack}
            >
              ‹
            </button>
            <button type="button" onClick={handleRandom} className={primaryBtnClass}>
              Random
            </button>
            <button
              type="button"
              className={navBtnClass}
              aria-label="Next deck"
              disabled={!canGoForward}
              onClick={handleHistoryForward}
            >
              ›
            </button>
          </div>
          <div className="flex min-w-0 flex-1 shrink items-center justify-end gap-1 md:gap-2">
            <button
              type="button"
              title={shuffleTitle}
              aria-label="Reset randomizer"
              className={`${secondaryBtnClass} hidden md:inline-flex`}
              onClick={handleShuffleReset}
            >
              Reset Randomizer
            </button>
            <ConfigDropdown
              open={configOpen}
              onOpenChange={setConfigOpen}
              cardCount={cardCount}
              countdownSeconds={countdownSeconds}
              countdownEnabled={countdownEnabled}
              onApply={handleApply}
              onShuffleReset={isMobile ? handleShuffleReset : undefined}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
