"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScoreCompat as submitScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const WORD_POOL = ["cat","dog","sun","moon","star","fish","bird","tree","book","rain","cake","ball","frog","ship","king","rose","lamp","door","fire","snow","leaf","rock","sand","wind","bell","drum","flag","gold","hand","iron"];
const CONFIG: Record<Difficulty, { interval: number; gridSize: number; pts: number; desc: string }> = {
  Easy:   { interval: 3500, gridSize: 9,  pts: 5,  desc: "Slow pace, 3×3 grid, words called every 3.5s" },
  Medium: { interval: 2500, gridSize: 16, pts: 5,  desc: "Normal pace, 4×4 grid, words called every 2.5s" },
  Hard:   { interval: 1500, gridSize: 16, pts: 10, desc: "Fast pace, 4×4 grid, words called every 1.5s!" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function WordBingoGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [card, setCard] = useState<string[]>([]);
  const [called, setCalled] = useState<string[]>([]);
  const [marked, setMarked] = useState<string[]>([]);
  const [bingo, setBingo] = useState(false);
  const [score, setScore] = useState(0);
  const [callIdx, setCallIdx] = useState(0);
  const [callQueue, setCallQueue] = useState<string[]>(() => shuffle(WORD_POOL));
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect } = useSound();
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setCard(shuffle(WORD_POOL).slice(0, CONFIG[d].gridSize));
    setCallQueue(shuffle(WORD_POOL));
    setCalled([]); setMarked([]); setBingo(false); setScore(0); setCallIdx(0);
  }

  useEffect(() => {
    if (!difficulty || bingo || paused) return;
    const t = setInterval(() => {
      setCallIdx(i => { const next = i + 1; setCalled(c => [...c, callQueue[next]]); return next; });
    }, CONFIG[difficulty].interval);
    return () => clearInterval(t);
  }, [bingo, difficulty]);

  if (!difficulty) return <DifficultySelect title="Word Bingo" icon="🎯" subtitle="Mark words as they are called. Get a line!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  function mark(word: string) {
    if (!difficulty || !called.includes(word) || marked.includes(word) || paused) return;
    const newMarked = [...marked, word];
    setMarked(newMarked); setScore(s => s + CONFIG[difficulty].pts);
    playCorrect();
    const cols = Math.sqrt(CONFIG[difficulty].gridSize);
    const lines: number[][] = [];
    for (let i = 0; i < cols; i++) {
      lines.push(Array.from({ length: cols }, (_, j) => i * cols + j));
      lines.push(Array.from({ length: cols }, (_, j) => j * cols + i));
    }
    lines.push(Array.from({ length: cols }, (_, i) => i * cols + i));
    lines.push(Array.from({ length: cols }, (_, i) => i * cols + (cols - 1 - i)));
    if (lines.some(line => line.every(i => newMarked.includes(card[i])))) { setBingo(true); setScore(s => { const final = s + 50; submitScore("Word Bingo", final).then(setNewBadges); return final; }); }
  }



  const cols = Math.sqrt(CONFIG[difficulty].gridSize);
  const currentCall = callQueue[callIdx];

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🎯 Word Bingo</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Bingo" icon="🎯" steps={[
            "🃏 You have a bingo card filled with words.",
            "📢 Words are called out one at a time automatically.",
            "👆 Click a word on your card when it is called.",
            "🏆 Get a full row, column, or diagonal to win BINGO!",
            "⚡ Faster difficulty = words are called more quickly.",
          ]} />
          <PauseButton onPause={setPaused} disabled={bingo} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Bingo</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Mark words as they are called. Get a line!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-4 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
      </div>
      <div className="glass-card rounded-2xl px-6 py-3 mb-4 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Called Word</p>
        <p className="text-3xl font-extrabold text-amber-400">{currentCall || "..."}</p>
      </div>
      <div className={`grid gap-2 mb-4 w-full max-w-sm`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {card.map(word => (
          <button key={word} onClick={() => mark(word)}
            className={`py-3 rounded-xl text-xs font-bold border-2 transition
              ${marked.includes(word) ? "bg-orange-500/30 border-orange-400 text-orange-300"
              : called.includes(word) ? "bg-white/10 border-white/30 text-white hover:bg-orange-500/20 cursor-pointer"
              : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"}`}>{word}</button>
        ))}
      </div>
      {bingo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 text-center max-w-xs w-full">
            <p className="text-6xl mb-3">🎉</p>
            <p className="text-3xl font-extrabold text-amber-400 mb-2">BINGO!</p>
            <p className={`text-sm mb-2`}>{difficulty} Mode</p>
            <p className="text-orange-400 font-bold mb-5">Score: {score} pts!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition">🔄 Again</button>
              <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl transition">🎯 Difficulty</button>
            </div>
          </div>
        </div>
      )}
      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />
    </div>
  );
}

export default function WordBingoPage() {
  return <GameErrorBoundary gameName="Word Bingo"><WordBingoGame /></GameErrorBoundary>;
}
