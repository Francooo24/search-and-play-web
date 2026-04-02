import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`tts:${ip}`, 20, 60_000))
    return rateLimitResponse();

  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") ?? "").slice(0, 300);
  const lang = (searchParams.get("lang") ?? "en").replace(/[^a-z-]/gi, "").slice(0, 10) || "en";

  if (!text) return new NextResponse("Missing text", { status: 400 });

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });
    if (!res.ok) return new NextResponse("Failed", { status: 502 });
    const buffer = await res.arrayBuffer();
    if (!buffer.byteLength) return new NextResponse("Empty", { status: 502 });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("TTS error", { status: 500 });
  }
}
