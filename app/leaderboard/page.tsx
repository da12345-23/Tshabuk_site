"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Leaderboard } from "@/components/Leaderboard";
import { LangToggle } from "@/components/LangToggle";
import { FloatingPieces } from "@/components/FloatingPieces";
import { useLocale } from "@/lib/locale-context";

export default function LeaderboardPage() {
  const { t } = useLocale();

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center py-10 px-4 overflow-hidden">
      <FloatingPieces />

      <div className="fixed top-4 inset-x-0 flex justify-between items-center px-4 z-50">
        <Link
          href="/"
          className="font-body text-xs font-semibold rounded-full px-3.5 py-1.5 bg-[var(--color-surface-raised)]/80 backdrop-blur border border-[var(--color-border)]/40 text-[var(--color-text)] shadow-sm"
        >
          {t.leaderboard.back}
        </Link>
        <LangToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full flex flex-col items-center gap-6"
      >
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            {t.leaderboard.title}
          </h1>
          <p className="font-body text-sm text-[var(--color-text-muted)] mt-1">
            {t.leaderboard.subtitle}
          </p>
        </div>
        <Leaderboard />
      </motion.div>
    </main>
  );
}
