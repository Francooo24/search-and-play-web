type Entry = { count: number; reset: number };
const store = new Map<string, Entry>();

/**
 * Returns true if the request should be blocked.
 * @param key      Unique key, e.g. `"login:1.2.3.4"`
 * @param limit    Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

export function rateLimitResponse(message = "Too many requests. Please try again later.") {
  return Response.json({ error: message }, { status: 429 });
}
