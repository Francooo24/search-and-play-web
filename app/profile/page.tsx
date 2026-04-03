import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";

const GAME_EMOJI: Record<string, string> = {
  // Kids
  "Tic Tac Toe": "⭕", "Memory Game": "🧠", "Animal Match": "🐾", "Color Words": "🎨",
  "Count & Click": "🔢", "ABC Order": "🔤", "Shape Match": "🔷", "Rhyme Time": "🎵",
  "Simple Math": "➕", "Word Bingo": "🎯", "Balloon Pop": "🎈", "Caterpillar Count": "🐛",
  "Color Mix": "🌈", "Odd One Out": "🎪",
  // Teen
  "Hangman": "🪢", "WordGuess": "📝", "Word Search": "🔍", "Spelling Bee": "🐝",
  "Synonym Match": "🔄", "Word Scramble": "🔀", "Trivia Blitz": "🧠", "Flag Quiz": "🗺️",
  "Math Race": "🧮", "Sentence Fix": "✍️", "Fill in the Blank": "✏️", "Prefix & Suffix": "🔤",
  "Context Clues": "📖", "Picture Puzzle": "🧩", "Word Puzzle": "🔤",
  // Adult
  "Crossword": "📋", "Cryptogram": "🔐", "Word Blitz": "⚡", "Anagram Master": "🔀",
  "Word Duel": "⚔️", "Speed Trivia": "🧠", "Vocabulary Quiz": "📚", "Idiom Challenge": "💬",
  "Logic Grid": "🔍", "Deduction": "🧩", "Word Association": "🧩", "Word Chain": "🔗",
  "Word Connect": "🔗", "Word Ladder": "🪜", "Debate This": "🎭", "Fake or Fact": "📰",
};

