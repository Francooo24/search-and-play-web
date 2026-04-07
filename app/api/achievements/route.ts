import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as any).id;

  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.name, a.description, a.icon, a.condition_type, a.condition_value,
              a.game_specific, ua.earned_at
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = $1
       ORDER BY ua.earned_at DESC`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
