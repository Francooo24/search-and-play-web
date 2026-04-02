import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`search:${ip}`, 30, 60_000)) return rateLimitResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false });

  const playerName = (session.user as any).name ?? "Unknown";
  const { word } = await req.json();
  if (!word) return NextResponse.json({ ok: false });

  await pool.query(
    "INSERT INTO activity_logs (player_name, activity) VALUES (?, ?)",
    [playerName, `Searched for "${word}"`]
  ).catch(() => {});

  return NextResponse.json({ ok: true });
}
