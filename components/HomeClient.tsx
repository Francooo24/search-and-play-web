"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const SearchBox = dynamic(() => import("@/components/SearchBox"), { ssr: false });

const FEATURED_GAMES = [
  { slug: "wordle",    name: "WordGuess",   icon: "📝", desc: "Guess the 5-letter word in 6 tries!",          color: "from-emerald-500 to-teal-400",  badge: "Teen"  },
  { slug: "wordblitz", name: "Word Blitz",  icon: "⚡", desc: "Type as many words as you can in 60 seconds!", color: "from-orange-500 to-amber-400",   badge: "Adult" },
  { slug: "memory",    name: "Memory Game", icon: "🧠", desc: "Flip cards and find all matching pairs!",       color: "from-blue-500 to-cyan-400",     badge: "Kids"  },
];

const CATEGORIES = [
  { emoji: "🌿", label: "Nature",   words: ["ocean","forest","mountain","river","storm"] },
  { emoji: "❤️", label: "Emotions", words: ["love","joy","grief","hope","fear"] },
  { emoji: "🏛️", label: "History",  words: ["empire","ancient","myth","war","hero"] },
  { emoji: "🔬", label: "Science",  words: ["atom","energy","gravity","cell","light"] },
  { emoji: "🎨", label: "Arts",     words: ["music","poetry","drama","color","dance"] },
  { emoji: "🧠", label: "Mind",     words: ["logic","wisdom","memory","dream","soul"] },
];

