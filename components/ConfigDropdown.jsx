"use client";

import { useEffect, useRef, useState } from "react";
import instructionLinks from "@/lib/instructions.json";

const DISCORD_URL = "https://discord.gg/3YRUp4cP5K";

function DiscordIcon({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.078.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.104 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.673-3.548-13.661a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.947 2.419-2.157 2.419z" />
    </svg>
  );
}

function GearIcon({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** Pill toggle: white frame + border; white track (off) / black track (on) */
function ToggleSwitch({ checked, onCheckedChange, labelledBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onCheckedChange(!checked)}
      className="inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-black bg-white p-0.5 shadow-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <span
        aria-hidden
        className={`flex h-5 w-full items-center rounded-full px-0.5 transition-colors duration-200 ease-out ${
          checked ? "justify-end bg-black" : "justify-start bg-white"
        }`}
      >
        <span
          className={`size-5 shrink-0 rounded-full shadow-none ${
            checked ? "bg-white" : "bg-black"
          }`}
        />
      </span>
    </button>
  );
}

export default function ConfigDropdown({
  open,
  onOpenChange,
  cardCount,
  countdownSeconds,
  countdownEnabled,
  onApply,
}) {
  const rootRef = useRef(null);
  const [draftCount, setDraftCount] = useState(cardCount);
  const [draftSeconds, setDraftSeconds] = useState(countdownSeconds);
  const [draftCountdownEnabled, setDraftCountdownEnabled] = useState(countdownEnabled);
  const [error, setError] = useState("");

  function toggleOpen() {
    const next = !open;
    if (next) {
      setDraftCount(cardCount);
      setDraftSeconds(countdownSeconds);
      setDraftCountdownEnabled(countdownEnabled);
      setError("");
    }
    onOpenChange(next);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onOpenChange]);

  function handleApply(e) {
    e.preventDefault();
    const n = Math.min(7, Math.max(1, Number.parseInt(String(draftCount), 10) || 1));
    const parsed = Number.parseInt(String(draftSeconds), 10);

    if (draftCountdownEnabled) {
      if (!Number.isFinite(parsed) || parsed < 10) {
        setError("Countdown must be at least 10 seconds.");
        return;
      }
      setError("");
      onApply({
        cardCount: n,
        countdownSeconds: parsed,
        countdownEnabled: true,
      });
    } else {
      setError("");
      const secsKept =
        Number.isFinite(parsed) && parsed >= 10 ? parsed : Math.max(10, countdownSeconds);
      onApply({
        cardCount: n,
        countdownSeconds: secsKept,
        countdownEnabled: false,
      });
    }
    onOpenChange(false);
  }

  const inputClass =
    "rounded-none border border-black bg-white px-2 py-2 text-black shadow-none outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white tabular-nums";

  return (
    <div ref={rootRef} className="relative flex flex-col items-end gap-1">
      <button
        type="button"
        className="flex items-center justify-center p-2 text-black rounded-none bg-transparent border-none shadow-none outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open settings"
        onClick={toggleOpen}
      >
        <GearIcon />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Settings"
          className="absolute bottom-full right-0 mb-2 w-[min(92vw,14rem)] min-h-[min(70vh,28rem)] max-h-[78vh] overflow-y-auto rounded-none border border-black bg-white text-black shadow-none p-4 flex flex-col gap-4 outline-none"
        >
          <form className="flex flex-col gap-4" onSubmit={handleApply}>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Cards on screen (1–7)</span>
              <input
                type="number"
                min={1}
                max={7}
                inputMode="numeric"
                value={draftCount}
                onChange={(ev) => setDraftCount(ev.target.value)}
                className={inputClass}
              />
            </label>

            <div className="flex flex-col gap-2 border border-black bg-white p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span id="countdown-toggle-label" className="text-sm font-medium">
                  Countdown
                </span>
                <ToggleSwitch
                  checked={draftCountdownEnabled}
                  onCheckedChange={setDraftCountdownEnabled}
                  labelledBy="countdown-toggle-label"
                />
              </div>

              {draftCountdownEnabled ? (
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium tabular-nums text-xs">
                    Seconds (min 10)
                  </span>
                  <input
                    type="number"
                    min={10}
                    inputMode="numeric"
                    value={draftSeconds}
                    onChange={(ev) => setDraftSeconds(ev.target.value)}
                    className={inputClass}
                  />
                </label>
              ) : null}
            </div>

            {error ? <p className="text-sm opacity-90">{error}</p> : null}

            <button
              type="submit"
              className="rounded-none bg-black text-white px-3 py-2.5 text-sm font-medium border border-black shadow-none cursor-pointer"
            >
              Apply
            </button>
          </form>

          <div className="text-xs leading-relaxed border-t border-black pt-4">
            <p className="font-medium mb-2 text-sm">Ways To Play (opens new tab)</p>
            <ul className="flex flex-col gap-2 text-[13px] leading-snug list-none p-0 m-0">
              {instructionLinks.map((item, index) => (
                <li key={`${item.link}-${index}`}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline underline-offset-2 font-medium"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
            <p className="font-medium mb-2 text-sm">Scroll the new tab for even more games</p>
          </div>

          <div className="mt-auto border-t border-black pt-4">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-black underline underline-offset-2 border-none shadow-none cursor-pointer"
            >
              <DiscordIcon />
              Join Let It Be Simple on Discord
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
