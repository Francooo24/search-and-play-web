"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

type Player = {
  id: number;
  player_name: string;
  email: string;
  created_at: string;
  status: string;
};

type Stats = {
  dataPoints: number[];
  labels: string[];
  totalNew: number;
  avg: number;
  peak: number;
  bestDay: string;
  notifications: { message: string; created_at: string }[];
  activityLogs: { activity: string; created_at: string; player_name: string | null }[];
};

const ADMIN_GAMES = [
  { slug: "tictactoe",      name: "Tic Tac Toe",       icon: "⭕", group: "Kids"  },
  { slug: "memory",         name: "Memory Game",       icon: "🧠", group: "Kids"  },
  { slug: "animalmatch",    name: "Animal Match",      icon: "🐾", group: "Kids"  },
  { slug: "colorwords",     name: "Color Words",       icon: "🎨", group: "Kids"  },
  { slug: "countclick",     name: "Count & Click",     icon: "🔢", group: "Kids"  },
  { slug: "shapematch",     name: "Shape Match",       icon: "🔷", group: "Kids"  },
  { slug: "simplemath",     name: "Simple Math",       icon: "➕", group: "Kids"  },
  { slug: "balloonpop",     name: "Balloon Pop",       icon: "🎈", group: "Kids"  },
  { slug: "caterpillarcount",name: "Caterpillar Count",icon: "🐛", group: "Kids"  },
  { slug: "colormix",       name: "Color Mix",         icon: "🌈", group: "Kids"  },
  { slug: "abcorder",       name: "ABC Order",         icon: "🔤", group: "Kids"  },
  { slug: "oddoneout",      name: "Odd One Out",       icon: "🎪", group: "Kids"  },
  { slug: "rhymetime",      name: "Rhyme Time",        icon: "🎵", group: "Kids"  },
  { slug: "wordbingo",      name: "Word Bingo",        icon: "🎯", group: "Kids"  },
  { slug: "hangman",        name: "Hangman",           icon: "🪢", group: "Teen"  },
  { slug: "wordle",         name: "WordGuess",         icon: "📝", group: "Teen"  },
  { slug: "wordsearch",     name: "Word Search",       icon: "🔍", group: "Teen"  },
  { slug: "spellingbee",    name: "Spelling Bee",      icon: "🐝", group: "Teen"  },
  { slug: "synonymmatch",   name: "Synonym Match",     icon: "🔄", group: "Teen"  },
  { slug: "scramble",       name: "Word Scramble",     icon: "🔀", group: "Teen"  },
  { slug: "triviablitz",    name: "Trivia Blitz",      icon: "🧠", group: "Teen"  },
  { slug: "flagquiz",       name: "Flag Quiz",         icon: "🗺️", group: "Teen"  },
  { slug: "mathrace",       name: "Math Race",         icon: "🧮", group: "Teen"  },
  { slug: "sentencefix",    name: "Sentence Fix",      icon: "✍️", group: "Teen"  },
  { slug: "fillinblank",    name: "Fill in the Blank", icon: "✏️", group: "Teen"  },
  { slug: "prefixsuffix",   name: "Prefix & Suffix",   icon: "🔤", group: "Teen"  },
  { slug: "contextclues",   name: "Context Clues",     icon: "📖", group: "Teen"  },
  { slug: "picturepuzzle",  name: "Picture Puzzle",    icon: "🧩", group: "Teen"  },
  { slug: "crossword",      name: "Crossword",         icon: "📋", group: "Adult" },
  { slug: "cryptogram",     name: "Cryptogram",        icon: "🔐", group: "Adult" },
  { slug: "wordblitz",      name: "Word Blitz",        icon: "⚡", group: "Adult" },
  { slug: "anagram",        name: "Anagram Master",    icon: "🔀", group: "Adult" },
  { slug: "wordduel",       name: "Word Duel",         icon: "⚔️", group: "Adult" },
  { slug: "trivia",         name: "Speed Trivia",      icon: "🧠", group: "Adult" },
  { slug: "vocabquiz",      name: "Vocabulary Quiz",   icon: "📚", group: "Adult" },
  { slug: "idiomchallenge", name: "Idiom Challenge",   icon: "💬", group: "Adult" },
  { slug: "logicgrid",      name: "Logic Grid",        icon: "🔍", group: "Adult" },
  { slug: "deduction",      name: "Deduction",         icon: "🧩", group: "Adult" },
  { slug: "wordassoc",      name: "Word Association",  icon: "🧩", group: "Adult" },
  { slug: "wordchain",      name: "Word Chain",        icon: "🔗", group: "Adult" },
  { slug: "wordconnect",    name: "Word Connect",      icon: "🔗", group: "Adult" },
  { slug: "wordladder",     name: "Word Ladder",       icon: "🪜", group: "Adult" },
  { slug: "debatethis",     name: "Debate This",       icon: "🎭", group: "Adult" },
  { slug: "fakeorfact",     name: "Fake or Fact",      icon: "📰", group: "Adult" },
];

