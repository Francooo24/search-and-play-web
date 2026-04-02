"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSound } from "@/lib/useSound";
import { checkAchievements } from "@/lib/checkAchievements";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const THEMES: Record<string, string[]> = {
  fruits:  ["🍎","🍌","🍇","🍓","🍒","🥭","🍍","🥝"],
  animals: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼"],
  sports:  ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱"],
  travel:  ["✈️","🚂","🚢","🚁","🏖️","🗼","🗽","🏔️"],
  music:   ["🎸","🎹","🥁","🎺","🎻","🎷","🪗","🎵"],
  food:    ["🍕","🍔","🌮","🍜","🍣","🍩","🍦","🧁"],
};

const THEME_LABELS = [
  ["fruits","🍎 Fruits"],["animals","🐾 Animals"],["sports","⚽ Sports"],
  ["travel","🌍 Travel"],["music","🎵 Music"],["food","🍕 Food"],
];

// Level config: pairs per level → total cards: 4, 8, 12, 16
const LEVELS = [2, 4, 6, 8]; // 2 pairs=4 cards, 4 pairs=8 cards, 6 pairs=12 cards, 8 pairs=16 cards

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getGridCols(pairs: number) {
  if (pairs <= 2) return "grid-cols-4"; // 4 cards → 1 row of 4
  if (pairs <= 4) return "grid-cols-4"; // 8 cards → 2 rows of 4
  if (pairs <= 6) return "grid-cols-4"; // 12 cards → 3 rows of 4
  return "grid-cols-4";                 // 16 cards → 4 rows of 4
}

