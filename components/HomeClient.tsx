"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const SearchBox = dynamic(() => import("@/components/SearchBox"), { ssr: false });

const POPULAR = ["apple", "peace", "love", "happy", "world"];

const FEATURED_GAMES = [
  { slug: "wordle",      name: "WordGuess",     icon: "📝", desc: "Guess the 5-letter word in 6 tries!",        color: "from-green-500/20 to-teal-500/10",   border: "border-green-500/30",  badge: "Teen"  },
  { slug: "wordblitz",   name: "Word Blitz",    icon: "⚡", desc: "Type as many words as you can in 60 seconds!", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/30", badge: "Adult" },
  { slug: "memory",      name: "Memory Game",   icon: "🧠", desc: "Flip cards and find all matching pairs!",      color: "from-blue-500/20 to-cyan-500/10",    border: "border-blue-500/30",   badge: "Kids"  },
];
const CATEGORIES = [
  { emoji: "🌿", label: "Nature",   words: ["ocean","forest","mountain","river","storm"] },
  { emoji: "❤️", label: "Emotions", words: ["love","joy","grief","hope","fear"] },
  { emoji: "🏛️", label: "History",  words: ["empire","ancient","myth","war","hero"] },
  { emoji: "🔬", label: "Science",  words: ["atom","energy","gravity","cell","light"] },
  { emoji: "🎨", label: "Arts",     words: ["music","poetry","drama","color","dance"] },
  { emoji: "🧠", label: "Mind",     words: ["logic","wisdom","memory","dream","soul"] },
];

function DailyChallengeBanner() {
  const [challenge, setChallenge] = useState<{ game: string; title: string; bonus_points: number } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [authed, setAuthed]       = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/daily-challenge")
      .then(r => r.json())
      .then(d => {
        setAuthed(true);
        setChallenge(d.challenge ?? null);
        setCompleted(d.completed ?? false);
      })
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const GAME_LINKS: Record<string, string> = {
    "Hangman": "/games/hangman", "WordGuess": "/games/wordle", "Crossword": "/games/crossword",
    "Word Puzzle": "/games/puzzle", "Word Blitz": "/games/wordblitz", "Word Search": "/games/wordsearch",
    "Spelling Bee": "/games/spellingbee", "Cryptogram": "/games/cryptogram", "Anagram Master": "/games/anagram",
    "Memory Game": "/games/memory", "Trivia Blitz": "/games/triviablitz", "Speed Trivia": "/games/trivia",
  };

  if (authed === null) return null;

  return (
    <div className="w-full max-w-xl mb-10">
      <div className={`relative overflow-hidden rounded-2xl border px-5 py-4 flex items-center gap-4
        ${ completed ? "border-green-500/30 bg-green-500/5" : "border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent" }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(249,115,22,0.08),transparent_60%)] pointer-events-none" />
        <div className="text-3xl flex-shrink-0">{completed ? "✅" : "⚡"}</div>
        <div className="flex-1 min-w-0 relative">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">Daily Challenge</p>
          {!authed || !challenge ? (
            <p className="text-white font-bold text-sm">Sign in to see today&apos;s challenge</p>
          ) : completed ? (
            <p className="text-white font-bold text-sm">Challenge complete! Next in <span className="text-green-400 font-mono">{countdown}</span></p>
          ) : (
            <>
              <p className="text-white font-bold text-sm truncate">{challenge.title}</p>
              <p className="text-gray-500 text-xs">Resets in <span className="text-orange-400 font-mono font-bold">{countdown}</span> · +{challenge.bonus_points} pts</p>
            </>
          )}
        </div>
        {!authed ? (
          <Link href="/login" className="flex-shrink-0 text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl transition">
            Sign In
          </Link>
        ) : completed ? (
          <Link href="/daily-challenge" className="flex-shrink-0 text-xs font-black border border-green-500/30 text-green-400 hover:bg-green-500/10 px-4 py-2 rounded-xl transition">
            View
          </Link>
        ) : challenge ? (
          <Link href={GAME_LINKS[challenge.game] ?? "/daily-challenge"} className="flex-shrink-0 text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl transition whitespace-nowrap">
            Play Now →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function TopPlayers() {
  const [players, setPlayers] = useState<{ player_name: string; total_score: number; country?: string | null }[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard?period=all&offset=0", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setPlayers((d.players ?? []).slice(0, 3)))
      .catch(() => {});
  }, []);

  if (players.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];
  const AVATAR_COLORS = ["from-violet-500 to-purple-700", "from-blue-500 to-cyan-600", "from-emerald-500 to-teal-700"];

  function flag(code?: string | null) {
    if (!code || code.length !== 2) return "";
    return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {players.map((p, i) => (
        <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < players.length - 1 ? "border-b border-white/5" : ""}`}>
          <span className="text-lg w-6 text-center flex-shrink-0">{medals[i]}</span>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i]} flex items-center justify-center font-black text-white text-xs flex-shrink-0`}>
            {p.player_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {p.player_name} {flag(p.country)}
            </p>
          </div>
          <p className="text-orange-400 font-black text-sm flex-shrink-0">{p.total_score.toLocaleString()} pts</p>
        </div>
      ))}
    </div>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const playerName = (session?.user as any)?.name ?? (session?.user as any)?.player_name ?? null;
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [wordOfDay, setWordOfDay] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/word-of-day").then(r => r.json()).then(data => { if (data) setWordOfDay(data); });
    const stored = localStorage.getItem("recent_searches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const handleSearch = (w: string) => {
    if (!w.trim()) return;
    const updated = [w.trim(), ...recentSearches.filter(r => r.toLowerCase() !== w.trim().toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
    router.push(`/search?word=${encodeURIComponent(w.trim())}`);
  };

  return (
    <div className="flex-grow flex flex-col items-center text-center px-4 relative z-10 pt-12">
      {playerName && (
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
          👋 Welcome back, <span className="text-white font-black">{playerName}</span>!
        </div>
      )}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4 md:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Look up any <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Greek</span> word
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-12 max-w-3xl">
        Definitions, examples, and save words to study later.
      </p>

      {/* Search */}
      <div className="w-full max-w-xl mb-6 md:mb-8">
        <SearchBox onSearch={handleSearch} />
        <p className="text-sm text-gray-400 mb-3">Popular right now:</p>
        <div className="flex gap-3 flex-wrap justify-center">
          {POPULAR.map(w => (
            <a key={w} href={`/search?word=${w}`} className="text-sm bg-white/5 px-5 py-2.5 rounded-full hover:bg-white/10 transition border border-white/10">{w}</a>
          ))}
        </div>
        {recentSearches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap justify-center mt-4">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Recent:</span>
            {recentSearches.map(w => (
              <button key={w} onClick={() => handleSearch(w)}
                className="text-xs bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/30 text-gray-400 hover:text-orange-300 px-3 py-1 rounded-full transition flex items-center gap-1">
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {w}
              </button>
            ))}
            <button onClick={() => { setRecentSearches([]); localStorage.removeItem("recent_searches"); }}
              className="text-[10px] text-gray-600 hover:text-gray-400 transition ml-1">clear</button>
          </div>
        )}
      </div>

      {/* Word of the Day */}
      {wordOfDay && (
        <div className="glass-card border-l-4 border-l-orange-500 rounded-2xl px-6 py-5 mb-10 max-w-xl w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">✦ Word of the Day</p>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-2xl font-bold text-white cursor-pointer" onClick={() => handleSearch(wordOfDay.word)}>{wordOfDay.word}</p>
              {wordOfDay.english_word && (
                <p className="text-sm text-orange-300 font-medium mt-0.5">{wordOfDay.english_word}</p>
              )}
            </div>
            <button
              onClick={() => {
                const audio = new Audio(`/api/tts?text=${encodeURIComponent(wordOfDay.word)}&lang=el&v=${Date.now()}`);
                audio.play();
              }}
              title="Listen to Greek pronunciation"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-500/15 hover:bg-orange-500/30 border border-orange-500/25 text-orange-400 transition hover:scale-110"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M9 9v6m-3-3h.01" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 text-sm line-clamp-2 cursor-pointer" onClick={() => handleSearch(wordOfDay.word)}>{wordOfDay.definition}</p>
        </div>
      )}

      {/* Daily Challenge Banner */}
      <DailyChallengeBanner />

      {/* Top Players */}
      <div className="w-full max-w-xl mb-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">Top players:</p>
          <Link href="/leaderboard" className="text-xs text-orange-400 hover:text-orange-300 transition font-semibold">View all →</Link>
        </div>
        <TopPlayers />
      </div>

      {/* Featured Games */}
      <div className="w-full max-w-xl mb-10">
        <p className="text-sm text-gray-400 mb-4">Featured games:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FEATURED_GAMES.map(g => (
            <div key={g.slug} className={`glass-card rounded-2xl p-4 flex flex-col gap-2 bg-gradient-to-br ${g.color} border ${g.border} hover:-translate-y-1 transition`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{g.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{g.badge}</span>
              </div>
              <p className="text-white font-black text-sm">{g.name}</p>
              <p className="text-gray-400 text-xs flex-1">{g.desc}</p>
              <Link href={`/games/${g.slug}`} className="mt-1 w-full text-center text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3 py-2 rounded-xl transition">
                Play Now →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="w-full max-w-xl mb-10">
        <p className="text-sm text-gray-400 mb-4">Explore:</p>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/games" className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:-translate-y-1 hover:border-orange-500/40 transition group">
            <span className="text-3xl">🎮</span>
            <span className="text-sm font-bold text-gray-300 group-hover:text-orange-400 transition">Games</span>
            <span className="text-[10px] text-gray-600 text-center">Play word games</span>
          </Link>
          <Link href="/leaderboard" className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:-translate-y-1 hover:border-orange-500/40 transition group">
            <span className="text-3xl">🏆</span>
            <span className="text-sm font-bold text-gray-300 group-hover:text-orange-400 transition">Leaderboard</span>
            <span className="text-[10px] text-gray-600 text-center">Top players</span>
          </Link>
          <Link href="/culture" className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:-translate-y-1 hover:border-orange-500/40 transition group">
            <span className="text-3xl">🏛️</span>
            <span className="text-sm font-bold text-gray-300 group-hover:text-orange-400 transition">Culture</span>
            <span className="text-[10px] text-gray-600 text-center">Greek culture</span>
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="w-full max-w-xl mb-10 md:mb-14">
        <p className="text-sm text-gray-400 mb-4">Browse by category:</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === i ? null : i)}
              className={`glass-card rounded-xl p-3 text-center cursor-pointer transition hover:-translate-y-1 ${activeCategory === i ? "border-orange-500 bg-orange-500/8" : ""}`}
            >
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <div className="text-xs font-medium text-gray-300">{cat.label}</div>
            </button>
          ))}
        </div>
        {activeCategory !== null && (
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES[activeCategory].words.map(w => (
              <Link key={w} href={`/search?word=${w}`} className="text-sm bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/30 text-gray-300 hover:text-orange-300 px-4 py-1.5 rounded-full transition">{w}</Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
