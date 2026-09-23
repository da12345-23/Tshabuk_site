"use client";

import { motion } from "motion/react";

const PIECES = [
  { src: "/images/brand/piece-green-t.png", top: "8%", left: "6%", size: 64, dur: 7, delay: 0, rot: -12 },
  { src: "/images/brand/piece-maroon-t.png", top: "14%", left: "86%", size: 52, dur: 6.5, delay: 0.6, rot: 10 },
  { src: "/images/brand/piece-mustard-t.png", top: "80%", left: "8%", size: 56, dur: 7.5, delay: 0.3, rot: -8 },
  { src: "/images/brand/piece-blue-t.png", top: "84%", left: "88%", size: 48, dur: 8, delay: 0.9, rot: 14 },
];

export function FloatingPieces() {
  return (
    <div className="pointer-events-none select-none fixed inset-0 overflow-hidden -z-0" aria-hidden>
      {PIECES.map((p, i) => (
        <motion.img
          key={i}
          src={p.src}
          alt=""
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            width: p.size,
            height: "auto",
            opacity: 0.24,
          }}
          animate={{ y: [0, -14, 0], rotate: [p.rot, p.rot + 8, p.rot] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
