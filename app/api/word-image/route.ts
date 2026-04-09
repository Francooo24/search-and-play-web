import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ url: null });

  const apiKey = process.env.PIXABAY_API_KEY;

  if (apiKey && apiKey !== "your_pixabay_api_key_here") {
    try {
      const res = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(word)}&image_type=photo&orientation=horizontal&min_width=800&safesearch=true&per_page=3`,
        { cache: "no-store", signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      const hit = data?.hits?.[0];
      if (hit?.largeImageURL) return NextResponse.json({ url: hit.largeImageURL });
    } catch {}
  }

  // Fallback: Wikipedia
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const url = data?.originalimage?.source || data?.thumbnail?.source || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  return NextResponse.json({ url: null });
}
