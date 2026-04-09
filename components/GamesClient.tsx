"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Game    = { slug: string; name: string; icon: string; desc: string; group: string; };
type Section = { group: string; label: string; subtitle: string; color: string; };

const ADULT_STEPS = [
  "🎮 Pick any game from the list below and click Play now.",
  "⚙️ Choose your difficulty (Easy, Medium, or Hard) before starting — harder = more points!",
  "📖 Each game has a ❓ How to Play button inside — tap it anytime to read the rules.",
  "🧠 Games are challenging — they test vocabulary, logic, and critical thinking.",
  "⏱ Most games are timed or have limited attempts — think fast and strategically!",
  "🏆 Score as high as possible and challenge yourself on Hard mode.",
  "🔐 Cryptogram — Each letter is substituted with another. Click a cipher letter, then type the real letter to decode the quote.",
  "📋 Crossword — Read the Across/Down clues, click a cell, and type your answer. Complete all words to win.",
  "⚡ Word Blitz — Type valid words as fast as you can in 60 seconds. Longer words = more points!",
  "🔀 Anagram Master — Rearrange all the given letters to form a valid word. Use hints if you're stuck.",
  "⚔️ Word Duel — Like Wordle but 8 tries. Green = correct spot, Yellow = wrong spot, Gray = not in word.",
  "🧠 Speed Trivia — Answer multiple-choice questions before the timer runs out.",
  "🔍 Logic Grid — Use the given clues to fill in a grid and deduce who owns what.",
  "🧩 Deduction — Guess the secret 4-digit code. After each guess you'll see which digits are correct.",
];

const HOW_TO_PLAY: Record<string, { emoji: string; title: string; steps: string[] }> = {
  kids:  { emoji: "🧒", title: "Kids Games Guide", steps: ["🎮 Pick any game and click Play now.", "📖 Tap ❓ How to Play inside any game to read the rules.", "🎯 Games are simple and fun — match, count, color, and click!", "⭐ Earn points by answering correctly.", "🔄 Replay any game as many times as you like!"] },
  teen:  { emoji: "🧑", title: "Teen Games Guide", steps: ["🎮 Pick any game and click Play now.", "⚙️ Choose your difficulty before starting.", "📖 Tap ❓ How to Play inside any game.", "⏱ Many games are timed — answer quickly!", "🏆 Beat your high score on harder difficulties."] },
  adult: { emoji: "🔞", title: "Adult Games Guide", steps: ADULT_STEPS },
};

