import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import nodemailer from "nodemailer";
import { RowDataPacket } from "mysql2";
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
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, player_name FROM players WHERE email = ? LIMIT 1",
      [email]
    );
    const player = (rows as RowDataPacket[])[0];

    // Always return success to prevent email enumeration
    if (!player) return NextResponse.json({ ok: true });

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP - use MySQL NOW() + 10 minutes to avoid timezone issues
    await pool.query("DELETE FROM password_resets WHERE email = ?", [email]);
    await pool.query(
      "INSERT INTO password_resets (email, otp, expires) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
      [email, otp]
    );

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Search & Play" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Code",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d14;color:#e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#f97316,#fb923c);padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;">Search &amp; Play</h1>
          </div>
          <div style="padding:32px;text-align:center;">
            <p style="font-size:16px;margin-bottom:8px;">Hi <strong>${player.player_name}</strong>,</p>
            <p style="color:#94a3b8;margin-bottom:24px;">Enter this code to reset your password:</p>
            <div style="background:#1e1e2e;border:2px solid #f97316;border-radius:12px;padding:24px;display:inline-block;margin-bottom:24px;">
              <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#f97316;">${otp}</span>
            </div>
            <p style="color:#64748b;font-size:13px;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color:#64748b;font-size:13px;">If you did not request this, ignore this email.</p>
          </div>
        </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[forgot-password] error:", e.message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
