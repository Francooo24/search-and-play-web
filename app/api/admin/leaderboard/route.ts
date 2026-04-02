import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT l.id, l.player_name, l.game, l.score, l.created_at, p.id as user_id
     FROM leaderboard l
     LEFT JOIN players p ON l.user_id = p.id
     ORDER BY l.created_at DESC
     LIMIT 100`
  );

  return NextResponse.json({ scores: rows });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await pool.query<ResultSetHeader>("DELETE FROM leaderboard WHERE id = ?", [id]);
  return NextResponse.json({ success: true });
}
