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

/** The guest's own entry and exact place on the leaderboard, even when
 *  it's below the top 50 that the list shows. */
export async function fetchMine(id: string): Promise<{ entry: LeaderboardEntry; rank: number } | null> {
  try {
    const res = await fetch(`/api/leaderboard?rank=${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchRank(id: string): Promise<number | null> {
  return (await fetchMine(id))?.rank ?? null;
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
