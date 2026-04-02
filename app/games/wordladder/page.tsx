"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import GameLoading from "@/components/GameLoading";

const PUZZLES = {
  Easy: [
    { start:"CAT", end:"DOG", steps:["CAT","COT","DOT","DOG"], hint:"Change one letter at a time" },
    { start:"HOT", end:"COD", steps:["HOT","HOD","COD"], hint:"Change one letter at a time" },
    { start:"BAT", end:"CAR", steps:["BAT","BAR","CAR"], hint:"Change one letter at a time" },
  ],
  Medium: [
    { start:"COLD", end:"WARM", steps:["COLD","CORD","WORD","WARD","WARM"], hint:"Change one letter at a time" },
    { start:"HATE", end:"LOVE", steps:["HATE","HAVE","LAVE","LOVE"], hint:"Change one letter at a time" },
    { start:"LEAD", end:"GOLD", steps:["LEAD","LOAD","GOAD","GOLD"], hint:"Change one letter at a time" },
  ],
  Hard: [
    { start:"STONE", end:"MONEY", steps:["STONE","STORE","SCORE","SCARE","SHARE","SHAME","SHALE","WHALE","WHILE","CHILE","CHILD","CHILI","CHINA","CHINA","MONEY"], hint:"This is a long chain — think carefully!" },
    { start:"BLACK", end:"WHITE", steps:["BLACK","BLANK","BLAND","BRAND","BRAID","BRAIN","TRAIN","TRAIL","TRIAL","TIDAL","TIDAL","WHITE"], hint:"Change one letter at a time" },
  ],
};

const VALID_WORDS = new Set(["CAT","COT","DOT","DOG","HOT","HOD","COD","BAT","BAR","CAR","COLD","CORD","WORD","WARD","WARM","HATE","HAVE","LAVE","LOVE","LEAD","LOAD","GOAD","GOLD","BAD","BIG","BIT","BOW","BOX","BOY","BUD","BUG","BUN","BUS","BUT","BUY","CAB","CAN","CAP","COB","COG","COP","COW","CUB","CUP","CUT","DAB","DAM","DIG","DIM","DIP","DUB","DUD","DUG","EAR","EAT","EEL","EGO","ELF","ELM","EMU","END","ERA","EWE","EYE","FAD","FAN","FAR","FAT","FED","FEW","FIG","FIN","FIT","FLY","FOE","FOG","FOX","FRY","FUN","FUR","GAG","GAP","GAS","GEL","GEM","GET","GIG","GIN","GNU","GOD","GOT","GUM","GUN","GUT","GUY","HAD","HAM","HAS","HAT","HAY","HEM","HEN","HEW","HID","HIM","HIP","HIT","HOB","HOG","HOP","HOW","HUB","HUG","HUM","HUT","ICE","ILL","IMP","INK","INN","ION","IRE","IVY","JAB","JAG","JAM","JAR","JAW","JAY","JET","JIG","JOB","JOG","JOT","JOY","JUG","JUT","KEG","KEY","KID","KIN","KIT","LAD","LAG","LAP","LAW","LAX","LAY","LEA","LED","LEG","LET","LID","LIP","LIT","LOG","LOT","LOW","LUG","MAD","MAN","MAP","MAR","MAT","MAW","MAY","MEN","MET","MID","MIX","MOB","MOD","MOP","MUD","MUG","NAB","NAG","NAP","NAY","NET","NEW","NIL","NIP","NIT","NOB","NOD","NOR","NOT","NOW","NUN","NUT","OAK","OAR","OAT","ODD","ODE","OFF","OIL","OLD","ONE","OPT","ORB","ORE","OUR","OUT","OWE","OWL","OWN","PAD","PAL","PAN","PAP","PAR","PAT","PAW","PAY","PEA","PEG","PEN","PEP","PER","PET","PEW","PIE","PIG","PIN","PIT","PLY","POD","POP","POT","POW","PRO","PUB","PUG","PUN","PUP","PUS","PUT","RAG","RAM","RAN","RAP","RAW","RAY","RED","REF","REP","REV","RIB","RID","RIG","RIM","RIP","ROB","ROD","ROT","ROW","RUB","RUG","RUM","RUN","RUT","RYE","SAC","SAD","SAG","SAP","SAT","SAW","SAY","SEA","SET","SEW","SHY","SIN","SIP","SIR","SIT","SIX","SKI","SKY","SLY","SOB","SOD","SON","SOP","SOT","SOW","SOY","SPA","SPY","STY","SUB","SUE","SUM","SUN","SUP","TAB","TAN","TAP","TAR","TAT","TAX","TEA","TEN","THY","TIE","TIN","TIP","TOE","TON","TOO","TOP","TOT","TOW","TOY","TRY","TUB","TUG","TWO","URN","USE","VAN","VAT","VET","VEX","VIA","VIE","VIM","VOW","WAD","WAR","WAS","WAX","WAY","WEB","WED","WIG","WIN","WIT","WOE","WOK","WON","WOO","WOW","YAK","YAM","YAP","YAW","YEA","YEN","YEW","YOU","ZAP","ZED","ZEN","ZIG","ZIP","ZOO","CORD","CORE","BORE","BARE","BALE","TALE","TILE","TIME","LIME","LINE","MINE","WINE","VINE","FINE","FIRE","HIRE","HIKE","BIKE","BITE","SITE","SIRE","TIRE","TIDE","HIDE","HIDE","SIDE","AIDE","AIDE","WIDE","WIFE","LIFE","LIKE","BIKE","BILE","MILE","MILD","WILD","WILE","PILE","PINE","PINT","HINT","MINT","MIST","FIST","FISH","DISH","WISH","WASH","CASH","CAST","MAST","LAST","LASH","GASH","GUST","GUST","JUST","RUST","RUSE","FUSE","MUSE","MUTE","CUTE","CURE","PURE","SURE","SORE","BORE","MORE","MARE","CARE","DARE","DATE","LATE","GATE","GALE","MALE","TALE","PALE","SALE","SOLE","ROLE","MOLE","HOLE","POLE","POLL","PULL","BULL","FULL","FALL","BALL","CALL","TALL","TELL","BELL","BELT","MELT","FELT","FELT","FELL","FILL","HILL","WILL","MILL","BILL","KILL","TILL","TILE","BILE","BILE","BALE","MALE","MOLE","ROLE","SOLE","POLE","HOLE","TOLL","TOLD","BOLD","COLD","FOLD","GOLD","HOLD","MOLD","SOLD","TOLD","WOLD","WORD","WORE","GORE","GONE","BONE","CONE","TONE","LONE","DONE","DOTE","NOTE","VOTE","VOLE","ROLE","SOLE","MOLE","HOLE","POLE","TOLL","TOLD","BOLD","COLD","FOLD","GOLD","HOLD","MOLD","SOLD","WOLD"]);

