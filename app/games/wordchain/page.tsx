"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DifficultySelect, { Difficulty, DIFF_STYLES } from "@/components/DifficultySelect";
import HowToPlay from "@/components/HowToPlay";
import { submitScore } from "@/lib/submitScore";
import PauseButton from "@/components/PauseButton";
import GameErrorBoundary from "@/components/GameErrorBoundary";

const STARTER_WORDS = ["apple","eagle","elephant","tiger","rabbit","orange","umbrella","island","dragon","night"];
const VALID_WORDS = new Set(["apple","eagle","elephant","tiger","rabbit","orange","umbrella","island","dragon","night","table","egg","game","end","dog","goat","tree","ear","ring","green","nail","lamp","pen","net","top","pot","ten","nose","eye","yarn","name","moon","note","eat","ant","tap","pan","nut","tan","nap","tea","age","gap","map","tar","ran","nag","tag","ram","mat","rat","man","arm","art","rap","par","apt","pat","spa","sap","pal","lap","ape","pea","sea","ace","ice","die","aid","aim","air","ale","all","amp","and","any","arc","are","ark","ash","ask","ate","awe","axe","aye","bad","bag","ban","bar","bat","bay","bed","beg","bet","bid","big","bit","bow","box","boy","bud","bug","bun","bus","but","buy","cab","can","cap","car","cat","cob","cod","cog","cop","cot","cow","cry","cub","cup","cut","dab","dam","dew","did","dig","dim","dip","dot","dry","dub","dud","dug","dun","duo","ear","eat","eel","ego","elf","elm","emu","era","eve","ewe","fad","fan","far","fat","fax","fed","fen","few","fib","fig","fin","fit","fix","fly","foe","fog","fox","fry","fun","fur","gag","gas","gel","gem","get","gig","gin","gnu","god","got","gum","gun","gut","guy","gym","had","ham","has","hat","hay","hem","hen","her","hew","hid","him","hip","his","hit","hob","hog","hop","hot","how","hub","hug","hum","hut","icy","ill","imp","ink","inn","ion","ire","ivy","jab","jag","jam","jar","jaw","jay","jet","jig","job","jog","jot","joy","jug","jut","keg","key","kid","kin","kit","lab","lad","lag","law","lax","lay","lea","led","leg","let","lid","lip","lit","log","lot","low","lug","mad","mar","maw","may","men","met","mid","mix","mob","mod","mop","mud","mug","nab","nay","nil","nip","nit","nob","nod","nor","not","now","nun","oak","oar","oat","odd","ode","off","oil","old","one","opt","orb","ore","our","out","owe","owl","own","pad","pap","paw","pay","peg","pep","per","pet","pew","pie","pig","pin","pit","ply","pod","pop","pow","pro","pub","pug","pun","pup","pus","put","rag","raw","ray","red","ref","rep","rev","rib","rid","rig","rim","rip","rob","rod","rot","row","rub","rug","rum","run","rut","rye","sac","sad","sat","saw","say","set","sew","shy","sin","sip","sir","sit","six","ski","sky","sly","sob","sod","son","sop","sot","sow","soy","spy","sty","sub","sue","sum","sun","sup","tab","tax","the","thy","tie","tin","tip","toe","too","tot","tow","toy","try","tub","tug","two","urn","use","van","vat","vet","vex","via","vie","vim","vow","wad","war","was","wax","way","web","wed","wig","win","wit","woe","wok","won","woo","wow","yak","yam","yap","yaw","yea","yen","yew","you","zap","zed","zen","zig","zip","zoo"]);

const CONFIG: Record<Difficulty, { lives: number; minLen: number; desc: string }> = {
  Easy:   { lives: 5, minLen: 2, desc: "5 lives, any word length accepted" },
  Medium: { lives: 3, minLen: 3, desc: "3 lives, words must be 3+ letters" },
  Hard:   { lives: 1, minLen: 4, desc: "1 life only, words must be 4+ letters!" },
};

function WordChainGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [chain, setChain] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [lives, setLives] = useState(3);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setChain([STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)]]);
    setInput(""); setScore(0); setError(""); setDone(false); setLives(CONFIG[d].lives);
  }

  if (!mounted || !difficulty) return <DifficultySelect title="Word Chain" icon="🔗" subtitle="Chain words using the last letter!" descriptions={{ Easy: CONFIG.Easy.desc, Medium: CONFIG.Medium.desc, Hard: CONFIG.Hard.desc }} onSelect={startGame} />;

  const lastWord = chain[chain.length - 1] ?? "";
  const lastLetter = lastWord ? lastWord[lastWord.length - 1].toLowerCase() : "";

  function submit() {
    if (!difficulty || paused) return;
    const word = input.trim().toLowerCase();
    setInput("");
    if (!word) return;
    if (word.length < CONFIG[difficulty].minLen) { loseLife(`Word must be ${CONFIG[difficulty].minLen}+ letters!`); return; }
    if (!word.startsWith(lastLetter)) { loseLife(`Word must start with "${lastLetter.toUpperCase()}"!`); return; }
    if (chain.includes(word)) { loseLife("Word already used!"); return; }
    if (!VALID_WORDS.has(word)) { loseLife("Not a valid word!"); return; }
    setError("");
    setChain(c => [...c, word]);
    setScore(s => s + word.length * 2);
  }

  function loseLife(msg: string) {
    setError(msg);
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) { setDone(true); submitScore("Word Chain", score, difficulty ?? undefined); }
  }


  return (
    <div className="flex-grow flex flex-col items-center px-4 py-4">
      <nav className="w-full flex justify-between items-center mb-6">
        <Link href="/games" className="text-gray-400 hover:text-white transition text-sm">← Back to Games</Link>
        <span className="font-bold text-lg text-orange-400">🔗 Word Chain</span>
        <div className="flex gap-2">
          <HowToPlay title="Word Chain" icon="🔗" steps={[
            "🔤 A starting word is given — type the next word.",
            "🔗 Each new word must start with the last letter of the previous word.",
            "🚫 You cannot reuse a word already in the chain.",
            "❤️ Wrong answers cost a life — lose all lives and it's game over.",
            "🏆 Each valid word earns points based on its length.",
          ]} />
          <PauseButton onPause={setPaused} disabled={done} />
        </div>
      </nav>
      <h1 className="text-4xl font-bold text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Word Chain</h1>
      <p className="text-gray-400 text-sm mb-4 text-center">Chain words using the last letter!</p>
      <div className="flex gap-3 mb-6 flex-wrap justify-center">
        {[["Score", score, "text-orange-400"], ["Lives", "❤️".repeat(lives) || "💀", "text-red-400"], ["Chain", chain.length, "text-green-400"]].map(([l, v, c]) => (
          <div key={l as string} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-400">{l}</p>
            <p className={`text-xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-gray-400">Mode</p>
          <p className={`text-sm font-bold ${DIFF_STYLES[difficulty].color}`}>{difficulty}</p>
        </div>
      </div>
      {!done ? (
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-4 mb-4 min-h-[80px] flex flex-wrap gap-2">
            {chain.map((w, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-sm font-bold ${i === chain.length - 1 ? "bg-orange-500/30 border border-orange-400 text-orange-300" : "bg-white/10 text-gray-300"}`}>{w}</span>
            ))}
          </div>
          <div className="glass-card rounded-xl p-4 mb-4 text-center">
            <p className="text-gray-400 text-sm">Next word must start with</p>
            <p className="text-4xl font-extrabold text-amber-400 uppercase">{lastLetter}</p>
          </div>
          {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              placeholder={`Type a word starting with "${lastLetter.toUpperCase()}"...`}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500" />
            <button onClick={submit} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition">→</button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-6xl mb-4">😔</p>
          <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
          <p className="text-gray-400 mb-2">Chain length: {chain.length} words</p>
          <p className="text-orange-400 font-bold text-xl mb-2">Score: {score}</p>
          <p className={`text-sm mb-6 ${DIFF_STYLES[difficulty].color}`}>{difficulty} Mode</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startGame(difficulty)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition">🔄 Play Again</button>
            <button onClick={() => setDifficulty(null)} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition">🎯 Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WordChainPage() {
  return <GameErrorBoundary gameName="Word Chain"><WordChainGame /></GameErrorBoundary>;
}