const GROUP_ACCENT: Record<string, { from: string; border: string; text: string; pill: string }> = {
  kids:  { from: "from-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   pill: "bg-blue-500/15 border-blue-500/25 text-blue-300"   },
  teen:  { from: "from-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",pill: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300"},
  adult: { from: "from-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", pill: "bg-orange-500/15 border-orange-500/25 text-orange-300"},
};

function HowToPlayBox({ group }: { group: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const info = HOW_TO_PLAY[group];
  const accent = GROUP_ACCENT[group];
  if (!info) return null;
  const preview = info.steps.slice(0, 5);
  const extra   = info.steps.slice(5);
  const panelId = `how-to-play-${group}`;

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border ${accent.border} bg-white/3 hover:bg-white/5 transition-all duration-200 group`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">{info.emoji}</span>
          <div className="text-left">
            <p className={`text-sm font-bold ${accent.text}`}>{info.title}</p>
            <p className="text-gray-500 text-xs">Tap to {open ? "hide" : "view"} instructions</p>
          </div>
        </div>
        <span className={`text-gray-500 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true">▼</span>
      </button>

      {open && (
        <div id={panelId} className={`mt-2 border ${accent.border} bg-[#0a0a12] rounded-2xl p-4 sm:p-5 space-y-3`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {preview.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white/3 rounded-xl px-3 py-2.5">
                <span className="text-base leading-none mt-0.5 flex-shrink-0" aria-hidden="true">{step.split(" ")[0]}</span>
                <p className="text-xs text-gray-400 leading-relaxed">{step.split(" ").slice(1).join(" ")}</p>
              </div>
            ))}
            {expanded && extra.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white/3 rounded-xl px-3 py-2.5">
                <span className="text-base leading-none mt-0.5 flex-shrink-0" aria-hidden="true">{step.split(" ")[0]}</span>
                <p className="text-xs text-gray-400 leading-relaxed">{step.split(" ").slice(1).join(" ")}</p>
              </div>
            ))}
          </div>
          {extra.length > 0 && (
            <button type="button" onClick={() => setExpanded(e => !e)} className={`text-xs font-semibold ${accent.text} hover:opacity-80 transition`}>
              {expanded ? "▲ Show less" : `▼ Show ${extra.length} more tips`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FavButton({ game, initialSaved }: { game: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/favorites/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: saved ? "remove" : "save", game }) });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setSaved(data.saved);
    } finally {
      setLoading(false);
    }
  }
  const label = saved ? `Remove ${game} from favorites` : `Save ${game} to favorites`;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      disabled={loading}
      className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed
        ${saved ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-gray-600 hover:text-orange-400 hover:bg-orange-500/10"}`}
    >
      <span aria-hidden="true">{saved ? "★" : "☆"}</span>
    </button>
  );
}

function GameCard({ game, isFav }: { game: Game; isFav: boolean }) {
  const accent = GROUP_ACCENT[game.group];
  const iconBg: Record<string, string> = {
    kids:  "from-blue-500 to-cyan-400",
    teen:  "from-emerald-500 to-teal-400",
    adult: "from-orange-500 to-amber-400",
  };
  return (
    <div className="relative group" role="listitem">
      <FavButton game={game.name} initialSaved={isFav} />
      <Link
        href={`/games/${game.slug}`}
        aria-label={`Play ${game.name} — ${game.desc}`}
        className="flex flex-col bg-[#0a0a12] border border-white/8 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
      >
        {/* Play Store style icon banner */}
        <div
          aria-hidden="true"
          className={`w-full h-48 sm:h-56 bg-gradient-to-br ${iconBg[game.group]} flex items-center justify-center text-8xl sm:text-9xl group-hover:scale-105 transition-transform duration-300`}
        >
          {game.icon}
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-white font-black text-sm sm:text-base mb-1 leading-tight group-hover:text-orange-400 transition-colors duration-200">
            {game.name}
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">{game.desc}</p>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${accent.pill}`}>
              {game.group}
            </span>
            <span aria-hidden="true" className="text-orange-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200">
              Play →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function GamesClient({ sections, games, favGames }: { sections: Section[]; games: Game[]; favGames: string[] }) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? games.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.desc.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="max-w-6xl mx-auto w-full">

      {/* Search bar */}
      <div role="search" className="relative mb-10 max-w-md mx-auto">
        <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search games..."
          aria-label="Search games"
          className="w-full bg-[#0a0a12] border border-white/8 focus:border-orange-500/40 rounded-2xl pl-10 pr-10 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-500/40"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition text-xs p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search results */}
      {filtered ? (
        <div>
          <p aria-live="polite" className="text-gray-500 text-xs uppercase tracking-widest mb-5 font-bold">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <p className="text-4xl mb-4" aria-hidden="true">🔍</p>
              <p className="text-gray-400 font-semibold">No games found</p>
              <p className="text-gray-600 text-sm mt-1">Try a different keyword</p>
            </div>
          ) : (
            <div role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(game => <GameCard key={game.slug} game={game} isFav={favGames.includes(game.name)} />)}
            </div>
          )}
        </div>
      ) : (
        sections.map(section => {
          const sectionGames = games.filter(g => g.group === section.group);
          const accent = GROUP_ACCENT[section.group];
          return (
            <div key={section.group} className="mb-16">

              {/* Section header */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6">
                <div className="flex-1 h-px bg-white/5" />
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border ${accent.pill} text-xs font-bold uppercase tracking-widest mb-2`}>
                    {section.label}
                  </div>
                  <p className="text-gray-600 text-xs">{section.subtitle}</p>
                </div>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <HowToPlayBox group={section.group} />

              <div role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sectionGames.map(game => <GameCard key={game.slug} game={game} isFav={favGames.includes(game.name)} />)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
