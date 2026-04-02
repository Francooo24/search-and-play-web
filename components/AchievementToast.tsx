"use client";
import { useEffect, useState } from "react";

interface Badge { icon: string; name: string; description: string; }

interface Props { badges: Badge[]; onDone: () => void; }

export default function AchievementToast({ badges, onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!badges.length) return;
    setIdx(0); setVisible(true);
  }, [badges]);

  useEffect(() => {
    if (!badges.length) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (idx + 1 < badges.length) { setIdx(i => i + 1); setVisible(true); }
        else onDone();
      }, 400);
    }, 3000);
    return () => clearTimeout(t);
  }, [idx, badges]);

  if (!badges.length) return null;
  const badge = badges[idx];

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-400
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="flex items-center gap-4 bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-md border border-amber-400/50 rounded-2xl px-5 py-4 shadow-2xl shadow-orange-500/30 min-w-[280px] max-w-sm">
        <div className="text-4xl animate-bounce">{badge.icon}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-200 mb-0.5">🏆 Achievement Unlocked!</p>
          <p className="font-black text-white text-base leading-tight">{badge.name}</p>
          <p className="text-amber-100 text-xs mt-0.5">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}
