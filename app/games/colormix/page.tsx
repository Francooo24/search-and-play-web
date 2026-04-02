"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";

const EASY_MIXES = [
  { color1:"Red", color2:"Blue", result:"Purple", options:["Purple","Green","Orange","Brown"], hex1:"#ef4444", hex2:"#3b82f6", hexResult:"#a855f7" },
  { color1:"Red", color2:"Yellow", result:"Orange", options:["Purple","Orange","Green","Pink"], hex1:"#ef4444", hex2:"#eab308", hexResult:"#f97316" },
  { color1:"Blue", color2:"Yellow", result:"Green", options:["Green","Purple","Orange","Brown"], hex1:"#3b82f6", hex2:"#eab308", hexResult:"#22c55e" },
  { color1:"Red", color2:"White", result:"Pink", options:["Pink","Purple","Orange","Red"], hex1:"#ef4444", hex2:"#f8fafc", hexResult:"#f9a8d4" },
];
const MEDIUM_MIXES = [
  ...EASY_MIXES,
  { color1:"Blue", color2:"White", result:"Light Blue", options:["Light Blue","Purple","Cyan","Teal"], hex1:"#3b82f6", hex2:"#f8fafc", hexResult:"#93c5fd" },
  { color1:"Red", color2:"Green", result:"Brown", options:["Brown","Orange","Purple","Black"], hex1:"#ef4444", hex2:"#22c55e", hexResult:"#92400e" },
  { color1:"Blue", color2:"Green", result:"Teal", options:["Teal","Cyan","Purple","Lime"], hex1:"#3b82f6", hex2:"#22c55e", hexResult:"#14b8a6" },
];
const HARD_MIXES = [
  ...MEDIUM_MIXES,
  { color1:"Yellow", color2:"White", result:"Cream", options:["Cream","Orange","Gold","Beige"], hex1:"#eab308", hex2:"#f8fafc", hexResult:"#fef9c3" },
  { color1:"Purple", color2:"Red", result:"Magenta", options:["Magenta","Maroon","Violet","Crimson"], hex1:"#a855f7", hex2:"#ef4444", hexResult:"#d946ef" },
  { color1:"Orange", color2:"Blue", result:"Brown", options:["Brown","Gray","Purple","Olive"], hex1:"#f97316", hex2:"#3b82f6", hexResult:"#78350f" },
];

const CONFIG: Record<Difficulty, { mixes: typeof EASY_MIXES; autoMix: boolean; pts: number; desc: string }> = {
  Easy:   { mixes: EASY_MIXES,   autoMix: true,  pts: 10, desc: "4 basic mixes, colors reveal automatically" },
  Medium: { mixes: MEDIUM_MIXES, autoMix: false, pts: 10, desc: "7 mixes, press Mix button to reveal" },
  Hard:   { mixes: HARD_MIXES,   autoMix: false, pts: 15, desc: "10 mixes including tricky combinations" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function ColorMixGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [questions, setQuestions] = useState<typeof EASY_MIXES>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [mixed, setMixed] = useState(false);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d); setQuestions(shuffle(CONFIG[d].mixes));
    setIdx(0); setScore(0); setSelected(null); setMixed(CONFIG[d].autoMix); setDone(false);
  }

  function pick(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].result) setScore(s => s + CONFIG[difficulty].pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Color Mix", score + (opt === questions[idx].result ? CONFIG[difficulty].pts : 0)); return; }
      setIdx(i => i + 1); setSelected(null); setMixed(CONFIG[difficulty].autoMix);
    }, 900);
  }



  const current = questions[idx];
  if (!current) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🌈 Color Mix</span>
        <div className="flex gap-2">
          <HowToPlay title="Color Mix" icon="🌈" steps={["🌈 Two colors are shown — see what they make when mixed.","🔀 On Medium/Hard press the Mix button to reveal the result.","👆 Pick the correct resulting color from 4 options.","✅ Correct = points! ❌ Wrong = no points."]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Color Mix</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Mix two colors and guess the result!</p>
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
          <div className="flex items-center gap-4 mb-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg" style={{ background: current.hex1 }} />
              <span className="text-white font-semibold text-sm">{current.color1}</span>
            </div>
            <span className="text-white text-3xl font-bold">+</span>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg" style={{ background: current.hex2 }} />
              <span className="text-white font-semibold text-sm">{current.color2}</span>
            </div>
            <span className="text-white text-3xl font-bold">=</span>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg transition-all duration-700" style={{ background: mixed ? current.hexResult : "#374151" }} />
              <span className="text-gray-400 text-sm">?</span>
            </div>
          </div>
          {!mixed ? (
            <button onClick={() => setMixed(true)} className="mb-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition">🔀 Mix Colors!</button>
          ) : (
            <>
              <p className="text-white font-semibold mb-4">What color did you get?</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {shuffle(current.options).map(opt => (
                  <button key={opt} onClick={() => pick(opt)}
                    className={`py-3 rounded-2xl text-sm font-bold border-2 transition
                      ${selected === opt ? opt === current.result ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                      : selected && opt === current.result ? "bg-green-500/30 border-green-400 text-green-300"
                      : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
                ))}
              </div>
            </>
          )}
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

export default function ColorMixPage() {
  return <GameErrorBoundary gameName="Color Mix"><ColorMixGame /></GameErrorBoundary>;
}
