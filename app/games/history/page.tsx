"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GAME_EMOJI: Record<string, string> = {
  "Hangman": "🪢", "Crossword": "📋", "Word Puzzle": "🔤", "WordGuess": "📝",
  "Word Chain": "🔗", "Spelling Bee": "🐝", "Tic Tac Toe": "⭕", "Memory Game": "🧠",
  "Animal Match": "🐾", "Color Words": "🎨", "Count & Click": "🔢", "ABC Order": "🔤",
  "Word Blitz": "⚡", "Cryptogram": "🔐", "Anagram Master": "🔀", "Word Duel": "⚔️",
  "Speed Trivia": "🧠", "Word Scramble": "🔀", "Trivia Blitz": "⚡", "Vocab Quiz": "📚",
  "Word Association": "💬", "Word Bingo": "🎯", "Word Connect": "🔗", "Word Ladder": "🪜",
  "Word Search": "🔍", "Fill in the Blank": "✏️", "Flag Quiz": "🚩", "Idiom Challenge": "💡",
  "Logic Grid": "🧩", "Math Race": "➕", "Prefix & Suffix": "📖", "Sentence Fix": "✍️",
  "Shape Match": "🔷", "Simple Math": "🔢", "Synonym Match": "🔄", "Deduction": "🕵️",
  "Fake or Fact": "❓", "Context Clues": "📖", "Debate This": "🗣️", "Balloon Pop": "🎈",
  "Caterpillar Count": "🐛", "Color Mix": "🌈", "Odd One Out": "🔍", "Picture Puzzle": "🖼️",
  "Rhyme Time": "🎵", "Daily Challenge": "📅",
};

const GAME_SLUG: Record<string, string> = {
  "Hangman": "hangman", "Crossword": "crossword", "Word Puzzle": "puzzle",
  "WordGuess": "wordle", "Word Chain": "wordchain", "Spelling Bee": "spellingbee",
  "Tic Tac Toe": "tictactoe", "Memory Game": "memory", "Animal Match": "animalmatch",
  "Color Words": "colorwords", "Count & Click": "countclick", "ABC Order": "abcorder",
  "Word Blitz": "wordblitz", "Cryptogram": "cryptogram", "Anagram Master": "anagram",
  "Word Duel": "wordduel", "Speed Trivia": "trivia", "Word Scramble": "scramble",
  "Trivia Blitz": "triviablitz", "Vocab Quiz": "vocabquiz", "Word Association": "wordassoc",
  "Word Bingo": "wordbingo", "Word Connect": "wordconnect", "Word Ladder": "wordladder",
  "Word Search": "wordsearch", "Fill in the Blank": "fillinblank", "Flag Quiz": "flagquiz",
  "Idiom Challenge": "idiomchallenge", "Logic Grid": "logicgrid", "Math Race": "mathrace",
  "Prefix & Suffix": "prefixsuffix", "Sentence Fix": "sentencefix", "Shape Match": "shapematch",
  "Simple Math": "simplemath", "Synonym Match": "synonymmatch", "Deduction": "deduction",
  "Fake or Fact": "fakeorfact", "Context Clues": "contextclues", "Debate This": "debatethis",
  "Balloon Pop": "balloonpop", "Caterpillar Count": "caterpillarcount", "Color Mix": "colormix",
  "Odd One Out": "oddoneout", "Picture Puzzle": "picturepuzzle", "Rhyme Time": "rhymetime",
};

interface Entry { game: string; score: number; created_at: string; }
interface StatsData {
  history: Entry[]; historyTotal: number; historyPages: number;
  page: number; distinctGames: string[];
}

function fmtFull(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function gameLink(name: string) {
  return `/games/${GAME_SLUG[name] ?? name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

export default function GameHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData]         = useState<StatsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [gameFilter, setGameFilter] = useState("");
  const [sort, setSort]         = useState("created_at");
  const [dir, setDir]           = useState("desc");
  const [page, setPage]         = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin-prompt?from=/games/history");
  }, [status, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ game: gameFilter, sort, dir, page: String(page) });
      const res  = await fetch(`/api/stats?${p}`);
      const json = await res.json();
      if (!json.error) setData(json);
    } finally {
      setLoading(false);
    }
  }, [gameFilter, sort, dir, page]);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [fetchData, status]);

  function toggleSort(col: string) {
    if (sort === col) setDir(d => d === "desc" ? "asc" : "desc");
    else { setSort(col); setDir("desc"); }
    setPage(1);
  }

  function SortIcon({ col }: { col: string }) {
    if (sort !== col) return <span className="text-gray-600">↕</span>;
    return <span className="text-orange-400">{dir === "asc" ? "↑" : "↓"}</span>;
  }

  if (status === "loading" || (loading && !data)) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading history...</div>
      </div>
    );
  }

  const history      = data?.history ?? [];
  const historyTotal = data?.historyTotal ?? 0;
  const historyPages = data?.historyPages ?? 1;
  const distinctGames = data?.distinctGames ?? [];

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-8 pb-16">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-8 mt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/25 via-amber-500/10 to-slate-900" />
        <div className="relative px-6 md:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-1">Your Records</p>
            <h1 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Game History
            </h1>
            <p className="text-gray-400 text-sm mt-1">{historyTotal.toLocaleString()} total games played</p>
          </div>
          <Link href="/profile" className="shrink-0 flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold transition">
            ← Profile
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-white flex items-center gap-2">
            📜 All Games
            <span className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">{historyTotal.toLocaleString()}</span>
          </h2>
          <select
            value={gameFilter}
            onChange={e => { setGameFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Games</option>
            {distinctGames.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="p-4">
          {historyTotal > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-xs uppercase tracking-wider text-gray-500">
                      <th className="text-left pb-3 pr-4">#</th>
                      <th className="text-left pb-3 pr-4">Game</th>
                      <th className="text-left pb-3 pr-4">
                        <button onClick={() => toggleSort("score")} className="flex items-center gap-1 hover:text-orange-400 transition">
                          Score <SortIcon col="score" />
                        </button>
                      </th>
                      <th className="text-left pb-3">
                        <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-orange-400 transition">
                          Date <SortIcon col="created_at" />
                        </button>
                      </th>
                      <th className="text-left pb-3">Play Again</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((h, i) => (
                      <tr key={i} className="hover:bg-white/3 transition">
                        <td className="py-3 pr-4 text-gray-600">{(page - 1) * 20 + i + 1}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{GAME_EMOJI[h.game] ?? "🎮"}</span>
                            <span className="text-white text-sm">{h.game}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-black text-amber-400">{h.score.toLocaleString()}</td>
                        <td className="py-3 text-gray-400 text-xs">{fmtFull(h.created_at)}</td>
                        <td className="py-3">
                          <Link href={gameLink(h.game)}
                            className="text-xs bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full transition">
                            Play →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {historyPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/8">
                  <span className="text-xs text-gray-500">
                    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, historyTotal)} of {historyTotal.toLocaleString()}
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition text-xs">
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(historyPages, 7) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition ${p === page ? "bg-orange-500 text-white font-bold" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => p + 1)} disabled={page === historyPages}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition text-xs">
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-400 font-semibold mb-1">No game history yet</p>
              <p className="text-gray-600 text-sm mb-5">{gameFilter ? `No games found for "${gameFilter}"` : "Start playing to build your history!"}</p>
              {gameFilter ? (
                <button onClick={() => setGameFilter("")} className="text-xs text-orange-400 hover:text-orange-300 transition">
                  Clear filter →
                </button>
              ) : (
                <Link href="/games" className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:from-orange-600 hover:to-amber-600 transition">
                  Browse Games →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
