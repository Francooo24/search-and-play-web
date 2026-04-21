"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const GAME_EMOJI: Record<string, string> = {
  "Hangman": "🪢", "Crossword": "📋", "Word Puzzle": "🔤", "WordGuess": "📝",
  "Word Chain": "🔗", "Spelling Bee": "🐝", "Tic Tac Toe": "⭕", "Memory Game": "🧠",
  "Animal Match": "🐾", "Color Words": "🎨", "Count & Click": "🔢", "ABC Order": "🔤",
  "Word Blitz": "⚡", "Cryptogram": "🔐", "Anagram Master": "🔀", "Word Duel": "⚔️",
  "Speed Trivia": "🧠", "Word Scramble": "🔀", "Trivia Blitz": "🧠", "Vocabulary Quiz": "📚",
  "Word Association": "💬", "Word Bingo": "🎱", "Word Connect": "🔗", "Word Ladder": "🪜",
  "Word Search": "🔍", "Fill in the Blank": "✏️", "Flag Quiz": "🚩", "Idiom Challenge": "💡",
  "Logic Grid": "🧩", "Math Race": "🧮", "Prefix & Suffix": "🔤",
  "Scramble": "🔀", "Sentence Fix": "✍️", "Shape Match": "🔷", "Simple Math": "🔢",
  "Synonym Match": "🔤", "Deduction": "🕵️", "Fake or Fact": "❓", "Context Clues": "📖",
  "Debate This": "🗣️", "Balloon Pop": "🎈", "Caterpillar Count": "🐛",
  "Color Mix": "🎨", "Odd One Out": "🔍", "Picture Puzzle": "🖼️", "Rhyme Time": "🎵",
};

const GAME_SLUG: Record<string, string> = {
  "Hangman": "hangman", "Crossword": "crossword", "Word Puzzle": "puzzle",
  "WordGuess": "wordle", "Word Chain": "wordchain", "Spelling Bee": "spellingbee",
  "Tic Tac Toe": "tictactoe", "Memory Game": "memory", "Animal Match": "animalmatch",
  "Color Words": "colorwords", "Count & Click": "countclick", "ABC Order": "abcorder",
  "Word Blitz": "wordblitz", "Cryptogram": "cryptogram", "Anagram Master": "anagram",
  "Word Duel": "wordduel", "Speed Trivia": "trivia", "Word Scramble": "scramble",
  "Trivia Blitz": "triviablitz", "Vocabulary Quiz": "vocabquiz", "Word Association": "wordassoc",
  "Word Bingo": "wordbingo", "Word Connect": "wordconnect", "Word Ladder": "wordladder",
  "Word Search": "wordsearch", "Fill in the Blank": "fillinblank", "Flag Quiz": "flagquiz",
  "Idiom Challenge": "idiomchallenge", "Logic Grid": "logicgrid", "Math Race": "mathrace",
  "Prefix & Suffix": "prefixsuffix", "Sentence Fix": "sentencefix", "Shape Match": "shapematch",
  "Simple Math": "simplemath", "Synonym Match": "synonymmatch", "Deduction": "deduction",
  "Fake or Fact": "fakeorfact", "Context Clues": "contextclues", "Debate This": "debatethis",
  "Balloon Pop": "balloonpop", "Caterpillar Count": "caterpillarcount", "Color Mix": "colormix",
  "Odd One Out": "oddoneout", "Picture Puzzle": "picturepuzzle", "Rhyme Time": "rhymetime",
};

