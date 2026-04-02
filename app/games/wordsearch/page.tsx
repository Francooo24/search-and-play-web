"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";
import { submitScore } from "@/lib/submitScore";

const WORD_SETS = [
  { label:"🐾 Animals", words:["CAT","DOG","FOX","OWL","RAT","COW","PIG","HEN","EEL","EMU"] },
  { label:"🍎 Fruits",  words:["APPLE","MANGO","GRAPE","PEACH","LEMON","GUAVA","MELON","OLIVE","DATES","BERRY"] },
  { label:"🌍 Places",  words:["ROME","PERU","CUBA","IRAN","IRAQ","OMAN","FIJI","TOGO","MALI","LAOS"] },
];

const CONFIG: Record<Difficulty, { size: number; wordCount: number; desc: string }> = {
  Easy:   { size: 8,  wordCount: 5,  desc: "8×8 grid, find 5 words" },
  Medium: { size: 10, wordCount: 8,  desc: "10×10 grid, find 8 words" },
  Hard:   { size: 12, wordCount: 10, desc: "12×12 grid, find all 10 words!" },
};

function buildGrid(words: string[], size: number) {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const placed: { word: string; cells: [number, number][] }[] = [];
  const dirs = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];
  for (const word of words) {
    let tries = 0;
    while (tries++ < 200) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * size), c = Math.floor(Math.random() * size);
      const cells: [number, number][] = [];
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) { ok = false; break; }
        if (grid[nr][nc] && grid[nr][nc] !== word[i]) { ok = false; break; }
        cells.push([nr, nc]);
      }
      if (ok) { cells.forEach(([nr, nc], i) => { grid[nr][nc] = word[i]; }); placed.push({ word, cells }); break; }
    }
  }
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return { grid, placed };
}

function WordSearchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [setIdx, setSetIdx] = useState(0);
  const [gameData, setGameData] = useState<ReturnType<typeof buildGrid> | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [selecting, setSelecting] = useState<[number,number][]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty, si = setIdx) {
    setDifficulty(d);
    const words = WORD_SETS[si].words.slice(0, CONFIG[d].wordCount);
    setGameData(buildGrid(words, CONFIG[d].size));
    setFound([]); setScore(0); setDone(false); setSelecting([]);
  }

  if (!gameData) return <GameLoading />;

  const { grid, placed } = gameData;
  const words = WORD_SETS[setIdx].words.slice(0, CONFIG[difficulty].wordCount);
  const size = CONFIG[difficulty].size;
  const cellSize = size <= 8 ? "w-7 h-7 sm:w-9 sm:h-9 text-xs sm:text-sm" : size <= 10 ? "w-6 h-6 sm:w-8 sm:h-8 text-[10px] sm:text-xs" : "w-5 h-5 sm:w-7 sm:h-7 text-[9px] sm:text-[10px]";

  function getTouchCell(e: React.TouchEvent) {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return null;
    const r = el.getAttribute("data-r");
    const c = el.getAttribute("data-c");
    if (r === null || c === null) return null;
    return [Number(r), Number(c)] as [number, number];
  }

  function startSelect(r: number, c: number) { if (paused) return; setSelecting([[r, c]]); }
  function moveSelect(r: number, c: number) {
    if (!selecting.length) return;
    setSelecting(s => {
      const first = s[0];
      const dr = r - first[0], dc = c - first[1];
      const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
      const nr = dr === 0 ? 0 : dr / Math.abs(dr), nc = dc === 0 ? 0 : dc / Math.abs(dc);
      return Array.from({ length: len }, (_, i) => [first[0] + nr * i, first[1] + nc * i] as [number, number]);
    });
  }
  function endSelect() {
    const sel = selecting.map(([r, c]) => grid[r][c]).join("");
    const match = placed.find(p => p.word === sel && !found.includes(p.word) &&
      p.cells.every(([r, c], i) => selecting[i]?.[0] === r && selecting[i]?.[1] === c));
    if (match) {
      const newFound = [...found, match.word];
      setFound(newFound); setScore(s => s + match.word.length * 5);
      if (newFound.length === words.length) { setDone(true); submitScore("Word Search", score + match.word.length * 5); }
    }
    setSelecting([]);
  }
  function isSelected(r: number, c: number) { return selecting.some(([sr, sc]) => sr === r && sc === c); }
  function isFound(r: number, c: number) { return placed.some(p => found.includes(p.word) && p.cells.some(([pr, pc]) => pr === r && pc === c)); }

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔍 Word Search</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Search" icon="🔍" steps={["🔍 Words are hidden in the letter grid.","👆 Click and drag across letters to select a word.","✅ Correct word = highlighted in green!","📝 Words can go horizontal, vertical, or diagonal.","🏆 Find all words to win!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Search</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Find all hidden words in the grid!</p>
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {WORD_SETS.map((s, i) => (
          <button key={i} onClick={() => { setSetIdx(i); startGame(difficulty, i); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${setIdx===i ? "bg-orange-500/30 border-orange-500" : "bg-white/5 border-white/10"}`}>{s.label}</button>
        ))}
      </div>
      <div className="flex gap-4 mb-4 items-center flex-wrap justify-center">
        {[["Score", score, "text-orange-400"], ["Found", `${found.length}/${words.length}`, "text-green-400"]].map(([l, v, c]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-400">{l}</p>
            <p className={`text-xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${DIFF_STYLES[difficulty].badge}`}>{difficulty}</span>
      </div>
      <div className="flex gap-4 flex-col sm:flex-row flex-wrap justify-center">
        <div className="select-none overflow-x-auto w-full" onMouseLeave={endSelect}
          onTouchEnd={e => { e.preventDefault(); endSelect(); }}
          onTouchMove={e => { e.preventDefault(); const cell = getTouchCell(e); if (cell) moveSelect(cell[0], cell[1]); }}
          style={{ touchAction: "none" }}>
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                <div key={c} data-r={r} data-c={c}
                  onMouseDown={() => startSelect(r, c)} onMouseEnter={() => moveSelect(r, c)} onMouseUp={endSelect}
                  onTouchStart={() => startSelect(r, c)}
                  className={`${cellSize} flex items-center justify-center font-bold cursor-pointer rounded transition
                    ${isFound(r,c) ? "bg-green-500/30 text-green-300" : isSelected(r,c) ? "bg-orange-500/40 text-orange-200" : "text-gray-300 hover:bg-white/10"}`}>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Find these words:</p>
          {words.map(w => (
            <span key={w} className={`text-sm font-bold px-3 py-1 rounded-full ${found.includes(w) ? "bg-green-500/20 text-green-400 line-through" : "bg-white/5 text-gray-300"}`}>{w}</span>
          ))}
        </div>
      </div>
      <button onClick={() => startGame(difficulty)} className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm">🔄 New Game</button>
      {done && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 text-center max-w-xs w-full">
            <p className="text-6xl mb-3">🎉</p>
            <p className="text-2xl font-bold text-white mb-2">All Found!</p>
            <p className={`text-sm mb-2 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
            <p className="text-orange-400 font-bold text-xl mb-6">Score: {score}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition">🔄 Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WordSearchPage() {
  return <GameErrorBoundary gameName="Word Search"><WordSearchGame /></GameErrorBoundary>;
}
