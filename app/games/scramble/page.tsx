"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const EASY_WORDS = [
  { word:"CAT",      hint:"A furry pet that meows" },
  { word:"DOG",      hint:"Man's best friend" },
  { word:"SUN",      hint:"The star that lights our day" },
  { word:"MAP",      hint:"Used to find directions" },
  { word:"CUP",      hint:"You drink from this" },
  { word:"HAT",      hint:"Worn on your head" },
  { word:"BED",      hint:"You sleep on this" },
  { word:"RUN",      hint:"Move fast on your feet" },
  { word:"FLY",      hint:"Birds and planes do this" },
  { word:"EAT",      hint:"What you do with food" },
  { word:"TOP",      hint:"The highest part" },
  { word:"RED",      hint:"Color of fire and blood" },
  { word:"BIG",      hint:"Large in size" },
  { word:"OLD",      hint:"Not young anymore" },
  { word:"NEW",      hint:"Just made or bought" },
];
const MEDIUM_WORDS = [
  { word:"PYTHON",  hint:"A large snake or a programming language" },
  { word:"BRIDGE",  hint:"Structure built over a river" },
  { word:"CASTLE",  hint:"A large medieval fortress" },
  { word:"JUNGLE",  hint:"Dense tropical forest" },
  { word:"MIRROR",  hint:"You see your reflection in this" },
  { word:"ROCKET",  hint:"Launches into outer space" },
  { word:"CANDLE",  hint:"Gives light when lit" },
  { word:"FLOWER",  hint:"Colorful part of a plant" },
  { word:"GUITAR",  hint:"A stringed musical instrument" },
  { word:"WINTER",  hint:"The coldest season" },
  { word:"PLANET",  hint:"Earth is one of these" },
  { word:"BUTTER",  hint:"Spread it on bread" },
  { word:"CAMERA",  hint:"Used to take photos" },
  { word:"DRAGON",  hint:"Mythical fire-breathing creature" },
  { word:"FOREST",  hint:"A large area full of trees" },
];
const HARD_WORDS = [
  { word:"ABSOLUTE", hint:"Complete and total, with no exceptions" },
  { word:"BACKBONE", hint:"The spine; also means courage" },
  { word:"CALENDAR", hint:"Shows days, weeks, and months" },
  { word:"DARKNESS", hint:"Absence of light" },
  { word:"ELEPHANT", hint:"Largest land animal with a trunk" },
  { word:"FOOTBALL", hint:"Popular sport played with a round ball" },
  { word:"GRATEFUL", hint:"Feeling thankful" },
  { word:"HANDBOOK", hint:"A small reference guide or manual" },
  { word:"INNOCENT", hint:"Not guilty of a crime" },
  { word:"JEALOUSY", hint:"Feeling envious of someone else" },
  { word:"KEYBOARD", hint:"Used to type on a computer" },
  { word:"LANGUAGE", hint:"System of communication like English" },
  { word:"MOUNTAIN", hint:"A very large natural elevation of land" },
  { word:"NOTEBOOK", hint:"Used to write notes in school" },
  { word:"OBSTACLE", hint:"Something that blocks your path" },
];

const CONFIG: Record<Difficulty, { words: typeof EASY_WORDS; time: number; bonus: number; desc: string }> = {
  Easy:   { words: EASY_WORDS,   time: 45, bonus: 8,  desc: "45 seconds, short 3-letter words, +8s per correct" },
  Medium: { words: MEDIUM_WORDS, time: 30, bonus: 5,  desc: "30 seconds, 6-letter words, +5s per correct" },
  Hard:   { words: HARD_WORDS,   time: 20, bonus: 3,  desc: "20 seconds, 8-letter words, only +3s per correct!" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function ScrambleGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [words, setWords] = useState<typeof EASY_WORDS>([]);
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const w = shuffle(CONFIG[d].words);
    setWords(w); setIdx(0); setScrambled(shuffle(w[0].word.split("")).join(""));
    setInput(""); setScore(0); setTimeLeft(CONFIG[d].time); setFeedback(""); setDone(false);
  }

  useEffect(() => {
    if (!difficulty || done || paused) return;
    if (timeLeft <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, difficulty]);

  function submit() {
    if (!difficulty || paused) return;
    const guess = input.trim().toUpperCase();
    setInput("");
    if (guess === words[idx].word) {
      setScore(s => s + 10);
      setFeedback("✅ Correct!");
      const next = idx + 1;
      if (next >= words.length) { setDone(true); submitScore("Word Scramble", score + 10); return; }
      setIdx(next); setScrambled(shuffle(words[next].word.split("")).join(""));
      setTimeLeft(t => Math.min(t + CONFIG[difficulty].bonus, CONFIG[difficulty].time));
    } else {
      setFeedback("❌ Wrong! Try again.");
    }
    setTimeout(() => setFeedback(""), 800);
  }

  function skip() {
    if (!difficulty) return;
    const next = idx + 1;
    if (next >= words.length) { setDone(true); return; }
    setIdx(next); setScrambled(shuffle(words[next].word.split("")).join("")); setInput("");
  }


  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔀 Word Scramble</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Scramble" icon="🔀" steps={["🔀 A scrambled word is shown — unscramble it!","⌨️ Type your answer and press Enter or Submit.","✅ Correct = +10 pts + bonus time added!","➡️ Press Skip to move to the next word.","⏱ Game ends when the timer hits 0."]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Scramble</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Unscramble words against the clock!</p>
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {[["Score", score, "text-orange-400"], ["Time", `${timeLeft}s`, timeLeft <= 10 ? "text-red-400" : "text-blue-400"], ["Word", idx + 1, "text-green-400"]].map(([l,v,c]) => (
          <div key={l as string} className={`border rounded-xl px-4 py-2 text-center ${l === "Time" && timeLeft <= 10 ? "bg-red-500/20 border-red-400" : "bg-white/5 border-white/10"}`}>
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
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="glass-card rounded-2xl p-6 mb-6 w-full text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Unscramble this</p>
            <p className="text-4xl font-extrabold text-amber-400 tracking-widest mb-3">{scrambled}</p>
            <p className="text-xs text-orange-300">💡 {words[idx]?.hint}</p>
          </div>
          {feedback && <p className="text-sm font-bold mb-3 text-center" style={{ color: feedback.includes("✅") ? "#4ade80" : "#f87171" }}>{feedback}</p>}
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-lg focus:outline-none focus:border-orange-500 mb-4 uppercase" />
          <div className="flex gap-3 w-full">
            <button onClick={skip} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition">Skip →</button>
            <button onClick={submit} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">Submit</button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= 50 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Time's Up!</p>
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

export default function ScramblePage() {
  return <GameErrorBoundary gameName="Word Scramble"><ScrambleGame /></GameErrorBoundary>;
}
