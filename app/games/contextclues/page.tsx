"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const ALL_Q = [
  { word:"brave", passage:"Despite being scared, the brave firefighter ran into the burning building to save the child. Everyone cheered for his courageous act.", options:["fearful","ready to face danger","very strong","very fast"], answer:"ready to face danger", explanation:"'Brave' means ready to face danger. The clues are 'despite being scared' and 'courageous act'.", level:"Easy" },
  { word:"ancient", passage:"The ancient ruins were thousands of years old. Archaeologists carefully dug through the site, amazed at how well the old structures had survived.", options:["very new","very large","belonging to the very distant past","very beautiful"], answer:"belonging to the very distant past", explanation:"'Ancient' means very old. The clues are 'thousands of years old' and 'old structures'.", level:"Easy" },
  { word:"generous", passage:"Maria was known for being generous — she always shared her lunch with classmates who forgot theirs, and donated her allowance to charity every month.", options:["selfish","willing to give freely","very wealthy","very kind"], answer:"willing to give freely", explanation:"'Generous' means willing to give. The clues are 'shared her lunch' and 'donated her allowance'.", level:"Easy" },
  { word:"pragmatic", passage:"Rather than dreaming about ideal solutions, Maria took a pragmatic approach to the budget crisis. She focused on what was actually achievable given the resources available, making practical decisions.", options:["idealistic","emotional","practical and realistic","theoretical"], answer:"practical and realistic", explanation:"'Pragmatic' means dealing with things sensibly. The clues are 'practical decisions' and 'actually achievable'.", level:"Medium" },
  { word:"ambivalent", passage:"Jake felt ambivalent about the job offer. On one hand, the salary was excellent. On the other hand, it required relocating away from his family. He couldn't decide whether to accept or decline.", options:["excited","having mixed feelings","certain","disappointed"], answer:"having mixed feelings", explanation:"'Ambivalent' means having mixed feelings. The clues are the contrasting 'on one hand' and 'on the other hand'.", level:"Medium" },
  { word:"tenacious", passage:"Despite failing the bar exam twice, Elena remained tenacious. She studied harder than ever, refused to give up, and on her third attempt, she passed with flying colors.", options:["talented","persistent and determined","lucky","intelligent"], answer:"persistent and determined", explanation:"'Tenacious' means holding firmly to a purpose. The clues are 'refused to give up' and 'persistence'.", level:"Medium" },
  { word:"ephemeral", passage:"The cherry blossoms were ephemeral — they bloomed brilliantly for just a few days before the petals fell and the trees returned to bare branches. Tourists traveled from across the country to witness this fleeting spectacle.", options:["permanent","lasting only a short time","colorful","seasonal"], answer:"lasting only a short time", explanation:"'Ephemeral' means lasting for a very short time. The clues are 'just a few days' and 'fleeting spectacle'.", level:"Hard" },
  { word:"ostentatious", passage:"The billionaire's ostentatious lifestyle was hard to ignore — he arrived at every event in a gold-plated limousine, wore diamond-encrusted watches, and hosted lavish parties just to show off his wealth.", options:["modest","showy and excessive","generous","secretive"], answer:"showy and excessive", explanation:"'Ostentatious' means displaying wealth in a showy way. The clues are 'gold-plated', 'diamond-encrusted', and 'show off his wealth'.", level:"Hard" },
  { word:"mitigate", passage:"The city installed flood barriers and improved drainage systems to mitigate the damage caused by heavy rains. While the measures didn't eliminate flooding entirely, they significantly reduced its impact on residents.", options:["worsen","ignore","reduce the severity of","cause"], answer:"reduce the severity of", explanation:"'Mitigate' means to make something less severe. The clues are 'reduced its impact' and 'didn't eliminate... entirely'.", level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; pts: number; desc: string }> = {
  Easy:   { filter: "Easy",   pts: 10, desc: "3 passages, common vocabulary words" },
  Medium: { filter: "Medium", pts: 10, desc: "3 passages, intermediate vocabulary" },
  Hard:   { filter: "Hard",   pts: 20, desc: "3 passages, advanced vocabulary words" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function ContextCluesGame() {
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
  }

  function next() {
    if (!difficulty) return;
    if (idx + 1 >= questions.length) {
      const finalScore = score + (selected === questions[idx].answer ? CONFIG[difficulty].pts : 0);
      setDone(true);
      submitScore("Context Clues", finalScore);
      return;
    }
    setIdx(i => i + 1); setSelected(null);
  }

  if (!difficulty) return <DifficultySelect title="Context Clues" icon="📖" subtitle="Figure out the meaning of the word from context!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = questions[idx];
  if (!current) return null;
  const highlighted = current.passage.replace(new RegExp(`\\b${current.word}\\b`, "i"), `|||${current.word}|||`);

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">📖 Context Clues</span>
        <div className="flex gap-2">
          <HowToPlay title="Context Clues" icon="📖" steps={["📖 Read the passage carefully.","🔍 A word is highlighted — figure out its meaning from context.","👆 Pick the correct definition from 4 options.","✅ Correct = points + explanation shown!","➡️ Press Next to continue."]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Context Clues</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Figure out the meaning of the word from context!</p>
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
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Read the passage</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {highlighted.split("|||").map((part, i) =>
                i === 1 ? <span key={i} className="text-yellow-400 font-bold underline underline-offset-4">{part}</span> : <span key={i}>{part}</span>
              )}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 mb-4 w-full text-center">
            <p className="text-xs text-gray-400 mb-1">What does this word mean?</p>
            <p className="text-2xl font-bold text-yellow-400 italic">"{current.word}"</p>
          </div>
          {selected && (
            <div className={`rounded-xl p-3 mb-4 w-full text-sm ${selected === current.answer ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {selected === current.answer ? "✅ Correct! " : `❌ Wrong! Answer: "${current.answer}". `}
              <span className="text-gray-300">💡 {current.explanation}</span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 w-full mb-4">
            {shuffle(current.options).map(opt => (
              <button key={opt} onClick={() => pick(opt)}
                className={`py-3 px-5 rounded-xl font-semibold border-2 transition text-left text-sm
                  ${selected === opt ? opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300" : "bg-red-500/30 border-red-400 text-red-300"
                  : selected && opt === current.answer ? "bg-green-500/30 border-green-400 text-green-300"
                  : "bg-white/5 border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-400"}`}>{opt}</button>
            ))}
          </div>
          {selected && <button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">{idx + 1 < questions.length ? "Next →" : "See Results"}</button>}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">{score >= questions.length * CONFIG[difficulty].pts * 0.7 ? "🏆" : "😊"}</p>
          <p className="text-2xl font-bold text-white mb-2">All Done!</p>
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

export default function ContextCluesPage() {
  return <GameErrorBoundary gameName="Context Clues"><ContextCluesGame /></GameErrorBoundary>;
}
