import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false });

  const playerName = (session.user as any).name ?? "Unknown";
  const { activity } = await req.json();
  if (!activity) return NextResponse.json({ ok: false });

  await pool.query(
    "INSERT INTO activity_logs (player_name, activity) VALUES (?, ?)",
    [playerName, activity]
  ).catch(() => {});

  return NextResponse.json({ ok: true });
}
