import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Always return total players count (public)
  const { rows: totalRows } = await pool.query(
    `SELECT COUNT(*) AS total
     FROM (
       SELECT l.user_id
       FROM leaderboard l
       JOIN players p ON l.user_id = p.id
       WHERE p.is_admin = false
       GROUP BY l.user_id
     ) sub`
  );
  const totalPlayers = Number((totalRows as any)[0]?.total ?? 0);

  if (!session?.user) return NextResponse.json({ rank: null, total: totalPlayers });

  const userId = (session.user as any).id;

  try {
    // Get user's total score and best single score
    const { rows: userRows } = await pool.query(
      `SELECT COALESCE(SUM(score), 0) AS total, COALESCE(MAX(score), 0) AS best
       FROM leaderboard WHERE user_id = $1`,
      [userId]
    );
    const userTotal = Number(userRows[0]?.total ?? 0);
    const userBest  = Number(userRows[0]?.best ?? 0);
    // Check if user has played any game at all
    const { rows: playedRows } = await pool.query(
      `SELECT COUNT(*) AS games FROM leaderboard WHERE user_id = $1`,
      [userId]
    );
    const gamesPlayed = Number(playedRows[0]?.games ?? 0);
    if (gamesPlayed === 0) return NextResponse.json({ rank: null, total: totalPlayers, best: 0, best_game: null, streak: 0 });
    // Fetch best game separately (the game where user scored highest)
    const { rows: bestGameRows } = await pool.query(
      `SELECT game FROM leaderboard WHERE user_id = $1 ORDER BY score DESC LIMIT 1`,
      [userId]
    );
    const bestGame = bestGameRows[0]?.game ?? null;

    // Compute win streak — consecutive distinct days played up to today
    const { rows: dateRows } = await pool.query(
      "SELECT DISTINCT DATE(created_at) AS day FROM leaderboard WHERE user_id = $1 ORDER BY day DESC",
      [userId]
    );
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < dateRows.length; i++) {
      const day = new Date(dateRows[i].day);
      day.setHours(0, 0, 0, 0);
      const expected = new Date(today); expected.setDate(today.getDate() - i);
      if (day.getTime() === expected.getTime()) streak++;
      else break;
    }

    // Count how many non-admin players have a higher total score
    const { rows: rankRows } = await pool.query(
      `SELECT COUNT(*) AS ahead
       FROM (
         SELECT l.user_id
         FROM leaderboard l
         JOIN players p ON l.user_id = p.id
         WHERE l.user_id != $1 AND p.is_admin = false
         GROUP BY l.user_id
         HAVING SUM(l.score) > $2
       ) sub`,
      [userId, userTotal]
    );

    const rank = Number(rankRows[0]?.ahead ?? 0) + 1;

    // Total ranked non-admin players — already computed above

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
