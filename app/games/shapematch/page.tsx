"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScoreCompat as submitScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const SHAPES = [
  { name: "Circle", emoji: "⭕" }, { name: "Square", emoji: "🟥" },
  { name: "Triangle", emoji: "🔺" }, { name: "Diamond", emoji: "💎" },
  { name: "Star", emoji: "⭐" }, { name: "Heart", emoji: "❤️" },
  { name: "Pentagon", emoji: "⬠" }, { name: "Hexagon", emoji: "⬡" },
];
const CONFIG: Record<Difficulty, { total: number; timer: number; pts: number; desc: string }> = {
  Easy:   { total: 8,  timer: 20, pts: 10, desc: "8 rounds, 20 seconds per shape" },
  Medium: { total: 12, timer: 12, pts: 10, desc: "12 rounds, 12 seconds per shape" },
  Hard:   { total: 16, timer: 6,  pts: 15, desc: "16 rounds, only 6 seconds each!" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function makeQ() { const s = shuffle(SHAPES); return { target: s[0], options: shuffle(s.slice(0, 4)) }; }

function ShapeMatchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [q, setQ] = useState(makeQ);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [done, setDone] = useState(false);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!difficulty || done || selected || paused) return;
    if (timeLeft <= 0) { setSelected("__timeout__"); setTimeout(nextQ, 900); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, selected, difficulty]);

  function nextQ() {
    if (!difficulty) return;
    if (round >= CONFIG[difficulty].total) { setDone(true); submitScore("Shape Match", score).then(setNewBadges); return; }
    setRound(r => r + 1); setSelected(null); setTimeLeft(CONFIG[difficulty].timer); setQ(makeQ());
  }

  function answer(name: string) {
    if (selected || !difficulty || paused) return;
    setSelected(name);
    const correct = name === q.target.name;
    if (correct) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
    setTimeout(nextQ, 900);
  }

  function startGame(d: Difficulty) {
    setDifficulty(d); setQ(makeQ()); setScore(0); setRound(1); setSelected(null); setTimeLeft(CONFIG[d].timer); setDone(false);
  }



  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔷 Shape Match</span>
        <div className="flex gap-2">
          <HowToPlay title="Shape Match" icon="🔷" steps={["🔷 A shape emoji is shown on screen.","⏱ A timer counts down — answer before it hits 0!","👆 Pick the correct shape name from 4 options.","✅ Correct = points! ⏰ Timeout = no points.","🏆 Complete all rounds to finish!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Shape Match</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Match the shape before time runs out!</p>
      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1 mb-4 w-full max-w-xs">
        {(["Easy","Medium","Hard"] as Difficulty[]).map(d => (
          <button key={d} onClick={() => startGame(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-200 ${ difficulty === d ? "bg-white/15 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>{d}</button>
        ))}
      </div>
      <div className="flex gap-3 mb-6">
        {[["Score", String(score), "text-orange-400"], ["Round", `${round}/${CONFIG[difficulty].total}`, "text-white"], ["Time", `${timeLeft}s`, timeLeft <= 3 ? "text-red-400" : "text-blue-400"]].map(([label, val, color]) => (
          <div key={label} className={`bg-white/5 border ${timeLeft <= 3 && label === "Time" ? "border-red-400 bg-red-500/20" : "border-white/10"} rounded-xl px-4 py-2 text-center`}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-gray-400">Mode</p>
          <p className={`text-sm font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</p>
        </div>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="text-[100px] mb-4 leading-none">{q.target.emoji}</div>
          <p className="text-white font-semibold mb-6">What shape is this?</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {q.options.map(opt => (
              <button key={opt.name} onClick={() => answer(opt.name)}
                className={`py-4 rounded-2xl text-lg font-bold border-2 transition
                  ${selected === opt.name ? opt.name === q.target.name ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt.name === q.target.name ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= CONFIG[difficulty].total * CONFIG[difficulty].pts * 0.7 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} / {CONFIG[difficulty].total * CONFIG[difficulty].pts}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />
    </div>
  );
}

export default function ShapeMatchPage() {
  return <GameErrorBoundary gameName="Shape Match"><ShapeMatchGame /></GameErrorBoundary>;
}
