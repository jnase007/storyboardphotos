"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "sbp-cookie-consent";

type ConsentValue = "accepted" | "essential";

function readConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "accepted" || value === "essential") return value;
  } catch {
    /* ignore */
  }
  return null;
}

function writeConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent("sbp-cookie-consent", { detail: value })
  );
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) {
      const id = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(id);
    }
  }, []);

  function choose(value: ConsentValue) {
    writeConsent(value);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl sm:bottom-6 sm:left-6 sm:right-auto"
        >
          <div className="rounded-2xl border border-royal-gold/35 bg-royal-blue/95 backdrop-blur-xl p-5 sm:p-6 shadow-2xl shadow-black/40 glow-lantern">
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-royal-gold/60 to-transparent"
              aria-hidden="true"
            />
            <h2
              id="cookie-consent-title"
              className="font-serif text-lg font-bold text-royal-cream mb-2"
            >
              Cookies & Privacy
            </h2>
            <p
              id="cookie-consent-desc"
              className="text-sm text-royal-cream/70 leading-relaxed mb-5"
            >
              We use cookies to run the site, remember your preferences, and
              understand how visitors use our pages. See our{" "}
              <Link
                href="/privacy"
                className="text-royal-gold underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                className="text-royal-gold underline-offset-2 hover:underline"
              >
                Terms
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="inline-flex h-11 items-center justify-center rounded-md bg-royal-gold px-5 text-sm font-semibold text-royal-blue hover:bg-[#D4B480] transition-colors"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => choose("essential")}
                className="inline-flex h-11 items-center justify-center rounded-md border border-royal-gold/40 bg-transparent px-5 text-sm font-semibold text-royal-cream hover:bg-royal-gold/10 transition-colors"
              >
                Essential only
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
