"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Building2,
  TrendingUp,
  Target,
  ShieldAlert,
  Crown,
  ListChecks,
  BookOpen,
  Printer,
  Home,
  FileDown,
} from "lucide-react";
import {
  BP_ADVANTAGES as ADVANTAGES,
  BP_EXECUTIVE_SUMMARY,
  BP_FULFILLMENT_PROCESS as FULFILLMENT_PROCESS,
  BP_GROWTH as GROWTH,
  BP_NEXT_STEPS as NEXT_STEPS,
  BP_PHASE_TWO as PHASE_TWO,
  BP_PRINT_PARTNERS as PRINT_PARTNERS,
  BP_STORYBOOK_APIS as STORYBOOK_APIS,
  BP_STORYBOOK_AI_COST_TOTAL as STORYBOOK_AI_COST_TOTAL,
  BP_PROJECTIONS as PROJECTIONS,
  BP_REVENUE_POINTS as REVENUE_POINTS,
  BP_RISKS as RISKS,
  BP_COMPETITOR_PRICING as COMPETITOR_PRICING,
} from "@/lib/business-plan-content";
import { StorybookPreview } from "@/components/sections/storybook-preview";

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: typeof Crown;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-royal-gold/15 ring-1 ring-royal-gold/25">
        <Icon className="h-5 w-5 text-royal-gold" />
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue">
        {children}
      </h2>
    </div>
  );
}

