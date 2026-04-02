"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const ALL_IDIOMS = [
  { idiom:"Break a leg",                    meaning:"Good luck",                        opts:["Good luck","Be careful","Work hard","Stay calm"],                                level:"Easy" },
  { idiom:"Hit the sack",                   meaning:"Go to sleep",                      opts:["Go to sleep","Punch a bag","Go shopping","Start working"],                       level:"Easy" },
  { idiom:"Piece of cake",                  meaning:"Very easy",                        opts:["Very easy","Very delicious","Very expensive","Very difficult"],                   level:"Easy" },
  { idiom:"Under the weather",              meaning:"Feeling ill",                      opts:["Feeling ill","Enjoying rain","Being outside","Feeling happy"],                    level:"Easy" },
  { idiom:"Spill the beans",                meaning:"Reveal a secret",                  opts:["Reveal a secret","Make a mess","Cook dinner","Tell a lie"],                       level:"Medium" },
  { idiom:"Hit the nail on the head",       meaning:"Be exactly right",                 opts:["Be exactly right","Make a mistake","Work too hard","Miss the point"],             level:"Medium" },
  { idiom:"Bite the bullet",                meaning:"Endure a painful situation",       opts:["Endure a painful situation","Give up easily","Eat too fast","Shoot a gun"],       level:"Medium" },
  { idiom:"Cost an arm and a leg",          meaning:"Very expensive",                   opts:["Very expensive","Very cheap","Cause injury","Be painful"],                        level:"Medium" },
  { idiom:"Once in a blue moon",            meaning:"Very rarely",                      opts:["Very rarely","Every night","During full moon","Very often"],                      level:"Medium" },
  { idiom:"Bite off more than you can chew",meaning:"Take on too much",                 opts:["Take on too much","Eat too fast","Be very hungry","Chew slowly"],                 level:"Hard" },
  { idiom:"Let the cat out of the bag",     meaning:"Accidentally reveal a secret",     opts:["Accidentally reveal a secret","Free an animal","Make a mess","Lose something"],  level:"Hard" },
  { idiom:"The ball is in your court",      meaning:"It is your decision",              opts:["It is your decision","Play sports","Be active","Make a mistake"],                 level:"Hard" },
  { idiom:"Burn the midnight oil",          meaning:"Work late into the night",         opts:["Work late into the night","Start a fire","Waste energy","Sleep early"],           level:"Hard" },
  { idiom:"The best of both worlds",        meaning:"Enjoy two advantages at once",     opts:["Enjoy two advantages at once","Make a compromise","Lose everything","Be greedy"], level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   pts: 10, desc: "4 rounds, very common idioms" },
  Medium: { filter: "Medium", pts: 10, desc: "5 rounds, well-known idioms" },
  Hard:   { filter: "Hard",   pts: 15, desc: "5 rounds, tricky idioms" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function IdiomChallengeGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_IDIOMS>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_IDIOMS.filter(q => q.level === d)));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function answer(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    const isCorrect = opt === questions[idx].meaning;
    if (isCorrect) setScore(s => s + CONFIG[difficulty].pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setDone(true);
        submitScore("Idiom Challenge", score + (isCorrect ? CONFIG[difficulty].pts : 0), difficulty);
        return;
      }
      setIdx(i => i + 1); setSelected(null);
    }, 900);
  }

  if (!difficulty) return <DifficultySelect title="Idiom Challenge" icon="💬" subtitle="Guess the meaning of the idiom!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">💬 Idiom Challenge</span>
        <div className="flex gap-2">
          <HowToPlay title="Idiom Challenge" icon="💬" steps={["💬 An idiom is shown in quotes.","👆 Pick the correct meaning from 4 options.","✅ Correct = points! ❌ Wrong = no points.","🏆 Complete all rounds to see your final score!"]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Idiom Challenge</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Guess the meaning of the idiom!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="glass-card rounded-2xl p-6 mb-6 w-full text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">What does this idiom mean?</p>
            <p className="text-2xl font-extrabold text-amber-400">"{current.idiom}"</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {current.opts.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className={`py-4 rounded-2xl text-sm font-bold border-2 transition
                  ${selected === opt ? opt === current.meaning ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.meaning ? "bg-green-500/30 border-green-400 text-green-300"
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

export default function IdiomChallengePage() {
  return <GameErrorBoundary gameName="Idiom Challenge"><IdiomChallengeGame /></GameErrorBoundary>;
}
