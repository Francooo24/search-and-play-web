"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScoreCompat as submitScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const EASY_GROUPS = [["ant","bee","cat"],["dog","egg","fox"],["hat","ink","jar"],["kite","lamp","map"],["net","owl","pig"],["queen","rat","sun"],["top","urn","van"],["web","yak","zoo"]];
const MEDIUM_GROUPS = [["apple","banana","cherry"],["grape","honey","iron"],["jump","kite","lemon"],["mango","night","ocean"],["piano","queen","river"],["snake","tiger","umbrella"],["violet","water","xray"],["yellow","zebra","ant"]];
const HARD_GROUPS = [["abstract","balance","capture","define"],["elegant","fortune","genuine","humble"],["imagine","justice","kingdom","lively"],["mystery","natural","observe","patient"],["quality","respect","silence","triumph"],["unique","venture","wisdom","xenial"]];

const CONFIG: Record<Difficulty, { groups: string[][]; total: number; pts: number; desc: string }> = {
  Easy:   { groups: EASY_GROUPS,   total: 6,  pts: 10, desc: "3-letter words, 6 rounds" },
  Medium: { groups: MEDIUM_GROUPS, total: 8,  pts: 10, desc: "Longer words, 8 rounds" },
  Hard:   { groups: HARD_GROUPS,   total: 6,  pts: 20, desc: "4 words per round, harder vocabulary" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function ABCOrderGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [arranged, setArranged] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const w = shuffle(CONFIG[d].groups[0]);
    setRound(0); setScore(0); setWords(CONFIG[d].groups[0]); setArranged([]); setRemaining(w); setChecked(false); setCorrect(false); setDone(false);
  }

  function pick(word: string) { if (checked || paused) return; setArranged(a => [...a, word]); setRemaining(r => r.filter(w => w !== word)); }
  function remove(word: string) { if (checked) return; setRemaining(r => [...r, word]); setArranged(a => a.filter(w => w !== word)); }

  function check() {
    if (!difficulty) return;
    const sorted = [...words].sort();
    const isCorrect = JSON.stringify(arranged) === JSON.stringify(sorted);
    setCorrect(isCorrect); setChecked(true);
    if (isCorrect) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
  }

  function next() {
    if (!difficulty) return;
    if (round + 1 >= CONFIG[difficulty].total) {
      const finalScore = score + (correct ? CONFIG[difficulty].pts : 0);
      setDone(true);
      submitScore("ABC Order", finalScore).then(setNewBadges);
      return;
    }
    const nextRound = round + 1;
    const nextWords = CONFIG[difficulty].groups[nextRound % CONFIG[difficulty].groups.length];
    setRound(nextRound); setWords(nextWords); setArranged([]); setRemaining(shuffle(nextWords)); setChecked(false); setCorrect(false);
  }



  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔤 ABC Order</span>
        <div className="flex gap-2">
          <HowToPlay title="ABC Order" icon="🔤" steps={["🔤 A group of words is shown.","👆 Click the words one by one to arrange them A→Z.","✅ Press Check when done to see if you're correct.","❌ Wrong order shows the correct answer.","🏆 Each correct round earns points!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>ABC Order</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Arrange the words in alphabetical order!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{round + 1} / {CONFIG[difficulty].total}</span>
      </div>
      {!done ? (
        <div className="w-full max-w-sm">
          <p className="text-gray-300 text-sm mb-2">Click words to arrange A→Z:</p>
          <div className="glass-card rounded-2xl p-4 mb-4 min-h-[60px] flex gap-2 flex-wrap">
            {arranged.map(w => <button key={w} onClick={() => remove(w)} className="bg-orange-500/20 border border-orange-400 text-orange-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-500/20 transition">{w} ✕</button>)}
            {arranged.length === 0 && <span className="text-gray-500 text-sm">Your arrangement appears here...</span>}
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {remaining.map(w => <button key={w} onClick={() => pick(w)} className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-500/20 hover:border-orange-400 transition">{w}</button>)}
          </div>
          {checked && <div className={`rounded-xl p-3 mb-4 text-center font-bold ${correct ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>{correct ? "✅ Correct!" : `❌ Wrong! Correct: ${[...words].sort().join(" → ")}`}</div>}
          {!checked && arranged.length === words.length && <button onClick={check} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">Check ✓</button>}
          {checked && <button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">Next →</button>}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= CONFIG[difficulty].total * CONFIG[difficulty].pts * 0.7 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} / {CONFIG[difficulty].total * CONFIG[difficulty].pts}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />
    </div>
  );
}

export default function ABCOrderPage() {
  return <GameErrorBoundary gameName="ABC Order"><ABCOrderGame /></GameErrorBoundary>;
}
