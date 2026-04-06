import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [wordsRes, playersRes, gamesRes] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM dictionary"),
      pool.query("SELECT COUNT(*) AS total FROM players WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) AS total FROM leaderboard"),
    ]);
    return NextResponse.json({
      words:   Number(wordsRes.rows[0]?.total ?? 0),
      players: Number(playersRes.rows[0]?.total ?? 0),
      games:   Number(gamesRes.rows[0]?.total ?? 0),
    });
  } catch {
    return NextResponse.json({ words: 0, players: 0, games: 0 });
  }
}
