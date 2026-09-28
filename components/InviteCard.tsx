"use client";

import { forwardRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLocale } from "@/lib/locale-context";
import { fetchLeaderboard } from "@/lib/leaderboard-client";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export const InviteCard = forwardRef<
  HTMLDivElement,
  { name: string; elapsedMs: number; onRankSettled?: () => void; width?: string }
>(function InviteCard({ name, elapsedMs, onRankSettled, width = "min(94vw, 390px)" }, ref) {
    const { t } = useLocale();
    const [rank, setRank] = useState<number | null>(null);

    useEffect(() => {
      let cancelled = false;
      async function loadRank() {
        let mine: string | null = null;
        try {
          mine = window.sessionStorage.getItem("tashabuk-last-entry");
        } catch {
          // ignore
        }
        if (!mine) {
          onRankSettled?.();
          return;
        }
        const entries = await fetchLeaderboard();
        const index = entries.findIndex((e) => e.id === mine);
        if (!cancelled && index >= 0) setRank(index + 1);
        onRankSettled?.();
      }
      loadRank();
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.85, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto"
        style={{ width }}
      >
        {/* Mascots peeking in from outside the card -- mostly outside its
            bounds, only a small edge overlapping, so the card edge never
            slices through the middle of a character. Size and offset are
            fixed pixels, not a % of card width: this same component
            renders at two different widths (the on-page card and the
            wider export card), and percentage values would scale the
            mascots up and shift them further onto the wider one -- enough
            to cover the card's own text. */}
        <motion.div
          className="absolute pointer-events-none select-none z-20"
          style={{ width: 124, right: -30, top: 12 }}
          animate={{ y: [0, -7, 0], rotate: [-3, 2, -3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- plain
              img is required: next/image renders unreliably (sometimes the
              wrong source entirely) inside the off-screen html-to-image
              export target. */}
          <img
            src="/images/brand/mascot-nerve-t.png"
            alt=""
            className="w-full h-auto block"
            style={{ filter: "drop-shadow(0 10px 12px rgba(43,35,32,.28))" }}
          />
        </motion.div>
        <motion.div
          className="absolute pointer-events-none select-none z-20"
          style={{ width: 104, left: -24, top: "62%" }}
          animate={{ y: [0, 8, 0], rotate: [3, -2, 3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/mascot-muscle-t.png"
            alt=""
            className="w-full h-auto block"
            style={{ filter: "drop-shadow(0 10px 12px rgba(43,35,32,.28))" }}
          />
        </motion.div>

        {/* Notepad */}
        <div
          className="relative rounded-t-[32px] rounded-b-[10px] px-8 pt-12 pb-12 text-center"
          style={{
            background: "var(--color-cream-50)",
            border: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)",
          }}
        >
          {/* Campaign logo: the card's header element, large and centered */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/logo-clean-t.png"
            alt={t.appName}
            className="mx-auto mb-4 block"
            style={{ width: 118, height: 118, objectFit: "contain" }}
          />

          <p className="font-display text-sm text-[var(--color-secondary)] tracking-wide">
            {t.invite.greeting}
          </p>
          <h2 className="font-display text-[26px] font-bold text-[var(--color-text)] mt-3 break-words max-w-full">
            {name}
          </h2>

          <p className="font-body text-[14.5px] leading-[1.95] text-[var(--color-text-muted)] mt-6">
            {t.invite.body}
          </p>

          {elapsedMs > 0 && (
            <div className="mt-7 flex items-center justify-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)]/25 px-3 py-1 text-[11px] font-semibold text-[var(--color-text)]">
                {t.invite.yourTime}: {formatTime(elapsedMs)}
              </div>
              {rank !== null && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/15 px-3 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
                  {t.invite.yourRank}: #{rank}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer band with the seal + event details */}
        <div
          className="relative rounded-b-[32px] rounded-t-[10px] pt-10 pb-7 px-6"
          style={{
            background:
              "linear-gradient(160deg, var(--color-wood-300) 0%, var(--color-sage-500) 55%, var(--color-wood-500) 100%)",
          }}
        >
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[var(--color-cream-50)] ring-2 ring-[var(--color-wood-300)] shadow-md flex items-center justify-center overflow-hidden"
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/piece-mustard-t.png"
              alt=""
              style={{ width: 28, height: 28, objectFit: "contain" }}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-cream-50)]/90 px-3.5 py-2.5 text-[12.5px] text-[var(--color-text)] font-body">
              <span className="text-[var(--color-secondary)]"><PinIcon /></span>
              <span className="font-semibold text-[var(--color-primary)]">{t.invite.locationLabel}</span>
              <span className="truncate">{t.eventLocation}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-cream-50)]/90 px-3.5 py-2.5 text-[12.5px] text-[var(--color-text)] font-body">
              <span className="text-[var(--color-secondary)]"><CalendarIcon /></span>
              <span className="font-semibold text-[var(--color-primary)]">{t.invite.dateLabel}</span>
              <span className="truncate">{t.eventDates}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);
