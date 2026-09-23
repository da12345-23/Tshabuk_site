export type LeaderboardEntry = {
  id: string;
  name: string;
  time_ms: number;
  locale: string;
  created_at: string;
};

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch("/api/leaderboard", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.entries ?? [];
}

export async function submitScore(name: string, timeMs: number, locale: string) {
  const res = await fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, timeMs, locale }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.entry as LeaderboardEntry | null;
}
