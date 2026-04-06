import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp)
    return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });

  const { rows } = await pool.query(
    "SELECT * FROM password_resets WHERE email = $1 AND otp = $2 AND expires > NOW() LIMIT 1",
    [email.trim().toLowerCase(), otp.trim()]
  );
  const reset = rows[0];

  if (!reset)
    return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 400 });

  return NextResponse.json({ ok: true });
}
