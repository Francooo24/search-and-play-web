"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const CONFIG: Record<Difficulty, { digits: string[]; codeLen: number; maxTries: number; desc: string }> = {
  Easy:   { digits:["1","2","3","4","5","6"], codeLen:3, maxTries:8, desc:"Crack a 3-digit code in 8 tries" },
  Medium: { digits:["1","2","3","4","5","6"], codeLen:4, maxTries:8, desc:"Crack a 4-digit code in 8 tries" },
  Hard:   { digits:["1","2","3","4","5","6","7","8"], codeLen:5, maxTries:7, desc:"Crack a 5-digit code in 7 tries!" },
};

function generateCode(digits: string[], len: number): string[] {
  const pool = [...digits];
  const code: string[] = [];
  while (code.length < len) { const i = Math.floor(Math.random() * pool.length); code.push(pool.splice(i, 1)[0]); }
  return code;
}

function getHints(guess: string[], code: string[]): { exact: number; misplaced: number } {
  let exact = 0, misplaced = 0;
  const codeLeft: string[] = [], guessLeft: string[] = [];
  guess.forEach((g, i) => { if (g === code[i]) exact++; else { codeLeft.push(code[i]); guessLeft.push(g); } });
  guessLeft.forEach(g => { const idx = codeLeft.indexOf(g); if (idx !== -1) { misplaced++; codeLeft.splice(idx, 1); } });
  return { exact, misplaced };
}

type Row = { guess: string[]; exact: number; misplaced: number };

function DeductionGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [code, setCode] = useState<string[]>([]);
  const [current, setCurrent] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setCode(generateCode(CONFIG[d].digits, CONFIG[d].codeLen));
    setCurrent([]); setRows([]); setWon(false); setLost(false);
  }

  const codeLen = difficulty ? CONFIG[difficulty].codeLen : 4;
  const maxTries = difficulty ? CONFIG[difficulty].maxTries : 8;
  const digits = difficulty ? CONFIG[difficulty].digits : ["1","2","3","4","5","6"];

  const addDigit = useCallback((d: string) => {
    if (current.length >= codeLen || won || lost || paused) return;
    setCurrent(c => [...c, d]);
  }, [current, won, lost, codeLen]);

  const removeDigit = () => setCurrent(c => c.slice(0, -1));

  const submit = useCallback(() => {
    if (current.length !== codeLen) return;
    const hints = getHints(current, code);
    const newRows = [...rows, { guess: current, ...hints }];
    setRows(newRows); setCurrent([]);
    if (hints.exact === codeLen) { setWon(true); submitScore("Deduction", Math.max(10, (maxTries - newRows.length + 1) * 15), difficulty ?? undefined); return; }
    if (newRows.length >= maxTries) setLost(true);
  }, [current, code, rows, codeLen, maxTries]);

  const score = won ? Math.max(10, (maxTries - rows.length + 1) * 15) : 0;

  if (!difficulty) return <DifficultySelect title="Deduction" icon="🧩" subtitle="Crack the secret code!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🧩 Deduction</span>
        <div className="flex gap-2">
          <HowToPlay title="Deduction" icon="🧩" steps={["🧩 A secret code of unique digits is hidden.","🔢 Enter a guess using the digit buttons.","🟢 Green dot = correct digit in correct position.","🟡 Yellow dot = correct digit but wrong position.","⚪ Gray dot = digit not in the code.","🏆 Crack the code within the allowed tries to win!"]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={won || lost} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Deduction</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Crack the {codeLen}-digit secret code!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-4 flex gap-4 items-center">
        <span className="text-gray-400 text-sm">Tries: {rows.length} / {maxTries}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">Digits: {digits[0]}–{digits[digits.length-1]}, no repeats</span>
      </div>
      <div className="flex flex-col gap-2 mb-4 w-full max-w-xs">
        {rows.map((row, ri) => (
          <div key={ri} className="flex items-center gap-3">
            <div className="flex gap-2">
              {row.guess.map((d, i) => <div key={i} className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold">{d}</div>)}
            </div>
            <div className="flex gap-1 ml-2">
              {Array.from({length:row.exact}).map((_,i) => <div key={`e${i}`} className="w-4 h-4 rounded-full bg-green-500" />)}
              {Array.from({length:row.misplaced}).map((_,i) => <div key={`m${i}`} className="w-4 h-4 rounded-full bg-yellow-400" />)}
              {Array.from({length:codeLen-row.exact-row.misplaced}).map((_,i) => <div key={`n${i}`} className="w-4 h-4 rounded-full bg-white/20" />)}
            </div>
          </div>
        ))}
        {!won && !lost && (
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {Array.from({length:codeLen}).map((_,i) => (
                <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold transition
                  ${i < current.length ? "bg-orange-500/20 border-orange-400 text-white" : "bg-white/5 border-white/20 text-gray-600"}`}>
                  {current[i] ?? "·"}
                </div>
              ))}
            </div>
          </div>
        )}
        {!won && !lost && Array.from({length:maxTries-rows.length-1}).map((_,ri) => (
          <div key={`empty${ri}`} className="flex gap-2">
            {Array.from({length:codeLen}).map((_,i) => <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" />)}
          </div>
        ))}
      </div>
      {!won && !lost && (
        <div className="w-full max-w-xs">
          <div className={`grid gap-2 mb-3`} style={{gridTemplateColumns:`repeat(${digits.length},1fr)`}}>
            {digits.map(d => (
              <button key={d} onClick={() => addDigit(d)} disabled={current.includes(d)}
                className="h-12 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-lg hover:bg-orange-500/20 hover:border-orange-400 transition disabled:opacity-30 disabled:cursor-not-allowed">{d}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={removeDigit} className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 text-gray-300 font-semibold hover:bg-white/20 transition">⌫ Delete</button>
            <button onClick={submit} disabled={current.length !== codeLen} className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold transition">Submit →</button>
          </div>
        </div>
      )}
      {(won || lost) && (
        <div className="text-center mt-4">
          <p className="text-6xl mb-3">{won ? "🏆" : "😔"}</p>
          <p className="text-2xl font-bold text-white mb-1">{won ? "Code Cracked!" : "Game Over!"}</p>
          <p className="text-gray-400 mb-1">Secret code: <span className="text-orange-400 font-bold tracking-widest">{code.join(" ")}</span></p>
          {won && <p className="text-orange-400 font-bold text-lg mb-2">Score: {score} pts ({rows.length} tries)</p>}
          <p className={`text-xs mb-4 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl transition">Change Difficulty</button>
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeductionPage() {
  return <GameErrorBoundary gameName="Deduction"><DeductionGame /></GameErrorBoundary>;
}
