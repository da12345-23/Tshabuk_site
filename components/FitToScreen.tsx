"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Scales its content down evenly when it's taller than the screen, so it's
 * always seen whole instead of cut off or needing a scroll. `reserve` is
 * the vertical space (px) taken by everything outside it (page padding,
 * header). The outer box takes the scaled size, so no empty scroll space
 * is left behind; offsetWidth/Height ignore transforms, so measuring can't
 * feed back into the scale.
 */
export function FitToScreen({ reserve, children }: { reserve: number; children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [vh, setVh] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const onResize = () => setVh(window.innerHeight);
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scale = box && vh ? Math.min(1, (vh - reserve) / box.h) : 1;
  const scaled = box !== null && scale < 1;

  return (
    <div style={scaled ? { width: box.w * scale, height: box.h * scale } : undefined}>
      <div
        ref={innerRef}
        style={scaled ? { width: box.w, transform: `scale(${scale})`, transformOrigin: "top left" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
