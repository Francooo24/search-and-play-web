"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const ALL_Q = [
  { sentence: "A ___ is a baby dog.", answer: "puppy", options: ["puppy","kitten","cub","foal"], level: "Easy" },
  { sentence: "The ___ shines brightly in the sky.", answer: "sun", options: ["sun","moon","star","cloud"], level: "Easy" },
  { sentence: "We use a ___ to cut paper.", answer: "scissors", options: ["scissors","pen","ruler","eraser"], level: "Easy" },
  { sentence: "A ___ has eight legs.", answer: "spider", options: ["spider","ant","bee","fly"], level: "Easy" },
  { sentence: "We breathe in ___.", answer: "oxygen", options: ["oxygen","carbon","nitrogen","hydrogen"], level: "Medium" },
  { sentence: "The ___ of a triangle is 180 degrees.", answer: "sum", options: ["sum","area","base","height"], level: "Medium" },
  { sentence: "The ___ is the largest planet.", answer: "Jupiter", options: ["Jupiter","Mars","Saturn","Venus"], level: "Medium" },
  { sentence: "Water freezes at ___ degrees Celsius.", answer: "zero", options: ["zero","ten","fifty","hundred"], level: "Medium" },
  { sentence: "A ___ writes books.", answer: "author", options: ["author","doctor","teacher","pilot"], level: "Medium" },
  { sentence: "The ___ is the closest star to Earth.", answer: "Sun", options: ["Sun","Moon","Mars","Pluto"], level: "Medium" },
  { sentence: "The ___ is the basic unit of life.", answer: "cell", options: ["cell","atom","gene","organ"], level: "Hard" },
  { sentence: "A ___ is a word that describes a noun.", answer: "adjective", options: ["adjective","verb","adverb","pronoun"], level: "Hard" },
  { sentence: "The process by which plants make food is called ___.", answer: "photosynthesis", options: ["photosynthesis","respiration","digestion","osmosis"], level: "Hard" },
  { sentence: "The ___ War was fought from 1939 to 1945.", answer: "Second World", options: ["Second World","Cold","Vietnam","Korean"], level: "Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; total: number; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   total: 5,  pts: 10, desc: "5 simple fill-in-the-blank sentences" },
  Medium: { filter: "Medium", total: 8,  pts: 10, desc: "8 sentences covering science & general knowledge" },
  Hard:   { filter: "Hard",   total: 6,  pts: 20, desc: "6 challenging sentences with advanced vocabulary" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function FillInBlankGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_Q>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const pool = ALL_Q.filter(q => q.level === d);
    setQuestions(shuffle(pool).slice(0, CONFIG[d].total));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function answer(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].answer) setScore(s => s + CONFIG[difficulty].pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Fill in the Blank", score + (opt === questions[idx].answer ? CONFIG[difficulty].pts : 0)); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 900);
  }

  if (!difficulty) return <DifficultySelect title="Fill in the Blank" icon="✏️" subtitle="Complete the sentence with the right word!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">✏️ Fill in Blank</span>
        <div className="flex gap-2">
          <HowToPlay title="Fill in the Blank" icon="✏️" steps={["✏️ A sentence with a blank is shown.","👆 Pick the correct word to complete the sentence.","✅ Correct = points! ❌ Wrong = no points.","🏆 Complete all rounds to see your final score!"]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Fill in the Blank</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Complete the sentence with the right word!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="glass-card rounded-2xl p-6 mb-6 w-full text-center">
            <p className="text-xl text-white font-semibold leading-relaxed">{current.sentence}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 rounded-2xl text-base font-bold border-2 transition
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * CONFIG[difficulty].pts * 0.7 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} / {questions.length * CONFIG[difficulty].pts}</p>
          <p className={`text-sm mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition">Change Difficulty</button>
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FillInBlankPage() {
  return <GameErrorBoundary gameName="Fill in the Blank"><FillInBlankGame /></GameErrorBoundary>;
}
