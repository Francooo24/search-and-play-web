import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`signup_process:${ip}`, 5, 600_000)) return rateLimitResponse();

  const body = await req.json();
  const player_name: string = (body.player_name ?? "").trim();
  const email: string       = (body.email ?? "").trim().toLowerCase();
  const password: string    = body.password ?? "";
  const confirm: string     = body.confirm_password ?? "";
  const birthdate: string   = (body.birthdate ?? "").trim();
  const show_kids: number   = body.show_kids  ? 1 : 0;
  const show_teen: number   = body.show_teen  ? 1 : 0;
  const show_adult: number  = body.show_adult ? 1 : 0;

  const errors: string[] = [];
  if (!player_name)                                            errors.push("Player name is required");
  else if (player_name.length < 2)                            errors.push("Player name must be at least 2 characters");
  else if (player_name.length > 50)                           errors.push("Player name must be 50 characters or less");
  else if (!/^[\p{L}\p{N} _\-.]+$/u.test(player_name))       errors.push("Player name contains invalid characters");
  if (!email)                                                  errors.push("Email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))         errors.push("Invalid email format");
  if (!password)                                               errors.push("Password is required");
  else if (password.length < 8)                               errors.push("Password must be at least 8 characters");
  if (password !== confirm)                                    errors.push("Passwords do not match");
  if (!birthdate || isNaN(Date.parse(birthdate)))              errors.push("Birthdate is required");
  else if (new Date(birthdate) > new Date())                   errors.push("Birthdate cannot be in the future");
  else {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 6)  errors.push("You must be at least 6 years old to register.");
    if (age > 120) errors.push("Please enter a valid birthdate.");
  }
  if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM players WHERE email = ? LIMIT 1", [email]
  );
  if ((existing as RowDataPacket[]).length > 0)
    return NextResponse.json({ error: "This email is already registered." }, { status: 409 });

  await pool.query("DELETE FROM pending_verifications WHERE email = ?", [email]);

  const otp        = String(Math.floor(100000 + Math.random() * 900000));
  const otp_expires = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
  const token      = crypto.randomBytes(32).toString("hex");
  const expires    = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
  const hashed     = await bcrypt.hash(password, 10);

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO pending_verifications (player_name, email, password, birthdate, show_kids, show_teen, show_adult, token, expires, otp, otp_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [player_name, email, hashed, birthdate, show_kids, show_teen, show_adult, token, expires, otp, otp_expires]
  );
  if (!result.insertId)
    return NextResponse.json({ error: "An error occurred. Please try again later." }, { status: 500 });

  try {
    await getTransporter().sendMail({
      from: `"Search & Play" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Search & Play Verification Code",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d14;color:#e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#f97316,#fb923c);padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;">Search &amp; Play</h1>
          </div>
          <div style="padding:32px;text-align:center;">
            <p style="font-size:16px;margin-bottom:8px;">Hi <strong>${player_name}</strong>,</p>
            <p style="color:#94a3b8;margin-bottom:24px;">Enter this OTP code to verify your account:</p>
            <div style="background:#1e1e2e;border:2px solid #f97316;border-radius:12px;padding:24px;display:inline-block;margin-bottom:24px;">
              <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#f97316;">${otp}</span>
            </div>
            <p style="color:#64748b;font-size:13px;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color:#64748b;font-size:13px;">If you did not sign up, ignore this email.</p>
          </div>
        </div>`,
    });
  } catch {
    await pool.query("DELETE FROM pending_verifications WHERE email = ?", [email]);
    return NextResponse.json({ error: "Failed to send verification email. Please check your email address." }, { status: 500 });
  }

  return NextResponse.json({ otp_pending: true, pending_email: email });
}
