import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ challenge: null, streak: 0, history: [] });

  const playerId = (session.user as any).id;
  const today = new Date().toISOString().split("T")[0];

  try {
    const { rows: challengeRows } = await pool.query(
      "SELECT * FROM daily_challenges WHERE challenge_date = $1 LIMIT 1",
      [today]
    );
    const challenge = challengeRows[0] ?? null;
    if (!challenge) return NextResponse.json({ challenge: null, streak: 0, history: [] });

    const { rows: completedRows } = await pool.query(
      "SELECT id FROM daily_challenge_completions WHERE player_id = $1 AND challenge_id = $2 LIMIT 1",
      [playerId, challenge.id]
    );
    const completed = completedRows.length > 0;

    const { rows: progressRows } = await pool.query(
      "SELECT COUNT(*) as count FROM leaderboard WHERE user_id = $1 AND game = $2 AND DATE(created_at) = $3",
      [playerId, challenge.game, today]
    );
    const progress = Number(progressRows[0]?.count ?? 0);
    const can_claim = !completed && progress >= challenge.target_value;

    let streak = 0;
    const { rows: dateRows } = await pool.query(
      `SELECT DISTINCT dc.challenge_date
       FROM daily_challenge_completions dcc
       JOIN daily_challenges dc ON dcc.challenge_id = dc.id
       WHERE dcc.player_id = $1
       ORDER BY dc.challenge_date DESC`,
      [playerId]
    );
    const checkDate = new Date(); checkDate.setHours(0, 0, 0, 0);
    for (const row of dateRows) {
      const d = new Date(row.challenge_date); d.setHours(0, 0, 0, 0);
      const expected = new Date(checkDate); expected.setDate(checkDate.getDate() - streak);
      if (d.getTime() === expected.getTime()) streak++;
      else break;
    }

    const { rows: historyRows } = await pool.query(
      `SELECT dc.challenge_date, dc.game, dc.title, dc.bonus_points, dcc.completed_at
       FROM daily_challenge_completions dcc
       JOIN daily_challenges dc ON dcc.challenge_id = dc.id
       WHERE dcc.player_id = $1
       ORDER BY dcc.completed_at DESC LIMIT 7`,
      [playerId]
    );

    return NextResponse.json({
      challenge: {
        id: challenge.id, game: challenge.game, title: challenge.title,
        description: challenge.description, target_value: challenge.target_value,
        bonus_points: challenge.bonus_points,
      },
      completed, progress, can_claim, streak,
      history: historyRows.map(r => ({
        challenge_date: String(r.challenge_date),
        game: r.game, title: r.title,
        bonus_points: r.bonus_points,
        completed_at: r.completed_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ challenge: null, streak: 0, history: [], error: err.message });
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = (session.user as any).id;
  const playerName = (session.user as any).name ?? "Unknown";
  const today = new Date().toISOString().split("T")[0];

  try {
    const { rows: challengeRows } = await pool.query(
      "SELECT * FROM daily_challenges WHERE challenge_date = $1 LIMIT 1", [today]
    );
    const challenge = challengeRows[0];
    if (!challenge) return NextResponse.json({ error: "No challenge today" }, { status: 404 });

    const { rows: existing } = await pool.query(
      "SELECT id FROM daily_challenge_completions WHERE player_id = $1 AND challenge_id = $2 LIMIT 1",
      [playerId, challenge.id]
    );
    if (existing.length > 0) return NextResponse.json({ error: "Already claimed" }, { status: 400 });

    const { rows: progressRows } = await pool.query(
      "SELECT COUNT(*) as count FROM leaderboard WHERE user_id = $1 AND game = $2 AND DATE(created_at) = $3",
      [playerId, challenge.game, today]
    );
    const progress = Number(progressRows[0]?.count ?? 0);
    if (progress < challenge.target_value)
      return NextResponse.json({ error: "Challenge not completed yet" }, { status: 400 });

    await pool.query(
      "INSERT INTO daily_challenge_completions (player_id, challenge_id, completed_at) VALUES ($1, $2, NOW())",
      [playerId, challenge.id]
    );
    await pool.query(
      "INSERT INTO leaderboard (user_id, player_name, game, score, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [playerId, playerName, "Daily Challenge", challenge.bonus_points]
    );

    return NextResponse.json({ success: true, bonus_points: challenge.bonus_points });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
