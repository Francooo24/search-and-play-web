"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BackendStatusBanner() {
  const { data: session } = useSession();
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  async function check() {
    try {
      const res = await fetch("/api/backend-status");
      const data = await res.json();
      setOffline(!data.online);
    } catch {
      setOffline(true);
    }
  }

  useEffect(() => {
    if (!session?.user) return;
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [session]);

  const handleRetry = async () => {
    setRetrying(true);
    await check();
    setRetrying(false);
  };

  if (!offline || dismissed || !session?.user) return null;

  return (
    <div className="w-full bg-orange-500/10 border-b border-orange-500/20 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-orange-300">
        <span className="text-base">⏳</span>
        <span>Game server is starting up — scores may not save for a moment.</span>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="text-xs underline hover:text-orange-200 transition disabled:opacity-50"
        >
          {retrying ? "Checking..." : "Retry"}
        </button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-orange-400 hover:text-orange-200 transition text-lg flex-shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
