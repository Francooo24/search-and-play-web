"use client";
import Link from "next/link";
import { useState } from "react";

type Item = {
  key: string;
  label: string;
  date: string;
  href: string;
  icon?: string;
};

export default function FavoritesClient({ type, items: initial }: { type: "words" | "games"; items: Item[] }) {
  const [items, setItems] = useState(initial);

  async function remove(key: string) {
    const url = type === "words" ? "/api/favorites/words" : "/api/favorites/games";
    const body = type === "words" ? { action: "remove", word: key } : { action: "remove", game: key };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if ((await res.json()).success) setItems((prev) => prev.filter((i) => i.key !== key));
  }

  if (type === "words") {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item.key} className="group flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 rounded-full pl-4 pr-2 py-2 transition">
            <Link href={item.href} className="text-sm font-semibold text-amber-300 hover:text-amber-200 transition">
              {item.label}
            </Link>
            <button
              onClick={() => remove(item.key)}
              title="Remove"
              className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/15 transition text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.key} className="group relative flex items-center gap-4 bg-white/4 hover:bg-white/8 border border-white/8 hover:border-orange-500/30 rounded-2xl px-4 py-4 transition-all hover:-translate-y-0.5">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center text-2xl shrink-0">
            {item.icon}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link href={item.href} className="font-semibold text-white group-hover:text-orange-400 transition truncate block text-sm">
              {item.label}
            </Link>
            <p className="text-xs text-gray-500 mt-0.5">Saved {item.date}</p>
          </div>
          {/* Play button */}
          <Link href={item.href} className="shrink-0 text-xs bg-orange-500/15 hover:bg-orange-500/30 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg font-semibold transition">
            Play →
          </Link>
          {/* Remove */}
          <button
            onClick={() => remove(item.key)}
            title="Remove"
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-gray-600 hover:text-red-400 hover:bg-red-500/15 transition text-xs opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
