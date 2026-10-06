"use client";

import { forwardRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLocale } from "@/lib/locale-context";
import { fetchRank } from "@/lib/leaderboard-client";

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

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export const InviteCard = forwardRef<
  HTMLDivElement,
  {
    name: string;
    elapsedMs: number;
    /** The guest's saved leaderboard entry: undefined while the score is
     *  still being saved, null if there is none (or saving failed). */
    entryId?: string | null;
    onRankSettled?: () => void;
    width?: string;
    /** Play the pop-in entrance (off for the hidden copy the photo is
     *  drawn from, so a photo can never catch it half-faded). */
    animateIn?: boolean;
  }
>(function InviteCard({ name, elapsedMs, entryId, onRankSettled, width = "min(84vw, 370px)", animateIn = true }, ref) {
    const { t } = useLocale();
    const [rank, setRank] = useState<number | null>(null);

    // Wait for the score to be saved before asking for its rank -- asking
    // earlier showed no rank, or a stale one from a previous play.
    useEffect(() => {
      if (entryId === undefined) return;
      let cancelled = false;
      setRank(null);
      (async () => {
        const r = entryId ? await fetchRank(entryId) : null;
        if (cancelled) return;
        setRank(r);
        onRankSettled?.();
      })();
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryId]);

    return (
      <motion.div
        ref={ref}
        initial={animateIn ? { opacity: 0, scale: 0.85, y: 24 } : false}
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
          style={{ width: 112, right: -22, top: 12 }}
          animate={{ y: [0, -7, 0], rotate: [-3, 2, -3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- plain
              img is required: next/image renders unreliably (sometimes the
              wrong source entirely) inside the off-screen photo
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
          // Anchored to the bottom (not a % of the height, which drifts as
          // the card's text changes): it stands beside the event-details
          // rows, in the space their left padding keeps free for it.
          style={{ width: 86, left: -22, bottom: 16 }}
          animate={{ y: [0, -6, 0], rotate: [3, -2, 3] }}
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
          className="relative rounded-t-[32px] rounded-b-[10px] px-7 pt-7 pb-6 text-center"
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
            className="mx-auto mb-2 block"
            style={{ width: 90, height: 90, objectFit: "contain" }}
          />

          <p className="font-display text-sm text-[var(--color-secondary)] tracking-wide">
            {t.invite.greeting}
          </p>
          <h2 className="font-display text-[26px] font-bold text-[var(--color-text)] mt-1 break-words max-w-full">
            {name}
          </h2>

          <div className="font-body text-[14px] leading-[1.7] text-[var(--color-text-muted)] mt-3 flex flex-col gap-2">
            <p className="font-display text-[15.5px] font-bold text-[var(--color-secondary)]">{t.invite.lead}</p>
            <p>
              {t.invite.bodyLines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
            <p className="font-semibold text-[var(--color-text)]">{t.invite.closing}</p>
          </div>

          {elapsedMs > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
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
          className="relative rounded-b-[32px] rounded-t-[10px] pt-8 pb-5 px-6"
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

          {/* Physical left padding (in both languages) leaves room for the
              muscle mascot, so it never covers an icon, label or value. */}
          <div className="flex flex-col gap-2" style={{ paddingLeft: 46 }}>
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-cream-50)]/90 px-3.5 py-2 text-[12.5px] text-[var(--color-text)] font-body">
              <span className="text-[var(--color-secondary)]"><PinIcon /></span>
              <span className="font-semibold text-[var(--color-primary)]">{t.invite.locationLabel}</span>
              <span className="truncate">{t.eventLocation}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-cream-50)]/90 px-3.5 py-2 text-[12.5px] text-[var(--color-text)] font-body">
              <span className="text-[var(--color-secondary)]"><CalendarIcon /></span>
              <span className="font-semibold text-[var(--color-primary)]">{t.invite.dateLabel}</span>
              <span className="truncate">{t.eventDates}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-cream-50)]/90 px-3.5 py-2 text-[12.5px] text-[var(--color-text)] font-body">
              <span className="text-[var(--color-secondary)]"><ClockIcon /></span>
              <span className="font-semibold text-[var(--color-primary)]">{t.invite.timeLabel}</span>
              <span className="truncate">{t.eventTime}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);
