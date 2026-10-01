"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { LangToggle } from "@/components/LangToggle";
import { FloatingPieces } from "@/components/FloatingPieces";
import { EnvelopeReveal } from "@/components/EnvelopeReveal";

/**
 * The parents' invitation at /envelope2: the same envelope experience as
 * /envelope (app/envelope/page.tsx), only the invitation text differs.
 *
 * Standalone envelope-reveal invite. Deliberately independent
 * of the main flow (app/page.tsx): no shared state, no puzzle, no
 * leaderboard link -- reuses only the shared design system (tokens,
 * FloatingPieces, LangToggle, the mascot/logo/piece art) so it looks like
 * part of the same site without touching that flow at all.
 */
export default function ParentsEnvelopePage() {
  // Once the invitation is in the spotlight, stop the floating background
  // pieces: anything moving behind a backdrop blur forces the blur to be
  // recomputed every frame, which is what made it feel laggy on phones.
  const [spotlight, setSpotlight] = useState(false);

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center py-10 px-4 overflow-hidden">
      {!spotlight && <FloatingPieces />}

      <div className="fixed top-4 inset-x-0 flex justify-end items-center px-4 z-50">
        <LangToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full"
      >
        <EnvelopeReveal variant="parents" onSpotlight={() => setSpotlight(true)} />
      </motion.div>
    </main>
  );
}
