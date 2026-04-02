import React from "react";

export type Difficulty = "Easy" | "Medium" | "Hard";

export const DIFF_STYLES: Record<Difficulty, { color: string; border: string; bg: string; badge: string }> = {
  Easy:   { color: "text-green-400",  border: "border-green-500/40",  bg: "bg-green-500/10",  badge: "bg-green-500/20 text-green-400 border-green-500/30"  },
  Medium: { color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/10", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  Hard:   { color: "text-red-400",    border: "border-red-500/40",    bg: "bg-red-500/10",    badge: "bg-red-500/20 text-red-400 border-red-500/30"         },
};

interface Props {
  title: string;
  icon: string;
  subtitle: string;
  descriptions: Record<Difficulty, string>;
  onSelect: (d: Difficulty) => void;
}

export default function DifficultySelect({ title, icon, subtitle, descriptions, onSelect }: Props) {
  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <div className="w-full flex justify-start mb-6">
        <a href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</a>
      </div>
      <div className="text-6xl mb-3">{icon}</div>
      <h1 className="text-4xl font-bold text-white mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
      <p className="text-gray-400 text-sm mb-8 text-center">{subtitle}</p>
      <p className="text-white font-semibold mb-4 text-lg">Select Difficulty</p>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {(["Easy", "Medium", "Hard"] as Difficulty[]).map(d => (
          <button key={d} onClick={() => onSelect(d)}
            className={`py-4 px-6 rounded-2xl border-2 ${DIFF_STYLES[d].border} ${DIFF_STYLES[d].bg} text-left transition hover:scale-105`}>
            <p className={`font-bold text-lg ${DIFF_STYLES[d].color}`}>{d}</p>
            <p className="text-gray-400 text-sm mt-0.5">{descriptions[d]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
