import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

import crypto from "crypto";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

function getAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`register:${ip}`, 5, 600_000))
    return rateLimitResponse("Too many signup attempts. Please wait 10 minutes.");

  const body = await req.json();
  const player_name: string = (body.player_name ?? "").trim();
  const email: string       = (body.email ?? "").trim();
  const password: string    = body.password ?? "";
  const confirm: string     = body.confirm_password ?? body.confirm ?? "";
  const birthdate: string   = (body.birthdate ?? "").trim();
  const show_kids: number   = body.show_kids  ? 1 : 0;
  const show_teen: number   = body.show_teen  ? 1 : 0;
  const show_adult: number  = body.show_adult ? 1 : 0;

  // Validation
  const errors: string[] = [];
  if (!player_name)                                              errors.push("Player name is required");
  else if (player_name.length < 2)                              errors.push("Player name must be at least 2 characters");
  else if (player_name.length > 50)                             errors.push("Player name must be 50 characters or less");
  else if (!/^[\p{L}\p{N} _\-.]+$/u.test(player_name))        errors.push("Player name contains invalid characters");
  if (!email)                                                    errors.push("Email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))           errors.push("Invalid email format");
  else if (email.length > 255)                                   errors.push("Email is too long");
  if (!password)                                                 errors.push("Password is required");
  else if (password.length < 6)                                  errors.push("Password must be at least 6 characters");
  else if (password.length > 255)                                errors.push("Password is too long");
  if (confirm && password !== confirm)                           errors.push("Passwords do not match");
  if (!birthdate || isNaN(Date.parse(birthdate)))                errors.push("Birthdate is required");
  else if (new Date(birthdate) > new Date())                     errors.push("Birthdate cannot be in the future");

  if (errors.length)
    return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

  // Check existing player
  const { rows: existing } = await pool.query(
    "SELECT id FROM players WHERE email = $1 LIMIT 1", [email]
  );
  if (existing.length > 0)
    return NextResponse.json({ error: "This email is already registered. Please use a different email or sign in." }, { status: 409 });

  // Remove previous pending entry for this email
  await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);

  const token   = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const hashed  = await bcrypt.hash(password, 10);

  const { rows: inserted } = await pool.query(
    "INSERT INTO pending_verifications (player_name, email, password, birthdate, show_kids, show_teen, show_adult, token, expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
    [player_name, email, hashed, birthdate, show_kids, show_teen, show_adult, token, expires]
  );

  if (!inserted[0]?.id)
    return NextResponse.json({ error: "An error occurred. Please try again later." }, { status: 500 });

  const host       = req.headers.get("host") ?? "localhost";
  const proto      = req.headers.get("x-forwarded-proto") ?? "http";
  const verifyLink = `${proto}://${host}/api/auth/verify-email?token=${token}`;

  return NextResponse.json({ verifyLink, email });
}
