import { NextRequest } from "next/server";

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn(() => false),
  rateLimitResponse: jest.fn(() => new Response("rate limited", { status: 429 })),
}));
jest.mock("@/lib/db", () => ({ query: jest.fn() }));
jest.mock("bcryptjs", () => ({ hash: jest.fn(() => "hashed_password") }));
jest.mock("crypto", () => ({ randomBytes: jest.fn(() => ({ toString: () => "abc123token" })) }));

import pool from "@/lib/db";
import { POST } from "@/app/api/auth/register/route";

const validBody = {
  player_name: "TestUser",
  email: "test@example.com",
  password: "password123",
  confirm_password: "password123",
  birthdate: "2000-01-01",
};

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
});

describe("POST /api/auth/register", () => {
  it("returns 400 when player_name is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, player_name: "" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/player name is required/i);
  });

  it("returns 400 when email is invalid", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "not-an-email" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid email/i);
  });

  it("returns 400 when password is too short", async () => {
    const res = await POST(makeRequest({ ...validBody, password: "abc", confirm_password: "abc" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/at least 6 characters/i);
  });

  it("returns 400 when passwords do not match", async () => {
    const res = await POST(makeRequest({ ...validBody, confirm_password: "different" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/do not match/i);
  });

  it("returns 400 when birthdate is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, birthdate: "" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/birthdate is required/i);
  });

  it("returns 409 when email is already registered", async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already registered/i);
  });

  it("returns verifyLink and email on successful registration", async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })          // SELECT existing (none)
      .mockResolvedValueOnce({ rows: [] })          // DELETE pending
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // INSERT pending
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.verifyLink).toBeDefined();
    expect(body.email).toBe("test@example.com");
  });
});
