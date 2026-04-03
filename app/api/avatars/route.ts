import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { names } = await req.json().catch(() => ({ names: [] }));
  if (!Array.isArray(names) || names.length === 0)
    return NextResponse.json({ avatars: {} });

  const safe = names.slice(0, 50); // max 50 at once
  const placeholders = safe.map(() => "?").join(",");

  const [rows] = await (pool as any).query(
    `SELECT player_name, avatar_url FROM players WHERE player_name IN (${placeholders}) AND avatar_url IS NOT NULL`,
    safe
  ).catch(() => [[]]);

  const avatars: Record<string, string> = {};
  for (const row of rows as any[]) {
    if (row.avatar_url) avatars[row.player_name] = row.avatar_url;
  }

  return NextResponse.json({ avatars });
}
