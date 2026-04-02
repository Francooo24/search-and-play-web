import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { djangoProxy, djangoInternalHeaders } from "@/lib/djangoProxy";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const playerId = (session.user as any).id;
  const body = await req.json();
  return djangoProxy(
    "/api/games/favorites/words/",
    { method: "POST", headers: djangoInternalHeaders(playerId), body: JSON.stringify(body) }
  );
}
