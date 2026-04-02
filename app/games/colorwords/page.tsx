"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScoreCompat as submitScore, fetchBestScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const ITEMS = [
  // Fruits
  { name: "Apple",        emoji: "🍎", color: "#ef4444", colorName: "Red"    },
  { name: "Banana",       emoji: "🍌", color: "#eab308", colorName: "Yellow" },
  { name: "Grapes",       emoji: "🍇", color: "#a855f7", colorName: "Purple" },
  { name: "Orange",       emoji: "🍊", color: "#f97316", colorName: "Orange" },
  { name: "Watermelon",   emoji: "🍉", color: "#22c55e", colorName: "Green"  },
  { name: "Strawberry",   emoji: "🍓", color: "#ec4899", colorName: "Pink"   },
  { name: "Blueberry",    emoji: "🫐", color: "#3b82f6", colorName: "Blue"   },
  { name: "Coconut",      emoji: "🥥", color: "#92400e", colorName: "Brown"  },
  // Animals
  { name: "Flamingo",     emoji: "🦩", color: "#ec4899", colorName: "Pink"   },
  { name: "Frog",         emoji: "🐸", color: "#22c55e", colorName: "Green"  },
  { name: "Elephant",     emoji: "🐘", color: "#6b7280", colorName: "Gray"   },
  { name: "Bumblebee",    emoji: "🐝", color: "#eab308", colorName: "Yellow" },
  { name: "Bluebird",     emoji: "🐦", color: "#3b82f6", colorName: "Blue"   },
  { name: "Ladybug",      emoji: "🐞", color: "#ef4444", colorName: "Red"    },
  { name: "Bear",         emoji: "🐻", color: "#92400e", colorName: "Brown"  },
  { name: "Octopus",      emoji: "🐙", color: "#a855f7", colorName: "Purple" },
  // Vehicles
  { name: "Fire Truck",   emoji: "🚒", color: "#ef4444", colorName: "Red"    },
  { name: "School Bus",   emoji: "🚌", color: "#eab308", colorName: "Yellow" },
  { name: "Police Car",   emoji: "🚓", color: "#3b82f6", colorName: "Blue"   },
  { name: "Taxi",         emoji: "🚕", color: "#eab308", colorName: "Yellow" },
  { name: "Tractor",      emoji: "🚜", color: "#22c55e", colorName: "Green"  },
  // Nature
  { name: "Sun",          emoji: "☀️",  color: "#eab308", colorName: "Yellow" },
  { name: "Leaf",         emoji: "🍃", color: "#22c55e", colorName: "Green"  },
  { name: "Rose",         emoji: "🌹", color: "#ef4444", colorName: "Red"    },
  { name: "Ocean",        emoji: "🌊", color: "#3b82f6", colorName: "Blue"   },
  { name: "Mushroom",     emoji: "🍄", color: "#f97316", colorName: "Orange" },
  { name: "Snowflake",    emoji: "❄️",  color: "#3b82f6", colorName: "Blue"   },
  // Food
  { name: "Carrot",       emoji: "🥕", color: "#f97316", colorName: "Orange" },
  { name: "Eggplant",     emoji: "🍆", color: "#a855f7", colorName: "Purple" },
  { name: "Broccoli",     emoji: "🥦", color: "#22c55e", colorName: "Green"  },
  { name: "Chili",        emoji: "🌶️", color: "#ef4444", colorName: "Red"    },
  { name: "Corn",         emoji: "🌽", color: "#eab308", colorName: "Yellow" },
  { name: "Chocolate",    emoji: "🍫", color: "#92400e", colorName: "Brown"  },
  { name: "Cotton Candy", emoji: "🍭", color: "#ec4899", colorName: "Pink"   },
];

const ALL_COLORS = [
  { colorName: "Red",    color: "#ef4444" },
  { colorName: "Yellow", color: "#eab308" },
  { colorName: "Purple", color: "#a855f7" },
  { colorName: "Orange", color: "#f97316" },
  { colorName: "Green",  color: "#22c55e" },
  { colorName: "Pink",   color: "#ec4899" },
  { colorName: "Blue",   color: "#3b82f6" },
  { colorName: "Brown",  color: "#92400e" },
  { colorName: "Gray",   color: "#6b7280" },
];

