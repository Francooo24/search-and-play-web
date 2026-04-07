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
  return `${Math.floor(diff / 86400)}d ago`;
}

function getIcon(activity: string) {
  if (activity.toLowerCase().includes("played") || activity.toLowerCase().includes("won") || activity.toLowerCase().includes("lost")) return "🎮";
  if (activity.toLowerCase().includes("searched")) return "🔍";
  if (activity.toLowerCase().includes("achievement")) return "🏆";
  if (activity.toLowerCase().includes("daily")) return "⚡";
  if (activity.toLowerCase().includes("saved")) return "⭐";
  if (activity.toLowerCase().includes("logged in")) return "🔐";
  return "🔔";
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useState<string>("");

  useEffect(() => {
    if (status !== "authenticated") return;

    // Get last read time before marking as read
    const prev = localStorage.getItem("notif_last_read") ?? new Date(0).toISOString();
    setLastRead(prev);

    // Mark all as read now
    const now = new Date().toISOString();
    localStorage.setItem("notif_last_read", now);

    fetch(`/api/notifications?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setNotifications(d.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-gray-400">Please <Link href="/login" className="text-orange-400 underline">sign in</Link> to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-gray-400 hover:text-white transition text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          🔔 Notifications
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <p className="text-5xl">🔔</p>
          <p className="text-gray-400 font-semibold">No activity yet</p>
          <p className="text-gray-600 text-sm">Play games or search words to see your activity here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const isNew = new Date(n.created_at) > new Date(lastRead);
            return (
              <div key={n.id}
                className={`flex items-start gap-4 px-5 py-4 rounded-xl border transition
                  ${isNew
                    ? "bg-orange-500/8 border-orange-500/25"
                    : "bg-white/3 border-white/8 hover:bg-white/5"
                  }`}>
                <span className="text-xl mt-0.5 flex-shrink-0">{getIcon(n.activity)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-200 font-medium">{n.activity}</p>
                    {isNew && (
                      <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">NEW</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
