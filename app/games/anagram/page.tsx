"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";

const ALL_ANAGRAMS = [
  { word:"RACE",    anagram:"CARE",    hint:"To feel concern for someone",          level:"Easy" },
  { word:"EVIL",    anagram:"VILE",    hint:"Extremely unpleasant",                 level:"Easy" },
  { word:"EARTH",   anagram:"HEART",   hint:"The organ that pumps blood",           level:"Easy" },
  { word:"NIGHT",   anagram:"THING",   hint:"An object or item",                    level:"Easy" },
  { word:"LISTEN",  anagram:"SILENT",  hint:"Quiet, making no sound",               level:"Medium" },
  { word:"DUSTY",   anagram:"STUDY",   hint:"To learn or examine carefully",        level:"Medium" },
  { word:"BELOW",   anagram:"ELBOW",   hint:"Joint in the middle of your arm",      level:"Medium" },
  { word:"RESCUE",  anagram:"SECURE",  hint:"Safe and protected",                   level:"Medium" },
  { word:"MASTER",  anagram:"STREAM",  hint:"A small river",                        level:"Hard" },
  { word:"PLATES",  anagram:"STAPLE",  hint:"A basic or essential item",            level:"Hard" },
  { word:"ENLIST",  anagram:"TINSEL",  hint:"Shiny decorative strips",              level:"Hard" },
  { word:"INLETS",  anagram:"LISTEN",  hint:"To pay attention to sound",            level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   pts: 10, desc: "4 rounds, short 4-letter anagrams" },
  Medium: { filter: "Medium", pts: 15, desc: "4 rounds, 5-6 letter anagrams" },
  Hard:   { filter: "Hard",   pts: 20, desc: "4 rounds, tricky 6-letter anagrams" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function AnagramGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_ANAGRAMS>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_ANAGRAMS.filter(q => q.level === d)));
    setIdx(0); setInput(""); setScore(0); setChecked(false); setCorrect(false); setDone(false);
  }

  if (!mounted || !difficulty) {
    return (
      <DifficultySelect
        title="Anagram Master"
        icon="🔀"
        subtitle="Rearrange the letters to form a new word!"
        descriptions={{
          Easy:   CONFIG.Easy.desc,
          Medium: CONFIG.Medium.desc,
          Hard:   CONFIG.Hard.desc,
        }}
        onSelect={startGame}
      />
    );
  }

  function check() {
    if (paused || !difficulty) return;
    const isCorrect = input.trim().toUpperCase() === questions[idx].anagram;
    setCorrect(isCorrect); setChecked(true);
    if (isCorrect) setScore(s => s + CONFIG[difficulty].pts);
  }

  function next() {
    if (!difficulty) return;
    if (idx + 1 >= questions.length) {
      setDone(true);
      submitScore("Anagram Master", score + (correct ? CONFIG[difficulty].pts : 0), difficulty);
      return;
    }
    setIdx(i => i + 1); setInput(""); setChecked(false); setCorrect(false);
  }

  const current = questions[idx];
  if (!current) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔀 Anagram Master</span>
        <div className="flex gap-2">
          <HowToPlay title="Anagram Master" icon="🔀" steps={["🔀 A scrambled word is shown with a hint.","✏️ Rearrange the letters to form a new valid word.","⌨️ Type your answer and press Check.","✅ Correct = points! ❌ Wrong = answer revealed.","➡️ Press Next to continue to the next word."]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Anagram Master</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Rearrange the letters to form a new word!</p>
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
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Rearrange this word</p>
            <p className="text-5xl font-extrabold text-amber-400 tracking-widest">{current.word}</p>
          </div>
          <div className="glass-card rounded-xl p-4 mb-6 w-full text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Hint</p>
            <p className="text-white text-sm">{current.hint}</p>
          </div>
          <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && !checked && check()}
            disabled={checked} placeholder="Type your anagram..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-xl font-bold focus:outline-none focus:border-orange-500 mb-4 uppercase tracking-widest" />
          {checked && (
            <div className={`rounded-xl p-3 mb-4 w-full text-center font-bold ${correct ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {correct ? "✅ Correct!" : `❌ Answer: ${current.anagram}`}
            </div>
          )}
          {!checked ? (
            <button onClick={check} disabled={!input.trim()} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition">Check ✓</button>
          ) : (
            <button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">Next →</button>
          )}
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

export default function AnagramPage() {
  return <GameErrorBoundary gameName="Anagram Master"><AnagramGame /></GameErrorBoundary>;
}
