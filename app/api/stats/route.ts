import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId   = (session.user as any).id;
  const { searchParams } = req.nextUrl;
  const gameFilter = searchParams.get("game") ?? "";
  const sort       = searchParams.get("sort") ?? "created_at";
  const dir        = searchParams.get("dir") ?? "desc";
  const page       = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const PAGE_SIZE  = 20;

  try {
    // Overall stats
    const { rows: overallRows } = await pool.query(
      `SELECT COUNT(*) as total_games, COALESCE(SUM(score),0) as total_points,
              COALESCE(AVG(score),0) as avg_score, COALESCE(MAX(score),0) as highest_score
       FROM leaderboard WHERE user_id = $1`,
      [userId]
    );
    const o = overallRows[0];
    const overall = {
      total_games:   Number(o.total_games),
      total_points:  Number(o.total_points),
      avg_score:     Math.round(Number(o.avg_score) * 10) / 10,
      highest_score: Number(o.highest_score),
    };

    // Per-game stats
    const { rows: gameStats } = await pool.query(
      `SELECT game, COUNT(*) as games_played, MAX(score) as best_score,
              AVG(score) as avg_score, SUM(score) as total_score
       FROM leaderboard WHERE user_id = $1
       GROUP BY game ORDER BY total_score DESC`,
      [userId]
    );

    // Recent games
    const { rows: recentGames } = await pool.query(
      `SELECT game, score, created_at FROM leaderboard
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    // History (paginated)
    const sortField = sort === "score" ? "score" : "created_at";
    const sortDir   = dir === "asc" ? "ASC" : "DESC";
    const whereGame = gameFilter ? "AND game = $2" : "";
    const params    = gameFilter ? [userId, gameFilter] : [userId];

    const { rows: historyRows } = await pool.query(
      `SELECT game, score, created_at FROM leaderboard
       WHERE user_id = $1 ${whereGame}
       ORDER BY ${sortField} ${sortDir}
       LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      params
    );
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) as total FROM leaderboard WHERE user_id = $1 ${whereGame}`,
      params
    );
    const historyTotal = Number(countRows[0].total);
    const historyPages = Math.max(1, Math.ceil(historyTotal / PAGE_SIZE));

    // Distinct games
    const { rows: distinctRows } = await pool.query(
      "SELECT DISTINCT game FROM leaderboard WHERE user_id = $1 ORDER BY game",
      [userId]
    );

    return NextResponse.json({
      overall,
      gameStats: gameStats.map(g => ({
        game: g.game,
        games_played: Number(g.games_played),
        best_score:   Number(g.best_score),
        avg_score:    Math.round(Number(g.avg_score) * 10) / 10,
        total_score:  Number(g.total_score),
      })),
      recentGames,
      history:       historyRows,
      historyTotal,
      historyPages,
      page,
      distinctGames: distinctRows.map(r => r.game),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
