"use client";

import { motion } from "motion/react";

/**
 * A four-color halo around an invitation card, in the logo's colors: green
 * top-left, red top-right, blue bottom-left, yellow bottom-right, gently
 * breathing. Sized from the card's own box and extending past every edge,
 * so it reads as a glow around the card rather than a haze hidden behind
 * it. Plain radial gradients animated only by opacity/transform -- no blur
 * filter -- so it stays cheap on phones. Place it as the first child of a
 * `relative isolate` wrapper that is exactly the card's size.
 */
export function InviteGlow() {
  return (
    <motion.div
      aria-hidden
      className="absolute -z-10 pointer-events-none"
      style={{
        inset: "-60px -48px",
        background: [
          "radial-gradient(42% 34% at 16% 14%, rgba(76,168,96,.55), transparent 72%)",
          "radial-gradient(42% 34% at 84% 14%, rgba(214,64,64,.5), transparent 72%)",
          "radial-gradient(42% 34% at 16% 86%, rgba(74,163,223,.5), transparent 72%)",
          "radial-gradient(42% 34% at 84% 86%, rgba(243,194,67,.6), transparent 72%)",
          "radial-gradient(closest-side, rgba(253,248,239,.5) 70%, transparent 100%)",
        ].join(", "),
      }}
      animate={{ opacity: [0.75, 1, 0.75], scale: [0.98, 1.04, 0.98] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
