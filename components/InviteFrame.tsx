"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { borderFrameLayout } from "@/lib/jigsaw";

const THICKNESS = 38;

// Literal hex values, not CSS custom properties -- resolved into a raster
// image (see below), so nothing here depends on the page's stylesheet.
const SAGE = "#5a9a6e";
const MAROON = "#a85a58";
const STEEL = "#6e93b0";
const MUSTARD = "#f3c243";
const CREAM_100 = "#f7ecd9";
const INK = "#2b2320";

const TILE_COLORS = [SAGE, MAROON, STEEL, MUSTARD];
// corners come back as [top-left, top-right, bottom-right, bottom-left] --
// echo the logo's own arrangement (green / maroon / mustard / blue).
const CORNER_COLORS = [SAGE, MAROON, MUSTARD, STEEL];

/**
 * Wraps its children in a picture-frame border made of many small,
 * interlocking puzzle-piece tiles lining each edge -- a real row of tab-
 * into-blank pieces (reusing the exact same generator as the play grid),
 * not one big outline shape.
 *
 * The frame is drawn to an off-screen <canvas> and rendered as a plain
 * <img> (data URL), not a live inline <svg> -- html-to-image (the "Save as
 * image" library) fails to serialize a *nested* <svg> with many children
 * correctly when it captures this off-screen copy: the DOM itself is
 * always correct (verified directly), but the exported PNG comes out with
 * the border essentially blank. A pre-rasterized <img> sidesteps that
 * entirely, the same way switching the mascot/logo images to plain <img>
 * fixed their export bug.
 */
export const InviteFrame = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; onReady?: () => void }
>(function InviteFrame({ children, onReady }, ref) {
    const innerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 340, height: 420 });
    const [frameSrc, setFrameSrc] = useState<string | null>(null);

    useLayoutEffect(() => {
      const measure = () => {
        if (innerRef.current) {
          const w = innerRef.current.offsetWidth;
          const h = innerRef.current.offsetHeight;
          if (w > 0 && h > 0) setSize({ width: w, height: h });
        }
      };
      measure();
      const observer = new ResizeObserver(measure);
      if (innerRef.current) observer.observe(innerRef.current);
      return () => observer.disconnect();
    }, []);

    const svgW = size.width + THICKNESS * 2;
    const svgH = size.height + THICKNESS * 2;

    useEffect(() => {
      let cancelled = false;
      const { pieces, corners } = borderFrameLayout(size.width, size.height, THICKNESS);

      const rectsSvg = corners
        .map(
          (c, i) =>
            `<rect x="${c.x}" y="${c.y}" width="${c.size}" height="${c.size}" fill="${CORNER_COLORS[i]}" stroke="${INK}" stroke-opacity="0.85" stroke-width="3" />`
        )
        .join("");
      const pathsSvg = pieces
        .map(
          (p, i) =>
            `<path d="${p.path}" transform="translate(${p.offsetX} ${p.offsetY})" fill="${TILE_COLORS[i % TILE_COLORS.length]}" stroke="${INK}" stroke-opacity="0.85" stroke-width="3" stroke-linejoin="round" />`
        )
        .join("");
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="${-THICKNESS} ${-THICKNESS} ${svgW} ${svgH}">${rectsSvg}${pathsSvg}</svg>`;

      const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        const scale = 2; // retina-sharp export
        const canvas = document.createElement("canvas");
        canvas.width = svgW * scale;
        canvas.height = svgH * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, svgW, svgH);
        setFrameSrc(canvas.toDataURL("image/png"));
        URL.revokeObjectURL(url);
        onReady?.();
      };
      img.src = url;

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size.width, size.height, svgW, svgH]);

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
        {frameSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frameSrc}
            alt=""
            style={{
              position: "absolute",
              left: -THICKNESS,
              top: -THICKNESS,
              width: svgW,
              height: svgH,
              display: "block",
            }}
          />
        )}
        <div ref={innerRef} style={{ position: "relative" }}>
          {children}
        </div>
      </div>
    );
  });
