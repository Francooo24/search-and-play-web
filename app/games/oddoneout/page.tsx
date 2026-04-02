"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScoreCompat as submitScore, fetchBestScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";

const ALL_ROUNDS = [
  { items: ["🐶","🐱","🐮","🚗"], odd: "🚗", reason: "Not an animal!" },
  { items: ["🍎","🍊","🍋","🥕"], odd: "🥕", reason: "Not a fruit!" },
  { items: ["🚗","🚌","✈️","🏠"], odd: "🏠", reason: "Not a vehicle!" },
  { items: ["✏️","📏","📚","🍕"], odd: "🍕", reason: "Not a school item!" },
  { items: ["🌹","🌻","🌷","🍄"], odd: "🍄", reason: "Not a flower!" },
  { items: ["🔴","🔵","🟢","🐸"], odd: "🐸", reason: "Not a shape/color!" },
  { items: ["🌧️","⛅","☀️","🌊"], odd: "🌊", reason: "Not weather!" },
  { items: ["🎸","🎹","🎺","🎃"], odd: "🎃", reason: "Not an instrument!" },
  { items: ["👟","👒","🧤","🍔"], odd: "🍔", reason: "Not clothing!" },
  { items: ["🐠","🐬","🦈","🐦"], odd: "🐦", reason: "Not a sea animal!" },
  { items: ["🧲","🔋","💡","🍞"], odd: "🍞", reason: "Not electronics!" },
  { items: ["🎻","🥁","🎷","🖼️"], odd: "🖼️", reason: "Not a musical instrument!" },
  { items: ["🦅","🦆","🦉","🐊"], odd: "🐊", reason: "Not a bird!" },
  { items: ["📐","📏","🔭","🍰"], odd: "🍰", reason: "Not a science tool!" },
  { items: ["🌍","🌙","☀️","🚀"], odd: "🚀", reason: "Not a natural celestial body!" },
];

const CONFIG: Record<Difficulty, { total: number; pts: number; desc: string }> = {
  Easy:   { total: 5,  pts: 10, desc: "5 rounds, obvious categories" },
  Medium: { total: 10, pts: 10, desc: "10 rounds, mixed categories" },
  Hard:   { total: 15, pts: 15, desc: "15 rounds, tricky groupings" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function OddOneOutGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  const [questions, setQuestions] = useState<typeof ALL_ROUNDS>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  useEffect(() => { startGame("Hard"); }, []);
  useEffect(() => { fetchBestScore("Odd One Out").then(setBestScore); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_ROUNDS).slice(0, CONFIG[d].total));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function pick(item: string) {
    if (selected || !difficulty || paused) return;
    setSelected(item);
    const correct = item === questions[idx].odd;
    if (correct) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Odd One Out", score + (correct ? CONFIG[difficulty].pts : 0)).then(setNewBadges); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 1200);
  }

  const current = questions[idx];
  if (!current) return <GameLoading />;
  const shuffledItems = shuffle(current.items);

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🎪 Odd One Out</span>
        <div className="flex gap-2">
          <HowToPlay title="Odd One Out" icon="🎪" steps={["🎪 Four items are shown — three belong to the same group.","👆 Tap the one item that does NOT belong.","✅ Correct = points + reason shown!","❌ Wrong = the correct answer is revealed.","🏆 Complete all rounds to finish!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Odd One Out</h1>
      <p className="text-gray-400 text-sm mb-6 text-center">Find the item that doesn't belong!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className="text-yellow-400 text-sm font-semibold">🏆 Best: {bestScore}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <p className="text-white font-semibold mb-6 text-lg">Which one does NOT belong?</p>
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            {shuffledItems.map(item => (
              <button key={item} onClick={() => pick(item)}
                className={`py-6 rounded-2xl text-6xl flex items-center justify-center border-2 transition
                  ${selected === item ? item === current.odd ? "bg-green-500/30 border-green-400 scale-110" : "bg-red-500/30 border-red-400"
                  : selected && item === current.odd ? "bg-green-500/30 border-green-400"
                  : "bg-white/5 border-white/10 hover:bg-orange-500/20 hover:border-orange-400 hover:scale-105"}`}>
                {item}
              </button>
            ))}
          </div>
          {selected && (
            <p className={`text-sm font-semibold mt-2 text-center ${selected === current.odd ? "text-green-400" : "text-red-400"}`}>
              {selected === current.odd ? `✅ Correct! ${current.odd} — ${current.reason}` : `❌ Wrong! The odd one was ${current.odd} — ${current.reason}`}
            </p>
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
      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />
    </div>
  );
}

export default function OddOneOutPage() {
  return <GameErrorBoundary gameName="Odd One Out"><OddOneOutGame /></GameErrorBoundary>;
}
