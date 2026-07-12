"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Crown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  BP_PNL_SCENARIOS,
  computeBpPnl,
} from "@/lib/business-plan-content";

function money(n: number): string {
  const abs = Math.abs(Math.round(n));
  const formatted = abs.toLocaleString("en-US");
  if (n < 0) return `-$${formatted}`;
  return `$${formatted}`;
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function ScenarioCard({
  title,
  subtitle,
  badge,
  sessionsPerYear,
  avgTicket,
  birthdayPartiesPerYear,
  birthdayAvgTicket,
  photographers,
  parallelLanes,
  pnl,
  accent,
}: {
  title: string;
  subtitle: string;
  badge: string;
  sessionsPerYear: number;
  avgTicket: number;
  birthdayPartiesPerYear: number;
  birthdayAvgTicket: number;
  photographers: number;
  parallelLanes: number;
  pnl: ReturnType<typeof computeBpPnl>;
  accent: "blue" | "green";
}) {
  const headClass =
    accent === "green"
      ? "bg-emerald-800"
      : "bg-royal-blue";
  const ring =
    accent === "green" ? "border-emerald-200" : "border-royal-gold/30";

  return (
    <div className={`rounded-2xl border ${ring} bg-white shadow-sm overflow-hidden`}>
      <div className={`${headClass} px-5 py-4 text-royal-cream`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-royal-gold font-semibold">
              {badge}
            </p>
            <h2 className="font-serif text-2xl font-bold mt-1">{title}</h2>
            <p className="text-sm text-royal-cream/70 mt-1">{subtitle}</p>
          </div>
          <div className="text-right text-xs text-royal-cream/70">
            <div>{photographers} photog{photographers > 1 ? "s" : ""}</div>
            <div>{parallelLanes} lane{parallelLanes > 1 ? "s" : ""}</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Volume */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-royal-cream/50 border border-royal-gold/15 p-3">
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Photo sessions / yr
            </p>
            <p className="font-mono text-lg font-bold text-royal-blue">
              {sessionsPerYear.toLocaleString()}
            </p>
            <p className="text-xs text-royal-blue/55 mt-0.5">
              @ ${avgTicket} avg ticket
            </p>
          </div>
          <div className="rounded-xl bg-royal-cream/50 border border-royal-gold/15 p-3">
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Birthday parties / yr
            </p>
            <p className="font-mono text-lg font-bold text-royal-blue">
              {birthdayPartiesPerYear}
            </p>
            <p className="text-xs text-royal-blue/55 mt-0.5">
              @ ${birthdayAvgTicket} avg
            </p>
          </div>
        </div>

        {/* P&L table */}
        <div className="overflow-hidden rounded-xl border border-royal-gold/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-royal-blue/5 text-royal-blue/60 text-xs uppercase tracking-wide">
                <th className="text-left p-3 font-semibold">Line</th>
                <th className="text-right p-3 font-semibold">Annual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-royal-gold/10">
                <td className="p-3 text-royal-blue/80">Session revenue</td>
                <td className="p-3 text-right font-mono text-royal-blue">
                  {money(pnl.sessionRevenue)}
                </td>
              </tr>
              <tr className="border-t border-royal-gold/10">
                <td className="p-3 text-royal-blue/80">Birthday revenue</td>
                <td className="p-3 text-right font-mono text-royal-blue">
                  {money(pnl.birthdayRevenue)}
                </td>
              </tr>
              <tr className="border-t border-royal-gold/15 bg-royal-gold/10">
                <td className="p-3 font-bold text-royal-blue">Total Revenue</td>
                <td className="p-3 text-right font-mono font-bold text-royal-blue">
                  {money(pnl.revenue)}
                </td>
              </tr>
              <tr className="border-t border-royal-gold/10">
                <td className="p-3 text-royal-blue/80">
                  COGS — sessions
                  <span className="block text-[11px] text-royal-blue/45">
                    ~{money(pnl.sessionCogsUnit)} / session
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-red-600">
                  ({money(pnl.cogsSessions)})
                </td>
              </tr>
              <tr className="border-t border-royal-gold/10">
                <td className="p-3 text-royal-blue/80">
                  COGS — birthdays
                  <span className="block text-[11px] text-royal-blue/45">
                    ~{money(pnl.birthdayCogsUnit)} / party
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-red-600">
                  ({money(pnl.cogsBirthdays)})
                </td>
              </tr>
              <tr className="border-t border-royal-gold/10">
                <td className="p-3 font-semibold text-royal-blue">Total COGS</td>
                <td className="p-3 text-right font-mono font-semibold text-red-600">
                  ({money(pnl.cogsTotal)})
                </td>
              </tr>
              <tr className="border-t border-emerald-200 bg-emerald-50/80">
                <td className="p-3 font-bold text-emerald-900">
                  Gross Profit
                  <span className="ml-2 text-xs font-semibold text-emerald-700">
                    {pct(pnl.grossMarginPct)} margin
                  </span>
                </td>
                <td className="p-3 text-right font-mono font-bold text-emerald-800">
                  {money(pnl.grossProfit)}
                </td>
              </tr>
              <tr className="border-t border-royal-gold/10">
                <td className="p-3 font-semibold text-royal-blue">
                  Operating Expenses
                </td>
                <td className="p-3 text-right font-mono font-semibold text-red-600">
                  ({money(pnl.opex)})
                </td>
              </tr>
              {pnl.expenses.map((e) => (
                <tr key={e.label} className="border-t border-royal-gold/5">
                  <td className="px-3 py-1.5 pl-6 text-xs text-royal-blue/55">
                    {e.label}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs text-royal-blue/55">
                    {money(e.annual)}
                  </td>
                </tr>
              ))}
              <tr
                className={`border-t-2 ${
                  pnl.net >= 0
                    ? "border-emerald-300 bg-emerald-100/70"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <td className="p-3 font-bold text-royal-blue">
                  Net Operating Profit
                  <span className="ml-2 text-xs font-semibold text-royal-blue/60">
                    {pct(pnl.netMarginPct)} net margin
                  </span>
                </td>
                <td
                  className={`p-3 text-right font-mono font-black text-lg ${
                    pnl.net >= 0 ? "text-emerald-800" : "text-red-700"
                  }`}
                >
                  {money(pnl.net)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CostBreakdownSection() {
  const small = BP_PNL_SCENARIOS.small;
  const large = BP_PNL_SCENARIOS.large;
  const smallPnl = computeBpPnl(small);
  const largePnl = computeBpPnl(large);
  const cogs = BP_PNL_SCENARIOS.cogsPerSession;

  return (
    <article className="py-12 sm:py-16 bg-enchanted-cream">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/business-plan"
            className="inline-flex items-center gap-2 text-sm font-semibold text-royal-blue/70 hover:text-royal-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            Business Plan
          </Link>
          <Link
            href="/business-plan/proforma"
            className="inline-flex items-center gap-2 text-sm font-semibold text-royal-blue/70 hover:text-royal-blue"
          >
            Pre-Launch Proforma
          </Link>
        </div>

        <header className="text-center mb-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-royal-gold/15 ring-1 ring-royal-gold/30 mb-3">
            <Wallet className="h-5 w-5 text-royal-gold" />
          </div>
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-2">
            Internal · Full P&L
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-3">
            Capacity Cost Breakdown
          </h1>
          <p className="text-royal-blue/60 text-lg max-w-2xl mx-auto">
            Small vs large studio — revenue, COGS, gross margin, operating
            expenses, and net profit on an annual basis.
          </p>
        </header>

        {/* Snapshot strip */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl border border-royal-gold/25 bg-white p-4 text-center">
            <TrendingUp className="h-4 w-4 text-royal-gold mx-auto mb-1" />
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Small net
            </p>
            <p className="font-mono text-xl font-bold text-emerald-700">
              {money(smallPnl.net)}
            </p>
          </div>
          <div className="rounded-xl border border-royal-gold/25 bg-white p-4 text-center">
            <TrendingUp className="h-4 w-4 text-royal-gold mx-auto mb-1" />
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Large net
            </p>
            <p className="font-mono text-xl font-bold text-emerald-700">
              {money(largePnl.net)}
            </p>
          </div>
          <div className="rounded-xl border border-royal-gold/25 bg-white p-4 text-center">
            <Building2 className="h-4 w-4 text-royal-gold mx-auto mb-1" />
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Small revenue
            </p>
            <p className="font-mono text-xl font-bold text-royal-blue">
              {money(smallPnl.revenue)}
            </p>
          </div>
          <div className="rounded-xl border border-royal-gold/25 bg-white p-4 text-center">
            <Crown className="h-4 w-4 text-royal-gold mx-auto mb-1" />
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Large revenue
            </p>
            <p className="font-mono text-xl font-bold text-royal-blue">
              {money(largePnl.revenue)}
            </p>
          </div>
        </div>

        {/* Side by side P&Ls */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <ScenarioCard
            title={small.name}
            subtitle={small.subtitle}
            badge="Phase 1 scale"
            sessionsPerYear={small.sessionsPerYear}
            avgTicket={small.avgTicket}
            birthdayPartiesPerYear={small.birthdayPartiesPerYear}
            birthdayAvgTicket={small.birthdayAvgTicket}
            photographers={small.photographers}
            parallelLanes={small.parallelLanes}
            pnl={smallPnl}
            accent="blue"
          />
          <ScenarioCard
            title={large.name}
            subtitle={large.subtitle}
            badge="Full multi-set scale"
            sessionsPerYear={large.sessionsPerYear}
            avgTicket={large.avgTicket}
            birthdayPartiesPerYear={large.birthdayPartiesPerYear}
            birthdayAvgTicket={large.birthdayAvgTicket}
            photographers={large.photographers}
            parallelLanes={large.parallelLanes}
            pnl={largePnl}
            accent="green"
          />
        </div>

        {/* Comparison table */}
        <section className="rounded-2xl border border-royal-gold/25 bg-white p-5 sm:p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-royal-blue mb-4">
            Side-by-side comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-royal-blue text-royal-cream">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-right p-3 font-semibold">Small</th>
                  <th className="text-right p-3 font-semibold">Large</th>
                  <th className="text-right p-3 font-semibold">Delta</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Sessions / year",
                    s: small.sessionsPerYear,
                    l: large.sessionsPerYear,
                    money: false,
                  },
                  {
                    label: "Total revenue",
                    s: smallPnl.revenue,
                    l: largePnl.revenue,
                    money: true,
                  },
                  {
                    label: "Total COGS",
                    s: smallPnl.cogsTotal,
                    l: largePnl.cogsTotal,
                    money: true,
                  },
                  {
                    label: "Gross profit",
                    s: smallPnl.grossProfit,
                    l: largePnl.grossProfit,
                    money: true,
                  },
                  {
                    label: "Gross margin %",
                    s: smallPnl.grossMarginPct,
                    l: largePnl.grossMarginPct,
                    money: false,
                    isPct: true,
                  },
                  {
                    label: "Operating expenses",
                    s: smallPnl.opex,
                    l: largePnl.opex,
                    money: true,
                  },
                  {
                    label: "Net operating profit",
                    s: smallPnl.net,
                    l: largePnl.net,
                    money: true,
                    emphasize: true,
                  },
                  {
                    label: "Net margin %",
                    s: smallPnl.netMarginPct,
                    l: largePnl.netMarginPct,
                    money: false,
                    isPct: true,
                  },
                ].map((row, i) => {
                  const delta = row.l - row.s;
                  return (
                    <tr
                      key={row.label}
                      className={`${
                        row.emphasize
                          ? "bg-emerald-50 font-bold"
                          : i % 2 === 0
                            ? "bg-white"
                            : "bg-royal-cream/30"
                      }`}
                    >
                      <td className="p-3 text-royal-blue">{row.label}</td>
                      <td className="p-3 text-right font-mono text-royal-blue">
                        {row.isPct
                          ? pct(row.s)
                          : row.money
                            ? money(row.s)
                            : row.s.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-royal-blue">
                        {row.isPct
                          ? pct(row.l)
                          : row.money
                            ? money(row.l)
                            : row.l.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-700">
                        {row.isPct
                          ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts`
                          : row.money
                            ? `${delta >= 0 ? "+" : ""}${money(delta)}`
                            : `+${delta.toLocaleString()}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* COGS detail + assumptions */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <section className="rounded-2xl border border-royal-gold/25 bg-white p-5">
            <h3 className="font-serif text-lg font-bold text-royal-blue mb-3">
              COGS build-up (per photo session)
            </h3>
            <ul className="space-y-2 text-sm text-royal-blue/75">
              <li className="flex justify-between gap-3">
                <span>Book / print (blended)</span>
                <span className="font-mono font-semibold">
                  ${cogs.bookPrintBlended}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>AI generation</span>
                <span className="font-mono font-semibold">${cogs.ai}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Consumables / wear</span>
                <span className="font-mono font-semibold">
                  ${cogs.consumables}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Payment processing</span>
                <span className="font-mono font-semibold">
                  {(cogs.paymentFeeRate * 100).toFixed(0)}% of ticket
                </span>
              </li>
            </ul>
            <p className="text-xs text-royal-blue/50 mt-3 leading-relaxed">
              {cogs.note}
            </p>
          </section>

          <section className="rounded-2xl border border-royal-gold/25 bg-white p-5">
            <h3 className="font-serif text-lg font-bold text-royal-blue mb-3">
              Model assumptions
            </h3>
            <ul className="space-y-2">
              {BP_PNL_SCENARIOS.assumptions.map((a) => (
                <li
                  key={a}
                  className="flex gap-2 text-sm text-royal-blue/75 leading-relaxed"
                >
                  <span className="text-royal-gold shrink-0">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="text-center text-xs text-royal-blue/40">
          Internal model only · figures are planning estimates, not forecasts ·{" "}
          {new Date().getFullYear()} Storybook Photos
        </p>
      </div>
    </article>
  );
}
