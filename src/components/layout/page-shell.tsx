"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface PageShellProps {
  children: ReactNode;
}

function readAdminUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem("sbp-unlock-admin") === "1";
  } catch {
    return false;
  }
}

/**
 * Top offset for promo bar + fixed navbar (+ admin subnav when unlocked).
 */
export function PageShell({ children }: PageShellProps) {
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    const sync = () => setAdminOpen(readAdminUnlocked());
    sync();
    window.addEventListener("sbp-admin-unlock", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("sbp-admin-unlock", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // promo bar + larger logo navbar (+ optional admin subnav)
  const padClass = adminOpen
    ? "pt-[calc(var(--promo-bar-height,0px)+var(--navbar-height,6rem)+2.75rem)] lg:pt-[calc(var(--promo-bar-height,0px)+var(--navbar-height-lg,7rem)+2.75rem)]"
    : "pt-[calc(var(--promo-bar-height,0px)+var(--navbar-height,6rem))] lg:pt-[calc(var(--promo-bar-height,0px)+var(--navbar-height-lg,7rem))]";

  const glowTop = adminOpen
    ? "top-[calc(var(--promo-bar-height,0px)+var(--navbar-height,6rem)+2.75rem)] lg:top-[calc(var(--promo-bar-height,0px)+var(--navbar-height-lg,7rem)+2.75rem)]"
    : "top-[calc(var(--promo-bar-height,0px)+var(--navbar-height,6rem))] lg:top-[calc(var(--promo-bar-height,0px)+var(--navbar-height-lg,7rem))]";

  return (
    <div className={`relative ${padClass}`}>
      <div
        className={`pointer-events-none absolute inset-x-0 h-40 bg-gradient-to-b from-royal-gold/[0.07] to-transparent ${glowTop}`}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
