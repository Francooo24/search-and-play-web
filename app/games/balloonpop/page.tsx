"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore, ScoreResult } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";
import ScoreToast from "@/components/ScoreToast";

const EASY_Q = [
  { question: "What letter comes after A?", answer: "B", options: ["B","C","D","E"] },
  { question: "What is 1 + 1?", answer: "2", options: ["2","3","4","1"] },
  { question: "What letter comes after D?", answer: "E", options: ["F","E","G","H"] },
  { question: "What is 2 + 2?", answer: "4", options: ["3","4","5","6"] },
  { question: "What letter comes after G?", answer: "H", options: ["H","I","J","K"] },
  { question: "What is 3 + 1?", answer: "4", options: ["4","5","3","6"] },
];
const MEDIUM_Q = [
  { question: "What is 5 - 2?", answer: "3", options: ["2","3","4","1"] },
  { question: "What letter comes after M?", answer: "N", options: ["N","O","P","L"] },
  { question: "What is 4 + 3?", answer: "7", options: ["6","7","8","5"] },
  { question: "What letter comes after S?", answer: "T", options: ["T","U","R","V"] },
  { question: "What is 6 + 4?", answer: "10", options: ["9","10","11","8"] },
  { question: "What letter comes after W?", answer: "X", options: ["X","Y","Z","V"] },
  { question: "What is 8 - 3?", answer: "5", options: ["4","5","6","3"] },
  { question: "What is 3 × 3?", answer: "9", options: ["6","8","9","12"] },
];
const HARD_Q = [
  { question: "What is 7 × 8?", answer: "56", options: ["48","54","56","63"] },
  { question: "What is 144 ÷ 12?", answer: "12", options: ["10","11","12","13"] },
  { question: "What is 15% of 60?", answer: "9", options: ["6","9","12","15"] },
  { question: "What is 2³?", answer: "8", options: ["6","8","9","12"] },
  { question: "What is √81?", answer: "9", options: ["7","8","9","10"] },
  { question: "What is 25 × 4?", answer: "100", options: ["80","90","100","110"] },
];

const CONFIG: Record<Difficulty, { questions: typeof EASY_Q; pts: number; desc: string }> = {
  Easy:   { questions: EASY_Q,   pts: 10, desc: "Simple letters & basic addition" },
  Medium: { questions: MEDIUM_Q, pts: 10, desc: "Mixed operations, alphabet gaps" },
  Hard:   { questions: HARD_Q,   pts: 20, desc: "Multiplication, division, percentages" },
};

const BALLOON_COLORS = ["bg-red-400","bg-blue-400","bg-green-400","bg-yellow-400"];
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function BalloonPopGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [questions, setQuestions] = useState<typeof EASY_Q>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [popped, setPopped] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  function startGame(d: Difficulty) {
    setDifficulty(d); setQuestions(shuffle(CONFIG[d].questions));
    setIdx(0); setScore(0); setPopped(null); setDone(false);
  }

  function pick(opt: string) {
    if (popped || !difficulty || paused) return;
    setPopped(opt);
    const correct = opt === questions[idx].answer;
    if (correct) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Balloon Pop", score + (correct ? CONFIG[difficulty].pts : 0)).then(r => { setScoreResult(r); setNewBadges(r.badges); }); return; }
      setIdx(i => i + 1); setPopped(null);
    }, 900);
  }



  const current = questions[idx];
  if (!current) return <GameLoading />;
  const opts = shuffle(current.options);

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🎈 Balloon Pop</span>
        <div className="flex gap-2">
          <HowToPlay title="Balloon Pop" icon="🎈" steps={["🎈 A question appears on screen.","👆 Pop the balloon that has the correct answer.","✅ Correct pop = points!","❌ Wrong pop = no points, next question loads.","🏆 Answer all questions to finish the game."]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Balloon Pop</h1>
      <p className="text-gray-400 text-sm mb-6 text-center">Pop the balloon with the correct answer!</p>
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
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="glass-card rounded-2xl p-6 mb-8 w-full text-center">
            <p className="text-white text-xl font-bold">{current.question}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full">
            {opts.map((opt, i) => (
              <button key={opt} onClick={() => pick(opt)} className={`relative flex flex-col items-center transition-all duration-300 ${popped === opt ? "scale-125 opacity-0" : "hover:scale-110"}`}>
                <div className={`w-24 h-24 rounded-full ${BALLOON_COLORS[i]} flex items-center justify-center text-white text-xl font-bold shadow-lg border-4 border-white/20`}>{opt}</div>
                <div className={`w-1 h-8 ${BALLOON_COLORS[i]} opacity-60 rounded-b-full`} />
              </button>
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
      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />
      <ScoreToast result={scoreResult} score={score} game="Balloon Pop" onDone={() => setScoreResult(null)} />
    </div>
  );
}

export default function BalloonPopPage() {
  return <GameErrorBoundary gameName="Balloon Pop"><BalloonPopGame /></GameErrorBoundary>;
}
