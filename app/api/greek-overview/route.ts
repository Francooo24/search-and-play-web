import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ overview: "" });

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

    const data = await res.json();
    const overview = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ overview });
  } catch (err: any) {
    return NextResponse.json({ overview: "", error: err.message });
  }
}
