import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ bestScore: 0 });
  const userId = (session.user as any).id;
  const game = req.nextUrl.searchParams.get("game") ?? "";
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT MAX(score) as best FROM leaderboard WHERE user_id = ? AND game = ?",
    [userId, game]
  ).catch(() => [[{ best: 0 }]]);
  return NextResponse.json({ bestScore: (rows as any)[0]?.best ?? 0 });
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
  await pool.query<ResultSetHeader>(
    "INSERT INTO leaderboard (user_id, player_name, game, score) VALUES (?, ?, ?, ?)",
    [userId, playerName, gameLabel, score]
  ).catch(() => {});

  // Log to activity
  const result = won === true ? "Won" : won === false ? "Lost" : "Played";
  await pool.query(
    "INSERT INTO activity_logs (player_name, activity) VALUES (?, ?)",
    [playerName, `${result} "${gameLabel}" with score ${score}`]
  ).catch(() => {});

  return NextResponse.json({ ok: true, score });
}
