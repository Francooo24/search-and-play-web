import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ url: null });

  try {
    const key = process.env.PIXABAY_API_KEY;
    const res = await fetch(
      `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(word)}&image_type=photo&per_page=3&safesearch=true`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const url = data?.hits?.[0]?.webformatURL || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  return NextResponse.json({ url: null });
}
