"use client";
import { useEffect, useState, useRef } from "react";
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
  { key: "games_played",  label: "Games Played",  icon: "🎮", grad: "from-blue-600 to-indigo-600",    ring: "ring-blue-500/40",   glow: "shadow-blue-500/20",   pill: "bg-blue-500/10 border-blue-500/25 text-blue-300"   },
  { key: "total_points",  label: "Total Points",  icon: "💰", grad: "from-emerald-500 to-teal-600",   ring: "ring-emerald-500/40",glow: "shadow-emerald-500/20",pill: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"},
  { key: "score",         label: "High Score",    icon: "🏆", grad: "from-yellow-500 to-amber-600",   ring: "ring-yellow-500/40", glow: "shadow-yellow-500/20", pill: "bg-yellow-500/10 border-yellow-500/25 text-yellow-300" },
  { key: "searches",      label: "Word Searches", icon: "🔍", grad: "from-violet-500 to-purple-600",  ring: "ring-violet-500/40", glow: "shadow-violet-500/20", pill: "bg-violet-500/10 border-violet-500/25 text-violet-300" },
  { key: "favorites",     label: "Favorites",     icon: "⭐", grad: "from-pink-500 to-rose-600",      ring: "ring-pink-500/40",   glow: "shadow-pink-500/20",   pill: "bg-pink-500/10 border-pink-500/25 text-pink-300"       },
  { key: "game_specific", label: "Game Badges",   icon: "🏅", grad: "from-orange-500 to-red-500",     ring: "ring-orange-500/40", glow: "shadow-orange-500/20", pill: "bg-orange-500/10 border-orange-500/25 text-orange-300"  },
];

