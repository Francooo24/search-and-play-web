import { NextRequest } from "next/server";
import { djangoProxy } from "@/lib/djangoProxy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;

  // First attempt
  const res = await djangoProxy(`/api/leaderboard/${search}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-store" },
  });

  // If backend is waking up (503), wait 5s and retry once
  const body = await res.json().catch(() => ({}));
  if (res.status === 503) {
    await new Promise(r => setTimeout(r, 5000));
    return djangoProxy(`/api/leaderboard/${search}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new Response(JSON.stringify(body), {
    status: res.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
