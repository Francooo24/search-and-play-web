import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { isValidSlug } from "@/lib/validate";
import { RowDataPacket } from "mysql2";

// GET — return all game enabled/disabled states
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await pool.query(`CREATE TABLE IF NOT EXISTS game_settings (slug VARCHAR(64) PRIMARY KEY, enabled TINYINT(1) NOT NULL DEFAULT 1)`);
  const [rows] = await pool.query<RowDataPacket[]>("SELECT slug, enabled FROM game_settings");
  const map: Record<string, boolean> = {};
  for (const r of rows) map[r.slug] = !!r.enabled;
  return NextResponse.json({ settings: map });
}

// POST — toggle a game on/off
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, enabled } = await req.json();
  if (!isValidSlug(slug))
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  await pool.query(`CREATE TABLE IF NOT EXISTS game_settings (slug VARCHAR(64) PRIMARY KEY, enabled TINYINT(1) NOT NULL DEFAULT 1)`);
  await pool.query(
    "INSERT INTO game_settings (slug, enabled) VALUES (?, ?) ON DUPLICATE KEY UPDATE enabled = ?",
    [slug, enabled ? 1 : 0, enabled ? 1 : 0]
  );
  return NextResponse.json({ ok: true });
}