const STATS = [
  { value: "50+",  label: "Word Games"      },
  { value: "10K+", label: "Words Available" },
  { value: "3",    label: "Age Groups"      },
  { value: "Free", label: "Always"          },
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
    <div className={`relative overflow-hidden rounded-2xl border px-8 py-7 flex items-center gap-6 w-full
      ${completed ? "border-green-500/30 bg-green-500/5" : "border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(249,115,22,0.08),transparent_60%)] pointer-events-none" />
      <div className="text-5xl flex-shrink-0">{completed ? "✅" : "⚡"}</div>
      <div className="flex-1 min-w-0 relative">
        <p className="text-sm font-black uppercase tracking-widest text-orange-400 mb-1">Daily Challenge</p>
        {!authed ? (
          <p className="text-white font-bold text-xl">Sign in to see today&apos;s challenge</p>
        ) : !challenge ? (
          <p className="text-white font-bold text-xl">No challenge available today</p>
        ) : completed ? (
          <p className="text-white font-bold text-xl">Complete! Next in <span className="text-green-400 font-mono">{countdown}</span></p>
        ) : (
          <>
            <p className="text-white font-bold text-xl truncate">{challenge.title}</p>
            <p className="text-gray-500 text-base mt-1">Resets in <span className="text-orange-400 font-mono font-bold">{countdown}</span> · +{challenge.bonus_points} pts</p>
          </>
        )}
      </div>
      {!authed ? (
        <Link href="/login" className="flex-shrink-0 text-base font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-7 py-3 rounded-xl transition">Sign In</Link>
      ) : completed ? (
        <Link href="/daily-challenge" className="flex-shrink-0 text-base font-black border border-green-500/30 text-green-400 hover:bg-green-500/10 px-7 py-3 rounded-xl transition">View</Link>
      ) : challenge ? (
        <Link href={GAME_LINKS[challenge.game] ?? "/daily-challenge"} className="flex-shrink-0 text-base font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-7 py-3 rounded-xl transition whitespace-nowrap">Play Now →</Link>
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

  if (players.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];
  const AVATAR_COLORS = ["from-violet-500 to-purple-700", "from-blue-500 to-cyan-600", "from-emerald-500 to-teal-700"];

  function flag(code?: string | null) {
    if (!code || code.length !== 2) return "";
    return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
  }

  return (
    <div className="space-y-4">
      {players.map((p, i) => (
        <div key={i} className="flex items-center gap-5 bg-white/3 hover:bg-white/5 border border-white/8 rounded-2xl px-6 py-5 transition">
          <span className="text-3xl w-9 text-center flex-shrink-0">{medals[i]}</span>
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i]} flex items-center justify-center font-black text-white text-lg flex-shrink-0`}>
            {p.player_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-base truncate">{p.player_name} {flag(p.country)}</p>
          </div>
          <p className="text-orange-400 font-black text-base flex-shrink-0">{p.total_score.toLocaleString()} pts</p>
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
      <section className="w-full flex flex-col items-center text-center px-4 sm:px-6 pt-4 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight mb-5 max-w-5xl text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Search. Learn. <span className="relative inline-block">
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Play.</span>
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full opacity-60" />
          </span>
        </h1>

        <p className="text-gray-400 text-xl sm:text-2xl max-w-4xl mb-5 leading-relaxed">
          Your all-in-one English dictionary and word games platform — search any word, then play to master it.
        </p>

        <div className="w-full max-w-4xl mb-2">
          <SearchBox onSearch={handleSearch} />
        </div>

        {mounted && (
          <div className="flex items-center gap-2 flex-wrap justify-center mb-3">
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-widest">Recent Searches:</span>
            {recentSearches.length === 0 && <span className="text-xs text-gray-700">None yet</span>}
            {recentSearches.map(w => (
              <button key={w} onClick={() => handleSearch(w)}
                className="text-xs bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/30 text-gray-400 hover:text-orange-300 px-3 py-1 rounded-full transition flex items-center gap-1">
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {w}
              </button>
            ))}
            {recentSearches.length > 0 && (
              <button onClick={() => { setRecentSearches([]); localStorage.removeItem("recent_searches"); }}
                className="text-[10px] text-gray-600 hover:text-gray-400 transition">clear</button>
            )}
          </div>
        )}

        {/* Popular Games */}
        <div className="w-full max-w-4xl mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-white text-left" style={{ fontFamily: "'Playfair Display', serif" }}>Popular Games</h2>
            <Link href="/games" className="text-sm font-bold text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-400/50 px-4 py-2 rounded-xl transition">All Games →</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {FEATURED_GAMES.map(g => (
              <Link key={g.slug} href={`/games/${g.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/8 hover:border-white/20 bg-[#0a0a12] transition-all duration-300 hover:-translate-y-1 flex flex-col min-h-[200px]">
                <div className={`w-full flex-1 bg-gradient-to-br ${g.color} flex items-center justify-center text-[80px] group-hover:scale-105 transition-transform duration-300`}>
                  {g.icon}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-black text-sm">{g.name}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/8 text-white/80 border border-white/10">{g.badge}</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">{g.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="w-full border-y border-white/5 bg-white/2 py-10 mb-10">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-5xl font-black text-white mb-3">{s.value}</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 space-y-10 pb-16">

        {/* ── DAILY CHALLENGE ── */}
        <section>
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-2">Today</p>
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Daily Challenge</h2>
          </div>
          <DailyChallengeBanner />
        </section>

{/* ── TOP PLAYERS ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-2">Rankings</p>
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Top Players</h2>
            </div>
            <Link href="/leaderboard" className="text-sm font-bold text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-400/50 px-5 py-2.5 rounded-xl transition">
              Full Board →
            </Link>
          </div>
          <TopPlayers />
        </section>

        {/* ── BROWSE CATEGORIES ── */}
        <section>
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-2">Explore</p>
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Browse by Category</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-5 mb-6">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.label} href={`/search?word=${encodeURIComponent(cat.label)}`}
                className="rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1 border block border-white/8 bg-white/3 hover:border-orange-500/50 hover:bg-orange-500/10 hover:shadow-lg hover:shadow-orange-500/10">
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <div className="text-sm font-bold text-gray-300">{cat.label}</div>
              </Link>
            ))}
          </div>

        </section>

        {/* ── CTA ── */}
        {!session?.user && (
          <section className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-12 sm:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none" />
            <p className="text-sm font-black uppercase tracking-widest text-orange-400 mb-4">Get Started</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ready to Play &amp; Learn?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Create a free account to save words, track your scores, and compete on the leaderboard.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-lg px-10 py-4 rounded-2xl transition shadow-lg shadow-orange-500/20">
                Create Free Account
              </Link>
              <Link href="/login" className="border border-white/15 hover:border-white/30 text-gray-300 hover:text-white font-bold text-lg px-10 py-4 rounded-2xl transition">
                Sign In
              </Link>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
