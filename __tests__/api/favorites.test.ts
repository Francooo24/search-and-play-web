import { NextRequest } from "next/server";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/db", () => ({ query: jest.fn() }));

import { getServerSession } from "next-auth";
import pool from "@/lib/db";
import { POST } from "@/app/api/favorites/games/route";

const mockSession = (user: object | null) =>
  (getServerSession as jest.Mock).mockResolvedValue(user ? { user } : null);

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/favorites/games", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
});

describe("POST /api/favorites/games", () => {
  it("returns 401 when not logged in", async () => {
    mockSession(null);
    const res = await POST(makeRequest({ action: "save", game: "Hangman" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid game name", async () => {
    mockSession({ id: 1 });
    const res = await POST(makeRequest({ action: "save", game: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid action", async () => {
    mockSession({ id: 1 });
    const res = await POST(makeRequest({ action: "delete", game: "Hangman" }));
    expect(res.status).toBe(400);
  });

  it("saves a game to favorites", async () => {
    mockSession({ id: 1 });
    const res = await POST(makeRequest({ action: "save", game: "Hangman" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.saved).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT"),
      expect.arrayContaining([1, "Hangman"])
    );
  });

  it("removes a game from favorites", async () => {
    mockSession({ id: 1 });
    const res = await POST(makeRequest({ action: "remove", game: "Hangman" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.saved).toBe(false);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE"),
      expect.arrayContaining([1, "Hangman"])
    );
  });
});
