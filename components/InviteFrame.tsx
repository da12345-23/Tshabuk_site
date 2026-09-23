"use client";

import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { borderFrameLayout } from "@/lib/jigsaw";

const THICKNESS = 18;

// The exact four logo colors, cycling piece to piece -- colorful and
// celebratory, matching the brand palette exactly rather than a neutral
// background tone.
const TILE_COLORS = [
  "var(--color-sage-500)",
  "var(--color-maroon-500)",
  "var(--color-steel-500)",
  "var(--color-mustard-400)",
];
// corners come back as [top-left, top-right, bottom-right, bottom-left] --
// echo the logo's own arrangement (green / maroon / mustard / blue).
const CORNER_COLORS = [TILE_COLORS[0], TILE_COLORS[1], TILE_COLORS[3], TILE_COLORS[2]];

/**
 * Wraps its children in a picture-frame border made of many small,
 * interlocking puzzle-piece tiles lining each edge -- a real row of tab-
 * into-blank pieces (reusing the exact same generator as the play grid),
 * not one big outline shape. Sized to its content automatically.
 */
export const InviteFrame = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function InviteFrame({ children }, ref) {
    const innerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 340, height: 420 });

    useLayoutEffect(() => {
      const measure = () => {
        if (innerRef.current) {
          setSize({ width: innerRef.current.offsetWidth, height: innerRef.current.offsetHeight });
        }
      };
      measure();
      const observer = new ResizeObserver(measure);
      if (innerRef.current) observer.observe(innerRef.current);
      return () => observer.disconnect();
    }, []);

    const { pieces, corners } = borderFrameLayout(size.width, size.height, THICKNESS);
    const svgW = size.width + THICKNESS * 2;
    const svgH = size.height + THICKNESS * 2;

    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          display: "inline-block",
          background: "var(--color-cream-50)",
          overflow: "visible",
        }}
      >
        <svg
          width={svgW}
          height={svgH}
          viewBox={`${-THICKNESS} ${-THICKNESS} ${svgW} ${svgH}`}
          style={{
            position: "absolute",
            left: -THICKNESS,
            top: -THICKNESS,
            width: svgW,
            height: svgH,
            display: "block",
          }}
        >
          {corners.map((c, i) => (
            <rect
              key={`corner-${i}`}
              x={c.x}
              y={c.y}
              width={c.size}
              height={c.size}
              fill={CORNER_COLORS[i]}
              stroke="var(--color-text)"
              strokeOpacity={0.55}
              strokeWidth={1.5}
            />
          ))}
          {pieces.map((p, i) => (
            <path
              key={`piece-${i}`}
              d={p.path}
              transform={`translate(${p.offsetX} ${p.offsetY})`}
              fill={TILE_COLORS[i % TILE_COLORS.length]}
              stroke="var(--color-text)"
              strokeOpacity={0.55}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          ))}
        </svg>
        <div ref={innerRef} style={{ position: "relative" }}>
          {children}
        </div>
      </div>
    );
  }
);
