"use client";

import { motion } from "motion/react";
import { useLocale } from "@/lib/locale-context";

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.2" strokeLinecap="round">
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
 * The generic (non-personalized) invitation shown on /envelope -- composed
 * to echo the campaign's own illustrated invite art (organic sage/rust
 * blobs behind a dashed note, paperclip, mascots flanking, a location/date
 * info bar) rather than the plain notepad-style card used by the main
 * flow's InviteCard. The puzzle-piece wax seal lives on the envelope flap.
 */
export function GeneralInviteCard({ paused = false }: { paused?: boolean }) {
  const { t } = useLocale();

  return (
    <div className="relative mx-auto" style={{ width: "min(88vw, 320px)" }}>
      {/* Organic color blobs behind the note, matching the reference art */}
      <Blob color="var(--color-sage-600)" size={140} style={{ top: -18, left: -26, transform: "rotate(-8deg)" }} />
      <Blob color="var(--color-maroon-500)" size={100} style={{ bottom: 40, right: -30, transform: "rotate(10deg)" }} />
      <Blob color="var(--color-mustard-400)" size={70} style={{ bottom: -10, left: -18, transform: "rotate(-14deg)" }} />

      {/* Paperclip pinned at the top edge */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20 rotate-[8deg]" style={{ top: -16 }} aria-hidden>
        <PaperclipIcon />
      </div>

      {/* Mascots flanking the card, bigger and more overlapping -- closer
          to the reference art's proportions than the main flow's card. */}
      <motion.div
        className="absolute pointer-events-none select-none z-20"
        style={{ width: 118, left: -24, top: 30, willChange: "transform" }}
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
      <motion.div
        className="absolute pointer-events-none select-none z-20"
        style={{ width: 92, right: -20, top: "44%", willChange: "transform" }}
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

      {/* Note: dashed-border paper card holding the logo, title and body */}
      <div
        className="relative rounded-[32px] px-7 pt-9 pb-7 text-center z-10"
        style={{
          background: "var(--color-cream-50)",
          border: "2px dashed color-mix(in srgb, var(--color-wood-500) 55%, transparent)",
          boxShadow: "0 12px 22px rgba(43,35,32,.16)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/logo-clean-t.png"
          alt=""
          className="mx-auto block"
          style={{ width: 76, height: 76, objectFit: "contain" }}
        />
        <p className="font-display text-lg font-bold text-[var(--color-secondary)] -mt-1">
          {t.appName}
        </p>

        <h2 className="font-display text-2xl font-bold text-[var(--color-text)] mt-2">
          {t.generalInvite.title}
        </h2>

        <p className="font-body text-[13px] leading-relaxed text-[var(--color-text-muted)] mt-3">
          {t.generalInvite.body}
        </p>
      </div>

      {/* Location + date, as two side-by-side colored boxes */}
      <div className="relative z-10 flex gap-2.5 mt-4">
        <div
          className="flex-1 flex flex-col items-center gap-1 rounded-2xl px-3 py-3 text-[12px] font-body"
          style={{ background: "color-mix(in srgb, var(--color-sage-500) 22%, var(--color-cream-50))" }}
        >
          <span className="text-[var(--color-sage-600)]"><PinIcon /></span>
          <span className="font-semibold text-[var(--color-text)]">{t.invite.locationLabel}</span>
          <span className="text-[var(--color-text-muted)] text-center">{t.eventLocation}</span>
        </div>
        <div
          className="flex-1 flex flex-col items-center gap-1 rounded-2xl px-3 py-3 text-[12px] font-body"
          style={{ background: "color-mix(in srgb, var(--color-maroon-500) 22%, var(--color-cream-50))" }}
        >
          <span className="text-[var(--color-secondary)]"><CalendarIcon /></span>
          <span className="font-semibold text-[var(--color-text)]">{t.invite.dateLabel}</span>
          <span className="text-[var(--color-text-muted)] text-center">{t.eventDates}</span>
        </div>
      </div>
    </div>
  );
}
