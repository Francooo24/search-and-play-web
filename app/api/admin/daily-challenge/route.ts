import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

  const { rows } = await pool.query(
    "SELECT * FROM daily_challenges ORDER BY challenge_date DESC"
  );
  return NextResponse.json({ challenges: rows });
}

// POST — create a new challenge
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = adminGuard(session);
  if (guard) return guard;

  const { challenge_date, game, title, description, target_type, target_value, bonus_points, age_group } =
    await req.json();

  if (!challenge_date || !game || !title)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  await pool.query(
    "ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS age_group VARCHAR(10) NULL DEFAULT NULL"
  ).catch(() => {});

  const { rows: inserted } = await pool.query(
    `INSERT INTO daily_challenges (challenge_date, game, title, description, target_type, target_value, bonus_points, age_group)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [challenge_date, game, title, description ?? "", target_type ?? "win", target_value ?? 1, bonus_points ?? 50, age_group ?? null]
  );
  return NextResponse.json({ ok: true, id: inserted[0].id });
}

// PUT — update an existing challenge
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = adminGuard(session);
  if (guard) return guard;

  const { id, challenge_date, game, title, description, target_type, target_value, bonus_points, age_group } =
    await req.json();

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await pool.query(
    `UPDATE daily_challenges SET challenge_date=$1, game=$2, title=$3, description=$4, target_type=$5, target_value=$6, bonus_points=$7, age_group=$8
     WHERE id=$9`,
    [challenge_date, game, title, description ?? "", target_type ?? "win", target_value ?? 1, bonus_points ?? 50, age_group ?? null, id]
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

  await pool.query("DELETE FROM daily_challenges WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
