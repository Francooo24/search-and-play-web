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
type Op = "+" | "-" | "×" | "÷";
const CONFIG: Record<Difficulty, { total: number; ops: Op[]; range: number; pts: number; desc: string }> = {
  Easy:   { total: 8,  ops: ["+"],              range: 10, pts: 10, desc: "8 rounds, addition only, numbers up to 10" },
  Medium: { total: 10, ops: ["+", "-"],          range: 20, pts: 10, desc: "10 rounds, addition & subtraction up to 20" },
  Hard:   { total: 12, ops: ["+", "-", "×", "÷"], range: 12, pts: 15, desc: "12 rounds, all operations including × and ÷" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function makeQ(ops: Op[], range: number) {
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === "+") { a = Math.floor(Math.random() * range) + 1; b = Math.floor(Math.random() * range) + 1; answer = a + b; }
  else if (op === "-") { a = Math.floor(Math.random() * range) + 5; b = Math.floor(Math.random() * (a - 1)) + 1; answer = a - b; }
  else if (op === "×") { a = Math.floor(Math.random() * 9) + 1; b = Math.floor(Math.random() * 9) + 1; answer = a * b; }
  else { b = Math.floor(Math.random() * 9) + 1; answer = Math.floor(Math.random() * 9) + 1; a = b * answer; }
  const wrong = [answer + 1, answer - 1, answer + 2].filter(n => n !== answer && n > 0);
  return { a, b, op, answer, options: shuffle([answer, ...wrong.slice(0, 3)]) };
}

function SimpleMathGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [q, setQ] = useState(() => makeQ(["+"], 10));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  useEffect(() => { fetchBestScore("Simple Math").then(setBestScore); }, []);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d); setQ(makeQ(CONFIG[d].ops, CONFIG[d].range));
    setScore(0); setRound(1); setSelected(null); setDone(false);
  }

  function answer(opt: number) {
    if (selected !== null || !difficulty || paused) return;
    setSelected(opt);
    const correct = opt === q.answer;
    if (correct) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
    setTimeout(() => {
      if (round >= CONFIG[difficulty].total) { setDone(true); submitScore("Simple Math", score + (correct ? CONFIG[difficulty].pts : 0)).then(setNewBadges); return; }
      setRound(r => r + 1); setSelected(null); setQ(makeQ(CONFIG[difficulty].ops, CONFIG[difficulty].range));
    }, 900);
  }



  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">➕ Simple Math</span>
        <div className="flex gap-2">
          <HowToPlay title="Simple Math" icon="➕" steps={["➕ A math problem is shown on screen.","👆 Pick the correct answer from 4 options.","✅ Correct = points! ❌ Wrong = no points.","📊 Easy: addition only • Medium: +/− • Hard: all operations.","🏆 Complete all rounds to see your final score!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Simple Math</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Solve the math problem!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{round} / {CONFIG[difficulty].total}</span>
        <span className="text-gray-400">|</span>
        <span className="text-yellow-400 text-sm font-semibold">🏆 Best: {bestScore}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="glass-card rounded-2xl p-8 mb-8 text-center w-full">
            <p className="text-5xl font-extrabold text-white">{q.a} {q.op} {q.b} = ?</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {q.options.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 rounded-2xl text-2xl font-bold border-2 transition
                  ${selected === opt ? opt === q.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected !== null && opt === q.answer ? "bg-green-500/30 border-green-400 text-green-300"
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

export default function SimpleMathPage() {
  return <GameErrorBoundary gameName="Simple Math"><SimpleMathGame /></GameErrorBoundary>;
}
