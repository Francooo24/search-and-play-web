"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  game_specific: string | null;
  earned_at: string | null;
}

const GROUPS = [
  { key: "games_played",  label: "Games Played",  icon: "🎮", color: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-500/10"   },
  { key: "total_points",  label: "Total Points",  icon: "💰", color: "text-emerald-400",border: "border-emerald-500/30",bg: "bg-emerald-500/10"},
  { key: "score",         label: "High Score",    icon: "🏆", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
  { key: "searches",      label: "Word Searches", icon: "🔍", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  { key: "favorites",     label: "Favorites",     icon: "⭐", color: "text-pink-400",   border: "border-pink-500/30",   bg: "bg-pink-500/10"   },
  { key: "game_specific", label: "Game Badges",   icon: "🏅", color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" },
];

function groupOf(a: Achievement) {
  return a.game_specific ? "game_specific" : a.condition_type;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function AnimatedProgressRing({ pct, size = 120, stroke = 8 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#ring-grad)" strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [filter, setFilter]             = useState<"all" | "earned" | "locked">("all");
  const [activeGroup, setActiveGroup]   = useState<string>("all");
  const [mounted, setMounted]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) { setLoading(false); return; }
    fetch("/api/achievements", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAchievements(data);
        else if (data?.error) setError(data.error);
      })
      .catch(() => setError("Could not load achievements."))
      .finally(() => setLoading(false));
  }, [session, status]);

  const total        = achievements.length;
  const earnedCount  = achievements.filter(a => a.earned_at).length;
  const lockedCount  = total - earnedCount;
  const progress     = total > 0 ? Math.round((earnedCount / total) * 100) : 0;
  const recentBadge  = achievements.filter(a => a.earned_at).sort((a, b) => new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime())[0];

  if (!session?.user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-[#0f0f18] border border-white/8 rounded-3xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl mx-auto mb-5">🔒</div>
          <h2 className="text-2xl font-black text-white mb-2">Sign in to view achievements</h2>
          <p className="text-gray-500 text-sm mb-6">Your badges and progress are saved to your account.</p>
          <Link href="/login" className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const visibleAchievements = achievements
    .filter(a => activeGroup === "all" || groupOf(a) === activeGroup)
    .filter(a => {
      if (filter === "earned") return !!a.earned_at;
      if (filter === "locked") return !a.earned_at;
      return true;
    });

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 py-8 md:py-12 w-full min-h-screen relative z-10" suppressHydrationWarning>
      {mounted && <>

      {/* ── Hero ── */}
      <div className="w-full max-w-5xl mb-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Your Progress
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight leading-none mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Achieve<span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">ments</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Earn badges by playing games, searching words, and hitting milestones.
          </p>
        </div>

        {/* ── Stats Row ── */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Progress Ring Card */}
            <div className="col-span-2 md:col-span-1 relative overflow-hidden bg-gradient-to-br from-[#1a1008] to-[#0f0f18] border border-amber-500/25 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-xl shadow-amber-500/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_60%)] pointer-events-none" />
              <div className="relative">
                <AnimatedProgressRing pct={progress} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{progress}%</span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Done</span>
                </div>
              </div>
              <p className="text-white font-black text-lg">{earnedCount}<span className="text-gray-500 font-normal text-sm"> / {total}</span></p>
            </div>

            {/* Earned */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/25 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-2xl mb-3">🏆</div>
              <div>
                <p className="text-4xl font-black text-white mb-1">{earnedCount}</p>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Unlocked</p>
              </div>
            </div>

            {/* Locked */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-500/10 to-gray-500/5 border border-slate-500/20 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-500/15 border border-slate-500/25 flex items-center justify-center text-2xl mb-3">🔒</div>
              <div>
                <p className="text-4xl font-black text-white mb-1">{lockedCount}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Locked</p>
              </div>
            </div>

            {/* Most Recent */}
            <div className="col-span-2 md:col-span-1 relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/25 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-orange-400 font-black uppercase tracking-widest">Latest Badge</p>
                <span className="text-xl">{recentBadge?.icon ?? "🎯"}</span>
              </div>
              <div>
                <p className="text-white font-black text-base leading-tight">{recentBadge?.name ?? "None yet"}</p>
                <p className="text-gray-500 text-xs mt-1">{recentBadge ? fmt(recentBadge.earned_at!) : "Play to earn your first!"}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Progress Bar ── */}
        {!loading && (
          <div className="bg-[#0a0a12] border border-white/8 rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white">Overall Progress</p>
              <p className="text-sm font-black text-amber-400">{earnedCount} / {total} badges</p>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-600">Beginner</p>
              <p className="text-xs text-gray-600">Master</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl">

        {/* ── Controls ── */}
        {!loading && achievements.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Group filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
              <button onClick={() => setActiveGroup("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeGroup === "all"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-white/5 border-white/8 text-gray-500 hover:text-gray-300"
                }`}>
                All <span className="ml-1 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{achievements.length}</span>
              </button>
              {GROUPS.map(g => {
                const count = achievements.filter(a => groupOf(a) === g.key).length;
                if (count === 0) return null;
                return (
                  <button key={g.key} onClick={() => setActiveGroup(g.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                      activeGroup === g.key
                        ? `${g.bg} ${g.border} ${g.color}`
                        : "bg-white/5 border-white/8 text-gray-500 hover:text-gray-300"
                    }`}>
                    <span>{g.icon}</span>
                    {g.label}
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Earned/Locked filter */}
            <div className="flex gap-2 flex-shrink-0">
              {(["all", "earned", "locked"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    filter === f
                      ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                      : "bg-white/5 border-white/8 text-gray-500 hover:text-gray-300"
                  }`}>
                  {f === "earned" ? "✓ Earned" : f === "locked" ? "🔒 Locked" : "All"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center mb-6">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/3 animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Badge Groups ── */}
        {!loading && (
          activeGroup === "all"
            ? GROUPS.map(group => {
                const items = visibleAchievements.filter(a => groupOf(a) === group.key);
                if (items.length === 0) return null;
                const groupEarned = items.filter(a => a.earned_at).length;
                return (
                  <div key={group.key} className="mb-12">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-9 h-9 rounded-xl ${group.bg} border ${group.border} flex items-center justify-center text-lg`}>
                        {group.icon}
                      </div>
                      <div>
                        <h2 className={`text-sm font-black uppercase tracking-widest ${group.color}`}>{group.label}</h2>
                        <p className="text-gray-600 text-xs">{groupEarned} of {items.length} unlocked</p>
                      </div>
                      <div className="flex-1 h-px bg-white/5 ml-2" />
                      <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${group.bg.replace("/10", "/60")}`}
                          style={{ width: `${items.length > 0 ? (groupEarned / items.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <BadgeGrid items={items} />
                  </div>
                );
              })
            : (() => {
                if (visibleAchievements.length === 0) return (
                  <div className="flex flex-col items-center py-20 gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl">🏅</div>
                    <p className="text-white font-bold text-lg">No badges here yet</p>
                    <p className="text-gray-500 text-sm">Keep playing to unlock these badges!</p>
                  </div>
                );
                return <BadgeGrid items={visibleAchievements} />;
              })()
        )}
      </div>
      </>}
    </div>
  );
}

function BadgeGrid({ items }: { items: Achievement[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((a, idx) => {
        const isEarned = !!a.earned_at;
        return (
          <div key={a.id}
            className={`relative rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-300 group cursor-default
              ${isEarned
                ? "bg-gradient-to-b from-amber-500/12 via-orange-500/5 to-transparent border border-amber-500/30 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(251,191,36,0.15)] hover:border-amber-400/50"
                : "bg-[#0a0a12] border border-white/5 hover:border-white/10"
              }`}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            {/* Glow for earned */}
            {isEarned && (
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_60%)] pointer-events-none" />
            )}

            {/* Rank number */}
            <div className={`absolute top-3 left-3 text-[10px] font-black px-1.5 py-0.5 rounded-md ${
              isEarned ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-700"
            }`}>
              #{a.id}
            </div>

            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 mt-2
              ${isEarned
                ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-amber-500/10"
                : "bg-white/4 border border-white/8 grayscale opacity-30"
              }`}>
              {a.icon}
            </div>

            {/* Text */}
            <div className="space-y-1">
              <p className={`font-black text-sm leading-tight ${isEarned ? "text-white" : "text-gray-600"}`}>
                {a.name}
              </p>
              <p className={`text-[11px] leading-snug ${isEarned ? "text-gray-400" : "text-gray-700"}`}>
                {a.description}
              </p>
            </div>

            {/* Status badge */}
            {isEarned ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/25 px-3 py-1 rounded-full flex items-center gap-1">
                  <span>✓</span> Unlocked
                </span>
                <span className="text-[9px] text-gray-600">{fmt(a.earned_at!)}</span>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-gray-700 bg-white/3 border border-white/6 px-3 py-1 rounded-full flex items-center gap-1">
                <span>🔒</span> Locked
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
