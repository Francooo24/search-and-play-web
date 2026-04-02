"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import { submitScore, fetchBestScore } from "@/lib/submitScore";

const ALL_STATEMENTS = [
  { text:"Honey never expires. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.", real:true, explanation:"True! Honey's low moisture and acidic pH prevent bacterial growth, making it last indefinitely.", level:"Easy" },
  { text:"The Great Wall of China is visible from space with the naked eye.", real:false, explanation:"False! NASA astronauts confirmed it cannot be seen from space — it's too narrow. This is a popular myth.", level:"Easy" },
  { text:"Lightning never strikes the same place twice.", real:false, explanation:"False! Lightning frequently strikes the same place multiple times. The Empire State Building is struck about 20–25 times per year.", level:"Easy" },
  { text:"Goldfish have a 3-second memory.", real:false, explanation:"False! Studies show goldfish can remember things for months. They can even be trained to navigate mazes.", level:"Easy" },
  { text:"Humans share about 60% of their DNA with bananas.", real:true, explanation:"True! We share roughly 60% of our DNA with bananas because many basic cellular functions are the same across all life.", level:"Medium" },
  { text:"Octopuses have three hearts and blue blood.", real:true, explanation:"True! Two hearts pump blood to the gills, one pumps it to the body. Their blood is blue due to copper-based hemocyanin.", level:"Medium" },
  { text:"We only use 10% of our brains.", real:false, explanation:"False! Brain scans show activity throughout the entire brain. Different regions handle different functions, all are used.", level:"Medium" },
  { text:"The human body contains enough carbon to make about 900 pencils.", real:true, explanation:"True! The human body is about 18% carbon by mass, which amounts to roughly 900 pencil-worth of graphite.", level:"Medium" },
  { text:"A day on Venus is longer than a year on Venus.", real:true, explanation:"True! Venus rotates so slowly that one full rotation (day) takes 243 Earth days, while its orbit (year) takes only 225 Earth days.", level:"Hard" },
  { text:"Chameleons change color to camouflage themselves from predators.", real:false, explanation:"False! Chameleons primarily change color to communicate mood, temperature regulation, and social signals — not camouflage.", level:"Hard" },
  { text:"Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.", real:true, explanation:"True! The Great Pyramid was built ~2560 BC, Cleopatra lived ~30 BC (2,500 years later), and the Moon landing was 1969 (only ~2,000 years after Cleopatra).", level:"Hard" },
  { text:"Humans are the only animals that blush.", real:true, explanation:"True! Charles Darwin called blushing 'the most peculiar and most human of all expressions.' No other animal is known to blush from emotion.", level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; desc: string }> = {
  Easy:   { filter: "Easy",   desc: "4 statements, well-known myths and facts" },
  Medium: { filter: "Medium", desc: "4 statements, surprising science facts" },
  Hard:   { filter: "Hard",   desc: "4 statements, mind-bending facts" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function FakeOrFactGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_STATEMENTS>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => { fetchBestScore("Fake or Fact").then(setBestScore); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_STATEMENTS.filter(q => q.level === d)));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function pick(val: boolean) {
    if (selected !== null || !difficulty || paused) return;
    setSelected(val);
    if (val === questions[idx].real) setScore(s => s + 10);
  }

  function next() {
    if (idx + 1 >= questions.length) { setDone(true); submitScore("Fake or Fact", score, difficulty ?? undefined); return; }
    setIdx(i => i + 1); setSelected(null);
  }

  if (!difficulty) return <DifficultySelect title="Fake or Fact" icon="📰" subtitle="Can you tell what's real from what's not?" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">📰 Fake or Fact</span>
        <div className="flex gap-2">
          <HowToPlay title="Fake or Fact" icon="📰" steps={["📰 A statement is shown — it may be true or false.","✅ Press FACT if you think it's real.","❌ Press FAKE if you think it's made up.","💡 After answering, an explanation is shown.","🏆 Each correct answer = +10 pts!"]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Fake or Fact</h1>
      <p className="text-gray-400 text-sm mb-6 text-center">Can you tell what's real from what's not?</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
        <span className="text-gray-400">|</span>
        <span className="text-yellow-400 text-sm font-semibold">🏆 Best: {bestScore}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-lg">
          <div className="glass-card rounded-2xl p-6 mb-6 w-full text-center min-h-[120px] flex items-center justify-center">
            <p className="text-white text-lg leading-relaxed">{current.text}</p>
          </div>
          {selected === null ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              <button onClick={() => pick(true)} className="py-5 rounded-2xl text-xl font-bold border-2 border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/25 hover:border-green-400 transition hover:scale-105">✅ FACT</button>
              <button onClick={() => pick(false)} className="py-5 rounded-2xl text-xl font-bold border-2 border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/25 hover:border-red-400 transition hover:scale-105">❌ FAKE</button>
            </div>
          ) : (
            <div className="w-full">
              <div className={`rounded-xl p-4 mb-4 text-center font-bold text-lg ${selected === current.real ? "bg-green-500/20 border border-green-500/40 text-green-300" : "bg-red-500/20 border border-red-500/40 text-red-300"}`}>
                {selected === current.real ? "✅ Correct!" : "❌ Wrong!"} — This is a {current.real ? "FACT" : "FAKE"}
              </div>
              <div className="glass-card rounded-xl p-4 mb-4 text-sm text-gray-300 leading-relaxed">💡 {current.explanation}</div>
              <button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">
                {idx + 1 < questions.length ? "Next →" : "See Results"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= 30 ? "🏆" : score >= 20 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">All Done!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} / {questions.length * 10}</p>
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

export default function FakeOrFactPage() {
  return <GameErrorBoundary gameName="Fake or Fact"><FakeOrFactGame /></GameErrorBoundary>;
}
