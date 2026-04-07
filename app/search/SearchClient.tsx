"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AudioButton from "@/components/AudioButton";

function formatOverview(text: string) {
  if (!text) return null;

  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Section headers like "Key Aspects of..."
        if (line.match(/^Key Aspects/i)) return (
          <p key={i} className="text-orange-400 font-bold text-sm mt-4 mb-1">{line}</p>
        );

        // Labels like "Definition:", "Active Meaning:", "Root:", "Contextual Usage:"
        if (line.match(/^(Definition|Active Meaning|Related Words|Contextual Usage|Root):/i)) {
          const colon = line.indexOf(":");
          const label = line.slice(0, colon);
          const content = line.slice(colon + 1).trim();
          return (
            <div key={i} className="text-sm">
              <span className="text-amber-400 font-semibold">{label}: </span>
              <span className="text-gray-300">{content}</span>
            </div>
          );
        }

        // Related word lines (indented or starting with Greek)
        if (line.startsWith("-") || line.match(/^[A-ZΆΈΉΊΌΎΏ]/)) return (
          <p key={i} className="text-gray-300 text-sm pl-4">• {line.replace(/^-\s*/, "")}</p>
        );

        // First paragraph (opening sentence)
        if (i === 0 || (i < 3 && line.length > 40)) return (
          <p key={i} className="text-gray-200 text-sm leading-relaxed">{line}</p>
        );

        return <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p>;
      })}
    </div>
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
  const [overviewError, setOverviewError] = useState("");
  const [saved, setSaved] = useState(isSaved);

  useEffect(() => {
    setOverviewLoading(true);
    setOverviewError("");
    fetch(`/api/greek-overview?word=${encodeURIComponent(word)}`)
      .then(r => r.json())
      .then(d => {
        setOverview(d.overview ?? "");
        if (d.error) setOverviewError(d.error);
        setOverviewLoading(false);
      })
      .catch(e => { setOverviewError(e.message); setOverviewLoading(false); });
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
        <div className="glass-card border-l-4 border-l-amber-500 rounded-2xl p-5 min-h-[120px]" style={{ fontFamily: "'Noto Sans', 'Segoe UI', Arial Unicode MS, sans-serif" }}>
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

      <Link href="/" className="text-orange-400 hover:text-orange-300 transition text-sm mt-2 mb-6">← Back to Home</Link>
    </div>
  );
}
