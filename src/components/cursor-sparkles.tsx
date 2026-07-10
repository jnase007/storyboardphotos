"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Sparkle = {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: "gold" | "cream" | "soft";
  drift: number;
};

const MAX_SPARKLES = 18;
const SPAWN_DISTANCE = 14;

/**
 * Soft gold sparkle trail that follows the cursor on desktop.
 * Disabled on touch devices and when prefers-reduced-motion is on.
 */
export function CursorSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!finePointer || reduceMotion) return;

    setEnabled(true);

    let lastX = 0;
    let lastY = 0;
    let id = 0;
    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const spawn = (x: number, y: number) => {
      const hues: Sparkle["hue"][] = ["gold", "cream", "soft"];
      const next: Sparkle = {
        id: ++id,
        x,
        y,
        size: 3 + Math.random() * 5,
        hue: hues[Math.floor(Math.random() * hues.length)],
        drift: (Math.random() - 0.5) * 28,
      };

      setSparkles((prev) => [...prev.slice(-(MAX_SPARKLES - 1)), next]);

      window.setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== next.id));
      }, 900);
    };

    const onMove = (e: MouseEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (!pending) return;
        const { x, y } = pending;
        pending = null;
        const dx = x - lastX;
        const dy = y - lastY;
        if (dx * dx + dy * dy < SPAWN_DISTANCE * SPAWN_DISTANCE) return;
        lastX = x;
        lastY = y;
        spawn(x, y);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
      aria-hidden="true"
    >
      {sparkles.map((s) => (
        <span
          key={s.id}
          className={`cursor-sparkle cursor-sparkle--${s.hue}`}
          style={
            {
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              ["--sparkle-drift" as string]: `${s.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
