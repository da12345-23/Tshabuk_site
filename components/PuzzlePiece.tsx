"use client";

import { motion, useMotionValue } from "motion/react";
import { useState } from "react";

export type PieceRuntime = {
  id: string;
  src: string;
  width: number;
  height: number;
  home: { x: number; y: number }; // current resting position, stage coords
  target: { x: number; y: number };
  rotation: number;
  locked: boolean;
};

export function PuzzlePiece({
  piece,
  onSettle,
  bringToFront,
  zIndex,
  onLockBurst,
  trayScale = 1,
}: {
  piece: PieceRuntime;
  onSettle: (id: string, pos: { x: number; y: number }, snapped: boolean) => void;
  bringToFront: (id: string) => void;
  zIndex: number;
  onLockBurst: (id: string, x: number, y: number) => void;
  /** Visual scale for pieces still in the tray, so the board can be big
   * while the tray stays compact -- the piece's real width/height (used
   * for drag/snap math) is unchanged, only its rendered size shrinks. */
  trayScale?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      data-piece-id={piece.id}
      data-locked={piece.locked}
      drag={!piece.locked}
      dragMomentum={false}
      dragElastic={0.12}
      style={{
        position: "absolute",
        left: piece.home.x,
        top: piece.home.y,
        width: piece.width,
        height: piece.height,
        // Scale from the top-left corner, not center, so a shrunk tray
        // piece's visual box stays exactly at (home.x, home.y) -- matching
        // the slot math in PuzzleGame -- instead of bleeding past the tray
        // edges as it grows toward its unscaled footprint.
        originX: 0,
        originY: 0,
        x,
        y,
        zIndex: dragging ? 999 : zIndex,
        touchAction: "none",
        cursor: piece.locked ? "default" : dragging ? "grabbing" : "grab",
        filter: piece.locked
          ? "none"
          : dragging
          ? "drop-shadow(0 14px 18px rgba(43,35,32,0.35))"
          : "drop-shadow(0 4px 6px rgba(43,35,32,0.25))",
      }}
      initial={{ rotate: piece.rotation, scale: trayScale }}
      animate={
        piece.locked
          ? { rotate: 0, scale: [trayScale, 1.16, 1] }
          : { rotate: piece.rotation, scale: trayScale }
      }
      transition={
        piece.locked
          ? { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }
          : { type: "spring", stiffness: 300, damping: 22 }
      }
      whileHover={piece.locked ? undefined : { scale: trayScale * 1.08 }}
      whileDrag={{ scale: trayScale * 1.18 }}
      onPointerDown={() => bringToFront(piece.id)}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        const newX = piece.home.x + info.offset.x;
        const newY = piece.home.y + info.offset.y;
        const dist = Math.hypot(newX - piece.target.x, newY - piece.target.y);
        const snapped = dist < 24;
        x.set(0);
        y.set(0);
        onSettle(piece.id, { x: newX, y: newY }, snapped);
        if (snapped) {
          onLockBurst(piece.id, piece.target.x + piece.width / 2, piece.target.y + piece.height / 2);
        }
      }}
    >
      <img
        src={piece.src}
        alt=""
        draggable={false}
        width={piece.width}
        height={piece.height}
        style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </motion.div>
  );
}
