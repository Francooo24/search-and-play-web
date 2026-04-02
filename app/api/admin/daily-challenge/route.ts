import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

function adminGuard(session: any) {
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

// GET — list all challenges
export async function GET() {
  const session = await getServerSession(authOptions);
  const guard = adminGuard(session);
  if (guard) return guard;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM daily_challenges ORDER BY challenge_date DESC"
  );
  return NextResponse.json({ challenges: rows });
}

// POST — create a new challenge
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = adminGuard(session);
  if (guard) return guard;

  const { challenge_date, game, title, description, target_type, target_value, bonus_points } =
    await req.json();

  if (!challenge_date || !game || !title)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO daily_challenges (challenge_date, game, title, description, target_type, target_value, bonus_points)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [challenge_date, game, title, description ?? "", target_type ?? "win", target_value ?? 1, bonus_points ?? 50]
  );
  return NextResponse.json({ ok: true, id: result.insertId });
}

// PUT — update an existing challenge
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = adminGuard(session);
  if (guard) return guard;

  const { id, challenge_date, game, title, description, target_type, target_value, bonus_points } =
    await req.json();

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await pool.query(
    `UPDATE daily_challenges SET challenge_date=?, game=?, title=?, description=?, target_type=?, target_value=?, bonus_points=?
     WHERE id=?`,
    [challenge_date, game, title, description ?? "", target_type ?? "win", target_value ?? 1, bonus_points ?? 50, id]
  );
  return NextResponse.json({ ok: true });
}

// DELETE — remove a challenge
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = adminGuard(session);
  if (guard) return guard;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await pool.query("DELETE FROM daily_challenges WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
