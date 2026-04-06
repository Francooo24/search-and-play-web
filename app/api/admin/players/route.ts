import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const limit  = 10;
  const offset = (page - 1) * limit;

  let players: any[], total: any[];

  if (search) {
    const like = `%${search}%`;
    ({ rows: players } = await pool.query(
      "SELECT id, player_name, email, created_at, status FROM players WHERE is_admin = false AND (player_name ILIKE $1 OR email ILIKE $2) ORDER BY created_at DESC LIMIT $3 OFFSET $4",
      [like, like, limit, offset]
    ));
    ({ rows: total } = await pool.query(
      "SELECT COUNT(*) AS total FROM players WHERE is_admin = false AND (player_name ILIKE $1 OR email ILIKE $2)",
      [like, like]
    ));
  } else {
    ({ rows: players } = await pool.query(
      "SELECT id, player_name, email, created_at, status FROM players WHERE is_admin = false ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    ));
    ({ rows: total } = await pool.query("SELECT COUNT(*) AS total FROM players WHERE is_admin = false"));
  }

  return NextResponse.json({ players, total: (total as any)[0].total, page, limit });
}