const CONFIG: Record<Difficulty, { total: number; pts: number; time: number }> = {
  Easy:   { total: 8,  pts: 10, time: 15 },
  Medium: { total: 12, pts: 10, time: 10 },
  Hard:   { total: 16, pts: 15, time: 7  },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function generateQuestion(usedNames: string[]) {
  const pool = shuffle(ITEMS.filter(i => !usedNames.includes(i.name)));
  const item = pool[0] ?? shuffle(ITEMS)[0]; // fallback if all used
  const wrongColors = shuffle(ALL_COLORS.filter(c => c.colorName !== item.colorName)).slice(0, 3);
  const correctColor = { colorName: item.colorName, color: item.color };
  const options = shuffle([correctColor, ...wrongColors]);
  return { item, correctAnswer: item.colorName, options };
}

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

function ColorWordsGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  const [q, setQ] = useState<ReturnType<typeof generateQuestion> | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [usedItems, setUsedItems] = useState<string[]>([]);

  useEffect(() => { startGame("Hard"); }, []);
  useEffect(() => { fetchBestScore("Color Words").then(setBestScore); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const first = generateQuestion([]);
    setQ(first);
    setUsedItems([first.item.name]);
    setScore(0); setRound(1); setSelected(null); setDone(false); setStreak(0);
    setTimeLeft(CONFIG[d].time);
  }

  useEffect(() => {
    if (!q || selected || done || paused) return;
    if (timeLeft <= 0) {
      // time's up — treat as wrong
      setSelected("__timeout__");
      setStreak(0);
      playWrong();
      setTimeout(() => {
        if (round >= CONFIG[difficulty].total) {
          setDone(true);
          submitScore("Color Words", score).then(setNewBadges);
          return;
        }
        setRound(r => r + 1); setSelected(null);
        setUsedItems(prev => {
          const next = generateQuestion([...prev]);
          setQ(next);
          return [...prev, next.item.name];
        });
        setTimeLeft(CONFIG[difficulty].time);
      }, 900);
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, done, paused, q]);

  function answer(opt: string) {
    if (selected || !difficulty || paused || !q) return;
    setSelected(opt);
    const correct = opt === q.correctAnswer;
    if (correct) {
      setScore(s => s + CONFIG[difficulty].pts);
      setStreak(s => s + 1);
      playCorrect();
    } else {
      setStreak(0);
      playWrong();
    }
    setTimeout(() => {
      if (round >= CONFIG[difficulty].total) {
        setDone(true);
        submitScore("Color Words", score + (correct ? CONFIG[difficulty].pts : 0)).then(setNewBadges);
        return;
      }
      setRound(r => r + 1); setSelected(null);
      setUsedItems(prev => {
        const next = generateQuestion([...prev]);
        setQ(next);
        return [...prev, next.item.name];
      });
      setTimeLeft(CONFIG[difficulty].time);
    }, 900);
  }

  const progress = (round / CONFIG[difficulty].total) * 100;
  const maxScore = CONFIG[difficulty].total * CONFIG[difficulty].pts;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4 min-h-screen">
      {/* Nav */}
      <nav className="w-full flex justify-between items-center mb-6 relative">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back</Link>
        <span className="font-bold text-lg text-white absolute left-1/2 -translate-x-1/2 tracking-wide">🎨 Color Words</span>
        <div className="flex gap-2">
          <HowToPlay title="Color Words" icon="🎨" steps={["🎨 A color word appears in a specific ink color.", "👁️ Identify the INK color — not what the word says!", "✅ Pick the correct ink color from the 4 choices.", "⚠️ Medium/Hard: ink color differs from the word!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>

      {!done && q ? (
        <div className="flex flex-col items-center w-full max-w-md gap-5">

          {/* Difficulty tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1 w-full">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => startGame(d)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-200
                  ${difficulty === d ? "bg-white/15 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div className="w-full flex justify-between items-center px-1">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Score</p>
              <p className="text-white font-black text-xl">{score}</p>
            </div>
            {streak >= 2 ? (
              <div className="bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full">
                🔥 {streak} Streak
              </div>
            ) : (
              <div className="text-xs text-gray-600 font-medium">{round} / {CONFIG[difficulty].total}</div>
            )}
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Best</p>
              <p className="text-white font-black text-xl">{bestScore}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: q.item.color }}
            />
          </div>

          {/* Word card */}
          <div className="relative w-full">
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-20 transition-all duration-500"
              style={{ backgroundColor: q.item.color }}
            />
            <div
              className="relative rounded-3xl px-8 py-10 flex flex-col items-center gap-3 transition-all duration-500 border border-white/10"
              style={{ backgroundColor: "#0f0f14" }}
            >
              <p className="text-white text-sm font-black uppercase tracking-[0.2em] drop-shadow">What is the color of {q.item.name}?</p>
              <span style={{ fontSize: "clamp(3.5rem, 14vw, 5rem)" }}>{q.item.emoji}</span>
              {/* Timer */}
              <div className="w-full mt-2">
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Time</span>
                  <span className={`font-black ${timeLeft <= 3 ? "text-red-400" : "text-white"}`}>{timeLeft}s</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(timeLeft / CONFIG[difficulty].time) * 100}%`,
                      backgroundColor: timeLeft <= 3 ? "#ef4444" : q.item.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {q.options.map(opt => {
              const isSelected = selected === opt.colorName;
              const isCorrect = opt.colorName === q.correctAnswer;
              const showResult = !!selected;

              return (
                <button
                  key={opt.colorName}
                  onClick={() => answer(opt.colorName)}
                  disabled={!!selected}
                  className={`relative h-16 rounded-2xl border-2 transition-all duration-200 overflow-hidden
                    ${ showResult && isCorrect ? "border-green-400 scale-105"
                    : showResult && isSelected && !isCorrect ? "border-red-400 scale-95 opacity-60"
                    : "border-transparent hover:border-white/20 hover:scale-[1.02]"}`}
                  style={{ backgroundColor: opt.color, boxShadow: !selected ? `0 4px 20px ${opt.color}55` : undefined }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm tracking-widest drop-shadow-lg">
                    {opt.colorName}
                  </span>
                  {showResult && isCorrect && (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl drop-shadow-lg">✓</span>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl drop-shadow-lg">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Over */
        <div className="flex flex-col items-center w-full max-w-sm text-center mt-6 gap-5">
          <div className="text-6xl">{score >= maxScore * 0.8 ? "🏆" : score >= maxScore * 0.5 ? "🎉" : "😊"}</div>

          <div>
            <h2 className="text-3xl font-black text-white tracking-wide">Game Over</h2>
            <p className="text-gray-500 text-sm mt-1">{difficulty} Mode</p>
          </div>

          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-1">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Final Score</p>
            <p className="text-5xl font-black text-white">{score}</p>
            <p className="text-gray-600 text-sm">out of {maxScore}</p>
            {score > bestScore && (
              <p className="text-white text-xs font-bold mt-2 tracking-widest uppercase">🏆 New Best!</p>
            )}
          </div>

          {/* Score bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
              style={{ width: `${(score / maxScore) * 100}%` }}
            />
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => startGame(difficulty)}
              className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-3.5 rounded-2xl transition text-sm tracking-wide"
            >
              🔄 Play Again
            </button>
            <button
              onClick={() => startGame(difficulty === "Easy" ? "Medium" : difficulty === "Medium" ? "Hard" : "Easy")}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-2xl transition text-sm tracking-wide shadow-lg shadow-orange-500/25"
            >
              Next Level →
            </button>
          </div>
        </div>
      )}

      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />
    </div>
  );
}

export default function ColorWordsPage() {
  return (
    <GameErrorBoundary gameName="Color Words">
      <ColorWordsGame />
    </GameErrorBoundary>
  );
}
