"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { generateJigsawLayout, sliceImageToPieces, type JigsawLayout } from "@/lib/jigsaw";
import { PuzzlePiece, type PieceRuntime } from "./PuzzlePiece";
import { SparkleBurst } from "./SparkleBurst";
import { useLocale } from "@/lib/locale-context";

const ROWS = 3;
const COLS = 3;
const TAB_FRACTION = 0.3;
const GAP = 14;
const SEED = 7;
const IMAGE_SRC = "/images/puzzle-source.png";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PuzzleGame({ onSolved }: { onSolved: (elapsedMs: number) => void }) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [pieces, setPieces] = useState<PieceRuntime[]>([]);
  const [zOrder, setZOrder] = useState<Record<string, number>>({});
  const zCounterRef = useRef(1);
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);
  const [sparkles, setSparkles] = useState<{ key: number; x: number; y: number }[]>([]);

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const sparkleKey = useRef(0);
  const solvedRef = useRef(false);
  const builtRef = useRef(false);

  // Measure available width once, so the board/tray size themselves to the
  // actual viewport (phones included) instead of a fixed desktop width.
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setAvailableWidth(containerRef.current.clientWidth);
  }, []);

  const boardWidth = availableWidth
    ? Math.max(220, Math.min(420, availableWidth - 24))
    : 280;
  // puzzle-source.png is a square composite, so the board stays square too.
  const boardHeight = boardWidth;

  const geometry = useMemo(() => {
    const effectiveWidth = availableWidth ?? boardWidth;
    const pw = boardWidth / COLS;
    const ph = boardHeight / ROWS;
    const tabDepth = TAB_FRACTION * Math.min(pw, ph);
    const bboxW = pw + tabDepth * 2;
    const bboxH = ph + tabDepth * 2;
    const trayCellW = bboxW + GAP;
    const trayCellH = bboxH + GAP;
    // Fit as many piece columns as the available width allows, so wide
    // screens spread the tray sideways instead of forcing a tall scroll.
    const trayCols = Math.max(2, Math.min(ROWS * COLS, Math.floor(effectiveWidth / trayCellW)));
    const trayRows = Math.ceil((ROWS * COLS) / trayCols);
    const trayWidth = trayCols * trayCellW;
    const trayHeight = trayRows * trayCellH;
    const stageWidth = Math.max(boardWidth, trayWidth);
    const boardOffsetX = (stageWidth - boardWidth) / 2;
    const trayOffsetY = boardHeight + GAP * 2.5;
    const stageHeight = trayOffsetY + trayHeight;
    return {
      bboxW,
      bboxH,
      trayCellW,
      trayCellH,
      trayCols,
      trayRows,
      stageWidth,
      stageHeight,
      boardOffsetX,
      trayOffsetY,
    };
  }, [boardWidth, boardHeight, availableWidth]);

  // Build the puzzle once we know the real available width.
  useEffect(() => {
    if (availableWidth === null || builtRef.current) return;
    builtRef.current = true;
    let cancelled = false;
    const img = new Image();
    img.src = IMAGE_SRC;
    img.onload = () => {
      if (cancelled) return;
      const layout: JigsawLayout = generateJigsawLayout(boardWidth, boardHeight, ROWS, COLS, SEED);
      const canvases = sliceImageToPieces(img, layout);

      const order = layout.pieces.map((p) => `${p.row}-${p.col}`);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }

      const runtime: PieceRuntime[] = layout.pieces.map((p) => {
        const id = `${p.row}-${p.col}`;
        const slotIndex = order.indexOf(id);
        const col = slotIndex % geometry.trayCols;
        const row = Math.floor(slotIndex / geometry.trayCols);
        const jitterX = (Math.random() - 0.5) * 8;
        const jitterY = (Math.random() - 0.5) * 8;
        const home = {
          x: col * geometry.trayCellW + GAP / 2 + jitterX,
          y: geometry.trayOffsetY + row * geometry.trayCellH + GAP / 2 + jitterY,
        };
        return {
          id,
          src: canvases.get(id)!.toDataURL(),
          width: p.bbox.width,
          height: p.bbox.height,
          home,
          target: { x: geometry.boardOffsetX + p.bbox.x, y: p.bbox.y },
          rotation: (Math.random() - 0.5) * 14,
          locked: false,
        };
      });

      setPieces(runtime);
      setReady(true);
    };
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableWidth]);

  // Timer loop.
  useEffect(() => {
    if (!ready || solved) return;
    if (startRef.current === null) startRef.current = performance.now();
    const tick = () => {
      if (startRef.current !== null) {
        setElapsed(performance.now() - startRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, solved]);

  function bringToFront(id: string) {
    zCounterRef.current += 1;
    setZOrder((z) => ({ ...z, [id]: zCounterRef.current }));
  }

  function handleSettle(id: string, pos: { x: number; y: number }, snapped: boolean) {
    setPieces((prev) => {
      const next = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              home: snapped ? { x: p.target.x, y: p.target.y } : pos,
              locked: snapped || p.locked,
            }
          : p
      );
      const allLocked = next.every((p) => p.locked);
      if (allLocked && !solvedRef.current) {
        solvedRef.current = true;
        setSolved(true);
        const finalElapsed = startRef.current ? performance.now() - startRef.current : elapsed;
        window.setTimeout(() => onSolved(finalElapsed), 650);
      }
      return next;
    });
  }

  function handleLockBurst(id: string, x: number, y: number) {
    const key = sparkleKey.current++;
    setSparkles((s) => [...s, { key, x, y }]);
    window.setTimeout(() => {
      setSparkles((s) => s.filter((sp) => sp.key !== key));
    }, 600);
  }

  const lockedCount = pieces.filter((p) => p.locked).length;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 w-full max-w-[1240px] mx-auto">
      <div className="flex items-center gap-6 rounded-full bg-[var(--color-surface-raised)] px-6 py-2.5 shadow-sm border border-[var(--color-border)]/40 font-display text-[var(--color-text)]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-[var(--color-text-muted)]">{t.puzzle.timer}</span>
          <span className="tabular-nums font-semibold text-lg">{formatTime(elapsed)}</span>
        </div>
        <div className="w-px h-5 bg-[var(--color-border)]/50" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-[var(--color-text-muted)]">{lockedCount}/{ROWS * COLS}</span>
        </div>
      </div>

      {availableWidth !== null && (
        <div
          className="relative mx-auto"
          style={{ width: geometry.stageWidth, height: geometry.stageHeight, maxWidth: "100%" }}
        >
          {/* Target board ghost */}
          <motion.div
            className="absolute rounded-[22px] border-2 border-dashed"
            style={{
              left: geometry.boardOffsetX,
              top: 0,
              width: boardWidth,
              height: boardHeight,
              borderColor: "color-mix(in srgb, var(--color-border) 70%, transparent)",
              background:
                "linear-gradient(160deg, color-mix(in srgb, var(--color-mustard-400) 8%, var(--color-surface)), color-mix(in srgb, var(--color-steel-300) 14%, var(--color-surface)))",
            }}
            animate={{ opacity: solved ? 0 : 1 }}
          >
            {!ready && (
              <div className="w-full h-full flex items-center justify-center text-sm text-[var(--color-text-muted)] font-body">
                {t.puzzle.solving}
              </div>
            )}
          </motion.div>

          {/* Tray panel */}
          <div
            className="absolute rounded-3xl"
            style={{
              left: 0,
              top: geometry.trayOffsetY - GAP,
              width: geometry.stageWidth,
              height: geometry.trayRows * geometry.trayCellH + GAP,
              background: "color-mix(in srgb, var(--color-surface) 60%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-border) 35%, transparent)",
            }}
          />

          {pieces.map((p) => (
            <PuzzlePiece
              key={p.id}
              piece={p}
              zIndex={zOrder[p.id] ?? 1}
              bringToFront={bringToFront}
              onSettle={handleSettle}
              onLockBurst={handleLockBurst}
            />
          ))}

          {sparkles.map((s) => (
            <SparkleBurst key={s.key} x={s.x} y={s.y} seed={s.key} />
          ))}
        </div>
      )}

      <p className="text-sm text-[var(--color-text-muted)] font-body text-center max-w-xs">
        {t.puzzle.instructions}
      </p>
    </div>
  );
}
