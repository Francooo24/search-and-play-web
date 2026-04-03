"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const AVATAR_COLORS = [
  "from-violet-500 to-purple-700", "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-700",  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-700",     "from-indigo-500 to-blue-700",
];

const GAME_EMOJI: Record<string, string> = {
  "Tic Tac Toe": "⭕", "Memory Game": "🧠", "Hangman": "🪢", "WordGuess": "📝",
  "Word Search": "🔍", "Spelling Bee": "🐝", "Crossword": "📋", "Cryptogram": "🔐",
  "Word Blitz": "⚡", "Anagram Master": "🔀", "Trivia Blitz": "🧠", "Flag Quiz": "🗺️",
  "Word Scramble": "🔀", "Synonym Match": "🔄", "Word Puzzle": "🔤", "Wordle": "📝",
};

function flag(code?: string | null) {
  if (!code || code.length !== 2) return "";
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Profile = {
  player_name: string; country: string | null; joined_at: string; age_group: string | null;
  avatar_url: string | null;
  total_games: number; total_points: number; highest_score: number;
  game_stats: { game: string; games_played: number; best_score: number; total_score: number }[];
  achievements: { icon: string; name: string; description: string }[];
};

export default function PlayerProfilePage() {
  const { name } = useParams<{ name: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/players/${encodeURIComponent(name)}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) setProfile(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [name]);

  const avatarColor = AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const ageBadge = profile?.age_group === "kids"
    ? { label: "🧒 Kids",  cls: "bg-blue-500/15 border-blue-500/30 text-blue-300" }
    : profile?.age_group === "teen"
    ? { label: "🧑 Teen",  cls: "bg-green-500/15 border-green-500/30 text-green-300" }
    : profile?.age_group === "adult"
    ? { label: "🔞 Adult", cls: "bg-orange-500/15 border-orange-500/30 text-orange-300" }
    : null;

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="flex-grow flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-5xl">👤</p>
      <p className="text-white font-bold text-xl">Player not found</p>
      <Link href="/leaderboard" className="text-orange-400 hover:text-orange-300 text-sm transition">← Back to Leaderboard</Link>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="flex-grow w-full max-w-3xl mx-auto px-4 py-10">
      <Link href="/leaderboard" className="text-gray-400 hover:text-white transition text-sm mb-8 inline-block">← Back to Leaderboard</Link>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-500/10 to-slate-900" />
        <div className="relative px-6 py-8 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className={`w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br ${avatarColor} flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white/10 flex-shrink-0`}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.player_name} className="w-full h-full object-cover" />
              : profile.player_name.charAt(0).toUpperCase()
            }
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {profile.player_name} {flag(profile.country)}
            </h1>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {ageBadge && <span className={`text-xs border px-3 py-1 rounded-full font-semibold ${ageBadge.cls}`}>{ageBadge.label}</span>}
              <span className="text-xs bg-white/8 border border-white/10 text-gray-400 px-3 py-1 rounded-full">
                Joined {fmt(profile.joined_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Games",  value: profile.total_games.toLocaleString(),   icon: "🎮", color: "from-orange-500/20", border: "border-orange-500/20", text: "text-orange-400" },
          { label: "Points", value: profile.total_points.toLocaleString(),  icon: "⚡", color: "from-amber-500/20",  border: "border-amber-500/20",  text: "text-amber-400"  },
          { label: "Best",   value: profile.highest_score.toLocaleString(), icon: "🏆", color: "from-yellow-500/20", border: "border-yellow-500/20", text: "text-yellow-400" },
        ].map(({ label, value, icon, color, border, text }) => (
          <div key={label} className={`relative rounded-2xl p-4 bg-gradient-to-br ${color} to-transparent border ${border} overflow-hidden`}>
            <div className="absolute top-2 right-2 text-2xl opacity-20">{icon}</div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-black ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Top Games */}
      {profile.game_stats.length > 0 && (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-white/8">
            <p className="text-sm font-bold text-white">🎮 Top Games</p>
          </div>
          <div className="divide-y divide-white/5">
            {profile.game_stats.map((g, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition">
                <span className="text-xl flex-shrink-0">{GAME_EMOJI[g.game] ?? "🎮"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{g.game}</p>
                  <p className="text-xs text-gray-500">{g.games_played} plays</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-white">{g.best_score.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">best</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {profile.achievements.length > 0 && (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/8">
            <p className="text-sm font-bold text-white">🏆 Achievements</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {profile.achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
                <span className="text-2xl flex-shrink-0">{a.icon}</span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{a.name}</p>
                  <p className="text-xs text-amber-400 truncate">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
