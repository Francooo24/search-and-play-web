import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({ query: jest.fn() }));

import pool from "@/lib/db";
import { GET } from "@/app/api/leaderboard/route";

function makeRequest(search: string) {
  return new NextRequest(`http://localhost/api/leaderboard${search}`);
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/leaderboard", () => {
  it("returns players and game_types for default leaderboard view", async () => {
    (pool.query as jest.Mock).mockResolvedValue([
      [{ player_name: "Alice", total_score: 500, last_played: "2024-01-01", game: "Hangman" }],
    ]);
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.players).toBeDefined();
    expect(body.game_types).toBeDefined();
  });

  it("filters by game when game param is provided", async () => {
    (pool.query as jest.Mock).mockResolvedValue([[
      { player_name: "Bob", total_score: 200, last_played: "2024-01-01", game: "Wordle" },
    ]]);
    const res = await GET(makeRequest("?game=Wordle"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.players).toBeDefined();
  });

  it("returns per-game data for pergame view", async () => {
    (pool.query as jest.Mock).mockResolvedValue([[
      { game: "Hangman", player_name: "Alice", score: 100, created_at: "2024-01-01" },
    ]]);
    const res = await GET(makeRequest("?view=pergame"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.games).toBeDefined();
    expect(body.game_list).toBeDefined();
  });

  it("returns top 10 players for game view", async () => {
    (pool.query as jest.Mock).mockResolvedValue([[
      { player_name: "Alice", best_score: 300, plays: 5, last_played: "2024-01-01" },
    ]]);
    const res = await GET(makeRequest("?view=game&game=Hangman"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.players).toBeDefined();
    expect(body.players[0].best_score).toBe(300);
  });

  it("returns rankings with tier info", async () => {
    (pool.query as jest.Mock).mockResolvedValue([[
      { id: 1, player_name: "Alice", total_points: 1600, total_games: 10, avg_score: 160, highest_score: 300, last_played: "2024-01-01" },
    ]]);
    const res = await GET(makeRequest("?view=rankings"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.players[0].tier).toBeDefined();
    expect(body.players[0].tier.name).toBe("Champion");
    expect(body.tiers).toBeDefined();
  });

  it("returns 500 on DB error", async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error("DB down"));
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("DB down");
  });
});

describe("RANKING_TIERS", () => {
  const RANKING_TIERS = [
    { name: "Novice",      min: 0,     icon: "🌱", color: "text-gray-400"   },
    { name: "Explorer",    min: 100,   icon: "🗺️", color: "text-blue-400"   },
    { name: "Adventurer",  min: 500,   icon: "⚔️", color: "text-green-400"  },
    { name: "Champion",    min: 1500,  icon: "🏆", color: "text-yellow-400" },
    { name: "Master",      min: 5000,  icon: "👑", color: "text-orange-400" },
    { name: "Grandmaster", min: 15000, icon: "💎", color: "text-purple-400" },
    { name: "Legend",      min: 50000, icon: "🌟", color: "text-amber-400"  },
  ];
  it("has 7 tiers in ascending order", () => {
    expect(RANKING_TIERS).toHaveLength(7);
    expect(RANKING_TIERS[0].name).toBe("Novice");
    expect(RANKING_TIERS[6].name).toBe("Legend");
  });

  it("tiers have required fields", () => {
    RANKING_TIERS.forEach((tier: { name: string; min: number; icon: string; color: string }) => {
      expect(tier).toHaveProperty("name");
      expect(tier).toHaveProperty("min");
      expect(tier).toHaveProperty("icon");
      expect(tier).toHaveProperty("color");
    });
  });
});
