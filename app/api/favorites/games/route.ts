import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as any).id;
  try {
    const { rows } = await pool.query(
      "SELECT game FROM favorite_games WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return NextResponse.json(rows);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const userId = (session.user as any).id;
  const { action, game } = await req.json();

  if (!game || !["save", "remove"].includes(action))
    return NextResponse.json({ success: false }, { status: 400 });

  try {
    if (action === "save") {
      await pool.query(
        "INSERT INTO favorite_games (user_id, game, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING",
        [userId, game]
      );
      return NextResponse.json({ success: true, saved: true });
    } else {
      await pool.query(
        "DELETE FROM favorite_games WHERE user_id = $1 AND game = $2",
        [userId, game]
      );
      return NextResponse.json({ success: true, saved: false });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