function gameLink(name: string) {
  return `/games/${GAME_SLUG[name] ?? name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}
function fmtFull(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

interface Overall { total_games: number; highest_score: number; avg_score: number; total_points: number; }
interface GameStat { game: string; games_played: number; best_score: number; avg_score: number; total_score: number; }
interface GameEntry { game: string; score: number; created_at: string; }
interface StatsData {
  overall: Overall; gameStats: GameStat[]; recentGames: GameEntry[];
  distinctGames: string[]; history: GameEntry[];
  historyTotal: number; historyPages: number; page: number;
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData]           = useState<StatsData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const [gameFilter, setGameFilter] = useState("");
  const [sort, setSort]             = useState("created_at");
  const [dir, setDir]               = useState("desc");
  const [page, setPage]             = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin-prompt?from=/stats");
  }, [status, router]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const p = new URLSearchParams({ game: gameFilter, sort, dir, page: String(page) });
      const res  = await fetch(`/api/stats?${p}`);
      const json = await res.json();
      if (res.status === 401 || json.error?.toLowerCase().includes("token")) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (json.error) { setError(json.error); return; }
      setData(json);
    } catch {
      setError("Could not load statistics.");
    } finally {
      setLoading(false);
    }
  }, [gameFilter, sort, dir, page]);

  useEffect(() => { if (status === "authenticated") fetchData(); }, [fetchData, status]);

  function toggleSort(col: string) {
    if (sort === col) setDir(d => d === "desc" ? "asc" : "desc");
    else { setSort(col); setDir("desc"); }
    setPage(1);
  }

  function SortIcon({ col }: { col: string }) {
    if (sort !== col) return <span className="text-gray-600">↕</span>;
    return <span className="text-orange-400">{dir === "asc" ? "↑" : "↓"}</span>;
  }

  if (status === "loading" || (loading && !data)) {
    return (
      <div className="flex-grow w-full max-w-6xl mx-auto px-4 md:px-8 pb-16">
        {/* Hero skeleton */}
        <div className="rounded-3xl bg-white/5 border border-white/8 h-36 mb-10 mt-4 animate-pulse" />
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/8 h-24 animate-pulse" />
          ))}
        </div>
        {/* Tab skeleton */}
        <div className="w-48 h-10 rounded-xl bg-white/5 border border-white/8 mb-8 animate-pulse" />
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/5 border border-white/8 h-80 animate-pulse" />
          <div className="rounded-2xl bg-white/5 border border-white/8 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center border border-red-500/20 max-w-lg w-full">
          <p className="text-red-400 text-lg font-semibold mb-2">⚠️ Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button onClick={fetchData} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-sm transition">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overall, gameStats, recentGames, distinctGames, history, historyTotal, historyPages } = data;
  const playerName = session?.user?.name ?? "Player";
  const initials = playerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 md:px-8 pb-16">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden mb-10 mt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/25 via-amber-500/10 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent_60%)]" />
        <div className="relative px-6 md:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-orange-500/30 border-4 border-white/10 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-1">Performance Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {playerName}'s <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Game Stats</span>
            </h1>
            <p className="text-gray-400 text-sm">Complete gaming history &amp; performance overview</p>
          </div>
          <Link href="/profile" className="shrink-0 flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold transition">
            ← Profile
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-10">
        {[
          { label: "Games Played", value: overall.total_games.toLocaleString(),   icon: "🎮", color: "from-orange-500/20 to-orange-600/5",  border: "border-orange-500/20", text: "text-orange-400"  },
          { label: "Total Points", value: overall.total_points.toLocaleString(),  icon: "⚡", color: "from-amber-500/20 to-amber-600/5",   border: "border-amber-500/20",  text: "text-amber-400"   },
          { label: "Best Score",   value: overall.highest_score.toLocaleString(), icon: "🏆", color: "from-yellow-500/20 to-yellow-600/5", border: "border-yellow-500/20", text: "text-yellow-400"  },
          { label: "Avg Score",    value: overall.avg_score.toFixed(1),           icon: "📊", color: "from-blue-500/20 to-blue-600/5",    border: "border-blue-500/20",   text: "text-blue-400"    },
        ].map(({ label, value, icon, color, border, text }) => (
          <div key={label} className={`relative rounded-2xl p-4 md:p-6 bg-gradient-to-br ${color} border ${border} overflow-hidden group hover:-translate-y-1 transition-all`}>
            <div className="absolute top-3 right-3 text-2xl md:text-3xl opacity-20 group-hover:opacity-40 transition">{icon}</div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl md:text-3xl font-black ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        <button onClick={() => setActiveTab("overview")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "overview" ? "bg-orange-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>
          📊 Overview
        </button>
        <button onClick={() => setActiveTab("history")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "history" ? "bg-orange-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>
          📜 History
          {historyTotal > 0 && <span className="ml-2 text-xs bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-full">{historyTotal.toLocaleString()}</span>}
        </button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Per-game stats */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">🎮 Per-Game Stats</h2>
              <span className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">{gameStats.length} games</span>
            </div>
            <div className="p-4">
              {gameStats.length > 0 ? (
                <div className="space-y-3">
                  {gameStats.map(s => (
                    <div key={s.game} className="group bg-white/4 hover:bg-white/8 border border-white/6 hover:border-orange-500/20 rounded-xl p-4 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <Link href={gameLink(s.game)} className="flex items-center gap-2 font-semibold text-white hover:text-orange-400 transition">
                          <span className="text-xl">{GAME_EMOJI[s.game] ?? "🎮"}</span>
                          <span className="text-sm">{s.game}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">{s.games_played}x</span>
                          <Link href={gameLink(s.game)} className="opacity-0 group-hover:opacity-100 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full transition">
                            Play →
                          </Link>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                        <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
                          <div className="text-gray-500 mb-0.5">Best</div>
                          <div className="font-bold text-amber-400">{s.best_score.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
                          <div className="text-gray-500 mb-0.5">Avg</div>
                          <div className="font-bold text-orange-300">{s.avg_score.toFixed(1)}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
                          <div className="text-gray-500 mb-0.5">Total</div>
                          <div className="font-bold text-orange-400">{s.total_score.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="bg-white/6 rounded-full h-1 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, (s.total_score / (gameStats[0]?.total_score || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🎮</div>
                  <p className="text-gray-400 text-sm">No games played yet.</p>
                  <Link href="/games" className="text-xs text-orange-400 hover:text-orange-300 transition mt-2 inline-block">Browse games →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent + Top Chart */}
          <div className="flex flex-col gap-6">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <h2 className="font-bold text-white">🕐 Recent Games</h2>
                <span className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">Last 10</span>
              </div>
              <div className="p-4">
                {recentGames.length > 0 ? (
                  <div className="space-y-2">
                    {recentGames.map((r, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/4 hover:bg-white/8 border border-white/6 rounded-xl px-4 py-3 group transition">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{GAME_EMOJI[r.game] ?? "🎮"}</span>
                          <div>
                            <Link href={gameLink(r.game)} className="font-medium text-sm text-white hover:text-orange-400 transition block">{r.game}</Link>
                            <div className="text-xs text-gray-500">{fmtFull(r.created_at)}</div>
                          </div>
                        </div>
                        <div className="font-black text-orange-400">{r.score.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-400 text-sm">No recent games.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 bar chart */}
            {gameStats.length > 0 && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/8">
                  <h2 className="font-bold text-white">📈 Top Games by Score</h2>
                </div>
                <div className="p-5 space-y-3">
                  {gameStats.slice(0, 5).map((s, i) => (
                    <div key={s.game} className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-600 w-4">#{i + 1}</span>
                      <span className="text-base w-6">{GAME_EMOJI[s.game] ?? "🎮"}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300 truncate max-w-[120px]">{s.game}</span>
                          <span className="text-orange-400 font-bold">{s.total_score.toLocaleString()}</span>
                        </div>
                        <div className="bg-white/6 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (s.total_score / (gameStats[0]?.total_score || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              📜 Game History
              <span className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">{historyTotal.toLocaleString()}</span>
            </h2>
            <select value={gameFilter} onChange={e => { setGameFilter(e.target.value); setPage(1); }}
              className="bg-white/5 border border-white/10 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
              <option value="">All Games</option>
              {distinctGames.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="p-4">
            {historyTotal > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-xs uppercase tracking-wider text-gray-500">
                        <th className="text-left pb-3 pr-4">#</th>
                        <th className="text-left pb-3 pr-4">Game</th>
                        <th className="text-left pb-3 pr-4">
                          <button onClick={() => toggleSort("score")} className="flex items-center gap-1 hover:text-orange-400 transition">
                            Score <SortIcon col="score" />
                          </button>
                        </th>
                        <th className="text-left pb-3">
                          <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-orange-400 transition">
                            Date <SortIcon col="created_at" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history.map((h, i) => (
                        <tr key={i} className="hover:bg-white/3 transition">
                          <td className="py-3 pr-4 text-gray-600">{(page - 1) * 20 + i + 1}</td>
                          <td className="py-3 pr-4">
                            <Link href={gameLink(h.game)}
                              className="inline-flex items-center gap-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs px-2.5 py-1 rounded-full transition">
                              <span>{GAME_EMOJI[h.game] ?? "🎮"}</span>
                              {h.game}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 font-bold text-amber-400">{h.score.toLocaleString()}</td>
                          <td className="py-3 text-gray-400 text-xs">{fmtFull(h.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {historyPages > 1 && (
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/8">
                    <span className="text-xs text-gray-500">
                      Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, historyTotal)} of {historyTotal.toLocaleString()}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: historyPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition ${p === page ? "bg-orange-500 text-white font-bold" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-400">No game history{gameFilter ? ` for ${gameFilter}` : ""}.</p>
                {gameFilter && (
                  <button onClick={() => setGameFilter("")} className="text-xs text-orange-400 hover:text-orange-300 transition mt-2 inline-block">
                    Clear filter →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
