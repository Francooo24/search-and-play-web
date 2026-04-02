"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";

const PUZZLES = {
  Easy: {
    size: 5,
    words: [
      { word:"CAT",   row:0, col:0, dir:"across", clue:"1A: A common pet" },
      { word:"DOG",   row:2, col:0, dir:"across", clue:"2A: Man's best friend" },
      { word:"SUN",   row:4, col:0, dir:"across", clue:"3A: The star in our sky" },
      { word:"CDS",   row:0, col:0, dir:"down",   clue:"1D: Compact discs (abbr.)" },
      { word:"AO",    row:0, col:2, dir:"down",   clue:"2D: First two vowels" },
      { word:"TGN",   row:0, col:4, dir:"down",   clue:"3D: Initials only" },
    ],
  },
  Medium: {
    size: 7,
    words: [
      { word:"PLANET", row:0, col:0, dir:"across", clue:"1A: Orbits around a star" },
      { word:"BRIDGE", row:2, col:0, dir:"across", clue:"2A: Connects two sides" },
      { word:"CASTLE", row:4, col:0, dir:"across", clue:"3A: A large medieval fortress" },
      { word:"PLAIN",  row:0, col:0, dir:"down",   clue:"1D: Flat open land" },
      { word:"LACE",   row:0, col:2, dir:"down",   clue:"2D: Delicate fabric" },
      { word:"ANGEL",  row:0, col:4, dir:"down",   clue:"3D: Heavenly being" },
    ],
  },
  Hard: {
    size: 9,
    words: [
      { word:"ABSOLUTE", row:0, col:0, dir:"across", clue:"1A: Complete and total" },
      { word:"BACKBONE", row:2, col:0, dir:"across", clue:"2A: Spine or main support" },
      { word:"CALENDAR", row:4, col:0, dir:"across", clue:"3A: Shows days and months" },
      { word:"DARKNESS", row:6, col:0, dir:"across", clue:"4A: Absence of light" },
      { word:"ABCD",     row:0, col:0, dir:"down",   clue:"1D: First four letters" },
      { word:"SOAK",     row:0, col:4, dir:"down",   clue:"2D: To drench in liquid" },
      { word:"ELEN",     row:0, col:8, dir:"down",   clue:"3D: A name (abbr.)" },
    ],
  },
};

const CONFIG: Record<Difficulty, { desc: string }> = {
  Easy:   { desc: "5×5 grid, short simple words" },
  Medium: { desc: "7×7 grid, 6-letter words" },
  Hard:   { desc: "9×9 grid, 8-letter words!" },
};

function buildGrid(puzzle: typeof PUZZLES.Medium) {
  const grid: (string | null)[][] = Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill(null));
  puzzle.words.forEach(({ word, row, col, dir }) => {
    for (let i = 0; i < word.length; i++) {
      const r = dir === "down" ? row + i : row;
      const c = dir === "across" ? col + i : col;
      if (r < puzzle.size && c < puzzle.size) grid[r][c] = word[i];
    }
  });
  return grid;
}

function CrosswordGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [solution, setSolution] = useState<(string|null)[][]>([]);
  const [puzzle, setPuzzle] = useState<typeof PUZZLES.Medium | null>(null);
  const [inputs, setInputs] = useState<string[][]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintMsg, setHintMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => { setMounted(true); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const p = PUZZLES[d];
    setPuzzle(p);
    const sol = buildGrid(p);
    setSolution(sol);
    setInputs(Array.from({ length: p.size }, () => Array(p.size).fill("")));
    refs.current = Array.from({ length: p.size }, () => Array(p.size).fill(null));
    setChecked(false); setScore(0); setHintsUsed(0); setHintMsg("");
  }

  function useHint(wordIdx: number) {
    if (!puzzle || paused || checked) return;
    const w = puzzle.words[wordIdx];
    // Find first unfilled cell of this word
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === "down" ? w.row + i : w.row;
      const c = w.dir === "across" ? w.col + i : w.col;
      if ((inputs[r]?.[c] ?? "") === "") {
        setInputs(prev => {
          const next = prev.map(row => [...row]);
          next[r][c] = w.word[i];
          return next;
        });
        setHintsUsed(h => h + 1);
        setHintMsg(`💡 Hint used! (-5pts penalty)`);
        setTimeout(() => setHintMsg(""), 1500);
        return;
      }
    }
    setHintMsg("No empty cells left for this clue!");
    setTimeout(() => setHintMsg(""), 1500);
  }

  if (!mounted || !difficulty) {
    return (
      <DifficultySelect
        title="Crossword"
        icon="📋"
        subtitle="Fill the grid using the clues!"
        descriptions={{
          Easy:   CONFIG.Easy.desc,
          Medium: CONFIG.Medium.desc,
          Hard:   CONFIG.Hard.desc,
        }}
        onSelect={startGame}
      />
    );
  }

  function setCell(r: number, c: number, val: string) {
    if (paused) return;
    setInputs(prev => { const next = prev.map(row => [...row]); next[r][c] = val.toUpperCase().slice(-1); return next; });
  }

  function check() {
    if (!solution.length) return;
    let correct = 0, total = 0;
    solution.forEach((row, r) => row.forEach((cell, c) => { if (cell !== null) { total++; if (inputs[r][c] === cell) correct++; } }));
    const penalty = hintsUsed * 5;
    const s = Math.max(0, Math.round((correct / total) * 100) - penalty);
    setScore(s);
    setChecked(true);
    submitScore("Crossword", s, difficulty ?? undefined);
  }

  function cellColor(r: number, c: number) {
    if (!checked || !solution[r] || solution[r][c] === null) return "";
    return inputs[r][c] === solution[r][c] ? "bg-green-500/30 border-green-400" : "bg-red-500/20 border-red-400";
  }

  if (!puzzle) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">📋 Crossword</span>
        <div className="flex gap-2">
          <HowToPlay title="Crossword" icon="📋" steps={["📋 Read the clues on the right side.","🖊️ Click a cell in the grid and type the letter.","➡️ Fill Across clues left to right, Down clues top to bottom.","✅ Press Check Answers to see your score.","🏆 Score is shown as a percentage of correct letters."]} />
          <PauseButton onPause={setPaused} disabled={checked} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Crossword</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Fill the grid using the clues!</p>
      <span className={`text-xs font-bold px-3 py-1 rounded-full border mb-6 ${DIFF_STYLES[difficulty].badge}`}>{difficulty}</span>
      <div className="flex gap-4 flex-col sm:flex-row flex-wrap justify-center w-full">
        <div className="overflow-x-auto w-full sm:w-auto">
          {solution.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                cell === null ? (
                  <div key={c} className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-gray-900 border border-gray-800" />
                ) : (
                  <input key={c}
                    ref={el => { if (!refs.current[r]) refs.current[r] = []; refs.current[r][c] = el; }}
                    value={inputs[r]?.[c] ?? ""}
                    onChange={e => setCell(r, c, e.target.value)}
                    maxLength={1}
                    className={`w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-center text-white font-extrabold text-xs sm:text-lg border-2 border-white/20 bg-white/5 focus:outline-none focus:border-orange-500 uppercase transition ${cellColor(r, c)}`} />
                )
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 max-w-xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Clues</p>
            <span className="text-xs text-amber-400 font-semibold">💡 Hints used: {hintsUsed}</span>
          </div>
          {hintMsg && <p className="text-xs text-amber-400 font-bold mb-1">{hintMsg}</p>}
          {puzzle.words.map((w, i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-white/4 rounded-xl px-3 py-2">
              <p className="text-sm text-gray-300 flex-1">{w.clue}</p>
              {!checked && (
                <button
                  onClick={() => useHint(i)}
                  title="Reveal one letter"
                  className="shrink-0 text-xs bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-lg transition font-bold"
                >
                  💡
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-gray-600 mt-1">Each hint reveals 1 letter (-5pts penalty)</p>
        </div>
      </div>
      {checked && (
        <div className="mt-4 glass-card rounded-xl px-6 py-3 text-center">
          <p className="text-orange-400 font-bold text-lg">Score: {score}%</p>
          {hintsUsed > 0 && <p className="text-xs text-amber-400 mt-1">💡 {hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used (-{hintsUsed * 5}pts penalty)</p>}
        </div>
      )}
      <div className="flex gap-3 mt-6">
        {!checked ? (
          <button onClick={check} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl transition">Check Answers</button>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition">🎯 Change Difficulty</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CrosswordPage() {
  return <GameErrorBoundary gameName="Crossword"><CrosswordGame /></GameErrorBoundary>;
}
