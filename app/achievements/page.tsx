"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface EarnedAchievement {
  icon: string;
  name: string;
  description: string;
  earned_at: string;
}

const SHARED_ACHIEVEMENTS = [
  // Games Played
  { icon: "🎮", name: "First Steps",       description: "Play your first game",                group: "games_played" },
  { icon: "🚀", name: "Getting Started",   description: "Play 10 games",                       group: "games_played" },
  { icon: "🎯", name: "Regular Player",    description: "Play 25 games",                       group: "games_played" },
  { icon: "⭐", name: "Dedicated Player",  description: "Play 50 games",                       group: "games_played" },
  { icon: "🔥", name: "Game Enthusiast",   description: "Play 100 games",                      group: "games_played" },
  { icon: "👑", name: "Game Master",       description: "Play 200 games",                      group: "games_played" },
  { icon: "🏅", name: "Legend",            description: "Play 500 games",                      group: "games_played" },
  // Total Points
  { icon: "💡", name: "Point Starter",     description: "Earn 100 total points",               group: "score" },
  { icon: "💰", name: "Point Collector",   description: "Earn 500 total points",               group: "score" },
  { icon: "💎", name: "Point Hoarder",     description: "Earn 1,000 total points",             group: "score" },
  { icon: "⚡", name: "Point Machine",     description: "Earn 5,000 total points",             group: "score" },
  { icon: "🌟", name: "Point Master",      description: "Earn 10,000 total points",            group: "score" },
  { icon: "🏆", name: "Point Legend",      description: "Earn 50,000 total points",            group: "score" },
  // High Score
  { icon: "🧠", name: "Sharp Mind",        description: "Score 50+ in a single game",          group: "highscore" },
  { icon: "🎖️", name: "High Scorer",       description: "Score 100+ in a single game",         group: "highscore" },
  { icon: "🏹", name: "Score Hunter",      description: "Score 150+ in a single game",         group: "highscore" },
  { icon: "💥", name: "Elite Scorer",      description: "Score 200+ in a single game",         group: "highscore" },
  // Daily Challenge
  { icon: "📅", name: "Daily Starter",     description: "Complete your first daily challenge", group: "daily" },
  { icon: "🔥", name: "Daily Streak 3",    description: "Complete 3 daily challenges",         group: "daily" },
  { icon: "📆", name: "Daily Streak 7",    description: "Complete 7 daily challenges",         group: "daily" },
  { icon: "🗓️", name: "Daily Streak 30",   description: "Complete 30 daily challenges",        group: "daily" },
  // Word Search
  { icon: "🔍", name: "First Search",      description: "Search your first word",              group: "searches" },
  { icon: "📖", name: "Word Explorer",     description: "Search 10 words",                     group: "searches" },
  { icon: "🗺️", name: "Word Hunter",       description: "Search 50 words",                     group: "searches" },
  { icon: "📚", name: "Dictionary Pro",    description: "Search 100 words",                    group: "searches" },
  // Favorites
  { icon: "⭐", name: "First Favorite",    description: "Save your first word",                group: "favorites" },
  { icon: "📌", name: "Word Collector",    description: "Save 10 favorite words",              group: "favorites" },
  { icon: "🗂️", name: "Word Hoarder",      description: "Save 25 favorite words",              group: "favorites" },
];

const KIDS_ACHIEVEMENTS = [
  { icon: "🐾", name: "Animal Whisperer",  description: "Score 100+ in Animal Match",          group: "game_badges" },
  { icon: "🎨", name: "Color Expert",      description: "Score 100+ in Color Words",           group: "game_badges" },
  { icon: "➕", name: "Math Whiz",         description: "Score 100+ in Simple Math",           group: "game_badges" },
  { icon: "🔢", name: "Counting Pro",      description: "Score 100+ in Count & Click",         group: "game_badges" },
  { icon: "🎵", name: "Rhyme Master",      description: "Score 100+ in Rhyme Time",            group: "game_badges" },
  { icon: "🔷", name: "Shape Shifter",     description: "Score 100+ in Shape Match",           group: "game_badges" },
  { icon: "🎈", name: "Balloon Buster",    description: "Score 50+ in Balloon Pop",            group: "game_badges" },
  { icon: "🎪", name: "Odd Spotter",       description: "Score 100+ in Odd One Out",           group: "game_badges" },
  { icon: "🧠", name: "Memory Champion",   description: "Score 100+ in Memory Game",           group: "game_badges" },
  { icon: "⭕", name: "Tic-Tac-Toe Pro",   description: "Win 3 games in Tic Tac Toe",          group: "game_badges" },
];

