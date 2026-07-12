"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Crown,
  PiggyBank,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  BP_PROFORMA,
  BP_PNL_SCENARIOS,
  computeProformaMonth,
  computeProformaYear,
} from "@/lib/business-plan-content";

function money(n: number): string {
  const rounded = Math.round(n);
  const abs = Math.abs(rounded).toLocaleString("en-US");
  return rounded < 0 ? `-$${abs}` : `$${abs}`;
}

export function ProformaSection() {
  const fixedOpex = BP_PROFORMA.monthlyFixedOpEx.reduce(
    (s, r) => s + r.amount,
    0
  );
  const startupTotal = BP_PROFORMA.startupUses.reduce((s, r) => s + r.mid, 0);
  const capitalMid =
    startupTotal + BP_PROFORMA.workingCapital.reserve;

  const monthly = BP_PROFORMA.year1MonthlyRamp.map((m) => {
    const pnl = computeProformaMonth({
      sessions: m.sessions,
      avgTicket: m.avgTicket,
      birthdayParties: m.birthdayParties,
      birthdayAvgTicket: BP_PROFORMA.birthdayAvgTicket,
      fixedOpex,
    });
    return { ...m, pnl };
  });

  let running = 0;
  const monthlyWithCash = monthly.map((m) => {
    running += m.pnl.net;
    return { ...m, cumulative: running };
  });

  const y1Sessions = monthly.reduce((s, m) => s + m.sessions, 0);
  const y1Rev = monthly.reduce((s, m) => s + m.pnl.revenue, 0);
  const y1Net = monthly.reduce((s, m) => s + m.pnl.net, 0);

  const years = BP_PROFORMA.annualYears.map((y) => ({
    ...y,
    pnl: computeProformaYear(y),
  }));

  const maxAbsNet = Math.max(
    ...monthlyWithCash.map((m) => Math.abs(m.pnl.net)),
    1
  );

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
            href="/business-plan/cost-breakdown"
            className="inline-flex items-center gap-2 text-sm font-semibold text-royal-blue/70 hover:text-royal-blue"
          >
            Capacity P&L
          </Link>
        </div>

        <header className="text-center mb-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-royal-gold/15 ring-1 ring-royal-gold/30 mb-3">
            <ClipboardList className="h-5 w-5 text-royal-gold" />
          </div>
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-2">
            Internal · Pre-Launch Proforma
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-3">
            Know the Numbers Before We Start
          </h1>
          <p className="text-royal-blue/60 text-lg max-w-3xl mx-auto">
            {BP_PROFORMA.purpose}
          </p>
        </header>

        {/* Capital needed */}
        <section className="rounded-2xl border border-royal-gold/30 bg-royal-blue text-royal-cream p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-royal-gold font-semibold mb-1">
                Capital to open
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">
                {money(capitalMid)}
                <span className="text-lg font-semibold text-royal-cream/60 ml-2">
                  mid case
                </span>
              </h2>
              <p className="text-sm text-royal-cream/65 mt-2 max-w-xl">
                Range {money(BP_PROFORMA.capitalRange.low)} –{" "}
                {money(BP_PROFORMA.capitalRange.high)}. {BP_PROFORMA.capitalNote}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-royal-cream/50">
                  Build / launch
                </p>
                <p className="font-mono text-xl font-bold text-royal-gold">
                  {money(startupTotal)}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-royal-cream/50">
                  3-mo cash buffer
                </p>
                <p className="font-mono text-xl font-bold text-royal-gold">
                  {money(BP_PROFORMA.workingCapital.reserve)}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-white/10 text-royal-cream/70 text-xs uppercase tracking-wide">
                  <th className="text-left p-3 font-semibold">Use of funds</th>
                  <th className="text-right p-3 font-semibold">Mid $</th>
                  <th className="text-left p-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {BP_PROFORMA.startupUses.map((row, i) => (
                  <tr
                    key={row.item}
                    className={i % 2 === 0 ? "bg-white/5" : ""}
                  >
                    <td className="p-3">{row.item}</td>
                    <td className="p-3 text-right font-mono text-royal-gold">
                      {money(row.mid)}
                    </td>
                    <td className="p-3 text-royal-cream/55 text-xs">
                      {row.note}
                    </td>
                  </tr>
                ))}
                <tr className="bg-royal-gold/20 font-bold">
                  <td className="p-3">One-time subtotal</td>
                  <td className="p-3 text-right font-mono">{money(startupTotal)}</td>
                  <td className="p-3" />
                </tr>
                <tr className="bg-royal-gold/10">
                  <td className="p-3">
                    Working capital ({BP_PROFORMA.workingCapital.monthsOpExReserve} mo OpEx)
                  </td>
                  <td className="p-3 text-right font-mono">
                    {money(BP_PROFORMA.workingCapital.reserve)}
                  </td>
                  <td className="p-3 text-royal-cream/55 text-xs">
                    {BP_PROFORMA.workingCapital.note}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Snapshot KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl border border-royal-gold/25 bg-white p-4">
            <PiggyBank className="h-4 w-4 text-royal-gold mb-1" />
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Y1 sessions (ramp)
            </p>
            <p className="font-mono text-2xl font-bold text-royal-blue">
              {y1Sessions}
            </p>
          </div>
          <div className="rounded-xl border border-royal-gold/25 bg-white p-4">
            <TrendingUp className="h-4 w-4 text-royal-gold mb-1" />
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Y1 revenue
            </p>
            <p className="font-mono text-2xl font-bold text-royal-blue">
              {money(y1Rev)}
            </p>
          </div>
          <div className="rounded-xl border border-royal-gold/25 bg-white p-4">
            <Wallet className="h-4 w-4 text-royal-gold mb-1" />
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Y1 net (ops)
            </p>
            <p
              className={`font-mono text-2xl font-bold ${
                y1Net >= 0 ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {money(y1Net)}
            </p>
          </div>
          <div className="rounded-xl border border-royal-gold/25 bg-white p-4">
            <Target className="h-4 w-4 text-royal-gold mb-1" />
            <p className="text-[11px] uppercase tracking-wide text-royal-blue/50 font-semibold">
              Break-even pace
            </p>
            <p className="font-mono text-2xl font-bold text-royal-blue">
              ~{BP_PROFORMA.breakEven.sessionsPerMonth}/mo
            </p>
          </div>
        </div>

        {/* Break-even */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-royal-blue mb-2">
            Break-even before we scale
          </h2>
          <p className="text-sm text-royal-blue/70 leading-relaxed mb-4 max-w-3xl">
            {BP_PROFORMA.breakEven.note}
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-white border border-emerald-100 p-3 text-center">
              <p className="text-[11px] uppercase text-royal-blue/50 font-semibold">
                Monthly fixed OpEx
              </p>
              <p className="font-mono text-lg font-bold text-royal-blue">
                {money(BP_PROFORMA.breakEven.monthlyFixedMid)}
              </p>
            </div>
            <div className="rounded-xl bg-white border border-emerald-100 p-3 text-center">
              <p className="text-[11px] uppercase text-royal-blue/50 font-semibold">
                Contribution / session
              </p>
              <p className="font-mono text-lg font-bold text-royal-blue">
                ~{money(BP_PROFORMA.breakEven.contributionPerSession)}
              </p>
            </div>
            <div className="rounded-xl bg-white border border-emerald-100 p-3 text-center">
              <p className="text-[11px] uppercase text-royal-blue/50 font-semibold">
                Sessions to break even
              </p>
              <p className="font-mono text-lg font-bold text-emerald-700">
                ~{BP_PROFORMA.breakEven.sessionsPerMonth} / month
              </p>
            </div>
          </div>
        </section>

        {/* Monthly ramp */}
        <section className="rounded-2xl border border-royal-gold/25 bg-white p-5 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-royal-blue">
                Year 1 monthly ramp (proforma)
              </h2>
              <p className="text-sm text-royal-blue/55 mt-1">
                Fixed OpEx modeled at {money(fixedOpex)}/mo · COGS from capacity
                model (books, AI, fees)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-royal-blue text-royal-cream text-xs uppercase tracking-wide">
                  <th className="text-left p-2.5 font-semibold">Month</th>
                  <th className="text-right p-2.5 font-semibold">Sessions</th>
                  <th className="text-right p-2.5 font-semibold">Parties</th>
                  <th className="text-right p-2.5 font-semibold">Revenue</th>
                  <th className="text-right p-2.5 font-semibold">COGS</th>
                  <th className="text-right p-2.5 font-semibold">Gross</th>
                  <th className="text-right p-2.5 font-semibold">OpEx</th>
                  <th className="text-right p-2.5 font-semibold">Net</th>
                  <th className="text-right p-2.5 font-semibold">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {monthlyWithCash.map((m, i) => (
                  <tr
                    key={m.month}
                    className={i % 2 === 0 ? "bg-white" : "bg-royal-cream/35"}
                  >
                    <td className="p-2.5">
                      <div className="font-semibold text-royal-blue">
                        {m.month}
                      </div>
                      <div className="text-[11px] text-royal-blue/45">
                        {m.note}
                      </div>
                    </td>
                    <td className="p-2.5 text-right font-mono">{m.sessions}</td>
                    <td className="p-2.5 text-right font-mono">
                      {m.birthdayParties}
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      {money(m.pnl.revenue)}
                    </td>
                    <td className="p-2.5 text-right font-mono text-red-600/80">
                      {money(m.pnl.cogsTotal)}
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      {money(m.pnl.gross)}
                    </td>
                    <td className="p-2.5 text-right font-mono text-royal-blue/60">
                      {money(m.pnl.fixedOpex)}
                    </td>
                    <td
                      className={`p-2.5 text-right font-mono font-bold ${
                        m.pnl.net >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {money(m.pnl.net)}
                    </td>
                    <td
                      className={`p-2.5 text-right font-mono text-xs ${
                        m.cumulative >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {money(m.cumulative)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-royal-blue/5 font-bold border-t border-royal-gold/30">
                  <td className="p-2.5">Year 1 total</td>
                  <td className="p-2.5 text-right font-mono">{y1Sessions}</td>
                  <td className="p-2.5 text-right font-mono">
                    {monthly.reduce((s, m) => s + m.birthdayParties, 0)}
                  </td>
                  <td className="p-2.5 text-right font-mono">{money(y1Rev)}</td>
                  <td className="p-2.5 text-right font-mono">
                    {money(monthly.reduce((s, m) => s + m.pnl.cogsTotal, 0))}
                  </td>
                  <td className="p-2.5 text-right font-mono">
                    {money(monthly.reduce((s, m) => s + m.pnl.gross, 0))}
                  </td>
                  <td className="p-2.5 text-right font-mono">
                    {money(fixedOpex * 12)}
                  </td>
                  <td
                    className={`p-2.5 text-right font-mono ${
                      y1Net >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {money(y1Net)}
                  </td>
                  <td className="p-2.5" />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Simple net bars */}
          <div className="mt-5 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-royal-blue/50 mb-2">
              Monthly net (visual)
            </p>
            {monthlyWithCash.map((m) => {
              const width = Math.max(
                4,
                (Math.abs(m.pnl.net) / maxAbsNet) * 100
              );
              const positive = m.pnl.net >= 0;
              return (
                <div key={m.month} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-mono text-royal-blue/60">
                    {m.month}
                  </span>
                  <div className="flex-1 h-3 rounded bg-royal-blue/5 overflow-hidden">
                    <div
                      className={`h-full rounded ${
                        positive ? "bg-emerald-500" : "bg-red-400"
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span
                    className={`w-20 text-right font-mono ${
                      positive ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {money(m.pnl.net)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3-year annual */}
        <section className="rounded-2xl border border-royal-gold/25 bg-white p-5 sm:p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-royal-blue mb-1">
            Annual proforma — Years 1–3
          </h2>
          <p className="text-sm text-royal-blue/55 mb-4">
            Conservative single-lane path (not the 4-set max). Birthday revenue
            included.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-royal-blue text-royal-cream">
                  <th className="text-left p-3 font-semibold">Year</th>
                  <th className="text-right p-3 font-semibold">Sessions</th>
                  <th className="text-right p-3 font-semibold">Revenue</th>
                  <th className="text-right p-3 font-semibold">COGS</th>
                  <th className="text-right p-3 font-semibold">Gross</th>
                  <th className="text-right p-3 font-semibold">OpEx</th>
                  <th className="text-right p-3 font-semibold">Net</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y, i) => (
                  <tr
                    key={y.year}
                    className={i % 2 === 0 ? "bg-white" : "bg-royal-cream/35"}
                  >
                    <td className="p-3">
                      <div className="font-semibold text-royal-blue">
                        {y.year}
                      </div>
                      <div className="text-[11px] text-royal-blue/45 max-w-[200px]">
                        {y.note}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      {y.sessions.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {money(y.pnl.revenue)}
                    </td>
                    <td className="p-3 text-right font-mono text-red-600/80">
                      {money(y.pnl.cogsTotal)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {money(y.pnl.gross)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {money(y.pnl.fixedOpex)}
                    </td>
                    <td
                      className={`p-3 text-right font-mono font-bold ${
                        y.pnl.net >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {money(y.pnl.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fixed opex + go/no-go */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <section className="rounded-2xl border border-royal-gold/25 bg-white p-5">
            <h3 className="font-serif text-lg font-bold text-royal-blue mb-3">
              Monthly fixed OpEx (Y1 mid)
            </h3>
            <ul className="space-y-2 text-sm">
              {BP_PROFORMA.monthlyFixedOpEx.map((row) => (
                <li
                  key={row.label}
                  className="flex justify-between gap-3 text-royal-blue/75"
                >
                  <span>{row.label}</span>
                  <span className="font-mono font-semibold">
                    {money(row.amount)}
                  </span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-royal-gold/20 pt-2 font-bold text-royal-blue">
                <span>Total / month</span>
                <span className="font-mono">{money(fixedOpex)}</span>
              </li>
            </ul>
            <p className="text-xs text-royal-blue/45 mt-3">
              COGS unit build: book ${BP_PNL_SCENARIOS.cogsPerSession.bookPrintBlended}{" "}
              + AI ${BP_PNL_SCENARIOS.cogsPerSession.ai} + consumables $
              {BP_PNL_SCENARIOS.cogsPerSession.consumables} +{" "}
              {(BP_PNL_SCENARIOS.cogsPerSession.paymentFeeRate * 100).toFixed(0)}
              % processing.
            </p>
          </section>

          <section className="rounded-2xl border border-royal-gold/30 bg-gradient-to-br from-white to-royal-gold/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-royal-gold" />
              <h3 className="font-serif text-lg font-bold text-royal-blue">
                Go / no-go checklist
              </h3>
            </div>
            <ul className="space-y-2.5">
              {BP_PROFORMA.goNoGo.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-sm text-royal-blue/80 leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="text-center text-xs text-royal-blue/40">
          Internal planning proforma only · not a guarantee of results ·{" "}
          {new Date().getFullYear()} Storybook Photos
        </p>
      </div>
    </article>
  );
}
