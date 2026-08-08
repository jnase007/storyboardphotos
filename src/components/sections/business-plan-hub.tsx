"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  FileDown,
  Target,
  TrendingUp,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessPlanSection } from "@/components/sections/business-plan";
import { PhaseDecisionSection } from "@/components/sections/phase-decision";
import { CostBreakdownSection } from "@/components/sections/cost-breakdown";
import { ProformaSection } from "@/components/sections/proforma";

export type BizPlanTab = "plan" | "phases" | "costs" | "proforma";

const TABS: {
  id: BizPlanTab;
  label: string;
  short: string;
  icon: typeof ClipboardList;
  path: string;
}[] = [
  {
    id: "plan",
    label: "Full Plan",
    short: "Plan",
    icon: ClipboardList,
    path: "/business-plan",
  },
  {
    id: "phases",
    label: "Phases",
    short: "Phases",
    icon: PartyPopper,
    path: "/business-plan/phases",
  },
  {
    id: "costs",
    label: "Cost Breakdown",
    short: "Costs",
    icon: TrendingUp,
    path: "/business-plan/cost-breakdown",
  },
  {
    id: "proforma",
    label: "Proforma",
    short: "Proforma",
    icon: Target,
    path: "/business-plan/proforma",
  },
];

function tabFromPath(pathname: string, queryTab: string | null): BizPlanTab {
  if (queryTab === "phases" || queryTab === "costs" || queryTab === "proforma" || queryTab === "plan") {
    return queryTab;
  }
  if (pathname.startsWith("/business-plan/phases")) return "phases";
  if (pathname.startsWith("/business-plan/cost-breakdown")) return "costs";
  if (pathname.startsWith("/business-plan/proforma")) return "proforma";
  return "plan";
}

/**
 * Single Business Plan surface: Full Plan + Phases + Costs + Proforma.
 * Keeps old URLs working while collapsing admin nav clutter.
 */
export function BusinessPlanHub({ initialTab }: { initialTab?: BizPlanTab }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const derived = useMemo(
    () => tabFromPath(pathname || "/business-plan", searchParams.get("tab") || initialTab || null),
    [pathname, searchParams, initialTab]
  );
  const [tab, setTab] = useState<BizPlanTab>(derived);

  useEffect(() => {
    setTab(derived);
  }, [derived]);

  function selectTab(next: BizPlanTab) {
    setTab(next);
    // Prefer clean hub URL with ?tab= so one page owns all sections
    const href =
      next === "plan" ? "/business-plan" : `/business-plan?tab=${next}`;
    router.replace(href, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-enchanted-cream">
      {/* Unified section switcher */}
      <div className="sticky top-[calc(var(--promo-bar-height,0px)+4rem+var(--admin-nav-height,0px))] z-30 border-b border-royal-gold/25 bg-[#F8F4EC]/95 backdrop-blur print:hidden">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-royal-gold">
                Internal
              </p>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-royal-blue leading-tight">
                Business Plan
              </h1>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTab(t.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors border",
                      active
                        ? "bg-royal-blue text-royal-cream border-royal-blue shadow-sm"
                        : "bg-white/80 text-royal-blue/70 border-royal-gold/25 hover:border-royal-gold hover:bg-royal-gold/10"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", active ? "text-royal-gold" : "text-royal-gold/80")} />
                    <span className="sm:hidden">{t.short}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                );
              })}
              <Link
                href="/business-plan/print"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold border border-royal-gold/40 bg-royal-gold text-royal-blue hover:bg-[#D4B480]"
              >
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content — one section at a time */}
      <div className={tab === "plan" ? "block" : "hidden"}>
        <BusinessPlanSection embedded />
      </div>
      <div className={tab === "phases" ? "block" : "hidden"}>
        <PhaseDecisionSection embedded />
      </div>
      <div className={tab === "costs" ? "block" : "hidden"}>
        <CostBreakdownSection embedded />
      </div>
      <div className={tab === "proforma" ? "block" : "hidden"}>
        <ProformaSection embedded />
      </div>
    </div>
  );
}
