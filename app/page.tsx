"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { NameEntry } from "@/components/NameEntry";
import { PuzzleGame } from "@/components/PuzzleGame";
import { InviteCard } from "@/components/InviteCard";
import { InviteFrame } from "@/components/InviteFrame";
import { Button } from "@/components/Button";
import { LangToggle } from "@/components/LangToggle";
import { FloatingPieces } from "@/components/FloatingPieces";
import { useLocale } from "@/lib/locale-context";
import { celebrate } from "@/lib/confetti";
import { submitScore } from "@/lib/leaderboard-client";

type Stage = "landing" | "puzzle" | "reveal";

export default function Home() {
  const { t, locale } = useLocale();
  const [stage, setStage] = useState<Stage>("landing");
  const [name, setName] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [savingImage, setSavingImage] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [rankReady, setRankReady] = useState(false);
  const [prefilledName, setPrefilledName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // A personalized invite link can carry ?name=<guest name> to prefill the
  // name field -- e.g. https://tshabuk.site/?name=Sara -- the guest still
  // has to play and solve the puzzle before the invite shows up. A link
  // like this always starts fresh: it must NOT fall through to the
  // "resume a solved invite" logic below, even if this device has old
  // session data from a previous, unrelated play-through.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presetName = params.get("name");
    if (presetName) {
      setPrefilledName(presetName);
      return;
    }

    // Resume a solved invite (e.g. coming back from the leaderboard) instead
    // of forcing the guest to redo the whole flow -- only for a bare link,
    // never for a fresh personalized one. This uses sessionStorage, not
    // localStorage: it must only survive within the same browser tab/visit
    // (so going to the leaderboard and back still works), NOT come back
    // days later when the guest opens/searches the site fresh -- otherwise
    // every new visitor on that device would land on a stranger's old
    // invite instead of the landing page.
    try {
      const saved = window.sessionStorage.getItem("tashabuk-invite");
      if (saved) {
        const parsed = JSON.parse(saved) as { name: string; elapsedMs: number };
        if (parsed?.name) {
          setName(parsed.name);
          setElapsedMs(parsed.elapsedMs ?? 0);
          setStage("reveal");
          setFrameReady(false);
          setRankReady(false);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  async function handleSaveImage() {
    if (!cardRef.current || savingImage || !frameReady || !rankReady) return;
    setSavingImage(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `tashabuk-invite-${name || "guest"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // ignore -- best-effort export
    } finally {
      setSavingImage(false);
    }
  }

  async function handleSolved(elapsed: number) {
    celebrate();
    setElapsedMs(elapsed);
    setStage("reveal");
    setFrameReady(false);
    setRankReady(false);
    try {
      window.sessionStorage.setItem("tashabuk-invite", JSON.stringify({ name, elapsedMs: elapsed }));
    } catch {
      // ignore
    }
    const entry = await submitScore(name, elapsed, locale);
    if (entry) {
      try {
        window.sessionStorage.setItem("tashabuk-last-entry", entry.id);
      } catch {
        // ignore
      }
    }
  }

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center py-10 px-4 overflow-hidden">
      <FloatingPieces />

      <div className="fixed top-4 inset-x-0 flex justify-between items-center px-4 z-50">
        <Link
          href="/leaderboard"
          className="font-body text-xs font-semibold rounded-full px-3.5 py-1.5 bg-[var(--color-surface-raised)]/80 backdrop-blur border border-[var(--color-border)]/40 text-[var(--color-text)] shadow-sm"
        >
          {t.landing.leaderboardLink}
        </Link>
        <LangToggle />
      </div>

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {stage === "landing" && (
            <motion.div key="landing" exit={{ opacity: 0, scale: 0.92 }}>
              <NameEntry
                initialName={prefilledName}
                onStart={(n) => {
                  setName(n);
                  setStage("puzzle");
                }}
              />
            </motion.div>
          )}

          {stage === "puzzle" && (
            <motion.div
              key="puzzle"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <h2 className="font-display text-xl font-bold text-[var(--color-text)] text-center px-6">
                {t.puzzle.title}
              </h2>
              <PuzzleGame onSolved={handleSolved} />
            </motion.div>
          )}

          {stage === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6"
            >
              <InviteCard name={name} elapsedMs={elapsedMs} />

              {/* Hidden (not off-screen -- Next/Image lazy-loading needs it
                  in-viewport) framed copy, used only as the "Save as image"
                  export target. This decorated background never shows on
                  the page itself, only in the saved photo. */}
              <div
                style={{ position: "absolute", top: 0, left: 0, opacity: 0, pointerEvents: "none", zIndex: -1 }}
                aria-hidden
              >
                <InviteFrame ref={cardRef} onReady={() => setFrameReady(true)}>
                  <InviteCard
                    name={name}
                    elapsedMs={elapsedMs}
                    width="420px"
                    onRankSettled={() => setRankReady(true)}
                  />
                </InviteFrame>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <Button
                  variant="secondary"
                  onClick={handleSaveImage}
                  disabled={savingImage || !frameReady}
                >
                  {savingImage
                    ? t.invite.savingImage
                    : frameReady
                      ? t.invite.saveImage
                      : t.invite.preparingImage}
                </Button>
                <Link href="/leaderboard">
                  <Button variant="ghost">{t.invite.viewLeaderboard}</Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    try {
                      window.sessionStorage.removeItem("tashabuk-invite");
                      window.sessionStorage.removeItem("tashabuk-last-entry");
                    } catch {
                      // ignore
                    }
                    setStage("landing");
                    setName("");
                    setElapsedMs(0);
                  }}
                >
                  {t.invite.playAgain}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
