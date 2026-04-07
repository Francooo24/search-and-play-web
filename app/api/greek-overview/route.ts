import { NextRequest, NextResponse } from "next/server";
import { searchGreekWords } from "@/lib/greekWords";

export const maxDuration = 30;

async function fetchFromOpenRouter(word: string, apiKey: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://search-and-play-web.vercel.app",
      "X-Title": "Search and Play",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: `You are a Greek language expert. When given any English word, respond in exactly this format:

The primary Greek word for [word] is [Greek word] ([transliteration]), which denotes [meaning]. [2-3 sentences explaining the word's meaning, usage, and significance in ancient or modern Greek context.]

Key Aspects of "[Greek transliteration]" ([Word]) in Greek:
Definition: [Full definition of the Greek word and its core meaning]
Active Meaning: [How the word is actively used in Greek texts or culture]
Related Words:
[Greek word 1] ([transliteration]): [part of speech], meaning "[meaning]".
[Greek word 2] ([transliteration]): [part of speech], meaning "[meaning]".
Contextual Usage: [How the word appears in Greek mythology, history, or the New Testament]
Root: [Etymology and Proto-Indo-European or Greek root of the word]

Always include Greek characters (e.g. πίστις). Always include transliteration in parentheses. Be detailed and educational.`,
        },
        {
          role: "user",
          content: `Give a detailed Greek language overview for the English word: "${word}"`,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function fetchTranslation(word: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|el`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return data?.responseData?.translatedText ?? "";
  } catch { return ""; }
}

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ overview: "" });

  const apiKey = process.env.OPENROUTER_API_KEY ?? "";

  // Try OpenRouter first
  if (apiKey) {
    try {
      const overview = await fetchFromOpenRouter(word, apiKey);
      if (overview) return NextResponse.json({ overview });
    } catch (err: any) {
      console.log("[greek-overview] OpenRouter failed:", err.message);
    }
  }

  // Fallback: build overview from local dictionary + free translation
  const matches = searchGreekWords(word);
  const translation = await fetchTranslation(word);

  if (matches.length > 0) {
    const m = matches[0];
    const overview = `The Greek word for "${word}" is ${m.greek} (${m.transliteration}), meaning "${m.english}".\n\nKey Aspects of "${m.transliteration}" (${word}) in Greek:\nDefinition: ${m.greek} (${m.transliteration}) — ${m.english}.\nCategory: This word belongs to the ${m.category} category in Greek.\nTransliteration: The romanized form is "${m.transliteration}", which helps with pronunciation.\nModern Greek: The modern Greek translation is ${translation || m.greek}.`;
    return NextResponse.json({ overview });
  }

  if (translation) {
    const overview = `The Greek translation of "${word}" is ${translation}.\n\nKey Aspects:\nDefinition: "${word}" translates to ${translation} in Greek.\nPronunciation: The word is written as ${translation} in the Greek alphabet.\nUsage: This word is used in modern Greek (Νέα Ελληνικά) in everyday conversation.`;
    return NextResponse.json({ overview });
  }

  return NextResponse.json({ overview: "" });
}
