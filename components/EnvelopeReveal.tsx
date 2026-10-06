"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useAnimate, useMotionValue } from "motion/react";
import { useLocale } from "@/lib/locale-context";
import { celebrate } from "@/lib/confetti";
import { Button } from "./Button";
import { GeneralInviteCard, type InviteVariant } from "./GeneralInviteCard";

const ENVELOPE_H = 224;
const RADIUS = 12;
const CLIP_INSET = 3;
// The front pocket's top edge is a V from the two top corners down to
// this point in the middle (measured from the top); the flap's tip
// reaches a little lower, overlapping it the way a real flap does.
const POCKET_TIP = 0.58;
const FLAP_TIP = 0.64;
const POCKET_DIP = ENVELOPE_H * (1 - POCKET_TIP); // px above the bottom

// closed -> peek (auto, after the flap opens) -> out (pulled: rises clear
// of the envelope) -> rest (flies to the center of the screen over a
// blurred page, fully uncovered).
type Stage = "closed" | "peek" | "out" | "rest";

/**
 * A closed envelope that, on tapping its wax seal, folds its flap open and
 * lets the invitation out the way a real letter comes out: it rises
 * partway so only its top peeks out of the pocket, then the guest pulls it
 * the rest of the way (drag, or the "pull out" button), and it comes
 * forward to the middle of the screen. Standalone on /envelope; doesn't
 * touch or import anything from the main name -> puzzle -> leaderboard
 * flow.
 *
 * Layering, back to front: envelope inside < open flap < card < front
 * pocket < closed flap < seal. While inside, the card is also clipped to
 * the envelope's outline below its top edge, so nothing of it (mascots
 * included) can poke out through the envelope's sides.
 */
