import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ notifications: [] });

  const playerName = (session.user as any).name ?? "";
  const since = req.nextUrl.searchParams.get("since");

  const [rows] = await (pool as any).query(
    "SELECT id, activity, created_at FROM activity_logs WHERE player_name = ? ORDER BY created_at DESC LIMIT 20",
    [playerName]
  ).catch(() => [[]] as any);

  // If "since" param provided, also return unread count
  let unread = 0;
  if (since) {
    unread = (rows as any[]).filter((r: any) => new Date(r.created_at) > new Date(since)).length;
  }

  return NextResponse.json({ notifications: rows, unread });
}
