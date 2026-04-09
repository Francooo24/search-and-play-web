"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AudioButton from "@/components/AudioButton";

async function translate(word: string, lang: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${lang}`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return data?.responseData?.translatedText ?? "";
  } catch { return ""; }
}

export default function SearchClient({ word, definition, phonetic, origin, isSaved, isLoggedIn }: {
  word: string;
  definition: any;
  phonetic: string;
  origin: string;
  isSaved: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(isSaved);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [tagalog, setTagalog] = useState("");
  const [bisaya, setBisaya] = useState("");
  const [loadingTrans, setLoadingTrans] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/word-image?word=${encodeURIComponent(word)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => setImgSrc(d.url ?? null))
      .catch(() => setImgSrc(null));
    return () => controller.abort();
  }, [word]);

  useEffect(() => {
    setLoadingTrans(true);
    Promise.all([
      translate(word, "tl"), // Tagalog
      translate(word, "ceb"), // Bisaya/Cebuano
    ]).then(([tl, ceb]) => {
      setTagalog(tl);
      setBisaya(ceb);
      setLoadingTrans(false);
    });
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
      <form action="/search" method="GET" className="flex w-full max-w-5xl mb-8">
        <input name="word" defaultValue={word} placeholder="Search another word..."
          className="flex-grow px-4 py-3 text-base rounded-l-lg focus:outline-none bg-white/5 border border-white/10 text-white focus:border-orange-500 transition" />
        <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-base font-medium rounded-r-lg hover:from-orange-600 hover:to-amber-600 transition">Search</button>
      </form>

      <div className="w-full max-w-5xl space-y-6">

        {/* Word image */}
        {imgSrc && (
          <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 h-72 sm:h-96 group shadow-2xl shadow-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt={word} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-8 py-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">📖 Word Image</p>
              <h2 className="text-4xl font-black text-white capitalize" style={{ fontFamily: "'Playfair Display', serif" }}>{word}</h2>
              {phonetic && <p className="text-amber-300 font-mono text-base mt-1">{phonetic}</p>}
            </div>
          </div>
        )}

        {/* Word header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            {!imgSrc && (
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {word}
              </h1>
            )}
            {!imgSrc && phonetic && <p className="text-amber-300 font-mono text-lg mt-1">{phonetic}</p>}
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

        {/* Tagalog & Bisaya translations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tagalog */}
          <div className="glass-card rounded-2xl p-5 border border-blue-500/20 bg-blue-500/5">
            <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3">🇵🇭 Tagalog</p>
            {loadingTrans ? (
              <div className="h-6 bg-white/10 rounded animate-pulse w-32" />
            ) : tagalog ? (
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-white font-black text-2xl">{tagalog}</p>
                <button
                  onClick={() => router.push(`/search?word=${encodeURIComponent(tagalog)}`)}
                  className="text-xs bg-blue-500/15 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 px-3 py-1.5 rounded-full transition font-bold">
                  Search this →
                </button>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No translation found</p>
            )}
          </div>

          {/* Bisaya */}
          <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">🌴 Bisaya</p>
            {loadingTrans ? (
              <div className="h-6 bg-white/10 rounded animate-pulse w-32" />
            ) : bisaya ? (
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-white font-black text-2xl">{bisaya}</p>
                <button
                  onClick={() => router.push(`/search?word=${encodeURIComponent(bisaya)}`)}
                  className="text-xs bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 px-3 py-1.5 rounded-full transition font-bold">
                  Search this →
                </button>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No translation found</p>
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
              <div key={mi} className="glass-card rounded-3xl p-7 border border-white/10 shadow-xl">
                <p className="text-orange-400 font-black text-sm uppercase tracking-widest mb-4">{meaning.partOfSpeech}</p>
                <ol className="space-y-4">
                  {(meaning.definitions ?? []).slice(0, 4).map((def: any, di: number) => (
                    <li key={di} className="flex gap-4">
                      <span className="text-orange-500 font-black text-base flex-shrink-0">{di + 1}.</span>
                      <div>
                        <p className="text-white text-base leading-relaxed">{def.definition}</p>
                        {def.example && (
                          <p className="text-gray-400 text-sm italic mt-2">&ldquo;{def.example}&rdquo;</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {meaning.synonyms?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 font-semibold">Synonyms:</span>
                    {meaning.synonyms.slice(0, 6).map((s: string) => (
                      <Link key={s} href={`/search?word=${encodeURIComponent(s)}`}
                        className="text-sm bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/30 text-gray-400 hover:text-orange-300 px-3 py-1 rounded-full transition">
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center border border-white/10">
            <p className="text-gray-400 text-base">No definition found for <span className="text-white font-semibold">&ldquo;{word}&rdquo;</span>.</p>
            <p className="text-gray-600 text-sm mt-1">Try checking the spelling or search another word.</p>
          </div>
        )}

        <Link href="/" className="inline-block text-orange-400 hover:text-orange-300 transition text-sm mt-2">← Back to Home</Link>
      </div>
    </div>
  );
}
