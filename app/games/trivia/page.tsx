"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore, ScoreResult } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";
import ScoreToast from "@/components/ScoreToast";
import { useSound } from "@/lib/useSound";

const ALL_Q = [
  { q:"What is the capital of France?",              a:"Paris",       opts:["Paris","London","Berlin","Madrid"],              level:"Easy" },
  { q:"How many sides does a hexagon have?",         a:"6",           opts:["5","6","7","8"],                                 level:"Easy" },
  { q:"What is the fastest land animal?",            a:"Cheetah",     opts:["Lion","Cheetah","Horse","Leopard"],              level:"Easy" },
  { q:"How many colors are in a rainbow?",           a:"7",           opts:["5","6","7","8"],                                 level:"Easy" },
  { q:"What is the largest ocean?",                  a:"Pacific",     opts:["Atlantic","Pacific","Indian","Arctic"],          level:"Medium" },
  { q:"Who wrote Romeo and Juliet?",                 a:"Shakespeare", opts:["Dickens","Shakespeare","Hemingway","Twain"],     level:"Medium" },
  { q:"What is the chemical symbol for gold?",       a:"Au",          opts:["Go","Gd","Au","Ag"],                             level:"Medium" },
  { q:"How many planets are in our solar system?",   a:"8",           opts:["7","8","9","10"],                                level:"Medium" },
  { q:"What language has the most native speakers?", a:"Mandarin",    opts:["English","Spanish","Mandarin","Hindi"],          level:"Medium" },
  { q:"What is the square root of 144?",             a:"12",          opts:["11","12","13","14"],                             level:"Medium" },
  { q:"What is the smallest country in the world?",  a:"Vatican City",opts:["Monaco","Vatican City","Nauru","Liechtenstein"],level:"Hard" },
  { q:"How many bones are in the human body?",       a:"206",         opts:["196","206","216","226"],                         level:"Hard" },
  { q:"What is the hardest natural substance?",      a:"Diamond",     opts:["Gold","Iron","Diamond","Quartz"],                level:"Hard" },
  { q:"What is the longest river in the world?",     a:"Nile",        opts:["Amazon","Nile","Yangtze","Mississippi"],         level:"Hard" },
  { q:"Which planet is known as the Red Planet?",    a:"Mars",        opts:["Venus","Mars","Jupiter","Saturn"],               level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; timer: number; total: number; desc: string }> = {
  Easy:   { filter: "Easy",   timer: 15, total: 4,  desc: "4 questions, 15 seconds each" },
  Medium: { filter: "Medium", timer: 10, total: 6,  desc: "6 questions, 10 seconds each" },
  Hard:   { filter: "Hard",   timer: 6,  total: 5,  desc: "5 hard questions, only 6 seconds each!" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function TriviaGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_Q>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const { playCorrect, playWrong } = useSound();

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_Q.filter(q => q.level === d)).slice(0, CONFIG[d].total));
    setIdx(0); setScore(0); setSelected(null); setTimeLeft(CONFIG[d].timer); setDone(false);
  }

  useEffect(() => {
    if (!difficulty || done || selected || paused) return;
    if (timeLeft <= 0) { setSelected("__timeout__"); setTimeout(() => next(0), 1000); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, selected, difficulty]);

  if (!difficulty) return <DifficultySelect title="Speed Trivia" icon="🧠" subtitle="Answer fast — more time left = more points!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  function answer(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    const pts = opt === questions[idx].a ? timeLeft * 5 : 0;
    if (pts > 0) { setScore(s => s + pts); playCorrect(); } else { playWrong(); }
    setTimeout(() => next(pts), 900);
  }

  function next(pts = 0) {
    if (!difficulty) return;
    if (idx + 1 >= questions.length) { setDone(true); submitScore("Speed Trivia", score + pts, difficulty ?? undefined).then(setScoreResult); return; }
    setIdx(i => i + 1); setSelected(null); setTimeLeft(CONFIG[difficulty].timer);
  }


  const current = questions[idx];
  if (!current) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🧠 Speed Trivia</span>
        <div className="flex gap-2">
          <HowToPlay title="Speed Trivia" icon="🧠" steps={[
            "❓ You will be shown a multiple-choice question.",
            "⏱ A timer counts down — answer before it hits 0!",
            "✅ Correct answer = time remaining × 5 points.",
            "⏰ If time runs out, the question is skipped.",
            "🏆 Finish all questions to see your final score.",
          ]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Speed Trivia</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Answer fast — more time left = more points!</p>
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {[["Score", score, "text-orange-400"], ["Time", `${timeLeft}s`, timeLeft <= 3 ? "text-red-400" : "text-blue-400"], ["Q", `${idx + 1}/${questions.length}`, "text-white"]].map(([l,v,c]) => (
          <div key={l as string} className={`border rounded-xl px-4 py-2 text-center ${l === "Time" && timeLeft <= 3 ? "bg-red-500/20 border-red-400" : "bg-white/5 border-white/10"}`}>
            <p className="text-xs text-gray-400">{l}</p>
            <p className={`text-xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-gray-400">Mode</p>
          <p className={`text-sm font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</p>
        </div>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="glass-card rounded-2xl p-6 mb-6 w-full text-center">
            <p className="text-xl text-white font-semibold">{current.q}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.opts.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 rounded-2xl text-base font-bold border-2 transition
                  ${selected === opt ? opt === current.a ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.a ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= 200 ? "🏆" : score >= 100 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score}</p>
          <p className={`text-sm mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition">🎯 Change Difficulty</button>
          </div>
        </div>
      )}
      <ScoreToast result={scoreResult} score={score} game="Speed Trivia" onDone={() => setScoreResult(null)} />
    </div>
  );
}

export default function TriviaPage() {
  return <GameErrorBoundary gameName="Speed Trivia"><TriviaGame /></GameErrorBoundary>;
}
