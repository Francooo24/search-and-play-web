"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import { submitScoreCompat as submitScore } from "@/lib/submitScore";
import { useSound } from "@/lib/useSound";
import AchievementToast from "@/components/AchievementToast";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function minimax(b: string[], player: string, depth: number): { score: number; idx?: number } {
  const opp = player === "O" ? "X" : "O";
  const wO = WINS.find(([a,c,d]) => b[a]==="O" && b[c]==="O" && b[d]==="O");
  const wX = WINS.find(([a,c,d]) => b[a]==="X" && b[c]==="X" && b[d]==="X");
  if (wO) return { score: 10 - depth };
  if (wX) return { score: -10 + depth };
  const empty = b.map((v,i) => v==="" ? i : -1).filter(i => i >= 0);
  if (!empty.length) return { score: 0 };
  const moves = empty.map(i => { const nb = [...b]; nb[i] = player; return { idx: i, score: minimax(nb, opp, depth+1).score }; });
  return moves.reduce((best, m) => player === "O" ? (m.score > best.score ? m : best) : (m.score < best.score ? m : best));
}

function getAIMove(board: string[], difficulty: Difficulty): number {
  const empty = board.map((v,i) => v==="" ? i : -1).filter(i => i >= 0);
  if (difficulty === "Easy") return empty[Math.floor(Math.random() * empty.length)];
  if (difficulty === "Medium") {
    // 50% chance random, 50% smart
    if (Math.random() < 0.5) return empty[Math.floor(Math.random() * empty.length)];
  }
  return minimax(board, "O", 0).idx ?? empty[0];
}

