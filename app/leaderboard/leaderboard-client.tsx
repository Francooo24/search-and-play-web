"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Period = "all" | "daily" | "weekly" | "monthly";
type Tab    = "leaderboard" | "rankings" | "pergame" | "improved";

interface LeaderboardPlayer { player_name: string; user_id: number | null; total_score: number; last_played: string; game?: string | null; age_group?: string | null; country?: string | null; total_games?: number; }
interface GameTopPlayer     { player_name: string; score: number; created_at: string; country?: string | null; }
interface GameEntry         { player_name: string; best_score: number; plays: number; last_played: string; country?: string | null; }
interface RankTier          { name: string; min: number; max: number; icon: string; color: string; bg: string; border: string; desc: string; }
interface RankedPlayer      { id: number; player_name: string; total_points: number; total_games: number; avg_score: number; last_played: string; tier: RankTier; progress: number; age_group?: string | null; country?: string | null; }

const PERIODS: { key: Period; label: string }[] = [
  { key: "all",     label: "All Time"   },
  { key: "daily",   label: "Today"      },
  { key: "weekly",  label: "This Week"  },
  { key: "monthly", label: "This Month" },
];

const AVATAR_COLORS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-700",
  "from-indigo-500 to-blue-700",
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function flag(code?: string | null) {
  if (!code || code.length !== 2) return "";
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function lastSeenDot(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const day  = 86_400_000;
  if (diff < day)       return <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block flex-shrink-0" title="Active today" />;
  if (diff < day * 7)   return <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block flex-shrink-0" title="Active this week" />;
  return                       <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block flex-shrink-0" title="Inactive" />;
}

function Avatar({ name, size = "md" }: { name: string; size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
  const sz = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" }[size];
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-black text-white flex-shrink-0 ring-2 ring-white/10`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      <p className="text-gray-600 text-xs uppercase tracking-widest">Loading</p>
    </div>
  );
}

function Empty({ msg = "No data yet", cta = true }: { msg?: string; cta?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">🏆</div>
      <p className="text-gray-400 font-semibold">{msg}</p>
      {cta && <Link href="/games" className="mt-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-orange-500/20">Start Playing →</Link>}
    </div>
  );
}

function AgeBadge({ age_group }: { age_group?: string | null }) {
  if (!age_group) return null;
  const styles = age_group === "kids"
    ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
    : age_group === "teen"
    ? "bg-green-500/15 border-green-500/30 text-green-300"
    : "bg-orange-500/15 border-orange-500/30 text-orange-300";
  const label = age_group === "kids" ? "🧒 Kids" : age_group === "teen" ? "🧑 Teen" : "🔞 18+";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${styles}`}>
      {label}
    </span>
  );
}

