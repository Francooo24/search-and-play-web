import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { searchGreekWords, GreekWord } from "@/lib/greekWords";
import AudioButton from "@/components/AudioButton";
import LogSearch from "@/components/LogSearch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import SaveWordButton from "@/components/SaveWordButton";

export const dynamic = "force-dynamic";

async function fetchDefinition(word: string) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { cache: "no-store" });
    if (res.status === 404) return null;
    const data = await res.json();
    if (data?.title === "No Definitions Found") return null;
    return data;
  } catch {
    return null;
  }
}

async function translateToGreek(text: string): Promise<string> {
  // Try Google Translate first (fast, free)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=el&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const translated: string = data?.[0]?.[0]?.[0] ?? "";
    if (translated.trim()) return translated.trim().split(/\s+/)[0];
  } catch { /* fall through to OpenRouter */ }

  // Fallback: OpenRouter AI
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a Greek translator. Respond with ONLY the Greek word, nothing else." },
          { role: "user", content: `Translate to Greek: ${text}` }
        ],
      }),
      cache: "no-store",
    });
    const data = await res.json();
    const translated = data?.choices?.[0]?.message?.content ?? "";
    return translated.trim().split(/\s+/)[0] ?? "";
  } catch {
    return "";
  }
}

async function fetchGreekWordOverview(word: string): Promise<string> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a Greek language expert. When given an English word, provide a detailed Greek language overview in exactly this format:

**Translation:** [Greek word] ([transliteration]) — [English meaning] ([grammar note])

**Word Forms:** Singular: [form] | Plural: [form] | Genitive: [form]

**Related Words:** [word1] ([transliteration]) — [meaning] | [word2] ([transliteration]) — [meaning]

**Examples:**
- [Greek sentence] ([transliteration]) — [English translation]
- [Greek sentence] ([transliteration]) — [English translation]

**Key Phrases:**
- [phrase]: [Greek] ([transliteration])
- [phrase]: [Greek] ([transliteration])

**Cultural Note:** [1-2 sentences about cultural or historical significance]

Always use modern Greek. Always include transliteration in parentheses. Be accurate and educational.`
          },
          {
            role: "user",
            content: `Give a Greek language overview for the English word: "${word}"`
          }
        ],
      }),
      cache: "no-store",
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

function formatOverview(text: string) {
  return text
    .split(/\n\n/)
    .map((section, i) => (
      <div key={i} className="border-t border-white/10 pt-3 text-sm text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: section.replace(/\*\*(.+?)\*\*/g, '<span class="text-orange-400 font-semibold">$1</span>').replace(/\n/g, "<br/>") }}
      />
    ));
}

async function GreekOverview({ word, greekWord, greekMatches }: { word: string; greekWord: string; greekMatches: GreekWord[] }) {
  const greekOverview = await fetchGreekWordOverview(word);
  return (
    <div className="w-full max-w-3xl mb-6">
      <h2 className="text-lg font-semibold text-orange-400 mb-3">🏛️ Greek Word</h2>
      {greekMatches.length > 0 ? (
        <div className="flex flex-col gap-4">
          {greekMatches.map((w, i) => (
            <div key={i} className="glass-card border-l-4 border-l-amber-500 rounded-2xl p-5">
              <div className="text-2xl font-bold text-amber-400">{w.greek}</div>
              <div className="text-sm italic text-orange-300 mb-2">{w.transliteration}</div>
              <div className="text-gray-200">{w.english}</div>
              <span className="inline-block mt-3 text-xs bg-white/10 text-gray-400 px-3 py-1 rounded-full">{w.category}</span>
              {greekOverview && <div className="mt-3 space-y-3">{formatOverview(greekOverview)}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card border-l-4 border-l-amber-500 rounded-2xl p-5">
          <div className="text-2xl font-bold text-amber-400">{greekWord || word}</div>
          <div className="text-sm italic text-orange-300 mb-2">{word}</div>
          {greekOverview
            ? <div className="mt-3 space-y-3">{formatOverview(greekOverview)}</div>
            : <div className="text-gray-400 text-sm mt-1">Greek translation: {greekWord || "—"}</div>
          }
        </div>
      )}
    </div>
  );
}

function GreekOverviewSkeleton() {
  return (
    <div className="w-full max-w-3xl mb-6">
      <h2 className="text-lg font-semibold text-orange-400 mb-3">🏛️ Greek Word</h2>
      <div className="glass-card border-l-4 border-l-amber-500 rounded-2xl p-5 space-y-3 animate-pulse">
        <div className="h-7 w-32 bg-white/10 rounded-lg" />
        <div className="h-4 w-20 bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-5/6 bg-white/10 rounded" />
        <div className="h-4 w-4/6 bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-3/4 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ word?: string }> | { word?: string };
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const word = ((params?.word ?? "") as string).trim();
  if (!word) redirect("/");

  const session = await getServerSession(authOptions);
  let isSaved = false;
  if (session) {
    const userId = (session.user as any).id;
    const { rows } = await pool.query(
      "SELECT id FROM favorite_words WHERE user_id = $1 AND word = $2 LIMIT 1",
      [userId, word]
    );
    isSaved = rows.length > 0;
  }

  const greekMatches: GreekWord[] = searchGreekWords(word);

  const [data, greekWord] = await Promise.all([
    fetchDefinition(word),
    translateToGreek(word),
  ]);

  const phonetic = data?.[0]?.phonetic ?? "";
  const origin   = data?.[0]?.origin ?? "";

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 py-8 md:py-12 relative z-10">
      <LogSearch word={word} />
      {/* Search bar */}
      <form action="/search" method="GET" className="flex w-full max-w-lg mb-8">
        <input name="word" defaultValue={word} placeholder="Search another word..."
          className="flex-grow px-4 py-3 text-base rounded-l-lg focus:outline-none bg-white/5 border border-white/10 text-white focus:border-orange-500 transition" />
        <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-base font-medium rounded-r-lg hover:from-orange-600 hover:to-amber-600 transition">Search</button>
      </form>

      {/* Word header */}
      <h1 className="text-4xl md:text-5xl font-bold text-amber-400 tracking-tight mb-1 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        {greekWord || word}
      </h1>
      <p className="text-orange-300 font-medium text-lg mb-2 text-center">{word}</p>
      {greekWord && greekWord !== word && (
        <p className="text-gray-400 text-sm mb-2 text-center">Greek: <span className="text-amber-400 font-semibold">{greekWord}</span></p>
      )}
      {session && (
        <div className="flex justify-center mb-6">
          <SaveWordButton word={word} initialSaved={isSaved} />
        </div>
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

      <Suspense fallback={<GreekOverviewSkeleton />}>
        <GreekOverview word={word} greekWord={greekWord} greekMatches={greekMatches} />
      </Suspense>

      {/* English Definition */}
      {data ? (
        <div className="w-full max-w-3xl mb-6">
          <h2 className="text-lg font-semibold text-orange-400 mb-3">📖 English Definition</h2>
          {data[0]?.meanings?.map((meaning: any, mi: number) => (
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
