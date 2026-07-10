"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileDown, ArrowLeft, Printer } from "lucide-react";
import { PasswordGate } from "@/components/password-gate";
import { BusinessPlanDocument } from "@/components/sections/business-plan-document";

/**
 * Clean multi-page document view for Save as PDF / print.
 * Avoids Framer Motion (which left sections at opacity:0 and clipped to 1 page).
 */
export function BusinessPlanPrintView() {
  const [ready, setReady] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    setReady(true);
    try {
      setAdminOpen(sessionStorage.getItem("sbp-unlock-admin") === "1");
    } catch {
      /* ignore */
    }
    const sync = () => {
      try {
        setAdminOpen(sessionStorage.getItem("sbp-unlock-admin") === "1");
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("sbp-admin-unlock", sync);
    return () => window.removeEventListener("sbp-admin-unlock", sync);
  }, []);

  return (
    <PasswordGate
      code="3121"
      storageKey="sbp-unlock-admin"
      title="Business Plan PDF"
      description="Enter the access code to view and save the full document."
      buttonLabel="View Document"
    >
      <div
        className={`min-h-screen bg-white ${
          adminOpen
            ? "pt-[calc(var(--promo-bar-height,0px)+6.75rem)] lg:pt-[calc(var(--promo-bar-height,0px)+7.75rem)]"
            : "pt-[calc(var(--promo-bar-height,0px)+4rem)] lg:pt-[calc(var(--promo-bar-height,0px)+5rem)]"
        }`}
      >
        <div
          className={`print:hidden sticky z-20 border-b border-royal-gold/20 bg-royal-cream/95 backdrop-blur-sm ${
            adminOpen
              ? "top-[calc(var(--promo-bar-height,0px)+6.75rem)] lg:top-[calc(var(--promo-bar-height,0px)+7.75rem)]"
              : "top-[calc(var(--promo-bar-height,0px)+4rem)] lg:top-[calc(var(--promo-bar-height,0px)+5rem)]"
          }`}
        >
          <div className="mx-auto max-w-3xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/business-plan"
              className="inline-flex items-center gap-1.5 text-sm text-royal-blue/70 hover:text-royal-gold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to plan
            </Link>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => ready && window.print()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-royal-gold px-4 text-sm font-semibold text-royal-blue hover:bg-[#D4B480] transition-colors"
              >
                <FileDown className="h-4 w-4" />
                Save as PDF
              </button>
              <button
                type="button"
                onClick={() => ready && window.print()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-royal-gold/40 bg-white px-4 text-sm font-semibold text-royal-blue hover:bg-royal-gold/10 transition-colors"
              >
                <Printer className="h-4 w-4 text-royal-gold" />
                Print
              </button>
            </div>
          </div>
          <p className="mx-auto max-w-3xl px-4 pb-3 text-xs text-royal-blue/50">
            Tip: In the print dialog, choose{" "}
            <strong className="text-royal-blue/70">Save as PDF</strong> (or
            &ldquo;Microsoft Print to PDF&rdquo;) as the destination. The full
            multi-page document will export.
          </p>
        </div>

        <BusinessPlanDocument />
      </div>
    </PasswordGate>
  );
}
