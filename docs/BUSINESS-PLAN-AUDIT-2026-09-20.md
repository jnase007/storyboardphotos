# Storybook Photos — Business Plan Audit
Date: 2026-09-20  
Source of truth (do not delete): `src/lib/business-plan-content.ts` + `/business-plan` UI  
This file is a **review only**. It does not replace the plan.

---

## Bottom line

**The plan is directionally correct and stronger than most early biz plans.**  
Core thesis holds:

1. Premium kids kingdom photo experience in OC  
2. Transparent packages (anti–Enchanted Fairies pressure model)  
3. Storybook included / AI-assisted fulfillment  
4. **Office beta first → retail + kitchen only after gates**  
5. CAC discovery before a big lease  

**Do not throw this plan away.** Fix a few internal conflicts, tighten unit economics honesty, and sequence digital/movie so they support the studio — not compete with it.

---

## What’s already correct (keep)

### Positioning
- Costa Mesa / OC kids kingdom studio is clear and local-real.
- “Remind your child they are royalty” fits the brand.
- Transparent pricing vs surprise ordering appointment is a real market wedge.
- Enchanted Fairies comps are still valid: public site still says most clients invest **$1,000–$3,000**, some $10K+; older USA Today / review complaint pattern supports “pressure / surprise spend” risk in that category.

### Product spine
- Session + Kingdom Chronicles storybook is the right core SKU.
- 60-minute family session (siblings in same hour) is operationally smart.
- Human review of every AI book is the right quality rule.
- Print partners (Mpix primary, luxury/test options) are sensible.
- AI cost per book **$0.50–$3** is believable and still tiny vs package price.

### Phase logic (best part of the plan)
- Phase 1 office beta = prove product + **paid CAC**
- Phase 2 retail + kitchen only after gates
- Phase 3 multi-set/team after retail is full  
This is the correct capital discipline. Keep the gate metrics.

### Competitive story
- Storybook included vs $3,000+ extra elsewhere = strong offer math.
- Digital share link as marketing engine is smart.
- Animated video as high-margin add-on is right *as an upsell*, not the main product on day one.

### CAC framework
- Beta CAC test budget, bands, and “don’t lease if CAC is ugly” rule is excellent.
- Keep this as the #1 pre-retail learning goal.

---

## What’s inconsistent inside the plan (fix without rewriting)

These are **internal conflicts** in the same file / UI. Parents never see them, but Justin’s decision math does.

| Topic | Conflict | Correct direction |
|---|---|---|
| **Solo package price** | Early revenue points say **$450** start; competitor table / packages use **$299–$349**; avg-spend mix shows Solo **$299–$349** | Pick one public ladder. Recommend live ladder: **$349 / $549 / $849** (or $399 entry if you want more premium feel) and make every section match |
| **Avg ticket targets** | Shows $420, $480, $500, $520, $560, $650 in different models | Fine to have phases, but label them: beta target / retail steady / stretch. One “planning avg” for Phase 1: **$480–$520** |
| **Year 1 model** | Old `BP_PROJECTIONS` assumes leased OC studio Year 1; `BP_PHASE_ROADMAP` + beta strategy correctly say office first | **Office beta is Year-0 / Phase 1.** Leased retail projections only after gates. Mark old “lease from day 1” block as legacy or retail-only |
| **Startup capital** | Beta capital **$10–40K** vs full proforma **~$155K** mid / buildout **$69–135K** | Both can be true if labeled: **beta capital** vs **retail open capital**. Never mix in one “to start” number |
| **Break-even sessions** | `BP_STARTUP_COSTS` ~**55/mo**; proforma ~**29/mo**; retail models differ again | Recompute one break-even table per phase (beta fixed opex vs retail fixed opex) |
| **Family Quest cost note** | Package says Family cost assumes **90 min** while session rule is **60 min max** | Fix cost model to 60-minute family flow (or change rule — don’t leave both) |
| **Solo margin** | Solo ~**20%** cash margin if owner time @ $175/hr is included; sibling/family look better | Show two margins always: **cash margin** (no owner wage) and **fully loaded**. Solo is a door-buster; profit is in sibling/family + prints + video |
| **Art style language** | Biz plan APIs say **watercolor**; movie/quest SOP locks **coloring-book line art** | Pick one hero look for brand consistency (or define: portraits watercolor / quest pages line-art). Don’t ship mixed promises |
| **Kingdom Chronicles price** | Early bullet: Chronicles **starting $3,000** upsell; later: included in packages / competitor contrast | If brand promise is “included,” kill $3K as standard path. Keep a **luxury heirloom** tier optional, clearly named |
| **Video price** | Plan add-on **$299**; competitor slideshow $1,400 | $299 is fine for launch test; confirm delivery cost/time before locking |

**Rule:** One pricing sheet drives the site, ads, and business plan. Everything else inherits it.

---

## Research check (outside the doc)

### Market
- Personalized kids books remain a real gift category with multi-year growth in industry reports (directionally mid/high single-digit to ~10% CAGR depending on report). Useful as tailwind — **not** a reason to skip local session CAC tests.
- Online-only AI book brands (Wonderbly-style / Magic Story / photo-to-story apps) are competitors for **attention**, not the same as an in-studio kingdom experience. Your moat is **physical magic + keepsake + local trust**.