function MemoryGame() {
  const [level, setLevel]       = useState(0); // 0-3
  const [theme, setTheme]       = useState("fruits");
  const [cards, setCards]       = useState<{ sym: string; id: number }[]>([]);
  const [flipped, setFlipped]   = useState<number[]>([]);
  const [matched, setMatched]   = useState<number[]>([]);
  const [moves, setMoves]       = useState(0);
  const [timer, setTimer]       = useState(0);
  const [locked, setLocked]     = useState(false);
  const [showWin, setShowWin]   = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [showInstr, setShowInstr] = useState(false);
  const [totalPts, setTotalPts] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  const startLevel = useCallback((lvl: number, th: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const pairs = LEVELS[lvl];
    const pool = THEMES[th].slice(0, pairs);
    const deck = shuffle([...pool, ...pool]).map((sym, id) => ({ sym, id: id + lvl * 100 + Date.now() % 1000 }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(0);
    setLocked(false);
    setShowWin(false);
    setShowFinal(false);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  }, []);

  useEffect(() => {
    startLevel(level, theme);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFlip = (idx: number) => {
    if (paused || locked || flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newFlipped;
      if (cards[a].sym === cards[b].sym) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        setLocked(false);
        playCorrect();
        if (newMatched.length === cards.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          const pts = 20 + Math.max(0, 100 - moves - timer);
          setTotalPts(p => p + pts);
          fetch("/api/games/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game: "Memory Game", won: true, score: pts }),
          }).then(() => checkAchievements()).then(setNewBadges);
          setTimeout(() => {
            if (level >= LEVELS.length - 1) setShowFinal(true);
            else setShowWin(true);
          }, 500);
        }
      } else {
        playWrong();
        setTimeout(() => { setFlipped([]); setLocked(false); }, 700);
      }
    }
  };

  const goNextLevel = () => {
    const next = level + 1;
    setLevel(next);
    startLevel(next, theme);
  };

  const restartGame = () => {
    setLevel(0);
    setTotalPts(0);
    startLevel(0, theme);
  };

  const changeTheme = (t: string) => {
    setTheme(t);
    setLevel(0);
    setTotalPts(0);
    startLevel(0, t);
  };

  const cardState = (idx: number) => {
    if (matched.includes(idx)) return "matched";
    if (flipped.includes(idx)) return "flipped";
    return "hidden";
  };

  // Pause/resume timer
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  const pairs = LEVELS[level];
  const totalCards = pairs * 2;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      {/* Nav */}
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🧠 Memory Game</span>
        <div className="flex gap-2">
          <PauseButton onPause={setPaused} disabled={showFinal} />
          <button onClick={() => setShowInstr(true)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">❓ How to Play</button>
        </div>
      </nav>

      {/* Instructions Modal */}
      {showInstr && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">🧠 How to Play</h2>
              <button onClick={() => setShowInstr(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🎯 Click a <b>card</b> to flip it and reveal the emoji.</li>
              <li>🔄 Flip a <b>second card</b> — if they match, they stay open!</li>
              <li>❌ If they don't match, both cards <b>flip back</b>.</li>
              <li>📈 Complete each level to unlock the next:<br/>
                <span className="text-orange-400">4 → 8 → 12 → 16 cards</span>
              </li>
              <li>🏆 Finish all 4 levels to win!</li>
            </ul>
            <button onClick={() => setShowInstr(false)} className="mt-5 w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2.5 rounded-xl font-semibold transition">Got it!</button>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-white text-center mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Memory Match</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Flip cards and find all matching pairs!</p>

      {/* Level Progress */}
      <div className="flex gap-2 mb-4">
        {LEVELS.map((p, i) => (
          <div key={i} className={`flex flex-col items-center px-3 py-1.5 rounded-full border text-xs font-semibold transition
            ${i === level ? "bg-gradient-to-r from-orange-500 to-amber-600 border-orange-400 text-white" :
              i < level ? "bg-green-700/40 border-green-500 text-green-300" :
              "bg-white/5 border-white/20 text-gray-500"}`}>
            {i < level ? "✓" : `${p * 2}`}
          </div>
        ))}
      </div>
      <p className="text-orange-300 text-xs mb-3 font-semibold">Level {level + 1} / {LEVELS.length} — {totalCards} Cards</p>

      {/* Theme */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {THEME_LABELS.map(([key, label]) => (
          <button key={key} onClick={() => changeTheme(key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${theme === key ? "border-orange-500 bg-orange-500/15" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {[
          ["Moves", moves, "text-orange-400"],
          ["Pairs", `${matched.length / 2}/${pairs}`, "text-green-400"],
          ["Time", `${timer}s`, "text-blue-400"],
          ["Score", totalPts, "text-yellow-400"],
        ].map(([label, val, color]) => (
          <div key={label as string} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Board */}
      <div className={`grid ${getGridCols(pairs)} gap-2 mb-5`}>
        {cards.map((card, idx) => {
          const state = cardState(idx);
          return (
            <div key={card.id} onClick={() => handleFlip(idx)}
              className={`w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center text-xl sm:text-2xl border-2 select-none
                ${state === "hidden"  ? "bg-slate-800 border-white/10 text-slate-700" : ""}
                ${state === "flipped" ? "bg-blue-700 border-blue-400 scale-105" : ""}
                ${state === "matched" ? "bg-green-700 border-green-400" : ""}
              `}>
              {state !== "hidden" ? card.sym : "❓"}
            </div>
          );
        })}
      </div>

      <button onClick={restartGame} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm mb-6">🔄 Restart</button>

      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />

      {/* Level Complete Modal */}
      {showWin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl">
            <p className="text-6xl mb-3">🎉</p>
            <p className="text-2xl font-bold text-white mb-1">Level {level + 1} Complete!</p>
            <p className="text-gray-400 text-sm mb-1">{moves} moves • {timer}s</p>
            <p className="text-orange-400 font-bold mb-2">Total Score: {totalPts} pts</p>
            <p className="text-green-400 text-sm mb-5">Next: <span className="font-bold">{LEVELS[level + 1] * 2} cards</span> 🚀</p>
            <button onClick={goNextLevel} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm">
              Next Level →
            </button>
          </div>
        </div>
      )}

      {/* Final Win Modal */}
      {showFinal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl">
            <p className="text-6xl mb-3">🏆</p>
            <p className="text-2xl font-bold text-white mb-1">You Finished All Levels!</p>
            <p className="text-gray-400 text-sm mb-1">{moves} moves • {timer}s</p>
            <p className="text-yellow-400 font-bold text-xl mb-5">Total: {totalPts} pts 🎊</p>
            <div className="flex gap-3 justify-center">
              <button onClick={restartGame} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl transition text-sm">Play Again</button>
              <Link href="/games" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2 rounded-xl transition text-sm">Back</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemoryGamePage() {
  return <GameErrorBoundary gameName="Memory Game"><MemoryGame /></GameErrorBoundary>;
}
