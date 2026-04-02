"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { checkAchievements } from "@/lib/checkAchievements";
import AchievementToast from "@/components/AchievementToast";

interface Challenge {
  id: number;
  game: string;
  title: string;
  description: string;
  target_value: number;
  bonus_points: number;
}

interface HistoryItem {
  challenge_date: string;
  game: string;
  title: string;
  bonus_points: number;
  completed_at: string;
}

interface DailyData {
  challenge: Challenge | null;
  completed: boolean;
  progress: number;
  can_claim: boolean;
  streak: number;
  history: HistoryItem[];
}

const GAME_LINKS: Record<string, string> = {
  "Hangman":           "/games/hangman",
  "WordGuess":         "/games/wordle",
  "Crossword":         "/games/crossword",
  "Word Puzzle":       "/games/puzzle",
  "Tic Tac Toe":       "/games/tictactoe",
  "Memory Game":       "/games/memory",
  "Animal Match":      "/games/animalmatch",
  "Color Words":       "/games/colorwords",
  "Count & Click":     "/games/countclick",
  "ABC Order":         "/games/abcorder",
  "Shape Match":       "/games/shapematch",
  "Rhyme Time":        "/games/rhymetime",
  "Simple Math":       "/games/simplemath",
  "Word Bingo":        "/games/wordbingo",
  "Balloon Pop":       "/games/balloonpop",
  "Caterpillar Count": "/games/caterpillarcount",
  "Color Mix":         "/games/colormix",
  "Odd One Out":       "/games/oddoneout",
  "Word Search":       "/games/wordsearch",
  "Spelling Bee":      "/games/spellingbee",
  "Synonym Match":     "/games/synonymmatch",
  "Word Scramble":     "/games/scramble",
  "Fill in the Blank": "/games/fillinblank",
  "Prefix & Suffix":   "/games/prefixsuffix",
  "Context Clues":     "/games/contextclues",
  "Picture Puzzle":    "/games/picturepuzzle",
  "Trivia Blitz":      "/games/triviablitz",
  "Flag Quiz":         "/games/flagquiz",
  "Math Race":         "/games/mathrace",
  "Sentence Fix":      "/games/sentencefix",
  "Cryptogram":        "/games/cryptogram",
  "Word Blitz":        "/games/wordblitz",
  "Anagram Master":    "/games/anagram",
  "Word Duel":         "/games/wordduel",
  "Speed Trivia":      "/games/trivia",
  "Vocabulary Quiz":   "/games/vocabquiz",
  "Idiom Challenge":   "/games/idiomchallenge",
  "Word Association":  "/games/wordassoc",
  "Word Chain":        "/games/wordchain",
  "Word Connect":      "/games/wordconnect",
  "Word Ladder":       "/games/wordladder",
  "Debate This":       "/games/debatethis",
  "Fake or Fact":      "/games/fakeorfact",
  "Logic Grid":        "/games/logicgrid",
  "Deduction":         "/games/deduction",
};

const GAME_EMOJIS: Record<string, string> = {
  "Hangman": "🪢", "WordGuess": "📝", "Crossword": "📋",
  "Word Puzzle": "🔤", "Tic Tac Toe": "⭕", "Memory Game": "🧠",
  "Animal Match": "🐾", "Color Words": "🎨", "Count & Click": "🔢",
  "ABC Order": "🔤", "Shape Match": "🔷", "Rhyme Time": "🎵",
  "Simple Math": "➕", "Word Bingo": "🎯", "Balloon Pop": "🎈",
  "Caterpillar Count": "🐛", "Color Mix": "🌈", "Odd One Out": "🎪",
  "Word Search": "🔍", "Spelling Bee": "🐝", "Synonym Match": "🔄",
  "Word Scramble": "🔀", "Fill in the Blank": "✏️", "Prefix & Suffix": "🔤",
  "Context Clues": "📖", "Picture Puzzle": "🧩", "Trivia Blitz": "🧠",
  "Flag Quiz": "🗺️", "Math Race": "🧮", "Sentence Fix": "✍️",
  "Cryptogram": "🔐", "Word Blitz": "⚡", "Anagram Master": "🔀",
  "Word Duel": "⚔️", "Speed Trivia": "🧠", "Vocabulary Quiz": "📚",
  "Idiom Challenge": "💬", "Word Association": "🧩", "Word Chain": "🔗",
  "Word Connect": "🔗", "Word Ladder": "🪜", "Debate This": "🎭",
  "Fake or Fact": "📰", "Logic Grid": "🔍", "Deduction": "🕵️",
};

