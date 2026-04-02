"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BackendStatusBanner() {
  const { data: session } = useSession();
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    async function check() {
      try {
        const res = await fetch("/api/backend-status");
        const data = await res.json();
        setOffline(!data.online);
      } catch {
        setOffline(true);
      }
    }

    check();
    // Re-check every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (!offline || dismissed || !session?.user) return null;

  return (
    <div className="w-full bg-red-500/15 border-b border-red-500/30 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-red-300">
        <span className="text-base">⚠️</span>
        <span>
          <b>Backend offline</b> — Scores won&apos;t be saved. Start Django:{" "}
          <code className="bg-red-500/20 px-1.5 py-0.5 rounded text-xs font-mono">
            cd backend &amp;&amp; venv\Scripts\activate &amp;&amp; python manage.py runserver 8000
          </code>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-400 hover:text-red-200 transition text-lg flex-shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
