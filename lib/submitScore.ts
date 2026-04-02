import { checkAchievements } from "./checkAchievements";

export interface ScoreResult {
  saved: boolean;
  error?: "not_logged_in" | "backend_down" | "unknown";
  badges: { icon: string; name: string; description: string }[];
}

function dispatchScoreEvent(result: ScoreResult, score: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("score-saved", { detail: { result, score } }));
}

export async function submitScore(
  game: string,
  score: number,
  difficulty?: string
): Promise<ScoreResult> {
  if (score <= 0) return { saved: false, badges: [] };

  try {
    const res = await fetch("/api/games/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ game, won: true, score, difficulty }),
    });

    if (res.status === 401) {
      const r: ScoreResult = { saved: false, error: "not_logged_in", badges: [] };
      dispatchScoreEvent(r, score);
      return r;
    }
    if (res.status === 503 || res.status === 502) {
      const r: ScoreResult = { saved: false, error: "backend_down", badges: [] };
      dispatchScoreEvent(r, score);
      return r;
    }
    if (!res.ok) {
      const r: ScoreResult = { saved: false, error: "unknown", badges: [] };
      dispatchScoreEvent(r, score);
      return r;
    }

    const badges = await checkAchievements();
    const r: ScoreResult = { saved: true, badges };
    dispatchScoreEvent(r, score);
    return r;
  } catch {
    const r: ScoreResult = { saved: false, error: "backend_down", badges: [] };
    dispatchScoreEvent(r, score);
    return r;
  }
}

// Backward-compatible wrapper for games using .then(setNewBadges)
export async function submitScoreCompat(
  game: string,
  score: number
): Promise<{ icon: string; name: string; description: string }[]> {
  const result = await submitScore(game, score);
  return result.badges;
}

export async function fetchBestScore(game: string): Promise<number> {
  try {
    const res = await fetch(`/api/games/score?game=${encodeURIComponent(game)}`, {
      credentials: "include",
    });
    const data = await res.json();
    return data.bestScore ?? 0;
  } catch { return 0; }
}
