"use client";
import { useState } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const ALL_TOPICS = [
  { topic:"Should students have homework?", sideA:"Yes — Homework Helps", sideB:"No — Free Time Matters", argumentA:"Homework reinforces what students learn in class. It builds discipline, responsibility, and helps parents stay involved in their child's education.", argumentB:"Students need time to rest, play, and pursue hobbies. Research shows excessive homework causes stress without significantly improving academic performance.", counterA:"Counter: Homework can be a burden for students with difficult home environments. Not everyone has a quiet space or parental support to complete it.", counterB:"Counter: Without practice outside school, students forget material faster. Some homework, done well, is essential for long-term retention.", level:"Easy" },
  { topic:"Should junk food be banned in school cafeterias?", sideA:"Yes — Ban Junk Food", sideB:"No — Student Choice", argumentA:"Schools have a responsibility to promote healthy habits. Banning junk food reduces childhood obesity and improves concentration and academic performance.", argumentB:"Students should learn to make their own food choices. Banning food is paternalistic and may make 'forbidden' foods more appealing outside school.", counterA:"Counter: Banning food at school doesn't stop students from eating it elsewhere. Education about nutrition is more effective than prohibition.", counterB:"Counter: Children's brains are still developing — they can't always make healthy choices. Schools should model and enforce good habits.", level:"Easy" },
  { topic:"Should social media platforms be held legally responsible for misinformation?", sideA:"Yes — Platforms Responsible", sideB:"No — Free Speech First", argumentA:"Social media companies profit from engagement, and misinformation drives engagement. They have both the tools and the financial incentive to moderate content.", argumentB:"Holding platforms legally liable creates a chilling effect on free speech. Platforms would over-censor to avoid lawsuits, silencing legitimate discourse.", counterA:"Counter: If platforms are liable, they'll over-censor. Who decides what's 'misinformation'? Governments could weaponize this power to silence dissent.", counterB:"Counter: 'Free speech' doesn't mean freedom from consequences. Platforms already moderate hate speech — misinformation that causes deaths is no different.", level:"Medium" },
  { topic:"Is a college degree still worth the cost in today's economy?", sideA:"Yes — Degree is Worth It", sideB:"No — Skills Over Degrees", argumentA:"On average, college graduates earn significantly more over their lifetime. Beyond salary, college develops critical thinking, networking, and social skills.", argumentB:"With student debt at record highs and tech companies dropping degree requirements, skills and portfolios matter more than credentials.", counterA:"Counter: Average earnings data is skewed by high earners. For many fields, the debt-to-income ratio makes college a poor financial investment.", counterB:"Counter: Removing degree requirements benefits those already privileged with networks. For many, a degree is still the most accessible path to upward mobility.", level:"Medium" },
  { topic:"Should artificial intelligence be used to make judicial sentencing decisions?", sideA:"Yes — AI for Fairer Sentencing", sideB:"No — Keep Humans in Charge", argumentA:"Human judges are subject to bias. AI can analyze thousands of cases consistently, removing emotional and unconscious bias from life-altering decisions.", argumentB:"AI systems trained on historical data inherit historical biases. Justice requires human empathy, context, and accountability — things AI cannot provide.", counterA:"Counter: An AI trained on biased data doesn't fix bias — it automates it at scale. At least human bias can be challenged in court.", counterB:"Counter: Human judges are also a 'black box'. At least AI decisions can be logged, audited, and improved over time.", level:"Hard" },
  { topic:"Should voting be mandatory for all eligible citizens?", sideA:"Yes — Compulsory Voting", sideB:"No — Voting is a Choice", argumentA:"Mandatory voting ensures governments truly represent the majority. Countries like Australia have compulsory voting with high satisfaction rates and stable democracies.", argumentB:"Forcing people to vote violates personal freedom. A disengaged voter casting a random ballot is worse than no vote at all.", counterA:"Counter: Forcing uninformed citizens to vote could lead to random or protest votes that distort election results.", counterB:"Counter: Low voter turnout means governments are elected by a minority. Mandatory voting forces civic engagement and political awareness.", level:"Hard" },
];

