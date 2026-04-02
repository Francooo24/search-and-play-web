"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ScoreResult } from "@/lib/submitScore";

interface Props {
  result: ScoreResult | null;
  score: number;
  game: string;
  onDone: () => void;
}

export default function ScoreToast({ result, score, game, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!result) return;
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 4000);
    return () => clearTimeout(t);
  }, [result]);

  if (!result) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold
        ${result.saved
          ? "bg-green-500/20 border-green-500/40 text-green-300"
          : result.error === "not_logged_in"
          ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
          : "bg-red-500/20 border-red-500/40 text-red-300"
        }`}>
        {result.saved ? (
          <>
            <span>✅</span>
            <span><b>{score} pts</b> saved to your profile!</span>
            <Link href="/profile" onClick={onDone} className="underline hover:text-white transition">View</Link>
          </>
        ) : result.error === "not_logged_in" ? (
          <>
            <span>🔒</span>
            <span>Sign in to save your score!</span>
            <Link href="/login" onClick={onDone} className="underline hover:text-white transition">Sign In</Link>
          </>
        ) : (
          <>
            <span>⚠️</span>
            <span>Score not saved — backend offline</span>
          </>
        )}
      </div>
    </div>
  );
}
