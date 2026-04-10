import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word") ?? "";
  if (!word) return NextResponse.json({ url: null });

  // 1. Wikipedia summary image — most relevant
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const url = data?.originalimage?.source || data?.thumbnail?.source || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  // 2. Wikimedia Commons search
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    const url = page?.thumbnail?.source || null;
    if (url) return NextResponse.json({ url });
  } catch {}

  // 3. Openverse — free, no key needed
  try {
    const res = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(word)}&page_size=1&mature=false`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "SearchAndPlay/1.0" },
      }
    );
    const data = await res.json();
    const img = data?.results?.[0]?.url || null;
    if (img) return NextResponse.json({ url: img });
  } catch {}

  // 4. Wikidata image
  try {
    const res = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(word)}&language=en&format=json&origin=*&limit=1`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const id = data?.search?.[0]?.id;
    if (id) {
      const res2 = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${id}&property=P18&format=json&origin=*`,
        { cache: "no-store", signal: AbortSignal.timeout(4000) }
      );
      const data2 = await res2.json();
      const filename = data2?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
      if (filename) {
        const encoded = encodeURIComponent(filename.replace(/ /g, "_"));
        const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=800`;
        return NextResponse.json({ url });
      }
    }
  } catch {}

  return NextResponse.json({ url: null });
}
