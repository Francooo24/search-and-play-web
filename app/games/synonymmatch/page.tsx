"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const EASY_PAIRS = [
  { word: "happy",  clue: "Feeling joy or pleasure",           answer: "joyful",     options: ["joyful","sad","angry","tired"] },
  { word: "big",    clue: "Large in size",                     answer: "large",      options: ["large","small","tiny","short"] },
  { word: "fast",   clue: "Moving at high speed",              answer: "quick",      options: ["quick","slow","lazy","calm"] },
  { word: "cold",   clue: "Low in temperature",                answer: "chilly",     options: ["chilly","hot","warm","sunny"] },
  { word: "begin",  clue: "To start something",                answer: "start",      options: ["start","end","stop","finish"] },
];
const MEDIUM_PAIRS = [
  ...EASY_PAIRS,
  { word: "smart",     clue: "Having good intelligence",        answer: "clever",     options: ["clever","dumb","weak","loud"] },
  { word: "angry",     clue: "Feeling strong displeasure",      answer: "furious",    options: ["furious","happy","calm","bored"] },
  { word: "brave",     clue: "Ready to face danger",            answer: "courageous", options: ["courageous","scared","weak","shy"] },
  { word: "old",       clue: "Having existed for a long time",  answer: "ancient",    options: ["ancient","new","young","fresh"] },
  { word: "tired",     clue: "Feeling a need to rest or sleep", answer: "exhausted",  options: ["exhausted","energetic","awake","active"] },
];
const HARD_PAIRS = [
  ...MEDIUM_PAIRS,
  { word: "beautiful",  clue: "Very pleasing to look at",        answer: "gorgeous",   options: ["gorgeous","ugly","plain","dull"] },
  { word: "strange",    clue: "Unusual or odd",                  answer: "peculiar",   options: ["peculiar","normal","usual","common"] },
  { word: "wealthy",    clue: "Having a lot of money",           answer: "affluent",   options: ["affluent","poor","modest","frugal"] },
  { word: "talkative",  clue: "Fond of talking a lot",           answer: "loquacious", options: ["loquacious","quiet","reserved","shy"] },
  { word: "fearless",   clue: "Without fear, very bold",         answer: "intrepid",   options: ["intrepid","timid","cowardly","nervous"] },
];

const CONFIG: Record<Difficulty, { pairs: typeof EASY_PAIRS; pts: number; desc: string }> = {
  Easy:   { pairs: EASY_PAIRS,   pts: 10, desc: "5 rounds, common everyday synonyms" },
  Medium: { pairs: MEDIUM_PAIRS, pts: 10, desc: "10 rounds, intermediate vocabulary" },
  Hard:   { pairs: HARD_PAIRS,   pts: 15, desc: "15 rounds, advanced & rare synonyms" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function SynonymMatchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof EASY_PAIRS>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d); setQuestions(shuffle(CONFIG[d].pairs));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function answer(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].answer) setScore(s => s + CONFIG[difficulty].pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Synonym Match", score + (opt === questions[idx].answer ? CONFIG[difficulty].pts : 0)); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 900);
  }

  if (!difficulty) return <DifficultySelect title="Synonym Match" icon="🔄" subtitle="Match words with their synonyms!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔄 Synonym Match</span>
        <div className="flex gap-2">
          <HowToPlay title="Synonym Match" icon="🔄" steps={["🔄 A word is shown on screen.","👆 Pick the word that means the same thing (synonym).","✅ Correct = points! ❌ Wrong = no points.","🏆 Complete all rounds to see your final score!"]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Synonym Match</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Match words with their synonyms!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-sm">
          <p className="text-gray-300 mb-2 text-sm">Which word means the same as...</p>
          <div className="text-5xl font-extrabold text-amber-400 mb-2">{current.word}</div>
          <p className="text-orange-300 text-xs mb-6">💡 {current.clue}</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 rounded-2xl text-base font-bold border-2 transition
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * CONFIG[difficulty].pts * 0.7 ? "🎉" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} / {questions.length * CONFIG[difficulty].pts}</p>
          <p className={`text-sm mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition">Change Difficulty</button>
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SynonymMatchPage() {
  return <GameErrorBoundary gameName="Synonym Match"><SynonymMatchGame /></GameErrorBoundary>;
}
