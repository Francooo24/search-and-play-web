import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);

  const [[playerRows], [overallRows], [gameRows], [achRows]] = await Promise.all([
    (pool as any).query(
      "SELECT id, player_name, birthdate, country, created_at FROM players WHERE player_name = ? AND is_admin = 0 LIMIT 1",
      [name]
    ).catch(() => [[]]),
    (pool as any).query(
      "SELECT COUNT(*) as total_games, MAX(score) as highest_score, SUM(score) as total_points FROM leaderboard WHERE user_id = (SELECT id FROM players WHERE player_name = ? LIMIT 1)",
      [name]
    ).catch(() => [[]]),
    (pool as any).query(
      "SELECT game, COUNT(*) as games_played, MAX(score) as best_score, SUM(score) as total_score FROM leaderboard WHERE user_id = (SELECT id FROM players WHERE player_name = ? LIMIT 1) GROUP BY game ORDER BY total_score DESC LIMIT 8",
      [name]
    ).catch(() => [[]]),
    (pool as any).query(
      "SELECT a.icon, a.name, a.description FROM achievements a JOIN user_achievements ua ON a.id = ua.achievement_id JOIN players p ON ua.user_id = p.id WHERE p.player_name = ? ORDER BY ua.earned_at DESC LIMIT 6",
      [name]
    ).catch(() => [[]]),
  ]);

  const player = (playerRows as any[])[0];
  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const overall = (overallRows as any[])[0] ?? {};
  const today = new Date();
  const birth = player.birthdate ? new Date(player.birthdate) : null;
  const age = birth
    ? today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
    : null;
  const ageGroup = age === null ? null : age <= 12 ? "kids" : age <= 17 ? "teen" : "adult";

  // Fetch avatar separately in case column doesn't exist yet
  let avatarUrl: string | null = null;
  try {
    const [avRows] = await (pool as any).query(
      "SELECT avatar_url FROM players WHERE player_name = ? LIMIT 1", [name]
    );
    avatarUrl = (avRows as any[])[0]?.avatar_url ?? null;
  } catch { /* column may not exist yet */ }

  return NextResponse.json({
    player_name:   player.player_name,
    country:       player.country ?? null,
    joined_at:     player.created_at,
    age_group:     ageGroup,
    avatar_url:    avatarUrl,
    total_games:   Number(overall.total_games ?? 0),
    total_points:  Number(overall.total_points ?? 0),
    highest_score: Number(overall.highest_score ?? 0),
    game_stats:    gameRows as any[],
    achievements:  achRows as any[],
  });
}
