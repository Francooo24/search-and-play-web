import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`reset-password:${ip}`, 5, 900_000))
    return rateLimitResponse("Too many attempts. Please wait 15 minutes.");

  const { email, otp, password } = await req.json();
  if (!email || !otp || !password)
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const normalizedEmail = email.trim().toLowerCase();

  // Verify OTP
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires > NOW() LIMIT 1",
    [normalizedEmail, otp.trim()]
  );
  const reset = (rows as RowDataPacket[])[0];

  if (!reset)
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });

  // Update password
  const hashed = await bcrypt.hash(password, 10);
  await pool.query("UPDATE players SET password = ? WHERE email = ?", [hashed, normalizedEmail]);
  await pool.query("DELETE FROM password_resets WHERE email = ?", [normalizedEmail]);

  return NextResponse.json({ ok: true });
}
