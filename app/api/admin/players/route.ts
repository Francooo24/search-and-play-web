import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const limit  = 10;
  const offset = (page - 1) * limit;

  let players: RowDataPacket[], total: RowDataPacket[];

  if (search) {
    const like = `%${search}%`;
    [players] = await pool.query<RowDataPacket[]>(
      "SELECT id, player_name, email, created_at, status FROM players WHERE is_admin = 0 AND (player_name LIKE ? OR email LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [like, like, limit, offset]
    );
    [total] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM players WHERE is_admin = 0 AND (player_name LIKE ? OR email LIKE ?)",
      [like, like]
    );
  } else {
    [players] = await pool.query<RowDataPacket[]>(
      "SELECT id, player_name, email, created_at, status FROM players WHERE is_admin = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    [total] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM players WHERE is_admin = 0");
  }

  return NextResponse.json({ players, total: (total as any)[0].total, page, limit });
}
