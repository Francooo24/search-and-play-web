"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AudioButton from "@/components/AudioButton";

export default function SearchClient({ word, definition, phonetic, origin, isSaved, isLoggedIn }: {
  word: string;
  definition: any;
  phonetic: string;
  origin: string;
  isSaved: boolean;
  isLoggedIn: boolean;
}) {
  const [saved, setSaved] = useState(isSaved);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    // Unsplash Source — free, no API key needed
    const url = `https://source.unsplash.com/400x300/?${encodeURIComponent(word)}`;
    const img = new Image();
    img.onload = () => setImgSrc(url);
    img.onerror = () => setImgSrc(null);
    img.src = url;
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
      <form action="/search" method="GET" className="flex w-full max-w-lg mb-8">
        <input name="word" defaultValue={word} placeholder="Search another word..."
          className="flex-grow px-4 py-3 text-base rounded-l-lg focus:outline-none bg-white/5 border border-white/10 text-white focus:border-orange-500 transition" />
        <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-base font-medium rounded-r-lg hover:from-orange-600 hover:to-amber-600 transition">Search</button>
      </form>

      <div className="w-full max-w-3xl space-y-6">

        {/* Word image */}
        {imgSrc && (
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 h-56 sm:h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt={word} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Word header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {word}
            </h1>
            {phonetic && <p className="text-amber-300 font-mono text-lg mt-1">{phonetic}</p>}
          </div>
          <div className="flex items-center gap-3">
            <AudioButton text={word} lang="en" label="Listen" />
            {isLoggedIn && (
              <button onClick={toggleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${saved ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-gray-400 hover:border-orange-500/30 hover:text-orange-400"}`}>
                {saved ? "★ Saved" : "☆ Save"}
              </button>
            )}
          </div>
        </div>

        {/* Origin */}
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
              <div key={mi} className="glass-card rounded-2xl p-5 border border-white/8">
                <p className="text-orange-400 font-black text-xs uppercase tracking-widest mb-3">{meaning.partOfSpeech}</p>
                <ol className="space-y-3">
                  {(meaning.definitions ?? []).slice(0, 4).map((def: any, di: number) => (
                    <li key={di} className="flex gap-3">
                      <span className="text-orange-500 font-black text-sm flex-shrink-0">{di + 1}.</span>
                      <div>
                        <p className="text-white text-sm leading-relaxed">{def.definition}</p>
                        {def.example && (
                          <p className="text-gray-500 text-xs italic mt-1">"{def.example}"</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {meaning.synonyms?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 font-semibold">Synonyms:</span>
                    {meaning.synonyms.slice(0, 6).map((s: string) => (
                      <Link key={s} href={`/search?word=${encodeURIComponent(s)}`}
                        className="text-xs bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/30 text-gray-400 hover:text-orange-300 px-2 py-0.5 rounded-full transition">
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center border border-white/8">
            <p className="text-gray-400 text-sm">No definition found for <span className="text-white font-semibold">"{word}"</span>.</p>
            <p className="text-gray-600 text-xs mt-1">Try checking the spelling or search another word.</p>
          </div>
        )}

        <Link href="/" className="inline-block text-orange-400 hover:text-orange-300 transition text-sm mt-2">← Back to Home</Link>
      </div>
    </div>
  );
}
