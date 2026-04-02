"use client";
import { useState, useEffect } from "react";

interface Props {
  /** Called whenever paused state changes — use to freeze timers / block input */
  onPause?: (paused: boolean) => void;
  /** Pass true to disable the button (e.g. game is already over) */
  disabled?: boolean;
}

export default function PauseButton({ onPause, disabled }: Props) {
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    if (disabled) return;
    setPaused(p => {
      onPause?.(!p);
      return !p;
    });
  };

  // Resume automatically when the game ends
  useEffect(() => {
    if (disabled && paused) {
      setPaused(false);
      setTimeout(() => onPause?.(false), 0);
    }
  }, [disabled]);

  return (
    <>
      <button
        onClick={toggle}
        disabled={disabled}
        className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition disabled:opacity-40"
      >
        {paused ? "▶ Resume" : "⏸ Pause"}
      </button>

      {paused && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-10 text-center max-w-xs w-full shadow-2xl">
            <p className="text-6xl mb-4">⏸</p>
            <p className="text-2xl font-bold text-white mb-2">Game Paused</p>
            <p className="text-gray-400 text-sm mb-7">Take a breather — your progress is safe.</p>
            <button
              onClick={toggle}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl transition"
            >
              ▶ Resume Game
            </button>
          </div>
        </div>
      )}
    </>
  );
}
