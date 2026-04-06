import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT word, english_word, definition FROM word_of_day WHERE date <= CURRENT_DATE ORDER BY date DESC LIMIT 1"
    );
    return NextResponse.json(rows[0] ?? null);
  } catch {
    return NextResponse.json(null);
  }
}
