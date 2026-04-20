import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as any).id;

  try {
    // Return ALL achievements with earned_at = null if not yet earned by this user
    const { rows } = await pool.query(
      `SELECT
         a.id, a.name, a.description, a.icon,
         a.condition_type, a.condition_value, a.game_specific,
         ua.earned_at
       FROM achievements a
       LEFT JOIN user_achievements ua
         ON a.id = ua.achievement_id AND ua.user_id = $1
       ORDER BY
         CASE WHEN ua.earned_at IS NOT NULL THEN 0 ELSE 1 END,
         ua.earned_at DESC NULLS LAST,
         a.id ASC`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
