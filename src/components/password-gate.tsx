"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { Crown, Lock } from "lucide-react";

type PasswordGateProps = {
  /** Plain access code for this soft preview gate */
  code: string;
  /** Unique key so different pages can unlock independently */
  storageKey: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  children: ReactNode;
};

/**
 * Lightweight client-side gate for internal / preview pages.
 * Not cryptographic security — keeps casual visitors out until the code is entered.
 */
export function PasswordGate({
  code,
  storageKey,
  title = "Protected Page",
  description = "Enter the access code to continue.",
  buttonLabel = "Unlock",
  children,
}: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey) === "1") {
        setUnlocked(true);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [storageKey]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim() === code) {
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        /* ignore */
      }
      setError(false);
      setUnlocked(true);
      // Notify AdminNav (and other listeners) that staff tools are unlocked
      if (storageKey === "sbp-unlock-admin") {
        try {
          window.dispatchEvent(new Event("sbp-admin-unlock"));
        } catch {
          /* ignore */
        }
      }
      return;
    }
    setError(true);
  }

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-enchanted-cream">
        <div className="h-8 w-8 rounded-full border-2 border-royal-gold/40 border-t-royal-gold animate-spin" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-enchanted-cream px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border border-royal-gold/30 bg-white/90 backdrop-blur-sm p-8 sm:p-10 shadow-xl shadow-royal-gold/10">
        <div className="flex justify-center mb-5">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-royal-blue/5 ring-1 ring-royal-gold/30">
            <Lock className="h-6 w-6 text-royal-gold" />
          </div>
        </div>
        <div className="text-center mb-8">
          <div className="ornament-line mb-3" aria-hidden="true">
            <Crown className="h-3.5 w-3.5 text-royal-gold/70" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue mb-2">
            {title}
          </h1>
          <p className="text-sm text-royal-blue/60 leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="access-code"
              className="block text-sm font-medium text-royal-blue mb-1.5"
            >
              Access code
            </label>
            <input
              id="access-code"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              className="w-full h-12 rounded-md border border-royal-gold/30 bg-royal-cream/50 px-4 text-royal-blue outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20"
              placeholder="Enter code"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                That code didn&apos;t match. Please try again.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-royal-gold px-6 text-sm font-semibold text-royal-blue hover:bg-[#D4B480] transition-colors"
          >
            {buttonLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
