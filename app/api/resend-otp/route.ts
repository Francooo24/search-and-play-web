import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { transporter, FROM, otpEmailHtml } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`resend-otp:${ip}`, 3, 600_000)) return rateLimitResponse();

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const { rows } = await pool.query(
    "SELECT * FROM pending_verifications WHERE email = $1 LIMIT 1",
    [email.trim().toLowerCase()]
  );
  const pending = rows[0];
  if (!pending) return NextResponse.json({ error: "No pending verification found. Please sign up again." }, { status: 404 });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otp_expires = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

  await pool.query(
    "UPDATE pending_verifications SET otp = $1, otp_expires = $2 WHERE email = $3",
    [otp, new Date(Date.now() + 10 * 60 * 1000).toISOString(), email.trim().toLowerCase()]
  );

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Your New Search & Play Verification Code",
      html: otpEmailHtml(pending.player_name, otp, "Here is your new OTP code:"),
    });
  } catch {
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
