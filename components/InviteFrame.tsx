"use client";

import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { frameRingPath } from "@/lib/jigsaw";

const THICKNESS = 26;
const BUMPS_PER_SIDE = 4;

/**
 * Wraps its children in a coherent puzzle-edge picture frame -- one
 * continuous path (reusing the real jigsaw tab geometry) instead of tiling
 * a linear strip image, so corners always meet cleanly. Sized to its
 * content automatically.
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

    const { outer, inner, accents } = frameRingPath(size.width, size.height, THICKNESS, BUMPS_PER_SIDE);
    const svgW = size.width + THICKNESS * 2;
    const svgH = size.height + THICKNESS * 2;
    const palette = [
      "var(--color-sage-500)",
      "var(--color-maroon-500)",
      "var(--color-steel-500)",
      "var(--color-mustard-400)",
    ];
    const clipId = "invite-frame-clip";

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
          <defs>
            <clipPath id={clipId}>
              <path d={`${outer} ${inner}`} fillRule="evenodd" />
            </clipPath>
          </defs>
          <path
            d={`${outer} ${inner}`}
            fillRule="evenodd"
            fill="var(--color-cream-100)"
          />
          <g clipPath={`url(#${clipId})`}>
            {accents.map((a, i) => (
              <circle
                key={i}
                cx={a.x}
                cy={a.y}
                r={THICKNESS * 0.9}
                fill={palette[a.colorIndex % palette.length]}
                fillOpacity={0.8}
              />
            ))}
          </g>
          <path
            d={`${outer} ${inner}`}
            fillRule="evenodd"
            fill="none"
            stroke="var(--color-wood-500)"
            strokeOpacity={0.55}
            strokeWidth={2.5}
          />
        </svg>
        <div ref={innerRef} style={{ position: "relative" }}>
          {children}
        </div>
      </div>
    );
  }
);
