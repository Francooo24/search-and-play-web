"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GamesClient from "@/components/GamesClient";

const GAMES = [
  { slug: "tictactoe",        name: "Tic Tac Toe",        icon: "⭕", desc: "Classic game of X and O",                                 group: "kids"  },
  { slug: "memory",           name: "Memory Game",        icon: "🧠", desc: "Flip cards and find all matching pairs!",                  group: "kids"  },
  { slug: "animalmatch",      name: "Animal Match",       icon: "🐾", desc: "Match the animal to its sound!",                          group: "kids"  },
  { slug: "colorwords",       name: "Color Words",        icon: "🎨", desc: "Identify the correct color!",                             group: "kids"  },
  { slug: "countclick",       name: "Count & Click",      icon: "🔢", desc: "Count the objects and pick the number!",                  group: "kids"  },
  { slug: "shapematch",       name: "Shape Match",        icon: "🔷", desc: "Match the shapes before time runs out!",                  group: "kids"  },
  { slug: "rhymetime",        name: "Rhyme Time",         icon: "🎵", desc: "Pick the word that rhymes!",                              group: "kids"  },
  { slug: "simplemath",       name: "Simple Math",        icon: "➕", desc: "Solve easy math problems to earn points!",                group: "kids"  },
  { slug: "balloonpop",       name: "Balloon Pop",        icon: "🎈", desc: "Pop the balloon with the correct answer!",                group: "kids"  },
  { slug: "caterpillarcount", name: "Caterpillar Count",  icon: "🐛", desc: "Count the emojis and pick the right number!",             group: "kids"  },
  { slug: "colormix",         name: "Color Mix",          icon: "🌈", desc: "Mix two colors and guess the result!",                    group: "kids"  },
  { slug: "oddoneout",        name: "Odd One Out",        icon: "🎪", desc: "Find the item that doesn't belong!",                     group: "kids"  },
  { slug: "hangman",          name: "Hangman",            icon: "🪢", desc: "Guess the word before the man is hanged!",               group: "teen"  },
  { slug: "wordle",           name: "WordGuess",          icon: "📝", desc: "Guess the 5-letter word in 6 tries!",                   group: "teen"  },
  { slug: "wordsearch",       name: "Word Search",        icon: "🔍", desc: "Find hidden words in the letter grid!",                  group: "teen"  },
  { slug: "spellingbee",      name: "Spelling Bee",       icon: "🐝", desc: "Spell the word from its definition!",                    group: "teen"  },
  { slug: "synonymmatch",     name: "Synonym Match",      icon: "🔄", desc: "Match words with their synonyms!",                       group: "teen"  },
  { slug: "scramble",         name: "Word Scramble",      icon: "🔀", desc: "Unscramble words against the clock!",                    group: "teen"  },
  { slug: "abcorder",         name: "ABC Order",          icon: "🔤", desc: "Arrange the words alphabetically!",                      group: "teen"  },
  { slug: "fillinblank",      name: "Fill in the Blank",  icon: "✏️", desc: "Complete the sentence with the right word!",             group: "teen"  },
  { slug: "prefixsuffix",     name: "Prefix & Suffix",    icon: "🔤", desc: "Complete the word with the correct prefix or suffix!",   group: "teen"  },
  { slug: "contextclues",     name: "Context Clues",      icon: "📖", desc: "Figure out the meaning of the word from context!",       group: "teen"  },
  { slug: "picturepuzzle",    name: "Picture Puzzle",     icon: "🧩", desc: "Slide the tiles to complete the picture!",               group: "teen"  },
  { slug: "triviablitz",      name: "Trivia Blitz",       icon: "🧠", desc: "Answer trivia questions as fast as you can!",            group: "teen"  },
  { slug: "flagquiz",         name: "Flag Quiz",          icon: "🗺️", desc: "Guess the country from its flag!",                      group: "teen"  },
  { slug: "mathrace",         name: "Math Race",          icon: "🧮", desc: "Solve algebra and percentage problems fast!",            group: "teen"  },
  { slug: "sentencefix",      name: "Sentence Fix",       icon: "✍️", desc: "Spot and fix the grammar error in each sentence!",      group: "teen"  },
  { slug: "crossword",        name: "Crossword",          icon: "📋", desc: "Fill the grid using the clues!",                         group: "adult" },
  { slug: "cryptogram",       name: "Cryptogram",         icon: "🔐", desc: "Decode the encrypted quote!",                             group: "adult" },
  { slug: "wordblitz",        name: "Word Blitz",         icon: "⚡", desc: "Type as many words as you can in 60 seconds!",            group: "adult" },
  { slug: "anagram",          name: "Anagram Master",     icon: "🔀", desc: "Form words from the given letters!",                     group: "adult" },
  { slug: "wordduel",         name: "Word Duel",          icon: "⚔️", desc: "Guess the secret word in 8 tries!",                      group: "adult" },
  { slug: "trivia",           name: "Speed Trivia",       icon: "🧠", desc: "Answer trivia questions as fast as possible!",            group: "adult" },
  { slug: "vocabquiz",        name: "Vocabulary Quiz",    icon: "📚", desc: "Test your vocabulary with challenging definitions!",      group: "adult" },
  { slug: "idiomchallenge",   name: "Idiom Challenge",    icon: "💬", desc: "Guess the meaning of common idioms!",                    group: "adult" },
  { slug: "wordassoc",        name: "Word Association",   icon: "🧩", desc: "Chain words by association before time runs out!",        group: "adult" },
  { slug: "wordbingo",        name: "Word Bingo",         icon: "🎯", desc: "Mark the words as they are called out!",                  group: "adult" },
  { slug: "wordchain",        name: "Word Chain",         icon: "🔗", desc: "Chain words using the last letter!",                     group: "adult" },
  { slug: "wordconnect",      name: "Word Connect",       icon: "🔗", desc: "Connect letters to form as many words as possible!",      group: "adult" },
  { slug: "wordladder",       name: "Word Ladder",        icon: "🪜", desc: "Change one letter at a time to reach the target!",        group: "adult" },
  { slug: "puzzle",           name: "Word Puzzle",        icon: "🔤", desc: "Click tiles to unscramble the word!",                    group: "adult" },
  { slug: "debatethis",       name: "Debate This",        icon: "🎭", desc: "Pick a side and face the counter-argument!",              group: "adult" },
  { slug: "fakeorfact",       name: "Fake or Fact",       icon: "📰", desc: "Can you tell what's real from what's not?",               group: "adult" },
  { slug: "logicgrid",        name: "Logic Grid",         icon: "🔍", desc: "Use deductive reasoning to solve logic puzzles!",         group: "adult" },
  { slug: "deduction",        name: "Deduction",          icon: "🧩", desc: "Crack the secret 4-digit code in 8 tries!",               group: "adult" },
];

