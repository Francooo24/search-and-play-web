export async function checkAchievements(): Promise<{ icon: string; name: string; description: string }[]> {
  try {
    const res = await fetch("/api/achievements/check", { method: "POST", credentials: "include" });
    const data = await res.json();
    return data.newAchievements ?? [];
  } catch {
    return [];
  }
}
