"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import { submitScore } from "@/lib/submitScore";

type Puzzle = { title:string; story:string; clues:string[]; people:string[]; attributes:string[]; solution:Record<string,string>; question:string; answer:string; options:string[]; level:string };

const ALL_PUZZLES: Puzzle[] = [
  { title:"The Book Club", story:"Four friends — Alice, Ben, Clara, and Dan — each read a different book: Mystery, Romance, Sci-Fi, and Fantasy.", clues:["Alice did not read Mystery or Romance.","Ben read Sci-Fi.","Clara read the book that comes first alphabetically among the remaining two.","Dan did not read Fantasy."], people:["Alice","Ben","Clara","Dan"], attributes:["Mystery","Romance","Sci-Fi","Fantasy"], solution:{Alice:"Fantasy",Ben:"Sci-Fi",Clara:"Mystery",Dan:"Romance"}, question:"What book did Alice read?", answer:"Fantasy", options:["Mystery","Romance","Sci-Fi","Fantasy"], level:"Easy" },
  { title:"The Pet Owners", story:"Four neighbors — Sam, Tina, Uma, and Victor — each own a different pet: Cat, Dog, Fish, and Parrot.", clues:["Sam does not own a Cat or Fish.","Tina owns the Dog.","Uma does not own the Parrot.","Victor does not own the Dog."], people:["Sam","Tina","Uma","Victor"], attributes:["Cat","Dog","Fish","Parrot"], solution:{Sam:"Parrot",Tina:"Dog",Uma:"Fish",Victor:"Cat"}, question:"What pet does Victor own?", answer:"Cat", options:["Cat","Dog","Fish","Parrot"], level:"Easy" },
  { title:"The Office Floors", story:"Four coworkers — Mia, Noah, Olivia, and Paul — work on different floors: 1st, 2nd, 3rd, and 4th.", clues:["Mia works higher than Noah.","Paul works on the 1st floor.","Olivia works on a higher floor than Mia.","Noah does not work on the 2nd floor."], people:["Mia","Noah","Olivia","Paul"], attributes:["1st","2nd","3rd","4th"], solution:{Paul:"1st",Noah:"2nd",Mia:"3rd",Olivia:"4th"}, question:"Which floor does Mia work on?", answer:"3rd", options:["1st","2nd","3rd","4th"], level:"Medium" },
  { title:"The Lunch Orders", story:"Four students — Ava, Blake, Cody, and Dana — each ordered a different lunch: Pizza, Burger, Salad, and Pasta.", clues:["Ava did not order Pizza or Burger.","Blake ordered Burger.","Cody did not order Salad.","Dana did not order Pasta."], people:["Ava","Blake","Cody","Dana"], attributes:["Pizza","Burger","Salad","Pasta"], solution:{Ava:"Salad",Blake:"Burger",Cody:"Pizza",Dana:"Pasta"}, question:"What did Ava order?", answer:"Salad", options:["Pizza","Burger","Salad","Pasta"], level:"Medium" },
  { title:"The Race Finish", story:"Four runners — Eli, Faye, Greg, and Hana — finished a race in 1st, 2nd, 3rd, and 4th place.", clues:["Eli finished before Faye but after Greg.","Hana finished last.","Greg did not finish 1st.","Faye finished before Hana."], people:["Eli","Faye","Greg","Hana"], attributes:["1st","2nd","3rd","4th"], solution:{Greg:"1st",Eli:"2nd",Faye:"3rd",Hana:"4th"}, question:"Who finished in 2nd place?", answer:"Eli", options:["Eli","Faye","Greg","Hana"], level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   pts: 20, desc: "2 puzzles, straightforward clues" },
  Medium: { filter: "Medium", pts: 20, desc: "2 puzzles, requires more deduction" },
  Hard:   { filter: "Hard",   pts: 30, desc: "1 puzzle, complex multi-step reasoning" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function LogicGridGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<Puzzle[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setQuestions(shuffle(ALL_PUZZLES.filter(q => q.level === d)));
    setIdx(0); setScore(0); setSelected(null); setDone(false);
  }

  function pick(opt: string) {
    if (selected || !difficulty || paused) return;
    setSelected(opt);
    if (opt === questions[idx].answer) setScore(s => s + CONFIG[difficulty].pts);
  }

  function next() {
    if (idx + 1 >= questions.length) { setDone(true); submitScore("Logic Grid", score, difficulty ?? undefined); return; }
    setIdx(i => i + 1); setSelected(null);
  }

  if (!difficulty) return <DifficultySelect title="Logic Grid" icon="🔍" subtitle="Use the clues to deduce the answer!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔍 Logic Grid</span>
        <div className="flex gap-2">
          <HowToPlay title="Logic Grid" icon="🔍" steps={["🔍 Read the story and all the clues carefully.","🧠 Use deductive reasoning to eliminate possibilities.","❓ Answer the question at the bottom.","✅ Correct = points! ❌ Wrong = answer revealed.","➡️ Press Next Puzzle to continue."]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Logic Grid</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Use the clues to deduce the answer!</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {questions.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-lg">
          <div className="glass-card rounded-2xl p-5 mb-4 w-full">
            <p className="text-xs text-orange-400 uppercase tracking-widest font-bold mb-2">{current.title}</p>
            <p className="text-gray-300 text-sm mb-4">{current.story}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Clues</p>
            <ul className="space-y-2">
              {current.clues.map((clue, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-orange-400 font-bold shrink-0">{i + 1}.</span><span>{clue}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-4 mb-4 w-full text-center">
            <p className="text-white font-bold">❓ {current.question}</p>
          </div>
          {selected && (
            <div className={`rounded-xl p-3 mb-4 w-full text-center font-bold ${selected === current.answer ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {selected === current.answer ? "✅ Correct!" : `❌ Wrong! Answer: ${current.answer}`}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 w-full mb-4">
            {current.options.map(opt => (
              <button key={opt} onClick={() => pick(opt)}
                className={`py-3 rounded-xl font-semibold border-2 transition
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
          {selected && <button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">{idx + 1 < questions.length ? "Next Puzzle →" : "See Results"}</button>}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * CONFIG[difficulty].pts * 0.7 ? "🏆" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">All Solved!</p>
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

export default function LogicGridPage() {
  return <GameErrorBoundary gameName="Logic Grid"><LogicGridGame /></GameErrorBoundary>;
}
