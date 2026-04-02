"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import { submitScore } from "@/lib/submitScore";

const ALL_Q = [
  { type:"prefix", blank:"___happy",      answer:"un",    options:["un","re","pre","mis"],          meaning:"not happy",                  level:"Easy" },
  { type:"suffix", blank:"care___",        answer:"ful",   options:["ful","less","ness","ment"],      meaning:"full of care",               level:"Easy" },
  { type:"suffix", blank:"hope___",        answer:"less",  options:["ful","less","ness","ly"],        meaning:"without hope",               level:"Easy" },
  { type:"prefix", blank:"___write",       answer:"re",    options:["un","re","dis","over"],          meaning:"write again",                level:"Easy" },
  { type:"prefix", blank:"___agree",       answer:"dis",   options:["un","re","dis","mis"],           meaning:"to not agree",               level:"Medium" },
  { type:"suffix", blank:"kind___",        answer:"ness",  options:["ful","less","ness","ment"],      meaning:"the quality of being kind",  level:"Medium" },
  { type:"prefix", blank:"___understand",  answer:"mis",   options:["un","re","dis","mis"],           meaning:"to understand wrongly",      level:"Medium" },
  { type:"suffix", blank:"govern___",      answer:"ment",  options:["ful","less","ness","ment"],      meaning:"the act of governing",       level:"Medium" },
  { type:"prefix", blank:"___view",        answer:"pre",   options:["pre","re","un","over"],          meaning:"to view before",             level:"Medium" },
  { type:"suffix", blank:"quick___",       answer:"ly",    options:["ly","ful","ness","ment"],        meaning:"in a quick manner",          level:"Medium" },
  { type:"prefix", blank:"___load",        answer:"over",  options:["over","under","re","pre"],       meaning:"to load too much",           level:"Hard" },
  { type:"suffix", blank:"dark___",        answer:"ness",  options:["ness","ful","less","ment"],      meaning:"the state of being dark",    level:"Hard" },
  { type:"prefix", blank:"___cook",        answer:"under", options:["under","over","re","pre"],       meaning:"not cooked enough",          level:"Hard" },
  { type:"suffix", blank:"help___",        answer:"ful",   options:["ful","less","ly","ment"],        meaning:"giving help",                level:"Hard" },
  { type:"prefix", blank:"___place",       answer:"re",    options:["re","un","dis","mis"],           meaning:"to place again",             level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   pts: 10, desc: "4 rounds, basic un-/re- prefixes and -ful/-less suffixes" },
  Medium: { filter: "Medium", pts: 10, desc: "6 rounds, intermediate prefixes and suffixes" },
  Hard:   { filter: "Hard",   pts: 15, desc: "5 rounds, over-/under- and advanced suffixes" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function PrefixSuffixGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_Q>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_Q.filter(q => q.level === d)));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function pick(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].answer) setScore(s => s + CONFIG[difficulty].pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Prefix & Suffix", score + (opt === questions[idx].answer ? CONFIG[difficulty].pts : 0)); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 1000);
  }

  if (!difficulty) return <DifficultySelect title="Prefix & Suffix" icon="🔤" subtitle="Complete the word with the correct prefix or suffix!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔤 Prefix & Suffix</span>
        <div className="flex gap-2">
          <HowToPlay title="Prefix & Suffix" icon="🔤" steps={["🔤 A word with a blank is shown (e.g. ___happy or care___).","💡 The meaning is shown as a hint.","👆 Pick the correct prefix or suffix from 4 options.","✅ Correct = points! ❌ Wrong = no points.","🏆 Complete all rounds to finish!"]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Prefix & Suffix</h1>
      <p className="text-gray-400 text-sm mb-6 text-center">Complete the word with the correct prefix or suffix!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="glass-card rounded-2xl p-6 mb-4 w-full text-center">
            <span className={`text-xs font-bold uppercase tracking-widest mb-2 block ${current.type === "prefix" ? "text-blue-400" : "text-purple-400"}`}>{current.type.toUpperCase()}</span>
            <p className="text-3xl font-bold text-white tracking-widest mb-3">
              {current.blank.split("___").map((part, i, arr) => (
                <span key={i}>{part}{i < arr.length - 1 && (selected ? <span className={selected === current.answer ? "text-green-400" : "text-red-400"}>{selected}</span> : <span className="text-gray-500">___</span>)}</span>
              ))}
            </p>
            <p className="text-gray-400 text-sm italic">"{current.meaning}"</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => pick(opt)}
                className={`py-4 rounded-2xl text-lg font-bold border-2 transition
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>-{opt}-</button>
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

export default function PrefixSuffixPage() {
  return <GameErrorBoundary gameName="Prefix & Suffix"><PrefixSuffixGame /></GameErrorBoundary>;
}
