"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type HistoryItem = { id: number; word: string; created_at: string };

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDate(items: HistoryItem[]) {
  const groups: Record<string, HistoryItem[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

  for (const item of items) {
    const d = new Date(item.created_at);
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label = "";
    if (dateOnly.getTime() === today.getTime()) label = "Today";
    else if (dateOnly.getTime() === yesterday.getTime()) label = "Yesterday";
    else if (dateOnly >= weekAgo) label = "This Week";
    else label = "Older";
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}

export default function SearchHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    router.refresh();
    setLoading(true);
    fetch(`/api/search?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setHistory(d.history ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, router]);

  async function deleteOne(id: number) {
    setHistory(h => h.filter(x => x.id !== id));
    await fetch("/api/search", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  }

  async function clearAll() {
    setHistory([]);
    setShowClearConfirm(false);
    await fetch("/api/search", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  }

  const filtered = history.filter(h => h.word.toLowerCase().includes(search.toLowerCase()));
  const grouped = groupByDate(filtered);
  const uniqueWords = new Set(history.map(h => h.word.toLowerCase())).size;
  const todayCount = history.filter(h => {
    const d = new Date(h.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="flex-grow w-full px-4 sm:px-6 py-8 md:py-10 relative z-10">
      
      {/* Hero Header */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-500 hover:text-white transition text-sm font-semibold flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Your Journey
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Search <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">History</span>
            </h1>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              Every word you search is a step toward mastering the English language. Track your learning journey here.
            </p>
          </div>

          {/* Stats Cards */}
          {!loading && history.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-5 text-center">
                <p className="text-3xl font-black text-white mb-1">{history.length}</p>
                <p className="text-xs text-blue-300 uppercase tracking-widest font-bold">Total Searches</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-2xl p-5 text-center">
                <p className="text-3xl font-black text-white mb-1">{uniqueWords}</p>
                <p className="text-xs text-purple-300 uppercase tracking-widest font-bold">Unique Words</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-5 text-center">
                <p className="text-3xl font-black text-white mb-1">{todayCount}</p>
                <p className="text-xs text-orange-300 uppercase tracking-widest font-bold">Today</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        
        {/* Search & Actions Bar */}
        {!loading && history.length > 0 && (
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter your history..."
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#0a0a12] border border-white/8 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/40 transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition text-sm font-bold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/3 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-4xl mb-2">
              🔍
            </div>
            <p className="text-xl font-bold text-white">
              {history.length === 0 ? "No search history yet" : `No results for "${search}"`}
            </p>
            <p className="text-gray-500 text-sm max-w-sm text-center">
              {history.length === 0 
                ? "Start searching for words to build your learning history. Every search brings you closer to mastery!"
                : "Try a different search term or clear your filter."}
            </p>
            {history.length === 0 && (
              <Link href="/" className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20">
                Start Searching →
              </Link>
            )}
          </div>
        )}

        {/* Timeline View */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([label, items]) => (
              <div key={label}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">{label}</h2>
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-gray-600 font-semibold">{items.length} {items.length === 1 ? "search" : "searches"}</span>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#0a0a12] border border-white/8 hover:border-orange-500/30 hover:bg-[#0f0f18] transition-all duration-200"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0a12] border-2 border-orange-500/30 group-hover:border-orange-500 transition" />
                      
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <button
                        onClick={() => router.push(`/search?word=${encodeURIComponent(item.word)}`)}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="text-white font-bold text-base group-hover:text-orange-400 transition truncate">
                          {item.word}
                        </p>
                        <p className="text-gray-600 text-xs mt-0.5">{timeAgo(item.created_at)}</p>
                      </button>

                      <button
                        onClick={() => deleteOne(item.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition opacity-0 group-hover:opacity-100 flex items-center justify-center flex-shrink-0"
                        title="Remove from history"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f18] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mx-auto mb-5">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-white text-center mb-2">Clear All History?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              This will permanently delete all {history.length} search{history.length !== 1 ? "es" : ""} from your history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={clearAll}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition font-bold"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
