import { NextRequest } from "next/server";
import { djangoProxy } from "@/lib/djangoProxy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  return djangoProxy(`/api/leaderboard/${search}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-store" },
  });
}
