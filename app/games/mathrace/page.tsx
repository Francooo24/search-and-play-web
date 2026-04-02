"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

type Q = { q: string; answer: number; options: number[]; level: string };

const EASY_Q: Q[] = [
  { q: "What is 25% of 80?", answer: 20, options: [15,20,25,30], level: "Percentage" },
  { q: "What is 10% of 350?", answer: 35, options: [30,35,40,45], level: "Percentage" },
  { q: "What is 50% of 60?", answer: 30, options: [25,30,35,40], level: "Percentage" },
  { q: "What is 20% of 50?", answer: 10, options: [8,10,12,15], level: "Percentage" },
  { q: "What is 75% of 40?", answer: 30, options: [25,28,30,32], level: "Percentage" },
];
const MEDIUM_Q: Q[] = [
  ...EASY_Q,
  { q: "Solve: x + 7 = 15, x = ?", answer: 8, options: [6,7,8,9], level: "Algebra" },
  { q: "Solve: 2x = 18, x = ?", answer: 9, options: [7,8,9,10], level: "Algebra" },
  { q: "Solve: x - 5 = 12, x = ?", answer: 17, options: [15,16,17,18], level: "Algebra" },
  { q: "Solve: x / 4 = 6, x = ?", answer: 24, options: [20,22,24,26], level: "Algebra" },
  { q: "Solve: 3x + 2 = 11, x = ?", answer: 3, options: [2,3,4,5], level: "Algebra" },
];
const HARD_Q: Q[] = [
  ...MEDIUM_Q,
  { q: "Solve: 5x - 3 = 22, x = ?", answer: 5, options: [4,5,6,7], level: "Algebra" },
  { q: "Solve: 2x + 6 = 20, x = ?", answer: 7, options: [5,6,7,8], level: "Algebra" },
  { q: "What is 15% of 200?", answer: 30, options: [25,28,30,35], level: "Percentage" },
  { q: "Solve: 4x - 8 = 16, x = ?", answer: 6, options: [5,6,7,8], level: "Algebra" },
  { q: "What is 35% of 140?", answer: 49, options: [42,46,49,56], level: "Percentage" },
];

const CONFIG: Record<Difficulty, { questions: Q[]; timer: number; total: number; desc: string }> = {
  Easy:   { questions: EASY_Q,   timer: 20, total: 5,  desc: "5 questions, percentages only, 20s each" },
  Medium: { questions: MEDIUM_Q, timer: 15, total: 8,  desc: "8 questions, algebra + percentages, 15s each" },
  Hard:   { questions: HARD_Q,   timer: 8,  total: 12, desc: "12 questions, harder problems, only 8s each!" },
};

const LEVEL_COLOR: Record<string, string> = { Algebra: "text-blue-400", Percentage: "text-purple-400" };
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function MathRaceGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d); setQuestions(shuffle(CONFIG[d].questions).slice(0, CONFIG[d].total));
    setIdx(0); setScore(0); setSelected(null); setTimeLeft(CONFIG[d].timer); setDone(false);
  }

  useEffect(() => {
    if (!difficulty || selected !== null || done || paused) return;
    if (timeLeft === 0) { handleAnswer(null); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, done, difficulty]);

  function handleAnswer(opt: number | null) {
    if (selected !== null || !difficulty || paused) return;
    setSelected(opt ?? -999);
    const pts = opt === questions[idx].answer ? Math.ceil(timeLeft / CONFIG[difficulty].timer * 100) : 0;
    if (pts > 0) setScore(s => s + pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Math Race", score + pts); return; }
      setIdx(i => i + 1); setSelected(null); setTimeLeft(CONFIG[difficulty].timer);
    }, 1000);
  }


  const current = questions[idx];
  if (!current) return null;
  const timerPct = (timeLeft / CONFIG[difficulty].timer) * 100;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🧮 Math Race</span>
        <div className="flex gap-2">
          <HowToPlay title="Math Race" icon="🧮" steps={["🧮 A math problem is shown with a countdown timer.","👆 Pick the correct answer before time runs out.","⏱ Faster answers = more points!","⏰ If time runs out, the question is skipped.","🏆 Complete all questions to see your final score."]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Math Race</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Solve fast — speed earns more points!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-4 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="w-full bg-white/10 rounded-full h-3 mb-2">
            <div className="h-3 rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timeLeft > 8 ? "#22c55e" : timeLeft > 3 ? "#f97316" : "#ef4444" }} />
          </div>
          <p className={`text-sm font-bold mb-4 ${timeLeft <= 3 ? "text-red-400" : "text-gray-400"}`}>⏱ {timeLeft}s</p>
          <div className="glass-card rounded-2xl p-6 mb-6 w-full text-center">
            <span className={`text-xs font-bold uppercase tracking-widest block mb-2 ${LEVEL_COLOR[current.level]}`}>{current.level}</span>
            <p className="text-white font-bold text-xl">{current.q}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => handleAnswer(opt)}
                className={`py-4 rounded-2xl text-xl font-bold border-2 transition
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected !== null && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= 700 ? "🏆" : score >= 400 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Race Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Final Score: {score}</p>
          <p className={`text-sm mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MathRacePage() {
  return <GameErrorBoundary gameName="Math Race"><MathRaceGame /></GameErrorBoundary>;
}
