"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
import { pickRandom } from "@/lib/shuffle";
import CardDeck from "@/components/CardDeck";
import ConfigDropdown from "@/components/ConfigDropdown";
import FlipClock from "@/components/FlipClock";

const STORAGE_THEME = "dunzan-theme";

const EMPTY_HISTORY = { entries: [], index: 0 };

/** Accessible verbal summary of remaining time */
function formatSecondsForAria(s) {
  const v = Math.max(0, Math.floor(Number(s)) || 0);
  if (v < 60) return `${v} seconds`;
  const m = Math.floor(v / 60);
  const sec = v % 60;
  return `${m} minutes ${sec} seconds`;
}

export default function DeckHome() {
  const allCards = cardManifest;

  const [cardCount, setCardCount] = useState(1);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  const [countdownEnabled, setCountdownEnabled] = useState(false);

  const [deckHistory, setDeckHistory] = useState(EMPTY_HISTORY);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const cycleTransitionLockRef = useRef(false);

  const [configOpen, setConfigOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

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
    queueMicrotask(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
  }, []);

  /**
   * Hydrate deck from localStorage before paint so `<Image>` mounts ASAP.
   * (`useEffect` + microtask ran after paint → empty deck flash + late image fetch.)
   */
  useLayoutEffect(() => {
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
        return;
      }
    }
    const paths = pickRandom(allCards, 1);
    const initial = { entries: [paths], index: 0 };
    setDeckHistory(initial);
    saveDeckHistory(initial);
    setCardCount(1);
  }, [allCards]);

  const reshuffleFromCountdown = useCallback(() => {
    pushDeckToHistory(pickRandom(allCards, cardCount));
    setSecondsLeft(countdownSeconds);
  }, [allCards, cardCount, countdownSeconds, pushDeckToHistory]);

  useEffect(() => {
    if (!countdownEnabled) return;
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
  }, [secondsLeft, countdownEnabled, reshuffleFromCountdown]);

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
    pushDeckToHistory(pickRandom(allCards, cardCount));
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

    const paths = pickRandom(allCards, n);
    pushDeckToHistory(paths);

    if (!ce) {
      setSecondsLeft(0);
      return;
    }

    setSecondsLeft(sec);
  };

  const toggleTheme = () => {
    const goingDark = !document.documentElement.classList.contains("dark");
    if (goingDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(STORAGE_THEME, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(STORAGE_THEME, "light");
    }
    setIsDark(goingDark);
  };

  const navBtnClass =
    "inline-flex shrink-0 items-center justify-center rounded-none border-none min-h-11 min-w-11 px-4 py-4 text-2xl leading-none font-medium tabular-nums text-[var(--fg)] md:min-h-12 md:min-w-12 md:text-3xl bg-transparent shadow-none outline-none hover:opacity-90 active:opacity-90 disabled:pointer-events-none disabled:opacity-25 focus-visible:ring-2 focus-visible:ring-[var(--fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)] pb-36 pt-8 md:pt-12">
      <header className="max-w-3xl mx-auto w-full px-4 text-center mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[var(--fg)]">
          Let it be simple
        </h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col w-full items-center gap-4 md:gap-6">
        <section className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-1">
          <CardDeck paths={displayedPaths} revealed={revealed} />
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 flex flex-col gap-2 bg-[var(--bg)] px-4 pt-3 pb-4 shadow-none border-none">
        {countdownEnabled ? (
          <div
            className="flex flex-col items-center gap-1"
            aria-live="polite"
            aria-label={`Next cards in ${formatSecondsForAria(secondsLeft)}`}
          >
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--fg)] opacity-85 md:text-sm">
              Next cards in
            </span>
            <FlipClock secondsLeft={secondsLeft} />
          </div>
        ) : null}
        <div className="flex w-full flex-row items-center gap-2">
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
            <button
              type="button"
              onClick={handleRandom}
              className="shrink-0 rounded-none border-none px-8 py-3 text-base font-medium bg-[var(--fg)] text-[var(--bg)] shadow-none outline-none hover:opacity-90 active:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            >
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
          <div className="flex min-w-0 flex-1 shrink items-center justify-end">
            <ConfigDropdown
              open={configOpen}
              onOpenChange={setConfigOpen}
              cardCount={cardCount}
              countdownSeconds={countdownSeconds}
              countdownEnabled={countdownEnabled}
              onApply={handleApply}
              isDark={isDark}
              onToggleTheme={toggleTheme}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