function groupOf(a: Achievement) {
  return a.game_specific ? "game_specific" : a.condition_type;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

function ProgressRing({ pct, size = 110, stroke = 9 }: { pct: number; size?: number; stroke?: number }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#pg)" strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f97316" />
          <stop offset="50%"  stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 flex flex-col gap-3 animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-white/5 mx-auto" />
      <div className="h-3 bg-white/5 rounded-full w-3/4 mx-auto" />
      <div className="h-2.5 bg-white/5 rounded-full w-1/2 mx-auto" />
    </div>
  );
}

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [filter, setFilter]             = useState<"all" | "earned" | "locked">("all");
  const [activeGroup, setActiveGroup]   = useState("all");
  const [mounted, setMounted]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) { setLoading(false); return; }
    fetch("/api/achievements/check", { method: "POST", credentials: "include" })
      .catch(() => {})
      .finally(() => {
        fetch("/api/achievements", { credentials: "include", cache: "no-store" })
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data)) setAchievements(data);
            else if (data?.error) setError(data.error);
          })
          .catch(() => setError("Could not load achievements."))
          .finally(() => setLoading(false));
      });
  }, [session, status]);

  const total       = achievements.length;
  const earnedCount = achievements.filter(a => a.earned_at).length;
  const lockedCount = total - earnedCount;
  const progress    = total > 0 ? Math.round((earnedCount / total) * 100) : 0;
  const recentBadge = achievements
    .filter(a => a.earned_at)
    .sort((a, b) => new Date(b.earned_at!).getTime() - new Date(a.earned_at!).getTime())[0];

  const animEarned = useCountUp(earnedCount, 900);
  const animLocked = useCountUp(lockedCount, 900);

  if (!session?.user && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="relative bg-[#0d0d16] border border-white/8 rounded-3xl p-12 text-center max-w-sm w-full overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.06),transparent_60%)] pointer-events-none" />
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl mx-auto mb-5">🔒</div>
          <h2 className="text-xl font-black text-white mb-2">Sign in to view achievements</h2>
          <p className="text-gray-500 text-sm mb-7">Your badges and progress are saved to your account.</p>
          <Link href="/login" className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-orange-500/25">
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  const visible = achievements
    .filter(a => activeGroup === "all" || groupOf(a) === activeGroup)
    .filter(a => filter === "earned" ? !!a.earned_at : filter === "locked" ? !a.earned_at : true);

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 py-10 md:py-14 relative z-10" suppressHydrationWarning>
      {mounted && (
        <div className="max-w-5xl mx-auto">

          {/* ── Ambient glow ── */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/4 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/3 rounded-full blur-[100px]" />
          </div>

          {/* ── Header ── */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 text-amber-400 text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Your Progress
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Achieve<span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">ments</span>
            </h1>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              Earn badges by playing games, searching words, and hitting milestones.
            </p>
          </div>

          {/* ── Stats ── */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

              {/* Ring */}
              <div className="col-span-2 md:col-span-1 relative overflow-hidden bg-gradient-to-br from-[#18100a] to-[#0d0d16] border border-amber-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.07),transparent_65%)] pointer-events-none" />
                <div className="relative">
                  <ProgressRing pct={progress} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white">{progress}%</span>
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">Done</span>
                  </div>
                </div>
                <p className="text-white font-black text-base">{earnedCount}<span className="text-gray-600 font-normal text-sm"> / {total}</span></p>
              </div>

              {/* Unlocked */}
              <div className="relative overflow-hidden bg-[#0d0d16] border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <span className="text-2xl mb-2">🏆</span>
                <div>
                  <p className="text-3xl font-black text-white">{animEarned}</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Unlocked</p>
                </div>
              </div>

              {/* Locked */}
              <div className="relative overflow-hidden bg-[#0d0d16] border border-white/8 rounded-2xl p-5 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full blur-2xl pointer-events-none" />
                <span className="text-2xl mb-2">🔒</span>
                <div>
                  <p className="text-3xl font-black text-white">{animLocked}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Locked</p>
                </div>
              </div>

              {/* Latest */}
              <div className="col-span-2 md:col-span-1 relative overflow-hidden bg-[#0d0d16] border border-orange-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Latest Badge</p>
                  <span className="text-xl">{recentBadge?.icon ?? "🎯"}</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm leading-tight">{recentBadge?.name ?? "None yet"}</p>
                  <p className="text-gray-600 text-[11px] mt-1">
                    {recentBadge ? fmt(recentBadge.earned_at!) : "Play to earn your first!"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Progress bar ── */}
          {!loading && (
            <div className="bg-[#0d0d16] border border-white/6 rounded-2xl px-5 py-4 mb-8">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-bold text-white">Overall Progress</p>
                <p className="text-xs font-black text-amber-400">{earnedCount} / {total} badges</p>
              </div>
              <div className="h-2.5 bg-white/4 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 relative overflow-hidden transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" />
                </div>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-gray-700">Beginner</span>
                <span className="text-[10px] text-gray-700">Legend</span>
              </div>
            </div>
          )}

          {/* ── Filters ── */}
          {!loading && achievements.length > 0 && (
            <div className="flex flex-col gap-3 mb-8">
              {/* Row 1: All / Earned / Locked */}
              <div className="flex gap-2">
                {(["all", "earned", "locked"] as const).map(f => (
                  <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}
                    activeClass="bg-orange-500/15 border-orange-500/35 text-orange-300">
                    {f === "earned" ? "✓ Earned" : f === "locked" ? "🔒 Locked" : "All"}
                  </FilterChip>
                ))}
              </div>
              {/* Row 2: Category chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <FilterChip active={activeGroup === "all"} onClick={() => setActiveGroup("all")}
                  activeClass="bg-amber-500/15 border-amber-500/35 text-amber-300">
                  All
                  <Count n={achievements.length} />
                </FilterChip>
                {GROUPS.map(g => {
                  const n = achievements.filter(a => groupOf(a) === g.key).length;
                  if (!n) return null;
                  return (
                    <FilterChip key={g.key} active={activeGroup === g.key} onClick={() => setActiveGroup(g.key)}
                      activeClass={g.pill}>
                      {g.icon} {g.label}
                      <Count n={n} />
                    </FilterChip>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4 text-center mb-6">
              <p className="text-red-400 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* ── Skeleton ── */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ── Badge sections ── */}
          {!loading && (
            activeGroup === "all"
              ? GROUPS.map(g => {
                  const items = visible.filter(a => groupOf(a) === g.key);
                  if (!items.length) return null;
                  const gEarned = items.filter(a => a.earned_at).length;
                  return (
                    <section key={g.key} className="mb-14">
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${g.grad} flex items-center justify-center text-base shadow-lg ${g.glow}`}>
                          {g.icon}
                        </div>
                        <div>
                          <h2 className="text-xs font-black uppercase tracking-[0.15em] text-white">{g.label}</h2>
                          <p className="text-[10px] text-gray-600">{gEarned} of {items.length} unlocked</p>
                        </div>
                        <div className="flex-1 h-px bg-white/5 mx-2" />
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${g.grad} transition-all duration-700`}
                            style={{ width: `${items.length ? (gEarned / items.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <BadgeGrid items={items} grad={g.grad} ring={g.ring} glow={g.glow} />
                    </section>
                  );
                })
              : visible.length === 0
                ? <EmptyState />
                : <BadgeGrid items={visible}
                    grad={GROUPS.find(g => g.key === activeGroup)?.grad ?? "from-amber-500 to-orange-500"}
                    ring={GROUPS.find(g => g.key === activeGroup)?.ring ?? "ring-amber-500/40"}
                    glow={GROUPS.find(g => g.key === activeGroup)?.glow ?? "shadow-amber-500/20"} />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function FilterChip({ active, onClick, activeClass, children }: {
  active: boolean; onClick: () => void; activeClass: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-200
        ${active ? activeClass : "bg-white/4 border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15"}`}>
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full font-black">{n}</span>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-24 gap-4">
      <div className="w-20 h-20 rounded-2xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center text-4xl">🏅</div>
      <p className="text-white font-bold">No badges here yet</p>
      <p className="text-gray-600 text-sm">Keep playing to unlock these!</p>
      <Link href="/games" className="mt-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-orange-500/20">
        Play Now →
      </Link>
    </div>
  );
}

function BadgeGrid({ items, grad, ring, glow }: {
  items: Achievement[]; grad: string; ring: string; glow: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((a, i) => <BadgeCard key={a.id} a={a} idx={i} grad={grad} ring={ring} glow={glow} />)}
    </div>
  );
}

function BadgeCard({ a, idx, grad, ring, glow }: {
  a: Achievement; idx: number; grad: string; ring: string; glow: string;
}) {
  const earned = !!a.earned_at;
  return (
    <div
      className={`group relative rounded-2xl flex flex-col items-center text-center p-5 gap-3 cursor-default select-none transition-all duration-300
        ${earned
          ? `bg-[#0f0f1a] border border-white/10 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:${glow}`
          : "bg-[#0a0a10] border border-white/4 opacity-60 hover:opacity-75"
        }`}
      style={{ animationDelay: `${idx * 25}ms` }}
    >
      {/* Earned top glow */}
      {earned && (
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${grad} opacity-60`} />
      )}

      {/* Shine sweep on hover */}
      {earned && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/3 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}

      {/* Icon */}
      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mt-1 transition-all duration-300
        ${earned
          ? `bg-gradient-to-br ${grad} bg-opacity-20 ring-2 ${ring} group-hover:scale-110 group-hover:rotate-3 shadow-xl ${glow}`
          : "bg-white/4 border border-white/6 grayscale"
        }`}>
        {a.icon}
        {earned && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg shadow-emerald-500/40">✓</span>
        )}
      </div>

      {/* Text */}
      <div className="space-y-1 flex-1">
        <p className={`font-black text-sm leading-tight ${earned ? "text-white" : "text-gray-600"}`}>
          {a.name}
        </p>
        <p className={`text-[11px] leading-snug ${earned ? "text-gray-400" : "text-gray-700"}`}>
          {a.description}
        </p>
      </div>

      {/* Footer */}
      {earned ? (
        <div className="flex flex-col items-center gap-0.5 w-full">
          <div className={`w-full h-px bg-gradient-to-r ${grad} opacity-20`} />
          <span className="text-[10px] text-gray-500 pt-1">{fmt(a.earned_at!)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[10px] text-gray-700">
          <span>🔒</span> Locked
        </div>
      )}
    </div>
  );
}
