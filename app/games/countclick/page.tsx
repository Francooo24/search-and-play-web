"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScoreCompat as submitScore, fetchBestScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const EMOJIS = ["🍎","🌟","🐶","🎈","🌸","🦋","🍕","⚽","🎵","🐱"];
const CONFIG: Record<Difficulty, { total: number; maxCount: number; pts: number; desc: string }> = {
  Easy:   { total: 8,  maxCount: 5,  pts: 10, desc: "8 rounds, count up to 5 objects" },
  Medium: { total: 10, maxCount: 9,  pts: 10, desc: "10 rounds, count up to 9 objects" },
  Hard:   { total: 12, maxCount: 15, pts: 15, desc: "12 rounds, count up to 15 objects" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function makeQ(maxCount: number) {
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const count = Math.floor(Math.random() * (maxCount - 1)) + 2;
  const wrong = new Set<number>();
  while (wrong.size < 3) { const n = Math.floor(Math.random() * maxCount) + 1; if (n !== count) wrong.add(n); }
  return { emoji, count, options: [count, ...Array.from(wrong)].sort(() => Math.random() - 0.5) };
}

function CountClickGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  const [q, setQ] = useState(() => makeQ(9));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  useEffect(() => { startGame("Hard"); }, []);
  useEffect(() => { fetchBestScore("Count & Click").then(setBestScore); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d); setQ(makeQ(CONFIG[d].maxCount));
    setScore(0); setRound(1); setSelected(null); setDone(false);
  }

  function answer(opt: number) {
    if (selected !== null || !difficulty || paused) return;
    setSelected(opt);
    const correct = opt === q.count;
    if (correct) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
    setTimeout(() => {
      if (round >= CONFIG[difficulty].total) { setDone(true); submitScore("Count & Click", score + (correct ? CONFIG[difficulty].pts : 0)).then(setNewBadges); return; }
      setRound(r => r + 1); setSelected(null); setQ(makeQ(CONFIG[difficulty].maxCount));
    }, 900);
  }

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔢 Count & Click</span>
        <div className="flex gap-2">
          <HowToPlay title="Count & Click" icon="🔢" steps={["🔢 Emojis appear on screen — count them carefully.","👆 Click the correct number from 4 choices.","✅ Correct = points! ❌ Wrong = no points.","🏆 Complete all rounds to see your final score!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Count & Click</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Count the objects and pick the right number!</p>
      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1 mb-4 w-full max-w-xs">
        {(["Easy","Medium","Hard"] as Difficulty[]).map(d => (
          <button key={d} onClick={() => startGame(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-200 ${ difficulty === d ? "bg-white/15 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>{d}</button>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{round} / {CONFIG[difficulty].total}</span>
        <span className="text-gray-400">|</span>
        <span className="text-yellow-400 text-sm font-semibold">🏆 Best: {bestScore}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="glass-card rounded-2xl p-6 mb-6 w-full flex flex-wrap gap-2 justify-center min-h-[100px]">
            {Array.from({ length: q.count }).map((_, i) => <span key={i} className="text-4xl">{q.emoji}</span>)}
          </div>
          <p className="text-white font-semibold mb-4">How many {q.emoji} are there?</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {q.options.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 rounded-2xl text-2xl font-bold border-2 transition
                  ${selected === opt ? opt === q.count ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected !== null && opt === q.count ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
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

export default function CountClickPage() {
  return <GameErrorBoundary gameName="Count & Click"><CountClickGame /></GameErrorBoundary>;
}
