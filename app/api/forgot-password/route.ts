import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { transporter, FROM, otpEmailHtml } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (rateLimit(`forgot-password:${ip}`, 3, 900_000))
      return rateLimitResponse("Too many requests. Please wait 15 minutes.");

    const body = await req.json();
    const email = (body.email ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    // Check if player exists
    const { rows } = await pool.query(
      "SELECT id, player_name FROM players WHERE email = $1 LIMIT 1",
      [email]
    );
    const player = rows[0];

    // Always return success to prevent email enumeration
    if (!player) return NextResponse.json({ ok: true });

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP - use MySQL NOW() + 10 minutes to avoid timezone issues
    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);
    await pool.query(
      "INSERT INTO password_resets (email, otp, expires) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
      [email, otp]
    );

    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Your Password Reset Code",
      html: otpEmailHtml(player.player_name, otp, "Enter this code to reset your password:"),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[forgot-password] error:", e.message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
