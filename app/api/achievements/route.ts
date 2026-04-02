import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { djangoProxy, djangoAuthHeaders } from "@/lib/djangoProxy";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([]);
  const token = (session as any).accessToken ?? "";
  return djangoProxy("/api/achievements/", {
    method: "GET",
    headers: djangoAuthHeaders(token),
  }, {} as Record<string, unknown>);
}
