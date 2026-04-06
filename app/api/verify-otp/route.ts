import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    const { email, otp } = body;
    if (!email || !otp)
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });

    const { rows } = await pool.query(
      "SELECT * FROM pending_verifications WHERE email = $1 AND otp = $2 LIMIT 1",
      [email.trim().toLowerCase(), otp.trim()]
    );
    const pending = rows[0];

    if (!pending)
      return NextResponse.json({ error: "Invalid OTP code. Please try again." }, { status: 400 });

    if (new Date(pending.otp_expires) < new Date()) {
      await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);
      return NextResponse.json({ error: "OTP has expired. Please sign up again." }, { status: 400 });
    }

    // Check if email was already registered (double-submit guard)
    const { rows: existing } = await pool.query(
      "SELECT id FROM players WHERE email = $1 LIMIT 1",
      [pending.email]
    );
    if (existing.length > 0) {
      await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);
      return NextResponse.json({ success: true, message: "Account already exists. Please log in." }, { status: 201 });
    }

    await pool.query(
      `INSERT INTO players
        (player_name, email, password, birthdate, show_kids, show_teen, show_adult, country, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW())`,
      [
        pending.player_name, pending.email, pending.password,
        pending.birthdate, pending.show_kids, pending.show_teen,
        pending.show_adult, pending.country ?? null,
      ]
    );

    await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);

    return NextResponse.json({ success: true, message: "Account created successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
