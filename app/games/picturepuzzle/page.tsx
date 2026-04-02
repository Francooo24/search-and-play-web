"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const PUZZLES = [
  { label: "🐶 Dog",     tiles: ["🐶","🦴","🐾","🏠","❤️","⭐","🎾","🌟","🐕"] },
  { label: "🌈 Rainbow", tiles: ["🔴","🟠","🟡","🟢","🔵","🟣","⭐","☁️","🌈"] },
  { label: "🌊 Ocean",   tiles: ["🐠","🐙","🦀","🐚","🌊","🐋","⭐","🦈","🐬"] },
  { label: "🌸 Garden",  tiles: ["🌸","🌺","🌻","🦋","🐝","🌿","🍀","🌱","🌼"] },
];

const CONFIG: Record<Difficulty, { shuffleMoves: number; maxPts: number; desc: string }> = {
  Easy:   { shuffleMoves: 20,  maxPts: 50, desc: "Lightly shuffled, easier to solve" },
  Medium: { shuffleMoves: 60,  maxPts: 80, desc: "Moderately shuffled, normal challenge" },
  Hard:   { shuffleMoves: 150, maxPts: 120, desc: "Heavily shuffled, maximum challenge!" },
};

function getValidMoves(blank: number): number[] {
  const row = Math.floor(blank / 3), col = blank % 3;
  const moves: number[] = [];
  if (row > 0) moves.push(blank - 3);
  if (row < 2) moves.push(blank + 3);
  if (col > 0) moves.push(blank - 1);
  if (col < 2) moves.push(blank + 1);
  return moves;
}

function shuffleTiles(tiles: string[], moves: number): string[] {
  const arr = [...tiles];
  let blank = arr.indexOf("⬜");
  for (let i = 0; i < moves; i++) {
    const valid = getValidMoves(blank);
    const next = valid[Math.floor(Math.random() * valid.length)];
    [arr[blank], arr[next]] = [arr[next], arr[blank]];
    blank = next;
  }
  return arr;
}

function isSolved(tiles: string[], goal: string[]) {
  return tiles.every((t, i) => t === goal[i]);
}

function PicturePuzzleGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tiles, setTiles] = useState<string[]>([]);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const goal = [...PUZZLES[0].tiles.slice(0, 8), "⬜"];
    setTiles(shuffleTiles(goal, CONFIG[d].shuffleMoves));
    setPuzzleIdx(0); setScore(0); setMoves(0); setDone(false); setGameOver(false);
  }

  const puzzle = PUZZLES[puzzleIdx];
  const goal = puzzle ? [...puzzle.tiles.slice(0, 8), "⬜"] : [];
  const blank = tiles.indexOf("⬜");

  const move = useCallback((i: number) => {
    if (!difficulty || paused) return;
    if (!getValidMoves(blank).includes(i)) return;
    const next = [...tiles];
    [next[blank], next[i]] = [next[i], next[blank]];
    const newMoves = moves + 1;
    setMoves(newMoves);
    setTiles(next);
    if (isSolved(next, goal)) {
      const pts = Math.max(10, CONFIG[difficulty].maxPts - newMoves);
      setScore(s => s + pts);
      setDone(true);
    }
  }, [tiles, blank, goal, moves, difficulty]);

  function nextPuzzle() {
    if (!difficulty) return;
    if (puzzleIdx + 1 >= PUZZLES.length) { setGameOver(true); submitScore("Picture Puzzle", score); return; }
    const next = puzzleIdx + 1;
    setPuzzleIdx(next);
    const newGoal = [...PUZZLES[next].tiles.slice(0, 8), "⬜"];
    setTiles(shuffleTiles(newGoal, CONFIG[difficulty].shuffleMoves));
    setMoves(0); setDone(false);
  }



  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🧩 Picture Puzzle</span>
        <div className="flex gap-2">
          <HowToPlay title="Picture Puzzle" icon="🧩" steps={["🧩 Tiles are shuffled — one tile is blank.","👆 Click a tile next to the blank space to slide it.","🎯 Arrange all tiles to complete the picture.","🏆 Fewer moves = higher score!","➡️ Complete all puzzles to win."]} />
          <PauseButton onPause={setPaused} disabled={gameOver} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Picture Puzzle</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Slide the tiles to complete the picture!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-4 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">Moves: {moves}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{puzzleIdx + 1} / {PUZZLES.length}</span>
      </div>
      <p className="text-white font-semibold mb-4">{puzzle.label}</p>
      {!gameOver ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {tiles.map((tile, i) => (
              <button key={i} onClick={() => move(i)}
                className={`w-20 h-20 rounded-xl text-4xl flex items-center justify-center border-2 transition font-bold
                  ${tile === "⬜" ? "bg-white/5 border-white/5 cursor-default" : "bg-white/10 border-white/20 hover:bg-orange-500/20 hover:border-orange-400 cursor-pointer"}`}>
                {tile === "⬜" ? "" : tile}
              </button>
            ))}
          </div>
          {done && (
            <div className="text-center glass-card rounded-2xl p-6 max-w-sm w-full">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-xl font-bold text-white mb-1">Puzzle Solved!</p>
              <p className="text-orange-400 mb-1">+{Math.max(10, CONFIG[difficulty].maxPts - moves)} pts in {moves} moves</p>
              <button onClick={nextPuzzle} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl transition w-full">
                {puzzleIdx + 1 < PUZZLES.length ? "Next Puzzle →" : "Finish!"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">🏆</p>
          <p className="text-2xl font-bold text-white mb-2">All Puzzles Done!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Total Score: {score}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PicturePuzzlePage() {
  return <GameErrorBoundary gameName="Picture Puzzle"><PicturePuzzleGame /></GameErrorBoundary>;
}