const CONFIG: Record<Difficulty, { filter: string; desc: string }> = {
  Easy:   { filter: "Easy",   desc: "2 everyday topics, straightforward arguments" },
  Medium: { filter: "Medium", desc: "2 social topics, nuanced arguments" },
  Hard:   { filter: "Hard",   desc: "2 complex topics, deep critical thinking required" },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function DebateThisGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [topics, setTopics] = useState<typeof ALL_TOPICS>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<"A"|"B"|null>(null);
  const [showCounter, setShowCounter] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setTopics(shuffle(ALL_TOPICS.filter(q => q.level === d)));
    setIdx(0); setPicked(null); setShowCounter(false); setScore(0); setDone(false);
  }

  function pick(side: "A"|"B") {
    if (picked || paused) return;
    setPicked(side); setScore(s => s + 10);
  }

  function next() {
    if (idx + 1 >= topics.length) { setDone(true); submitScore("Debate This", score + 10, difficulty ?? undefined); return; }
    setIdx(i => i + 1); setPicked(null); setShowCounter(false);
  }

  if (!difficulty) return <DifficultySelect title="Debate This" icon="🎭" subtitle="Pick a side. Face the counter-argument. Think critically." descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const current = topics[idx];
  if (!current) return null;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🎭 Debate This</span>
        <div className="flex gap-2">
          <HowToPlay title="Debate This" icon="🎭" steps={["🎭 A debate topic is shown — read it carefully.","🔵🔴 Pick a side (A or B) to see its argument.","⚡ Press 'See Counter-Argument' to read the opposing view.","🧠 Think critically about both sides.","➡️ Press Next Topic to continue. Every pick earns +10 pts!"]} />
          <button onClick={() => setDifficulty(null)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">⚙️ Difficulty</button>
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Debate This</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Pick a side. Face the counter-argument. Think critically.</p>
      <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-2 mb-6 flex gap-4 items-center">
        <span className="text-orange-400 font-bold">Score: {score}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400 text-sm">{idx + 1} / {topics.length}</span>
        <span className="text-gray-400">|</span>
        <span className={`text-xs font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</span>
      </div>
      {!done ? (
        <div className="flex flex-col items-center w-full max-w-lg">
          <div className="glass-card rounded-2xl p-5 mb-5 w-full text-center">
            <p className="text-xs text-orange-400 uppercase tracking-widest font-bold mb-2">Topic</p>
            <p className="text-white font-semibold text-base leading-relaxed">{current.topic}</p>
          </div>
          {!picked ? (
            <div className="grid grid-cols-1 gap-4 w-full">
              <button onClick={() => pick("A")} className="py-4 px-5 rounded-2xl border-2 border-blue-500/40 bg-blue-500/10 text-blue-300 font-bold hover:bg-blue-500/20 hover:border-blue-400 transition text-left">🔵 {current.sideA}</button>
              <button onClick={() => pick("B")} className="py-4 px-5 rounded-2xl border-2 border-red-500/40 bg-red-500/10 text-red-300 font-bold hover:bg-red-500/20 hover:border-red-400 transition text-left">🔴 {current.sideB}</button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className={`rounded-2xl p-4 border-2 ${picked==="A" ? "border-blue-500/40 bg-blue-500/10" : "border-red-500/40 bg-red-500/10"}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${picked==="A" ? "text-blue-400" : "text-red-400"}`}>Your Side: {picked==="A" ? current.sideA : current.sideB}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{picked==="A" ? current.argumentA : current.argumentB}</p>
              </div>
              {!showCounter ? (
                <button onClick={() => setShowCounter(true)} className="w-full py-3 rounded-xl border-2 border-yellow-500/40 bg-yellow-500/10 text-yellow-300 font-bold hover:bg-yellow-500/20 transition">⚡ See the Counter-Argument</button>
              ) : (
                <div className="rounded-2xl p-4 border-2 border-yellow-500/40 bg-yellow-500/10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 text-yellow-400">Counter-Argument</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{picked==="A" ? current.counterA : current.counterB}</p>
                </div>
              )}
              <button onClick={next} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">{idx + 1 < topics.length ? "Next Topic →" : "See Results"}</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">🎭</p>
          <p className="text-2xl font-bold text-white mb-2">Debate Complete!</p>
          <p className="text-gray-400 text-sm mb-4">You engaged with {topics.length} topics. Critical thinking is a skill — keep questioning!</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score} pts</p>
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

export default function DebateThisPage() {
  return <GameErrorBoundary gameName="Debate This"><DebateThisGame /></GameErrorBoundary>;
}
