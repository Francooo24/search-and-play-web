"use client";
import { useState } from "react";

export default function SaveWordButton({ word, initialSaved }: { word: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/favorites/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: saved ? "remove" : "save", word }),
    });
    const data = await res.json();
    if (data.success) setSaved(data.saved);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 border px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        saved
          ? "text-amber-400 border-amber-400/40 bg-amber-400/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
          : "text-gray-400 border-white/10 bg-white/5 hover:text-amber-400 hover:border-amber-400/30"
      }`}
    >
      <svg className={`w-4 h-4 transition-all duration-200 ${saved ? "drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" : ""}`} viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={saved ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      {saved ? "Saved" : "Save Word"}
    </button>
  );
}
