import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { djangoProxy, djangoInternalHeaders } from "@/lib/djangoProxy";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ newAchievements: [] });
  const playerId = (session.user as any).id;
  return djangoProxy(
    "/api/achievements/check/",
    { method: "POST", headers: djangoInternalHeaders(playerId) },
    { newAchievements: [] }
  );
}
