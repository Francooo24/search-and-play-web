import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[];
    ({ rows } = await pool.query(`
      SELECT
        p.player_name,
        p.birthdate,
        p.country,
        COALESCE(SUM(CASE WHEN l.created_at >= NOW() - INTERVAL '7 days' THEN l.score ELSE 0 END), 0) AS this_week,
        COALESCE(SUM(CASE WHEN l.created_at >= NOW() - INTERVAL '14 days'
                          AND l.created_at <  NOW() - INTERVAL '7 days'  THEN l.score ELSE 0 END), 0) AS last_week
      FROM players p
      JOIN leaderboard l ON p.id = l.user_id
      WHERE l.created_at >= NOW() - INTERVAL '14 days'
        AND p.is_admin = false
      GROUP BY p.id, p.player_name, p.birthdate, p.country
      HAVING COALESCE(SUM(CASE WHEN l.created_at >= NOW() - INTERVAL '7 days' THEN l.score ELSE 0 END), 0) > 0
      ORDER BY (SUM(CASE WHEN l.created_at >= NOW() - INTERVAL '7 days' THEN l.score ELSE 0 END) -
                SUM(CASE WHEN l.created_at >= NOW() - INTERVAL '14 days' AND l.created_at < NOW() - INTERVAL '7 days' THEN l.score ELSE 0 END)) DESC
      LIMIT 10
    `));

    if (rows.length === 0) {
      ({ rows } = await pool.query(`
        SELECT
          p.player_name,
          p.birthdate,
          p.country,
          COALESCE(SUM(l.score), 0) AS this_week,
          0 AS last_week
        FROM players p
        JOIN leaderboard l ON p.id = l.user_id
        WHERE p.is_admin = false
        GROUP BY p.id, p.player_name, p.birthdate, p.country
        HAVING COALESCE(SUM(l.score), 0) > 0
        ORDER BY this_week DESC
        LIMIT 10
      `));
    }

    const today = new Date();
    const players = rows.map(r => {
      const diff = Number(r.this_week) - Number(r.last_week);
      let age_group = null;
      if (r.birthdate) {
        const birth = new Date(r.birthdate);
        const age = today.getFullYear() - birth.getFullYear() -
          ((today.getMonth() < birth.getMonth() ||
            (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) ? 1 : 0);
        age_group = age <= 12 ? "kids" : age <= 17 ? "teen" : "adult";
      }
      return {
        player_name: r.player_name,
        this_week:   Number(r.this_week),
        last_week:   Number(r.last_week),
        diff,
        age_group,
        country:     r.country ?? null,
      };
    });

    return NextResponse.json({ players });
  } catch {
    return NextResponse.json({ players: [] });
  }
}
