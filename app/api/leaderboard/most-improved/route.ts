import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Try last 14 days first
    let [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        p.player_name,
        p.birthdate,
        p.country,
        COALESCE(SUM(CASE WHEN l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN l.score ELSE 0 END), 0) AS this_week,
        COALESCE(SUM(CASE WHEN l.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                          AND l.created_at <  DATE_SUB(NOW(), INTERVAL 7 DAY)  THEN l.score ELSE 0 END), 0) AS last_week
      FROM players p
      JOIN leaderboard l ON p.id = l.user_id
      WHERE l.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        AND p.is_admin = 0
      GROUP BY p.id, p.player_name, p.birthdate, p.country
      HAVING this_week > 0
      ORDER BY (this_week - last_week) DESC
      LIMIT 10
    `);

    // Fallback: if no recent data, show all-time top players with total as "this_week"
    if ((rows as RowDataPacket[]).length === 0) {
      [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
          p.player_name,
          p.birthdate,
          p.country,
          COALESCE(SUM(l.score), 0) AS this_week,
          0 AS last_week
        FROM players p
        JOIN leaderboard l ON p.id = l.user_id
        WHERE p.is_admin = 0
        GROUP BY p.id, p.player_name, p.birthdate, p.country
        HAVING this_week > 0
        ORDER BY this_week DESC
        LIMIT 10
      `);
    }

    const today = new Date();
    const players = (rows as RowDataPacket[]).map(r => {
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
