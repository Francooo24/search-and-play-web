import { NextResponse } from "next/server";

const DJANGO_URL = (process.env.DJANGO_URL ?? "https://search-and-play-backend.onrender.com").replace(/\/$/, "");

function isTrustedUrl(urlStr: string): boolean {
  try {
    const { protocol, hostname } = new URL(urlStr);
    if (protocol === "https:") return true;
    // Allow http only for local development
    if (protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1")) return true;
    return false;
  } catch {
    return false;
  }
}

export async function djangoProxy(
  path: string,
  options: RequestInit,
  errorFallback?: Record<string, unknown>
): Promise<NextResponse> {
  if (!isTrustedUrl(DJANGO_URL))
    return NextResponse.json({ error: "Invalid backend configuration." }, { status: 500 });

  // 9s timeout — stays under Vercel's 10s function limit
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  let res: Response;
  try {
    res = await fetch(`${DJANGO_URL}${path}`, { ...options, signal: controller.signal });
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      if (errorFallback) return NextResponse.json(errorFallback);
      return NextResponse.json(
        { error: "Backend request timed out. The server may be starting up — please try again." },
        { status: 503 }
      );
    }
    if (errorFallback) return NextResponse.json(errorFallback);
    return NextResponse.json(
      { error: "Cannot connect to server. Make sure the backend is running." },
      { status: 503 }
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Server returned an unexpected response." },
      { status: 500 }
    );
  }

  if (!res.ok) {
    let errorMsg = "An error occurred.";
    if (typeof data === "object" && data !== null) {
      const d = data as any;
      if (typeof d.detail === "string") {
        errorMsg = d.detail;
      } else {
        const flat = Object.values(d).flat();
        errorMsg = flat
          .map((v: any) => (typeof v === "object" && v !== null ? v.message ?? JSON.stringify(v) : String(v)))
          .join(" ");
      }
    }
    return NextResponse.json({ error: errorMsg }, { status: res.status });
  }

  return NextResponse.json(data, {
    status: res.status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function djangoAuthHeaders(accessToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

export function djangoInternalHeaders(playerId: string | number): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Internal-Secret": process.env.NEXTAUTH_INTERNAL_SECRET ?? "",
    "X-Player-Id": String(playerId),
  };
}
