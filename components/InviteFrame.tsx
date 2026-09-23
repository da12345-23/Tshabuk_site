"use client";

import { forwardRef, useEffect, useRef } from "react";

const PADDING = 96;

// Literal hex values, not CSS custom properties -- proven unreliable to
// resolve inside the html-to-image export target in the past.
const BG = "linear-gradient(160deg, #fdf8ef 0%, #f7ecd9 45%, #eeddb8 100%)";

// Soft organic color washes behind the piece confetti, echoing the
// campaign's own reference art (earthy sage/rust/mustard blobs) instead of
// a flat empty margin.
const BLOBS: { color: string; size: number; top: string; left: string }[] = [
  { color: "rgba(90,154,110,.30)", size: 210, top: "-8%", left: "-10%" },
  { color: "rgba(168,90,88,.24)", size: 180, top: "62%", left: "78%" },
  { color: "rgba(243,194,67,.28)", size: 160, top: "70%", left: "-6%" },
  { color: "rgba(110,147,176,.24)", size: 170, top: "-6%", left: "74%" },
];

type DecorPiece = {
  src: string;
  size: number;
  rot: number;
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
};

// The same puzzle-piece art scattered across the live page background
// (see FloatingPieces), reused here as the export's decoration instead of
// a drawn border -- plain <img> tags, which is the one thing proven to
// export reliably (next/image and inline <svg> have both misbehaved here).
const DECOR: DecorPiece[] = [
  { src: "/images/brand/piece-green-t.png", size: 50, rot: -14, top: 6, left: 10 },
  { src: "/images/brand/piece-maroon-t.png", size: 40, rot: 12, top: 14, right: 16 },
  { src: "/images/brand/piece-mustard-t.png", size: 44, rot: -10, bottom: 16, left: 22 },
  { src: "/images/brand/piece-green-t.png", size: 46, rot: 16, bottom: 10, right: 14 },
  { src: "/images/brand/piece-maroon-t.png", size: 34, rot: 8, top: "40%", left: 6 },
  { src: "/images/brand/piece-mustard-t.png", size: 32, rot: -8, top: "44%", right: 8 },
  { src: "/images/brand/piece-green-t.png", size: 26, rot: 22, top: 42, left: "38%" },
  { src: "/images/brand/piece-mustard-t.png", size: 24, rot: -18, bottom: 34, right: "34%" },
];

/**
 * Wraps its children with generous padding scattered with the same
 * puzzle-piece art used as the page's own background decoration -- the
 * "Save as image" export target. No drawn border/frame: an earlier
 * hand-built jigsaw-tile border (rendered via an off-screen <svg>, then
 * rasterized to a <canvas>) kept failing to export correctly in practice,
 * so this replaces it with plain, individually-loaded <img> tiles, the one
 * approach proven reliable for this export pipeline.
 */
export const InviteFrame = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; onReady?: () => void }
>(function InviteFrame({ children, onReady }, ref) {
  const loadedCount = useRef(0);
  const firedReady = useRef(false);

  function handlePieceLoad() {
    loadedCount.current += 1;
    if (!firedReady.current && loadedCount.current >= DECOR.length) {
      firedReady.current = true;
      onReady?.();
    }
  }

  // Safety net: an <img> that was already cached can fire "load" before
  // this effect's listener attaches, so the count above may never reach
  // DECOR.length even though everything is actually on screen. Don't leave
  // the Save button stuck disabled if that happens.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!firedReady.current) {
        firedReady.current = true;
        onReady?.();
      }
    }, 600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        display: "inline-block",
        padding: PADDING,
        background: BG,
        overflow: "hidden",
      }}
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: "9999px",
            background: b.color,
            filter: "blur(2px)",
          }}
        />
      ))}
      {DECOR.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={p.src}
          alt=""
          onLoad={handlePieceLoad}
          onError={handlePieceLoad}
          style={{
            position: "absolute",
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            width: p.size,
            height: "auto",
            transform: `rotate(${p.rot}deg)`,
            opacity: 0.9,
            filter: "drop-shadow(0 3px 5px rgba(43,35,32,.18))",
          }}
        />
      ))}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
});
