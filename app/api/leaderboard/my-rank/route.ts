import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ rank: null });

  const userId = (session.user as any).id;

  try {
    // Get user's total score and best single score
    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(SUM(score), 0) AS total, COALESCE(MAX(score), 0) AS best, (SELECT game FROM leaderboard WHERE user_id = ? ORDER BY score DESC LIMIT 1) AS best_game FROM leaderboard WHERE user_id = ?",
      [userId, userId]
    );
    const userTotal = Number((userRows as any)[0]?.total ?? 0);
    const userBest  = Number((userRows as any)[0]?.best ?? 0);
    const bestGame  = (userRows as any)[0]?.best_game ?? null;
    if (userTotal === 0) return NextResponse.json({ rank: null, total: 0, best: 0, best_game: null });

    // Count how many non-admin players have a higher total score
    const [rankRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT l.user_id) + 1 AS rank
       FROM leaderboard l
       JOIN players p ON l.user_id = p.id
       WHERE l.user_id != ? AND p.is_admin = 0
       GROUP BY l.user_id
       HAVING SUM(l.score) > ?`,
      [userId, userTotal]
    );

    // rankRows length = number of players ahead of user
    const rank = (rankRows as RowDataPacket[]).length + 1;

    // Total ranked non-admin players
    const [totalRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT l.user_id) AS total FROM leaderboard l JOIN players p ON l.user_id = p.id WHERE p.is_admin = 0"
    );
    const totalPlayers = Number((totalRows as any)[0]?.total ?? 0);

    return NextResponse.json({ rank, total: totalPlayers, score: userTotal, best: userBest, best_game: bestGame });
  } catch {
    return NextResponse.json({ rank: null });
  }
}