function Countdown() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{time || "--:--:--"}</>;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DailyChallengePage() {
  const { data: session, status } = useSession();
  const [data, setData]       = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState("");
  const [badges, setBadges] = useState<{ icon: string; name: string; description: string }[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-challenge");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [status, fetchData]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res  = await fetch("/api/daily-challenge", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setClaimMsg(`🎉 Claimed! +${json.bonus_points} bonus points awarded!`);
        fetchData();
        const newBadges = await checkAchievements();
        if (newBadges.length > 0) setBadges(newBadges);
      } else {
        setClaimMsg(json.error ?? "Could not claim reward.");
      }
    } catch {
      setClaimMsg("Something went wrong.");
    } finally {
      setClaiming(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <AchievementToast badges={badges} onDone={() => setBadges([])} />
      <div className="flex flex-col items-center px-4 sm:px-6 py-10 md:py-14 w-full min-h-screen">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          ⚡ Today&apos;s Challenge
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
          Daily <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Challenge</span>
        </h1>
        <p className="text-gray-600 text-sm mt-4">{today}</p>
      </div>

      {!session?.user && !loading ? (
        <div className="bg-[#0f0f18] border border-white/8 rounded-2xl p-10 text-center max-w-md w-full">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-white font-semibold text-lg mb-2">Sign in to participate</p>
          <p className="text-gray-500 text-sm mb-6">Track your streak and claim daily rewards.</p>
          <Link href="/login" className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition">
            Sign In
          </Link>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-5">

          {/* Streak + countdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f0f18] border border-white/8 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-orange-400">{data?.streak ?? 0} 🔥</p>
              <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">Day Streak</p>
            </div>
            <div className="bg-[#0f0f18] border border-white/8 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-blue-400 font-mono"><Countdown /></p>
              <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">Until Next</p>
            </div>
          </div>

          {/* Main challenge card */}
          {!data?.challenge ? (
            <div className="bg-[#0f0f18] border border-white/8 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">😴</p>
              <p className="text-white font-semibold text-lg">No challenge scheduled for today.</p>
              <p className="text-gray-500 text-sm mt-1">Check back tomorrow!</p>
            </div>
          ) : (
            <div className={`bg-[#0f0f18] border rounded-2xl p-6 md:p-8 transition-all
              ${data.completed
                ? "border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.1)]"
                : "border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]"
              }`}>
              <div className="flex items-start gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0
                  ${data.completed ? "bg-green-500/20" : "bg-orange-500/20"}`}>
                  {GAME_EMOJIS[data.challenge.game] ?? "🎮"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {data.challenge.game}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      +{data.challenge.bonus_points} pts
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mb-1">{data.challenge.title}</h2>
                  <p className="text-gray-500 text-sm">{data.challenge.description}</p>

                  {data.challenge.target_value > 1 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.min(data.progress, data.challenge.target_value)} / {data.challenge.target_value}</span>
                      </div>
                      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round(data.progress / data.challenge.target_value * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {data.completed ? (
                  <div className="flex-1 flex items-center justify-center gap-2 bg-green-500/15 border border-green-500/30 rounded-xl py-3 px-5">
                    <span className="text-green-400 font-bold">✓ Completed!</span>
                  </div>
                ) : (
                  <>
                    <Link
                      href={GAME_LINKS[data.challenge.game] ?? "/games"}
                      className="flex-1 text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-5 rounded-xl hover:from-orange-600 hover:to-amber-600 transition shadow-lg"
                    >
                      Play {data.challenge.game} →
                    </Link>
                    {data.can_claim && (
                      <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg disabled:opacity-60"
                      >
                        {claiming ? "Claiming…" : `🎁 Claim Reward (+${data.challenge.bonus_points} pts)`}
                      </button>
                    )}
                  </>
                )}
              </div>

              {claimMsg && (
                <p className="mt-4 text-center text-green-400 font-semibold text-sm">{claimMsg}</p>
              )}
            </div>
          )}

          {/* History */}
          {(data?.history?.length ?? 0) > 0 && (
            <div className="bg-[#0f0f18] border border-white/8 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">📅 Recent Completions</h2>
              <div className="space-y-3">
                {data!.history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{GAME_EMOJIS[h.game] ?? "🎮"}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{h.title}</p>
                        <p className="text-xs text-gray-600">{fmt(h.challenge_date)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-yellow-400">+{h.bonus_points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
