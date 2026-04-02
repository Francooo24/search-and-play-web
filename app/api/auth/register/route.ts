import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket, ResultSetHeader } from "mysql2";
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
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM players WHERE email = ? LIMIT 1", [email]
  );
  if ((existing as RowDataPacket[]).length > 0)
    return NextResponse.json({ error: "This email is already registered. Please use a different email or sign in." }, { status: 409 });

  // Ensure pending_verifications table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pending_verifications (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      player_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      birthdate DATE NULL,
      show_kids TINYINT(1) DEFAULT 0,
      show_teen TINYINT(1) DEFAULT 0,
      show_adult TINYINT(1) DEFAULT 0,
      token VARCHAR(64) NOT NULL UNIQUE,
      expires DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Remove previous pending entry for this email
  await pool.query("DELETE FROM pending_verifications WHERE email = ?", [email]);

  const token   = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 19).replace("T", " ");
  const hashed  = await bcrypt.hash(password, 10);

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO pending_verifications (player_name, email, password, birthdate, show_kids, show_teen, show_adult, token, expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [player_name, email, hashed, birthdate, show_kids, show_teen, show_adult, token, expires]
  );

  if (!result.insertId)
    return NextResponse.json({ error: "An error occurred. Please try again later." }, { status: 500 });

  const host       = req.headers.get("host") ?? "localhost";
  const proto      = req.headers.get("x-forwarded-proto") ?? "http";
  const verifyLink = `${proto}://${host}/api/auth/verify-email?token=${token}`;

  return NextResponse.json({ verifyLink, email });
}
