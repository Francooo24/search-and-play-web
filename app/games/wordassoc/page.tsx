"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const CHAINS = [
  ["OCEAN","WAVE","SURF","BOARD","GAME","PLAY","GROUND","FLOOR","PLAN","MAP"],
  ["FIRE","FLAME","LIGHT","HOUSE","HOLD","BACK","PACK","AGE","OLD","GOLD"],
  ["STAR","FISH","TANK","TOP","HAT","TRICK","SHOT","GUN","FIRE","WORK"],
  ["BOOK","WORM","HOLE","CARD","BOARD","WALK","WAY","SIDE","SHOW","CASE"],
  ["RAIN","BOW","TIE","BREAK","DOWN","TOWN","SHIP","YARD","STICK","MAN"],
];

const CONFIG: Record<Difficulty, { timer: number; desc: string }> = {
  Easy:   { timer: 15, desc: "15 seconds per word, relaxed pace" },
  Medium: { timer: 8,  desc: "8 seconds per word, normal pace" },
  Hard:   { timer: 4,  desc: "Only 4 seconds per word — think fast!" },
};

function WordAssocGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [chain, setChain] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(8);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const c = CHAINS[Math.floor(Math.random() * CHAINS.length)];
    setChain(c); setHistory([c[0]]); setIdx(0);
    setScore(0); setInput(""); setTimeLeft(CONFIG[d].timer); setFeedback(""); setDone(false);
  }

  useEffect(() => {
    if (!difficulty || done || paused) return;
    if (timeLeft <= 0) {
      setFeedback(`⏰ Time's up! Answer: ${chain[idx + 1]}`);
      setTimeout(() => next(false), 1200);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, difficulty]);

  if (!difficulty) return <DifficultySelect title="Word Association" icon="🧩" subtitle="Chain words by association before time runs out!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  function submit() {
    if (!difficulty || paused) return;
    const guess = input.trim().toUpperCase();
    setInput("");
    if (guess === chain[idx + 1]) {
      setScore(s => s + timeLeft * 5);
      setFeedback(`✅ +${timeLeft * 5} pts!`);
      setHistory(h => [...h, guess]);
      setTimeout(() => next(true), 800);
    } else {
      setFeedback(`❌ Answer: ${chain[idx + 1]}`);
      setTimeout(() => next(false), 1000);
    }
  }

  function next(correct: boolean) {
    if (!difficulty) return;
    if (!correct) setHistory(h => [...h, chain[idx + 1]]);
    setFeedback("");
    if (idx + 1 >= chain.length - 1) { setDone(true); submitScore("Word Association", score, difficulty ?? undefined); return; }
    setIdx(i => i + 1); setTimeLeft(CONFIG[difficulty].timer);
  }



  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🧩 Word Association</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Association" icon="🧩" steps={[
            "🔗 A word is shown — type the next word in the chain.",
            "⏱ You have limited time per word based on difficulty.",
            "✅ Correct answer = time remaining × 5 points.",
            "❌ Wrong or timed out = answer is revealed, chain continues.",
            "🏆 Complete the full chain to finish the game.",
          ]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Association</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Chain words by association before time runs out!</p>
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {[["Score", score, "text-orange-400"], ["Time", `${timeLeft}s`, timeLeft <= 3 ? "text-red-400" : "text-blue-400"]].map(([l,v,c]) => (
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
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {history.map((w, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-sm font-bold ${i === history.length - 1 ? "bg-orange-500/30 border border-orange-400 text-orange-300" : "bg-white/10 text-gray-300"}`}>{w}</span>
            ))}
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/5 border border-dashed border-white/20 text-gray-500">?</span>
          </div>
          <div className="glass-card rounded-2xl p-4 mb-4 w-full text-center">
            <p className="text-xs text-gray-400 mb-1">What word is associated with...</p>
            <p className="text-4xl font-extrabold text-amber-400">{chain[idx]}</p>
          </div>
          {feedback && <p className="text-sm font-bold mb-3 text-center">{feedback}</p>}
          <div className="flex gap-2 w-full">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Type associated word..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500 uppercase" />
            <button onClick={submit} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition">→</button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= 100 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Chain Complete!</p>
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

export default function WordAssocPage() {
  return <GameErrorBoundary gameName="Word Association"><WordAssocGame /></GameErrorBoundary>;
}
