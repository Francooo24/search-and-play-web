import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ url: null });

  // 1. Openverse (WordPress) — free, no API key, safe images
  try {
    const res = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(word)}&page_size=5&mature=false`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "SearchAndPlay/1.0" },
      }
    );
    const data = await res.json();
    const results = data?.results ?? [];
    // Pick image with highest resolution
    const best = results.find((r: any) => r.url && r.width > 600) || results[0];
    if (best?.url) return NextResponse.json({ url: best.url });
  } catch {}

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
