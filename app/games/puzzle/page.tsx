"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import { submitScore } from "@/lib/submitScore";

const ALL_WORDS = [
  { word:"CAT",    hint:"A common household pet",          level:"Easy" },
  { word:"SUN",    hint:"The star at the center of our solar system", level:"Easy" },
  { word:"DOG",    hint:"Man's best friend",               level:"Easy" },
  { word:"BIRD",   hint:"An animal with wings and feathers", level:"Easy" },
  { word:"FISH",   hint:"Lives in water",                  level:"Easy" },
  { word:"PLANET", hint:"Orbits around a star",            level:"Medium" },
  { word:"BRIDGE", hint:"Connects two sides",              level:"Medium" },
  { word:"CASTLE", hint:"A large medieval fortress",       level:"Medium" },
  { word:"MIRROR", hint:"Reflects your image",             level:"Medium" },
  { word:"ROCKET", hint:"Travels to space",                level:"Medium" },
  { word:"CANDLE", hint:"Gives light when lit",            level:"Medium" },
  { word:"ABSOLUTE", hint:"Complete and total",            level:"Hard" },
  { word:"CALENDAR", hint:"Shows days and months",         level:"Hard" },
  { word:"ELEPHANT", hint:"Largest land animal",           level:"Hard" },
  { word:"GRATEFUL", hint:"Feeling thankful",              level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   pts: 10, desc: "5 rounds, short 3-4 letter words" },
  Medium: { filter: "Medium", pts: 10, desc: "6 rounds, 6-letter words" },
  Hard:   { filter: "Hard",   pts: 20, desc: "4 rounds, 8-letter words!" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function scramble(word: string): string[] { return shuffle(word.split("")); }

function PuzzleGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_WORDS>([]);
  const [idx, setIdx] = useState(0);
  const [tiles, setTiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const qs = shuffle(ALL_WORDS.filter(q => q.level === d));
    setQuestions(qs); setIdx(0); setTiles(scramble(qs[0].word));
    setSelected([]); setScore(0); setChecked(false); setCorrect(false); setDone(false);
  }

  if (!difficulty) return <DifficultySelect title="Word Puzzle" icon="🔤" subtitle="Click tiles to unscramble the word!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  const answer = selected.map(i => tiles[i]).join("");

  function pickTile(i: number) { if (checked || selected.includes(i) || paused) return; setSelected(s => [...s, i]); }
  function removeLast() { if (checked) return; setSelected(s => s.slice(0, -1)); }

  function check() {
    if (!difficulty || !current) return;
    const isCorrect = answer === current.word;
    setCorrect(isCorrect); setChecked(true);
    if (isCorrect) setScore(s => s + CONFIG[difficulty].pts);
  }

  function next() {
    if (!difficulty) return;
    if (idx + 1 >= questions.length) { setDone(true); submitScore("Word Puzzle", score + (correct ? CONFIG[difficulty].pts : 0), difficulty ?? undefined); return; }
    const nextIdx = idx + 1;
    setIdx(nextIdx); setTiles(scramble(questions[nextIdx].word));
    setSelected([]); setChecked(false); setCorrect(false);
  }

  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔤 Word Puzzle</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Puzzle" icon="🔤" steps={["🔤 Scrambled letter tiles are shown with a hint.","👆 Click tiles in the correct order to spell the word.","⌫ Press Undo to remove the last tile.","✅ Press Check when done — correct = points!","❌ Wrong = answer revealed, press Next to continue."]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Puzzle</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Click tiles to unscramble the word!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="glass-card rounded-2xl p-4 mb-4 w-full text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Hint</p>
            <p className="text-white font-semibold">{current.hint}</p>
          </div>
          <div className="flex gap-2 mb-4 min-h-[56px] flex-wrap justify-center">
            {selected.map((ti, i) => (
              <div key={i} className="w-12 h-12 bg-orange-500/20 border-2 border-orange-400 rounded-xl flex items-center justify-center text-xl font-extrabold text-orange-300">{tiles[ti]}</div>
            ))}
            {selected.length === 0 && <p className="text-gray-500 text-sm self-center">Click tiles below...</p>}
          </div>
          <div className="flex gap-2 mb-4 flex-wrap justify-center">
            {tiles.map((t, i) => (
              <button key={i} onClick={() => pickTile(i)} disabled={selected.includes(i) || checked}
                className={`w-12 h-12 rounded-xl text-xl font-extrabold border-2 transition
                  ${selected.includes(i) ? "bg-white/5 border-white/5 text-gray-600" : "bg-white/10 border-white/20 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{t}</button>
            ))}
          </div>
          {checked && (
            <div className={`rounded-xl p-3 mb-4 w-full text-center font-bold ${correct ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {correct ? "✅ Correct!" : `❌ Wrong! Answer: ${current.word}`}
            </div>
          )}
          <div className="flex gap-3 w-full">
            {!checked && (
              <>
                <button onClick={removeLast} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition">⌫ Undo</button>
                <button onClick={check} disabled={answer.length !== current.word.length} className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition">Check ✓</button>
              </>
            )}
            {checked && <button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">Next →</button>}
          </div>
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

export default function PuzzlePage() {
  return <GameErrorBoundary gameName="Word Puzzle"><PuzzleGame /></GameErrorBoundary>;
}
