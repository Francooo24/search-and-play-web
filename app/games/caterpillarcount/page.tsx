"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";

const EMOJIS = ["🐛","🍎","⭐","🌸","🐝","🍭","🎈","🦋","🍄","🐞"];
const CONFIG: Record<Difficulty, { total: number; min: number; max: number; pts: number; desc: string }> = {
  Easy:   { total: 8,  min: 2, max: 5,  pts: 10, desc: "8 rounds, count 2–5 emojis" },
  Medium: { total: 10, min: 3, max: 10, pts: 10, desc: "10 rounds, count 3–10 emojis" },
  Hard:   { total: 12, min: 8, max: 20, pts: 15, desc: "12 rounds, count 8–20 emojis!" },
};

function makeQ(min: number, max: number) {
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const wrong = new Set<number>();
  while (wrong.size < 3) { const n = Math.floor(Math.random() * max) + 1; if (n !== count) wrong.add(n); }
  return { emoji, count, options: [count, ...Array.from(wrong)].sort(() => Math.random() - 0.5) };
}

function CaterpillarCountGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [questions, setQuestions] = useState<ReturnType<typeof makeQ>[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(Array.from({ length: CONFIG[d].total }, () => makeQ(CONFIG[d].min, CONFIG[d].max)));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function pick(opt: number) {
    if (selected !== null || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].count) setScore(s => s + CONFIG[difficulty].pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Caterpillar Count", score + (opt === questions[idx].count ? CONFIG[difficulty].pts : 0)); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 900);
  }



  const current = questions[idx];
  if (!current) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🐛 Caterpillar Count</span>
        <div className="flex gap-2">
          <HowToPlay title="Caterpillar Count" icon="🐛" steps={["🐛 A group of emojis is shown on screen.","🔢 Count how many emojis you see.","👆 Pick the correct number from 4 options.","✅ Correct = points! ❌ Wrong = no points.","🏆 Complete all rounds to finish!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Caterpillar Count</h1>
      <p className="text-gray-400 text-sm mb-6 text-center">Count the emojis and pick the right number!</p>
      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1 mb-4 w-full max-w-xs">
        {(["Easy","Medium","Hard"] as Difficulty[]).map(d => (
          <button key={d} onClick={() => startGame(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-200 ${ difficulty === d ? "bg-white/15 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>{d}</button>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="glass-card rounded-2xl p-6 mb-4 w-full">
            <div className="flex flex-wrap justify-center gap-1">
              {Array.from({ length: current.count }).map((_, i) => <span key={i} className="text-3xl leading-none">{current.emoji}</span>)}
            </div>
          </div>
          <p className="text-white font-semibold mb-1">How many {current.emoji} do you see?</p>
          <p className="text-orange-300 text-xs mb-4">💡 Count carefully — pick the correct number!</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => pick(opt)}
                className={`py-4 rounded-2xl text-2xl font-bold border-2 transition
                  ${selected === opt ? opt === current.count ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected !== null && opt === current.count ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * CONFIG[difficulty].pts * 0.7 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} / {questions.length * CONFIG[difficulty].pts}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaterpillarCountPage() {
  return <GameErrorBoundary gameName="Caterpillar Count"><CaterpillarCountGame /></GameErrorBoundary>;
}
