/**
 * Print-friendly business plan document — no Framer Motion.
 * Used by /business-plan/print so Save as PDF captures every page.
 */
import {
  BP_ADVANTAGES,
  BP_EXECUTIVE_SUMMARY,
  BP_FULFILLMENT_PROCESS,
  BP_GROWTH,
  BP_NEXT_STEPS,
  BP_PHASE_TWO,
  BP_PRINT_PARTNERS,
  BP_PROJECTIONS,
  BP_REVENUE_POINTS,
  BP_RISKS,
  BP_STORYBOOK_APIS,
  BP_STORYBOOK_AI_COST_TOTAL,
} from "@/lib/business-plan-content";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-xl font-bold text-royal-blue mt-8 mb-3 pb-1 border-b border-royal-gold/30 break-after-avoid">
      {children}
    </h2>
  );
}

export function BusinessPlanDocument() {
  return (
    <div className="bp-document mx-auto max-w-3xl px-6 py-8 text-royal-blue bg-white">
      <header className="text-center mb-8 border-b-2 border-royal-gold/40 pb-6">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-royal-gold mb-2">
          Internal Document — Confidential
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-blue mb-2">
          Business Plan
        </h1>
        <p className="text-royal-blue/70">
          Storybook Photos | Kingdom Quests — Costa Mesa, CA
        </p>
      </header>

      <section className="break-inside-avoid">
        <H2>Executive Summary</H2>
        <p className="leading-relaxed text-royal-blue/80">{BP_EXECUTIVE_SUMMARY}</p>
      </section>

      <section className="break-inside-avoid">
        <H2>Key Advantages</H2>
        <ul className="list-disc pl-5 space-y-1.5 text-royal-blue/80">
          {BP_ADVANTAGES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="break-inside-avoid">
        <H2>Operations</H2>
        <p className="leading-relaxed text-royal-blue/80">
          Studio available Wednesday–Saturday. Year 1 target is modest —{" "}
          <strong>3–5 sessions per week</strong> while we build awareness —
          with room to grow toward 10–12/week as demand and staffing allow.
        </p>
        <p className="leading-relaxed text-royal-blue/80 mt-3">
          <strong>Session standard: 1 hour max per shoot — including siblings.</strong>{" "}
          Many families bring siblings. Design every shoot as one family session
          inside a single 60-minute window (plus ~15 min reset), not stacked solos.
        </p>
      </section>

      <section className="break-inside-avoid">
        <H2>Session Timing — 1 Hour Max</H2>
        <p className="leading-relaxed text-royal-blue/80 mb-3">
          Kids and parents usually peak in the first 45–60 minutes. Keep Solo,
          Sibling, and Family packages inside the same hour to protect capacity
          (~4 sessions/day).
        </p>
        <p className="text-sm font-semibold text-royal-blue mb-2">
          Sample 60-minute flow
        </p>
        <ul className="list-none space-y-1.5 text-royal-blue/80 text-sm mb-4">
          <li>
            <strong>0–10:</strong> Arrive, costumes, crowns, warm-up
          </li>
          <li>
            <strong>10–30:</strong> Kid 1 hero shots (2 sets max)
          </li>
          <li>
            <strong>30–45:</strong> Kid 2 hero shots (same 2 sets)
          </li>
          <li>
            <strong>45–55:</strong> Sibling together shots
          </li>
          <li>
            <strong>55–60:</strong> Quick wrap / optional parent shot
          </li>
        </ul>
        <p className="text-sm font-semibold text-royal-blue mb-2">
          Rules that protect the hour
        </p>
        <ul className="list-disc pl-5 space-y-1 text-royal-blue/80 text-sm">
          <li>Max 2–3 sets per session (even if marketing shows 4)</li>
          <li>Pre-select outfits before arrival</li>
          <li>One assistant for costume changes while photographer shoots</li>
          <li>Sibling package = same hour, not +30 minutes free</li>
          <li>Family of 3+ keeps the same 60-minute window with a tighter shot list</li>
        </ul>
        <p className="mt-3 text-sm text-royal-blue/80">
          <strong>Packaging:</strong> Solo / Sibling / Family — 60-minute kingdom
          session. Additional children included in the same session window.
        </p>
      </section>

      <section className="break-inside-avoid">
        <H2>Revenue Model</H2>
        <ul className="list-disc pl-5 space-y-1.5 text-royal-blue/80">
          {BP_REVENUE_POINTS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="break-inside-avoid">
        <H2>Average Customer Spend</H2>
        <p className="leading-relaxed text-royal-blue/80 mb-3">
          <strong>Competitor average: ~$1,300 / shoot</strong> (typical range
          $1,000–$3,000+ after high-pressure ordering; storybook often $3,000+
          extra).
        </p>
        <p className="leading-relaxed text-royal-blue/80 mb-3">
          <strong>Storybook Photos target: ~$650 average</strong> (
          $450–$900 typical; path to $1,000+ with prints). Transparent packages
          + sibling scale + optional add-ons — not a surprise bill.
        </p>
        <p className="text-sm font-semibold text-royal-blue mb-2">
          Expected mix (siblings common)
        </p>
        <ul className="list-disc pl-5 space-y-1 text-royal-blue/80 text-sm mb-3">
          <li>Solo / single book ≈40% → $299–$349</li>
          <li>Both books / stronger package ≈20% → ≈$499</li>
          <li>Sibling (2 kids) ≈30% → ≈$549</li>
          <li>Family (3 kids) ≈10% → ≈$849</li>
        </ul>
        <p className="text-sm font-semibold text-royal-blue mb-2">
          How the average builds
        </p>
        <ul className="list-disc pl-5 space-y-1 text-royal-blue/80 text-sm mb-3">
          <li>Core package average (siblings common): $450–$650</li>
          <li>With digital + light print upsells: $700–$1,000</li>
          <li>Competitor-style pressure average: ~$1,300</li>
        </ul>
        <p className="text-sm text-royal-blue/80">
          Strategy: do not copy their $1,300 via surprise sales. Raise average
          naturally with sibling/family packages, both-books collection, 1–2
          high-margin prints, and digital download — families happily pay
          $500–$900+ without feeling tricked.
        </p>
      </section>

      <section>
        <H2>3-Year Financial Projections (Conservative)</H2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="bg-royal-blue text-royal-cream">
                <th className="text-left p-2.5 font-semibold">Year</th>
                <th className="text-left p-2.5 font-semibold">Volume</th>
                <th className="text-left p-2.5 font-semibold">Avg / session</th>
                <th className="text-left p-2.5 font-semibold">Revenue</th>
                <th className="text-left p-2.5 font-semibold">Est. Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {BP_PROJECTIONS.map((year, i) => (
                <tr
                  key={year.year}
                  className={i % 2 === 0 ? "bg-royal-cream/60" : "bg-white"}
                >
                  <td className="p-2.5 font-semibold border-b border-royal-gold/15">
                    {year.year}
                    {year.margin ? (
                      <span className="block text-xs font-normal text-royal-blue/55 mt-0.5">
                        {year.margin}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-2.5 border-b border-royal-gold/15 text-royal-blue/80">
                    {year.sessions}
                  </td>
                  <td className="p-2.5 border-b border-royal-gold/15 text-royal-blue/80">
                    {year.avg}
                  </td>
                  <td className="p-2.5 border-b border-royal-gold/15 font-semibold">
                    {year.revenue}
                  </td>
                  <td className="p-2.5 border-b border-royal-gold/15 font-semibold text-royal-blue">
                    {year.profit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="break-inside-avoid">
        <H2>Growth Strategy</H2>
        <ul className="list-disc pl-5 space-y-1.5 text-royal-blue/80">
          {BP_GROWTH.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="break-inside-avoid">
        <H2>Phase Two — Our Own Home</H2>
        <p className="leading-relaxed text-royal-blue/80 mb-3">
          After we prove the business works, we use the money to rent or buy a
          place that is truly ours — with an enchanted tea house connected to
          the studio. That gives us a kitchen and a second revenue stream for
          birthdays and celebrations on weekends, while families stay inside the
          same magical world.
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-royal-blue/80">
          {BP_PHASE_TWO.map((item) => (
            <li key={item.title}>
              <strong>{item.title}.</strong> {item.detail}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <H2>Production & Fulfillment Strategy</H2>
        <p className="leading-relaxed text-royal-blue/80 mb-3">
          We leverage AI for rapid story creation and illustration generation,
          then partner with premium printers for final production.
        </p>

        <h3 className="font-serif font-bold text-royal-blue mt-4 mb-2">
          Where We Print
        </h3>
        <ul className="list-disc pl-5 space-y-1.5 text-royal-blue/80 mb-4">
          {BP_PRINT_PARTNERS.map((p) => (
            <li key={p.name}>
              <strong>{p.name}</strong>
              {p.name === "Mpix" ? " (Primary)" : ""} — {p.role}
              {p.url ? (
                <>
                  {" "}
                  ·{" "}
                  <a href={p.url} className="text-royal-gold underline">
                    {p.url}
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ul>

        <h3 className="font-serif font-bold text-royal-blue mt-4 mb-2">
          APIs We Need (and Cost to Create a Storybook)
        </h3>
        <p className="text-sm text-royal-blue/65 mb-2">
          Estimated cost for a 12–20 page personalized book before printing.
        </p>
        <table className="w-full text-sm text-left border border-royal-gold/30 mb-2">
          <thead>
            <tr className="bg-royal-cream/80">
              <th className="border border-royal-gold/20 px-2 py-1.5">API</th>
              <th className="border border-royal-gold/20 px-2 py-1.5">
                Purpose
              </th>
              <th className="border border-royal-gold/20 px-2 py-1.5">
                Provider
              </th>
              <th className="border border-royal-gold/20 px-2 py-1.5">
                Cost / book
              </th>
            </tr>
          </thead>
          <tbody>
            {BP_STORYBOOK_APIS.map((row) => (
              <tr key={row.api}>
                <td className="border border-royal-gold/20 px-2 py-1.5 font-semibold">
                  {row.api}
                </td>
                <td className="border border-royal-gold/20 px-2 py-1.5">
                  {row.purpose}
                </td>
                <td className="border border-royal-gold/20 px-2 py-1.5">
                  {row.provider}
                </td>
                <td className="border border-royal-gold/20 px-2 py-1.5">
                  {row.cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="font-semibold text-royal-blue mb-4">
          {BP_STORYBOOK_AI_COST_TOTAL}
        </p>

        <h3 className="font-serif font-bold text-royal-blue mt-4 mb-2">
          Process
        </h3>
        <ol className="list-decimal pl-5 space-y-1.5 text-royal-blue/80 mb-4">
          {BP_FULFILLMENT_PROCESS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <h3 className="font-serif font-bold text-royal-blue mt-4 mb-2">
          Margins
        </h3>
        <ul className="list-disc pl-5 space-y-1.5 text-royal-blue/80 mb-3">
          <li>
            <strong>Digital storybooks:</strong> 85–95% gross margin
          </li>
          <li>
            <strong>Premium printed storybooks:</strong> 75–90% gross margin
            after printing costs
          </li>
        </ul>
        <p className="text-royal-blue/75 italic leading-relaxed border-l-2 border-royal-gold/40 pl-3">
          This hybrid AI + professional print approach gives us speed,
          creativity, and the high-quality physical product families expect from
          a premium studio.
        </p>
      </section>

      <section className="break-inside-avoid">
        <H2>Risks & Mitigation</H2>
        <table className="w-full text-sm border-collapse mt-2">
          <thead>
            <tr className="bg-royal-blue text-royal-cream">
              <th className="text-left p-2.5 font-semibold w-1/3">Risk</th>
              <th className="text-left p-2.5 font-semibold">Mitigation</th>
            </tr>
          </thead>
          <tbody>
            {BP_RISKS.map((row, i) => (
              <tr
                key={row.risk}
                className={i % 2 === 0 ? "bg-royal-cream/60" : "bg-white"}
              >
                <td className="p-2.5 font-semibold border-b border-royal-gold/15 align-top">
                  {row.risk}
                </td>
                <td className="p-2.5 border-b border-royal-gold/15 text-royal-blue/80">
                  {row.mitigation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="break-inside-avoid">
        <H2>Next Steps</H2>
        <p className="text-sm text-royal-blue/55 mb-3">
          Immediate priorities on our end before full launch
        </p>
        <ol className="space-y-3">
          {BP_NEXT_STEPS.map((item) => (
            <li key={item.step} className="flex gap-3">
              <span className="font-serif font-bold text-royal-gold shrink-0">
                {item.step}
              </span>
              <div>
                <p className="font-semibold text-royal-blue">{item.title}</p>
                <p className="text-sm text-royal-blue/75 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-10 pt-4 border-t border-royal-gold/20 text-center text-xs text-royal-blue/45">
        Internal use only · {new Date().getFullYear()} Storybook Photos
      </footer>
    </div>
  );
}
