"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";
import { useSound } from "@/lib/useSound";

const ALL_Q = [
  { word:"Happy",      def:"Feeling joy or pleasure",                    opts:["Feeling joy or pleasure","Feeling sad","Feeling angry","Feeling tired"],                                    level:"Easy" },
  { word:"Brave",      def:"Ready to face danger without fear",           opts:["Ready to face danger without fear","Easily scared","Very lazy","Deeply confused"],                          level:"Easy" },
  { word:"Ancient",   def:"Belonging to the very distant past",          opts:["Belonging to the very distant past","Very new","Very small","Very loud"],                                   level:"Easy" },
  { word:"Eloquent",  def:"Fluent and persuasive in speaking",           opts:["Fluent and persuasive in speaking","Completely silent","Very clumsy","Extremely shy"],                      level:"Medium" },
  { word:"Tenacious", def:"Holding firmly to a purpose",                 opts:["Holding firmly to a purpose","Easily giving up","Very forgetful","Extremely lazy"],                         level:"Medium" },
  { word:"Ambiguous", def:"Open to more than one interpretation",        opts:["Open to more than one interpretation","Completely clear","Very simple","Extremely obvious"],                level:"Medium" },
  { word:"Benevolent",def:"Well-meaning and kindly",                     opts:["Well-meaning and kindly","Extremely cruel","Very selfish","Deeply jealous"],                                level:"Medium" },
  { word:"Diligent",  def:"Having steady effort and care",               opts:["Having steady effort and care","Extremely lazy","Very careless","Deeply confused"],                         level:"Medium" },
  { word:"Ephemeral", def:"Lasting for a very short time",               opts:["Lasting for a very short time","Extremely large","Very old","Deeply emotional"],                            level:"Hard" },
  { word:"Ubiquitous",def:"Present everywhere",                          opts:["Present everywhere","Extremely rare","Very loud","Completely silent"],                                      level:"Hard" },
  { word:"Gregarious",def:"Fond of company and sociable",                opts:["Fond of company and sociable","Extremely shy","Very quiet","Deeply lonely"],                                level:"Hard" },
  { word:"Impeccable",def:"In accordance with the highest standards",    opts:["In accordance with the highest standards","Full of errors","Very ordinary","Completely wrong"],             level:"Hard" },
  { word:"Loquacious",def:"Tending to talk a great deal",                opts:["Tending to talk a great deal","Very quiet","Deeply reserved","Extremely shy"],                             level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   pts: 10, desc: "3 rounds, common everyday words" },
  Medium: { filter: "Medium", pts: 10, desc: "5 rounds, intermediate vocabulary" },
  Hard:   { filter: "Hard",   pts: 20, desc: "5 rounds, advanced & rare words" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function VocabQuizGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_Q>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const { playCorrect, playWrong } = useSound();

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_Q.filter(q => q.level === d)));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  if (!difficulty) return <DifficultySelect title="Vocabulary Quiz" icon="📚" subtitle="Choose the correct definition!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  function answer(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].def) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Vocab Quiz", score + (opt === questions[idx].def ? CONFIG[difficulty].pts : 0), difficulty); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 900);
  }


  const current = questions[idx];
  if (!current) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">📚 Vocabulary Quiz</span>
        <div className="flex gap-2">
          <HowToPlay title="Vocabulary Quiz" icon="📚" steps={[
            "📖 A word is shown on screen.",
            "🔤 Choose the correct definition from 4 options.",
            "✅ Correct answer = points based on difficulty.",
            "❌ Wrong answer = no points, next question loads.",
            "🏆 Complete all rounds to see your final score.",
          ]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Vocabulary Quiz</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Choose the correct definition!</p>
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
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">What does this word mean?</p>
            <p className="text-4xl font-extrabold text-amber-400">{current.word}</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            {current.opts.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 px-5 rounded-2xl text-sm font-semibold border-2 text-left transition
                  ${selected === opt ? opt === current.def ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.def ? "bg-green-500/30 border-green-400 text-green-300"
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
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition">🎯 Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VocabQuizPage() {
  return <GameErrorBoundary gameName="Vocabulary Quiz"><VocabQuizGame /></GameErrorBoundary>;
}
