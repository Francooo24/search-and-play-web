import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED = [
  "/admin",
  "/games",
  "/profile",
  "/favorites",
  "/stats",
  "/achievements",
  "/daily-challenge",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + "/"));
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin-prompt";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/games",
    "/games/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/stats/:path*",
    "/achievements/:path*",
    "/daily-challenge/:path*",
  ],
};
