import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { transporter, FROM, otpEmailHtml } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (rateLimit(`signup_process:${ip}`, 5, 600_000)) return rateLimitResponse();

    const body = await req.json();
    const player_name: string = (body.player_name ?? "").trim();
    const email: string       = (body.email ?? "").trim().toLowerCase();
    const password: string    = body.password ?? "";
    const confirm: string     = body.confirm_password ?? "";
    const birthdate: string   = (body.birthdate ?? "").trim();
    const show_kids: boolean  = !!body.show_kids;
    const show_teen: boolean  = !!body.show_teen;
    const show_adult: boolean = !!body.show_adult;
    const country: string     = (body.country ?? "").trim().toUpperCase().slice(0, 2);

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
      if (age < 6)   errors.push("You must be at least 6 years old to register.");
      if (age > 120) errors.push("Please enter a valid birthdate.");
    }
    if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

    const { rows: existing } = await pool.query(
      "SELECT id FROM players WHERE email = $1 LIMIT 1", [email]
    );
    if (existing.length > 0)
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });

    await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);

    const otp         = String(Math.floor(100000 + Math.random() * 900000));
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const token       = crypto.randomBytes(32).toString("hex");
    const expires     = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const hashed      = await bcrypt.hash(password, 10);

    const { rows: inserted } = await pool.query(
      "INSERT INTO pending_verifications (player_name, email, password, birthdate, show_kids, show_teen, show_adult, country, token, expires, otp, otp_expires, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING id",
      [player_name, email, hashed, birthdate, show_kids, show_teen, show_adult, country || null, token, expires, otp, otp_expires]
    );
    if (!inserted[0]?.id)
      return NextResponse.json({ error: "An error occurred. Please try again later." }, { status: 500 });

    try {
      await transporter.sendMail({
        from: FROM,
        to: email,
        subject: "Your Search & Play Verification Code",
        html: otpEmailHtml(player_name, otp, "Enter this OTP code to verify your account:"),
      });
    } catch (mailErr: any) {
      await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);
      return NextResponse.json(
        { error: `Failed to send verification email: ${mailErr?.message ?? "unknown error"}. Please check your email address.` },
        { status: 500 }
      );
    }

    return NextResponse.json({ otp_pending: true, pending_email: email });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
