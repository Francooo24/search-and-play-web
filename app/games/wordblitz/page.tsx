"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const CONFIG: Record<Difficulty, { time: number; minLen: number; maxLen: number | null; desc: string }> = {
  Easy:   { time: 90, minLen: 3, maxLen: 4,    desc: "90 seconds, words 3–4 letters only" },
  Medium: { time: 60, minLen: 5, maxLen: 6,    desc: "60 seconds, words 5–6 letters only" },
  Hard:   { time: 45, minLen: 8, maxLen: null, desc: "45 seconds, words 8+ letters only!" },
};

function WordBlitzGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [input, setInput] = useState("");
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!started || done || paused || !difficulty) return;
    if (timeLeft <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, done, paused, difficulty]);

  useEffect(() => {
    if (done && difficulty) submitScore("Word Blitz", score, difficulty);
  }, [done]);

  function startGame(d: Difficulty) {
    setDifficulty(d); setInput(""); setFound([]); setScore(0);
    setTimeLeft(CONFIG[d].time); setFeedback(""); setStarted(false); setDone(false);
  }

  function submit() {
    if (!difficulty || paused) return;
    const word = input.trim().toLowerCase();
    setInput("");
    if (!word) return;
    if (!/^[a-z]+$/.test(word)) {
      setFeedback("Letters only! No numbers or symbols.");
      setTimeout(() => setFeedback(""), 1200); return;
    }
    const { minLen, maxLen } = CONFIG[difficulty];
    if (word.length < minLen) {
      setFeedback(`❌ "${word}" is too short! Need ${minLen}+ letters.`);
      setTimeout(() => setFeedback(""), 1200); return;
    }
    if (maxLen && word.length > maxLen) {
      setFeedback(`❌ "${word}" is too long! Max ${maxLen} letters.`);
      setTimeout(() => setFeedback(""), 1200); return;
    }
    if (found.includes(word)) {
      setFeedback(`❌ "${word}" already used!`);
      setTimeout(() => setFeedback(""), 1200); return;
    }
    setFound(f => [...f, word]);
    const pts = word.length >= 8 ? 20 : word.length >= 5 ? 10 : 5;
    setScore(s => s + pts);
    setFeedback(`✅ "${word}" +${pts} pts!`);
    setTimeout(() => setFeedback(""), 1000);
  }

  if (!mounted || !difficulty) {
    return (
      <DifficultySelect
        title="Word Blitz"
        icon="⚡"
        subtitle="Type as many valid words as you can!"
        descriptions={{
          Easy:   CONFIG.Easy.desc,
          Medium: CONFIG.Medium.desc,
          Hard:   CONFIG.Hard.desc,
        }}
        onSelect={startGame}
      />
    );
  }


  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">⚡ Word Blitz</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Blitz" icon="⚡" steps={[
            "⏱ Click Start Blitz to begin the countdown timer.",
            "⌨️ Type valid English words and press Enter to submit.",
            "📏 Words must meet the minimum length for your difficulty.",
            "🔁 You cannot reuse the same word twice.",
            "🏆 3-4 letters = 5pts • 5 letters = 10pts • 6+ letters = 15pts.",
          ]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Blitz</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Type as many valid words as you can!</p>
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {[["Score", score, "text-orange-400"], ["Time", `${timeLeft}s`, timeLeft <= 10 ? "text-red-400" : "text-blue-400"], ["Words", found.length, "text-green-400"]].map(([l,v,c]) => (
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
        <div className="w-full max-w-md">
          {!started ? (
            <button onClick={() => { setStarted(true); setTimeout(() => inputRef.current?.focus(), 100); }}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl text-xl transition hover:from-orange-600 hover:to-amber-600 mb-4">
              ⚡ Start Blitz!
            </button>
          ) : (
            <>
              {feedback && <p className="text-center text-sm font-bold mb-2">{feedback}</p>}
              <div className="flex gap-2 mb-4">
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder={`Type a ${CONFIG[difficulty].minLen}${CONFIG[difficulty].maxLen ? `–${CONFIG[difficulty].maxLen}` : "+"} letter word...`}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500" />
                <button onClick={submit} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition">→</button>
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            {found.map(w => <span key={w} className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">{w}</span>)}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">3–4 letters = 5pts • 5–6 letters = 10pts • 8+ letters = 20pts</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= 50 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Time's Up!</p>
          <p className="text-gray-400 mb-2">Words: {found.length}</p>
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

export default function WordBlitzPage() {
  return <GameErrorBoundary gameName="Word Blitz"><WordBlitzGame /></GameErrorBoundary>;
}
