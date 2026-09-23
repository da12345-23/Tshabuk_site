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

export async function GET() {
  if (supabase) {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("time_ms", { ascending: true })
      .limit(50);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entries: data, backend: "supabase" });
  }

  const sorted = [...memoryStore].sort((a, b) => a.time_ms - b.time_ms).slice(0, 50);
  return NextResponse.json({ entries: sorted, backend: "memory" });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
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