const ACTIVITY_ICON: Record<string, string> = {
  "Logged in": "🔐",
  "Searched": "🔍",
  "Played": "🎮",
};

function getActivityIcon(activity: string) {
  for (const key of Object.keys(ACTIVITY_ICON)) {
    if (activity.startsWith(key)) return ACTIVITY_ICON[key];
  }
  return "📌";
}

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [players, setPlayers]           = useState<Player[]>([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [stats, setStats]               = useState<Stats | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [editTarget, setEditTarget]     = useState<Player | null>(null);
  const [editName, setEditName]         = useState("");
  const [editEmail, setEditEmail]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState({ msg: "", type: "success" });
  const [activeTab, setActiveTab]       = useState<"players" | "activity" | "games" | "gamestats" | "dailychallenge">("players");
  const [gameSettings, setGameSettings] = useState<Record<string, boolean>>({});
  const [gamesLoading, setGamesLoading] = useState(false);

  type DailyChallenge = { id?: number; challenge_date: string; game: string; title: string; description: string; target_type: string; target_value: number; bonus_points: number; };
  const BLANK: DailyChallenge = { challenge_date: "", game: "", title: "", description: "", target_type: "win", target_value: 1, bonus_points: 50 };

  type GameStat = { game: string; plays: number; top_score: number; avg_score: number };
  type TopPlayer = { player_name: string; total_score: number; games_played: number };
  type GameStatsData = {
    playsPerGame: GameStat[];
    topPlayers: TopPlayer[];
    dailyPlays: { label: string; count: number }[];
    mostPlayed: string;
    totalPlays: number;
    totalGamesCount: number;
  };
  const [gameStatsData, setGameStatsData]   = useState<GameStatsData | null>(null);
  const [gameStatsLoading, setGameStatsLoading] = useState(false);

  const [challenges, setChallenges]         = useState<DailyChallenge[]>([]);
  const [dcLoading, setDcLoading]           = useState(false);
  const [dcForm, setDcForm]                 = useState<DailyChallenge>(BLANK);
  const [dcEditing, setDcEditing]           = useState<DailyChallenge | null>(null);
  const [dcDeleteTarget, setDcDeleteTarget] = useState<DailyChallenge | null>(null);
  const [dcSaving, setDcSaving]             = useState(false);
  const [dcDeleting, setDcDeleting]         = useState(false);
  const [showDcForm, setShowDcForm]         = useState(false);

  const totalPages = Math.ceil(total / 10);

  const fetchPlayers = useCallback(async () => {
    try {
      const res  = await fetch(`/api/admin/players?page=${page}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setPlayers(data.players ?? []);
      setTotal(data.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/stats");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch { /* ignore */ }
  }, []);

  const fetchGameSettings = useCallback(async () => {
    setGamesLoading(true);
    try {
      const res = await fetch("/api/admin/games");
      if (res.ok) { const data = await res.json(); setGameSettings(data.settings ?? {}); }
    } catch { /* ignore */ }
    setGamesLoading(false);
  }, []);

  const fetchChallenges = useCallback(async () => {
    setDcLoading(true);
    try {
      const res = await fetch("/api/admin/daily-challenge");
      if (res.ok) { const d = await res.json(); setChallenges(d.challenges ?? []); }
    } catch { /* ignore */ }
    setDcLoading(false);
  }, []);

  const fetchGameStats = useCallback(async () => {
    setGameStatsLoading(true);
    try {
      const res = await fetch("/api/admin/gamestats");
      if (res.ok) { const data = await res.json(); setGameStatsData(data); }
    } catch { /* ignore */ }
    setGameStatsLoading(false);
  }, []);

  const toggleGame = async (slug: string, current: boolean) => {
    const next = !current;
    setGameSettings(prev => ({ ...prev, [slug]: next }));
    await fetch("/api/admin/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, enabled: next }),
    });
  };

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      const isAdmin = (session?.user as any)?.is_admin;
      if (isAdmin === false) { router.push("/"); return; }
      // Load data whether is_admin is true or undefined (still loading)
      fetchPlayers(); fetchStats(); fetchGameSettings();
    }
  }, [status, session, fetchPlayers, fetchStats, router]);

  useEffect(() => {
    if (status === "authenticated") fetchPlayers();
  }, [page, search, fetchPlayers, status]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: deleteTarget.id }),
    });
    setDeleting(false);
    setDeleteTarget(null);
    showToast("Player deleted successfully!", "success");
    fetchPlayers();
  };

  const openEdit = (p: Player) => {
    setEditTarget(p);
    setEditName(p.player_name);
    setEditEmail(p.email);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    await fetch("/api/admin/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: editTarget.id, player_name: editName, email: editEmail }),
    });
    setSaving(false);
    setEditTarget(null);
    showToast("Player updated successfully!", "success");
    fetchPlayers();
  };

  const handleBan = async (p: Player) => {
    await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: p.id }),
    });
    showToast(`${p.player_name} has been banned.`, "warning");
    fetchPlayers();
  };

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const fmtDateTime = (d: string) =>
    new Date(d).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (status === "loading" || (status === "authenticated" && !stats)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-gray-400 text-sm tracking-widest uppercase">Loading Dashboard</p>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const chartData = {
    labels: stats.labels,
    datasets: [{
      label: "New Players",
      data: stats.dataPoints,
      fill: true,
      backgroundColor: "rgba(99,102,241,0.15)",
      borderColor: "#6366f1",
      borderWidth: 2.5,
      tension: 0.4,
      pointBackgroundColor: "#6366f1",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1500, easing: "easeInOutQuart" as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,15,30,0.95)",
        borderColor: "rgba(99,102,241,0.4)",
        borderWidth: 1,
        cornerRadius: 10,
        padding: 10,
        callbacks: {
          label: (ctx: any) => `  ${ctx.raw} new player${ctx.raw !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#6b7280", font: { size: 10 }, maxRotation: 30 }, grid: { color: "rgba(255,255,255,0.04)" }, border: { display: false } },
      y: { beginAtZero: true, ticks: { color: "#6b7280", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" }, border: { display: false } },
    },
  };

  const statCards = [
    { label: "New (7d)",  value: stats.totalNew, icon: "👥", color: "from-indigo-500 to-violet-600",  border: "border-indigo-500/30" },
    { label: "Daily Avg", value: stats.avg,       icon: "📈", color: "from-cyan-500 to-blue-600",     border: "border-cyan-500/30"   },
    { label: "Peak Day",  value: stats.peak,      icon: "🏆", color: "from-amber-500 to-orange-600",  border: "border-amber-500/30"  },
    { label: "Total",     value: total,            icon: "🌐", color: "from-emerald-500 to-teal-600",  border: "border-emerald-500/30"},
  ];

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 relative z-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-1">Control Panel</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">A</div>
          <div>
            <p className="text-white text-sm font-semibold">Administrator</p>
            <p className="text-gray-400 text-xs">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border ${s.border} bg-white/5 backdrop-blur-md p-5 group hover:-translate-y-1 transition-all duration-300`}>
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${s.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <span className="text-2xl absolute bottom-4 right-4 opacity-30 group-hover:opacity-60 transition-opacity">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* ── Chart + Notifications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

        {/* Chart */}
        <div className="lg:col-span-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-bold text-lg">Player Growth</h2>
              <p className="text-gray-500 text-xs mt-0.5">New registrations over the last 7 days</p>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">7-day view</span>
          </div>
          <div style={{ height: 220 }}>
            <Line data={chartData} options={chartOptions as any} />
          </div>
        </div>

        {/* Notifications */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-lg">🔔 Notifications</h2>
            <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-full">{stats.notifications.length}</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto max-h-56 pr-1 scrollbar-hide">
            {stats.notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
                <span className="text-4xl mb-2">🔕</span>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : stats.notifications.map((n, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 transition">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-gray-200 text-xs break-words leading-relaxed">{n.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{fmtDateTime(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Players / Activity ── */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">

        {/* Tab Header */}
        <div className="flex border-b border-white/10">
          {(["players", "activity", "games", "gamestats", "dailychallenge"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "games") fetchGameSettings();
                if (tab === "gamestats") fetchGameStats();
                if (tab === "dailychallenge") fetchChallenges();
              }}
              className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "text-white border-b-2 border-indigo-500 bg-indigo-500/10"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "players" ? "👥 Players" : tab === "activity" ? "📋 Activity" : tab === "games" ? "🎮 Games" : tab === "gamestats" ? "📊 Play Stats" : "📅 Daily Challenge"}
            </button>
          ))}
        </div>

        {/* Players Tab */}
        {activeTab === "players" && (
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <p className="text-gray-400 text-sm">{total} total player{total !== 1 ? "s" : ""}</p>
              <form onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput); }} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search name or email..."
                  className="flex-1 sm:w-60 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
                  Search
                </button>
              </form>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">ID</th>
                    <th className="px-5 py-3 text-left">Player</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Joined</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {players.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition group">
                      <td className="px-5 py-3.5 text-gray-500 text-sm">#{p.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {p.player_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white text-sm font-medium">{p.player_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-sm">{p.email}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-sm">{fmtDate(p.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          p.status === "banned"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {p.status === "banned" ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} title="Edit" className="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 flex items-center justify-center transition text-sm">✏️</button>
                          <button onClick={() => setDeleteTarget(p)} title="Delete" className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition text-sm">🗑️</button>
                          <button onClick={() => handleBan(p)} disabled={p.status === "banned"} title="Ban" className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 flex items-center justify-center transition text-sm disabled:opacity-30 disabled:cursor-not-allowed">🚫</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {players.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-12 text-sm">No players found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-5">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 text-sm hover:bg-white/20 disabled:opacity-30 transition">← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition ${n === page ? "bg-indigo-600 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>{n}</button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 text-sm hover:bg-white/20 disabled:opacity-30 transition">Next →</button>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="p-4 md:p-6 space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
            {stats.activityLogs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <span className="text-4xl block mb-3">📭</span>
                <p className="text-sm">No activity recorded yet</p>
              </div>
            ) : stats.activityLogs.map((l, i) => {
              const isSearch = l.activity.toLowerCase().includes("searched");
              const isPlayed = l.activity.toLowerCase().includes("played");
              const isWon    = l.activity.toLowerCase().includes("won");
              const isLost   = l.activity.toLowerCase().includes("lost");
              const icon     = isSearch ? "🔍" : isPlayed || isWon || isLost ? "🎮" : "📌";
              const badge    = isSearch
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : isWon
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : isLost
                ? "bg-red-500/20 text-red-300 border-red-500/30"
                : isPlayed
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                : "bg-white/10 text-gray-400 border-white/10";
              const label    = isSearch ? "Search" : isWon ? "Won" : isLost ? "Lost" : isPlayed ? "Played" : "Activity";
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 transition">
                  <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      {l.player_name && (
                        <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded-full">👤 {l.player_name}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge}`}>{label}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{l.activity}</p>
                    <p className="text-gray-500 text-xs mt-1">{fmtDateTime(l.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Games Tab */}
        {activeTab === "games" && (
          <div className="p-4 md:p-6">
            <p className="text-gray-400 text-sm mb-5">Enable or disable games for all players.</p>
            {gamesLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              ["Kids", "Teen", "Adult"].map(group => (
                <div key={group} className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-semibold">
                    {group === "Kids" ? "🧒" : group === "Teen" ? "🧑" : "🔞"} {group} Games
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ADMIN_GAMES.filter(g => g.group === group).map(game => {
                      const enabled = gameSettings[game.slug] !== false;
                      return (
                        <div key={game.slug} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                          enabled ? "bg-white/5 border-white/10" : "bg-red-500/5 border-red-500/20 opacity-60"
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{game.icon}</span>
                            <span className="text-white text-sm font-medium">{game.name}</span>
                          </div>
                          <button
                            onClick={() => toggleGame(game.slug, enabled)}
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                              enabled ? "bg-indigo-600" : "bg-white/10"
                            }`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
                              enabled ? "left-5" : "left-0.5"
                            }`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Play Stats Tab */}
        {activeTab === "gamestats" && (
          <div className="p-4 md:p-6">
            {gameStatsLoading || !gameStatsData ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Total Plays",   value: gameStatsData.totalPlays,      icon: "🎮", color: "border-indigo-500/30" },
                    { label: "Games Tracked", value: gameStatsData.totalGamesCount, icon: "📊", color: "border-cyan-500/30"   },
                    { label: "Most Played",   value: gameStatsData.mostPlayed,      icon: "🏆", color: "border-amber-500/30"  },
                  ].map(c => (
                    <div key={c.label} className={`bg-white/5 border ${c.color} rounded-2xl p-4`}>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{c.label}</p>
                      <p className="text-white font-bold text-xl truncate">{c.value}</p>
                      <span className="text-2xl opacity-30">{c.icon}</span>
                    </div>
                  ))}
                </div>

                {/* Daily plays bar chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                  <h3 className="text-white font-bold mb-4">📅 Plays Per Day (Last 7 Days)</h3>
                  <div className="flex items-end gap-2 h-28">
                    {gameStatsData.dailyPlays.map((d, i) => {
                      const max = Math.max(...gameStatsData.dailyPlays.map(x => x.count), 1);
                      const pct = (d.count / max) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-400">{d.count}</span>
                          <div className="w-full rounded-t-lg bg-indigo-500/80 transition-all" style={{ height: `${Math.max(pct, 4)}%` }} />
                          <span className="text-xs text-gray-500 truncate w-full text-center">{d.label.split(",")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plays per game table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
                  <div className="px-5 py-4 border-b border-white/10">
                    <h3 className="text-white font-bold">🎮 Plays Per Game</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="px-5 py-3 text-left">Game</th>
                          <th className="px-5 py-3 text-right">Plays</th>
                          <th className="px-5 py-3 text-right">Top Score</th>
                          <th className="px-5 py-3 text-right">Avg Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {gameStatsData.playsPerGame.length === 0 ? (
                          <tr><td colSpan={4} className="text-center text-gray-500 py-10 text-sm">No game data yet.</td></tr>
                        ) : gameStatsData.playsPerGame.map((g, i) => (
                          <tr key={i} className="hover:bg-white/5 transition">
                            <td className="px-5 py-3 text-white text-sm font-medium">{g.game}</td>
                            <td className="px-5 py-3 text-right">
                              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-bold">{g.plays}</span>
                            </td>
                            <td className="px-5 py-3 text-right text-amber-400 text-sm font-bold">{g.top_score}</td>
                            <td className="px-5 py-3 text-right text-gray-400 text-sm">{Math.round(Number(g.avg_score))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top players */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10">
                    <h3 className="text-white font-bold">🏆 Top Players</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {gameStatsData.topPlayers.length === 0 ? (
                      <p className="text-center text-gray-500 py-10 text-sm">No player data yet.</p>
                    ) : gameStatsData.topPlayers.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition">
                        <span className="text-lg w-7 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {p.player_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{p.player_name}</p>
                          <p className="text-gray-500 text-xs">{p.games_played} game{p.games_played !== 1 ? "s" : ""} played</p>
                        </div>
                        <span className="text-amber-400 font-black text-sm">{p.total_score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Daily Challenge Tab */}
        {activeTab === "dailychallenge" && (
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-400 text-sm">{challenges.length} challenge{challenges.length !== 1 ? "s" : ""} scheduled</p>
              <button
                onClick={() => { setDcEditing(null); setDcForm(BLANK); setShowDcForm(true); }}
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
              >
                + New Challenge
              </button>
            </div>
            {dcLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Game</th>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Target</th>
                      <th className="px-4 py-3 text-left">Bonus</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {challenges.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-gray-500 py-12 text-sm">No challenges scheduled yet.</td></tr>
                    ) : challenges.map(c => {
                      const isToday = c.challenge_date === new Date().toISOString().split("T")[0];
                      return (
                        <tr key={c.id} className="hover:bg-white/5 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm">{c.challenge_date}</span>
                              {isToday && <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full">Today</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-sm">{c.game}</td>
                          <td className="px-4 py-3 text-gray-200 text-sm max-w-[180px] truncate">{c.title}</td>
                          <td className="px-4 py-3 text-gray-400 text-sm">{c.target_type} &times; {c.target_value}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">{c.bonus_points} pts</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => { setDcEditing(c); setDcForm({ ...c }); setShowDcForm(true); }} className="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 flex items-center justify-center transition text-sm">✏️</button>
                              <button onClick={() => setDcDeleteTarget(c)} className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition text-sm">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Daily Challenge Form Modal ── */}
      {showDcForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowDcForm(false)}>
          <div className="bg-gray-950 border border-orange-500/40 rounded-3xl p-8 max-w-lg w-full shadow-2xl" style={{ boxShadow: "0 0 60px rgba(249,115,22,0.15)" }} onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-2xl mx-auto mb-5">📅</div>
            <h2 className="text-xl font-bold text-white text-center mb-1">{dcEditing ? "Edit Challenge" : "New Daily Challenge"}</h2>
            <p className="text-gray-500 text-sm text-center mb-6">{dcEditing ? "Update the scheduled challenge" : "Schedule a challenge for a specific date"}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Date</label>
                <input type="date" value={dcForm.challenge_date} onChange={e => setDcForm(f => ({ ...f, challenge_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Game</label>
                <select value={dcForm.game} onChange={e => setDcForm(f => ({ ...f, game: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition">
                  <option value="">— Select a game —</option>
                  {["Kids", "Teen", "Adult"].map(group => (
                    <optgroup key={group} label={`${group === "Kids" ? "🧒" : group === "Teen" ? "🧑" : "🔞"} ${group} Games`}>
                      {ADMIN_GAMES.filter(g => g.group === group).map(g => (
                        <option key={g.slug} value={g.name}>{g.icon} {g.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Target Type</label>
                <select value={dcForm.target_type} onChange={e => setDcForm(f => ({ ...f, target_type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition">
                  <option value="win">win</option>
                  <option value="score">score</option>
                  <option value="play">play</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Title</label>
                <input type="text" placeholder="Challenge title" value={dcForm.title} onChange={e => setDcForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition" />
              </div>
              <div className="col-span-2">
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Description</label>
                <textarea rows={2} placeholder="Brief description" value={dcForm.description} onChange={e => setDcForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition resize-none" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Target Value</label>
                <input type="number" min={1} value={dcForm.target_value} onChange={e => setDcForm(f => ({ ...f, target_value: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Bonus Points</label>
                <input type="number" min={0} value={dcForm.bonus_points} onChange={e => setDcForm(f => ({ ...f, bonus_points: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500 transition" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDcForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition font-medium text-sm">Cancel</button>
              <button
                disabled={dcSaving || !dcForm.challenge_date || !dcForm.game || !dcForm.title}
                onClick={async () => {
                  setDcSaving(true);
                  await fetch("/api/admin/daily-challenge", {
                    method: dcEditing ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dcEditing ? { ...dcForm, id: dcEditing.id } : dcForm),
                  });
                  setDcSaving(false);
                  setShowDcForm(false);
                  fetchChallenges();
                  showToast(dcEditing ? "Challenge updated!" : "Challenge created!", "success");
                }}
                className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center"
              >
                {dcSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : dcEditing ? "Save Changes" : "Create Challenge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Daily Challenge Delete Modal ── */}
      {dcDeleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setDcDeleteTarget(null)}>
          <div className="bg-gray-950 border border-red-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl" style={{ boxShadow: "0 0 60px rgba(239,68,68,0.15)" }} onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-2xl mx-auto mb-5 animate-pulse">🗑️</div>
            <h2 className="text-xl font-bold text-white text-center mb-1">Delete Challenge</h2>
            <p className="text-gray-500 text-sm text-center mb-5">This will permanently remove the challenge.</p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 font-semibold text-center mb-6 text-sm">
              {dcDeleteTarget.challenge_date} — {dcDeleteTarget.title}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDcDeleteTarget(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition font-medium text-sm">Cancel</button>
              <button
                disabled={dcDeleting}
                onClick={async () => {
                  setDcDeleting(true);
                  await fetch("/api/admin/daily-challenge", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: dcDeleteTarget.id }),
                  });
                  setDcDeleting(false);
                  setDcDeleteTarget(null);
                  fetchChallenges();
                  showToast("Challenge deleted.", "warning");
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center"
              >
                {dcDeleting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setEditTarget(null)}>
          <div className="bg-gray-950 border border-blue-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl" style={{ boxShadow: "0 0 60px rgba(99,102,241,0.2)" }} onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl mx-auto mb-5">✏️</div>
            <h2 className="text-xl font-bold text-white text-center mb-1">Edit Player</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Update player information</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditTarget(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition font-medium text-sm">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-gray-950 border border-red-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl" style={{ boxShadow: "0 0 60px rgba(239,68,68,0.15)" }} onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-2xl mx-auto mb-5 animate-pulse">🗑️</div>
            <h2 className="text-xl font-bold text-white text-center mb-1">Delete Player</h2>
            <p className="text-gray-500 text-sm text-center mb-5">This action cannot be undone.</p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 font-semibold text-center mb-6 text-sm break-words">
              {deleteTarget.player_name}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition font-medium text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center">
                {deleting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium transition-all duration-500 ${
        toast.msg ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      } ${toast.type === "warning" ? "bg-amber-600" : "bg-emerald-600"} text-white`}>
        <span>{toast.type === "warning" ? "⚠️" : "✅"}</span>
        {toast.msg}
      </div>
    </div>
  );
}
