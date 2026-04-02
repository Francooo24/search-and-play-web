"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";

const ALL_Q = [
  { q: "What planet is known as the Red Planet?", options: ["Mars","Venus","Jupiter","Saturn"], answer: "Mars", category: "Science" },
  { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens","William Shakespeare","Jane Austen","Homer"], answer: "William Shakespeare", category: "Literature" },
  { q: "What is the chemical symbol for water?", options: ["H2O","CO2","O2","NaCl"], answer: "H2O", category: "Science" },
  { q: "Which country has the largest population?", options: ["USA","India","China","Brazil"], answer: "India", category: "Geography" },
  { q: "What year did World War II end?", options: ["1943","1944","1945","1946"], answer: "1945", category: "History" },
  { q: "What is the fastest land animal?", options: ["Lion","Cheetah","Horse","Leopard"], answer: "Cheetah", category: "Science" },
  { q: "How many sides does a hexagon have?", options: ["5","6","7","8"], answer: "6", category: "Math" },
  { q: "What is the capital of Japan?", options: ["Seoul","Beijing","Tokyo","Bangkok"], answer: "Tokyo", category: "Geography" },
  { q: "Who painted the Mona Lisa?", options: ["Picasso","Van Gogh","Da Vinci","Michelangelo"], answer: "Da Vinci", category: "Arts" },
  { q: "What gas do plants absorb from the air?", options: ["Oxygen","Nitrogen","Carbon Dioxide","Hydrogen"], answer: "Carbon Dioxide", category: "Science" },
  { q: "What is the square root of 144?", options: ["11","12","13","14"], answer: "12", category: "Math" },
  { q: "Which ocean is the largest?", options: ["Atlantic","Indian","Arctic","Pacific"], answer: "Pacific", category: "Geography" },
  { q: "What is the powerhouse of the cell?", options: ["Nucleus","Ribosome","Mitochondria","Vacuole"], answer: "Mitochondria", category: "Science" },
  { q: "In what year did the Titanic sink?", options: ["1910","1912","1914","1916"], answer: "1912", category: "History" },
  { q: "What is 15% of 200?", options: ["25","30","35","40"], answer: "30", category: "Math" },
];

const CONFIG: Record<Difficulty, { total: number; timer: number; desc: string }> = {
  Easy:   { total: 6,  timer: 15, desc: "6 questions, 15 seconds each" },
  Medium: { total: 10, timer: 10, desc: "10 questions, 10 seconds each" },
  Hard:   { total: 15, timer: 6,  desc: "15 questions, only 6 seconds each!" },
};

const CAT_COLOR: Record<string, string> = {
  Science: "text-blue-400", Geography: "text-green-400",
  History: "text-yellow-400", Math: "text-purple-400",
  Literature: "text-pink-400", Arts: "text-orange-400",
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function TriviaBlitzGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [questions, setQuestions] = useState<typeof ALL_Q>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d); setQuestions(shuffle(ALL_Q).slice(0, CONFIG[d].total));
    setIdx(0); setScore(0); setSelected(null); setTimeLeft(CONFIG[d].timer); setDone(false);
  }

  useEffect(() => {
    if (!difficulty || selected || done || paused) return;
    if (timeLeft === 0) { handleAnswer(null); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, done, difficulty]);

  function handleAnswer(opt: string | null) {
    if (selected || !difficulty || paused) return;
    const pts = opt === questions[idx].answer ? timeLeft * 10 : 0;
    setSelected(opt ?? "__timeout__");
    if (pts > 0) setScore(s => s + pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Trivia Blitz", score + pts); return; }
      setIdx(i => i + 1); setSelected(null); setTimeLeft(CONFIG[difficulty].timer);
    }, 1000);
  }


  const current = questions[idx];
  if (!current) return <GameLoading />;
  const timerPct = (timeLeft / CONFIG[difficulty].timer) * 100;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🧠 Trivia Blitz</span>
        <div className="flex gap-2">
          <HowToPlay title="Trivia Blitz" icon="🧠" steps={[
            "❓ Answer multiple-choice questions from various categories.",
            "⏱ A timer bar counts down for each question.",
            "✅ Correct answer = time remaining × 10 points.",
            "⏰ If time runs out, the question is skipped automatically.",
            "🏆 Finish all questions to see your final score.",
          ]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Trivia Blitz</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Answer fast — the quicker you answer, the more points!</p>
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
            <div className="h-3 rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timeLeft > 5 ? "#22c55e" : timeLeft > 2 ? "#f97316" : "#ef4444" }} />
          </div>
          <p className={`text-sm font-bold mb-4 ${timeLeft <= 3 ? "text-red-400" : "text-gray-400"}`}>⏱ {timeLeft}s</p>
          <div className="glass-card rounded-2xl p-6 mb-4 w-full">
            <span className={`text-xs font-bold uppercase tracking-widest ${CAT_COLOR[current.category] ?? "text-gray-400"}`}>{current.category}</span>
            <p className="text-white font-semibold text-lg mt-2">{current.q}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => handleAnswer(opt)}
                className={`py-3 px-5 rounded-xl text-left font-semibold border-2 transition
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= 500 ? "🏆" : score >= 300 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Blitz Over!</p>
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

export default function TriviaBlitzPage() {
  return <GameErrorBoundary gameName="Trivia Blitz"><TriviaBlitzGame /></GameErrorBoundary>;
}
