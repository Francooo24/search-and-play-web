import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { avatar } = await req.json();

  if (!avatar) return NextResponse.json({ error: "No image provided" }, { status: 400 });

  // Validate it's a base64 image and limit to ~2MB
  if (!avatar.startsWith("data:image/")) return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
  if (avatar.length > 2_800_000) return NextResponse.json({ error: "Image too large. Max 2MB." }, { status: 400 });

  await pool.query(
    "ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_url TEXT"
  ).catch(() => {});

  await pool.query(
    "UPDATE players SET avatar_url = $1 WHERE id = $2",
    [avatar, userId]
  );

  return NextResponse.json({ ok: true, avatar });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ avatar: null });

  const userId = (session.user as any).id;

  const { rows } = await pool.query(
    "SELECT avatar_url FROM players WHERE id = $1 LIMIT 1",
    [userId]
  ).catch(() => ({ rows: [{ avatar_url: null }] }));

  return NextResponse.json({ avatar: rows[0]?.avatar_url ?? null });
}
