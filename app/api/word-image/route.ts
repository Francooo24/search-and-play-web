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

  // 3. Wikimedia Commons image search
  try {
    const res = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(word)}&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    const url = page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url || null;
    if (url) return NextResponse.json({ url });
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

  // 5. Pixabay fallback
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