### Competitor model
- Enchanted Fairies still publicly frames **$1K–$3K typical investment** with ordering-appointment economics. Your transparent package strategy is still the right counter-position in 2026.
- Risk: if your photos/books look cheaper than pressure studios, parents may anchor low. Mitigation = sample quality wall + included book visible in every ad.

### OC birthday market
- Kids party venues in OC are plentiful and price-competitive on a **per-kid** basis. Your birthday play should stay **premium kingdom party tied to portraits/books**, not race bounce-house pricing. Phase 2 kitchen is still logical — after session demand is real.

### Demand proof still missing (honest gap)
Plan is strong on model; still light on **live local proof**:
- Paid sessions completed
- Real average ticket
- Real CAC
- Rework rate
- Waitlist for retail  

That’s what beta is for — the plan already says this. Execute it.

---

## What could improve (priority order)

### P0 — Decision hygiene (this week)
1. **Lock one public price ladder** and sync site + `business-plan-content.ts`  
2. **Label all financial blocks by phase** (Beta / Retail / Scale) so nothing implies lease-from-day-one  
3. **Fix Family 90-min vs 60-min contradiction**  
4. **Unify art direction language** (watercolor vs coloring-book)  
5. **Clarify Chronicles:** included core vs optional luxury heirloom

### P1 — Unit economics honesty
6. Show Solo as **acquisition SKU**; profit stack = sibling/family + digital + prints + video  
7. One beta P&L: low fixed opex at office, 12–20 sessions/mo target, contribution after **cash** COGS  
8. Keep retail $300K-net paths, but only as **Phase 2+ ambition**, not beta expectation (plan already mostly does this — keep it loud)

### P2 — Offer / growth upgrades (support studio, don’t replace it)
9. **Free 1-page hero preview** (email capture) as top-of-funnel — especially for grandparents/out-of-area who can’t book a set tomorrow  
10. **Grandparent gift path** (pay → surprise parents) — huge for Q4  
11. **Church / Christian school / mom-group** partnerships already listed — make 10 named targets, not just a bullet  
12. Movie/narration stay **upsells after book quality is proven** (animated plan already exists — good)

### P3 — Ops / risk upgrades
13. Add **delivery SLA** (e.g., digital share 48–72h, print book X days) — gift dates kill studios that miss Christmas  
14. Add **likeness failure protocol** (when face AI looks wrong → human fix path)  
15. Insurance / minor model releases / photo privacy already implied — keep checklist in go-live  
16. Owner capacity vs Brandastic is already a gate — treat it as hard, not soft

---

## Scorecard: is the plan “correct”?

| Area | Grade | Note |
|---|---|---|
| Vision / brand | A | Clear, emotional, local |
| Competitive wedge | A | Transparent + book included is right |
| Phase discipline | A | Best section — keep gates |
| CAC thinking | A- | Excellent; needs live numbers |
| Pricing coherence | C+ | Numbers fight each other |
| Year 1 projections | B- | Good math, wrong if read as “lease now” |
| Unit margins | B | Solo loaded margin thin; structure OK if intentional |
| Fulfillment realism | B+ | AI cheap; human QA + print SLA need more teeth |
| Growth channels | B | Right list; needs named plays + creative proof kit |
| Digital/movie lane | B | Strong upside; must not dilute studio hero story |

**Overall:** **B+ / correct strategy, needs cleanup pass** — not a rewrite.

---

## Recommended keep vs change

### Keep 100%
- Executive thesis (kingdom studio + chronicles)
- Anti-pressure pricing philosophy
- Phase 1→2→3 roadmap + retail gate metrics
- Beta CAC test design
- 60-minute family session standard
- Mpix / print approach
- Human review of AI books
- One-store $300K paths as **later** ambition
- Birthday-by-phase thinking

### Change (surgical)
- One price ladder everywhere
- Phase labels on every $ projection
- Art style consistency
- Chronicles included vs luxury naming
- Family session cost timing
- Dual margin display (cash vs loaded)

### Add (small)
- Hero-preview lead magnet
- Grandparent gift flow
- Delivery SLAs
- Named partner list (10)
- Live scorecard tab: sessions, ticket, CAC, rework

---

## Do not do
- Don’t scrap the business plan UI/content  
- Don’t jump to retail buildout before beta gates  
- Don’t make online-only AI books the new company (use as funnel/add-on)  
- Don’t copy Enchanted Fairies pressure sales to “raise AOV”  
- Don’t hand this plan to crew bots as a rewrite brief without Tinny locking prices first  

---

## Suggested next step (with Justin approval)
1. Justin confirms **public price ladder** (recommend $349 / $549 / $849 or his preferred)  
2. Tinny does a **surgical sync** of `business-plan-content.ts` + site pricing only where numbers conflict  
3. Run **beta sequence** already in plan: sample books → deposit booking → CAC test  
4. Use Grok crew for growth assets **after** price lock — not to reinvent the model  

---

## Files
- Plan source: `src/lib/business-plan-content.ts`  
- This audit: `docs/BUSINESS-PLAN-AUDIT-2026-09-20.md`  
- Separate growth sketch (crew test): `docs/GROWTH-STRATEGY-2026-09-20.md` — subordinate to this plan, not a replacement
