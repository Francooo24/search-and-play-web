"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const QUOTES = {
  Easy: [
    { text:"BE KIND", author:"Unknown" },
    { text:"WORK HARD", author:"Unknown" },
    { text:"STAY CALM", author:"Unknown" },
  ],
  Medium: [
    { text:"BE THE CHANGE YOU WISH TO SEE IN THE WORLD", author:"Gandhi" },
    { text:"IN THE MIDDLE OF DIFFICULTY LIES OPPORTUNITY", author:"Einstein" },
    { text:"THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO", author:"Steve Jobs" },
  ],
  Hard: [
    { text:"LIFE IS WHAT HAPPENS WHEN YOU ARE BUSY MAKING OTHER PLANS", author:"John Lennon" },
    { text:"THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THEIR DREAMS", author:"Eleanor Roosevelt" },
    { text:"IN THREE WORDS I CAN SUM UP EVERYTHING I HAVE LEARNED ABOUT LIFE IT GOES ON", author:"Robert Frost" },
  ],
};

const CONFIG: Record<Difficulty, { giveLetters: number; desc: string }> = {
  Easy:   { giveLetters: 3, desc: "Short quotes, 3 letters revealed as hints" },
  Medium: { giveLetters: 1, desc: "Medium quotes, 1 letter revealed as hint" },
  Hard:   { giveLetters: 0, desc: "Long quotes, no hints — pure deduction!" },
};

function buildCipher(): Record<string, string> {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const shuffled = [...alpha].sort(() => Math.random() - 0.5);
  const cipher: Record<string, string> = {};
  alpha.forEach((l, i) => { cipher[l] = shuffled[i]; });
  return cipher;
}

function CryptogramGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [quote, setQuote] = useState<typeof QUOTES.Medium[0] | null>(null);
  const [cipher, setCipher] = useState<Record<string, string>>({});
  const [encoded, setEncoded] = useState("");
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintMsg, setHintMsg] = useState("");
  const [revCipher, setRevCipher] = useState<Record<string, string>>({});

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const q = QUOTES[d][Math.floor(Math.random() * QUOTES[d].length)];
    const c = buildCipher();
    const enc = q.text.split("").map(ch => ch === " " ? " " : c[ch] || ch).join("");
    setQuote(q); setCipher(c); setEncoded(enc);
    const hints: Record<string, string> = {};
    const uniqueEncoded = [...new Set(enc.replace(/ /g, "").split(""))];
    const revC: Record<string, string> = {};
    Object.entries(c).forEach(([orig, encL]) => { revC[encL] = orig; });
    uniqueEncoded.slice(0, CONFIG[d].giveLetters).forEach(encLetter => {
      hints[encLetter] = revC[encLetter];
    });
    setRevCipher(revC);
    setGuesses(hints);
    setScore(0); setDone(false); setHintsUsed(0); setHintMsg("");
  }

  if (!difficulty) {
    return (
      <DifficultySelect
        title="Cryptogram"
        icon="🔐"
        subtitle="Decode the encrypted quote by mapping letters!"
        descriptions={{
          Easy:   CONFIG.Easy.desc,
          Medium: CONFIG.Medium.desc,
          Hard:   CONFIG.Hard.desc,
        }}
        onSelect={startGame}
      />
    );
  }

  function useHint() {
    if (paused || done) return;
    const unguessed = [...new Set(encoded.replace(/ /g, "").split(""))]
      .filter(enc => !guesses[enc]);
    if (unguessed.length === 0) { setHintMsg("All letters already revealed!"); setTimeout(() => setHintMsg(""), 1500); return; }
    const enc = unguessed[Math.floor(Math.random() * unguessed.length)];
    setGuesses(g => ({ ...g, [enc]: revCipher[enc] }));
    setHintsUsed(h => h + 1);
    setHintMsg(`💡 Revealed: ${enc} = ${revCipher[enc]} (-10pts penalty)`);
    setTimeout(() => setHintMsg(""), 2000);
  }

  function setGuess(enc: string, value: string) {
    if (paused) return;
    const letter = value.toUpperCase().slice(0, 1);
    if (!letter) { setGuesses(g => ({ ...g, [enc]: "" })); return; }
    // Prevent using a letter already assigned to a different encoded letter
    const alreadyUsed = Object.entries(guesses).some(([key, val]) => key !== enc && val === letter);
    if (alreadyUsed) return;
    setGuesses(g => ({ ...g, [enc]: letter }));
  }

  function check() {
    if (!quote) return;
    const uniqueLetters = [...new Set(quote.text.replace(/ /g, "").split(""))];
    let correct = 0;
    uniqueLetters.forEach(orig => { const enc = cipher[orig]; if (guesses[enc] === orig) correct++; });
    const penalty = hintsUsed * 10;
    const s = Math.max(0, Math.round((correct / uniqueLetters.length) * 100) - penalty);
    setScore(s);
    setDone(true);
    submitScore("Cryptogram", s, difficulty ?? undefined);
  }

  const decoded = encoded.split("").map(c => c === " " ? " " : guesses[c] || "_").join("");

  if (!quote) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔐 Cryptogram</span>
        <div className="flex gap-2">
          <HowToPlay title="Cryptogram" icon="🔐" steps={[
            "🔐 Each letter in the quote has been replaced by a different letter.",
            "🔡 Look at the encoded letters and type what you think each one really is.",
            "👀 Example: if encoded shows Z and you think Z = A, type A in the box under Z.",
            "📖 Your decoded version updates live as you fill in guesses.",
            "💡 Tap the Hint button to reveal one random letter (-10pts each).",
            "✅ Press Check Answer when done — score is % of correct letters.",
          ]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Cryptogram</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Decode the encrypted quote by mapping letters!</p>
      <span className={`text-xs font-bold px-3 py-1 rounded-full border mb-6 ${DIFF_STYLES[difficulty].badge}`}>{difficulty}</span>
      {!done ? (
        <div className="w-full max-w-2xl">
          <div className="glass-card rounded-2xl p-4 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Encoded Quote</p>
            <p className="text-lg font-mono text-amber-400 tracking-widest leading-relaxed">{encoded}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Your Decoded Version</p>
            <p className="text-lg font-mono text-white tracking-widest leading-relaxed">{decoded}</p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Map each encoded letter to its real letter</p>
            <div className="flex items-center gap-2">
              {hintsUsed > 0 && <span className="text-xs text-amber-400 font-semibold">💡 {hintsUsed} used</span>}
              <button onClick={useHint} className="text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold px-3 py-1.5 rounded-lg transition">💡 Hint</button>
            </div>
          </div>
          {hintMsg && <p className="text-xs text-amber-400 font-bold mb-3 text-center">{hintMsg}</p>}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
            {[...new Set(encoded.replace(/ /g, "").split(""))].sort().map(enc => {
              const isHinted = CONFIG[difficulty].giveLetters > 0 && guesses[enc] && !Object.entries(guesses).find(([k, v]) => k === enc && v);
              const isLocked = revCipher[enc] && guesses[enc] === revCipher[enc] && Object.keys(guesses).filter(k => guesses[k] === guesses[enc]).length > 0;
              const usedElsewhere = (letter: string) => letter && Object.entries(guesses).some(([key, val]) => key !== enc && val === letter);
              return (
                <div key={enc} className="flex flex-col items-center">
                  <span className="text-amber-400 font-bold text-sm mb-1">{enc}</span>
                  <input
                    value={guesses[enc] || ""}
                    onChange={e => setGuess(enc, e.target.value)}
                    maxLength={1}
                    className={`w-10 h-10 text-center font-bold rounded-lg focus:outline-none focus:border-orange-500 uppercase transition border-2
                      ${ guesses[enc]
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                        : "bg-white/5 border-white/20 text-white"
                      }`}
                  />
                </div>
              );
            })}
          </div>
          <button onClick={check} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">Check Answer</button>
        </div>
      ) : (
        <div className="text-center w-full max-w-md">
          <p className="text-6xl mb-4">{score >= 80 ? "🎉" : score >= 50 ? "😊" : "😔"}</p>
          <p className="text-2xl font-bold text-white mb-2">Result: {score}%</p>
          {hintsUsed > 0 && <p className="text-xs text-amber-400 mb-3">💡 {hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used (-{hintsUsed * 10}pts penalty)</p>}
          <div className="glass-card rounded-2xl p-4 mb-4 text-left">
            <p className="text-xs text-gray-400 mb-1">Original Quote:</p>
            <p className="text-white font-semibold">"{quote.text}"</p>
            <p className="text-orange-400 text-sm mt-1">— {quote.author}</p>
          </div>
          <p className={`text-xs mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition">🎯 Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CryptogramPage() {
  return <GameErrorBoundary gameName="Cryptogram"><CryptogramGame /></GameErrorBoundary>;
}
