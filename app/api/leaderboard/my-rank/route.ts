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
    if (userTotal === 0) return NextResponse.json({ rank: null, total: 0, best: 0, best_game: null, streak: 0 });

    // Compute win streak — consecutive distinct days played up to today
    const [dateRows] = await pool.query<RowDataPacket[]>(
      "SELECT DISTINCT DATE(created_at) AS day FROM leaderboard WHERE user_id = ? ORDER BY day DESC",
      [userId]
    );
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < (dateRows as RowDataPacket[]).length; i++) {
      const day = new Date((dateRows as RowDataPacket[])[i].day);
      day.setHours(0, 0, 0, 0);
      const expected = new Date(today); expected.setDate(today.getDate() - i);
      if (day.getTime() === expected.getTime()) streak++;
      else break;
    }

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

    // Rank tier
    const TIERS = [
      { name: "Novice",      min: 0,     max: 99,    icon: "🌱" },
      { name: "Explorer",    min: 100,   max: 499,   icon: "🗺️" },
      { name: "Adventurer",  min: 500,   max: 1499,  icon: "⚔️" },
      { name: "Champion",    min: 1500,  max: 4999,  icon: "🏆" },
      { name: "Master",      min: 5000,  max: 14999, icon: "👑" },
      { name: "Grandmaster", min: 15000, max: 49999, icon: "💎" },
      { name: "Legend",      min: 50000, max: 0,     icon: "🌟" },
    ];
    const tier     = [...TIERS].reverse().find(t => userTotal >= t.min) ?? TIERS[0];
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] ?? null;
    const tierProgress = tier.max === 0 ? 100
      : Math.min(100, Math.round(((userTotal - tier.min) / (tier.max - tier.min + 1)) * 100));

    return NextResponse.json({ rank, total: totalPlayers, score: userTotal, best: userBest, best_game: bestGame, streak, tier, nextTier, tierProgress });
  } catch {
    return NextResponse.json({ rank: null });
  }
}