const GAME_SLUG: Record<string, string> = {
  "Tic Tac Toe": "tictactoe", "Memory Game": "memory", "Animal Match": "animalmatch",
  "Color Words": "colorwords", "Count & Click": "countclick", "ABC Order": "abcorder",
  "Shape Match": "shapematch", "Rhyme Time": "rhymetime", "Simple Math": "simplemath",
  "Word Bingo": "wordbingo", "Balloon Pop": "balloonpop", "Caterpillar Count": "caterpillarcount",
  "Color Mix": "colormix", "Odd One Out": "oddoneout",
  "Hangman": "hangman", "WordGuess": "wordle", "Word Search": "wordsearch",
  "Spelling Bee": "spellingbee", "Synonym Match": "synonymmatch", "Word Scramble": "scramble",
  "Trivia Blitz": "triviablitz", "Flag Quiz": "flagquiz", "Math Race": "mathrace",
  "Sentence Fix": "sentencefix", "Fill in the Blank": "fillinblank", "Prefix & Suffix": "prefixsuffix",
  "Context Clues": "contextclues", "Picture Puzzle": "picturepuzzle", "Word Puzzle": "puzzle",
  "Crossword": "crossword", "Cryptogram": "cryptogram", "Word Blitz": "wordblitz",
  "Anagram Master": "anagram", "Word Duel": "wordduel", "Speed Trivia": "trivia",
  "Vocabulary Quiz": "vocabquiz", "Idiom Challenge": "idiomchallenge", "Logic Grid": "logicgrid",
  "Deduction": "deduction", "Word Association": "wordassoc", "Word Chain": "wordchain",
  "Word Connect": "wordconnect", "Word Ladder": "wordladder", "Debate This": "debatethis",
  "Fake or Fact": "fakeorfact",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin-prompt?from=/profile");

  const userId     = (session.user as any).id;
  const playerName = (session.user as any).name ?? "";
  const userAge    = (session.user as any).age ?? null;
  const ageGroup   = userAge === null ? null : userAge <= 12 ? "kids" : userAge <= 17 ? "teen" : "adult";
  const ageLabel   = ageGroup === "kids" ? "🧒 Kids" : ageGroup === "teen" ? "🧑 Teen" : ageGroup === "adult" ? "🔞 Adult" : null;
  const ageBadge   = ageGroup === "kids" ? "bg-blue-500/15 border-blue-500/30 text-blue-300" : ageGroup === "teen" ? "bg-green-500/15 border-green-500/30 text-green-300" : "bg-orange-500/15 border-orange-500/30 text-orange-300";

  const [[overallRows], [statsRows], [recentRows], [achRows], [favWordRows], [favGameRows], [searchHistoryRows]] = await Promise.all([
    pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total_games, MAX(score) as highest_score, SUM(score) as total_points FROM leaderboard WHERE user_id = ?",
      [userId]
    ),
    pool.query<RowDataPacket[]>(
      "SELECT game, COUNT(*) as games_played, MAX(score) as best_score, SUM(score) as total_score FROM leaderboard WHERE user_id = ? GROUP BY game ORDER BY total_score DESC",
      [userId]
    ),
    pool.query<RowDataPacket[]>(
      "SELECT game, score, created_at FROM leaderboard WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
      [userId]
    ),
    pool.query<RowDataPacket[]>(
      "SELECT a.icon, a.name, a.description, ua.earned_at FROM achievements a JOIN user_achievements ua ON a.id = ua.achievement_id WHERE ua.user_id = ? ORDER BY ua.earned_at DESC LIMIT 6",
      [userId]
    ).catch(() => [[]]),
    pool.query<RowDataPacket[]>(
      "SELECT word, created_at FROM favorite_words WHERE user_id = ? ORDER BY created_at DESC LIMIT 8",
      [userId]
    ).catch(() => [[]]),
    pool.query<RowDataPacket[]>(
      "SELECT game, created_at FROM favorite_games WHERE user_id = ? ORDER BY created_at DESC LIMIT 8",
      [userId]
    ).catch(() => [[]]),
    pool.query<RowDataPacket[]>(
      "SELECT id, activity, created_at FROM activity_logs WHERE player_name = ? AND activity LIKE 'Searched for %' ORDER BY created_at DESC LIMIT 20",
      [playerName]
    ).catch(() => [[]]),
  ]);

  const overall       = overallRows[0] ?? {};
  const stats          = statsRows as RowDataPacket[];
  const recent         = recentRows as RowDataPacket[];
  const achievements   = achRows as RowDataPacket[];
  const favWords       = favWordRows as RowDataPacket[];
  const favGames       = favGameRows as RowDataPacket[];
  const searchHistory  = searchHistoryRows as RowDataPacket[];

  const nameParts = playerName.trim().split(/\s+/);
  const firstInitial = (nameParts[0]?.[0] ?? "").toUpperCase();
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const firstName = playerName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 md:px-8 pb-16">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden mb-8 mt-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-amber-500/10 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent_60%)]" />

        <div className="relative px-6 md:px-10 pt-10 pb-8 flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Avatar */}
          <AvatarUpload initials={`${firstInitial}${lastName ? lastName[0].toUpperCase() : ""}`} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-1">{greeting} 👋</p>
            <h1 className="text-3xl md:text-4xl font-black text-white truncate mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Hello, {firstName}!
            </h1>
            <p className="text-sm text-gray-400 mb-3">Welcome back to your profile</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-orange-500/15 border border-orange-500/30 text-orange-300 px-3 py-1 rounded-full">
                🎮 {Number(overall.total_games ?? 0).toLocaleString()} Games
              </span>
              <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full">
                ⭐ {Number(overall.total_points ?? 0).toLocaleString()} Points
              </span>
              {ageLabel && (
                <span className={`text-xs border px-3 py-1 rounded-full font-semibold ${ageBadge}`}>
                  {ageLabel}
                </span>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 shrink-0">
            <Link href="/stats" className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 px-4 py-2 rounded-xl text-sm font-semibold transition">
              📊 Stats
            </Link>
            <Link href="/leaderboard" className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold transition">
              🏆 Board
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 mb-10">
        {[
          { label: "Games Played", value: Number(overall.total_games ?? 0).toLocaleString(),  icon: "🎮", color: "from-orange-500/20 to-orange-600/5",  border: "border-orange-500/20", text: "text-orange-400" },
          { label: "Total Points", value: Number(overall.total_points ?? 0).toLocaleString(), icon: "⚡", color: "from-amber-500/20 to-amber-600/5",   border: "border-amber-500/20",  text: "text-amber-400"  },
          { label: "Best Score",   value: Number(overall.highest_score ?? 0).toLocaleString(),icon: "🏆", color: "from-yellow-500/20 to-yellow-600/5", border: "border-yellow-500/20", text: "text-yellow-400" },
        ].map(({ label, value, icon, color, border, text }) => (
          <div key={label} className={`relative rounded-2xl p-4 md:p-6 bg-gradient-to-br ${color} border ${border} overflow-hidden group hover:-translate-y-1 transition-all`}>
            <div className="absolute top-3 right-3 text-2xl md:text-3xl opacity-20 group-hover:opacity-40 transition">{icon}</div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl md:text-3xl font-black ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Game Stats + Recent ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* Game Statistics */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">🎮 Game Statistics</h2>
            <span className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">{stats.length} games</span>
          </div>
          <div className="p-4">
            {stats.length > 0 ? (
              <div className="space-y-2">
                {stats.map((s: any) => (
                  <div key={s.game} className="flex items-center gap-3 bg-white/4 hover:bg-white/8 border border-white/6 rounded-xl px-4 py-3 transition group">
                    <span className="text-xl shrink-0">{GAME_EMOJI[s.game] ?? "🎮"}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/games/${GAME_SLUG[s.game] ?? s.game.toLowerCase().replace(/ /g, "-")}`} className="font-semibold text-sm text-white hover:text-orange-400 transition truncate block">
                        {s.game}
                      </Link>
                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                        <span>Best: <span className="text-amber-400 font-semibold">{Number(s.best_score).toLocaleString()}</span></span>
                        <span>Total: <span className="text-orange-400 font-semibold">{Number(s.total_score).toLocaleString()}</span></span>
                      </div>
                    </div>
                    <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full shrink-0">{s.games_played}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">🎮</div>
                <p className="text-gray-400 text-sm">No games played yet.</p>
                <Link href="/games" className="text-xs text-orange-400 hover:text-orange-300 transition mt-2 inline-block">Browse games →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Games */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">🕐 Recent Games</h2>
            <Link href="/games/history" className="text-xs text-orange-400 hover:text-orange-300 transition">View all →</Link>
          </div>
          <div className="p-4">
            {recent.length > 0 ? (
              <div className="space-y-2">
                {recent.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-white/4 hover:bg-white/8 border border-white/6 rounded-xl px-4 py-3 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{GAME_EMOJI[r.game] ?? "🎮"}</span>
                      <div>
                        <div className="font-medium text-sm text-white">{r.game}</div>
                        <div className="text-xs text-gray-500">{formatDate(r.created_at)}</div>
                      </div>
                    </div>
                    <div className="font-black text-orange-400">{Number(r.score).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-400 text-sm">No recent games.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Favorites ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* Favorite Words */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">
              ⭐ Saved Words
              <span className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">{favWords.length}</span>
            </h2>
            <Link href="/favorites" className="text-xs text-orange-400 hover:text-orange-300 transition">View all →</Link>
          </div>
          <div className="p-4">
            {favWords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {favWords.map((fw: any) => (
                  <Link key={fw.word} href={`/search?word=${encodeURIComponent(fw.word)}`}
                    className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-300 hover:text-orange-200 px-3 py-1.5 rounded-full text-sm font-medium transition">
                    {fw.word}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2"></div>
                <p className="text-gray-400 text-sm">No saved words yet.</p>
                <Link href="/" className="text-xs text-orange-400 hover:text-orange-300 transition mt-1 inline-block">Search words →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Games */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">
              🎯 Saved Games
              <span className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">{favGames.length}</span>
            </h2>
            <Link href="/games" className="text-xs text-orange-400 hover:text-orange-300 transition">All games →</Link>
          </div>
          <div className="p-4">
            {favGames.length > 0 ? (
              <div className="space-y-2">
                {favGames.map((fg: any) => (
                  <Link key={fg.game} href={`/games/${GAME_SLUG[fg.game] ?? fg.game.toLowerCase().replace(/ /g, "-")}`}
                    className="flex items-center gap-3 bg-white/4 hover:bg-white/8 border border-white/6 rounded-xl px-4 py-3 transition group">
                    <span className="text-xl">{GAME_EMOJI[fg.game] ?? "🎮"}</span>
                    <span className="font-medium text-sm text-white group-hover:text-orange-400 transition flex-1">{fg.game}</span>
                    <span className="text-xs text-gray-500">{formatDate(fg.created_at)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-gray-400 text-sm">No saved games yet.</p>
                <Link href="/games" className="text-xs text-orange-400 hover:text-orange-300 transition mt-1 inline-block">Browse games →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="glass-card rounded-2xl overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">🏆 Achievements</h2>
          <Link href="/achievements" className="text-xs text-orange-400 hover:text-orange-300 transition">View all →</Link>
        </div>
        <div className="p-4">
          {achievements.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                  <span className="text-2xl shrink-0">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">{a.name}</p>
                    <p className="text-xs text-amber-400">{formatDate(a.earned_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-gray-400 text-sm">No achievements yet.</p>
              <Link href="/games" className="text-xs text-orange-400 hover:text-orange-300 transition mt-1 inline-block">Play games to earn badges →</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Search History ── */}
      <div className="glass-card rounded-2xl overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            🔍 Search History
            <span className="text-xs bg-white/8 text-gray-400 px-2 py-0.5 rounded-full">{searchHistory.length}</span>
          </h2>
        </div>
        <div className="p-4">
          {searchHistory.length > 0 ? (
            <div className="space-y-2">
              {searchHistory.map((log: any) => {
                const match = log.activity.match(/^Searched for "(.+)"$/);
                const word = match?.[1];
                if (!word) return null;
                const date = new Date(log.created_at);
                const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  + " · "
                  + date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                return (
                  <div key={log.id} className="flex items-center justify-between bg-white/4 hover:bg-white/8 border border-white/6 rounded-xl px-4 py-3 transition group">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔍</span>
                      <div>
                        <Link href={`/search?word=${encodeURIComponent(word)}`}
                          className="font-semibold text-sm text-white hover:text-orange-400 transition">
                          {word}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{formatted}</p>
                      </div>
                    </div>
                    <Link href={`/search?word=${encodeURIComponent(word)}`}
                      className="opacity-0 group-hover:opacity-100 text-xs bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full transition">
                      Search again
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔎</div>
              <p className="text-gray-400 text-sm">No search history yet.</p>
              <Link href="/" className="text-xs text-orange-400 hover:text-orange-300 transition mt-1 inline-block">Search words →</Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
