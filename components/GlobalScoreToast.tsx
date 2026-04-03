"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ScoreResult } from "@/lib/submitScore";

function shareScore(score: number) {
  const text = `🎮 I just scored ${score} pts on Search & Play! Can you beat me?`;
  const url = typeof window !== "undefined" ? `${window.location.origin}/leaderboard` : "";
  return { text, url };
}

export default function GlobalScoreToast() {
  const [toast, setToast] = useState<{ result: ScoreResult; score: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const { result, score } = (e as CustomEvent).detail;
      setToast({ result, score });
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setToast(null), 300);
      }, 6000);
    };
    window.addEventListener("score-saved", handler);
    return () => window.removeEventListener("score-saved", handler);
  }, []);

  if (!toast) return null;
  const { result, score } = toast;

  const { text, url } = shareScore(score);
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
  const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className={`flex flex-col gap-2 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold
        ${result.saved
          ? "bg-green-500/20 border-green-500/40 text-green-300"
          : result.error === "not_logged_in"
          ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
          : "bg-red-500/20 border-red-500/40 text-red-300"
        }`}>
        {result.saved ? (
          <>
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span>✅</span>
              <span><b>{score} pts</b> saved to your profile!</span>
              <Link href="/profile" className="underline hover:text-white transition ml-1">View →</Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-400/70">Share:</span>
              <a href={fbUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              <a href={twUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-black hover:bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition border border-white/20">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </a>
            </div>
          </>
        ) : result.error === "not_logged_in" ? (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <span>🔒</span>
            <span>Sign in to save your score!</span>
            <Link href="/login" className="underline hover:text-white transition ml-1">Sign In →</Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <span>⚠️</span>
            <span>Score not saved — backend offline</span>
          </div>
        )}
      </div>
    </div>
  );
}
