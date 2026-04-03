"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";
import { submitScore, fetchBestScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";

const ALL_FLAGS = [
  { flag:"https://flagcdn.com/w320/jp.png", country:"Japan", options:["Japan","China","South Korea","Vietnam"] },
  { flag:"https://flagcdn.com/w320/br.png", country:"Brazil", options:["Brazil","Argentina","Colombia","Chile"] },
  { flag:"https://flagcdn.com/w320/fr.png", country:"France", options:["France","Belgium","Italy","Spain"] },
  { flag:"https://flagcdn.com/w320/de.png", country:"Germany", options:["Germany","Austria","Switzerland","Netherlands"] },
  { flag:"https://flagcdn.com/w320/au.png", country:"Australia", options:["Australia","New Zealand","Canada","UK"] },
  { flag:"https://flagcdn.com/w320/in.png", country:"India", options:["India","Pakistan","Bangladesh","Sri Lanka"] },
  { flag:"https://flagcdn.com/w320/mx.png", country:"Mexico", options:["Mexico","Colombia","Peru","Venezuela"] },
  { flag:"https://flagcdn.com/w320/za.png", country:"South Africa", options:["South Africa","Nigeria","Kenya","Ghana"] },
  { flag:"https://flagcdn.com/w320/sa.png", country:"Saudi Arabia", options:["Saudi Arabia","UAE","Qatar","Kuwait"] },
  { flag:"https://flagcdn.com/w320/kr.png", country:"South Korea", options:["South Korea","Japan","China","North Korea"] },
  { flag:"https://flagcdn.com/w320/it.png", country:"Italy", options:["Italy","France","Spain","Portugal"] },
  { flag:"https://flagcdn.com/w320/ca.png", country:"Canada", options:["Canada","USA","Australia","UK"] },
  { flag:"https://flagcdn.com/w320/ru.png", country:"Russia", options:["Russia","Ukraine","Belarus","Poland"] },
  { flag:"https://flagcdn.com/w320/eg.png", country:"Egypt", options:["Egypt","Libya","Sudan","Morocco"] },
  { flag:"https://flagcdn.com/w320/ar.png", country:"Argentina", options:["Argentina","Brazil","Chile","Uruguay"] },
  { flag:"https://flagcdn.com/w320/ph.png", country:"Philippines", options:["Philippines","Indonesia","Malaysia","Thailand"] },
  { flag:"https://flagcdn.com/w320/ng.png", country:"Nigeria", options:["Nigeria","Ghana","Kenya","Ethiopia"] },
  { flag:"https://flagcdn.com/w320/tr.png", country:"Turkey", options:["Turkey","Iran","Iraq","Syria"] },
  { flag:"https://flagcdn.com/w320/pl.png", country:"Poland", options:["Poland","Czech Republic","Hungary","Slovakia"] },
  { flag:"https://flagcdn.com/w320/se.png", country:"Sweden", options:["Sweden","Norway","Denmark","Finland"] },
];

const CONFIG: Record<Difficulty, { total: number; streakBonus: boolean; desc: string }> = {
  Easy:   { total: 6,  streakBonus: false, desc: "6 flags, major well-known countries" },
  Medium: { total: 12, streakBonus: true,  desc: "12 flags, streak bonus at 3+ correct" },
  Hard:   { total: 20, streakBonus: true,  desc: "All 20 flags, streak bonus active!" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function FlagQuizGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [questions, setQuestions] = useState<typeof ALL_FLAGS>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const { playCorrect, playWrong } = useSound();

  useEffect(() => { fetchBestScore("Flag Quiz").then(setBestScore); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d); setQuestions(shuffle(ALL_FLAGS).slice(0, CONFIG[d].total));
    setIdx(0); setScore(0); setSelected(null); setDone(false); setStreak(0);
  }

  function pick(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].country) {
      const newStreak = streak + 1; setStreak(newStreak);
      setScore(s => s + (CONFIG[difficulty].streakBonus && newStreak >= 3 ? 20 : 10));
      playCorrect();
    } else { setStreak(0); playWrong(); }
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Flag Quiz", score + (opt === questions[idx].country ? (CONFIG[difficulty].streakBonus && streak + 1 >= 3 ? 20 : 10) : 0)); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 1000);
  }


  const current = questions[idx];
  if (!current) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🗺️ Flag Quiz</span>
        <div className="flex gap-2">
          <HowToPlay title="Flag Quiz" icon="🗺️" steps={["🗺️ A country flag image is shown.","👆 Pick the correct country name from 4 options.","✅ Correct = +10 pts (or +20 pts on a 3+ streak!).","🔥 Keep a streak going for bonus points on Medium/Hard.","🏆 Complete all flags to see your final score!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Flag Quiz</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Guess the country from its flag!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center flex-wrap">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
        {streak >= 3 && <span className="text-yellow-400 text-sm font-bold">🔥 {streak} streak!</span>}
        <span className="text-gray-400">|</span>
        <span className="text-yellow-400 text-sm font-semibold">🏆 Best: {bestScore}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="mb-6 select-none flex items-center justify-center">
            <img src={current.flag} alt="Flag" className="w-48 h-32 object-cover rounded-xl shadow-lg border border-white/10" />
          </div>
          <p className="text-white font-semibold mb-4">Which country does this flag belong to?</p>
          <div className="grid grid-cols-1 gap-3 w-full">
            {shuffle(current.options).map(opt => (
              <button key={opt} onClick={() => pick(opt)}
                className={`py-3 px-5 rounded-xl font-semibold border-2 transition text-left
                  ${selected === opt ? opt === current.country ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.country ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * 10 * 0.8 ? "🏆" : score >= questions.length * 10 * 0.5 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Quiz Done!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score}</p>
          <p className={`text-sm mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlagQuizPage() {
  return <GameErrorBoundary gameName="Flag Quiz"><FlagQuizGame /></GameErrorBoundary>;
}
