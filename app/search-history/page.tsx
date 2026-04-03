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
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SearchHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    router.refresh();
    setLoading(true);
    fetch(`/api/search?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setHistory(d.history ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  async function deleteOne(id: number) {
    setHistory(h => h.filter(x => x.id !== id));
    await fetch("/api/search", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  }

  async function clearAll() {
    setHistory([]);
    await fetch("/api/search", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  }

  const filtered = history.filter(h => h.word.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-grow w-full max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white transition text-sm">← Back</Link>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            🔍 Search History
          </h1>
        </div>
        {history.length > 0 && (
          <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-3 py-1.5 rounded-lg transition">
            🗑️ Clear All
          </button>
        )}
      </div>

      {!loading && history.length > 0 && (
        <div className="relative mb-5">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter history..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs transition">✕</button>}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <p className="text-5xl">🔍</p>
          <p className="text-gray-400 font-semibold">{history.length === 0 ? "No search history yet" : `No results for "${search}"`}</p>
          <p className="text-gray-600 text-sm">{history.length === 0 ? "Words you search will appear here." : ""}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 rounded-xl bg-white/3 border border-white/8 hover:bg-white/5 group transition">
              <span className="text-gray-500 text-sm flex-shrink-0">🔍</span>
              <button
                onClick={() => router.push(`/search?word=${encodeURIComponent(item.word)}`)}
                className="flex-1 text-left text-sm text-gray-200 font-medium hover:text-orange-400 transition truncate"
              >
                {item.word}
              </button>
              <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(item.created_at)}</span>
              <button
                onClick={() => deleteOne(item.id)}
                className="text-gray-600 hover:text-red-400 transition text-xs opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
