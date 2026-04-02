import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { djangoProxy, djangoInternalHeaders } from "@/lib/djangoProxy";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const playerId = (session.user as any).id;
  const search = req.nextUrl.search;
  return djangoProxy(`/api/stats/${search}`, { headers: djangoInternalHeaders(playerId) });
}
