"use client";

import { motion } from "motion/react";

/**
 * A soft glow that hugs the invitation card's own rounded outline, in the
 * logo's four colors (red, yellow, blue, green) blending around the edge --
 * reads as a lit border rather than a cloud of color. A static blurred
 * layer animated only by opacity (cheap for the compositor). Place it as
 * the first child of a `relative isolate` wrapper that is exactly the
 * card's size.
 */
export function InviteGlow() {
  return (
    <motion.div
      aria-hidden
      className="absolute -z-10 pointer-events-none"
      style={{
        inset: -6,
        borderRadius: 38,
        background:
          "conic-gradient(from 0deg, #d64040, #f3c243, #4aa3df, #4ca860, #d64040)",
        filter: "blur(18px)",
        willChange: "opacity",
      }}
      animate={{ opacity: [0.45, 0.75, 0.45] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
