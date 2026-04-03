import { NextResponse } from "next/server";

const DJANGO_URL = process.env.DJANGO_URL ?? "http://localhost:8000";
const IS_DEV = process.env.NODE_ENV !== "production";
const ALLOWED_HOSTS = ["localhost", "127.0.0.1"];

function isTrustedUrl(urlStr: string): boolean {
  try {
    const { hostname, protocol } = new URL(urlStr);
    const isLocalhost = ALLOWED_HOSTS.some(h => hostname === h || hostname.endsWith("." + h));
    // In production, only allow HTTPS. In development, allow HTTP for localhost only.
    if (IS_DEV && isLocalhost) return protocol === "http:" || protocol === "https:";
    return protocol === "https:";
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

  let res: Response;
  try {
    res = await fetch(`${DJANGO_URL}${path}`, options);
  } catch {
    if (errorFallback) return NextResponse.json(errorFallback);
    return NextResponse.json(
      { error: "Cannot connect to server. Make sure the backend is running." },
      { status: 503 }
    );
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
    // Handle Django's nested error format: { detail, messages: [{message}] }
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
