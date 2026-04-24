import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [playersRes, wordsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM players WHERE status = 'active'"),
      pool.query("SELECT COUNT(DISTINCT LOWER(REPLACE(activity, 'Searched for \"', ''))) AS total FROM activity_logs WHERE activity LIKE 'Searched for %'"),
    ]);
    return NextResponse.json({
      words:   Number(wordsRes.rows[0]?.total ?? 0),
      players: Number(playersRes.rows[0]?.total ?? 0),
      games:   45,
    });
  } catch (err) {
    console.error("[home-stats] error:", err);
    return NextResponse.json({ words: 0, players: 0, games: 45 });
  }
}
