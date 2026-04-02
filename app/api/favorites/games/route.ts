import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { djangoProxy, djangoInternalHeaders } from "@/lib/djangoProxy";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([]);
  const userId = (session.user as any).id;
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT game FROM favorite_games WHERE user_id = ?", [userId]
    );
    return NextResponse.json(rows);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const playerId = (session.user as any).id;
  const body = await req.json();
  return djangoProxy(
    "/api/games/favorites/games/",
    { method: "POST", headers: djangoInternalHeaders(playerId), body: JSON.stringify(body) }
  );
}
