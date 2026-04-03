import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import nodemailer from "nodemailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`resend-otp:${ip}`, 3, 600_000)) return rateLimitResponse();

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM pending_verifications WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  );
  const pending = (rows as RowDataPacket[])[0];
  if (!pending) return NextResponse.json({ error: "No pending verification found. Please sign up again." }, { status: 404 });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otp_expires = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");

  await pool.query(
    "UPDATE pending_verifications SET otp = ?, otp_expires = ? WHERE email = ?",
    [otp, otp_expires, email.trim().toLowerCase()]
  );

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Search & Play" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your New Search & Play Verification Code",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d14;color:#e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#f97316,#fb923c);padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;">Search &amp; Play</h1>
          </div>
          <div style="padding:32px;text-align:center;">
            <p style="font-size:16px;margin-bottom:8px;">Hi <strong>${pending.player_name}</strong>,</p>
            <p style="color:#94a3b8;margin-bottom:24px;">Here is your new OTP code:</p>
            <div style="background:#1e1e2e;border:2px solid #f97316;border-radius:12px;padding:24px;display:inline-block;margin-bottom:24px;">
              <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#f97316;">${otp}</span>
            </div>
            <p style="color:#64748b;font-size:13px;">This code expires in <strong>10 minutes</strong>.</p>
          </div>
        </div>`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
