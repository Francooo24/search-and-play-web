"use client";
import { useState } from "react";

interface HowToPlayProps {
  title: string;
  icon: string;
  steps: string[];
}

export default function HowToPlay({ title, icon, steps }: HowToPlayProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition"
      >
        ❓ <span className="hidden sm:inline">How to Play</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-900 border border-white/10 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4 gap-2">
              <h2 className="text-base sm:text-xl font-bold text-white leading-tight">
                {icon} How to Play — {title}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white text-xl leading-none flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2.5 rounded-xl font-semibold transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
