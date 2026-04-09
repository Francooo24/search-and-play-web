"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const WORD_SETS = [
  { label:"🍎 Fruits",    words:["APPLE","MANGO","GRAPE","PEACH","BERRY","LEMON","GUAVA","MELON","OLIVE","DATES"] },
  { label:"🐾 Animals",   words:["TIGER","ZEBRA","EAGLE","SHARK","PANDA","KOALA","OTTER","SLOTH","WHALE","CAMEL"] },
  { label:"🎨 Colors",    words:["BLACK","WHITE","GREEN","BROWN","CORAL","IVORY","LILAC","MAUVE","OLIVE","PEACH"] },
  { label:"🌍 Countries", words:["INDIA","CHINA","SPAIN","EGYPT","ITALY","JAPAN","GHANA","KENYA","NEPAL","QATAR"] },
  { label:"✏️ Verbs",     words:["WRITE","SPEAK","DANCE","LAUGH","THINK","DRIVE","BUILD","PAINT","TEACH","CLIMB"] },
  { label:"🏠 Objects",   words:["CHAIR","TABLE","CLOCK","PHONE","LIGHT","BRUSH","KNIFE","PLATE","SPOON","TOWEL"] },
  { label:"🌿 Nature",    words:["CLOUD","STORM","RIVER","FLAME","FROST","GROVE","MARSH","PLAIN","RIDGE","SHORE"] },
  { label:"🎓 School",    words:["CHALK","CLASS","GRADE","LEARN","NOTES","PAPER","STUDY","TUTOR","EXAMS","BOOKS"] },
];

const DIFF_CONFIG: Record<Difficulty, { maxRows: number; showHint: boolean; desc: string }> = {
  Easy:   { maxRows: 8, showHint: true,  desc: "8 tries, category hint shown" },
  Medium: { maxRows: 6, showHint: true,  desc: "6 tries, category hint shown" },
  Hard:   { maxRows: 4, showHint: false, desc: "Only 4 tries, no category hint!" },
};

const WORD_LEN = 5;
const KB_ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];

type TileState = ""| "correct" | "present" | "absent" | "filled";
type KeyState = Record<string, "correct"|"present"|"absent"|"">;

function evaluate(guess: string, target: string): ("correct"|"present"|"absent")[] {
  const res = Array(WORD_LEN).fill("absent") as ("correct"|"present"|"absent")[];
  const tArr = target.split(""); const used = Array(WORD_LEN).fill(false);
  for (let i = 0; i < WORD_LEN; i++) { if (guess[i] === tArr[i]) { res[i] = "correct"; used[i] = true; } }
  for (let i = 0; i < WORD_LEN; i++) {
    if (res[i] === "correct") continue;
    for (let j = 0; j < WORD_LEN; j++) { if (!used[j] && guess[i] === tArr[j]) { res[i] = "present"; used[j] = true; break; } }
  }
  return res;
}

function WordleGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [mounted, setMounted] = useState(false);
  const [setIdx, setSetIdx] = useState(0);
  const [target, setTarget] = useState("");
  const [grid, setGrid] = useState<{letter:string;state:TileState}[][]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [keyState, setKeyState] = useState<KeyState>({});
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<{emoji:string;title:string;sub:string;pts:string}|null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const maxRows = difficulty ? DIFF_CONFIG[difficulty].maxRows : 6;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 1500); };

  function startGame(d: Difficulty, si = setIdx) {
    setDifficulty(d);
    const words = WORD_SETS[si].words;
    const t = words[Math.floor(Math.random() * words.length)];
    setTarget(t);
    setGrid(Array.from({length:DIFF_CONFIG[d].maxRows}, () => Array.from({length:WORD_LEN}, () => ({letter:"",state:"" as TileState}))));
    setCurrentRow(0); setCurrentCol(0); setKeyState({}); setGameOver(false); setResult(null);
  }

  if (!mounted) return null;
  if (!difficulty) return <DifficultySelect title="WordGuess" icon="📝" subtitle="Guess the 5-letter word!" descriptions={{ Easy: DIFF_CONFIG.Easy.desc, Medium: DIFF_CONFIG.Medium.desc, Hard: DIFF_CONFIG.Hard.desc }} onSelect={startGame} />;

  const addLetter = useCallback((l: string) => {
    if (gameOver || currentCol >= WORD_LEN) return;
    setGrid(g => { const ng = g.map(r => [...r]); ng[currentRow][currentCol] = {letter:l,state:"filled"}; return ng; });
    setCurrentCol(c => c + 1);
  }, [gameOver, currentRow, currentCol]);

  const deleteLetter = useCallback(() => {
    if (currentCol <= 0) return;
    setGrid(g => { const ng = g.map(r => [...r]); ng[currentRow][currentCol-1] = {letter:"",state:""}; return ng; });
    setCurrentCol(c => c - 1);
  }, [currentRow, currentCol]);

  const submitGuess = useCallback(() => {
    if (!difficulty) return;
    if (currentCol < WORD_LEN) { showToast("Not enough letters"); return; }
    const guess = grid[currentRow].map(t => t.letter).join("");
    const res = evaluate(guess, target);
    const priority: Record<string,number> = {correct:3,present:2,absent:1};
    const newKeyState = {...keyState};
    setGrid(g => { const ng = g.map(r => [...r]); res.forEach((state,i) => { ng[currentRow][i] = {letter:guess[i],state}; }); return ng; });
    res.forEach((state,i) => { const l = guess[i]; if ((priority[state]||0) > (priority[newKeyState[l]]||0)) newKeyState[l] = state; });
    setKeyState(newKeyState);
    const won = res.every(r => r === "correct");
    const nextRow = currentRow + 1;
    if (won) {
      setGameOver(true); setScore(s => s+10); setWins(w => w+1); setStreak(s => s+1);
      fetch("/api/games/score", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "WordGuess", won: true, score: 10 }) }).catch(() => {});
      setTimeout(() => setResult({emoji:"🎉",title:"Brilliant!",sub:`The word was: ${target}`,pts:"+10 pts!"}), 1800);
    } else if (nextRow >= DIFF_CONFIG[difficulty].maxRows) {
      setGameOver(true); setStreak(0);
      fetch("/api/games/score", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "WordGuess", won: false, score: 0 }) }).catch(() => {});
      setTimeout(() => setResult({emoji:"😔",title:"Game Over!",sub:`The word was: ${target}`,pts:"Better luck next time!"}), 800);
    }
    setCurrentRow(nextRow); setCurrentCol(0);
  }, [currentCol, currentRow, grid, target, keyState, difficulty]);

  const pressKey = useCallback((k: string) => {
    if (paused) return;
    if (k === "BACKSPACE") { deleteLetter(); return; }
    if (k === "ENTER") { submitGuess(); return; }
    if (/^[A-Z]$/.test(k)) addLetter(k);
  }, [addLetter, deleteLetter, submitGuess]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Backspace") pressKey("BACKSPACE");
      else if (e.key === "Enter") pressKey("ENTER");
      else if (/^[a-zA-Z]$/.test(e.key)) pressKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pressKey]);

  const tileColor = (state: TileState) => {
    if (state === "correct") return "bg-[#538d4e] border-[#538d4e]";
    if (state === "present") return "bg-[#b59f3b] border-[#b59f3b]";
    if (state === "absent") return "bg-[#3a3a3c] border-[#3a3a3c]";
    if (state === "filled") return "border-[#6b7a8d]";
    return "border-[#3f4a5a]";
  };
  const keyColor = (k: string) => {
    const s = keyState[k];
    if (s === "correct") return "bg-[#538d4e]";
    if (s === "present") return "bg-[#b59f3b]";
    if (s === "absent") return "bg-[#3a3a3c]";
    return "bg-[#818384]";
  };


  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-2.5 rounded-lg font-bold text-sm z-50">{toast}</div>}
      <nav className="w-full flex justify-between items-center mb-4">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">📝 WordGuess</span>
        <div className="flex gap-2">
          <HowToPlay title="WordGuess" icon="📝" steps={[
            "🔤 Guess the hidden 5-letter word.",
            "⌨️ Type a letter or use the on-screen keyboard, then press Enter.",
            "🟩 Green = correct letter in the right spot.",
            "🟨 Yellow = correct letter but wrong spot.",
            "⬛ Gray = letter is not in the word.",
            "💡 On Easy & Medium, a category hint is shown above the board.",
          ]} />
          <PauseButton onPause={setPaused} disabled={gameOver} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white text-center mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>WordGuess</h1>
      <p className="text-gray-400 text-sm mb-2 text-center">Guess the 5-letter word in {maxRows} tries.</p>
      <div className="flex gap-4 mb-3 text-xs text-gray-400">
        <span><span className="inline-block w-4 h-4 rounded bg-[#538d4e] mr-1 align-middle" />Correct spot</span>
        <span><span className="inline-block w-4 h-4 rounded bg-[#b59f3b] mr-1 align-middle" />Wrong spot</span>
        <span><span className="inline-block w-4 h-4 rounded bg-[#3a3a3c] mr-1 align-middle" />Not in word</span>
      </div>
      {DIFF_CONFIG[difficulty].showHint && (
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {WORD_SETS.map((s, i) => (
            <button key={i} onClick={() => { setSetIdx(i); startGame(difficulty, i); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${setIdx===i ? "bg-orange-500/30 border-orange-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>{s.label}</button>
          ))}
        </div>
      )}
      <div className="flex gap-4 mb-3">
        {[["Score",score,"text-orange-400"],["Wins",wins,"text-green-400"],["Streak",streak,"text-yellow-400"]].map(([l,v,c]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-400">{l}</p>
            <p className={`text-xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-1 mb-4">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-1 justify-center">
            {row.map((tile, c) => (
              <div key={c} className={`w-[11vw] h-[11vw] max-w-[58px] max-h-[58px] border-2 rounded-md flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white uppercase transition-all ${tileColor(tile.state)}`}>{tile.letter}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="space-y-1.5 mb-4">
        {KB_ROWS.map(row => (
          <div key={row} className="flex gap-1 sm:gap-1.5 justify-center">
            {row === "ZXCVBNM" && <button onClick={() => pressKey("BACKSPACE")} className="h-12 sm:h-14 min-w-[10vw] sm:min-w-[64px] max-w-[64px] px-1 rounded-md text-xs font-bold bg-[#818384] text-white hover:opacity-90 transition">⌫</button>}
            {row.split("").map(k => <button key={k} onClick={() => pressKey(k)} className={`h-12 sm:h-14 w-[8vw] sm:min-w-[38px] max-w-[38px] px-0.5 rounded-md text-xs sm:text-sm font-bold text-white transition hover:opacity-90 ${keyColor(k)}`}>{k}</button>)}
            {row === "ZXCVBNM" && <button onClick={() => pressKey("ENTER")} className="h-12 sm:h-14 min-w-[10vw] sm:min-w-[64px] max-w-[64px] px-1 rounded-md text-xs font-bold bg-[#818384] text-white hover:opacity-90 transition">ENT</button>}
          </div>
        ))}
      </div>
      <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm mb-6">🔄 New Word</button>
      {result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 text-center max-w-xs w-full">
            <p className="text-6xl mb-3">{result.emoji}</p>
            <p className="text-2xl font-bold text-white mb-1">{result.title}</p>
            <p className="text-gray-400 text-sm mb-1">{result.sub}</p>
            <p className="text-orange-400 font-bold mb-5">{result.pts}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setResult(null); startGame(difficulty); }} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl transition text-sm">Next Word</button>
              <button onClick={() => { setResult(null); setDifficulty(null); }} className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2 rounded-xl transition text-sm">🎯 Difficulty</button>
              <Link href="/games" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2 rounded-xl transition text-sm">Back</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WordlePage() {
  return (
    <GameErrorBoundary gameName="WordGuess">
      <WordleGame />
    </GameErrorBoundary>
  );
}