// ── Leaderboard Tab ────────────────────────────────────────────────────────
function LeaderboardTab() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [period, setPeriod]         = useState<Period>("all");
  const [gameFilter, setGameFilter] = useState("");
  const [players, setPlayers]       = useState<LeaderboardPlayer[]>([]);
  const [gameTypes, setGameTypes]   = useState<string[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]       = useState(false);
  const [offset, setOffset]         = useState(0);
  const [error, setError]           = useState("");
  const [myRank, setMyRank] = useState<{ rank: number; total: number; score: number; best: number; best_game: string | null; streak: number } | null>(null);
  const [search, setSearch]         = useState("");
  const [copied, setCopied]         = useState(false);

  const handleShare = () => {
    if (!myRank) return;
    const text = `🏆 I'm ranked #${myRank.rank} out of ${myRank.total} players on Search & Play with ${myRank.score.toLocaleString()} points! Can you beat me? 🎮`;
    const url  = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: "Search & Play Leaderboard", text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  useEffect(() => {
    fetch("/api/leaderboard/my-rank", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (d.rank) setMyRank(d); })
      .catch(() => {});
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async (off = 0) => {
    off === 0 ? setLoading(true) : setLoadingMore(true);
    setError("");
    try {
      const p = new URLSearchParams({ period, offset: String(off) });
      if (gameFilter) p.append("game", gameFilter);
      const res  = await fetch(`/api/leaderboard?${p}`, { cache: "no-store" });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setPlayers(prev => off === 0 ? (data.players ?? []) : [...prev, ...(data.players ?? [])]);
      setGameTypes(data.game_types ?? []);
      setHasMore(data.has_more ?? false);
      setOffset(off + (data.players?.length ?? 0));
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [period, gameFilter, refreshKey]);

  useEffect(() => { setOffset(0); fetchData(0); }, [period, gameFilter, refreshKey]);

  const top3   = players.slice(0, 3);
  const podium = [
    { idx: 1, label: "2nd", medal: "from-slate-300 to-slate-500",  h: "h-24", glow: "" },
    { idx: 0, label: "1st", medal: "from-yellow-300 to-amber-500", h: "h-36", glow: "shadow-amber-500/20" },
    { idx: 2, label: "3rd", medal: "from-orange-400 to-red-600",   h: "h-16", glow: "" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {myRank && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rank card */}
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-[#0f0f18] px-6 py-5">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex flex-col items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider opacity-80">RANK</span>
                  <span className="text-white text-2xl font-black leading-none">#{myRank.rank}</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-0.5">Your Position</p>
                  <p className="text-white font-black text-lg leading-tight">You are ranked #{myRank.rank}</p>
                  <p className="text-gray-500 text-xs mt-0.5">out of <span className="text-gray-300 font-semibold">{myRank.total}</span> players</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-0.5">Total Score</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">{myRank.score.toLocaleString()}</p>
                <p className="text-gray-600 text-xs">points</p>
                <button onClick={handleShare}
                  className="mt-2 flex items-center gap-1 text-[10px] font-bold text-orange-400 hover:text-orange-300 transition ml-auto">
                  {copied ? "✓ Copied!" : "↗ Share"}
                </button>
              </div>
            </div>
          </div>
          {/* Personal best card */}
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-[#0f0f18] px-6 py-5">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/8 via-amber-500/5 to-transparent pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex flex-col items-center justify-center shadow-lg shadow-yellow-500/30 flex-shrink-0">
                  <span className="text-amber-900 text-2xl">⭐</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-0.5">Personal Best</p>
                  <p className="text-white font-black text-lg leading-tight">{(myRank.best ?? 0).toLocaleString()} pts</p>
                  {myRank.best_game && <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[120px]">{myRank.best_game}</p>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-0.5">Single Game</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">{(myRank.best ?? 0).toLocaleString()}</p>
                <p className="text-gray-600 text-xs">best score</p>
              </div>
            </div>
          </div>
          {/* Streak card */}
          <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-[#0f0f18] px-6 py-5">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/8 via-orange-500/5 to-transparent pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex flex-col items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
                  <span className="text-white text-2xl">{myRank.streak >= 7 ? "🔥" : myRank.streak >= 3 ? "⚡" : "📅"}</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-0.5">Win Streak</p>
                  <p className="text-white font-black text-lg leading-tight">{myRank.streak} day{myRank.streak !== 1 ? "s" : ""}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{myRank.streak === 0 ? "Play today to start!" : myRank.streak >= 7 ? "You're on fire!" : "Keep it up!"}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-0.5">Consecutive</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">{myRank.streak}</p>
                <p className="text-gray-600 text-xs">days</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex bg-[#0f0f18] border border-white/8 rounded-2xl p-1 gap-1">
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 ${period === p.key ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-400"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {gameTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["", ...gameTypes].map(g => (
            <button key={g} onClick={() => setGameFilter(g)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${gameFilter === g ? "bg-orange-500/20 border-orange-500/50 text-orange-300" : "bg-white/4 border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/20"}`}>
              {g === "" ? "All Games" : g}
            </button>
          ))}
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search player by name..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f0f18] border border-white/8 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition text-xs">✕</button>
        )}
      </div>

      {loading ? <Spinner /> : error ? (
        <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-6 text-center">
          <p className="text-red-400 text-sm font-semibold">⚠️ {error}</p>
        </div>
      ) : players.length === 0 ? <Empty /> : (() => {
        const filtered = search
          ? players.filter(p => p.player_name.toLowerCase().includes(search.toLowerCase()))
          : players;
        if (filtered.length === 0) return (
          <div className="bg-[#0f0f18] border border-white/8 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 font-semibold">No player found for "{search}"</p>
            <button onClick={() => setSearch("")} className="mt-3 text-xs text-orange-400 hover:text-orange-300 transition">Clear search</button>
          </div>
        );
        return (
        <>
          {top3.length >= 2 && !search && (
            <div className="relative bg-[#0f0f18] border border-white/8 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex items-end justify-center gap-2 px-6 pt-10 pb-0">
                {podium.map(({ idx, label, medal, h, glow }, pi) => {
                  const p = top3[idx];
                  if (!p) return <div key={pi} className="flex-1" />;
                  return (
                    <div key={pi} className="flex-1 flex flex-col items-center gap-2 pb-0">
                      <div className={`relative ${pi === 1 ? "scale-110" : ""}`}>
                        <Avatar name={p.player_name} size={pi === 1 ? "xl" : "lg"} />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${medal} flex items-center justify-center text-[9px] font-black text-white ring-2 ring-[#0f0f18]`}>
                          {idx + 1}
                        </div>
                      </div>
                      <p className="text-white font-bold text-xs truncate max-w-full text-center">{p.player_name} {flag(p.age_group === undefined ? null : (p as any).country)}</p>
                      <AgeBadge age_group={p.age_group} />
                      <p className="text-orange-400 font-black text-sm">{p.total_score.toLocaleString()}</p>
                      <div className={`w-full ${h} bg-gradient-to-t from-white/8 to-white/3 border-t border-x border-white/10 rounded-t-2xl flex items-center justify-center shadow-lg ${glow}`}>
                        <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-[#0f0f18] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Rankings</p>
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-600">{filtered.length} players</p>
                <button onClick={() => setRefreshKey(k => k + 1)} disabled={loading}
                  className="text-gray-600 hover:text-orange-400 transition disabled:opacity-40" title="Refresh">
                  <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {filtered.map((player, i) => {
                const isMe = currentUserId && player.user_id && Number(currentUserId) === Number(player.user_id);
                return (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition ${isMe ? "bg-orange-500/5 border-l-2 border-l-orange-500" : ""}`}>
                    <span className="text-gray-600 text-sm font-bold w-7 text-center flex-shrink-0">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <Avatar name={player.player_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm truncate">{player.player_name}</p>
                        {flag(player.country) && <span className="text-sm">{flag(player.country)}</span>}
                        {isMe && <span className="text-[9px] bg-orange-500/15 text-orange-400 border border-orange-500/25 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                        <AgeBadge age_group={player.age_group} />
                      </div>
                      {!gameFilter && player.game && <p className="text-gray-600 text-xs truncate mt-0.5">{player.game}</p>}
                      {player.total_games != null && (
                        <p className="text-gray-600 text-xs mt-0.5">{player.total_games} game{player.total_games !== 1 ? "s" : ""}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-sm">{player.total_score.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {lastSeenDot(player.last_played)}
                        <p className="text-gray-700 text-[10px]">{fmt(player.last_played)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {hasMore && (
            <div className="px-5 py-3 border-t border-white/8 flex justify-center">
              <button onClick={() => fetchData(offset)} disabled={loadingMore}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-gray-400 hover:text-white text-xs font-bold transition disabled:opacity-50">
                {loadingMore ? <><div className="w-3 h-3 rounded-full border-2 border-white/20 border-t-orange-500 animate-spin" /> Loading...</> : "Load More"}
              </button>
            </div>
          )}
        </>
        );
      })()}
    </div>
  );
}

// ── Per-Game Tab ───────────────────────────────────────────────────────────
function PerGameTab() {
  const [games, setGames]       = useState<Record<string, GameTopPlayer[]>>({});
  const [gameList, setGameList] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail]     = useState<GameEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/leaderboard?view=pergame");
        const data = await res.json();
        if (data.error) { setError(data.error); return; }
        setGames(data.games ?? {}); setGameList(data.game_list ?? []);
      } catch { setError("Could not connect."); }
      finally { setLoading(false); }
    })();
  }, []);

  const openGame = async (game: string) => {
    setSelected(game); setDetailLoading(true);
    try {
      const res  = await fetch(`/api/leaderboard?view=game&game=${encodeURIComponent(game)}`);
      const data = await res.json();
      setDetail(data.players ?? []);
    } catch { setDetail([]); }
    finally { setDetailLoading(false); }
  };

  if (loading) return <Spinner />;
  if (error)   return <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-6 text-center"><p className="text-red-400 text-sm">⚠️ {error}</p></div>;

  if (selected) return (
    <div className="w-full max-w-2xl mx-auto">
      <button onClick={() => setSelected(null)} className="mb-5 flex items-center gap-2 text-gray-500 hover:text-white transition text-sm font-semibold">← Back</button>
      <div className="bg-[#0f0f18] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-white font-black text-lg">{selected}</h2>
          <span className="text-xs text-gray-600 uppercase tracking-widest">Top Scores</span>
        </div>
        {detailLoading ? <Spinner /> : detail.length === 0 ? <Empty msg="No scores yet" cta={false} /> : (
          <div className="divide-y divide-white/5">
            {detail.map((p, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900" : i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-800" : i === 2 ? "bg-gradient-to-br from-orange-400 to-red-600 text-white" : "bg-white/5 text-gray-500"}`}>{i + 1}</span>
                <Avatar name={p.player_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{p.player_name}</p>
                  <p className="text-gray-600 text-xs">{p.plays} play{p.plays !== 1 ? "s" : ""} · {fmt(p.last_played)} {flag(p.country)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {lastSeenDot(p.last_played)}
                    <p className="text-gray-700 text-[10px]">{fmt(p.last_played)}</p>
                  </div>
                </div>
                <p className="text-white font-black">{p.best_score.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (gameList.length === 0) return <Empty msg="No game scores yet" />;

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {gameList.map(game => {
        const top = games[game] ?? [];
        return (
          <button key={game} onClick={() => openGame(game)}
            className="bg-[#0f0f18] border border-white/8 hover:border-orange-500/30 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-sm truncate group-hover:text-orange-400 transition">{game}</h3>
              <span className="text-orange-500 text-xs opacity-0 group-hover:opacity-100 transition font-bold">→</span>
            </div>
            <div className="space-y-2.5">
              {top.length === 0 ? (
                <p className="text-gray-700 text-xs">No scores yet</p>
              ) : top.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-xs w-4 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                  <Avatar name={p.player_name} size="xs" />
                  <span className="text-gray-400 text-xs flex-1 truncate">{p.player_name} {flag((p as any).country)}</span>
                  <span className="text-white text-xs font-black">{p.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Group Rankings List ────────────────────────────────────────────────────
function GroupRankList({ ag, label, icon, headerColor, borderColor }: {
  ag: string; label: string; icon: string; headerColor: string; borderColor: string;
}) {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    fetch(`/api/leaderboard?view=rankings&age_group=${ag}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setPlayers(d.players ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ag]);

  return (
    <div className={`bg-[#0f0f18] border ${borderColor} rounded-2xl overflow-hidden`}>
      <div className={`px-5 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <p className={`text-sm font-black ${headerColor} flex items-center gap-2`}>{icon} {label}</p>
        <p className="text-gray-600 text-xs">{players.length} players</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
        </div>
      ) : players.length === 0 ? (
        <p className="text-gray-700 text-xs text-center py-8">No players yet</p>
      ) : (
        <div className="divide-y divide-white/5">
          {players.map((row, pos) => {
            const rank = pos + 1;
            const isMe = currentUserId && Number(currentUserId) === row.id;
            return (
              <div key={row.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition ${isMe ? "bg-orange-500/5 border-l-2 border-l-orange-500" : ""}`}>
                <div className="w-7 flex-shrink-0 flex justify-center">
                  {rank === 1 ? <span>🥇</span> : rank === 2 ? <span>🥈</span> : rank === 3 ? <span>🥉</span> : <span className="text-gray-600 text-xs font-bold">#{rank}</span>}
                </div>
                <Avatar name={row.player_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-white font-semibold text-sm truncate">{row.player_name}</p>
                    {flag(row.country) && <span className="text-sm">{flag(row.country)}</span>}
                    {isMe && <span className="text-[9px] bg-orange-500/15 text-orange-400 border border-orange-500/25 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                  </div>
                  <p className="text-gray-700 text-[10px]">{row.total_games} games</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {lastSeenDot(row.last_played)}
                    <p className="text-gray-700 text-[10px]">{fmt(row.last_played)}</p>
                  </div>
                </div>
                <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border ${row.tier.border} bg-white/3 flex-shrink-0`}>
                  <span className="text-sm">{row.tier.icon}</span>
                  <span className={`text-[10px] font-black ${row.tier.color}`}>{row.tier.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-black text-sm">{row.total_points.toLocaleString()}</p>
                  <p className="text-gray-700 text-[10px]">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Rankings Tab ───────────────────────────────────────────────────────────
function RankingsTab() {
  const [tiers, setTiers] = useState<RankTier[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard?view=rankings", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setTiers(d.tiers ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Rank Tiers */}
      {tiers.length > 0 && (
        <div className="bg-[#0f0f18] border border-white/8 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-600 font-bold mb-4">Rank Tiers</p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {tiers.map(t => (
              <div key={t.name} className={`border ${t.border} bg-white/3 rounded-xl p-2.5 text-center`}>
                <div className="text-xl mb-1">{t.icon}</div>
                <div className={`text-[10px] font-black ${t.color}`}>{t.name}</div>
                <div className="text-gray-700 text-[9px] mt-0.5">{t.min >= 1000 ? `${t.min / 1000}k` : t.min}+</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 group lists side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GroupRankList ag="kids"  label="Kids Rankings"  icon="🧒" headerColor="text-blue-300"   borderColor="border-blue-500/20" />
        <GroupRankList ag="teen"  label="Teen Rankings"  icon="🧑" headerColor="text-green-300"  borderColor="border-green-500/20" />
        <GroupRankList ag="adult" label="18+ Rankings"   icon="🔞" headerColor="text-orange-300" borderColor="border-orange-500/20" />
      </div>
    </div>
  );
}

// ── Most Improved Tab ─────────────────────────────────────────────────────
function MostImprovedTab() {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<{ player_name: string; this_week: number; last_week: number; diff: number; age_group: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    setLoading(true);
    fetch("/api/leaderboard/most-improved", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setPlayers(d.players ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <Spinner />;
  if (players.length === 0) return <Empty msg="No improvement data yet — play more games!" />;

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#0f0f18] border border-white/8 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Most Improved This Week</p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-600">{players.length} players</p>
          <button onClick={() => setRefreshKey(k => k + 1)} disabled={loading}
            className="text-gray-600 hover:text-orange-400 transition disabled:opacity-40" title="Refresh">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {players.map((row, i) => {
          const isMe = currentUserId && players[i] && row.player_name;
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition">
              <span className="text-gray-600 text-sm font-bold w-7 text-center flex-shrink-0">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </span>
              <Avatar name={row.player_name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold text-sm truncate">{row.player_name}</p>
                  {flag((row as any).country) && <span className="text-sm">{flag((row as any).country)}</span>}
                  <AgeBadge age_group={row.age_group} />
                </div>
                <p className="text-gray-600 text-xs">last week: {row.last_week.toLocaleString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-black text-sm">{row.this_week.toLocaleString()}</p>
                <p className={`text-xs font-bold ${row.diff >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {row.diff >= 0 ? "+" : ""}{row.diff.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function LeaderboardClient() {
  const [tab, setTab] = useState<Tab>("leaderboard");
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch("/api/leaderboard/my-rank", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (d.total) setTotalPlayers(d.total); })
      .catch(() => {});
  }, []);

  const tabs = [
    { key: "leaderboard" as Tab, label: "Scores",   icon: "📊" },
    { key: "pergame"     as Tab, label: "Per Game", icon: "🎮" },
    { key: "rankings"   as Tab, label: "Rankings", icon: "🏅" },
    { key: "improved"   as Tab, label: "Improved",  icon: "📈" },
  ];

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 py-10 md:py-14 relative z-10 w-full min-h-screen" suppressHydrationWarning>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          🏆 Hall of Fame
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
          Leader<span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">board</span>
        </h1>
        <p className="text-gray-600 text-sm mt-4 max-w-sm mx-auto">Compete, climb, and claim your spot at the top of the rankings.</p>
        {mounted && (
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold px-4 py-1.5 rounded-full mt-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white font-black">{totalPlayers ? totalPlayers.toLocaleString() : "—"}</span> players competing
          </div>
        )}
      </div>

      {mounted && (
        <div className="flex bg-[#0a0a12] border border-white/8 rounded-2xl p-1 gap-1 mb-8 w-full max-w-md">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 ${tab === t.key ? "bg-white/10 text-white shadow-sm" : "text-gray-600 hover:text-gray-400"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {mounted && tab === "leaderboard" && <LeaderboardTab />}
      {mounted && tab === "pergame"     && <PerGameTab />}
      {mounted && tab === "rankings"    && <RankingsTab />}
      {mounted && tab === "improved"    && <MostImprovedTab />}

    </div>
  );
}
