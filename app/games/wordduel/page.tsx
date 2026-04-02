"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const WORDS_4 = ["BOLD","CALM","DARK","EPIC","FAST","GLOW","HAZE","IRON","JADE","KEEN","LUSH","MILD","NEON","OVAL","PURE","RICH","SLIM","TAME","VAST","WARM","ZEAL","ARCH","BREW","CLUE","DUSK"];
const WORDS_6 = ["SHADOW","BRIDGE","CASTLE","PLANET","FROZEN","MIRROR","ROCKET","CANDLE","FLOWER","GUITAR","WINTER","BUTTER","CAMERA","DRAGON","FOREST","GARDEN","HAMMER","ISLAND","JACKET","KITTEN","LADDER","MAGNET","NAPKIN","OYSTER","PARROT"];
const WORDS_8 = ["ABSOLUTE","BACKBONE","CALENDAR","DARKNESS","ELEPHANT","FOOTBALL","GRATEFUL","HANDBOOK","INNOCENT","JEALOUSY","KEYBOARD","LANGUAGE","MOUNTAIN","NOTEBOOK","OBSTACLE","PARADISE","QUESTION","RAINFALL","SANDWICH","TOGETHER"];

const CONFIG: Record<Difficulty, { words: string[]; maxGuesses: number; desc: string }> = {
  Easy:   { words: WORDS_4, maxGuesses: 8, desc: "4-letter words, 8 guesses allowed" },
  Medium: { words: WORDS_6, maxGuesses: 8, desc: "6-letter words, 8 guesses allowed" },
  Hard:   { words: WORDS_8, maxGuesses: 6, desc: "8-letter words, only 6 guesses!" },
};

type State = "correct" | "present" | "absent" | "";

function evaluate(guess: string, target: string): State[] {
  const len = target.length;
  const res: State[] = Array(len).fill("absent");
  const used = Array(len).fill(false);
  for (let i = 0; i < len; i++) if (guess[i] === target[i]) { res[i] = "correct"; used[i] = true; }
  for (let i = 0; i < len; i++) {
    if (res[i] === "correct") continue;
    for (let j = 0; j < len; j++) if (!used[j] && guess[i] === target[j]) { res[i] = "present"; used[j] = true; break; }
  }
  return res;
}

const KB_ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];

function WordDuelGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [target, setTarget]         = useState("");
  const [guesses, setGuesses]       = useState<{ word: string; states: State[] }[]>([]);
  const [current, setCurrent]       = useState("");
  const [gameOver, setGameOver]     = useState(false);
  const [won, setWon]               = useState(false);
  const [score, setScore]           = useState(0);
  const [toast, setToast]           = useState("");
  const [paused, setPaused]         = useState(false);
  const [hintsUsed, setHintsUsed]   = useState(0);
  const [hintMsg, setHintMsg]       = useState("");
  const [mounted, setMounted]       = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const wordLen    = target.length;
  const maxGuesses = difficulty ? CONFIG[difficulty].maxGuesses : 8;

  const pressKey = useCallback((k: string) => {
    if (gameOver || !difficulty || paused) return;
    if (k === "BACKSPACE") { setCurrent(c => c.slice(0, -1)); return; }
    if (k === "ENTER") {
      if (current.length < wordLen) { setToast("Not enough letters"); setTimeout(() => setToast(""), 1200); return; }
      const states = evaluate(current, target);
      const newGuesses = [...guesses, { word: current, states }];
      setGuesses(newGuesses); setCurrent("");
      if (current === target) {
        const pts = Math.max(0, (maxGuesses - newGuesses.length + 1) * 10 - hintsUsed * 5);
        setScore(pts); setWon(true); setGameOver(true);
        submitScore("Word Duel", pts, difficulty ?? undefined);
      } else if (newGuesses.length >= maxGuesses) { setGameOver(true); submitScore("Word Duel", 0, difficulty ?? undefined); }
      return;
    }
    if (/^[A-Z]$/.test(k) && current.length < wordLen) setCurrent(c => c + k);
  }, [gameOver, current, guesses, target, wordLen, maxGuesses, difficulty, paused, hintsUsed]);

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

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setTarget(CONFIG[d].words[Math.floor(Math.random() * CONFIG[d].words.length)]);
    setGuesses([]); setCurrent(""); setGameOver(false); setWon(false); setScore(0); setHintsUsed(0); setHintMsg("");
  }

  function handleHint() {
    if (gameOver || paused || !target) return;
    const correctPositions = new Set(
      guesses.flatMap(g => g.states.map((s, i) => s === "correct" ? i : -1).filter(i => i >= 0))
    );
    const remaining = Array.from({ length: wordLen }, (_, i) => i).filter(i => !correctPositions.has(i));
    if (remaining.length === 0) { setHintMsg("All letters already found!"); setTimeout(() => setHintMsg(""), 1500); return; }
    const pos = remaining[Math.floor(Math.random() * remaining.length)];
    const letter = target[pos];
    setCurrent(prev => {
      const arr = (prev + " ".repeat(wordLen)).slice(0, wordLen).split("");
      arr[pos] = letter;
      return arr.join("").trimEnd();
    });
    setHintsUsed(h => h + 1);
    setHintMsg(`💡 Position ${pos + 1} = ${letter} (-5pts penalty)`);
    setTimeout(() => setHintMsg(""), 2000);
  }

  if (!mounted || !difficulty) {
    return (
      <DifficultySelect
        title="Word Duel"
        icon="⚔️"
        subtitle="Guess the secret word letter by letter!"
        descriptions={{
          Easy:   CONFIG.Easy.desc,
          Medium: CONFIG.Medium.desc,
          Hard:   CONFIG.Hard.desc,
        }}
        onSelect={startGame}
      />
    );
  }

  const keyStates: Record<string, State> = {};
  guesses.forEach(g => g.word.split("").forEach((l, i) => {
    const s = g.states[i];
    const p: Record<string, number> = { correct:3, present:2, absent:1 };
    if ((p[s]||0) > (p[keyStates[l]]||0)) keyStates[l] = s;
  }));

  const tileColor = (s: State) => {
    if (s === "correct") return "bg-green-600 border-green-500";
    if (s === "present") return "bg-yellow-600 border-yellow-500";
    if (s === "absent")  return "bg-gray-700 border-gray-600";
    return "bg-white/5 border-white/20";
  };
  const keyColor = (k: string) => {
    const s = keyStates[k];
    if (s === "correct") return "bg-green-600";
    if (s === "present") return "bg-yellow-600";
    if (s === "absent")  return "bg-gray-700";
    return "bg-gray-500";
  };

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-2.5 rounded-lg font-bold text-sm z-50">{toast}</div>}
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">⚔️ Word Duel</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Duel" icon="⚔️" steps={[
            "🔤 Guess the secret word — length depends on difficulty.",
            "⌨️ Type a word using the keyboard and press Enter to submit.",
            "🟩 Green = correct letter in the right spot.",
            "🟨 Yellow = correct letter but wrong position.",
            "⬛ Gray = letter is not in the word at all.",
            "💡 Use the Hint button to reveal one letter position (-5pts each).",
            "🏆 Fewer guesses used = more points!",
          ]} />
          <PauseButton onPause={setPaused} disabled={gameOver} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Duel</h1>
      <p className="text-gray-400 text-sm mb-2 text-center">Guess the {wordLen}-letter word in {maxGuesses} tries!</p>
      <span className={`text-xs font-bold px-3 py-1 rounded-full border mb-4 ${DIFF_STYLES[difficulty].badge}`}>{difficulty}</span>
      <div className="flex items-center justify-between w-full max-w-xs mb-2">
        <div className="flex gap-3 text-xs text-gray-400">
          <span><span className="inline-block w-4 h-4 rounded bg-green-600 mr-1 align-middle" />Correct</span>
          <span><span className="inline-block w-4 h-4 rounded bg-yellow-600 mr-1 align-middle" />Wrong spot</span>
          <span><span className="inline-block w-4 h-4 rounded bg-gray-700 mr-1 align-middle" />Not in word</span>
        </div>
        <div className="flex items-center gap-2">
          {hintsUsed > 0 && <span className="text-xs text-amber-400 font-semibold">💡 {hintsUsed}</span>}
          <button onClick={handleHint} disabled={gameOver} className="text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-40">💡 Hint</button>
        </div>
      </div>
      {hintMsg && <p className="text-xs text-amber-400 font-bold mb-2 text-center">{hintMsg}</p>}
      <div className="grid gap-1.5 mb-4">
        {Array.from({ length: maxGuesses }, (_, r) => {
          const g = guesses[r];
          const isCurrentRow = r === guesses.length && !gameOver;
          return (
            <div key={r} className="flex gap-1.5">
              {Array.from({ length: wordLen }, (_, c) => {
                const letter = g ? g.word[c] : isCurrentRow ? current[c] ?? "" : "";
                const state  = g ? g.states[c] : "";
                return <div key={c} className={`w-10 h-10 border-2 rounded-md flex items-center justify-center text-lg font-extrabold text-white uppercase transition-all ${tileColor(state)}`}>{letter}</div>;
              })}
            </div>
          );
        })}
      </div>
      <div className="space-y-1.5 mb-4">
        {KB_ROWS.map(row => (
          <div key={row} className="flex gap-1.5 justify-center">
            {row === "ZXCVBNM" && <button onClick={() => pressKey("BACKSPACE")} className="h-12 min-w-[56px] px-2 rounded-md text-xs font-bold bg-gray-500 text-white hover:opacity-90">⌫</button>}
            {row.split("").map(k => <button key={k} onClick={() => pressKey(k)} className={`h-12 min-w-[34px] px-1 rounded-md text-sm font-bold text-white transition hover:opacity-90 ${keyColor(k)}`}>{k}</button>)}
            {row === "ZXCVBNM" && <button onClick={() => pressKey("ENTER")} className="h-12 min-w-[56px] px-2 rounded-md text-xs font-bold bg-gray-500 text-white hover:opacity-90">ENTER</button>}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 text-center max-w-xs w-full">
            <p className="text-6xl mb-3">{won ? "🎉" : "😔"}</p>
            <p className="text-2xl font-bold text-white mb-1">{won ? "You Win!" : "Game Over!"}</p>
            <p className="text-gray-400 text-sm mb-1">The word was: <span className="text-amber-400 font-bold">{target}</span></p>
            {won && <p className="text-orange-400 font-bold mb-2">+{score} pts!{hintsUsed > 0 ? ` (${hintsUsed} hint${hintsUsed > 1 ? "s" : ""} used)` : ""}</p>}
            <p className={`text-xs mb-5 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl transition text-sm">🔄 Again</button>
              <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2 rounded-xl transition text-sm">🎯 Difficulty</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WordDuelPage() {
  return <GameErrorBoundary gameName="Word Duel"><WordDuelGame /></GameErrorBoundary>;
}
