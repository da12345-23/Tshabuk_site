"use client";

import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { borderFrameLayout } from "@/lib/jigsaw";

const THICKNESS = 26;

// Literal hex values, not CSS custom properties -- this frame is only ever
// rendered inside an off-screen copy captured by html-to-image, and that
// capture pipeline does not reliably resolve var(--color-x) on SVG fill/
// stroke attributes, silently dropping the color instead of erroring.
const SAGE = "#5a9a6e";
const MAROON = "#a85a58";
const STEEL = "#6e93b0";
const MUSTARD = "#f3c243";
const CREAM_100 = "#f7ecd9";
const INK = "#2b2320";

// The exact four logo colors, cycling piece to piece -- colorful and
// celebratory, matching the brand palette exactly rather than a neutral
// background tone.
const TILE_COLORS = [SAGE, MAROON, STEEL, MUSTARD];
// corners come back as [top-left, top-right, bottom-right, bottom-left] --
// echo the logo's own arrangement (green / maroon / mustard / blue).
const CORNER_COLORS = [SAGE, MAROON, MUSTARD, STEEL];

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
          background: CREAM_100,
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
              stroke={INK}
              strokeOpacity={0.55}
              strokeWidth={2}
            />
          ))}
          {pieces.map((p, i) => (
            <path
              key={`piece-${i}`}
              d={p.path}
              transform={`translate(${p.offsetX} ${p.offsetY})`}
              fill={TILE_COLORS[i % TILE_COLORS.length]}
              stroke={INK}
              strokeOpacity={0.55}
              strokeWidth={2}
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
