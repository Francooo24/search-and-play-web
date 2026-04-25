import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Last 7 days chart data
    const dataPoints: number[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      labels.push(d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
      const { rows } = await pool.query(
        "SELECT COUNT(*) AS total FROM players WHERE DATE(created_at) = $1",
        [dateStr]
      );
      dataPoints.push(Number(rows[0].total));
    }

    const totalNew = dataPoints.reduce((a, b) => a + b, 0);
    const avg      = Math.round((totalNew / 7) * 10) / 10;
    const peak     = Math.max(...dataPoints);
    const bestDay  = labels[dataPoints.indexOf(peak)] ?? "N/A";

    // Derive notifications from activity_logs
    const { rows: notifications } = await pool.query(
      `SELECT
         CASE
           WHEN activity ILIKE 'Logged in%'
             THEN '🔐 ' || COALESCE(player_name, 'Someone') || ' logged in'
           WHEN activity ILIKE 'Played%'
             THEN '🎮 ' || COALESCE(player_name, 'A player') || ' ' || activity
           WHEN activity ILIKE 'Searched for%'
             THEN '🔍 ' || COALESCE(player_name, 'Someone') || ' ' || activity
           ELSE '📌 ' || COALESCE(player_name, 'A player') || ' ' || activity
         END AS message,
         created_at
       FROM activity_logs
       ORDER BY created_at DESC
       LIMIT 50`
    ).catch(() => ({ rows: [] }));

    const { rows: activityLogs } = await pool.query(
      `SELECT activity, created_at, player_name
       FROM activity_logs
       ORDER BY created_at DESC LIMIT 100`
    ).catch(() => ({ rows: [] }));

    return NextResponse.json({ dataPoints, labels, totalNew, avg, peak, bestDay, notifications, activityLogs });
  } catch (err) {
    console.error("[admin/stats] error:", err);
    return NextResponse.json(
      { dataPoints: [], labels: [], totalNew: 0, avg: 0, peak: 0, bestDay: "N/A", notifications: [], activityLogs: [] },
      { status: 500 }
    );
  }
}
