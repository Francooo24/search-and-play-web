import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { djangoProxy, djangoInternalHeaders } from "@/lib/djangoProxy";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ challenge: null, streak: 0, history: [] });
  const playerId = (session.user as any).id;
  return djangoProxy("/api/games/daily-challenge/", {
    method: "GET",
    headers: djangoInternalHeaders(playerId),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const playerId = (session.user as any).id;
  return djangoProxy("/api/games/daily-challenge/", {
    method: "POST",
    headers: djangoInternalHeaders(playerId),
  });
}
