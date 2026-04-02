"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import { submitScore } from "@/lib/submitScore";

const ALL_Q = [
  { sentence:"She don't like eating vegetables.", error:"don't", options:["don't → doesn't","like → likes","eating → eat","She → Her"], answer:"don't → doesn't", rule:"Use 'doesn't' with third-person singular (she/he/it).", level:"Easy" },
  { sentence:"A baby dog is called a kitten.", error:"kitten", options:["kitten → puppy","baby → small","dog → cat","called → named"], answer:"kitten → puppy", rule:"A baby dog is called a puppy, not a kitten.", level:"Easy" },
  { sentence:"He runned very fast in the race.", error:"runned", options:["runned → ran","very → much","fast → faster","in → at"], answer:"runned → ran", rule:"'Run' is irregular — past tense is 'ran', not 'runned'.", level:"Easy" },
  { sentence:"Me and my friend went to the mall.", error:"Me", options:["Me → I","went → go","to → at","the → a"], answer:"Me → I", rule:"Use 'I' as a subject, not 'Me'.", level:"Medium" },
  { sentence:"There is many students in the room.", error:"is", options:["is → are","many → much","students → student","in → at"], answer:"is → are", rule:"'Many students' is plural — use 'are', not 'is'.", level:"Medium" },
  { sentence:"I have went to that place before.", error:"went", options:["went → been","have → had","to → at","place → places"], answer:"went → been", rule:"Use 'have been' not 'have went' — 'been' is the past participle.", level:"Medium" },
  { sentence:"The team are playing good today.", error:"good", options:["good → well","are → is","playing → play","today → now"], answer:"good → well", rule:"Use 'well' to modify a verb. 'Good' is an adjective.", level:"Medium" },
  { sentence:"I seen that movie last week.", error:"seen", options:["seen → saw","that → this","movie → film","last → past"], answer:"seen → saw", rule:"'Seen' needs a helper verb. Simple past is 'saw'.", level:"Medium" },
  { sentence:"Neither the boys nor the girl are ready.", error:"are", options:["are → is","Neither → Either","nor → or","ready → readied"], answer:"are → is", rule:"With 'neither...nor', the verb agrees with the nearest subject.", level:"Hard" },
  { sentence:"Each of the students have their own book.", error:"have", options:["have → has","Each → All","their → his","own → personal"], answer:"have → has", rule:"'Each' is singular — use 'has', not 'have'.", level:"Hard" },
  { sentence:"Between you and I, this is a secret.", error:"I", options:["I → me","Between → Among","this → it","secret → secrets"], answer:"I → me", rule:"After a preposition ('between'), use 'me' not 'I'.", level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   pts: 10, desc: "3 rounds, common verb errors" },
  Medium: { filter: "Medium", pts: 10, desc: "5 rounds, subject-verb agreement & tense" },
  Hard:   { filter: "Hard",   pts: 20, desc: "3 rounds, advanced grammar rules" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function SentenceFixGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<typeof ALL_Q>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_Q.filter(q => q.level === d)));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function pick(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].answer) setScore(s => s + CONFIG[difficulty].pts);
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); submitScore("Sentence Fix", score + (opt === questions[idx].answer ? CONFIG[difficulty].pts : 0)); return; }
      setIdx(i => i + 1); setSelected(null);
    }, 1400);
  }

  if (!difficulty) return <DifficultySelect title="Sentence Fix" icon="✍️" subtitle="Spot the grammar error and fix it!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  if (!current) return null;
  const highlighted = current.sentence.replace(current.error, `|||${current.error}|||`);

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">✍️ Sentence Fix</span>
        <div className="flex gap-2">
          <HowToPlay title="Sentence Fix" icon="✍️" steps={["✍️ A sentence with a grammar error is shown.","🔤 The error word is highlighted in yellow.","👆 Pick the correct fix from 4 options.","✅ Correct = points + grammar rule explained!","❌ Wrong = correct answer + rule shown."]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Sentence Fix</h1>
      <p className="text-gray-400 text-sm mb-6 text-center">Spot the grammar error and fix it!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="glass-card rounded-2xl p-6 mb-4 w-full text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Find the error</p>
            <p className="text-white text-lg leading-relaxed">
              {highlighted.split("|||").map((part, i) =>
                i === 1 ? <span key={i} className="text-yellow-400 font-bold underline underline-offset-4">{part}</span> : <span key={i}>{part}</span>
              )}
            </p>
          </div>
          {selected && (
            <div className={`rounded-xl p-3 mb-4 w-full text-sm ${selected === current.answer ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {selected === current.answer ? "✅ Correct! " : `❌ Wrong! Correct: ${current.answer}. `}
              <span className="text-gray-300">📖 {current.rule}</span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 w-full">
            {current.options.map(opt => (
              <button key={opt} onClick={() => pick(opt)}
                className={`py-3 px-5 rounded-xl font-semibold border-2 transition text-left text-sm
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * CONFIG[difficulty].pts * 0.7 ? "🏆" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">All Fixed!</p>
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

export default function SentenceFixPage() {
  return <GameErrorBoundary gameName="Sentence Fix"><SentenceFixGame /></GameErrorBoundary>;
}
