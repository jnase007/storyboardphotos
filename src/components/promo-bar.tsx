"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, X } from "lucide-react";

export const PROMO_CODE = "KINGDOM";
export const PROMO_BAR_DISMISS_KEY = "sbp-promo-bar-dismissed";
export const PROMO_BAR_HEIGHT = "2rem"; // h-8

/**
 * Sitewide promo strip — code KINGDOM. Sets --promo-bar-height for fixed headers.
 */
export function PromoBar() {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(PROMO_BAR_DISMISS_KEY) === "1") {
        setVisible(false);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.style.setProperty(
      "--promo-bar-height",
      visible ? PROMO_BAR_HEIGHT : "0px"
    );
    return () => {
      document.documentElement.style.setProperty("--promo-bar-height", "0px");
    };
  }, [visible, ready]);

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(PROMO_BAR_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!ready || !visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-8 bg-royal-gold text-royal-blue"
      role="banner"
    >
      <div className="container mx-auto h-full px-3 sm:px-4 lg:px-8 flex items-center justify-center gap-1.5 sm:gap-2 relative">
        <Tag className="h-3 w-3 shrink-0 hidden sm:block" />
        <p className="text-[11px] sm:text-xs font-semibold text-center leading-tight">
          <span className="hidden sm:inline">Limited offer — </span>
          Use code{" "}
          <span className="font-bold tracking-wide">{PROMO_CODE}</span>
          {" "}for{" "}
          <span className="font-bold">15% off</span>
          <Link
            href="/book"
            className="ml-1.5 underline underline-offset-2 hover:opacity-80 font-bold"
          >
            Book now
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-1.5 sm:right-3 inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-royal-blue/10"
          aria-label="Dismiss promo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
