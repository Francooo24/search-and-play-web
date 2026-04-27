"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AudioButton from "@/components/AudioButton";

const ALL_GAMES = [
  { slug: "tictactoe",       name: "Tic Tac Toe",       icon: "⭕", desc: "Classic game of X and O",                                group: "kids"  },
  { slug: "memory",          name: "Memory Game",       icon: "🧠", desc: "Flip cards and find all matching pairs!",                 group: "kids"  },
  { slug: "animalmatch",     name: "Animal Match",      icon: "🐾", desc: "Match the animal to its sound!",                         group: "kids"  },
  { slug: "colorwords",      name: "Color Words",       icon: "🎨", desc: "Identify the correct color!",                            group: "kids"  },
  { slug: "countclick",      name: "Count & Click",     icon: "🔢", desc: "Count the objects and pick the number!",                 group: "kids"  },
  { slug: "shapematch",      name: "Shape Match",       icon: "🔷", desc: "Match the shapes before time runs out!",                 group: "kids"  },
  { slug: "rhymetime",       name: "Rhyme Time",        icon: "🎵", desc: "Pick the word that rhymes!",                             group: "kids"  },
  { slug: "simplemath",      name: "Simple Math",       icon: "➕", desc: "Solve easy math problems to earn points!",               group: "kids"  },
  { slug: "balloonpop",      name: "Balloon Pop",       icon: "🎈", desc: "Pop the balloon with the correct answer!",               group: "kids"  },
  { slug: "caterpillarcount",name: "Caterpillar Count", icon: "🐛", desc: "Count the emojis and pick the right number!",            group: "kids"  },
  { slug: "colormix",        name: "Color Mix",         icon: "🌈", desc: "Mix two colors and guess the result!",                   group: "kids"  },
  { slug: "oddoneout",       name: "Odd One Out",       icon: "🎪", desc: "Find the item that doesn't belong!",                    group: "kids"  },
  { slug: "hangman",         name: "Hangman",           icon: "🪢", desc: "Guess the word letter by letter!",                      group: "teen"  },
  { slug: "wordle",          name: "WordGuess",         icon: "📝", desc: "Guess the 5-letter word in 6 tries!",                   group: "teen"  },
  { slug: "wordsearch",      name: "Word Search",       icon: "🔍", desc: "Find hidden words in the grid!",                        group: "teen"  },
  { slug: "spellingbee",     name: "Spelling Bee",      icon: "🐝", desc: "Spell the word from its definition!",                   group: "teen"  },
  { slug: "synonymmatch",    name: "Synonym Match",     icon: "🔄", desc: "Match words with their synonyms!",                      group: "teen"  },
  { slug: "scramble",        name: "Word Scramble",     icon: "🔀", desc: "Unscramble the letters!",                               group: "teen"  },
  { slug: "abcorder",        name: "ABC Order",         icon: "🔤", desc: "Arrange the words alphabetically!",                     group: "teen"  },
  { slug: "fillinblank",     name: "Fill in the Blank", icon: "✏️", desc: "Complete the sentence!",                               group: "teen"  },
  { slug: "prefixsuffix",    name: "Prefix & Suffix",   icon: "🔤", desc: "Complete the word with the correct prefix or suffix!",  group: "teen"  },
  { slug: "contextclues",    name: "Context Clues",     icon: "📖", desc: "Figure out the meaning from context!",                  group: "teen"  },
  { slug: "picturepuzzle",   name: "Picture Puzzle",    icon: "🧩", desc: "Slide the tiles to complete the picture!",              group: "teen"  },
  { slug: "triviablitz",     name: "Trivia Blitz",      icon: "🧠", desc: "Answer trivia questions as fast as you can!",           group: "teen"  },
  { slug: "flagquiz",        name: "Flag Quiz",         icon: "🗺️", desc: "Guess the country from its flag!",                     group: "teen"  },
  { slug: "mathrace",        name: "Math Race",         icon: "🧮", desc: "Solve algebra and percentage problems fast!",           group: "teen"  },
  { slug: "sentencefix",     name: "Sentence Fix",      icon: "✍️", desc: "Spot and fix the grammar error in each sentence!",     group: "teen"  },
  { slug: "crossword",       name: "Crossword",         icon: "📋", desc: "Fill the grid using the clues!",                        group: "adult" },
  { slug: "cryptogram",      name: "Cryptogram",        icon: "🔐", desc: "Decode the encrypted quote!",                           group: "adult" },
  { slug: "wordblitz",       name: "Word Blitz",        icon: "⚡", desc: "Type as many words as you can in 60 seconds!",          group: "adult" },
  { slug: "anagram",         name: "Anagram Master",    icon: "🔀", desc: "Form words from the given letters!",                   group: "adult" },
  { slug: "wordduel",        name: "Word Duel",         icon: "⚔️", desc: "Guess the secret word in 8 tries!",                    group: "adult" },
  { slug: "trivia",          name: "Speed Trivia",      icon: "🧠", desc: "Answer trivia questions as fast as possible!",          group: "adult" },
  { slug: "vocabquiz",       name: "Vocabulary Quiz",   icon: "📚", desc: "Test your vocabulary with challenging definitions!",    group: "adult" },
  { slug: "idiomchallenge",  name: "Idiom Challenge",   icon: "💬", desc: "Guess the meaning of common idioms!",                  group: "adult" },
  { slug: "wordassoc",       name: "Word Association",  icon: "🧩", desc: "Chain words by association!",                          group: "adult" },
  { slug: "wordbingo",       name: "Word Bingo",        icon: "🎯", desc: "Mark the words as they are called out!",               group: "adult" },
  { slug: "wordchain",       name: "Word Chain",        icon: "🔗", desc: "Chain words using the last letter!",                   group: "adult" },
  { slug: "wordconnect",     name: "Word Connect",      icon: "🔗", desc: "Connect letters to form as many words as possible!",   group: "adult" },
  { slug: "wordladder",      name: "Word Ladder",       icon: "🪜", desc: "Change one letter at a time to reach the target!",     group: "adult" },
  { slug: "puzzle",          name: "Word Puzzle",       icon: "🔤", desc: "Click tiles to unscramble the word!",                  group: "adult" },
  { slug: "debatethis",      name: "Debate This",       icon: "🎭", desc: "Pick a side and face the counter-argument!",           group: "adult" },
  { slug: "fakeorfact",      name: "Fake or Fact",      icon: "📰", desc: "Can you tell what's real from what's not?",            group: "adult" },
  { slug: "logicgrid",       name: "Logic Grid",        icon: "🔍", desc: "Use deductive reasoning to solve logic puzzles!",      group: "adult" },
  { slug: "deduction",       name: "Deduction",         icon: "🧩", desc: "Crack the secret 4-digit code in 8 tries!",            group: "adult" },
];

