"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Difficulty } from "@/components/DifficultySelect";
import { submitScore, ScoreResult } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";
import ScoreToast from "@/components/ScoreToast";

const WORD_SETS = [
  { label:"🍎 Fruits", words:[
    {word:"APPLE",     clue:"I am red or green and grow on trees. Eating one a day keeps the doctor away. What fruit am I?"},
    {word:"BANANA",    clue:"I am yellow, curved, and monkeys love me. I am a popular breakfast fruit. What am I?"},
    {word:"MANGO",     clue:"I am sweet, tropical, and called the king of fruits. I am very popular in the Philippines. What fruit am I?"},
    {word:"ORANGE",    clue:"I am a citrus fruit rich in Vitamin C. My color and my name are the same. What am I?"},
    {word:"GRAPES",    clue:"I grow in clusters on a vine and can be made into juice or wine. What fruit am I?"},
    {word:"PINEAPPLE", clue:"I am a tropical fruit with a spiky skin and a crown of leaves on top. What am I?"},
  ]},
  { label:"🎨 Colors", words:[
    {word:"RED",    clue:"I am the color of blood, fire, and stop signs. What color am I?"},
    {word:"BLUE",   clue:"I am the color of the sky and the ocean. What color am I?"},
    {word:"GREEN",  clue:"I am the color of grass, trees, and leaves. What color am I?"},
    {word:"YELLOW", clue:"I am the color of the sun, bananas, and school buses. What color am I?"},
    {word:"PURPLE", clue:"I am a mix of red and blue. Kings and queens wear me. What color am I?"},
    {word:"ORANGE", clue:"I am a mix of red and yellow. A popular fruit shares my name. What color am I?"},
  ]},
  { label:"🌍 Countries", words:[
    {word:"PHILIPPINES", clue:"I am a Southeast Asian country made up of over 7,000 islands. My capital is Manila. What country am I?"},
    {word:"JAPAN",       clue:"I am an Asian island country known as the Land of the Rising Sun. My capital is Tokyo. What country am I?"},
    {word:"FRANCE",      clue:"I am a European country home to the Eiffel Tower. My capital is Paris. What country am I?"},
    {word:"ITALY",       clue:"I am a European country shaped like a boot. I am famous for pizza and pasta. What country am I?"},
    {word:"BRAZIL",      clue:"I am the largest country in South America, famous for carnival and football. What country am I?"},
    {word:"EGYPT",       clue:"I am an African country famous for ancient pyramids and the Nile River. What country am I?"},
  ]},
  { label:"🐾 Animals", words:[
    {word:"ELEPHANT", clue:"I am the largest land animal. I have a long trunk, big ears, and tusks. What animal am I?"},
    {word:"GIRAFFE",  clue:"I am the tallest animal in the world with a very long neck and spotted skin. What animal am I?"},
    {word:"KANGAROO", clue:"I am an Australian animal that hops and carries my baby in a pouch. What animal am I?"},
    {word:"DOLPHIN",  clue:"I am a highly intelligent marine mammal that loves to jump and play in the ocean. What animal am I?"},
    {word:"PENGUIN",  clue:"I am a bird that cannot fly but I can swim. I live in cold climates. What animal am I?"},
    {word:"TIGER",    clue:"I am the largest wild cat with orange fur and black stripes. What animal am I?"},
  ]},
  { label:"⚽ Sports", words:[
    {word:"SOCCER",     clue:"I am the most popular sport in the world. Players kick a round ball into a goal. What sport am I?"},
    {word:"BASKETBALL", clue:"I am a sport where players dribble and shoot a ball through a hoop. The NBA plays me. What sport am I?"},
    {word:"TENNIS",     clue:"I am a sport played with rackets and a small ball over a net. Wimbledon is my most famous tournament. What sport am I?"},
    {word:"SWIMMING",   clue:"I am a sport done in water using strokes like freestyle and butterfly. What sport am I?"},
    {word:"BOXING",     clue:"I am a combat sport where two fighters wear gloves and punch each other in a ring. What sport am I?"},
    {word:"VOLLEYBALL", clue:"I am a sport where two teams hit a ball over a high net. Beach and indoor versions exist. What sport am I?"},
  ]},
  { label:"🎬 Movies", words:[
    {word:"INCEPTION",  clue:"I am a 2010 Christopher Nolan film where a team enters people's dreams to steal secrets. What movie am I?"},
    {word:"TITANIC",    clue:"I am a 1997 James Cameron film about Jack and Rose falling in love on a sinking ship. What movie am I?"},
    {word:"AVATAR",     clue:"I am a 2009 sci-fi film set on the alien planet Pandora with blue-skinned Na'vi people. What movie am I?"},
    {word:"GLADIATOR",  clue:"I am a 2000 film where a Roman general named Maximus becomes a gladiator for revenge. What movie am I?"},
    {word:"MATRIX",     clue:"I am a 1999 sci-fi film where Neo discovers the world is a computer simulation. What movie am I?"},
    {word:"FROZEN",     clue:"I am a Disney animated film featuring sisters Elsa and Anna. Elsa has ice powers. What movie am I?"},
  ]},
  { label:"💼 Occupations", words:[
    {word:"DOCTOR",   clue:"I study medicine and heal sick patients. I work in a hospital or clinic. What profession am I?"},
    {word:"TEACHER",  clue:"I work in a school and educate students every day. What profession am I?"},
    {word:"ENGINEER", clue:"I use math and science to design and build bridges, machines, and software. What profession am I?"},
    {word:"CHEF",     clue:"I professionally cook and create dishes in a restaurant kitchen. What profession am I?"},
    {word:"PILOT",    clue:"I sit in the cockpit and fly aircraft to transport passengers. What profession am I?"},
    {word:"LAWYER",   clue:"I study law and defend people in court before a judge. What profession am I?"},
  ]},
  { label:"🏀 NBA Players", words:[
    {word:"MICHAEL JORDAN",        clue:"I played for the Chicago Bulls, wore #23, and won 6 championships. I am called 'His Airness'. Who am I?"},
    {word:"LEBRON JAMES",          clue:"I am nicknamed 'The King' and have won 4 NBA championships with different teams. Who am I?"},
    {word:"STEPHEN CURRY",         clue:"I play for the Golden State Warriors and am the greatest 3-point shooter in NBA history. Who am I?"},
    {word:"KOBE BRYANT",           clue:"I was a Lakers legend who wore #8 and #24 and was nicknamed 'The Black Mamba'. Who am I?"},
    {word:"KEVIN DURANT",          clue:"I am a 7-foot NBA scorer nicknamed 'The Slim Reaper' with 2 championships. Who am I?"},
    {word:"GIANNIS ANTETOKOUNMPO", clue:"I am a Greek NBA player nicknamed 'The Greek Freak' who plays for the Milwaukee Bucks. Who am I?"},
  ]},
];

