import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { isValidSlug } from "@/lib/validate";

// GET — return all game enabled/disabled states
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await pool.query(`CREATE TABLE IF NOT EXISTS game_settings (slug VARCHAR(64) PRIMARY KEY, enabled BOOLEAN NOT NULL DEFAULT TRUE)`);
  const { rows } = await pool.query("SELECT slug, enabled FROM game_settings");
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

  await pool.query(`CREATE TABLE IF NOT EXISTS game_settings (slug VARCHAR(64) PRIMARY KEY, enabled BOOLEAN NOT NULL DEFAULT TRUE)`);
  await pool.query(
    "INSERT INTO game_settings (slug, enabled) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET enabled = $2",
    [slug, enabled]
  );
  return NextResponse.json({ ok: true });
}
