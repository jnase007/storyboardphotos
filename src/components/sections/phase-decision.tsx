"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  Home,
  Rocket,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  BP_PHASE_ROADMAP,
  BP_PHASE_ECONOMICS,
  BP_SET_CAPACITY_NOTE,
  BP_ONE_STORE_300K,
  computeBpPnl,
} from "@/lib/business-plan-content";

function money(n: number): string {
  const r = Math.round(n);
  const a = Math.abs(r).toLocaleString("en-US");
  return r < 0 ? `-$${a}` : `$${a}`;
}

export function PhaseDecisionSection() {
  const beta = computeBpPnl(BP_PHASE_ECONOMICS.beta);
  const retail = computeBpPnl(BP_PHASE_ECONOMICS.retail);
  const scale = computeBpPnl(BP_PHASE_ECONOMICS.scale);

  const cards = [
    {
      phase: BP_PHASE_ROADMAP.phases[0],
      pnl: beta,
      capital: BP_PHASE_ECONOMICS.beta.capitalMid,
      icon: Home,
      tone: "border-royal-gold/30",
      head: "bg-royal-blue",
    },
    {
      phase: BP_PHASE_ROADMAP.phases[1],
      pnl: retail,
      capital: BP_PHASE_ECONOMICS.retail.capitalMid,
      icon: Building2,
      tone: "border-emerald-300",
      head: "bg-emerald-800",
    },
    {
      phase: BP_PHASE_ROADMAP.phases[2],
      pnl: scale,
      capital: BP_PHASE_ECONOMICS.scale.capitalMid,
      icon: Rocket,
      tone: "border-royal-gold/40",
      head: "bg-[#1a2744]",
    },
  ] as const;

  const retailPhase = BP_PHASE_ROADMAP.phases[1];

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
            Proforma
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
            <Target className="h-5 w-5 text-royal-gold" />
          </div>
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-2">
            Internal · Phase Decision
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-3">
            Office Beta → Retail + Kitchen → Scale
          </h1>
          <p className="text-royal-blue/60 text-lg max-w-3xl mx-auto">
            {BP_PHASE_ROADMAP.summary}
          </p>
        </header>

        {/* Set capacity reality */}
        <section className="rounded-2xl border border-royal-gold/30 bg-white p-5 sm:p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-royal-blue mb-3">
            The real capacity difference
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-3">
            <div className="rounded-xl border border-royal-gold/20 bg-royal-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-royal-gold mb-1">
                Office beta
              </p>
              <p className="text-sm text-royal-blue/75 leading-relaxed">
                {BP_SET_CAPACITY_NOTE.beta}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                Retail location
              </p>
              <p className="text-sm text-royal-blue/75 leading-relaxed">
                {BP_SET_CAPACITY_NOTE.retail}
              </p>
            </div>
          </div>
          <p className="text-sm text-royal-blue/65 leading-relaxed">
            <strong className="text-royal-blue">Implication:</strong>{" "}
            {BP_SET_CAPACITY_NOTE.implication}
          </p>
        </section>

        {/* Path strip */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-10">
          {["1. Office beta", "2. Retail + kitchen", "3. Multi-set scale"].map(
            (label, i) => (
              <div key={label} className="flex-1 flex items-center gap-2">
                <div
                  className={`flex-1 rounded-xl border px-4 py-3 text-center text-sm font-semibold ${
                    i === 1
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-white border-royal-gold/25 text-royal-blue"
                  }`}
                >
                  {label}
                  {i === 1 && (
                    <div className="text-[10px] uppercase tracking-wide text-emerald-700 mt-0.5">
                      Most likely next trigger
                    </div>
                  )}
                </div>
                {i < 2 && (
                  <ArrowRight className="hidden sm:block h-4 w-4 text-royal-gold shrink-0" />
                )}
              </div>
            )
          )}
        </div>

        {/* Three phase cards with economics */}
        <div className="grid lg:grid-cols-3 gap-5 mb-10">
          {cards.map(({ phase, pnl, capital, icon: Icon, tone, head }) => (
            <div
              key={phase.id}
              className={`rounded-2xl border ${tone} bg-white overflow-hidden shadow-sm`}
            >
              <div className={`${head} text-royal-cream px-4 py-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-royal-gold" />
                  <span className="text-[10px] uppercase tracking-[0.16em] text-royal-gold font-semibold">
                    {phase.likelihood}
                  </span>
                </div>
                <h2 className="font-serif text-lg font-bold leading-snug">
                  {phase.name}
                </h2>
                <p className="text-xs text-royal-cream/65 mt-1">{phase.location}</p>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-royal-blue/70 leading-relaxed">
                  {phase.goal}
                </p>
                {"opsModel" in phase && phase.opsModel && (
                  <p className="text-xs text-royal-blue/55 leading-relaxed rounded-lg bg-royal-blue/[0.03] border border-royal-gold/15 p-2.5">
                    <span className="font-semibold text-royal-blue/70">
                      Ops:{" "}
                    </span>
                    {phase.opsModel}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-royal-cream/50 p-2.5">
                    <p className="text-[10px] uppercase text-royal-blue/45 font-semibold">
                      Capital mid
                    </p>
                    <p className="font-mono font-bold text-royal-blue">
                      {money(capital)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-royal-cream/50 p-2.5">
                    <p className="text-[10px] uppercase text-royal-blue/45 font-semibold">
                      Annual rev*
                    </p>
                    <p className="font-mono font-bold text-royal-blue">
                      {money(pnl.revenue)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-royal-cream/50 p-2.5">
                    <p className="text-[10px] uppercase text-royal-blue/45 font-semibold">
                      Annual net*
                    </p>
                    <p
                      className={`font-mono font-bold ${
                        pnl.net >= 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {money(pnl.net)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-royal-cream/50 p-2.5">
                    <p className="text-[10px] uppercase text-royal-blue/45 font-semibold">
                      Net margin
                    </p>
                    <p className="font-mono font-bold text-royal-blue">
                      {pnl.netMarginPct.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-royal-blue/45 leading-relaxed">
                  *Steady-state annualized model (not Year-1 ramp). Sessions{" "}
                  {phase.sessionsPerMonthTarget}/mo · ticket ${phase.avgTicket} ·
                  parties {phase.birthdayPartiesPerMonth}/mo.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <section className="rounded-2xl border border-royal-gold/25 bg-white p-5 sm:p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-royal-blue mb-4">
            Side-by-side economics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-royal-blue text-royal-cream">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-right p-3 font-semibold">Office beta</th>
                  <th className="text-right p-3 font-semibold">Retail + kitchen</th>
                  <th className="text-right p-3 font-semibold">Scale</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Capital (mid)",
                    a: BP_PHASE_ECONOMICS.beta.capitalMid,
                    b: BP_PHASE_ECONOMICS.retail.capitalMid,
                    c: BP_PHASE_ECONOMICS.scale.capitalMid,
                  },
                  {
                    label: "Sessions / year",
                    a: BP_PHASE_ECONOMICS.beta.sessionsPerYear,
                    b: BP_PHASE_ECONOMICS.retail.sessionsPerYear,
                    c: BP_PHASE_ECONOMICS.scale.sessionsPerYear,
                    raw: true,
                  },
                  {
                    label: "Birthday parties / year",
                    a: BP_PHASE_ECONOMICS.beta.birthdayPartiesPerYear,
                    b: BP_PHASE_ECONOMICS.retail.birthdayPartiesPerYear,
                    c: BP_PHASE_ECONOMICS.scale.birthdayPartiesPerYear,
                    raw: true,
                  },
                  {
                    label: "Revenue",
                    a: beta.revenue,
                    b: retail.revenue,
                    c: scale.revenue,
                  },
                  {
                    label: "COGS",
                    a: beta.cogsTotal,
                    b: retail.cogsTotal,
                    c: scale.cogsTotal,
                  },
                  {
                    label: "Gross profit",
                    a: beta.grossProfit,
                    b: retail.grossProfit,
                    c: scale.grossProfit,
                  },
                  {
                    label: "OpEx",
                    a: beta.opex,
                    b: retail.opex,
                    c: scale.opex,
                  },
                  {
                    label: "Net operating profit",
                    a: beta.net,
                    b: retail.net,
                    c: scale.net,
                    emphasize: true,
                  },
                ].map((row, i) => (
                  <tr
                    key={row.label}
                    className={
                      row.emphasize
                        ? "bg-emerald-50 font-bold"
                        : i % 2 === 0
                          ? "bg-white"
                          : "bg-royal-cream/30"
                    }
                  >
                    <td className="p-3 text-royal-blue">{row.label}</td>
                    {[row.a, row.b, row.c].map((v, idx) => (
                      <td
                        key={idx}
                        className="p-3 text-right font-mono text-royal-blue"
                      >
                        {row.raw ? Number(v).toLocaleString() : money(Number(v))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-royal-blue/45 mt-3">
            Retail+kitchen is the decision that multiplies birthday revenue and
            brand presence. Scale is only after retail demand overflows.
          </p>
        </section>

        {/* $300K net one-store target */}
        <section className="rounded-2xl border border-royal-gold/40 bg-royal-blue text-royal-cream p-5 sm:p-6 mb-8">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-royal-gold mb-2">
            Your bar · one store
          </p>
          <h2 className="font-serif text-2xl font-bold mb-2">
            {BP_ONE_STORE_300K.question}
          </h2>
          <p className="text-royal-cream/80 leading-relaxed mb-5 max-w-3xl">
            {BP_ONE_STORE_300K.answer}
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <p className="text-[11px] uppercase tracking-wide text-royal-cream/50 font-semibold">
                Soft retail (not enough)
              </p>
              <p className="font-mono text-2xl font-bold text-red-300 mt-1">
                ~{money(BP_ONE_STORE_300K.notEnough.approxNet)} net
              </p>
              <p className="text-xs text-royal-cream/60 mt-2 leading-relaxed">
                {BP_ONE_STORE_300K.notEnough.sessionsPerMonth} sessions/mo · $
                {BP_ONE_STORE_300K.notEnough.avgTicket} ticket ·{" "}
                {BP_ONE_STORE_300K.notEnough.note}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-300/30 p-4">
              <p className="text-[11px] uppercase tracking-wide text-emerald-200/80 font-semibold">
                $300K net path
              </p>
              <p className="font-mono text-2xl font-bold text-emerald-300 mt-1">
                ~{money(BP_ONE_STORE_300K.target.approxNet)} net
              </p>
              <p className="text-xs text-royal-cream/70 mt-2 leading-relaxed">
                ~{BP_ONE_STORE_300K.target.sessionsPerMonth} sessions/mo · $
                {BP_ONE_STORE_300K.target.avgTicket} ticket · ~{" "}
                {money(BP_ONE_STORE_300K.target.approxRevenue)} rev ·{" "}
                {BP_ONE_STORE_300K.target.note}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            {BP_ONE_STORE_300K.paths.map((p) => (
              <div
                key={p.name}
                className="rounded-xl bg-white/10 border border-white/10 p-3"
              >
                <p className="font-semibold text-royal-gold text-sm">{p.name}</p>
                <p className="font-mono text-xs text-royal-cream/80 mt-1">
                  {p.sessionsPerMonth}/mo @ ${p.ticket} · {p.partiesPerMonth}{" "}
                  parties/mo
                </p>
                <p className="text-[11px] text-royal-cream/55 mt-2 leading-relaxed">
                  {p.requires}
                </p>
              </div>
            ))}
          </div>

          <ul className="space-y-1.5 mb-4">
            {BP_ONE_STORE_300K.levers.map((l) => (
              <li
                key={l.lever}
                className="text-sm text-royal-cream/75 flex gap-2 leading-relaxed"
              >
                <span className="text-royal-gold font-semibold shrink-0">
                  {l.lever}:
                </span>
                {l.detail}
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium text-royal-gold border-t border-white/10 pt-3 leading-relaxed">
            {BP_ONE_STORE_300K.verdict}
          </p>
        </section>

        {/* Gate metrics for Phase 2 */}
        <section className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-white to-emerald-50/80 p-5 sm:p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-royal-gold" />
            <h2 className="font-serif text-xl font-bold text-royal-blue">
              Gate before pulling the retail trigger
            </h2>
          </div>
          <p className="text-sm text-royal-blue/70 mb-4 max-w-3xl leading-relaxed">
            {retailPhase.triggerToPull} You said retail + kitchen is more likely
            — great. These metrics make sure the numbers work first.
          </p>
          <ul className="space-y-2.5 mb-4">
            {"gateMetrics" in retailPhase &&
              retailPhase.gateMetrics?.map((g) => (
                <li
                  key={g.metric}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-xl border border-emerald-200 bg-white px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-royal-blue">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    {g.metric}
                  </span>
                  <span className="text-sm font-mono text-emerald-800 sm:text-right">
                    {g.target}
                  </span>
                </li>
              ))}
          </ul>
          <p className="text-sm text-royal-blue/65 leading-relaxed border-t border-emerald-200 pt-3">
            <strong className="text-royal-blue">Rent caution:</strong>{" "}
            {retailPhase.rentCaution}
          </p>
        </section>

        {/* Decision narrative */}
        <section className="rounded-2xl border border-royal-gold/25 bg-white p-5 sm:p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-royal-blue mb-3">
            How to think about the three phases
          </h2>
          <div className="space-y-4 text-sm text-royal-blue/75 leading-relaxed">
            <p>
              <strong className="text-royal-blue">Phase 1 — Office beta:</strong>{" "}
              Put time in before big money. Prove the hour, the book, the ticket,
              and that families will book without a fancy storefront. Capital
              stays light (~{money(BP_PHASE_ECONOMICS.beta.capitalMid)} mid).
            </p>
            <p>
              <strong className="text-royal-blue">
                Phase 2 — Retail + kitchen (most likely):
              </strong>{" "}
              This is the real scale decision. You're buying presence,
              capacity, and birthday economics. Steady-state model ~{" "}
              {money(retail.revenue)} revenue / {money(retail.net)} net — but only
              if beta gates clear and the actual lease still breaks even.
            </p>
            <p>
              <strong className="text-royal-blue">Phase 3 — Scale:</strong>{" "}
              Multi-set / multi-photographer after retail is full. Don't
              staff for Phase 3 during Phase 1.
            </p>
          </div>
        </section>

        <div className="rounded-xl border border-royal-gold/30 bg-royal-blue text-royal-cream p-5 text-center">
          <TrendingUp className="h-5 w-5 text-royal-gold mx-auto mb-2" />
          <p className="font-serif text-lg font-bold mb-1">
            Decision rule
          </p>
          <p className="text-sm text-royal-cream/75 max-w-2xl mx-auto leading-relaxed">
            Stay in the office until beta metrics clear. Pull the retail + kitchen
            trigger only when volume, ticket, quality, and waitlist say the lease
            is earned — not hoped for.
          </p>
        </div>

        <p className="text-center text-xs text-royal-blue/40 mt-8">
          Internal planning model · steady-state estimates ·{" "}
          {new Date().getFullYear()} Storybook Photos
        </p>
      </div>
    </article>
  );
}
