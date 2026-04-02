import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp)
    return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires > NOW() LIMIT 1",
    [email.trim().toLowerCase(), otp.trim()]
  );
  const reset = (rows as RowDataPacket[])[0];

  if (!reset)
    return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 400 });

  return NextResponse.json({ ok: true });
}
