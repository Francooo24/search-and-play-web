import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.DJANGO_URL ?? "http://localhost:8000"}/api/leaderboard/`,
      { signal: AbortSignal.timeout(2000) }
    );
    return NextResponse.json({ online: true, status: res.status });
  } catch {
    return NextResponse.json({ online: false });
  }
}
