"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const POPULAR = ["apple", "peace", "love", "happy", "world"];
const CATEGORIES = [
  { emoji: "🌿", label: "Nature",   words: ["ocean","forest","mountain","river","storm"] },
  { emoji: "❤️", label: "Emotions", words: ["love","joy","grief","hope","fear"] },
  { emoji: "🏛️", label: "History",  words: ["empire","ancient","myth","war","hero"] },
  { emoji: "🔬", label: "Science",  words: ["atom","energy","gravity","cell","light"] },
  { emoji: "🎨", label: "Arts",     words: ["music","poetry","drama","color","dance"] },
  { emoji: "🧠", label: "Mind",     words: ["logic","wisdom","memory","dream","soul"] },
];

export default function HomeClient() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [wordOfDay, setWordOfDay] = useState<any>(null);

  useEffect(() => {
    fetch("/api/word-of-day").then(r => r.json()).then(data => { if (data) setWordOfDay(data); });
  }, []);

  const handleSearch = (w: string) => {
    if (!w.trim()) return;
    router.push(`/search?word=${encodeURIComponent(w.trim())}`);
  };

  return (
    <div className="flex-grow flex flex-col items-center text-center px-4 relative z-10 pt-12">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4 md:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Look up any <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Greek</span> word
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-12 max-w-3xl">
        Definitions, examples, and save words to study later.
      </p>

      {/* Search */}
      <div className="w-full max-w-xl mb-6 md:mb-8">
        <form action="/search" method="GET" className="flex mb-4">
          <input
            name="word"
            type="text"
            placeholder="Enter a word..."
            className="flex-grow px-6 py-5 text-lg md:text-xl rounded-l-2xl focus:outline-none bg-white/5 border border-white/12 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/25 transition"
            autoFocus
          />
          <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-5 text-lg font-semibold rounded-r-2xl hover:from-orange-600 hover:to-amber-600 transition shadow-xl flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </form>
        <p className="text-sm text-gray-400 mb-3">Popular right now:</p>
        <div className="flex gap-3 flex-wrap justify-center">
          {POPULAR.map(w => (
            <a key={w} href={`/search?word=${w}`} className="text-sm bg-white/5 px-5 py-2.5 rounded-full hover:bg-white/10 transition border border-white/10">{w}</a>
          ))}
        </div>
      </div>

      {/* Word of the Day */}
      {wordOfDay && (
        <div className="glass-card border-l-4 border-l-orange-500 rounded-2xl px-6 py-5 mb-10 max-w-xl w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">✦ Word of the Day</p>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-2xl font-bold text-white cursor-pointer" onClick={() => handleSearch(wordOfDay.word)}>{wordOfDay.word}</p>
              {wordOfDay.english_word && (
                <p className="text-sm text-orange-300 font-medium mt-0.5">{wordOfDay.english_word}</p>
              )}
            </div>
            <button
              onClick={() => {
                const audio = new Audio(`/api/tts?text=${encodeURIComponent(wordOfDay.word)}&lang=el&v=${Date.now()}`);
                audio.play();
              }}
              title="Listen to Greek pronunciation"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-500/15 hover:bg-orange-500/30 border border-orange-500/25 text-orange-400 transition hover:scale-110"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M9 9v6m-3-3h.01" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 text-sm line-clamp-2 cursor-pointer" onClick={() => handleSearch(wordOfDay.word)}>{wordOfDay.definition}</p>
        </div>
      )}

      {/* Categories */}
      <div className="w-full max-w-xl mb-10 md:mb-14">
        <p className="text-sm text-gray-400 mb-4">Browse by category:</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === i ? null : i)}
              className={`glass-card rounded-xl p-3 text-center cursor-pointer transition hover:-translate-y-1 ${activeCategory === i ? "border-orange-500 bg-orange-500/8" : ""}`}
            >
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <div className="text-xs font-medium text-gray-300">{cat.label}</div>
            </button>
          ))}
        </div>
        {activeCategory !== null && (
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES[activeCategory].words.map(w => (
              <Link key={w} href={`/search?word=${w}`} className="text-sm bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/30 text-gray-300 hover:text-orange-300 px-4 py-1.5 rounded-full transition">{w}</Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
