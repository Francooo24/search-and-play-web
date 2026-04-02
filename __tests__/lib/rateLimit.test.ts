import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

// Reset the internal store between tests by re-importing with jest module isolation
beforeEach(() => jest.resetModules());

describe("rateLimit", () => {
  it("allows first request", () => {
    expect(rateLimit("test:1.1.1.1", 3, 60_000)).toBe(false);
  });

  it("allows requests up to the limit", () => {
    const key = "test:2.2.2.2";
    expect(rateLimit(key, 3, 60_000)).toBe(false); // 1
    expect(rateLimit(key, 3, 60_000)).toBe(false); // 2
    expect(rateLimit(key, 3, 60_000)).toBe(false); // 3
  });

  it("blocks request over the limit", () => {
    const key = "test:3.3.3.3";
    rateLimit(key, 3, 60_000); // 1
    rateLimit(key, 3, 60_000); // 2
    rateLimit(key, 3, 60_000); // 3
    expect(rateLimit(key, 3, 60_000)).toBe(true); // 4 — blocked
  });

  it("resets after window expires", () => {
    jest.useFakeTimers();
    const key = "test:4.4.4.4";
    rateLimit(key, 2, 1_000);
    rateLimit(key, 2, 1_000);
    expect(rateLimit(key, 2, 1_000)).toBe(true); // blocked

    jest.advanceTimersByTime(1_001);
    expect(rateLimit(key, 2, 1_000)).toBe(false); // reset — allowed again
    jest.useRealTimers();
  });

  it("tracks different keys independently", () => {
    rateLimit("test:a", 1, 60_000);
    expect(rateLimit("test:a", 1, 60_000)).toBe(true);  // blocked
    expect(rateLimit("test:b", 1, 60_000)).toBe(false); // different key — allowed
  });
});

describe("rateLimitResponse", () => {
  it("returns 429 status", async () => {
    const res = rateLimitResponse();
    expect(res.status).toBe(429);
  });

  it("returns default error message", async () => {
    const res = rateLimitResponse();
    const body = await res.json();
    expect(body.error).toMatch(/too many requests/i);
  });

  it("returns custom error message", async () => {
    const res = rateLimitResponse("Slow down!");
    const body = await res.json();
    expect(body.error).toBe("Slow down!");
  });
});
