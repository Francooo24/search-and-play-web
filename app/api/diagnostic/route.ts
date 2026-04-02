import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { djangoProxy, djangoInternalHeaders } from "@/lib/djangoProxy";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  const results: Record<string, { ok: boolean; detail: string }> = {};

  // 1. Session check
  const session = await getServerSession(authOptions);
  results["1_session"] = session?.user
    ? { ok: true, detail: `Logged in as ${(session.user as any).name} (id: ${(session.user as any).id})` }
    : { ok: false, detail: "Not logged in — sign in first then visit this URL" };

  // Admin guard — only admins can run diagnostics
  if (!(session?.user as any)?.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // Clean up any leftover Diagnostic Test scores from previous runs
  await pool.query("DELETE FROM leaderboard WHERE game = 'Diagnostic Test'").catch(() => {});

  // 2. Django reachable
  try {
    const res = await fetch(`${process.env.DJANGO_URL ?? "http://localhost:8000"}/api/leaderboard/`, {
      signal: AbortSignal.timeout(3000),
    });
    results["2_django"] = { ok: true, detail: `Django responded with ${res.status}` };
  } catch (e: any) {
    results["2_django"] = { ok: false, detail: `Django unreachable — make sure backend is running: ${e.message}` };
  }

  // 3. MySQL connection
  try {
    await pool.query<RowDataPacket[]>("SELECT 1");
    results["3_mysql"] = { ok: true, detail: "MySQL connected" };
  } catch (e: any) {
    results["3_mysql"] = { ok: false, detail: `MySQL error: ${e.message}` };
  }

  // 4. Leaderboard table data
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as total FROM leaderboard");
    const total = (rows as any)[0]?.total ?? 0;
    results["4_leaderboard_table"] = { ok: true, detail: `${total} total scores in leaderboard table` };
  } catch (e: any) {
    results["4_leaderboard_table"] = { ok: false, detail: `Error: ${e.message}` };
  }

  // 5. User's own scores
  if (session?.user) {
    const userId = (session.user as any).id;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) as total, COALESCE(SUM(score),0) as points, COALESCE(MAX(score),0) as best FROM leaderboard WHERE user_id = ?",
        [userId]
      );
      const r = (rows as any)[0];
      results["5_user_scores"] = {
        ok: true,
        detail: `Games played: ${r.total} | Total pts: ${r.points} | Best score: ${r.best}`,
      };
    } catch (e: any) {
      results["5_user_scores"] = { ok: false, detail: `Error: ${e.message}` };
    }
  } else {
    results["5_user_scores"] = { ok: false, detail: "Skipped — not logged in" };
  }

  // 6. Score submission via Django
  if (session?.user) {
    const playerId = (session.user as any).id;
    try {
      const res = await djangoProxy("/api/games/score/", {
        method: "POST",
        headers: djangoInternalHeaders(playerId),
        body: JSON.stringify({ game: "Diagnostic Test", won: true, score: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        // Immediately delete the test score so it doesn't pollute the leaderboard
        await pool.query(
          "DELETE FROM leaderboard WHERE user_id = ? AND game = 'Diagnostic Test' ORDER BY created_at DESC LIMIT 1",
          [playerId]
        ).catch(() => {});
        results["6_score_submit"] = { ok: true, detail: "Score submission works \u2713 (test entry auto-removed)" };
      } else {
        results["6_score_submit"] = { ok: false, detail: `Django rejected score: ${data.error}` };
      }
    } catch (e: any) {
      results["6_score_submit"] = { ok: false, detail: `Error: ${e.message}` };
    }
  } else {
    results["6_score_submit"] = { ok: false, detail: "Skipped \u2014 not logged in" };
  }

  // 7. Stats API
  if (session?.user) {
    const playerId = (session.user as any).id;
    try {
      const res = await djangoProxy("/api/stats/", { headers: djangoInternalHeaders(playerId) });
      const data = await res.json();
      results["7_stats_api"] = data.overall
        ? { ok: true, detail: `Stats OK — ${data.overall.total_games} games, ${data.overall.total_points} pts` }
        : { ok: false, detail: `Stats error: ${data.error ?? "unexpected response"}` };
    } catch (e: any) {
      results["7_stats_api"] = { ok: false, detail: `Error: ${e.message}` };
    }
  } else {
    results["7_stats_api"] = { ok: false, detail: "Skipped — not logged in" };
  }

  const allOk = Object.values(results).every(r => r.ok);
  return NextResponse.json({ allOk, results });
}
