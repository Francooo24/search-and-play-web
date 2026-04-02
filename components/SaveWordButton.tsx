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
      className={`border px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        saved
          ? "text-orange-400 border-orange-400/40 bg-orange-400/10"
          : "text-gray-400 border-white/10 bg-white/5 hover:text-orange-400 hover:border-orange-400/30"
      }`}
    >
      {saved ? "⭐ Saved" : "☆ Save Word"}
    </button>
  );
}