function differsBy1(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff === 1;
}

const CONFIG: Record<Difficulty, { desc: string }> = {
  Easy:   { desc: "3-letter words, short chains" },
  Medium: { desc: "4-letter words, medium chains" },
  Hard:   { desc: "5-letter words, long chains!" },
};

function WordLadderGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [ladder, setLadder] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [puzzle, setPuzzle] = useState<typeof PUZZLES.Medium[0] | null>(null);
  const [paused, setPaused] = useState(false);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    const p = PUZZLES[d][0];
    setPuzzle(p); setLadder([p.start]);
    setInput(""); setError(""); setDone(false); setScore(0); setPuzzleIdx(0);
  }

  if (!difficulty) return <DifficultySelect title="Word Ladder" icon="🪜" subtitle="Change one letter at a time to reach the target!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  function submit() {
    if (!puzzle || !difficulty || paused) return;
    const word = input.trim().toUpperCase();
    setInput("");
    const current = ladder[ladder.length - 1];
    if (word.length !== puzzle.start.length) { setError(`Must be ${puzzle.start.length} letters!`); return; }
    if (!VALID_WORDS.has(word)) { setError("Not a valid word!"); return; }
    if (!differsBy1(current, word)) { setError("Must change exactly 1 letter!"); return; }
    if (ladder.includes(word)) { setError("Already used!"); return; }
    setError("");
    const newLadder = [...ladder, word];
    setLadder(newLadder);
    if (word === puzzle.end) {
      const pts = Math.max(10, 50 - (newLadder.length - puzzle.steps.length) * 5);
      setScore(pts); setDone(true);
      submitScore("Word Ladder", pts, difficulty ?? undefined);
    }
  }

  function nextPuzzle() {
    if (!difficulty) return;
    const puzzles = PUZZLES[difficulty];
    const next = (puzzleIdx + 1) % puzzles.length;
    setPuzzleIdx(next); setPuzzle(puzzles[next]);
    setLadder([puzzles[next].start]); setInput(""); setError(""); setDone(false); setScore(0);
  }


  if (!puzzle) return <GameLoading />;

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🪜 Word Ladder</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Ladder" icon="🪜" steps={["🪜 A start word and a target word are shown.","⌨️ Type a new word that differs by exactly 1 letter.","✅ Valid word = added to your ladder!","❌ Invalid = error shown, try again.","🏆 Reach the target word to win — fewer steps = higher score!"]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Ladder</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Change one letter at a time to reach the target!</p>
      <span className={`text-xs font-bold px-3 py-1 rounded-full border mb-4 ${DIFF_STYLES[difficulty].badge}`}>{difficulty}</span>
      <div className="flex gap-4 mb-6">
        <div className="glass-card rounded-xl px-5 py-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Start</p>
          <p className="text-2xl font-extrabold text-green-400">{puzzle.start}</p>
        </div>
        <div className="flex items-center text-gray-400 text-2xl">→</div>
        <div className="glass-card rounded-xl px-5 py-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Target</p>
          <p className="text-2xl font-extrabold text-orange-400">{puzzle.end}</p>
        </div>
      </div>
      {!done ? (
        <div className="w-full max-w-xs">
          <div className="flex flex-col gap-2 mb-4">
            {ladder.map((w, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 text-center text-xl font-extrabold tracking-widest ${i === ladder.length - 1 ? "bg-orange-500/20 border border-orange-400 text-orange-300" : "bg-white/5 text-gray-300"}`}>{w}</div>
            ))}
            <div className="rounded-xl px-4 py-3 text-center text-xl font-extrabold tracking-widest border border-dashed border-white/20 text-gray-500">?</div>
          </div>
          {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              placeholder={`${puzzle.start.length}-letter word...`}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center font-bold uppercase focus:outline-none focus:border-orange-500" />
            <button onClick={submit} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition">→</button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">Optimal: {puzzle.steps.length - 1} steps</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">🎉</p>
          <p className="text-2xl font-bold text-white mb-2">Solved!</p>
          <p className="text-gray-400 mb-2">Steps: {ladder.length - 1}</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score}</p>
          <p className={`text-xs mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={nextPuzzle} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition">Next Puzzle →</button>
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl transition">🎯 Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WordLadderPage() {
  return <GameErrorBoundary gameName="Word Ladder"><WordLadderGame /></GameErrorBoundary>;
}
