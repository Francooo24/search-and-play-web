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

const ALL_RHYMES = [
  { word: "cat",    clue: "🐱 A furry pet that meows",              answer: "hat",    options: ["hat","dog","fish","tree"] },
  { word: "sun",    clue: "☀️ It shines in the sky during the day", answer: "fun",    options: ["fun","moon","star","rain"] },
  { word: "cake",   clue: "🎂 A sweet treat for birthdays",         answer: "lake",   options: ["lake","pie","bread","soup"] },
  { word: "blue",   clue: "💙 The color of the sky and ocean",      answer: "shoe",   options: ["shoe","red","green","pink"] },
  { word: "night",  clue: "🌙 When it's dark and stars come out",   answer: "light",  options: ["light","day","sun","cloud"] },
  { word: "bear",   clue: "🐻 A big furry animal in the forest",    answer: "chair",  options: ["chair","table","lamp","door"] },
  { word: "ring",   clue: "💍 A circular piece of jewelry",         answer: "sing",   options: ["sing","dance","jump","run"] },
  { word: "tree",   clue: "🌳 A tall plant with branches and leaves",answer: "bee",    options: ["bee","ant","bird","fish"] },
  { word: "rain",   clue: "🌧️ Water that falls from clouds",        answer: "train",  options: ["train","bus","car","boat"] },
  { word: "moon",   clue: "🌕 It glows in the sky at night",        answer: "spoon",  options: ["spoon","fork","knife","plate"] },
  { word: "star",   clue: "⭐ A twinkling light in the night sky",  answer: "car",    options: ["car","bus","bike","boat"] },
  { word: "dog",    clue: "🐶 A loyal pet that barks",              answer: "log",    options: ["log","cat","bird","fish"] },
  { word: "bright", clue: "💡 Full of light, not dark",             answer: "night",  options: ["night","day","sun","cloud"] },
  { word: "flower", clue: "🌸 A colorful blooming plant",           answer: "tower",  options: ["tower","river","mountain","valley"] },
  { word: "dream",  clue: "💭 What you see when you sleep",         answer: "stream", options: ["stream","river","lake","pond"] },
];

const CONFIG: Record<Difficulty, { total: number; pts: number; desc: string }> = {
  Easy:   { total: 6,  pts: 10, desc: "6 rounds, simple rhyming words" },
  Medium: { total: 10, pts: 10, desc: "10 rounds, varied vocabulary" },
  Hard:   { total: 15, pts: 15, desc: "15 rounds, all words including tricky ones" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function RhymeTimeGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  const [questions, setQuestions] = useState<typeof ALL_RHYMES>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  useEffect(() => { startGame("Hard"); }, []);
  useEffect(() => { fetchBestScore("Rhyme Time").then(setBestScore); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_RHYMES).slice(0, CONFIG[d].total));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function answer(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    const correct = opt === questions[idx].answer;
    if (correct) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Rhyme Time", score + (correct ? CONFIG[difficulty].pts : 0)).then(setNewBadges); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 900);
  }

  const current = questions[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🎵 Rhyme Time</span>
        <div className="flex gap-2">
          <HowToPlay title="Rhyme Time" icon="🎵" steps={["🎵 A word is shown on screen.","👆 Pick the word that rhymes with it from 4 options.","✅ Correct = points! ❌ Wrong = no points.","🏆 Complete all rounds to see your final score!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Rhyme Time</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Pick the word that rhymes!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className="text-yellow-400 text-sm font-semibold">🏆 Best: {bestScore}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="text-6xl font-extrabold text-amber-400 mb-3" style={{ textShadow: "0 0 20px rgba(251,191,36,0.4)" }}>{current.word}</div>
          <p className="text-sm text-orange-300 mb-6">💡 {current.clue}</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 rounded-2xl text-lg font-bold border-2 transition
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
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

export default function RhymeTimePage() {
  return <GameErrorBoundary gameName="Rhyme Time"><RhymeTimeGame /></GameErrorBoundary>;
}
