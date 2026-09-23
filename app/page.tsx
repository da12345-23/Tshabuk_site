"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { NameEntry } from "@/components/NameEntry";
import { PuzzleGame } from "@/components/PuzzleGame";
import { InviteCard } from "@/components/InviteCard";
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
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [prefilledName, setPrefilledName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // A personalized invite link can carry ?msg=<custom message> and an
  // optional ?name=<guest name> to prefill the name field -- e.g.
  // https://tshabuk.site/?name=Sara&msg=You%20mean%20the%20world%20to%20us
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get("msg");
    const presetName = params.get("name");
    if (msg) setCustomMessage(msg);
    if (presetName) setPrefilledName(presetName);
  }, []);

  // Resume a solved invite (e.g. coming back from the leaderboard) instead
  // of forcing the guest to redo the whole flow.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("tashabuk-invite");
      if (saved) {
        const parsed = JSON.parse(saved) as {
          name: string;
          elapsedMs: number;
          customMessage?: string | null;
        };
        if (parsed?.name) {
          setName(parsed.name);
          setElapsedMs(parsed.elapsedMs ?? 0);
          if (parsed.customMessage) setCustomMessage(parsed.customMessage);
          setStage("reveal");
        }
      }
    } catch {
      // ignore
    }
  }, []);

  async function handleSaveImage() {
    if (!cardRef.current || savingImage) return;
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
    try {
      window.localStorage.setItem(
        "tashabuk-invite",
        JSON.stringify({ name, elapsedMs: elapsed, customMessage })
      );
    } catch {
      // ignore
    }
    const entry = await submitScore(name, elapsed, locale);
    if (entry) {
      try {
        window.localStorage.setItem("tashabuk-last-entry", entry.id);
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
              <InviteCard name={name} elapsedMs={elapsedMs} customMessage={customMessage} />

              {/* Off-screen framed copy, used only as the "Save as image"
                  export target -- the border never shows on the page itself. */}
              <div
                data-export-frame
                style={{ position: "fixed", top: 0, left: -99999, pointerEvents: "none" }}
                aria-hidden
              >
                <div
                  ref={cardRef}
                  className="relative"
                  style={{
                    background:
                      "radial-gradient(circle at 12% 15%, color-mix(in srgb, var(--color-sage-500) 16%, var(--color-cream-100)), var(--color-cream-100) 45%), radial-gradient(circle at 88% 85%, color-mix(in srgb, var(--color-mustard-400) 18%, var(--color-cream-100)), var(--color-cream-100) 45%)",
                    paddingTop: "26px",
                    paddingBottom: "26px",
                    paddingLeft: "14px",
                    paddingRight: "14px",
                  }}
                >
                  <div
                    className="w-full h-[22px]"
                    style={{
                      backgroundImage: "url(/images/brand/piece-border.png)",
                      backgroundRepeat: "repeat-x",
                      backgroundSize: "auto 100%",
                      backgroundPosition: "left center",
                    }}
                  />
                  <div style={{ padding: "18px 8px" }}>
                    <InviteCard name={name} elapsedMs={elapsedMs} customMessage={customMessage} />
                  </div>
                  <div
                    className="w-full h-[22px]"
                    style={{
                      backgroundImage: "url(/images/brand/piece-border.png)",
                      backgroundRepeat: "repeat-x",
                      backgroundSize: "auto 100%",
                      backgroundPosition: "left center",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <Button variant="secondary" onClick={handleSaveImage} disabled={savingImage}>
                  {savingImage ? t.invite.savingImage : t.invite.saveImage}
                </Button>
                <Link href="/leaderboard">
                  <Button variant="ghost">{t.invite.viewLeaderboard}</Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    try {
                      window.localStorage.removeItem("tashabuk-invite");
                      window.localStorage.removeItem("tashabuk-last-entry");
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
