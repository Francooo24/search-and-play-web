import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Total plays per game
    const [playsPerGame] = await pool.query<RowDataPacket[]>(
      `SELECT game, COUNT(*) AS plays, MAX(score) AS top_score, AVG(score) AS avg_score
       FROM leaderboard GROUP BY game ORDER BY plays DESC`
    );

    // Top players overall
    const [topPlayers] = await pool.query<RowDataPacket[]>(
      `SELECT player_name, SUM(score) AS total_score, COUNT(*) AS games_played
       FROM leaderboard GROUP BY player_name ORDER BY total_score DESC LIMIT 10`
    );

    // Plays per day (last 7 days)
    const dailyPlays: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS total FROM leaderboard WHERE DATE(created_at) = ?",
        [dateStr]
      );
      dailyPlays.push({ label, count: (rows as any)[0].total });
    }

    // Most played game
    const mostPlayed = (playsPerGame as any)[0]?.game ?? "N/A";
    const totalPlays = (playsPerGame as any[]).reduce((s, r) => s + Number(r.plays), 0);
    const totalGamesCount = (playsPerGame as any[]).length;

    return NextResponse.json({ playsPerGame, topPlayers, dailyPlays, mostPlayed, totalPlays, totalGamesCount });
  } catch (err) {
    console.error("[admin/gamestats] error:", err);
    return NextResponse.json({ playsPerGame: [], topPlayers: [], dailyPlays: [], mostPlayed: "N/A", totalPlays: 0, totalGamesCount: 0 });
  }
}
