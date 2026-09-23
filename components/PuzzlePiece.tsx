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
}: {
  piece: PieceRuntime;
  onSettle: (id: string, pos: { x: number; y: number }, snapped: boolean) => void;
  bringToFront: (id: string) => void;
  zIndex: number;
  onLockBurst: (id: string, x: number, y: number) => void;
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
        x,
        y,
        zIndex: dragging ? 999 : zIndex,
        touchAction: "none",
        cursor: piece.locked ? "default" : dragging ? "grabbing" : "grab",
        filter: piece.locked
          ? "drop-shadow(0 1px 1px rgba(43,35,32,0.15))"
          : dragging
          ? "drop-shadow(0 14px 18px rgba(43,35,32,0.35))"
          : "drop-shadow(0 4px 6px rgba(43,35,32,0.25))",
      }}
      initial={{ rotate: piece.rotation, scale: 1 }}
      animate={
        piece.locked
          ? { rotate: 0, scale: [1, 1.16, 1] }
          : { rotate: piece.rotation }
      }
      transition={
        piece.locked
          ? { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }
          : { type: "spring", stiffness: 300, damping: 22 }
      }
      whileHover={piece.locked ? undefined : { scale: 1.04 }}
      whileDrag={{ scale: 1.08 }}
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
