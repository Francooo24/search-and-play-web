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

function Avatar({ name, size = "md", avatarUrl }: { name: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; avatarUrl?: string | null }) {
  const sz = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" }[size];
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`${sz} rounded-full overflow-hidden bg-gradient-to-br ${color} flex items-center justify-center font-black text-white flex-shrink-0 ring-2 ring-white/10`}>
      {avatarUrl
        ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        : name.charAt(0).toUpperCase()
      }
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      <p className="text-gray-500 text-xs">Loading leaderboard...</p>
      <p className="text-gray-700 text-[10px]">First load may take up to 30s while the server wakes up</p>
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
  const [myRank, setMyRank] = useState<{ rank: number; total: number; score: number; best: number; best_game: string | null; streak: number; tier: { name: string; icon: string }; nextTier: { name: string; min: number } | null; tierProgress: number } | null>(null);
  const [search, setSearch]         = useState("");
  const [copied, setCopied]         = useState(false);
  const [avatars, setAvatars]       = useState<Record<string, string>>({});
  const [displayRank, setDisplayRank] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiItems = Array.from({ length: 40 }, (_, i) => ({
    left: ((i * 37 + 13) % 100),
    top: ((i * 17) % 20),
    delay: ((i * 0.13) % 2).toFixed(2),
    duration: (1.5 + (i * 0.07) % 2).toFixed(2),
    size: 12 + (i * 7) % 16,
    emoji: ["🎉","🏆","⭐","🥇","✨","🎊"][i % 6],
  }));

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
    fetch(`/api/leaderboard/my-rank?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.rank) {
          setMyRank(d);
          // Animate rank count up
          let start = 0;
          const rankEnd = d.rank;
          const scoreEnd = d.score;
          const duration = 800;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplayRank(Math.round(ease * rankEnd));
            setDisplayScore(Math.round(ease * scoreEnd));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          // Confetti if rank 1
          if (d.rank === 1) setShowConfetti(true);
        }
      })
      .catch(() => {});
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async (off = 0, attempt = 0) => {
    off === 0 ? setLoading(true) : setLoadingMore(true);
    setError("");
    try {
      const p = new URLSearchParams({ period, offset: String(off), t: String(Date.now()) });
      if (gameFilter) p.append("game", gameFilter);
      const res  = await fetch(`/api/leaderboard?${p}`, { cache: "no-store" });
      const data = await res.json();
      if (data.error) {
        // Auto-retry up to 3 times with 5s delay (Render cold start)
        if (attempt < 3) {
          setTimeout(() => fetchData(off, attempt + 1), 5000);
          return;
        }
        setError(data.error);
        return;
      }
      const newPlayers = data.players ?? [];
      setPlayers(prev => off === 0 ? newPlayers : [...prev, ...newPlayers]);
      setGameTypes(data.game_types ?? []);
      setHasMore(data.has_more ?? false);
      setOffset(off + newPlayers.length);

      // Batch fetch avatars for new players
      const names = newPlayers.map((p: any) => p.player_name).filter(Boolean);
      if (names.length > 0) {
        fetch("/api/avatars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ names }),
        })
          .then(r => r.json())
          .then(d => setAvatars(prev => ({ ...prev, ...d.avatars })))
          .catch(() => {});
      }
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
        <>
        {/* Confetti for #1 */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confettiItems.map((c, i) => (
              <div key={i} className="absolute animate-bounce" style={{
                left: `${c.left}%`,
                top: `-${c.top}px`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                fontSize: `${c.size}px`,
              }}>
                {c.emoji}
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* ── Rank Card ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1008] to-[#0f0f18] border border-orange-500/25 p-6 flex flex-col gap-5 shadow-xl shadow-orange-500/5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.12),transparent_60%)] pointer-events-none" />
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/80">Global Rank</span>
                {myRank.rank === 1 && (
                  <span className="text-[10px] bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 px-2 py-0.5 rounded-full font-black">🥇 #1</span>
                )}
              </div>
              <button onClick={handleShare} className="text-[10px] font-bold text-orange-400/70 hover:text-orange-300 transition flex items-center gap-1">
                {copied ? "✓ Copied" : "↗ Share"}
              </button>
            </div>
            {/* Big rank number */}
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black text-white leading-none">#{displayRank}</span>
              <div className="pb-1">
                <p className="text-white font-bold text-sm leading-tight">{displayScore.toLocaleString()} pts</p>
                <p className="text-gray-500 text-xs">of {myRank.total} players</p>
              </div>
            </div>
            {/* Tier */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
              <span className="text-2xl">{myRank.tier?.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm">{myRank.tier?.name}</p>
                <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-1000" style={{ width: `${myRank.tierProgress}%` }} />
                </div>
                <p className="text-gray-600 text-[10px] mt-1">
                  {myRank.nextTier
                    ? `${(myRank.nextTier.min - myRank.score).toLocaleString()} pts → ${myRank.nextTier.name}`
                    : "Max tier reached ⭐"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Personal Best Card ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1500] to-[#0f0f18] border border-yellow-500/25 p-6 flex flex-col gap-5 shadow-xl shadow-yellow-500/5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.10),transparent_60%)] pointer-events-none" />
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400/80">Personal Best</span>
              <span className="text-lg">⭐</span>
            </div>
            {/* Big score */}
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black text-white leading-none">{(myRank.best ?? 0).toLocaleString()}</span>
              <div className="pb-1">
                <p className="text-white font-bold text-sm leading-tight">points</p>
                <p className="text-gray-500 text-xs">single game</p>
              </div>
            </div>
            {/* Game */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
              <span className="text-2xl">🎮</span>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Best Game</p>
                <p className="text-white font-black text-sm truncate max-w-[160px]">{myRank.best_game ?? "No games yet"}</p>
              </div>
            </div>
          </div>

          {/* ── Streak Card ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#180a08] to-[#0f0f18] border border-red-500/25 p-6 flex flex-col gap-5 shadow-xl shadow-red-500/5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(239,68,68,0.10),transparent_60%)] pointer-events-none" />
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80">Win Streak</span>
              <span className="text-lg">{myRank.streak >= 7 ? "🔥" : myRank.streak >= 3 ? "⚡" : "📅"}</span>
            </div>
            {/* Big streak */}
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black text-white leading-none">{myRank.streak}</span>
              <div className="pb-1">
                <p className="text-white font-bold text-sm leading-tight">day{myRank.streak !== 1 ? "s" : ""}</p>
                <p className="text-gray-500 text-xs">consecutive</p>
              </div>
            </div>
            {/* Status */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
              <span className="text-2xl">{myRank.streak >= 7 ? "🔥" : myRank.streak >= 3 ? "⚡" : "🎯"}</span>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Status</p>
                <p className="text-white font-black text-sm">
                  {myRank.streak === 0 ? "Play today to start!" : myRank.streak >= 7 ? "You're on fire!" : myRank.streak >= 3 ? "Hot streak!" : "Keep going!"}
                </p>
              </div>
            </div>
          </div>

        </div>
        </>
      )}
      {/* ── Controls ── */}
      <div className="w-full space-y-3">
        {/* Period tabs */}
        <div className="relative flex bg-[#0a0a12] rounded-2xl p-1 border border-white/6">
          {PERIODS.map((p, i) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`relative flex-1 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 rounded-xl z-10 ${
                period === p.key ? "text-white" : "text-gray-600 hover:text-gray-400"
              }`}>
              {period === p.key && (
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/30" />
              )}
              <span className="relative">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Game filter + Search row */}
        <div className="flex gap-2">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search player..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0a0a12] border border-white/6 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-orange-500/40 transition" />
          {search && (
            <button onClick={() => setSearch("")} className="px-4 py-2.5 rounded-xl bg-[#0a0a12] border border-white/6 text-gray-600 hover:text-white text-xs transition">
              Clear
            </button>
          )}
          <button onClick={() => setRefreshKey(k => k + 1)} disabled={loading}
            className="px-3 py-2.5 rounded-xl bg-[#0a0a12] border border-white/6 text-gray-600 hover:text-orange-400 hover:border-orange-500/30 transition disabled:opacity-40">
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Game chips */}
        {gameTypes.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {["", ...gameTypes].map(g => (
              <button key={g} onClick={() => setGameFilter(g)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all duration-150 ${
                  gameFilter === g
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-transparent border-white/8 text-gray-600 hover:border-white/20 hover:text-gray-300"
                }`}>
                {g === "" ? "All Games" : g}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? <Spinner /> : error ? (
        <div className="bg-orange-500/8 border border-orange-500/20 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-3">⏳</p>
          <p className="text-orange-400 text-sm font-semibold mb-2">Backend is waking up...</p>
          <p className="text-gray-500 text-xs mb-4">Retrying automatically. This takes up to 30 seconds on first load.</p>
          <button onClick={() => { setError(""); fetchData(0, 0); }}
            className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl transition">
            Retry Now
          </button>
        </div>
      ) : players.length === 0 ? <Empty /> : (() => {
        const filtered = search
          ? players.filter(p => p.player_name.toLowerCase().includes(search.toLowerCase()))
          : players;
        if (filtered.length === 0) return (
          <div className="bg-[#0f0f18] border border-white/8 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3"></p>
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
                        <Avatar name={p.player_name} size={pi === 1 ? "xl" : "lg"} avatarUrl={avatars[p.player_name]} />
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

          {/* ── Rankings Table ── */}
          <div className="rounded-2xl overflow-hidden border border-white/6" style={{ background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a12 100%)" }}>
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-orange-400 to-amber-600" />
                <div>
                  <p className="text-sm font-black text-white">Player Rankings</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5">
                    {filtered.length} player{filtered.length !== 1 ? "s" : ""}
                    {gameFilter ? ` · ${gameFilter}` : ""}
                    {period !== "all" ? ` · ${PERIODS.find(p => p.key === period)?.label}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Rows */}
            <div>
              {filtered.map((player, i) => {
                const isMe = currentUserId && player.user_id && Number(currentUserId) === Number(player.user_id);
                const isTop3 = i < 3;
                const rankColors = ["from-yellow-400/20 to-transparent", "from-slate-400/10 to-transparent", "from-orange-700/15 to-transparent"];
                return (
                  <Link key={i} href={`/players/${encodeURIComponent(player.player_name)}`}
                    className={`relative flex items-center gap-4 px-6 py-4 transition-all duration-200 cursor-pointer group ${
                      isMe
                        ? "bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent"
                        : "hover:bg-white/3"
                    }`}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>

                    {/* Left accent for top 3 */}
                    {isTop3 && (
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${rankColors[i]}`} />
                    )}
                    {isMe && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-amber-500" />}

                    {/* Rank */}
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                      {i === 0 ? (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                          <span className="text-xs font-black text-amber-900">1</span>
                        </div>
                      ) : i === 1 ? (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center">
                          <span className="text-xs font-black text-slate-800">2</span>
                        </div>
                      ) : i === 2 ? (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <span className="text-xs font-black text-white">3</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-gray-700 tabular-nums">#{i + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar name={player.player_name} size="sm" avatarUrl={avatars[player.player_name]} />

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white group-hover:text-orange-300 font-bold text-sm truncate transition-colors duration-200">{player.player_name}</span>
                        {flag(player.country) && <span className="text-sm leading-none">{flag(player.country)}</span>}
                        {isMe && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">YOU</span>
                        )}
                        <AgeBadge age_group={player.age_group} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {!gameFilter && player.game && <span className="text-gray-700 text-[10px] truncate">{player.game}</span>}
                        {player.total_games != null && <span className="text-gray-700 text-[10px]">{player.total_games} games</span>}
                        <div className="flex items-center gap-1">
                          {lastSeenDot(player.last_played)}
                          <span className="text-gray-700 text-[10px]">{fmt(player.last_played)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black text-base tabular-nums ${
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-white"
                      }`}>{player.total_score.toLocaleString()}</p>
                      <p className="text-gray-700 text-[10px] uppercase tracking-widest">pts</p>
                    </div>
                  </Link>
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
              <Link key={row.id} href={`/players/${encodeURIComponent(row.player_name)}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition cursor-pointer ${isMe ? "bg-orange-500/5 border-l-2 border-l-orange-500" : ""}`}>
                <div className="w-7 flex-shrink-0 flex justify-center">
                  {rank === 1 ? <span>🥇</span> : rank === 2 ? <span>🥈</span> : rank === 3 ? <span>🥉</span> : <span className="text-gray-600 text-xs font-bold">#{rank}</span>}
                </div>
                <Avatar name={row.player_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-white hover:text-orange-400 font-semibold text-sm truncate transition">{row.player_name}</span>
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
              </Link>
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
        <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Most Improved This Week <span className="text-gray-700 normal-case font-normal">(falls back to all-time if no recent data)</span></p>
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

  useEffect(() => {
    fetch(`/api/leaderboard/my-rank?t=${Date.now()}`, { cache: "no-store" })
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
    <div className="flex flex-col items-center px-4 sm:px-6 py-12 md:py-20 relative z-10 w-full min-h-screen">

      {/* ── Hero Header ── */}
      <div suppressHydrationWarning className="text-center mb-10 w-full max-w-2xl">
        <div suppressHydrationWarning className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span suppressHydrationWarning>Hall of Fame</span>


        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Leader<span className="text-orange-400">board</span>
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">Compete, climb, and claim your spot at the top.</p>
        {totalPlayers && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/8 text-gray-400 text-xs font-semibold px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {totalPlayers.toLocaleString()} players competing
          </div>
        )}
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-1 mb-8 bg-white/5 border border-white/8 rounded-2xl p-1 w-full max-w-md">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
              tab === t.key
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "text-gray-500 hover:text-gray-300"
            }`}>
            <span className="text-sm leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl">
      {tab === "leaderboard" && <LeaderboardTab />}
      {tab === "pergame"     && <PerGameTab />}
      {tab === "rankings"    && <RankingsTab />}
      {tab === "improved"    && <MostImprovedTab />}
      </div>

    </div>
  );
}
