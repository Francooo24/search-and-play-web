import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import Link from "next/link";
import FavoritesClient from "./FavoritesClient";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const GAME_EMOJI: Record<string, string> = {
  "Hangman": "🪢", "Crossword": "📋", "Word Puzzle": "🔤", "WordGuess": "📝",
  "Tic Tac Toe": "⭕", "Memory Game": "🧠", "Animal Match": "🐾", "Color Words": "🎨",
  "Word Blitz": "⚡", "Cryptogram": "🔐", "Anagram Master": "🔀", "Word Duel": "⚔️",
  "Speed Trivia": "🧠", "Word Scramble": "🔀", "Spelling Bee": "🐝", "Word Search": "🔍",
  "Fill in the Blank": "✏️", "Synonym Match": "🔄", "Word Chain": "🔗", "Word Connect": "🔗",
  "Word Ladder": "🪜", "Word Association": "🧩", "Vocabulary Quiz": "📚", "Idiom Challenge": "💬",
  "Count & Click": "🔢", "ABC Order": "🔤", "Shape Match": "🔷", "Rhyme Time": "🎵",
  "Simple Math": "➕", "Word Bingo": "🎯", "Balloon Pop": "🎈", "Caterpillar Count": "🐛",
  "Color Mix": "🌈", "Odd One Out": "🎪", "Picture Puzzle": "🧩", "Flag Quiz": "🗺️",
  "Math Race": "🧮", "Trivia Blitz": "🧠", "Deduction": "🧩", "Fake or Fact": "📰",
  "Context Clues": "📖", "Debate This": "🎭", "Prefix & Suffix": "🔤", "Sentence Fix": "✍️",
  "Logic Grid": "🔍",
};

const GAME_SLUG: Record<string, string> = {
  "Tic Tac Toe": "tictactoe", "Memory Game": "memory", "Animal Match": "animalmatch",
  "Color Words": "colorwords", "Count & Click": "countclick", "ABC Order": "abcorder",
  "Shape Match": "shapematch", "Rhyme Time": "rhymetime", "Simple Math": "simplemath",
  "Word Bingo": "wordbingo", "Hangman": "hangman", "WordGuess": "wordle",
  "Word Search": "wordsearch", "Spelling Bee": "spellingbee", "Fill in the Blank": "fillinblank",
  "Synonym Match": "synonymmatch", "Word Chain": "wordchain", "Word Puzzle": "puzzle",
  "Word Scramble": "scramble", "Word Connect": "wordconnect", "Crossword": "crossword",
  "Word Ladder": "wordladder", "Cryptogram": "cryptogram", "Word Blitz": "wordblitz",
  "Anagram Master": "anagram", "Word Duel": "wordduel", "Speed Trivia": "trivia",
  "Word Association": "wordassoc", "Vocabulary Quiz": "vocabquiz", "Idiom Challenge": "idiomchallenge",
  "Balloon Pop": "balloonpop", "Caterpillar Count": "caterpillarcount", "Color Mix": "colormix",
  "Odd One Out": "oddoneout", "Picture Puzzle": "picturepuzzle", "Flag Quiz": "flagquiz",
  "Math Race": "mathrace", "Trivia Blitz": "triviablitz", "Deduction": "deduction",
  "Fake or Fact": "fakeorfact", "Context Clues": "contextclues", "Debate This": "debatethis",
  "Prefix & Suffix": "prefixsuffix", "Sentence Fix": "sentencefix", "Logic Grid": "logicgrid",
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin-prompt?from=/favorites");

  const userId = (session.user as any).id;
  const playerName = (session.user as any).name ?? "";

  const [wordRes, gameRes] = await Promise.all([
    pool.query("SELECT word, created_at FROM favorite_words WHERE user_id = $1 ORDER BY created_at DESC", [userId]),
    pool.query("SELECT game, created_at FROM favorite_games WHERE user_id = $1 ORDER BY created_at DESC", [userId]),
  ]);

  const favWords = wordRes.rows;
  const favGames = gameRes.rows;

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-8 pb-16">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden mb-10 mt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/25 via-orange-500/10 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(251,191,36,0.12),transparent_60%)]" />
        <div className="relative px-6 md:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/30 border-4 border-white/10 shrink-0">
            ⭐
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">Collection</p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              My Favorites
            </h1>
            <p className="text-gray-400 text-sm">{playerName}'s saved words &amp; games</p>
          </div>
          {/* Summary badges */}
          <div className="flex gap-3 shrink-0">
            <div className="text-center bg-white/8 border border-white/12 rounded-2xl px-5 py-3">
              <p className="text-2xl font-black text-amber-400">{favWords.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Words</p>
            </div>
            <div className="text-center bg-white/8 border border-white/12 rounded-2xl px-5 py-3">
              <p className="text-2xl font-black text-orange-400">{favGames.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Games</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Saved Words ── */}
      <div className="glass-card rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            📖 Saved Words
            <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">{favWords.length}</span>
          </h2>
          <Link href="/" className="text-xs text-orange-400 hover:text-orange-300 transition">+ Search more</Link>
        </div>
        <div className="p-5">
          {favWords.length > 0 ? (
            <FavoritesClient
              type="words"
              items={favWords.map((fw) => ({
                key: fw.word,
                label: fw.word,
                date: formatDate(fw.created_at),
                href: `/search?word=${encodeURIComponent(fw.word)}`,
              }))}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-300 font-semibold mb-1">No saved words yet</p>
              <p className="text-gray-500 text-sm">Search a word and click ⭐ to save it here.</p>
              <Link href="/" className="inline-block mt-5 bg-gradient-to-r from-orange-600 to-amber-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-700 hover:to-amber-800 transition text-white">
                Start Searching
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Favorite Games ── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            🎮 Favorite Games
            <span className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">{favGames.length}</span>
          </h2>
          <Link href="/games" className="text-xs text-orange-400 hover:text-orange-300 transition">Browse games →</Link>
        </div>
        <div className="p-5">
          {favGames.length > 0 ? (
            <FavoritesClient
              type="games"
              items={favGames.map((fg) => ({
                key: fg.game,
                label: fg.game,
                date: formatDate(fg.created_at),
                href: `/games/${GAME_SLUG[fg.game] ?? fg.game.toLowerCase().replace(/ /g, "-")}`,
                icon: GAME_EMOJI[fg.game] ?? "🎮",
              }))}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-gray-300 font-semibold mb-1">No favorite games yet</p>
              <p className="text-gray-500 text-sm">Go to Games and click ⭐ on any game to save it.</p>
              <Link href="/games" className="inline-block mt-5 bg-gradient-to-r from-orange-600 to-amber-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-700 hover:to-amber-800 transition text-white">
                Browse Games
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
