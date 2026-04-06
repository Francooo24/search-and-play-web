import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.DJANGO_URL ?? "https://search-and-play-backend.onrender.com"}/api/leaderboard/`,
      { signal: AbortSignal.timeout(8000) }
    );
    return NextResponse.json({ online: true, status: res.status });
  } catch {
    return NextResponse.json({ online: false });
  }
}