const TEEN_ACHIEVEMENTS = [
  { icon: "🪢", name: "Hangman Hero",      description: "Score 100+ in Hangman",               group: "game_badges" },
  { icon: "📝", name: "Word Guesser",      description: "Score 50+ in WordGuess",              group: "game_badges" },
  { icon: "🔍", name: "Word Finder",       description: "Score 100+ in Word Search",           group: "game_badges" },
  { icon: "🐝", name: "Spelling Champ",    description: "Score 100+ in Spelling Bee",          group: "game_badges" },
  { icon: "🔄", name: "Synonym Sage",      description: "Score 100+ in Synonym Match",         group: "game_badges" },
  { icon: "🔀", name: "Scramble King",     description: "Score 100+ in Word Scramble",         group: "game_badges" },
  { icon: "🧠", name: "Trivia Ace",        description: "Score 100+ in Trivia Blitz",          group: "game_badges" },
  { icon: "🗺️", name: "Flag Expert",       description: "Score 100+ in Flag Quiz",             group: "game_badges" },
  { icon: "🧮", name: "Math Racer",        description: "Score 100+ in Math Race",             group: "game_badges" },
  { icon: "✍️", name: "Grammar Guru",      description: "Score 100+ in Sentence Fix",          group: "game_badges" },
];

const ADULT_ACHIEVEMENTS = [
  { icon: "📋", name: "Crossword Expert",  description: "Score 100+ in Crossword",             group: "game_badges" },
  { icon: "🔐", name: "Code Breaker",      description: "Score 100+ in Cryptogram",            group: "game_badges" },
  { icon: "⚡", name: "Word Blitzer",      description: "Score 100+ in Word Blitz",            group: "game_badges" },
  { icon: "🔀", name: "Anagram Ace",       description: "Score 100+ in Anagram Master",        group: "game_badges" },
  { icon: "⚔️", name: "Duel Champion",     description: "Score 100+ in Word Duel",             group: "game_badges" },
  { icon: "🧠", name: "Trivia Master",     description: "Score 100+ in Speed Trivia",          group: "game_badges" },
  { icon: "📚", name: "Vocab Virtuoso",    description: "Score 100+ in Vocabulary Quiz",       group: "game_badges" },
  { icon: "💬", name: "Idiom Insider",     description: "Score 100+ in Idiom Challenge",       group: "game_badges" },
  { icon: "🔍", name: "Logic Lord",        description: "Score 100+ in Logic Grid",            group: "game_badges" },
  { icon: "🧩", name: "Deduction King",    description: "Score 100+ in Deduction",             group: "game_badges" },
];

function getAchievements(ageGroup: string | null) {
  const gameBadges =
    ageGroup === "kids"  ? KIDS_ACHIEVEMENTS  :
    ageGroup === "teen"  ? TEEN_ACHIEVEMENTS  :
    ageGroup === "adult" ? ADULT_ACHIEVEMENTS :
    [...KIDS_ACHIEVEMENTS, ...TEEN_ACHIEVEMENTS, ...ADULT_ACHIEVEMENTS];
  return [...SHARED_ACHIEVEMENTS, ...gameBadges];
}

