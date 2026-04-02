import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogGame from "@/components/LogGame";

const GAME_INFO: Record<string, { name: string; icon: string; desc: string }> = {
  // Kids
  tictactoe:      { name: "Tic Tac Toe",       icon: "⭕", desc: "Classic X and O — get three in a row to win!" },
  memory:         { name: "Memory Game",       icon: "🧠", desc: "Flip cards and find matching pairs!" },
  animalmatch:    { name: "Animal Match",      icon: "🐾", desc: "Match the animal to its sound!" },
  colorwords:     { name: "Color Words",       icon: "🎨", desc: "Identify the correct ink color!" },
  countclick:     { name: "Count & Click",     icon: "🔢", desc: "Count the objects and pick the number!" },
  abcorder:       { name: "ABC Order",         icon: "🔤", desc: "Arrange the words alphabetically!" },
  shapematch:     { name: "Shape Match",       icon: "🔷", desc: "Match the shapes before time runs out!" },
  rhymetime:      { name: "Rhyme Time",        icon: "🎵", desc: "Pick the word that rhymes!" },
  simplemath:     { name: "Simple Math",       icon: "➕", desc: "Solve easy math problems to earn points!" },
  wordbingo:      { name: "Word Bingo",        icon: "🎯", desc: "Mark the words as they are called out!" },
  balloonpop:     { name: "Balloon Pop",       icon: "🎈", desc: "Pop the balloon with the correct answer!" },
  caterpillarcount: { name: "Caterpillar Count", icon: "🐛", desc: "Count the emojis and pick the right number!" },
  colormix:       { name: "Color Mix",         icon: "🌈", desc: "Mix two colors and pick the result!" },
  oddoneout:      { name: "Odd One Out",       icon: "🎪", desc: "Find the item that doesn't belong!" },
  // Teen
  hangman:        { name: "Hangman",           icon: "🪢", desc: "Guess the word one letter at a time!" },
  wordle:         { name: "WordGuess",         icon: "📝", desc: "Guess the hidden word in 6 tries!" },
  wordsearch:     { name: "Word Search",       icon: "🔍", desc: "Find hidden words in the letter grid!" },
  spellingbee:    { name: "Spelling Bee",      icon: "🐝", desc: "Spell the word from its definition!" },
  synonymmatch:   { name: "Synonym Match",     icon: "🔄", desc: "Match words with their synonyms!" },
  scramble:       { name: "Word Scramble",     icon: "🔀", desc: "Unscramble words against the clock!" },
  triviablitz:    { name: "Trivia Blitz",      icon: "🧠", desc: "Answer rapid-fire trivia questions!" },
  flagquiz:       { name: "Flag Quiz",         icon: "🗺️", desc: "Identify countries by their flags!" },
  mathrace:       { name: "Math Race",         icon: "🧮", desc: "Solve math problems before time runs out!" },
  sentencefix:    { name: "Sentence Fix",      icon: "✍️", desc: "Fix the grammar error in each sentence!" },
  fillinblank:    { name: "Fill in the Blank", icon: "✏️", desc: "Complete the sentence with the right word!" },
  prefixsuffix:   { name: "Prefix & Suffix",   icon: "🔤", desc: "Add the correct prefix or suffix to the word!" },
  contextclues:   { name: "Context Clues",     icon: "📖", desc: "Figure out a word's meaning from context!" },
  picturepuzzle:  { name: "Picture Puzzle",    icon: "🧩", desc: "Slide tiles to complete the picture!" },
  puzzle:         { name: "Word Puzzle",       icon: "🔤", desc: "Click tiles to unscramble the word!" },
  // Adult
  crossword:      { name: "Crossword",         icon: "📋", desc: "Fill the grid using the clues!" },
  cryptogram:     { name: "Cryptogram",        icon: "🔐", desc: "Decode the encrypted quote!" },
  wordblitz:      { name: "Word Blitz",        icon: "⚡", desc: "Type as many words as you can in 60 seconds!" },
  anagram:        { name: "Anagram Master",    icon: "🔀", desc: "Form words from the given letters!" },
  wordduel:       { name: "Word Duel",         icon: "⚔️", desc: "Guess the secret word in 8 tries!" },
  trivia:         { name: "Speed Trivia",      icon: "🧠", desc: "Answer trivia questions as fast as possible!" },
  vocabquiz:      { name: "Vocabulary Quiz",   icon: "📚", desc: "Test your vocabulary with challenging definitions!" },
  idiomchallenge: { name: "Idiom Challenge",   icon: "💬", desc: "Guess the meaning of common idioms!" },
  logicgrid:      { name: "Logic Grid",        icon: "🔍", desc: "Use clues to solve the deduction puzzle!" },
  deduction:      { name: "Deduction",         icon: "🧩", desc: "Crack the secret code using logic!" },
  wordassoc:      { name: "Word Association",  icon: "🧩", desc: "Chain words by association before time runs out!" },
  wordchain:      { name: "Word Chain",        icon: "🔗", desc: "Chain words using the last letter!" },
  wordconnect:    { name: "Word Connect",      icon: "🔗", desc: "Connect letters to form as many words as possible!" },
  wordladder:     { name: "Word Ladder",       icon: "🪜", desc: "Change one letter at a time to reach the target!" },
  debatethis:     { name: "Debate This",       icon: "🎭", desc: "Explore both sides of a debate topic!" },
  fakeorfact:     { name: "Fake or Fact",      icon: "📰", desc: "Decide if each statement is true or false!" },
};

export default async function GameSlugPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin-prompt?from=/games/" + params.slug);

  const game = GAME_INFO[params.slug];

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
      <LogGame gameName={game?.name ?? params.slug} />
      <div className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-12 max-w-[480px] w-[92%] text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
        <div className="text-7xl mb-6">{game?.icon ?? "🎮"}</div>
        <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          {game?.name ?? params.slug}
        </h1>
        <p className="text-gray-400 mb-8">{game?.desc ?? "This game is coming soon!"}</p>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl px-6 py-5 mb-8">
          <p className="text-4xl mb-3">🚧</p>
          <p className="text-orange-400 font-bold text-lg mb-1">Coming Soon!</p>
          <p className="text-gray-400 text-sm">This game is currently under development. Check back soon!</p>
        </div>

        <Link href="/games" className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition">
          ← Back to Games
        </Link>
      </div>
    </div>
  );
}