function TicTacToeGame() {
  const [difficulty] = useState<Difficulty>("Hard");
  const [board, setBoard] = useState(Array(9).fill(""));
  const [mode, setMode] = useState<"ai"|"2p">("ai");
  const [turn, setTurn] = useState("X");
  const [gameOver, setGameOver] = useState(false);
  const [winCombo, setWinCombo] = useState<number[]|null>(null);
  const [scoresAI, setScoresAI] = useState({ X: 0, O: 0, D: 0 });
  const [scores2P, setScores2P] = useState({ X: 0, O: 0, D: 0 });
  const [result, setResult] = useState<{emoji:string;title:string;sub:string}|null>(null);
  const [showInstr, setShowInstr] = useState(false);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const { playCorrect, playWrong } = useSound();
  const [paused, setPaused] = useState(false);

  const checkWin = (b: string[], p: string) => WINS.find(([a,c,d]) => b[a]===p && b[c]===p && b[d]===p) ?? null;

  const endGame = useCallback((b: string[], winner: string|null) => {
    setGameOver(true);
    const draw = winner === null;
    const key = draw ? "D" : winner!;
    if (mode === "ai") setScoresAI(s => ({ ...s, [key]: s[key as keyof typeof s] + 1 }));
    else setScores2P(s => ({ ...s, [key]: s[key as keyof typeof s] + 1 }));
    if (winner === "X" && mode === "2p") submitScore("Tic Tac Toe", 10).then(setNewBadges);
    if (winner === "X" && mode === "ai")  submitScore("Tic Tac Toe", 10).then(setNewBadges);
    const isWin = winner === "X";
    if (winner) { if (isWin) playCorrect(); else playWrong(); }
    setTimeout(() => setResult(draw
      ? { emoji:"🤝", title:"It's a Draw!", sub:"So close! Try again!" }
      : winner === "X"
        ? { emoji:"🎉", title: mode==="ai" ? "You Win! 🏆" : "Player 1 Wins! 🏆", sub: mode==="ai" ? "+10 pts!" : "Congratulations!" }
        : { emoji:"😢", title: mode==="ai" ? "Computer Wins!" : "Player 2 Wins! 🏆", sub: mode==="ai" ? "Better luck next time!" : "Congratulations!" }
    ), 600);
  }, [mode]);

  const makeMove = useCallback((i: number, b: string[], currentTurn: string) => {
    const nb = [...b]; nb[i] = currentTurn;
    setBoard(nb);
    const win = checkWin(nb, currentTurn);
    if (win) { setWinCombo(win); endGame(nb, currentTurn); return nb; }
    if (nb.every(c => c)) { endGame(nb, null); return nb; }
    setTurn(currentTurn === "X" ? "O" : "X");
    return nb;
  }, [endGame]);

  useEffect(() => {
    if (!difficulty || mode !== "ai" || turn !== "O" || gameOver) return;
    const t = setTimeout(() => {
      const idx = getAIMove(board, difficulty);
      if (idx !== undefined) makeMove(idx, board, "O");
    }, 450);
    return () => clearTimeout(t);
  }, [turn, mode, gameOver, board, makeMove, difficulty]);

  const handleClick = (i: number) => {
    if (!difficulty || gameOver || board[i] || paused) return;
    if (mode === "ai" && turn === "O") return;
    makeMove(i, board, turn);
  };

  const resetGame = () => { setBoard(Array(9).fill("")); setTurn("X"); setGameOver(false); setWinCombo(null); setResult(null); };

  const cellStyle = (i: number) => {
    const v = board[i], isWin = winCombo?.includes(i);
    if (isWin) return "bg-yellow-500/20 border-yellow-400 scale-105";
    if (v === "X") return "bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.4)]";
    if (v === "O") return "bg-red-600 border-red-400 shadow-[0_0_20px_rgba(252,165,165,0.4)]";
    return "bg-white/5 border-white/12 hover:bg-white/10 hover:border-white/30 cursor-pointer";
  };


  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">⭕ Tic Tac Toe</span>
        <div className="flex gap-2">
          <button onClick={() => setShowInstr(true)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">❓ How to Play</button>
          <PauseButton onPause={setPaused} disabled={gameOver} />
        </div>
      </nav>

      {showInstr && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-white">⭕ How to Play</h2><button onClick={() => setShowInstr(false)} className="text-gray-500 hover:text-white text-xl">✕</button></div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>⭕ You are Player 1 (⭕). Computer or Player 2 is ❌.</li>
              <li>🔲 Click any empty cell to place your mark.</li>
              <li>🏆 Get 3 in a row to win!</li>
              <li>🤖 {difficulty} mode: {DIFF_STYLES[difficulty].color && difficulty === "Hard" ? "Unbeatable AI!" : difficulty === "Medium" ? "Semi-smart AI" : "Random AI — easy!"}</li>
            </ul>
            <button onClick={() => setShowInstr(false)} className="mt-5 w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2.5 rounded-xl font-semibold">Got it!</button>
          </div>
        </div>
      )}

      <h1 className="text-5xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Tic Tac Toe</h1>
      <p className="text-gray-400 text-sm mb-3 text-center">Get 3 in a row to win!</p>

      <div className="flex gap-3 mb-5">
        {(["ai","2p"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); resetGame(); }}
            className={`px-5 py-2 rounded-full border text-sm font-semibold transition ${mode===m ? "bg-gradient-to-r from-orange-500 to-amber-600 border-orange-400 text-white" : "bg-white/5 border-white/20"}`}>
            {m==="ai" ? "🤖 vs Computer" : "👫 2 Players"}
          </button>
        ))}
      </div>

      {/* AI Score — only shown in AI mode */}
      {mode === "ai" && (
        <div className="flex gap-4 mb-5">
          {([["⭕ You", scoresAI.X, "text-blue-400", "bg-blue-500/10 border-blue-500/30"], ["🤝 Draw", scoresAI.D, "text-gray-300", "bg-white/5 border-white/10"], ["🤖 CPU", scoresAI.O, "text-red-400", "bg-red-500/10 border-red-500/30"]] as [string,number,string,string][]).map(([l,v,c,bg]) => (
            <div key={l} className={`${bg} border rounded-2xl px-5 py-2 text-center min-w-[80px]`}>
              <p className="text-xs text-gray-400 mb-0.5">{l}</p>
              <p className={`text-2xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* 2P Score — only shown in 2P mode */}
      {mode === "2p" && (
        <div className="flex gap-4 mb-5">
          {([["👤 Player 1", scores2P.X, "text-blue-400", "bg-blue-500/10 border-blue-500/30"], ["🤝 Draw", scores2P.D, "text-gray-300", "bg-white/5 border-white/10"], ["👤 Player 2", scores2P.O, "text-red-400", "bg-red-500/10 border-red-500/30"]] as [string,number,string,string][]).map(([l,v,c,bg]) => (
            <div key={l} className={`${bg} border rounded-2xl px-5 py-2 text-center min-w-[80px]`}>
              <p className="text-xs text-gray-400 mb-0.5">{l}</p>
              <p className={`text-2xl font-bold ${c}`}>{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="text-lg font-semibold text-white mb-4 h-7 text-center">
        {!gameOver && (mode==="ai" ? (turn==="X" ? "⭕ Your turn!" : "🤖 Computer thinking...") : (turn==="X" ? "⭕ Player 1's turn" : "❌ Player 2's turn"))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {board.map((v, i) => (
          <div key={i} onClick={() => handleClick(i)}
            className={`w-[28vw] h-[28vw] max-w-[110px] max-h-[110px] border-2 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl select-none transition-all duration-200 ${cellStyle(i)}`}>
            {v === "X" ? "⭕" : v === "O" ? "❌" : ""}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={resetGame} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm">🔄 New Game</button>
        <button onClick={() => { if (mode === "ai") setScoresAI({X:0,O:0,D:0}); else setScores2P({X:0,O:0,D:0}); resetGame(); }} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm">🗑 Reset Scores</button>

      </div>

      {result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 text-center max-w-xs w-full">
            <p className="text-6xl mb-3">{result.emoji}</p>
            <p className="text-2xl font-bold text-white mb-1">{result.title}</p>
            <p className="text-gray-400 text-sm mb-5">{result.sub}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setResult(null); resetGame(); }} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl transition text-sm">Play Again</button>
              <Link href="/games" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2 rounded-xl transition text-sm">Back</Link>
            </div>
          </div>
        </div>
      )}
      <AchievementToast badges={newBadges} onDone={() => setNewBadges([])} />
    </div>
  );
}

export default function TicTacToePage() {
  return <GameErrorBoundary gameName="Tic Tac Toe"><TicTacToeGame /></GameErrorBoundary>;
}
