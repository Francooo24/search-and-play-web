import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ url: null });

  const encoded = encodeURIComponent(word.toLowerCase().trim());

  // 1. Wikipedia — exact match for the word itself
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    // Only use if the Wikipedia title closely matches the searched word
    const title = (data?.title ?? "").toLowerCase();
    const url = data?.thumbnail?.source || data?.originalimage?.source || null;
    if (url && (title.includes(word.toLowerCase()) || word.toLowerCase().includes(title))) {
      return NextResponse.json({ url });
    }
  } catch {}

  // 2. Pixabay — exact word query
  try {
    const key = process.env.PIXABAY_API_KEY;
    const res = await fetch(
      `https://pixabay.com/api/?key=${key}&q=${encoded}&image_type=photo&per_page=5&safesearch=true&order=popular`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    // Pick the hit whose tags most closely match the word
    const hit = data?.hits?.find((h: any) =>
      h.tags?.toLowerCase().split(", ").some((t: string) => t.includes(word.toLowerCase()) || word.toLowerCase().includes(t))
    ) || data?.hits?.[0] || null;
    const url = hit?.webformatURL || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  // 3. Pexels — fallback for people, athletes, sports
  try {
    const key = process.env.PEXELS_API_KEY;
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encoded}&per_page=1`,
      { headers: { Authorization: key ?? "" }, cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const url = data?.photos?.[0]?.src?.large || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  return NextResponse.json({ url: null });
}