const SECTIONS = [
  { group: "kids",  label: "🧒 Kids Games",  subtitle: "Ages 6–12",        color: "text-blue-400"   },
  { group: "teen",  label: "🧑 Teen Games",  subtitle: "Ages 13–17",       color: "text-green-400"  },
  { group: "adult", label: "🔞 18+ Games",   subtitle: "Ages 18 and above", color: "text-orange-400" },
];

export default function GamesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favGames, setFavGames] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/signin-prompt?from=/games");
      return;
    }
    // Fetch favorite games
    fetch("/api/favorites/games")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setFavGames(d.map((g: any) => g.game)); })
      .catch(() => {});
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  const userAge   = (session?.user as any)?.age ?? null;
  const isAdmin   = (session?.user as any)?.is_admin;
  const showKids  = (session?.user as any)?.show_kids;
  const showTeen  = (session?.user as any)?.show_teen;
  const showAdult = (session?.user as any)?.show_adult;

  let ageGroup = "adult";
  if (userAge !== null) {
    if      (userAge <= 12) ageGroup = "kids";
    else if (userAge <= 17) ageGroup = "teen";
  }

  const visibleGroups = isAdmin
    ? ["kids", "teen", "adult"]
    : [
        ageGroup,
        ...(showKids  && ageGroup !== "kids"  ? ["kids"]  : []),
        ...(showTeen  && ageGroup !== "teen"  ? ["teen"]  : []),
        ...(showAdult && ageGroup !== "adult" ? ["adult"] : []),
      ];

  const visibleSections = SECTIONS.filter(s => visibleGroups.includes(s.group));

  return (
    <div className="flex-grow px-3 sm:px-6 py-8 sm:py-10 md:py-14 relative z-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          🎮 Game Library
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
          Choose Your <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Game</span>
        </h1>
        <p className="text-gray-400 text-sm mt-4 max-w-md mx-auto">
          Challenge yourself with our collection of fun and educational games. Test your vocabulary, sharpen your mind!
        </p>
      </div>
      <GamesClient sections={visibleSections} games={GAMES} favGames={favGames} />
    </div>
  );
}
