"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { submitScoreCompat as submitScore, fetchBestScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";

const ANIMALS = [
  { animal: "🐶", sound: "Woof!",   audio: "Woof",   options: ["Woof!", "Meow!", "Moo!", "Oink!"] },
  { animal: "🐱", sound: "Meow!",   audio: "Meow",   options: ["Woof!", "Meow!", "Quack!", "Roar!"] },
  { animal: "🐮", sound: "Moo!",    audio: "Moo",    options: ["Moo!", "Baa!", "Oink!", "Neigh!"] },
  { animal: "🐷", sound: "Oink!",   audio: "Oink",   options: ["Moo!", "Oink!", "Cluck!", "Hiss!"] },
  { animal: "🐸", sound: "Ribbit!", audio: "Ribbit", options: ["Ribbit!", "Chirp!", "Bark!", "Meow!"] },
  { animal: "🦆", sound: "Quack!",  audio: "Quack",  options: ["Quack!", "Moo!", "Roar!", "Hoot!"] },
  { animal: "🦁", sound: "Roar!",   audio: "Roar",   options: ["Woof!", "Roar!", "Meow!", "Oink!"] },
  { animal: "🐴", sound: "Neigh!",  audio: "Neigh",  options: ["Moo!", "Neigh!", "Baa!", "Oink!"] },
  { animal: "🐑", sound: "Baa!",    audio: "Baa",    options: ["Baa!", "Moo!", "Oink!", "Woof!"] },
  { animal: "🐔", sound: "Cluck!",  audio: "Cluck",  options: ["Quack!", "Cluck!", "Moo!", "Ribbit!"] },
  { animal: "🦉", sound: "Hoot!",   audio: "Hoot",   options: ["Hoot!", "Chirp!", "Quack!", "Roar!"] },
  { animal: "🐍", sound: "Hiss!",   audio: "Hiss",   options: ["Hiss!", "Roar!", "Bark!", "Meow!"] },
];

const DIFF = {
  Easy:   { label: "Easy",   color: "text-green-400",  border: "border-green-500/40",  bg: "bg-green-500/10",  questions: 5,  pts: 10, desc: "5 questions, common animals" },
  Medium: { label: "Medium", color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/10", questions: 8,  pts: 15, desc: "8 questions, normal pace" },
  Hard:   { label: "Hard",   color: "text-red-400",    border: "border-red-500/40",    bg: "bg-red-500/10",    questions: 12, pts: 20, desc: "All 12 animals, no delay" },
};

type Difficulty = keyof typeof DIFF;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function AnimalMatchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  const [questions, setQuestions] = useState<typeof ANIMALS>([]);
  useEffect(() => { startGame("Hard"); }, []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showInstr, setShowInstr] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  function playAnimalSound(audio: string) {
    const a = new Audio(`/sounds/${audio}.mp3`);
    a.volume = 1.0;
    a.play().catch(() => {});
  }

  useEffect(() => {
    if (!done && questions[idx]) {
      setTimeout(() => playAnimalSound(questions[idx].audio), 300);
    }
  }, [idx, questions]);

  useEffect(() => { fetchBestScore("Animal Match").then(setBestScore); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ANIMALS).slice(0, DIFF[d].questions));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function answer(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    const correct = opt === questions[idx].sound;
    if (correct) { setScore(s => s + DIFF[difficulty].pts); playCorrect(); } else { playWrong(); }
    const delay = difficulty === "Hard" ? 500 : 900;
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Animal Match", score + (correct ? DIFF[difficulty].pts : 0)).then(setNewBadges); return; }
      setIdx(i => i + 1);
      setSelected(null);
    }, delay);
  }

  const current = questions[idx];
  if (!current) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6 relative">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400 absolute left-1/2 -translate-x-1/2">🐾 Animal Match</span>
        <div className="flex gap-2 items-center">
          <button onClick={() => setShowInstr(true)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">❓ How to Play</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>

      {showInstr && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between mb-4"><h2 className="text-xl font-bold text-white">🐾 How to Play</h2><button onClick={() => setShowInstr(false)} className="text-gray-500 hover:text-white text-xl">✕</button></div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🐾 Look at the animal shown.</li>
              <li>🔊 Pick the sound that animal makes!</li>
              <li>✅ Each correct answer = +{DIFF[difficulty].pts} pts.</li>
            </ul>
            <button onClick={() => setShowInstr(false)} className="mt-5 w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2.5 rounded-xl font-semibold">Got it!</button>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Animal Match</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Match the animal to its sound!</p>
      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1 mb-4 w-full max-w-xs">
        {(["Easy","Medium","Hard"] as (keyof typeof DIFF)[]).map(d => (
          <button key={d} onClick={() => startGame(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-200 ${ difficulty === d ? "bg-white/15 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>{d}</button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className="text-yellow-400 text-sm font-semibold">🏆 Best: {bestScore}</span>
      </div>

      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <button onClick={() => playAnimalSound(current.audio)} className="text-[120px] mb-2 leading-none hover:scale-110 transition-transform cursor-pointer">{current.animal}</button>
          <p className="text-amber-300 text-xs mb-4">🔊 Tap to replay sound</p>
          <p className="text-white text-2xl font-bold mb-6">What sound does this animal make?</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 rounded-2xl text-lg font-bold border-2 transition
                  ${selected === opt ? opt === current.sound ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.sound ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * DIFF[difficulty].pts * 0.7 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} / {questions.length * DIFF[difficulty].pts}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />
    </div>
  );
}

export default function AnimalMatchPage() {
  return <GameErrorBoundary gameName="Animal Match"><AnimalMatchGame /></GameErrorBoundary>;
}