function getRecommendedGames(group: string) {
  const pool = group === "all" ? ALL_GAMES : ALL_GAMES.filter(g => g.group === group);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
}

const GROUP_COLOR: Record<string, string> = {
  kids:  "from-blue-500 to-cyan-400",
  teen:  "from-emerald-500 to-teal-400",
  adult: "from-orange-500 to-amber-400",
};

export default function SearchClient({ word, definition, phonetic, origin, isSaved, isLoggedIn, ageGroup }: {
  word: string;
  definition: any;
  phonetic: string;
  origin: string;
  isSaved: boolean;
  isLoggedIn: boolean;
  ageGroup: string;
}) {
  const [saved, setSaved] = useState(isSaved);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const recommended = getRecommendedGames(ageGroup);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/word-image?word=${encodeURIComponent(word)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => setImgSrc(d.url ?? null))
      .catch(() => setImgSrc(null));
    return () => controller.abort();
  }, [word]);

  const toggleSave = async () => {
    const res = await fetch("/api/favorites/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: saved ? "remove" : "save", word }),
    });
    const data = await res.json();
    if (data.success) setSaved(data.saved);
  };

  const entries: any[] = definition ?? [];
  const allMeanings = entries.flatMap((e: any) => e.meanings ?? []);

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 py-8 md:py-12 relative z-10">

      {/* Search bar */}
      <form action="/search" method="GET" className="flex w-full max-w-5xl mb-8">
        <input name="word" defaultValue={word} placeholder="Search another word..."
          className="flex-grow px-4 py-3 text-base rounded-l-lg focus:outline-none bg-white/5 border border-white/10 text-white focus:border-orange-500 transition" />
        <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-base font-medium rounded-r-lg hover:from-orange-600 hover:to-amber-600 transition">Search</button>
      </form>

      <div className="w-full max-w-5xl space-y-6">

        {/* Word header with image */}
        <div className="flex items-start gap-6 flex-wrap">
          {imgSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgSrc} alt={word}
              className="object-cover rounded-2xl border border-white/10 shadow-xl flex-shrink-0"
              style={{ width: "350px", height: "350px" }} />
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight capitalize" style={{ fontFamily: "'Playfair Display', serif" }}>
                {word}
              </h1>
              <div className="flex items-center gap-3 ml-6">
                <AudioButton text={word} lang="en" label="Listen" />
                {isLoggedIn && (
                  <button onClick={toggleSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${saved ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-gray-400 hover:border-orange-500/30 hover:text-orange-400"}`}>
                    {saved ? "★ Saved" : "☆ Save"}
                  </button>
                )}
              </div>
            </div>
            {phonetic && <p className="text-amber-300 font-mono text-lg">{phonetic}</p>}

            {/* Fun fact filler card */}
            <div className="mt-4 glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">✨ Word Spotlight</p>
              <p className="text-white text-sm leading-relaxed">
                You searched for <span className="text-orange-400 font-bold capitalize">&ldquo;{word}&rdquo;</span>. Keep exploring — every word you learn brings you one step closer to mastering the English language!
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-300 px-3 py-1 rounded-full">📖 Dictionary</span>
              </div>
            </div>
          </div>
        </div>

        {origin && (
          <div className="glass-card rounded-2xl p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">Origin</p>
            <p className="text-gray-300 text-sm">{origin}</p>
          </div>
        )}

        {/* Meanings */}
        {allMeanings.length > 0 ? (
          <div className="space-y-5">
            {allMeanings.map((meaning: any, mi: number) => (
              <div key={mi} className="glass-card rounded-3xl p-7 border border-white/10 shadow-xl">
                <p className="text-orange-400 font-black text-sm uppercase tracking-widest mb-4">{meaning.partOfSpeech}</p>
                <ol className="space-y-4">
                  {(meaning.definitions ?? []).slice(0, 4).map((def: any, di: number) => (
                    <li key={di} className="flex gap-4">
                      <span className="text-orange-500 font-black text-base flex-shrink-0">{di + 1}.</span>
                      <div>
                        <p className="text-white text-base leading-relaxed">{def.definition}</p>
                        {def.example && (
                          <p className="text-gray-400 text-sm italic mt-2">&ldquo;{def.example}&rdquo;</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {meaning.synonyms?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 font-semibold">Synonyms:</span>
                    {meaning.synonyms.slice(0, 6).map((s: string) => (
                      <Link key={s} href={`/search?word=${encodeURIComponent(s)}`}
                        className="text-sm bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/30 text-gray-400 hover:text-orange-300 px-3 py-1 rounded-full transition">
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center border border-white/10">
            <p className="text-gray-400 text-base">No definition found for <span className="text-white font-semibold">&ldquo;{word}&rdquo;</span>.</p>
            <p className="text-gray-600 text-sm mt-1">Try checking the spelling or search another word.</p>
          </div>
        )}

        {/* Game Recommendations - only show if logged in */}
        {isLoggedIn && (
          <div className="glass-card rounded-3xl p-7 border border-orange-500/20 bg-orange-500/5">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-1">🎮 Recommended Games</p>
              <h3 className="text-xl font-black text-white">Games you might enjoy</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recommended.map(g => (
                <Link key={g.slug} href={`/games/${g.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 hover:border-white/20 bg-[#0a0a12] transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-20 bg-gradient-to-br ${GROUP_COLOR[g.group]} flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300`}>
                    {g.icon}
                  </div>
                  <div className="p-3">
                    <p className="text-white font-black text-xs mb-0.5">{g.name}</p>
                    <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-2">{g.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link href="/" className="inline-block text-orange-400 hover:text-orange-300 transition text-sm mt-2">← Back to Home</Link>
      </div>
    </div>
  );
}
