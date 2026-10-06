import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type LeaderboardEntry = {
  id: string;
  name: string;
  time_ms: number;
  locale: string;
  created_at: string;
};

// In-memory fallback so local `npm run dev` works before Supabase is wired up.
// Not shared across serverless instances in production — replace with real
// SUPABASE_URL / SUPABASE_ANON_KEY env vars before deploying.
const memoryStore: LeaderboardEntry[] = [];

const TOP = 50;

// GET                -> the top 50, fastest first (ties: who finished first).
// GET ?rank=<id>     -> that entry and its exact place, however far down.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("rank");
  if (id) return rankOf(id);

  if (supabase) {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("time_ms", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(TOP);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entries: data, backend: "supabase" });
  }

  return NextResponse.json({ entries: sortedMemory().slice(0, TOP), backend: "memory" });
}

function sortedMemory() {
  return [...memoryStore].sort((a, b) => a.time_ms - b.time_ms || a.created_at.localeCompare(b.created_at));
}

async function rankOf(id: string) {
  if (!supabase) {
    const all = sortedMemory();
    const index = all.findIndex((e) => e.id === id);
    return index < 0
      ? NextResponse.json({ error: "Not found" }, { status: 404 })
      : NextResponse.json({ entry: all[index], rank: index + 1 });
  }

  const { data: entry, error } = await supabase.from("leaderboard").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Same order as the list: faster times first, then earlier finishers.
  const [faster, tiedEarlier] = await Promise.all([
    supabase.from("leaderboard").select("id", { count: "exact", head: true }).lt("time_ms", entry.time_ms),
    supabase
      .from("leaderboard")
      .select("id", { count: "exact", head: true })
      .eq("time_ms", entry.time_ms)
      .lt("created_at", entry.created_at),
  ]);
  if (faster.error || tiedEarlier.error) {
    return NextResponse.json({ error: (faster.error ?? tiedEarlier.error)!.message }, { status: 500 });
  }
  return NextResponse.json({ entry, rank: (faster.count ?? 0) + (tiedEarlier.count ?? 0) + 1 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  // Cut by whole characters, never through the middle of an emoji.
  const name = typeof body?.name === "string" ? Array.from(body.name.trim() as string).slice(0, 60).join("") : "";
  const timeMs = typeof body?.timeMs === "number" ? Math.round(body.timeMs) : NaN;
  const locale = body?.locale === "en" ? "en" : "ar";

  if (!name || !Number.isFinite(timeMs) || timeMs < 0 || timeMs > 3_600_000) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (supabase) {
    const { data, error } = await supabase
      .from("leaderboard")
      .insert({ name, time_ms: timeMs, locale })
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entry: data, backend: "supabase" });
  }

  const entry: LeaderboardEntry = {
    id: crypto.randomUUID(),
    name,
    time_ms: timeMs,
    locale,
    created_at: new Date().toISOString(),
  };
  memoryStore.push(entry);
  return NextResponse.json({ entry, backend: "memory" });
}
