"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const LETTER_SETS = [
  { letters:["S","T","A","R","E","D"], words:["STAR","STARE","DARES","RATES","TEARS","TRADE","TREAD","ATE","EAR","ERA","ARE","TAR","RAT","SAT","SET","TED","RED","SEA","TEA","TAD","RES","ETA","ADS","DAR"] },
  { letters:["P","L","A","N","E","T"], words:["PLANE","PLANT","PANEL","LEANT","PLEAT","PETAL","LEAPT","PLATE","TALE","LANE","LEAN","PANE","PLAN","PLEA","TAPE","PALE","LATE","PANT","LENT","PEAL","LEAP","NEAT","ANTE","PATE","APE","ATE","EAT","ETA","LAP","NAP","PAL","PAN","PAT","PEA","PEN","PET","TAP","TAN","NET","LET"] },
  { letters:["B","R","I","G","H","T"], words:["BRIGHT","RIGHT","BIRTH","GIRTH","BIGHT","BRIT","GRIT","GIRT","BIT","RIG","HIT","RIB","GIB","GIT"] },
];

const CONFIG: Record<Difficulty, { time: number; minLen: number; desc: string }> = {
  Easy:   { time: 180, minLen: 2, desc: "3 minutes, any word length" },
  Medium: { time: 120, minLen: 3, desc: "2 minutes, words 3+ letters" },
  Hard:   { time: 60,  minLen: 4, desc: "1 minute, words 4+ letters only!" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function WordConnectGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [setIdx, setSetIdx] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty, si = setIdx) {
    setDifficulty(d);
    setLetters(shuffle(LETTER_SETS[si].letters));
    setSelected([]); setFound([]); setScore(0); setTimeLeft(CONFIG[d].time); setFeedback(""); setDone(false);
  }

  useEffect(() => {
    if (done) submitScore("Word Connect", score, difficulty ?? undefined);
  }, [done]);

  useEffect(() => {
    if (!difficulty || done || paused) return;
    if (timeLeft <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, difficulty]);

  if (!difficulty) return <DifficultySelect title="Word Connect" icon="🔗" subtitle="Connect letters to form as many words as possible!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const validWords = LETTER_SETS[setIdx].words.map(w => w.toUpperCase());

  function pickLetter(i: number) {
    setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  }

  function submit() {
    if (!difficulty || paused) return;
    const word = selected.map(i => letters[i]).join("");
    if (word.length < CONFIG[difficulty].minLen) { setFeedback(`Min ${CONFIG[difficulty].minLen} letters!`); setTimeout(() => setFeedback(""), 800); setSelected([]); return; }
    if (found.includes(word)) { setFeedback("Already found!"); }
    else if (validWords.includes(word)) {
      setFound(f => [...f, word]); setScore(s => s + word.length * 5);
      setFeedback(`✅ +${word.length * 5} pts!`);
    } else { setFeedback("❌ Not a valid word"); }
    setSelected([]);
    setTimeout(() => setFeedback(""), 1000);
  }



  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔗 Word Connect</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Connect" icon="🔗" steps={[
            "🔡 You are given a set of scrambled letters.",
            "👆 Tap letters in order to spell a word, then press Submit.",
            "✅ Valid words earn points based on their length (length × 5).",
            "🚫 Already-found words won't count again.",
            "⏱ Find as many words as possible before time runs out!",
          ]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Connect</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Connect letters to form as many words as possible!</p>
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {LETTER_SETS.map((_, i) => (
          <button key={i} onClick={() => { setSetIdx(i); startGame(difficulty, i); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${setIdx===i ? "bg-orange-500/30 border-orange-500" : "bg-white/5 border-white/10"}`}>Set {i + 1}</button>
        ))}
      </div>
      <div className="flex gap-4 mb-4 flex-wrap justify-center">
        {[["Score", score, "text-orange-400"], ["Time", `${timeLeft}s`, timeLeft <= 30 ? "text-red-400" : "text-blue-400"], ["Words", found.length, "text-green-400"]].map(([l,v,c]) => (
          <div key={l as string} className={`border rounded-xl px-4 py-2 text-center ${l === "Time" && timeLeft <= 30 ? "bg-red-500/20 border-red-400" : "bg-white/5 border-white/10"}`}>
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
          <div className="glass-card rounded-2xl p-3 mb-4 w-full min-h-[48px] flex flex-wrap gap-2 justify-center">
            {selected.length > 0 ? <p className="text-2xl font-extrabold text-amber-400 tracking-widest">{selected.map(i => letters[i]).join("")}</p>
              : <p className="text-gray-500 text-sm self-center">Select letters...</p>}
          </div>
          {feedback && <p className="text-sm font-bold mb-3">{feedback}</p>}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {letters.map((l, i) => (
              <button key={i} onClick={() => pickLetter(i)}
                className={`w-16 h-16 rounded-2xl text-2xl font-extrabold border-2 transition
                  ${selected.includes(i) ? "bg-orange-500/30 border-orange-400 text-orange-300 scale-95" : "bg-white/10 border-white/20 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-3 w-full mb-4">
            <button onClick={() => setSelected([])} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition">Clear</button>
            <button onClick={submit} disabled={selected.length < 2} className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition">Submit</button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {found.map(w => <span key={w} className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">{w}</span>)}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= 50 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Time's Up!</p>
          <p className="text-gray-400 mb-2">Words found: {found.length}</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score}</p>
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

export default function WordConnectPage() {
  return <GameErrorBoundary gameName="Word Connect"><WordConnectGame /></GameErrorBoundary>;
}