const DIFF_CONFIG: Record<Difficulty, { maxErr: number; desc: string }> = {
  Easy:   { maxErr: 8, desc: "8 wrong guesses allowed" },
  Medium: { maxErr: 6, desc: "6 wrong guesses allowed" },
  Hard:   { maxErr: 4, desc: "Only 4 wrong guesses!" },
};

const KEYBOARD_ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];

function HangmanGame() {
  const [difficulty] = useState<Difficulty>("Hard");
  const [setIdx, setSetIdx] = useState(0);
  const [word, setWord] = useState("");
  const [clue, setClue] = useState("");
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [result, setResult] = useState<{emoji:string;title:string;sub:string;pts:string}|null>(null);
  const [showInstr, setShowInstr] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  const maxErr = DIFF_CONFIG[difficulty].maxErr;

  const newWord = useCallback((idx = 0) => {
    const words = WORD_SETS[idx].words;
    const pick = words[Math.floor(Math.random() * words.length)];
    setWord(pick.word); setClue(pick.clue);
    setGuessed(new Set()); setWrong(0); setGameOver(false); setResult(null);
  }, []);

  useEffect(() => { newWord(0); }, [newWord]);

  const guess = useCallback((letter: string) => {
    if (gameOver || paused || guessed.has(letter)) return;
    const ng = new Set(guessed); ng.add(letter);
    setGuessed(ng);
    if (word.includes(letter)) {
      if (word.split("").every(ch => ch === " " || ng.has(ch))) {
        setGameOver(true); setScore(s => s + 10); setWins(w => w + 1);
        submitScore("Hangman", 10).then(setScoreResult);
        setTimeout(() => setResult({emoji:"🎉",title:"You Win!",sub:`The word was "${word}"`,pts:"+10 pts!"}), 700);
      }
    } else {
      const nw = wrong + 1; setWrong(nw);
      if (nw >= maxErr) {
        setGameOver(true);
        setTimeout(() => setResult({emoji:"💀",title:"Game Over!",sub:`The word was "${word}"`,pts:"Better luck next time!"}), 700);
      }
    }
  }, [gameOver, guessed, word, wrong, maxErr, paused]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (/^[a-zA-Z]$/.test(e.key)) guess(e.key.toUpperCase()); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [guess]);

  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🪢 Hangman</span>
        <div className="flex gap-2">
          <PauseButton onPause={setPaused} disabled={gameOver} />
          <button onClick={() => setShowInstr(true)} className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 px-3 py-1.5 rounded-full transition">❓ How to Play</button>
        </div>
      </nav>

      {showInstr && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">🪢 How to Play</h2>
              <button onClick={() => setShowInstr(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🔤 Guess letters one at a time.</li>
              <li>💡 Read the clue to help figure out the word.</li>
              <li>❌ You can make up to <b>{maxErr} wrong guesses</b> on {difficulty} mode.</li>
              <li>✅ Guess correctly to win +10 pts.</li>
            </ul>
            <button onClick={() => setShowInstr(false)} className="mt-5 w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2.5 rounded-xl font-semibold">Got it!</button>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-white text-center mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Hangman</h1>
      <p className="text-center text-gray-400 text-sm mb-2">Guess the word! {maxErr} wrong guesses allowed.</p>

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {WORD_SETS.map((s, i) => (
          <button key={i} onClick={() => { setSetIdx(i); newWord(i); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${setIdx===i ? "bg-orange-500/30 border-orange-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center mb-4">
        {[["Wrong",`${wrong} / ${maxErr}`,"text-red-400"],["Score",score,"text-orange-400"],["Wins",wins,"text-green-400"]].map(([l,v,c]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-400">{l}</p>
            <p className={`text-xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-center w-full max-w-3xl">
        <div className="flex-shrink-0">
          <svg width="160" height="200" viewBox="0 0 160 200" className="drop-shadow-xl">
            <line x1="20" y1="190" x2="140" y2="190" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
            <line x1="60" y1="190" x2="60" y2="20" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
            <line x1="60" y1="20" x2="110" y2="20" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
            <line x1="110" y1="20" x2="110" y2="40" stroke="#475569" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="110" cy="55" r="15" stroke="#f87171" strokeWidth="3" fill="none" style={{opacity:wrong>=1?1:0,transition:"opacity 0.3s"}}/>
            <line x1="110" y1="70" x2="110" y2="120" stroke="#f87171" strokeWidth="3" strokeLinecap="round" style={{opacity:wrong>=2?1:0,transition:"opacity 0.3s"}}/>
            <line x1="110" y1="85" x2="88" y2="108" stroke="#f87171" strokeWidth="3" strokeLinecap="round" style={{opacity:wrong>=3?1:0,transition:"opacity 0.3s"}}/>
            <line x1="110" y1="85" x2="132" y2="108" stroke="#f87171" strokeWidth="3" strokeLinecap="round" style={{opacity:wrong>=4?1:0,transition:"opacity 0.3s"}}/>
            <line x1="110" y1="120" x2="88" y2="150" stroke="#f87171" strokeWidth="3" strokeLinecap="round" style={{opacity:wrong>=5?1:0,transition:"opacity 0.3s"}}/>
            <line x1="110" y1="120" x2="132" y2="150" stroke="#f87171" strokeWidth="3" strokeLinecap="round" style={{opacity:wrong>=6?1:0,transition:"opacity 0.3s"}}/>
          </svg>
        </div>
        <div className="flex-1 w-full">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 mb-4 text-center">
            <p className="text-xs text-orange-300 uppercase tracking-widest mb-1">❓ Question</p>
            <p className="text-white font-semibold text-sm">{clue}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {word.split("").map((ch, i) => (
              ch === " "
                ? <div key={i} className="w-4" />
                : <div key={i} className={`w-[10vw] h-[10vw] max-w-[42px] max-h-[50px] border-b-[3px] flex items-center justify-center text-xl sm:text-2xl font-bold transition-all
                    ${guessed.has(ch) ? "text-green-400 border-green-500" : gameOver ? "text-red-400 border-red-500" : "border-slate-500"}`}>
                    {guessed.has(ch) || gameOver ? ch : ""}
                  </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center mb-4 min-h-[28px]">
            {Array.from(guessed).filter(l => !word.includes(l)).map(l => (
              <span key={l} className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-0.5">{l}</span>
            ))}
          </div>
          <div className="space-y-1.5">
            {KEYBOARD_ROWS.map(row => (
              <div key={row} className="flex gap-1.5 justify-center">
                {row.split("").map(k => {
                  const isGuessed = guessed.has(k);
                  const isCorrect = isGuessed && word.includes(k);
                  const isWrong   = isGuessed && !word.includes(k);
                  return (
                    <button key={k} onClick={() => guess(k)} disabled={isGuessed}
                      className={`w-[9vw] h-[10vw] max-w-[38px] max-h-[42px] rounded-lg text-xs sm:text-sm font-bold border transition
                        ${isCorrect ? "bg-green-500/25 border-green-500 text-green-400" : ""}
                        ${isWrong   ? "bg-red-500/20 border-red-500 text-red-400 opacity-40" : ""}
                        ${!isGuessed ? "bg-white/8 border-white/15 text-slate-100 hover:bg-orange-500/30 hover:border-orange-500" : ""}`}>
                      {k}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => newWord(setIdx)} className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm">🔄 New Word</button>

      <ScoreToast result={scoreResult} score={score} game="Hangman" onDone={() => setScoreResult(null)} />

      {result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 text-center max-w-xs w-full">
            <p className="text-6xl mb-3">{result.emoji}</p>
            <p className="text-2xl font-bold text-white mb-1">{result.title}</p>
            <p className="text-gray-400 text-sm mb-1">{result.sub}</p>
            <p className="text-orange-400 font-bold mb-5">{result.pts}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setResult(null); newWord(setIdx); }} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl transition text-sm">Next Word</button>
              <Link href="/games" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2 rounded-xl transition text-sm">Back</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HangmanPage() {
  return (
    <GameErrorBoundary gameName="Hangman">
      <HangmanGame />
    </GameErrorBoundary>
  );
}
