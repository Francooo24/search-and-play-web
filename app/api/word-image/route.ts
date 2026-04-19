import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ url: null });

  // 1. Wikipedia — most accurate for dictionary words (apple = apple, elephant = elephant)
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const url = data?.thumbnail?.source || data?.originalimage?.source || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  // 2. Pixabay — good for general words
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

  // 3. Pexels — best for NBA players, athletes, sports names
  try {
    const key = process.env.PEXELS_API_KEY;
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(word)}&per_page=1`,
      { headers: { Authorization: key ?? "" }, cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const url = data?.photos?.[0]?.src?.large || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  return NextResponse.json({ url: null });
}
