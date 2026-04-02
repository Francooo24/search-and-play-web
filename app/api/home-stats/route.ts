import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [[words], [players], [games]] = await Promise.all([
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM dictionary"),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM players WHERE status = 'active'"),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM leaderboard"),
    ]);
    return NextResponse.json({
      words:   Number((words as RowDataPacket[])[0]?.total ?? 0),
      players: Number((players as RowDataPacket[])[0]?.total ?? 0),
      games:   Number((games as RowDataPacket[])[0]?.total ?? 0),
    });
  } catch {
    return NextResponse.json({ words: 0, players: 0, games: 0 });
  }
}
