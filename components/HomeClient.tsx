"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const SearchBox = dynamic(() => import("@/components/SearchBox"), { ssr: false });

// ── Scroll-triggered animation hook ──────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const FEATURED_GAMES = [
  { slug: "wordle",    name: "WordGuess",   icon: "📝", desc: "Guess the 5-letter word in 6 tries!",          color: "from-emerald-600 to-teal-500",  badge: "Teen",  badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { slug: "wordblitz", name: "Word Blitz",  icon: "⚡", desc: "Type as many words as you can in 60 seconds!", color: "from-orange-600 to-amber-500",   badge: "Adult", badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"   },
  { slug: "memory",    name: "Memory Game", icon: "🧠", desc: "Flip cards and find all matching pairs!",       color: "from-blue-600 to-cyan-500",     badge: "Kids",  badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"         },
];

const CATEGORIES = [
  { emoji: "🌿", label: "Nature",   color: "from-green-500/25 to-emerald-600/10",  border: "border-green-500/25",  hover: "hover:border-green-400/60"  },
  { emoji: "❤️", label: "Emotions", color: "from-rose-500/25 to-pink-600/10",      border: "border-rose-500/25",   hover: "hover:border-rose-400/60"   },
  { emoji: "🏛️", label: "History",  color: "from-amber-500/25 to-yellow-600/10",  border: "border-amber-500/25",  hover: "hover:border-amber-400/60"  },
  { emoji: "🔬", label: "Science",  color: "from-cyan-500/25 to-blue-600/10",      border: "border-cyan-500/25",   hover: "hover:border-cyan-400/60"   },
  { emoji: "🎨", label: "Arts",     color: "from-purple-500/25 to-violet-600/10",  border: "border-purple-500/25", hover: "hover:border-purple-400/60" },
  { emoji: "🧠", label: "Mind",     color: "from-indigo-500/25 to-blue-600/10",   border: "border-indigo-500/25", hover: "hover:border-indigo-400/60" },
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
    <div className={`relative overflow-hidden rounded-3xl border w-full
      ${completed ? "border-green-500/25 bg-gradient-to-br from-green-500/8 to-transparent" : "border-orange-500/25 bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-transparent"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.06),transparent_60%)] pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500/60 via-amber-400/40 to-transparent" />

      <div className="relative p-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${completed ? "bg-green-500/15 border border-green-500/25" : "bg-orange-500/15 border border-orange-500/25"}`}>
              {completed ? "✅" : "⚡"}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Daily Challenge</p>
              <p className="text-white font-black text-lg leading-tight">Today&apos;s Mission</p>
            </div>
          </div>
          {!authed ? (
            <Link href="/login" className="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">Sign In</Link>
          ) : completed ? (
            <Link href="/daily-challenge" className="text-xs font-black border border-green-500/30 text-green-400 hover:bg-green-500/10 px-5 py-2 rounded-xl transition">View</Link>
          ) : challenge ? (
            <Link href={GAME_LINKS[challenge.game] ?? "/daily-challenge"} className="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2 rounded-xl transition shadow-lg shadow-orange-500/20 whitespace-nowrap">Play Now →</Link>
          ) : null}
        </div>

        {/* Content */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          {!authed ? (
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔒</div>
              <div>
                <p className="text-white font-bold text-base">Sign in to unlock today&apos;s challenge</p>
                <p className="text-gray-500 text-sm mt-0.5">Earn bonus points by completing daily challenges</p>
              </div>
            </div>
          ) : !challenge ? (
            <p className="text-gray-400 text-sm">No challenge available today</p>
          ) : completed ? (
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎉</div>
              <div>
                <p className="text-white font-bold text-base">Challenge Complete!</p>
                <p className="text-gray-500 text-sm mt-0.5">Next challenge in <span className="text-green-400 font-mono font-bold">{countdown}</span></p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-white font-bold text-base mb-2">{challenge.title}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-gray-500">Resets in <span className="text-orange-400 font-mono font-bold">{countdown}</span></span>
                <span className="text-xs bg-amber-500/15 border border-amber-500/25 text-amber-300 font-bold px-2.5 py-0.5 rounded-full">+{challenge.bonus_points} pts</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TopPlayers() {
  const [players, setPlayers] = useState<{ player_name: string; total_score: number; country?: string | null; age_group?: string | null }[]>([]);

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

  function ageBadge(age_group?: string | null) {
    if (!age_group) return null;
    const map: Record<string, { label: string; cls: string }> = {
      kids:  { label: "🧒 Kids",  cls: "bg-blue-500/15 border-blue-500/30 text-blue-300"    },
      teen:  { label: "🧑 Teen",  cls: "bg-green-500/15 border-green-500/30 text-green-300"  },
      adult: { label: "🔞 Adult", cls: "bg-orange-500/15 border-orange-500/30 text-orange-300" },
    };
    const b = map[age_group];
    if (!b) return null;
    return <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${b.cls}`}>{b.label}</span>;
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
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-gray-600 text-xs">Rank #{i + 1}</p>
              {ageBadge(p.age_group)}
            </div>
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
    const interval = setInterval(() => {
      fetch("/api/home-stats").then(r => r.json()).then(d => setHomeStats(d)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
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

  const statsInView    = useInView();
  const gamesInView    = useInView();
  const dailyInView    = useInView();
  const catInView      = useInView();
  const ctaInView      = useInView();

  return (
    <div className="flex-grow flex flex-col items-center relative z-10" suppressHydrationWarning>

      {/* ── HERO ── */}
      <section className="w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(249,115,22,0.12),transparent)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16 flex flex-col items-center text-center">

          {/* Badge */}
          <div className="animate-fade-in-down inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4" style={{ animationDelay: "0.1s" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Search. Learn. Play.
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.05] mb-4 max-w-4xl" style={{ animationDelay: "0.2s", fontFamily: "'Playfair Display', serif" }}>
            Search. Learn &amp;{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">Play.</span>
            </span>
          </h1>

          <p className="animate-fade-in-up text-gray-400 text-xl sm:text-2xl max-w-2xl mb-4 leading-relaxed" style={{ animationDelay: "0.3s" }}>
            Look up words instantly, then reinforce your learning through 45+ interactive games designed for all ages.
          </p>

          {/* Search */}
          <div className="animate-fade-in-up w-full max-w-3xl mb-2" style={{ animationDelay: "0.4s" }}>
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

          {/* Popular Games */}
          <div ref={gamesInView.ref} className={`w-full max-w-5xl transition-all duration-700 ${gamesInView.visible ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"}`}>
            <div className="flex items-end justify-between mb-3">
              <div className="text-left pl-0">
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
                  <div className={`relative h-56 bg-gradient-to-br ${g.color} flex items-center justify-center overflow-hidden`}>
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

          {/* Stats row */}
          <div ref={statsInView.ref} className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16">
            {[
              { value: "45",  label: "Word Games",   icon: "🎮", desc: "Games to play",      color: "from-orange-500/20 to-amber-500/5",   border: "border-orange-500/25",  glow: "shadow-orange-500/20" },
              { value: homeStats ? homeStats.players.toLocaleString() : "—", label: "Active Players", icon: "👥", desc: "Registered users",  color: "from-violet-500/20 to-purple-500/5",  border: "border-violet-500/25",  glow: "shadow-violet-500/20" },
              { value: "3",   label: "Age Groups",   icon: "🎯", desc: "Kids, Teen, Adult", color: "from-cyan-500/20 to-blue-500/5",       border: "border-cyan-500/25",    glow: "shadow-cyan-500/20"    },
              { value: "Free", label: "Always Free", icon: "✨", desc: "No cost, ever",     color: "from-emerald-500/20 to-teal-500/5",  border: "border-emerald-500/25", glow: "shadow-emerald-500/20" },
            ].map((s, i) => (
              <div key={s.label}
                className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br ${s.color} ${s.border} px-6 py-8 flex flex-col items-center gap-3 hover:shadow-xl ${s.glow} transition-all duration-300 hover:-translate-y-1.5 ${statsInView.visible ? "animate-count-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 120}ms` }}>
                {/* Shine overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                {/* Top accent */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full bg-gradient-to-r ${s.color.replace('/20', '/80').replace('/5', '/40')}`} />
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                <p className="text-5xl font-black text-white tracking-tight">{s.value}</p>
                <div className="text-center">
                  <p className="text-sm font-black text-gray-300 uppercase tracking-widest">{s.label}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5 font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DAILY CHALLENGE + TOP PLAYERS ── */}
      <section ref={dailyInView.ref} className={`w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12 transition-all duration-700 ${dailyInView.visible ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"}`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Daily Challenge — wider */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="text-left">
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
        <div ref={catInView.ref} className={`max-w-5xl mx-auto px-4 sm:px-6 py-14 transition-all duration-700 ${catInView.visible ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-2">Explore</p>
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Browse by Topic</h2>
              <p className="text-gray-500 text-sm mt-1">Search words by category and discover new vocabulary</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.label} href={`/search?word=${encodeURIComponent(cat.label)}`}
                className={`group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 border bg-gradient-to-br ${cat.color} ${cat.border} ${cat.hover} hover:shadow-xl hover:shadow-black/30 ${catInView.visible ? "animate-scale-in" : "opacity-0"}`}
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="text-4xl mb-3 group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300">{cat.emoji}</div>
                <div className="text-sm font-black text-gray-200 group-hover:text-white transition-colors tracking-wide">{cat.label}</div>
                <div className="mt-2 text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors font-semibold uppercase tracking-widest">Explore →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!session?.user && (
        <section ref={ctaInView.ref} className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 transition-all duration-700 ${ctaInView.visible ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"}`}>
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/20">
            {/* Backgrounds */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.1),transparent_70%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-transparent" />
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-float" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: "2s" }} />
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />

            <div className="relative px-8 py-14 sm:px-16 sm:py-16 flex flex-col items-center text-center gap-8">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Get Started — It&apos;s Free
              </div>

              {/* Headline */}
              <div>
                <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Ready to Play
                </h2>
                <h2 className="text-5xl sm:text-6xl font-black leading-tight bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
                  &amp; Learn?
                </h2>
                <p className="text-gray-400 text-base leading-relaxed max-w-lg mx-auto mt-4">
                  Create a free account to save words, track your scores, and compete on the leaderboard.
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
                {[
                  { icon: "📚", title: "Save Words",       desc: "Bookmark favorites"       },
                  { icon: "🏆", title: "Track Scores",     desc: "Achievements & history"   },
                  { icon: "🌍", title: "Leaderboard",     desc: "Compete globally"         },
                  { icon: "🎮", title: "45 Games",        desc: "All ages, all levels"     },
                ].map((f, i) => (
                  <div key={f.title}
                    className="group relative overflow-hidden bg-white/3 hover:bg-white/6 border border-white/8 hover:border-orange-500/30 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{f.icon}</span>
                    <p className="text-white font-black text-sm">{f.title}</p>
                    <p className="text-gray-600 text-[11px] font-medium">{f.desc}</p>
                    <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-[9px] font-black">✓</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <Link href="/signup"
                  className="w-full text-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base px-8 py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 hover:shadow-orange-500/50">
                  Create Free Account
                </Link>
                <Link href="/login"
                  className="text-center border border-white/15 hover:border-orange-500/40 bg-white/3 hover:bg-white/6 text-gray-300 hover:text-white font-bold text-base px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5">
                  Sign In
                </Link>
              </div>

            </div>
          </div>
        </section>
      )}

    </div>
  );
}
