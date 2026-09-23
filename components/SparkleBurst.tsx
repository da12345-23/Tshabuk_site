"use client";

import { motion } from "motion/react";

const COLORS = [
  "var(--color-sage-600)",
  "var(--color-maroon-600)",
  "var(--color-steel-500)",
  "var(--color-mustard-400)",
];

export function SparkleBurst({ x, y, seed }: { x: number; y: number; seed: number }) {
  const dots = Array.from({ length: 7 }, (_, i) => {
    const angle = (i / 7) * Math.PI * 2 + seed;
    const dist = 26 + (i % 3) * 8;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: COLORS[i % COLORS.length],
      size: 5 + (i % 3) * 2,
    };
  });

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 1200 }}>
      {dots.map((d, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
          animate={{ opacity: 0, x: d.dx, y: d.dy, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: d.size,
            height: d.size,
            borderRadius: "9999px",
            background: d.color,
          }}
        />
      ))}
    </div>
  );
}
