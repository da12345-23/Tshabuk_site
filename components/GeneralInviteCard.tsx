"use client";

import { motion } from "motion/react";
import { useLocale } from "@/lib/locale-context";

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-600)" strokeWidth="2" strokeLinecap="round">
      <path d="M8 12.5 15.5 5a3.2 3.2 0 0 1 4.5 4.5L11 18.5a5 5 0 0 1-7-7L12.5 3" />
    </svg>
  );
}

// A soft, organic "leaf" blob -- the same shape language as the campaign's
// own illustrated invite art, peeking out from behind the note.
function Blob({ color, size, style }: { color: string; size: number; style: React.CSSProperties }) {
  return (
    <div
      className="absolute"
      style={{
        width: size,
        height: size * 0.68,
        background: color,
        opacity: 0.5,
        borderRadius: "62% 38% 55% 45% / 45% 55% 42% 58%",
        ...style,
      }}
      aria-hidden
    />
  );
}

/**
 * The generic (non-personalized) invitation shown on /envelope -- the full
 * card from the campaign's own illustrated invite art: paperclip, logo and
 * wordmark, heading, the complete invitation text, mascots, a puzzle-piece
 * wax seal at the fold, and the location/date boxes. Sized to read as a
 * keepsake rather than a snippet.
 */
export function GeneralInviteCard({ paused = false }: { paused?: boolean }) {
  const { t } = useLocale();
  const g = t.generalInvite;

  return (
    <div className="relative mx-auto" style={{ width: "min(94vw, 420px)" }}>
      {/* Organic color blobs behind the note, matching the reference art */}
      <Blob color="var(--color-sage-600)" size={170} style={{ top: -22, left: -30, transform: "rotate(-8deg)" }} />
      <Blob color="var(--color-maroon-500)" size={120} style={{ top: "46%", right: -34, transform: "rotate(10deg)" }} />
      <Blob color="var(--color-mustard-400)" size={90} style={{ bottom: -14, left: -22, transform: "rotate(-14deg)" }} />

      {/* Paperclip pinned at the top edge */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20 rotate-[8deg]" style={{ top: -22 }} aria-hidden>
        <PaperclipIcon />
      </div>

      {/* Neuron at the top, beside the logo */}
      <motion.div
        className="absolute pointer-events-none select-none z-20"
        style={{ width: 150, left: -22, top: 14, willChange: "transform" }}
        animate={paused ? undefined : { y: [0, -7, 0], rotate: [-3, 2, -3] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/mascot-nerve-t.png"
          alt=""
          className="w-full h-auto block"
          style={{ filter: "drop-shadow(0 10px 12px rgba(43,35,32,.28))" }}
        />
      </motion.div>

      {/* Note: dashed-border paper card with the logo, heading and text */}
      <div
        className="relative rounded-[40px] px-7 sm:px-9 pt-16 pb-12 text-center z-10"
        style={{
          background: "var(--color-cream-50)",
          border: "2px dashed color-mix(in srgb, var(--color-wood-500) 55%, transparent)",
          boxShadow: "0 14px 26px rgba(43,35,32,.16)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/logo-clean-t.png"
          alt=""
          className="mx-auto block"
          style={{ width: 116, height: 116, objectFit: "contain" }}
        />
        <p className="font-display text-[22px] font-bold text-[var(--color-secondary)] -mt-1 tracking-wide">
          {t.appName}
        </p>

        <h2 className="font-display text-[32px] leading-tight font-bold text-[var(--color-text)] mt-5">
          {g.title}
        </h2>

        <div className="font-body text-[15.5px] leading-[2] text-[var(--color-text-muted)] mt-6 flex flex-col gap-4">
          <p>{g.intro}</p>
          <p className="font-display text-[17px] font-bold text-[var(--color-secondary)]">{g.question}</p>
          <p>{g.body}</p>
          <p className="font-semibold text-[var(--color-text)]">{g.closing}</p>
        </div>
      </div>

      {/* The fold: a puzzle-piece wax seal on a thin divider, sealing the
          note to the details below. */}
      <div className="relative z-10 flex items-center gap-3 mt-7 px-4" aria-hidden>
        <span className="flex-1 h-px" style={{ background: "color-mix(in srgb, var(--color-wood-500) 45%, transparent)" }} />
        <span
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: "radial-gradient(circle at 35% 30%, var(--color-cream-50), var(--color-cream-100))",
            boxShadow: "0 0 0 3px var(--color-wood-300), 0 0 0 6px color-mix(in srgb, var(--color-wood-300) 35%, transparent), 0 6px 12px rgba(43,35,32,.2)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/piece-green-t.png" alt="" style={{ width: 36, height: 36, objectFit: "contain" }} />
        </span>
        <span className="flex-1 h-px" style={{ background: "color-mix(in srgb, var(--color-wood-500) 45%, transparent)" }} />
      </div>

      {/* Location + date, as two side-by-side colored boxes. The right
          side is left free for the muscle mascot standing beside them. */}
      <div className="relative z-10 flex gap-3 mt-6" style={{ paddingRight: 100 }}>
        <div
          className="flex-1 flex flex-col items-center gap-1.5 rounded-3xl px-3 py-4 text-[13.5px] font-body"
          style={{ background: "color-mix(in srgb, var(--color-sage-500) 22%, var(--color-cream-50))" }}
        >
          <span className="text-[var(--color-sage-600)]"><PinIcon /></span>
          <span className="font-semibold text-[var(--color-text)]">{t.invite.locationLabel}</span>
          <span className="text-[var(--color-text-muted)] text-center leading-snug">{t.eventLocation}</span>
        </div>
        <div
          className="flex-1 flex flex-col items-center gap-1.5 rounded-3xl px-3 py-4 text-[13.5px] font-body"
          style={{ background: "color-mix(in srgb, var(--color-maroon-500) 22%, var(--color-cream-50))" }}
        >
          <span className="text-[var(--color-secondary)]"><CalendarIcon /></span>
          <span className="font-semibold text-[var(--color-text)]">{t.invite.dateLabel}</span>
          <span className="text-[var(--color-text-muted)] text-center leading-snug">{t.eventDates}</span>
        </div>
      </div>

      {/* Muscle at the bottom, beside the boxes */}
      <motion.div
        className="absolute pointer-events-none select-none z-20"
        style={{ width: 116, right: -16, bottom: -8, willChange: "transform" }}
        animate={paused ? undefined : { y: [0, 8, 0], rotate: [3, -2, 3] }}
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
    </div>
  );
}
