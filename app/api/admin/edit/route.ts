import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { isValidId, isValidEmail, sanitize } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { player_id, player_name, email } = await req.json();

  if (!isValidId(player_id))
    return NextResponse.json({ error: "Invalid player_id" }, { status: 400 });
  if (!player_name || typeof player_name !== "string" || player_name.trim().length < 2)
    return NextResponse.json({ error: "Invalid player name" }, { status: 400 });
  if (!isValidEmail(email))
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  await pool.query(
    "UPDATE players SET player_name = $1, email = $2 WHERE id = $3",
    [sanitize(player_name), email.trim().toLowerCase(), Number(player_id)]
  );

  return NextResponse.json({ success: true });
}
