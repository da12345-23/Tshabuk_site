"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "@/lib/locale-context";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard-client";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const TOP_N = 10;

function Row({
  entry,
  rank,
  mine,
  delay,
}: {
  entry: LeaderboardEntry;
  rank: number;
  mine: boolean;
  delay: number;
}) {
  return (
    <motion.div
      key={entry.id}
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`px-5 py-3 grid grid-cols-[3.4rem_1fr_4.5rem] items-center font-body text-sm border-b border-[var(--color-border)]/15 last:border-b-0 ${
        mine ? "bg-[var(--color-accent)]/20" : ""
      }`}
    >
      <span className="text-[var(--color-text-muted)] font-semibold">
        {MEDAL[rank - 1] ?? rank}
      </span>
      <span className={`truncate ${mine ? "font-bold text-[var(--color-secondary)]" : "text-[var(--color-text)]"}`}>
        {entry.name}
      </span>
      <span className="text-end tabular-nums text-[var(--color-text)]">
        {formatTime(entry.time_ms)}
      </span>
    </motion.div>
  );
}

export function Leaderboard({ highlightId }: { highlightId?: string | null }) {
  const { t } = useLocale();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [mine, setMine] = useState<string | null>(highlightId ?? null);

  useEffect(() => {
    if (highlightId !== undefined) return;
    try {
      setMine(window.sessionStorage.getItem("tashabuk-last-entry"));
    } catch {
      // ignore
    }
  }, [highlightId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await fetchLeaderboard();
      if (!cancelled) setEntries(data);
    }
    load();
    const interval = window.setInterval(load, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const topEntries = entries?.slice(0, TOP_N) ?? [];
  const myIndex = entries?.findIndex((e) => e.id === mine) ?? -1;
  const myEntry = myIndex >= TOP_N ? entries?.[myIndex] : undefined;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl bg-[var(--color-surface-raised)]/90 backdrop-blur border border-[var(--color-border)]/40 shadow-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border)]/30 grid grid-cols-[3.4rem_1fr_4.5rem] text-xs font-semibold text-[var(--color-text-muted)] font-body">
          <span>{t.leaderboard.rank}</span>
          <span>{t.leaderboard.name}</span>
          <span className="text-end">{t.leaderboard.time}</span>
        </div>

        {entries === null && (
          <div className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)] font-body">
            {t.leaderboard.loading}
          </div>
        )}

        {entries !== null && entries.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)] font-body">
            {t.leaderboard.empty}
          </div>
        )}

        <AnimatePresence initial={false}>
          {topEntries.map((e, i) => (
            <Row key={e.id} entry={e} rank={i + 1} mine={e.id === mine} delay={Math.min(i, 8) * 0.035} />
          ))}

          {myEntry && (
            <div key="gap" className="px-5 py-1.5 text-center text-xs text-[var(--color-text-muted)] font-body select-none">
              &bull; &bull; &bull;
            </div>
          )}
          {myEntry && <Row key={myEntry.id} entry={myEntry} rank={myIndex + 1} mine delay={0} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
