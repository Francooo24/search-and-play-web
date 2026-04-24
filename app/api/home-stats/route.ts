import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [playersRes, playsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM players WHERE status = 'active' AND is_admin = FALSE"),
      pool.query("SELECT COUNT(*) AS total FROM leaderboard"),
    ]);
    return NextResponse.json({
      plays:   Number(playsRes.rows[0]?.total ?? 0),
      players: Number(playersRes.rows[0]?.total ?? 0),
      games:   45,
    });
  } catch (err) {
    console.error("[home-stats] error:", err);
    return NextResponse.json({ plays: 0, players: 0, games: 45 });
  }
}
