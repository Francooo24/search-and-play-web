"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore, ScoreResult } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import ScoreToast from "@/components/ScoreToast";
import { useSound } from "@/lib/useSound";

const ALL_WORDS = [
  { word:"cat",         hint:"A common household pet",                    level:"Easy" },
  { word:"dog",         hint:"Man's best friend",                         level:"Easy" },
  { word:"sun",         hint:"The star at the center of our solar system",level:"Easy" },
  { word:"bird",        hint:"An animal with wings and feathers",         level:"Easy" },
  { word:"fish",        hint:"Lives in water",                            level:"Easy" },
  { word:"beautiful",   hint:"Pleasing to the senses",                    level:"Medium" },
  { word:"necessary",   hint:"Required or essential",                     level:"Medium" },
  { word:"separate",    hint:"To divide or keep apart",                   level:"Medium" },
  { word:"definitely",  hint:"Without doubt",                             level:"Medium" },
  { word:"embarrass",   hint:"To cause discomfort or shame",              level:"Medium" },
  { word:"occurrence",  hint:"An event or incident",                      level:"Hard" },
  { word:"accommodate", hint:"To provide space or adapt",                 level:"Hard" },
  { word:"conscience",  hint:"Inner sense of right and wrong",            level:"Hard" },
  { word:"exaggerate",  hint:"To overstate something",                    level:"Hard" },
  { word:"silhouette",  hint:"A dark shape against a light background",   level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; total: number; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   total: 5, pts: 10, desc: "5 rounds, simple 3-4 letter words" },
  Medium: { filter: "Medium", total: 5, pts: 10, desc: "5 rounds, commonly misspelled words" },
  Hard:   { filter: "Hard",   total: 5, pts: 20, desc: "5 rounds, very difficult spellings!" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function SpellingBeeGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Hard");
  useEffect(() => { startGame("Hard"); }, []);
  const [questions, setQuestions] = useState<typeof ALL_WORDS>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const { playCorrect, playWrong } = useSound();

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_WORDS.filter(q => q.level === d)).slice(0, CONFIG[d].total));
    setIdx(0); setInput(""); setScore(0); setChecked(false); setCorrect(false); setDone(false);
  }

  function check() {
    if (!difficulty || paused) return;
    const isCorrect = input.trim().toLowerCase() === questions[idx].word;
    setCorrect(isCorrect); setChecked(true);
    if (isCorrect) { setScore(s => s + CONFIG[difficulty].pts); playCorrect(); } else { playWrong(); }
  }

  function next() {
    if (idx + 1 >= questions.length) {
      const finalScore = score + (correct ? CONFIG[difficulty].pts : 0);
      setDone(true);
      submitScore("Spelling Bee", finalScore).then(setScoreResult);
      return;
    }
    setIdx(i => i + 1); setInput(""); setChecked(false); setCorrect(false);
  }

  function playAudio() {
    if (!questions[idx]) return;
    const audio = new Audio(`/api/tts?text=${encodeURIComponent(questions[idx].word)}&lang=en`);
    audio.play();
  }


  const current = questions[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🐝 Spelling Bee</span>
        <div className="flex gap-2">
          <HowToPlay title="Spelling Bee" icon="🐝" steps={["🐝 A hint describes the word.","🔊 Press Listen to Word to hear it spoken aloud.","⌨️ Type the correct spelling and press Check.","✅ Correct = points! ❌ Wrong = answer revealed.","➡️ Press Next to continue to the next word."]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Spelling Bee</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Listen and spell the word correctly!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="glass-card rounded-2xl p-6 mb-4 w-full text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Hint</p>
            <p className="text-white font-semibold">{current.hint}</p>
          </div>
          <button onClick={playAudio} className="flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 font-semibold hover:bg-orange-500/30 transition">
            🔊 Listen to Word
          </button>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !checked && check()}
            disabled={checked} placeholder="Type the spelling..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-lg focus:outline-none focus:border-orange-500 mb-4" />
          {checked && (
            <div className={`rounded-xl p-3 mb-4 w-full text-center font-bold ${correct ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {correct ? "✅ Correct!" : `❌ Wrong! Answer: ${current.word}`}
            </div>
          )}
          {!checked ? (
            <button onClick={check} disabled={!input.trim()} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition">Check ✓</button>
          ) : (
            <button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">Next →</button>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * CONFIG[difficulty].pts * 0.7 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} / {questions.length * CONFIG[difficulty].pts}</p>
          <p className={`text-sm mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
      <ScoreToast result={scoreResult} score={score} game="Spelling Bee" onDone={() => setScoreResult(null)} />
    </div>
  );
}

export default function SpellingBeePage() {
  return <GameErrorBoundary gameName="Spelling Bee"><SpellingBeeGame /></GameErrorBoundary>;
}
