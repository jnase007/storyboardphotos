"use client";

import { BP_REVENUE_GROWTH } from "@/lib/business-plan-content";

function formatMoney(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2)}M`;
  }
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

/**
 * Pure SVG revenue growth chart — no chart library dependency.
 * Compares baseline (single lane) vs scaled (4 sets / multi-photographer).
 */
export function RevenueGrowthChart() {
  const { baseline, scaled, capacityCeiling, assumptions } = BP_REVENUE_GROWTH;
  const maxRev = Math.max(
    ...baseline.map((b) => b.revenue),
    ...scaled.map((s) => s.revenue),
    capacityCeiling.atTicket800
  );

  // Chart geometry
  const W = 640;
  const H = 320;
  const padL = 56;
  const padR = 20;
  const padT = 28;
  const padB = 44;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xAt = (i: number) => padL + (plotW * (i + 0.5)) / baseline.length;
  const yAt = (rev: number) => padT + plotH * (1 - rev / maxRev);

  const baselinePoints = baseline
    .map((b, i) => `${xAt(i)},${yAt(b.revenue)}`)
    .join(" ");
  const scaledPoints = scaled
    .map((s, i) => `${xAt(i)},${yAt(s.revenue)}`)
    .join(" ");

  const gridTicks = 4;
  const grid = Array.from({ length: gridTicks + 1 }, (_, i) => {
    const v = (maxRev * i) / gridTicks;
    return { v, y: yAt(v) };
  });

  return (
    <div className="rounded-2xl border border-royal-gold/25 bg-white/90 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-royal-blue">
            Revenue Growth — Years 1–3
          </h3>
          <p className="text-sm text-royal-blue/60 mt-1">
            Baseline studio vs multi-set / multi-photographer scale-up
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 text-royal-blue/80">
            <span className="h-2.5 w-2.5 rounded-full bg-royal-blue" />
            Baseline (1 lane)
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Scaled (up to 4 sets)
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[320px] h-auto"
          role="img"
          aria-label="Revenue growth chart comparing baseline and scaled multi-set studio"
        >
          {/* Grid */}
          {grid.map((g) => (
            <g key={g.v}>
              <line
                x1={padL}
                x2={W - padR}
                y1={g.y}
                y2={g.y}
                stroke="rgba(10,22,40,0.08)"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={g.y + 4}
                textAnchor="end"
                fill="#0A1628"
                opacity="0.45"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
              >
                {formatMoney(g.v)}
              </text>
            </g>
          ))}

          {/* Baseline area + line */}
          <polyline
            points={`${xAt(0)},${padT + plotH} ${baselinePoints} ${xAt(baseline.length - 1)},${padT + plotH}`}
            fill="rgba(30,51,82,0.08)"
            stroke="none"
          />
          <polyline
            points={baselinePoints}
            fill="none"
            stroke="#1E3352"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Scaled area + line */}
          <polyline
            points={`${xAt(0)},${padT + plotH} ${scaledPoints} ${xAt(scaled.length - 1)},${padT + plotH}`}
            fill="rgba(16,185,129,0.10)"
            stroke="none"
          />
          <polyline
            points={scaledPoints}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Points + labels */}
          {baseline.map((b, i) => (
            <g key={`b-${b.year}`}>
              <circle cx={xAt(i)} cy={yAt(b.revenue)} r="5" fill="#1E3352" />
              <text
                x={xAt(i)}
                y={yAt(b.revenue) - 12}
                textAnchor="middle"
                fill="#1E3352"
                fontSize="11"
                fontWeight="700"
                fontFamily="ui-monospace, monospace"
              >
                {formatMoney(b.revenue)}
              </text>
              <text
                x={xAt(i)}
                y={H - 16}
                textAnchor="middle"
                fill="#0A1628"
                opacity="0.65"
                fontSize="12"
                fontWeight="600"
              >
                {b.year}
              </text>
            </g>
          ))}
          {scaled.map((s, i) => (
            <g key={`s-${s.year}`}>
              <circle cx={xAt(i)} cy={yAt(s.revenue)} r="5" fill="#059669" />
              <text
                x={xAt(i)}
                y={yAt(s.revenue) - 12}
                textAnchor="middle"
                fill="#047857"
                fontSize="11"
                fontWeight="700"
                fontFamily="ui-monospace, monospace"
              >
                {formatMoney(s.revenue)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Scenario cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <div className="rounded-xl border border-royal-blue/15 bg-royal-blue/[0.03] p-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-royal-blue/50 mb-2">
            Baseline path
          </p>
          <div className="space-y-2">
            {baseline.map((b) => (
              <div
                key={b.year}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div>
                  <span className="font-semibold text-royal-blue">{b.year}</span>
                  <span className="text-royal-blue/50">
                    {" "}
                    · {b.sessions.toLocaleString()} sessions · $
                    {b.avgTicket} avg
                  </span>
                  <p className="text-xs text-royal-blue/50 mt-0.5">{b.note}</p>
                </div>
                <span className="font-mono text-xs font-bold text-royal-blue shrink-0">
                  {formatMoney(b.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-emerald-700/70 mb-2">
            Scaled path · 4 sets + multi-photographer
          </p>
          <div className="space-y-2">
            {scaled.map((s) => (
              <div
                key={s.year}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div>
                  <span className="font-semibold text-emerald-900">{s.year}</span>
                  <span className="text-emerald-800/60">
                    {" "}
                    · {s.sessions.toLocaleString()} sessions · $
                    {s.avgTicket} avg · {s.photographers} photog
                    {s.photographers > 1 ? "s" : ""} · {s.parallelSets} lane
                    {s.parallelSets > 1 ? "s" : ""}
                  </span>
                  <p className="text-xs text-emerald-800/55 mt-0.5">{s.note}</p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700 shrink-0">
                  {formatMoney(s.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capacity ceiling */}
      <div className="mt-4 rounded-xl border border-royal-gold/30 bg-royal-gold/10 p-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-royal-gold mb-1">
          {capacityCeiling.title}
        </p>
        <p className="text-sm text-royal-blue/75 leading-relaxed mb-3">
          {capacityCeiling.formula}
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/80 border border-royal-gold/20 p-2.5">
            <div className="font-mono text-sm font-bold text-royal-blue">
              {formatMoney(capacityCeiling.atTicket550)}
            </div>
            <div className="text-[10px] text-royal-blue/50 mt-0.5">
              @ $550 avg
            </div>
          </div>
          <div className="rounded-lg bg-white/80 border border-royal-gold/20 p-2.5">
            <div className="font-mono text-sm font-bold text-royal-blue">
              {formatMoney(capacityCeiling.atTicket650)}
            </div>
            <div className="text-[10px] text-royal-blue/50 mt-0.5">
              @ $650 avg
            </div>
          </div>
          <div className="rounded-lg bg-white/80 border border-royal-gold/20 p-2.5">
            <div className="font-mono text-sm font-bold text-emerald-700">
              {formatMoney(capacityCeiling.atTicket800)}
            </div>
            <div className="text-[10px] text-royal-blue/50 mt-0.5">
              @ $800 avg
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-4 grid sm:grid-cols-2 gap-1.5">
        {assumptions.map((a) => (
          <li
            key={a}
            className="text-xs text-royal-blue/55 flex gap-1.5 leading-relaxed"
          >
            <span className="text-royal-gold shrink-0">•</span>
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
