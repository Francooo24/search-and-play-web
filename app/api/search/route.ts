import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ history: [] });

  const playerName = (session.user as any).name ?? "";
  const [rows] = await (pool as any).query(
    "SELECT id, activity, created_at FROM activity_logs WHERE player_name = ? AND activity LIKE 'Searched for %' ORDER BY created_at DESC LIMIT 50",
    [playerName]
  ).catch(() => [[]]);

  const history = (rows as any[]).map(r => ({
    id: r.id,
    word: r.activity.replace(/^Searched for "(.+)"$/, "$1"),
    created_at: r.created_at,
  }));

  return NextResponse.json({ history });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false });

  const playerName = (session.user as any).name ?? "";
  const { id } = await req.json().catch(() => ({}));

  if (id) {
    await (pool as any).query(
      "DELETE FROM activity_logs WHERE id = ? AND player_name = ? AND activity LIKE 'Searched for %'",
      [id, playerName]
    ).catch(() => {});
  } else {
    await (pool as any).query(
      "DELETE FROM activity_logs WHERE player_name = ? AND activity LIKE 'Searched for %'",
      [playerName]
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`search:${ip}`, 30, 60_000)) return rateLimitResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false });

  const playerName = (session.user as any).name ?? "Unknown";
  const { word } = await req.json();
  if (!word) return NextResponse.json({ ok: false });

  await pool.query(
    "INSERT INTO activity_logs (player_name, activity) VALUES (?, ?)",
    [playerName, `Searched for "${word}"`]
  ).catch(() => {});

  return NextResponse.json({ ok: true });
}