export function EnvelopeReveal({
  onSpotlight,
  variant = "general",
}: {
  onSpotlight?: () => void;
  variant?: InviteVariant;
}) {
  const { t } = useLocale();
  const [stage, setStage] = useState<Stage>("closed");
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(560);
  const [fromRect, setFromRect] = useState<DOMRect | null>(null);
  const y = useMotionValue(0);
  const dragStarted = useRef(false);

  // offsetHeight ignores transforms; re-measure when web fonts finish
  // loading and the text reflows (common on phones).
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const measure = () => {
      if (el.offsetHeight > 0) setCardH(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Card's bottom edge, in px above the envelope's bottom edge, per stage.
  // The card's y motion value is the negative of this (bottom-anchored).
  const closedBottom = POCKET_DIP - 30 - cardH;
  const peekBottom = POCKET_DIP - cardH * 0.55;
  const clearBottom = ENVELOPE_H + 14;

  // The column is sized for the opened layout from the start (so nothing
  // reflows mid-animation, which was a source of lag); while closed it's
  // shifted up so the lone envelope sits centered, and it glides down as
  // the card rises -- a transform, not a height animation.
  const openH = Math.max(ENVELOPE_H * (1 + FLAP_TIP), peekBottom + cardH + 76);
  const closedOffset = -(openH - ENVELOPE_H) / 2;

  const opened = stage !== "closed";

  // All card movement goes through one motion value, so dragging and the
  // programmatic slides can't fight each other.
  useEffect(() => {
    if (stage === "closed") {
      y.set(-closedBottom);
    } else if (stage === "peek") {
      const c = animate(y, -peekBottom, { duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] });
      return () => c.stop();
    } else if (stage === "out") {
      const c = animate(y, -clearBottom, { duration: 0.45, ease: [0.4, 0, 0.2, 1] });
      c.then(() => {
        if (cardRef.current) setFromRect(cardRef.current.getBoundingClientRect());
        setStage("rest");
        celebrate();
        onSpotlight?.();
      });
      return () => c.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, cardH]);

  return (
    <motion.div
      className="flex flex-col items-center gap-5 w-full"
      initial={false}
      animate={{ y: opened ? 0 : closedOffset }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative"
        style={{ width: "min(84vw, 370px)", height: openH, perspective: 1400 }}
        animate={opened ? { y: 0 } : { y: [0, -5, 0] }}
        transition={opened ? { duration: 0.3 } : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Red halo (the logo's own red) around the closed envelope,
            gently pulsing as a "tap me" hint; fades once it's opened. */}
        <motion.div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: ENVELOPE_H,
            borderRadius: RADIUS,
            boxShadow: "0 0 34px 8px rgba(210,58,60,.5)",
          }}
          initial={false}
          animate={opened ? { opacity: 0 } : { opacity: [0.55, 1, 0.55] }}
          transition={opened ? { duration: 0.4 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />

        {/* Inside of the envelope -- a touch darker than the outside, as
            the inside of a real envelope is. Also carries the outline and
            drop shadow that separate it from the cream page. */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: ENVELOPE_H,
            borderRadius: RADIUS,
            background: "linear-gradient(180deg, #e9e3d8 0%, #f2eee7 100%)",
            border: "1.5px solid rgba(122,89,54,.3)",
            boxShadow: "0 18px 34px rgba(43,35,32,.24), 0 3px 8px rgba(43,35,32,.12)",
          }}
        />

        {/* Flap: lies over the opening while closed; on open it folds back
            and up, and drops behind the card so it can never cover it.
            The drop-shadow sits on the wrapper so it follows the clipped
            triangle and gives the flap a crisp edge. */}
        <motion.div
          className="absolute inset-x-0"
          style={{
            top: `calc(100% - ${ENVELOPE_H}px)`,
            height: ENVELOPE_H * FLAP_TIP,
            zIndex: opened ? 5 : 20,
            transformOrigin: "top center",
            filter: "drop-shadow(0 2px 2px rgba(43,35,32,.16))",
          }}
          initial={false}
          animate={{ rotateX: opened ? -168 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              borderRadius: `${RADIUS}px ${RADIUS}px 0 0`,
              background: "linear-gradient(180deg, #fbfaf7 0%, #efe9df 100%)",
            }}
          />
        </motion.div>

        {/* Card layer, clipped to the envelope's outline below its top edge
            (a letter can't stick out through the sides). Inset a few px
            inside the pocket, so the card never lines up with the pocket's
            soft anti-aliased edge and peeks through as a faint line. */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            clipPath: `polygon(-2000px -2000px, calc(100% + 2000px) -2000px, calc(100% + 2000px) calc(100% - ${ENVELOPE_H}px), calc(100% - ${CLIP_INSET}px) calc(100% - ${ENVELOPE_H}px), calc(100% - ${CLIP_INSET}px) calc(100% - ${RADIUS + CLIP_INSET}px), calc(100% - ${RADIUS + CLIP_INSET}px) calc(100% - ${CLIP_INSET}px), ${RADIUS + CLIP_INSET}px calc(100% - ${CLIP_INSET}px), ${CLIP_INSET}px calc(100% - ${RADIUS + CLIP_INSET}px), ${CLIP_INSET}px calc(100% - ${ENVELOPE_H}px), -2000px calc(100% - ${ENVELOPE_H}px))`,
          }}
        >
          <motion.div
            ref={cardRef}
            className="absolute left-1/2 bottom-0 pointer-events-auto"
            // touchAction none only while draggable: that's what lets the
            // drag work on phones instead of scrolling the page.
            style={{
              x: "-50%",
              y,
              opacity: stage === "rest" ? 0 : 1,
              touchAction: stage === "peek" ? "none" : "auto",
              cursor: stage === "peek" ? "grab" : "default",
              // Pulling must never turn into text selection or, on iPhone,
              // the long-press "Save Image" menu.
              userSelect: stage === "peek" ? "none" : undefined,
              WebkitUserSelect: stage === "peek" ? "none" : undefined,
              WebkitTouchCallout: stage === "peek" ? "none" : undefined,
            }}
            drag={stage === "peek" ? "y" : false}
            // Absolute y range (motion-value units), from fully clear of
            // the envelope down to the peek position.
            dragConstraints={{ top: -clearBottom, bottom: -peekBottom }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={() => {
              dragStarted.current = true;
            }}
            onDragEnd={(_, info) => {
              // Only a real, deliberate upward pull counts.
              if (!dragStarted.current) return;
              dragStarted.current = false;
              if (info.offset.y < -(clearBottom - peekBottom) * 0.25) {
                setStage("out");
              } else {
                animate(y, -peekBottom, { type: "spring", stiffness: 260, damping: 26 });
              }
            }}
          >
            <GeneralInviteCard paused={stage === "rest"} variant={variant} />

            {/* "Pull me up" cue: bouncing chevrons above the peeking edge,
                only while it's waiting to be pulled. */}
            {stage === "peek" && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                style={{ top: -62 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, -12, 0] }}
                transition={{
                  opacity: { delay: 1.3, duration: 0.4 },
                  y: { delay: 1.3, duration: 1.1, repeat: Infinity, ease: "easeInOut" },
                }}
                aria-hidden
              >
                <svg width="30" height="18" viewBox="0 0 24 14" fill="none" stroke="var(--color-secondary)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12 12 5 19 12" />
                </svg>
                <svg width="30" height="18" viewBox="0 0 24 14" fill="none" stroke="var(--color-secondary)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginTop: -6 }}>
                  <path d="M5 12 12 5 19 12" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Front pocket: from the top corners down to the middle, in front
            of the card's lower part while it's inside, so it genuinely
            looks tucked into the envelope. The wrapper's drop-shadow
            outlines the V; the faint lines are the side/bottom fold seams. */}
        <div
          className="absolute inset-x-0 bottom-0 z-[15] pointer-events-none"
          style={{ height: ENVELOPE_H, filter: "drop-shadow(0 -1px 1.5px rgba(43,35,32,.14))" }}
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: `polygon(0 0, 50% ${POCKET_TIP * 100}%, 100% 0, 100% 100%, 0 100%)`,
              borderRadius: RADIUS,
              background: "linear-gradient(180deg, #fdfcfa 0%, #f4f0e9 100%)",
              border: "1.5px solid #d8cdbf",
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ clipPath: `inset(0 round ${RADIUS}px)` }}
          >
            <path
              d={`M1 99 L50 ${POCKET_TIP * 100 + 14} L99 99`}
              fill="none"
              stroke="rgba(122,89,54,.12)"
              strokeWidth={1.2}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Wax seal on the flap's tip -- the tap target (48px, comfortable
            on phones). It's outside the flap's clip-path because that path
            narrows to a point at the tip. Breaks and fades on open. */}
        <motion.button
          type="button"
          aria-label={t.generalInvite.tapHint}
          onClick={() => setStage("peek")}
          disabled={opened}
          className="absolute left-1/2 z-30 rounded-full bg-[var(--color-cream-50)] ring-2 ring-[var(--color-wood-300)] shadow-md flex items-center justify-center cursor-pointer disabled:pointer-events-none"
          style={{ bottom: ENVELOPE_H * (1 - FLAP_TIP), width: 50, height: 50, x: "-50%", y: "50%" }}
          animate={opened ? { scale: 0, opacity: 0 } : { scale: [1, 1.07, 1] }}
          transition={
            opened ? { duration: 0.3 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/piece-maroon-t.png"
            alt=""
            style={{ width: 28, height: 28, objectFit: "contain" }}
          />
        </motion.button>
      </motion.div>

      <div className="min-h-[92px] flex flex-col items-center">
        {stage === "closed" && (
          <motion.p
            className="font-body text-sm text-[var(--color-text-muted)] text-center px-6"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {t.generalInvite.tapHint}
          </motion.p>
        )}

        {stage === "peek" && (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.4 }}
          >
            <Button variant="secondary" onClick={() => setStage("out")}>
              {t.generalInvite.pullButton}
            </Button>
            <p className="font-body text-sm text-[var(--color-text-muted)] text-center px-6">
              {t.generalInvite.pullHint}
            </p>
          </motion.div>
        )}
      </div>

      {stage === "rest" && <Spotlight from={fromRect} variant={variant} />}
    </motion.div>
  );
}