export function BusinessPlanSection() {
  return (
    <article className="py-12 sm:py-16 bg-enchanted-cream print:bg-white print:py-6">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Internal banner + print */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-royal-gold/40 bg-royal-blue px-5 py-4 text-center print:border print:border-black print:bg-white print:text-black"
        >
          <p className="text-royal-gold text-xs font-semibold tracking-[0.2em] uppercase mb-1 print:text-black">
            Confidential
          </p>
          <p className="text-royal-cream font-serif text-lg sm:text-xl font-bold print:text-black">
            Internal Document – Password Protected
          </p>
        </motion.div>

        <div className="mb-8 flex flex-col sm:flex-row sm:justify-end gap-2 print:hidden">
          <Link
            href="/business-plan/print"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-royal-gold px-5 text-sm font-semibold text-royal-blue shadow-sm hover:bg-[#D4B480] transition-colors"
          >
            <FileDown className="h-4 w-4" />
            View PDF
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-royal-gold/40 bg-white px-5 text-sm font-semibold text-royal-blue shadow-sm hover:border-royal-gold hover:bg-royal-gold/10 transition-colors"
          >
            <Printer className="h-4 w-4 text-royal-gold" />
            Print
          </button>
        </div>

        {/* Title */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="ornament-line mb-4" aria-hidden="true">
            <Crown className="h-3.5 w-3.5 text-royal-gold/70" />
          </div>
          <p className="text-royal-gold font-medium tracking-widest uppercase text-sm mb-3">
            Storybook Photos
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-royal-blue mb-3 leading-tight">
            Business Plan
          </h1>
          <p className="text-royal-blue/60 text-lg">
            Kingdom Quests — Costa Mesa, CA
          </p>
        </motion.header>

        <div className="space-y-12 sm:space-y-14">
          {/* Executive Summary */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-royal-gold/25 bg-white/80 p-6 sm:p-8 shadow-sm"
          >
            <SectionHeading icon={Crown}>Executive Summary</SectionHeading>
            <p className="text-royal-blue/75 leading-relaxed">
              {BP_EXECUTIVE_SUMMARY}
            </p>
          </motion.section>

          {/* Key Advantages */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeading icon={Sparkles}>Key Advantages</SectionHeading>
            <ul className="grid sm:grid-cols-2 gap-3">
              {ADVANTAGES.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl border border-royal-gold/20 bg-white/70 px-4 py-3.5 text-sm sm:text-base text-royal-blue/80"
                >
                  <span className="text-royal-gold shrink-0 mt-0.5">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Operations + Revenue */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-royal-gold/25 bg-white/80 p-6 sm:p-7"
            >
              <SectionHeading icon={Building2}>Operations</SectionHeading>
              <p className="text-royal-blue/75 leading-relaxed">
                Studio available Wednesday–Saturday. Year 1 target is modest —{" "}
                <strong className="text-royal-blue">
                  3–5 sessions per week
                </strong>{" "}
                while we build awareness — with room to grow toward 10–12/week
                as demand and staffing allow.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-royal-gold/25 bg-white/80 p-6 sm:p-7"
            >
              <SectionHeading icon={TrendingUp}>Revenue Model</SectionHeading>
              <ul className="space-y-2.5">
                {REVENUE_POINTS.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm text-royal-blue/75 leading-relaxed"
                  >
                    <span className="text-royal-gold shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>

          {/* Interactive sample storybook preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <StorybookPreview />
          </motion.div>

          {/* Competitor Pricing Comparison */}
          <section className="mb-14">
            <SectionHeading icon={Target}>
              Competitor Pricing — Market Analysis
            </SectionHeading>
            <p className="text-royal-blue/70 mb-2 text-sm">
              <strong>{COMPETITOR_PRICING.competitor.name}</strong> — {COMPETITOR_PRICING.competitor.note}
            </p>
            <div className="overflow-x-auto rounded-xl border border-royal-gold/20 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-royal-blue text-royal-cream">
                    <th className="text-left p-3 font-semibold">Product</th>
                    <th className="text-right p-3 font-semibold">Competitor</th>
                    <th className="text-right p-3 font-semibold">Storybook Photos</th>
                    <th className="text-center p-3 font-semibold">Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITOR_PRICING.competitor.items.map((item, i) => (
                    <tr key={item.product} className={i % 2 === 0 ? "bg-white" : "bg-royal-cream/30"}>
                      <td className="p-3 font-medium text-royal-blue">{item.product}</td>
                      <td className="p-3 text-right text-red-600 font-medium">{item.price}</td>
                      <td className="p-3 text-right font-bold" style={{ color: item.us === "INCLUDED in packages" ? "#16a34a" : "#1e3a5f" }}>
                        {item.us ?? item.price}
                      </td>
                      <td className="p-3 text-center">
                        {item.us === "INCLUDED in packages" ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">✓ WE WIN</span>
                        ) : item.us ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Same</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-800 mb-3">Our Key Advantages</h4>
              <ul className="space-y-1.5">
                {COMPETITOR_PRICING.ourAdvantages.map((adv) => (
                  <li key={adv} className="flex gap-2 text-sm text-green-700">
                    <span className="text-green-500 font-bold mt-0.5">✓</span>
                    {adv}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Financial Projections */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeading icon={TrendingUp}>
              3-Year Financial Projections
            </SectionHeading>
            <p className="text-royal-blue/55 text-sm mb-6">
              Conservative estimates
            </p>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
              {PROJECTIONS.map((year) => (
                <div
                  key={year.year}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    year.highlight
                      ? "bg-royal-blue text-royal-cream border-2 border-royal-gold shadow-lg shadow-royal-gold/20"
                      : "bg-white border border-royal-gold/25"
                  }`}
                >
                  <h3
                    className={`font-serif text-xl font-bold mb-4 ${
                      year.highlight ? "text-royal-gold" : "text-royal-blue"
                    }`}
                  >
                    {year.year}
                  </h3>
                  <dl className="space-y-3 text-sm flex-1">
                    <div>
                      <dt
                        className={
                          year.highlight
                            ? "text-royal-cream/50 text-xs uppercase tracking-wide mb-0.5"
                            : "text-royal-blue/45 text-xs uppercase tracking-wide mb-0.5"
                        }
                      >
                        Volume
                      </dt>
                      <dd
                        className={
                          year.highlight
                            ? "text-royal-cream/85"
                            : "text-royal-blue/75"
                        }
                      >
                        {year.sessions}
                      </dd>
                    </div>
                    <div>
                      <dt
                        className={
                          year.highlight
                            ? "text-royal-cream/50 text-xs uppercase tracking-wide mb-0.5"
                            : "text-royal-blue/45 text-xs uppercase tracking-wide mb-0.5"
                        }
                      >
                        Avg / session
                      </dt>
                      <dd
                        className={
                          year.highlight
                            ? "text-royal-cream/85"
                            : "text-royal-blue/75"
                        }
                      >
                        {year.avg}
                      </dd>
                    </div>
                    <div>
                      <dt
                        className={
                          year.highlight
                            ? "text-royal-cream/50 text-xs uppercase tracking-wide mb-0.5"
                            : "text-royal-blue/45 text-xs uppercase tracking-wide mb-0.5"
                        }
                      >
                        Revenue
                      </dt>
                      <dd
                        className={`font-serif text-lg font-bold ${
                          year.highlight ? "text-royal-gold" : "text-royal-blue"
                        }`}
                      >
                        {year.revenue}
                      </dd>
                    </div>
                    {year.margin && (
                      <div>
                        <dd
                          className={
                            year.highlight
                              ? "text-royal-cream/70 text-xs"
                              : "text-royal-blue/55 text-xs"
                          }
                        >
                          {year.margin}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <div
                    className={`mt-5 pt-4 border-t ${
                      year.highlight
                        ? "border-royal-gold/30"
                        : "border-royal-gold/20"
                    }`}
                  >
                    <p
                      className={
                        year.highlight
                          ? "text-royal-cream/50 text-xs uppercase tracking-wide mb-1"
                          : "text-royal-blue/45 text-xs uppercase tracking-wide mb-1"
                      }
                    >
                      Estimated Net Profit
                    </p>
                    <p
                      className={`font-serif text-xl font-bold ${
                        year.highlight ? "text-royal-gold" : "text-royal-blue"
                      }`}
                    >
                      {year.profit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Growth Strategy */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-royal-gold/25 bg-white/80 p-6 sm:p-8"
          >
            <SectionHeading icon={Target}>Growth Strategy</SectionHeading>
            <ul className="space-y-3">
              {GROWTH.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-royal-blue/75 leading-relaxed"
                >
                  <span className="text-royal-gold shrink-0 mt-1">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Phase Two */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-royal-gold/35 bg-gradient-to-br from-white via-royal-cream/80 to-royal-gold/10 p-6 sm:p-8"
          >
            <SectionHeading icon={Home}>Phase Two — Our Own Home</SectionHeading>
            <p className="text-royal-blue/75 leading-relaxed mb-6">
              After we prove the business works, we use the money to rent or buy
              a place that is truly ours — with an enchanted tea house connected
              to the studio. That gives us a kitchen and a second revenue stream
              for birthdays and celebrations on weekends, while families stay
              inside the same magical world.
            </p>
            <ul className="space-y-4">
              {PHASE_TWO.map((item, index) => (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-xl border border-royal-gold/25 bg-white/80 px-4 py-4 sm:px-5"
                >
                  <span className="font-serif text-lg font-bold text-royal-gold shrink-0 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-royal-blue mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-royal-blue/70 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Production & Fulfillment */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-royal-gold/25 bg-white/80 p-6 sm:p-8"
          >
            <SectionHeading icon={BookOpen}>
              Production & Fulfillment Strategy
            </SectionHeading>
            <p className="text-royal-blue/75 leading-relaxed mb-8">
              We leverage AI for rapid story creation and illustration
              generation, then partner with premium printers for final
              production.
            </p>

            <h3 className="font-serif text-lg font-bold text-royal-blue mb-3">
              Where We Print
            </h3>
            <ul className="space-y-3 mb-8">
              {PRINT_PARTNERS.map((partner) => (
                <li
                  key={partner.name}
                  className="rounded-xl border border-royal-gold/20 bg-royal-cream/50 px-4 py-3.5"
                >
                  <p className="font-semibold text-royal-blue text-sm sm:text-base">
                    {partner.url ? (
                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-royal-blue hover:text-royal-gold underline-offset-2 hover:underline"
                      >
                        {partner.name}
                      </a>
                    ) : (
                      partner.name
                    )}
                    {partner.name === "Mpix" && (
                      <span className="ml-2 text-[10px] font-semibold tracking-wider uppercase text-royal-gold bg-royal-gold/15 px-2 py-0.5 rounded-md">
                        Primary
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-royal-blue/65 mt-0.5">
                    {partner.role}
                  </p>
                  {partner.url && (
                    <p className="text-xs text-royal-gold/80 mt-1.5 break-all">
                      {partner.url}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <h3 className="font-serif text-lg font-bold text-royal-blue mb-3">
              APIs We Need (and Cost to Create a Storybook)
            </h3>
            <p className="text-sm text-royal-blue/60 mb-4">
              Estimated cost for a 12–20 page personalized book before printing.
            </p>
            <div className="overflow-x-auto rounded-xl border border-royal-gold/25 mb-3">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="bg-royal-blue text-royal-cream">
                    <th className="px-3 py-2.5 font-semibold">API</th>
                    <th className="px-3 py-2.5 font-semibold">Purpose</th>
                    <th className="px-3 py-2.5 font-semibold">Provider</th>
                    <th className="px-3 py-2.5 font-semibold whitespace-nowrap">
                      Cost / book
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STORYBOOK_APIS.map((row, i) => (
                    <tr
                      key={row.api}
                      className={
                        i % 2 === 0
                          ? "bg-white text-royal-blue/80"
                          : "bg-royal-cream/50 text-royal-blue/80"
                      }
                    >
                      <td className="px-3 py-2.5 font-semibold text-royal-blue">
                        {row.api}
                      </td>
                      <td className="px-3 py-2.5">{row.purpose}</td>
                      <td className="px-3 py-2.5">{row.provider}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-medium text-royal-blue">
                        {row.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm font-semibold text-royal-blue mb-8 rounded-lg bg-royal-gold/15 border border-royal-gold/30 px-4 py-3">
              {STORYBOOK_AI_COST_TOTAL}
            </p>

            <h3 className="font-serif text-lg font-bold text-royal-blue mb-3">
              Process
            </h3>
            <ol className="space-y-2.5 mb-8">
              {FULFILLMENT_PROCESS.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 text-sm sm:text-base text-royal-blue/75 leading-relaxed"
                >
                  <span className="font-serif font-bold text-royal-gold shrink-0 tabular-nums">
                    {index + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <h3 className="font-serif text-lg font-bold text-royal-blue mb-3">
              Margins
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl border border-royal-gold/25 bg-royal-blue px-4 py-4">
                <p className="text-royal-cream/50 text-xs uppercase tracking-wide mb-1">
                  Digital storybooks
                </p>
                <p className="font-serif text-xl font-bold text-royal-gold">
                  85–95%
                </p>
                <p className="text-royal-cream/60 text-xs mt-1">gross margin</p>
              </div>
              <div className="rounded-xl border border-royal-gold/25 bg-royal-cream/60 px-4 py-4">
                <p className="text-royal-blue/45 text-xs uppercase tracking-wide mb-1">
                  Premium printed storybooks
                </p>
                <p className="font-serif text-xl font-bold text-royal-blue">
                  75–90%
                </p>
                <p className="text-royal-blue/55 text-xs mt-1">
                  gross margin after printing costs
                </p>
              </div>
            </div>

            <p className="text-royal-blue/70 text-sm sm:text-base leading-relaxed border-l-2 border-royal-gold/40 pl-4 italic">
              This hybrid AI + professional print approach gives us speed,
              creativity, and the high-quality physical product families expect
              from a premium studio.
            </p>
          </motion.section>

          {/* Risks */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeading icon={ShieldAlert}>
              Risks & Mitigation
            </SectionHeading>
            <div className="overflow-hidden rounded-2xl border border-royal-gold/25 bg-white/80">
              <div className="hidden sm:grid grid-cols-2 gap-4 px-6 py-3 bg-royal-blue/5 border-b border-royal-gold/15 text-xs font-semibold uppercase tracking-wider text-royal-blue/50">
                <span>Risk</span>
                <span>Mitigation</span>
              </div>
              {RISKS.map((row, i) => (
                <div
                  key={row.risk}
                  className={`grid sm:grid-cols-2 gap-1 sm:gap-4 px-6 py-4 ${
                    i < RISKS.length - 1 ? "border-b border-royal-gold/10" : ""
                  }`}
                >
                  <p className="font-semibold text-royal-blue text-sm sm:text-base">
                    <span className="sm:hidden text-royal-blue/45 text-xs uppercase tracking-wide mr-2">
                      Risk:
                    </span>
                    {row.risk}
                  </p>
                  <p className="text-royal-blue/70 text-sm sm:text-base leading-relaxed">
                    <span className="sm:hidden text-royal-blue/45 text-xs uppercase tracking-wide mr-2">
                      Mitigation:
                    </span>
                    {row.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Next Steps */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border-2 border-royal-gold/40 bg-royal-blue p-6 sm:p-8 shadow-lg shadow-royal-gold/15"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-royal-gold/20 ring-1 ring-royal-gold/35">
                <ListChecks className="h-5 w-5 text-royal-gold" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-royal-cream">
                Next Steps
              </h2>
            </div>
            <p className="text-royal-cream/55 text-sm mb-6 ml-[3.25rem]">
              Immediate priorities on our end before full launch
            </p>
            <ol className="space-y-4">
              {NEXT_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-4 rounded-xl border border-royal-gold/25 bg-white/5 px-4 py-4 sm:px-5"
                >
                  <span className="font-serif text-xl font-bold text-royal-gold shrink-0 tabular-nums">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-royal-cream mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-royal-cream/70 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>
        </div>

        <p className="mt-12 text-center text-xs text-royal-blue/40">
          Internal use only · {new Date().getFullYear()} Storybook Photos
        </p>
      </div>
    </article>
  );
}
