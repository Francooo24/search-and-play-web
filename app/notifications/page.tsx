"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Notification = { id: number; activity: string; created_at: string };

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function categorize(activity: string): { type: string; icon: string; color: string; bg: string; border: string } {
  const a = activity.toLowerCase();
  if (a.includes("won") || a.includes("played") || a.includes("lost"))
    return { type: "Games", icon: "🎮", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
  if (a.includes("searched"))
    return { type: "Search", icon: "🔍", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" };
  if (a.includes("achievement") || a.includes("unlocked"))
    return { type: "Achievement", icon: "🏆", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  if (a.includes("daily") || a.includes("challenge"))
    return { type: "Daily", icon: "⚡", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" };
  if (a.includes("saved") || a.includes("favorite"))
    return { type: "Saved", icon: "⭐", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
  if (a.includes("logged in"))
    return { type: "Login", icon: "🔐", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" };
  return { type: "Other", icon: "🔔", color: "text-gray-400", bg: "bg-white/5", border: "border-white/10" };
}

function groupByDate(items: Notification[]) {
  const groups: Record<string, Notification[]> = {};
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

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (status !== "authenticated") return;

    const prev = localStorage.getItem("notif_last_read") ?? new Date(0).toISOString();
    setLastRead(prev);

    fetch(`/api/notifications?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications ?? []);
        // Mark as read AFTER we've captured lastRead above, so newCount is accurate
        setTimeout(() => localStorage.setItem("notif_last_read", new Date().toISOString()), 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-[#0f0f18] border border-white/8 rounded-3xl p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl mx-auto mb-5">🔒</div>
          <h2 className="text-xl font-black text-white mb-2">Sign in to view notifications</h2>
          <p className="text-gray-500 text-sm mb-6">Your activity feed is saved to your account.</p>
          <Link href="/login" className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? notifications : notifications.filter(n => categorize(n.activity).type === filter);
  const grouped = groupByDate(filtered);
  const newCount = notifications.filter(n => new Date(n.created_at) > new Date(lastRead)).length;
  
  const categories = ["Games", "Search", "Achievement", "Daily", "Saved", "Login"];
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: notifications.filter(n => categorize(n.activity).type === cat).length,
    ...categorize(`${cat} test`),
  }));

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
              Activity Feed
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Notifi<span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">cations</span>
            </h1>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              Stay updated with your learning progress, achievements, and game activity.
            </p>
          </div>

          {/* Stats Overview */}
          {!loading && notifications.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-5 text-center">
                <p className="text-3xl font-black text-white mb-1">{notifications.length}</p>
                <p className="text-xs text-orange-300 uppercase tracking-widest font-bold">Total Activity</p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-2xl p-5 text-center">
                <p className="text-3xl font-black text-white mb-1">{categoryCounts.filter(c => c.count > 0).length}</p>
                <p className="text-xs text-purple-300 uppercase tracking-widest font-bold">Categories</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        
        {/* Category Filter */}
        {!loading && notifications.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === "all"
                  ? "bg-orange-500/20 border border-orange-500/40 text-orange-300"
                  : "bg-white/5 border border-white/8 text-gray-500 hover:text-gray-300"
              }`}
            >
              All <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{notifications.length}</span>
            </button>
            {categoryCounts.filter(c => c.count > 0).map(cat => (
              <button
                key={cat.name}
                onClick={() => setFilter(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  filter === cat.name
                    ? `${cat.bg} border ${cat.border} ${cat.color}`
                    : "bg-white/5 border border-white/8 text-gray-500 hover:text-gray-300"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{cat.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/3 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-4xl mb-2">
              🔔
            </div>
            <p className="text-xl font-bold text-white">
              {notifications.length === 0 ? "No activity yet" : `No ${filter} activity`}
            </p>
            <p className="text-gray-500 text-sm max-w-sm text-center">
              {notifications.length === 0
                ? "Play games, search words, or complete challenges to see your activity here."
                : `Try selecting a different category or view all notifications.`}
            </p>
            {notifications.length === 0 && (
              <Link href="/games" className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20">
                Start Playing →
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
                  <span className="text-xs text-gray-600 font-semibold">{items.length}</span>
                </div>

                <div className="space-y-2">
                  {items.map((n, idx) => {
                    const isNew = new Date(n.created_at) > new Date(lastRead);
                    const cat = categorize(n.activity);
                    return (
                      <div
                        key={n.id}
                        className={`group relative flex items-start gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 ${
                          isNew
                            ? "bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/5"
                            : "bg-[#0a0a12] border-white/8 hover:border-white/15 hover:bg-[#0f0f18]"
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {/* Timeline dot */}
                        <div className={`absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0a12] border-2 transition ${
                          isNew ? "border-orange-500" : "border-white/20 group-hover:border-orange-500/50"
                        }`} />
                        
                        <div className={`w-12 h-12 rounded-xl ${cat.bg} border ${cat.border} flex items-center justify-center flex-shrink-0 text-xl transition`}>
                          {cat.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.color}`}>{cat.type}</span>
                          </div>
                          <p className="text-white font-semibold text-sm leading-relaxed">{n.activity}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-600 text-xs">{timeAgo(n.created_at)}</p>
                            <span className="text-gray-700 text-xs">·</span>
                            <p className="text-gray-600 text-xs">{fmtDate(n.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
