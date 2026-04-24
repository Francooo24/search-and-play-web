"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const SearchBox = dynamic(() => import("@/components/SearchBox"), { ssr: false });

const FEATURED_GAMES = [
  { slug: "wordle",    name: "WordGuess",   icon: "📝", desc: "Guess the 5-letter word in 6 tries!",          color: "from-emerald-600 to-teal-500",  badge: "Teen",  badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { slug: "wordblitz", name: "Word Blitz",  icon: "⚡", desc: "Type as many words as you can in 60 seconds!", color: "from-orange-600 to-amber-500",   badge: "Adult", badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"   },
  { slug: "memory",    name: "Memory Game", icon: "🧠", desc: "Flip cards and find all matching pairs!",       color: "from-blue-600 to-cyan-500",     badge: "Kids",  badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"         },
];

const CATEGORIES = [
  { emoji: "🌿", label: "Nature",   color: "from-green-500/20 to-emerald-500/5",   border: "border-green-500/20",  hover: "hover:border-green-400/50"  },
  { emoji: "❤️", label: "Emotions", color: "from-rose-500/20 to-pink-500/5",       border: "border-rose-500/20",   hover: "hover:border-rose-400/50"   },
  { emoji: "🏛️", label: "History",  color: "from-amber-500/20 to-yellow-500/5",    border: "border-amber-500/20",  hover: "hover:border-amber-400/50"  },
  { emoji: "🔬", label: "Science",  color: "from-cyan-500/20 to-blue-500/5",       border: "border-cyan-500/20",   hover: "hover:border-cyan-400/50"   },
  { emoji: "🎨", label: "Arts",     color: "from-purple-500/20 to-violet-500/5",   border: "border-purple-500/20", hover: "hover:border-purple-400/50" },
  { emoji: "🧠", label: "Mind",     color: "from-indigo-500/20 to-blue-500/5",     border: "border-indigo-500/20", hover: "hover:border-indigo-400/50" },
];

function DailyChallengeBanner() {
  const { data: session, status } = useSession();
  const [challenge, setChallenge] = useState<{ game: string; title: string; bonus_points: number } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/daily-challenge")
      .then(r => r.json())
      .then(d => { setChallenge(d.challenge ?? null); setCompleted(d.completed ?? false); })
      .catch(() => {});
  }, [status]);

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

  if (status === "loading") return null;
  const authed = status === "authenticated";

  return (
    <div className={`relative overflow-hidden rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 sm:p-8 w-full
      ${completed ? "border-green-500/25 bg-gradient-to-br from-green-500/8 to-transparent" : "border-orange-500/25 bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-transparent"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.06),transparent_60%)] pointer-events-none" />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${completed ? "bg-green-500/15 border border-green-500/25" : "bg-orange-500/15 border border-orange-500/25"}`}>
        {completed ? "✅" : "⚡"}
      </div>
      <div className="flex-1 min-w-0 relative">
        <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-1">Daily Challenge</p>
        {!authed ? (
          <p className="text-white font-bold text-lg">Sign in to see today&apos;s challenge</p>
        ) : !challenge ? (
          <p className="text-white font-bold text-lg">No challenge available today</p>
        ) : completed ? (
          <p className="text-white font-bold text-lg">Complete! Next in <span className="text-green-400 font-mono">{countdown}</span></p>
        ) : (
          <>
            <p className="text-white font-bold text-lg truncate">{challenge.title}</p>
            <p className="text-gray-500 text-sm mt-1">Resets in <span className="text-orange-400 font-mono font-bold">{countdown}</span> · <span className="text-amber-400 font-bold">+{challenge.bonus_points} pts</span></p>
          </>
        )}
      </div>
      {!authed ? (
        <Link href="/login" className="flex-shrink-0 text-sm font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20">Sign In</Link>
      ) : completed ? (
        <Link href="/daily-challenge" className="flex-shrink-0 text-sm font-black border border-green-500/30 text-green-400 hover:bg-green-500/10 px-6 py-2.5 rounded-xl transition">View</Link>
      ) : challenge ? (
        <Link href={GAME_LINKS[challenge.game] ?? "/daily-challenge"} className="flex-shrink-0 text-sm font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 whitespace-nowrap">Play Now →</Link>
      ) : null}
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

  if (players.length === 0) return (
    <div className="text-center py-10 text-gray-600 text-sm">No players yet — be the first!</div>
  );

  const medals = ["🥇", "🥈", "🥉"];
  const AVATAR_COLORS = ["from-violet-500 to-purple-700", "from-blue-500 to-cyan-600", "from-emerald-500 to-teal-700"];
  const RANK_BG = ["bg-amber-500/10 border-amber-500/20", "bg-gray-500/10 border-gray-500/20", "bg-orange-800/10 border-orange-800/20"];

  function flag(code?: string | null) {
    if (!code || code.length !== 2) return "";
    return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
  }

  return (
    <div className="space-y-3">
      {players.map((p, i) => (
        <div key={i} className={`flex items-center gap-4 border rounded-2xl px-5 py-4 transition hover:-translate-y-0.5 ${RANK_BG[i]}`}>
          <div className="w-8 text-center text-xl flex-shrink-0">{medals[i]}</div>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i]} flex items-center justify-center font-black text-white text-base flex-shrink-0`}>
            {p.player_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{p.player_name} {flag(p.country)}</p>
            <p className="text-gray-600 text-xs">Rank #{i + 1}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-orange-400 font-black text-sm">{p.total_score.toLocaleString()}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wide">pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [homeStats, setHomeStats] = useState<{ plays: number; players: number; games: number } | null>(null);

  useEffect(() => {
    fetch("/api/home-stats").then(r => r.json()).then(d => setHomeStats(d)).catch(() => {});
  }, []);

  useEffect(() => {
    setMounted(true);
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
    <div className="flex-grow flex flex-col items-center relative z-10" suppressHydrationWarning>

      {/* ── HERO ── */}
      <section className="w-full relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(249,115,22,0.12),transparent)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16 flex flex-col items-center text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Search. Learn. Play.
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4 max-w-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Search &amp;{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">Play.</span>
            </span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mb-4 leading-relaxed">
            Look up words instantly, then reinforce your learning through 45+ interactive games designed for all ages.
          </p>

          {/* Search */}
          <div className="w-full max-w-3xl mb-2">
            <SearchBox onSearch={handleSearch} />
          </div>

          {/* Recent searches */}
          {mounted && (
            <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
              <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-widest">Recent:</span>
              {recentSearches.length === 0 && <span className="text-[11px] text-gray-700">None yet</span>}
              {recentSearches.map(w => (
                <button key={w} onClick={() => handleSearch(w)}
                  className="text-[11px] bg-white/5 hover:bg-orange-500/15 border border-white/8 hover:border-orange-500/30 text-gray-500 hover:text-orange-300 px-3 py-1 rounded-full transition">
                  {w}
                </button>
              ))}
              {recentSearches.length > 0 && (
                <button onClick={() => { setRecentSearches([]); localStorage.removeItem("recent_searches"); }}
                  className="text-[10px] text-gray-700 hover:text-gray-500 transition">clear</button>
              )}
            </div>
          )}

          {/* Popular Games moved to hero */}
          <div className="w-full max-w-3xl">
            <div className="flex items-end justify-between mb-3">
              <div className="text-left">
                <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-2">Featured</p>
                <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Popular Games</h2>
              </div>
              <Link href="/games" className="text-sm font-bold text-orange-400 hover:text-orange-300 border border-orange-500/25 hover:border-orange-400/50 px-4 py-2 rounded-xl transition">
                All 45 Games →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {FEATURED_GAMES.map(g => (
                <Link key={g.slug} href={`/games/${g.slug}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/8 hover:border-white/15 bg-[#0a0a0f] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40 flex flex-col">
                  <div className={`relative h-44 bg-gradient-to-br ${g.color} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-500 relative z-10">{g.icon}</span>
                    <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full border ${g.badgeColor}`}>{g.badge}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-white font-black text-base mb-1">{g.name}</p>
                    <p className="text-gray-500 text-xs leading-relaxed flex-1">{g.desc}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-orange-400 text-xs font-bold group-hover:gap-2.5 transition-all">
                      Play Now <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats row moved below popular games */}
          <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "45",  label: "Word Games",     icon: "🎮" },
              { value: homeStats ? homeStats.players.toLocaleString() : "—", label: "Active Players", icon: "👥" },
              { value: "3",   label: "Age Groups",     icon: "🎯" },
              { value: "Free", label: "Always Free",   icon: "✨" },
            ].map(s => (
              <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl px-4 py-6 flex flex-col items-center gap-2">
                <span className="text-4xl">{s.icon}</span>
                <p className="text-4xl font-black text-white">{s.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DAILY CHALLENGE + TOP PLAYERS ── */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Daily Challenge — wider */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="text-center lg:text-left">
              <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-2">Today</p>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Daily Challenge</h2>
            </div>
            <DailyChallengeBanner />
          </div>

          {/* Top Players — narrower */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-2">Rankings</p>
                <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Top Players</h2>
              </div>
              <Link href="/leaderboard" className="text-xs font-bold text-orange-400 hover:text-orange-300 transition mb-0.5">
                Full Board →
              </Link>
            </div>
            <TopPlayers />
          </div>
        </div>
      </section>

      {/* ── BROWSE CATEGORIES ── */}
      <section className="w-full border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-2">Explore</p>
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Browse by Topic</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.label} href={`/search?word=${encodeURIComponent(cat.label)}`}
                className={`group rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1 border bg-gradient-to-br ${cat.color} ${cat.border} ${cat.hover} hover:shadow-lg`}>
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{cat.emoji}</div>
                <div className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!session?.user && (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-transparent p-10 sm:p-14 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.07),transparent_70%)] pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-4">Get Started — It&apos;s Free</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 relative" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ready to Play &amp; Learn?
            </h2>
            <p className="text-gray-400 text-base mb-8 max-w-md mx-auto leading-relaxed">
              Create a free account to save words, track your scores, and compete on the leaderboard.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base px-8 py-3.5 rounded-2xl transition shadow-lg shadow-orange-500/25">
                Create Free Account
              </Link>
              <Link href="/login" className="border border-white/12 hover:border-white/25 text-gray-400 hover:text-white font-bold text-base px-8 py-3.5 rounded-2xl transition">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
