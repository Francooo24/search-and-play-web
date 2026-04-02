import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { isValidId } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.is_admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { player_id } = await req.json();
  if (!isValidId(player_id))
    return NextResponse.json({ error: "Invalid player_id" }, { status: 400 });

  await pool.query("DELETE FROM players WHERE id = ?", [Number(player_id)]);
  return NextResponse.json({ success: true });
}
