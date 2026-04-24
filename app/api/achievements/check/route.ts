import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ newAchievements: [] });
  const userId = (session.user as any).id;

  try {
    const { rows: scoreRows } = await pool.query(
      `SELECT COUNT(*) as games_played, COALESCE(SUM(score),0) as total_points,
              COALESCE(MAX(score),0) as best_score
       FROM leaderboard WHERE user_id = $1`,
      [userId]
    );
    const { rows: searchRows } = await pool.query(
      `SELECT COUNT(*) as searches FROM activity_logs
       WHERE player_name = (SELECT player_name FROM players WHERE id = $1 LIMIT 1)
       AND activity LIKE 'Searched for%'`,
      [userId]
    );
    const { rows: favRows } = await pool.query(
      "SELECT COUNT(*) as favorites FROM favorite_words WHERE user_id = $1",
      [userId]
    );

    const stats = {
      games_played: Number(scoreRows[0]?.games_played ?? 0),
      total_points: Number(scoreRows[0]?.total_points ?? 0),
      best_score:   Number(scoreRows[0]?.best_score ?? 0),
      searches:     Number(searchRows[0]?.searches ?? 0),
      favorites:    Number(favRows[0]?.favorites ?? 0),
    };

    const { rows: allAchievements } = await pool.query(
      `SELECT a.* FROM achievements a
       WHERE a.id NOT IN (
         SELECT achievement_id FROM user_achievements WHERE user_id = $1
       )`,
      [userId]
    );

    // Per-game best scores — match ignoring difficulty suffix e.g. "Hangman (easy)" → "Hangman"
    const { rows: gameScores } = await pool.query(
      `SELECT REGEXP_REPLACE(game, ' \\(.*\\)$', '') as game_base,
              MAX(score) as best
       FROM leaderboard WHERE user_id = $1
       GROUP BY game_base`,
      [userId]
    );
    const gameMap: Record<string, number> = {};
    for (const g of gameScores) gameMap[g.game_base] = Number(g.best);

    const newAchievements: any[] = [];

    for (const a of allAchievements) {
      let earned = false;
      const val = Number(a.condition_value);

      if (a.game_specific) {
        const best = gameMap[a.game_specific] ?? 0;
        if (a.condition_type === "score" && best >= val) earned = true;
        if (a.condition_type === "games_played") {
          const { rows } = await pool.query(
            `SELECT COUNT(*) as c FROM leaderboard
             WHERE user_id = $1 AND REGEXP_REPLACE(game, ' \\(.*\\)$', '') = $2`,
            [userId, a.game_specific]
          );
          if (Number(rows[0].c) >= val) earned = true;
        }
      } else {
        if (a.condition_type === "games_played" && stats.games_played >= val) earned = true;
        if (a.condition_type === "total_points" && stats.total_points >= val) earned = true;
        if (a.condition_type === "score"        && stats.best_score   >= val) earned = true;
        if (a.condition_type === "searches"     && stats.searches     >= val) earned = true;
        if (a.condition_type === "favorites"    && stats.favorites    >= val) earned = true;
      }

      if (earned) {
        await pool.query(
          "INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING",
          [userId, a.id]
        );
        newAchievements.push({ name: a.name, icon: a.icon, description: a.description });
      }
    }

    return NextResponse.json({ newAchievements });
  } catch (e: any) {
    return NextResponse.json({ newAchievements: [], error: e.message }, { status: 500 });
  }
}
