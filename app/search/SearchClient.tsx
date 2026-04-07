"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AudioButton from "@/components/AudioButton";

function formatOverview(text: string) {
  if (!text) return null;
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<span class="text-orange-400 font-semibold">$1</span>')
    .replace(/\*(.+?)\*/g, '<em class="text-amber-300">$1</em>')
    .replace(/\n/g, "<br/>");
  return (
    <div
      className="text-sm text-gray-300 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function SearchClient({ word, greekWord, definition, phonetic, origin, isSaved, isLoggedIn }: {
  word: string;
  greekWord: string;
  definition: any;
  phonetic: string;
  origin: string;
  isSaved: boolean;
  isLoggedIn: boolean;
}) {
  const [overview, setOverview] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [saved, setSaved] = useState(isSaved);

  useEffect(() => {
    setOverviewLoading(true);
    fetch(`/api/greek-overview?word=${encodeURIComponent(word)}`)
      .then(r => r.json())
      .then(d => { setOverview(d.overview ?? ""); setOverviewLoading(false); })
      .catch(() => setOverviewLoading(false));
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

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 py-8 md:py-12 relative z-10">

      {/* Search bar */}
      <form action="/search" method="GET" className="flex w-full max-w-lg mb-8">
        <input name="word" defaultValue={word} placeholder="Search another word..."
          className="flex-grow px-4 py-3 text-base rounded-l-lg focus:outline-none bg-white/5 border border-white/10 text-white focus:border-orange-500 transition" />
        <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-base font-medium rounded-r-lg hover:from-orange-600 hover:to-amber-600 transition">Search</button>
      </form>

      {/* Word header */}
      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        {word}
      </h1>
      {greekWord && (
        <p className="text-amber-400 font-bold text-2xl mb-2 text-center">{greekWord}</p>
      )}
      {isLoggedIn && (
        <button onClick={toggleSave}
          className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${saved ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-gray-400 hover:border-orange-500/30 hover:text-orange-400"}`}>
          {saved ? "★ Saved" : "☆ Save Word"}
        </button>
      )}

      {/* Pronunciation */}
      <div className="w-full max-w-3xl mb-6">
        <div className="glass-card border-l-4 border-l-orange-500 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-3">🔊 Pronunciation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 flex flex-col justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">English</p>
              <p className="text-amber-300 font-bold text-lg mb-1">{word}</p>
              {phonetic && <p className="text-amber-300 font-mono text-sm mb-1">{phonetic}</p>}
              <AudioButton text={word} lang="en" label="Listen in English" />
            </div>
            <div className="bg-white/5 rounded-xl p-4 flex flex-col justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Greek (Ελληνικά)</p>
              <p className="text-amber-400 font-bold text-lg mb-1">{greekWord || "—"}</p>
              <AudioButton text={greekWord || word} lang="el" label="Listen in Greek" />
            </div>
          </div>
        </div>
      </div>

      {/* Greek Overview */}
      <div className="w-full max-w-3xl mb-6">
        <h2 className="text-lg font-semibold text-orange-400 mb-3">🏛️ Greek Overview</h2>
        <div className="glass-card border-l-4 border-l-amber-500 rounded-2xl p-5 min-h-[120px]">
          {overviewLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
              <div className="h-4 bg-white/10 rounded w-4/6" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
            </div>
          ) : overview ? (
            formatOverview(overview)
          ) : (
            <p className="text-gray-400 text-sm">Greek: <span className="text-amber-400 font-semibold">{greekWord || word}</span></p>
          )}
        </div>
      </div>

      {/* English Definition */}
      {definition ? (
        <div className="w-full max-w-3xl mb-6">
          <h2 className="text-lg font-semibold text-orange-400 mb-3">📖 English Definition</h2>
          {definition[0]?.meanings?.map((meaning: any, mi: number) => (
            <div key={mi} className="glass-card border-l-4 border-l-orange-500 rounded-2xl p-5 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-300 bg-orange-500/15 px-3 py-1 rounded-full">{meaning.partOfSpeech}</span>
              <ul className="mt-3 space-y-2">
                {meaning.definitions.slice(0, 3).map((def: any, di: number) => (
                  <li key={di} className="text-gray-200 text-sm">
                    <span className="text-gray-500 mr-2">{di + 1}.</span>{def.definition}
                    {def.example && <p className="text-gray-500 text-xs mt-1 italic">&ldquo;{def.example}&rdquo;</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {origin && (
            <div className="glass-card border-l-4 border-l-amber-500 rounded-2xl p-5 mb-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Etymology / Origin</p>
              <p className="text-amber-300 text-sm">{origin}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card border-l-4 border-l-white/20 rounded-2xl p-5 w-full max-w-3xl mb-6">
          <p className="text-gray-400 text-sm">No English definition found for &ldquo;{word}&rdquo;.</p>
        </div>
      )}

      <Link href="/" className="text-orange-400 hover:text-orange-300 transition text-sm mt-2 mb-6">← Back to Home</Link>
    </div>
  );
}
