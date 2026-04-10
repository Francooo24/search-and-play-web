import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ url: null });

  const pexelsKey = process.env.PEXELS_API_KEY;

  // 1. Pexels — beautiful, relevant, safe photos
  if (pexelsKey) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(word)}&per_page=1&orientation=landscape`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(6000),
          headers: { Authorization: pexelsKey },
        }
      );
      const data = await res.json();
      const photo = data?.photos?.[0];
      if (photo?.src?.large2x) return NextResponse.json({ url: photo.src.large2x });
      if (photo?.src?.large)   return NextResponse.json({ url: photo.src.large });
    } catch {}
  }

  // 2. Wikipedia summary image
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const url = data?.originalimage?.source || data?.thumbnail?.source || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  // 3. Wikimedia Commons
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=pageimages&format=json&pithumbsize=800&origin=*`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    const url = page?.thumbnail?.source || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  return NextResponse.json({ url: null });
}