const GROUPS = [
  { key: "games_played", label: "Games Played",    icon: "🎮" },
  { key: "score",        label: "Total Points",    icon: "💰" },
  { key: "highscore",    label: "High Score",      icon: "🏆" },
  { key: "daily",        label: "Daily Challenge", icon: "📅" },
  { key: "searches",     label: "Word Searches",   icon: "🔍" },
  { key: "favorites",    label: "Favorites",       icon: "⭐" },
  { key: "game_badges",  label: "Game Badges",     icon: "🏅" },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke="url(#grad)" strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const [earned, setEarned]   = useState<EarnedAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"all" | "earned" | "locked">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) { setLoading(false); return; }
    fetch("/api/achievements")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEarned(data); })
      .finally(() => setLoading(false));
  }, [session, status]);

  const userAge         = (session?.user as any)?.age ?? null;
  const ageGroup        = !session?.user ? null : userAge === null ? "adult" : userAge <= 12 ? "kids" : userAge <= 17 ? "teen" : "adult";
  const ALL_ACHIEVEMENTS = getAchievements(ageGroup ?? "adult");

  const earnedNames  = new Set(earned.map(e => e.name));
  const earnedMap    = Object.fromEntries(earned.map(e => [e.name, e.earned_at]));
  const total        = loading ? 0 : ALL_ACHIEVEMENTS.length;
  const earnedCount  = loading ? 0 : ALL_ACHIEVEMENTS.filter(a => earnedNames.has(a.name)).length;
  const progress     = total > 0 ? Math.min(100, Math.round((earnedCount / total) * 100)) : 0;

  if (!mounted) return null;

  if (!session?.user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-[#0f0f18] border border-white/8 rounded-3xl p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mx-auto mb-5">
            🔒
          </div>
          <h2 className="text-xl font-black text-white mb-2">Sign in to view achievements</h2>
          <p className="text-gray-500 text-sm mb-6">Your badges and progress are saved to your account.</p>
          <Link href="/login" className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 py-10 md:py-14 w-full min-h-screen">

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Your Progress</p>
        <h1
          className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Achieve<span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">ments</span>
        </h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Earn badges by playing games and hitting milestones.
        </p>
      </div>

      <div className="w-full max-w-4xl">

        {/* ── Summary Card ── */}
        <div className="bg-[#0f0f18] border border-white/8 rounded-3xl p-6 md:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Progress ring */}
          <div className="relative flex-shrink-0">
            <ProgressRing pct={loading ? 0 : progress} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white leading-none">{loading ? "—" : `${progress}%`}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-black text-xl">{earnedCount} <span className="text-gray-500 font-normal text-base">/ {total} unlocked</span></p>
                <p className="text-gray-500 text-xs mt-0.5">Keep playing to unlock more badges</p>
              </div>
              <div className="hidden sm:flex gap-2">
                {(["all", "earned", "locked"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                      ${filter === f
                        ? "bg-orange-500/20 border border-orange-500/40 text-orange-300"
                        : "bg-white/5 border border-white/8 text-gray-500 hover:text-gray-300"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-2 bg-white/6 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                style={{ width: `${loading ? 0 : progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mobile filter */}
        <div className="flex sm:hidden gap-2 mb-6">
          {(["all", "earned", "locked"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all
                ${filter === f
                  ? "bg-orange-500/20 border border-orange-500/40 text-orange-300"
                  : "bg-white/5 border border-white/8 text-gray-500"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Badge Groups ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
          </div>
        ) : (
          GROUPS.map(group => {
            const groupLabel = group.key === "game_badges"
              ? ageGroup === "kids"  ? "🧒 Kids Game Badges"
              : ageGroup === "teen"  ? "🧑 Teen Game Badges"
              : "🔞 Adult Game Badges"
              : group.label;
            const items = ALL_ACHIEVEMENTS
              .filter(a => a.group === group.key)
              .filter(a => {
                if (filter === "earned") return earnedNames.has(a.name);
                if (filter === "locked") return !earnedNames.has(a.name);
                return true;
              });

            if (items.length === 0) return null;

            return (
              <div key={group.key} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base">{group.icon}</span>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">{groupLabel}</h2>
                  <div className="flex-1 h-px bg-white/6 ml-2" />
                  <span className="text-xs text-gray-600">
                    {items.filter(a => earnedNames.has(a.name)).length}/{items.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map(a => {
                    const isEarned = earnedNames.has(a.name);
                    return (
                      <div
                        key={a.name}
                        className={`relative rounded-2xl p-5 flex flex-col items-center text-center gap-2 transition-all duration-300 group
                          ${isEarned
                            ? "bg-gradient-to-b from-amber-500/10 to-orange-500/5 border border-amber-500/25 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-[0_8px_30px_rgba(251,191,36,0.12)]"
                            : "bg-[#0a0a12] border border-white/5"
                          }`}
                      >
                        {/* Earned glow */}
                        {isEarned && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                        )}

                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all
                          ${isEarned
                            ? "bg-amber-500/15 group-hover:scale-110"
                            : "bg-white/4 grayscale opacity-40"
                          }`}>
                          {a.icon}
                        </div>

                        <div className="space-y-0.5">
                          <p className={`font-bold text-sm leading-tight ${isEarned ? "text-white" : "text-gray-600"}`}>
                            {a.name}
                          </p>
                          <p className={`text-xs leading-snug ${isEarned ? "text-gray-400" : "text-gray-700"}`}>
                            {a.description}
                          </p>
                        </div>

                        {isEarned ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mt-1">
                            ✓ {fmt(earnedMap[a.name])}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-700 bg-white/3 border border-white/6 px-2 py-0.5 rounded-full mt-1">
                            Locked
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
