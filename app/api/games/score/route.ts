import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import nodemailer from "nodemailer";

async function notifyBeatenPlayers(game: string, newScore: number, beaterName: string) {
  try {
    const { rows } = await pool.query(
      `SELECT p.email, p.player_name, MAX(l.score) as best
       FROM leaderboard l
       JOIN players p ON l.user_id = p.id
       WHERE l.game = $1 AND p.player_name != $2 AND p.email IS NOT NULL
       GROUP BY p.id, p.email, p.player_name
       HAVING MAX(l.score) < $3`,
      [game, beaterName, newScore]
    );
    if (!rows.length) return;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    for (const row of rows) {
      await transporter.sendMail({
        from: `"Search & Play" <${process.env.EMAIL_USER}>`,
        to: row.email,
        subject: `🏆 Your ${game} score was beaten!`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d14;color:#e2e8f0;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,#f97316,#fb923c);padding:24px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;">Search &amp; Play</h1>
            </div>
            <div style="padding:32px;text-align:center;">
              <p style="font-size:32px;margin:0 0 16px;">🏆</p>
              <p style="font-size:16px;margin-bottom:8px;">Hi <strong>${row.player_name}</strong>,</p>
              <p style="color:#94a3b8;margin-bottom:24px;">
                <strong style="color:#f97316;">${beaterName}</strong> just beat your best score in <strong>${game}</strong>!
              </p>
              <div style="background:#1e1e2e;border:2px solid #f97316;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#64748b;font-size:13px;">Their score</p>
                <p style="margin:0;font-size:36px;font-weight:900;color:#f97316;">${newScore.toLocaleString()}</p>
                <p style="margin:8px 0 0;color:#64748b;font-size:13px;">Your best: ${row.best.toLocaleString()}</p>
              </div>
              <a href="${process.env.NEXTAUTH_URL}/games" style="display:inline-block;background:linear-gradient(90deg,#f97316,#fb923c);color:#fff;font-weight:700;padding:12px 32px;border-radius:12px;text-decoration:none;">Take it back! 🎮</a>
            </div>
          </div>`,
      }).catch(() => {});
    }
  } catch { /* silent — don't break score saving */ }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ bestScore: 0 });
  const userId = (session.user as any).id;
  const game = req.nextUrl.searchParams.get("game") ?? "";
  const { rows: scoreRows } = await pool.query(
    "SELECT MAX(score) as best FROM leaderboard WHERE user_id = $1 AND game = $2",
    [userId, game]
  ).catch(() => ({ rows: [{ best: 0 }] }));
  return NextResponse.json({ bestScore: scoreRows[0]?.best ?? 0 });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`score:${ip}`, 30, 60_000)) return rateLimitResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId     = (session.user as any).id;
  const playerName = (session.user as any).name ?? "Unknown";
  const { game, score, won, difficulty } = await req.json();

  if (!game || score === undefined) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Append difficulty to game name if provided
  const gameLabel = difficulty ? `${game} (${difficulty})` : game;

  // Save to leaderboard
  await pool.query(
    "INSERT INTO leaderboard (user_id, player_name, game, score) VALUES ($1, $2, $3, $4)",
    [userId, playerName, gameLabel, score]
  ).catch(() => {});

  if (score > 0) notifyBeatenPlayers(gameLabel, score, playerName);

  const result = won === true ? "Won" : won === false ? "Lost" : "Played";
  await pool.query(
    "INSERT INTO activity_logs (player_name, activity) VALUES ($1, $2)",
    [playerName, `${result} "${gameLabel}" with score ${score}`]
  ).catch(() => {});

  return NextResponse.json({ ok: true, score });
}