/**
 * The fully-out invitation, brought to the middle of the screen over a
 * blurred page -- always shown whole: if the card is taller (or wider)
 * than the screen it's scaled down evenly to fit, never cut off or
 * scrolled. It flies there from exactly where it left the envelope (a
 * manual FLIP: measure both boxes, start at the offset and size, spring
 * into place), so it reads as one continuous motion. Portaled to <body>
 * so no transformed ancestor can turn `position: fixed` into "fixed to
 * that ancestor".
 */
function Spotlight({ from, variant }: { from: DOMRect | null; variant: InviteVariant }) {
  const [scope, animateEl] = useAnimate<HTMLDivElement>();
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ w: number; h: number; scale: number } | null>(null);

  const flown = useRef(false);

  // Phase 1: measure the card's natural size and work out the scale that
  // fits it on screen (with room for the paperclip/mascot overhangs).
  // Keeps re-fitting while it's open: switching language (the English
  // text runs longer), a late-loading font or resizing the window all
  // change the size, and a one-time fit left the bottom cut off.
  // offsetWidth/Height ignore the scale transform, so this can't loop.
  useLayoutEffect(() => {
    const card = innerRef.current?.firstElementChild as HTMLElement | null;
    if (!card) return;
    const measure = () => {
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      // 56px top strip is kept clear for the fixed language button.
      const scale = Math.min(1, (window.innerHeight - 72) / h, (window.innerWidth - 64) / w);
      setFit((f) => (f && f.w === w && f.h === h && f.scale === scale ? f : { w, h, scale }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Phase 2 (still before first paint): fly in from the envelope, once.
  useLayoutEffect(() => {
    const el = scope.current;
    if (!el || !from || !fit || flown.current) return;
    flown.current = true;
    const to = el.getBoundingClientRect();
    const s0 = from.width / to.width;
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    el.style.transformOrigin = "0 0";
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${s0})`;
    animateEl(
      el,
      { x: [dx, 0], y: [dy, 0], scale: [s0, 1] },
      { type: "spring", stiffness: 110, damping: 18 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit]);

  return createPortal(
    <div className="fixed inset-0 z-40">
      <motion.div
        className="absolute inset-0"
        style={{
          background: "rgba(253,248,239,.5)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pt-14 pb-4">
        {/* Outer box is sized to the *scaled* card so centering is exact;
            the card inside keeps its natural layout and is scaled to fit. */}
        <div
          ref={scope}
          style={{
            position: "relative",
            width: fit ? fit.w * fit.scale : undefined,
            height: fit ? fit.h * fit.scale : undefined,
            visibility: fit ? "visible" : "hidden",
            willChange: "transform",
            isolation: "isolate",
          }}
        >
          <div
            ref={innerRef}
            style={
              fit
                ? { position: "absolute", top: 0, left: 0, width: fit.w, transform: `scale(${fit.scale})`, transformOrigin: "0 0" }
                : undefined
            }
          >
            <GeneralInviteCard variant={variant} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
