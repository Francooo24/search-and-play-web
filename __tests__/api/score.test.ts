import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/db", () => ({ query: jest.fn() }));

import { getServerSession } from "next-auth";
import pool from "@/lib/db";
import { POST, GET } from "@/app/api/games/score/route";

const mockSession = (user: object | null) =>
  (getServerSession as jest.Mock).mockResolvedValue(user ? { user } : null);

const mockQuery = (result: any) =>
  (pool.query as jest.Mock).mockResolvedValue([result]);

function makeRequest(body?: object, method = "POST", search = "") {
  const url = `http://localhost/api/games/score${search}`;
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => jest.clearAllMocks());

// ── POST /api/games/score ─────────────────────────────────────────────────────
describe("POST /api/games/score", () => {
  it("returns 401 when not logged in", async () => {
    mockSession(null);
    const res = await POST(makeRequest({ game: "Hangman", won: true, score: 50 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid game name", async () => {
    mockSession({ id: 1, name: "Player" });
    const res = await POST(makeRequest({ game: "", won: true, score: 50 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid game/i);
  });

  it("returns 400 for invalid score", async () => {
    mockSession({ id: 1, name: "Player" });
    const res = await POST(makeRequest({ game: "Hangman", won: true, score: -1 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid score/i);
  });

  it("saves score and activity log on valid submission", async () => {
    mockSession({ id: 1, name: "Player" });
    (pool.query as jest.Mock).mockResolvedValue([{}]);
    const res = await POST(makeRequest({ game: "Hangman", won: true, score: 100 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.pts).toBe(100);
    expect(pool.query).toHaveBeenCalledTimes(2); // leaderboard + activity_log
  });

  it("skips leaderboard insert when score is 0", async () => {
    mockSession({ id: 1, name: "Player" });
    (pool.query as jest.Mock).mockResolvedValue([{}]);
    const res = await POST(makeRequest({ game: "Hangman", won: false, score: 0 }));
    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledTimes(1); // only activity_log
  });
});

// ── GET /api/games/score ──────────────────────────────────────────────────────
describe("GET /api/games/score", () => {
  it("returns bestScore 0 when not logged in", async () => {
    mockSession(null);
    const res = await GET(makeRequest(undefined, "GET", "?game=Hangman"));
    const body = await res.json();
    expect(body.bestScore).toBe(0);
  });

  it("returns bestScore from DB", async () => {
    mockSession({ id: 1, name: "Player" });
    mockQuery([{ best: 250 }]);
    const res = await GET(makeRequest(undefined, "GET", "?game=Hangman"));
    const body = await res.json();
    expect(body.bestScore).toBe(250);
  });

  it("returns bestScore 0 when no scores exist", async () => {
    mockSession({ id: 1, name: "Player" });
    mockQuery([{ best: null }]);
    const res = await GET(makeRequest(undefined, "GET", "?game=Hangman"));
    const body = await res.json();
    expect(body.bestScore).toBe(0);
  });
});
