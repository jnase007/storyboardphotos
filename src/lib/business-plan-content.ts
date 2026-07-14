/** Shared content for the internal business plan (screen + PDF). */

export const BP_ADVANTAGES = [
  "Rent-free beta location",
  "Church volunteer support for sets",
  "AI for stories and images → fast, low-cost, high-margin production",
  "Strong emotional appeal and high perceived value",
] as const;

export const BP_REVENUE_POINTS = [
  "Session packages starting at $450 (2 kingdom sets included)",
  "Mid and premium tiers at $750 and $1,200 for deeper set coverage + storybooks",
  "High-margin upsells: fine art prints, digital files, and Kingdom Chronicles (starting at $3,000)",
  "Digital-only storybooks for instant high-margin revenue",
] as const;

export const BP_GROWTH = [
  "Instagram + local Christian mom groups marketing",
  "Church partnerships",
  "AI-powered fast digital storybooks",
  "Phase 1 weekend birthday parties (second revenue stream before tea house)",
  "Expand days/staff in Year 2",
] as const;

export const BP_RISKS = [
  {
    risk: "Competition",
    mitigation: "Strong differentiation with kingdom theme and AI speed",
  },
  {
    risk: "Sales conversion",
    mitigation: "Excellent reveal appointment process",
  },
  {
    risk: "Quality",
    mitigation: "Human review of every AI-generated book",
  },
] as const;

export const BP_NEXT_STEPS = [
  {
    step: "01",
    title: "Find a set builder",
    detail:
      "Identify someone to help us build the kingdom sets — throne room, forest, garden, and courage quest.",
  },
  {
    step: "02",
    title: "Run a mini beta shoot",
    detail:
      "Do a small test session, ideally with the owner's kids, to validate lighting, costumes, flow, and the reveal experience.",
  },
  {
    step: "03",
    title: "Create a sample storybook",
    detail:
      "Produce one full book end-to-end — AI story/image creation plus the printing process — so we know timing, quality, and margins.",
  },
] as const;

export const BP_PRINT_PARTNERS = [
  {
    name: "Mpix",
    role: "Primary print partner — archival photo prints, hardcover photo books, and albums (handcrafted in the USA)",
    url: "https://www.mpix.com/",
  },
  {
    name: "Artifact Uprising",
    role: "Optional luxury lay-flat Kingdom Chronicles for premium upgrades",
    url: null as string | null,
  },
  {
    name: "Blurb",
    role: "Faster digital-first and test runs",
    url: null as string | null,
  },
] as const;

/** APIs required for the storybook generator + approx cost per 12–20 page book */
export const BP_STORYBOOK_APIS = [
  {
    api: "Image Generation",
    purpose: "Watercolor scenes + character likeness",
    provider: "Google Imagen 4.0 + Gemini image (primary) · fal.ai Flux PuLID / Bria (likeness + BG remove)",
    cost: "$0.40 – $2.50",
  },
  {
    api: "Story Generation",
    purpose: "Personalized kingdom story (or scripted path)",
    provider: "xAI Grok (primary) · Claude fallback · template scripts",
    cost: "<$0.10",
  },
  {
    api: "Storage & Database",
    purpose: "Photos, generated art, PDFs, bookings",
    provider: "Supabase (already set up)",
    cost: "Free — very low",
  },
] as const;

export const BP_STORYBOOK_AI_COST_TOTAL =
  "Total estimated AI cost per book: $0.50 – $3.00 (still very cheap vs $299–$849 packages)";

export const BP_FULFILLMENT_PROCESS = [
  "AI-generated personalized story (Grok/Claude or scripted adventure path) + watercolor illustrations (Imagen 4 / Gemini / fal.ai likeness)",
  "Human editing & curation",
  "Professional printing via Mpix on archival paper / hardcover photo books",
  "Digital PDF delivery option for instant high-margin revenue",
] as const;

/**
 * Three-phase roadmap (real decision path):
 * 1) Beta at Brandastic office
 * 2) Full retail location + kitchen (birthdays) — most likely next scale step
 * 3) Multi-set / multi-photographer scale
 */
export const BP_PHASE_ROADMAP = {
  summary:
    "Phase 1 proves the product at our office (low capital). Phase 2 is the real scale decision: full retail + kitchen for birthdays — only after beta numbers clear the gate. Phase 3 adds parallel sets/team once the retail location is full.",
  phases: [
    {
      id: "beta",
      name: "Phase 1 — Beta at the Office",
      likelihood: "Now",
      goal: "Prove session flow, book quality, demand, and unit economics with minimal rent risk.",
      location: "Brandastic / existing office space",
      capitalMid: 25000,
      capitalRange: "$10K–$40K",
      monthlyFixedOpex: 4500,
      sessionsPerMonthTarget: 16,
      avgTicket: 500,
      birthdayPartiesPerMonth: 2,
      birthdayAvgTicket: 650,
      annualizedRevIfSteady: 112800,
      whatWeLearn: [
        "Do parents love the experience enough to pay transparent package prices?",
        "Is the storybook gift-worthy every time?",
        "Can siblings finish in 60 minutes?",
        "What is real average ticket (solo vs sibling vs add-ons)?",
        "Can we fill ~12–20 sessions/month from warm network + light ads?",
        "What is real paid CAC (ad spend per paying family)?",
      ],
      includes: [
        "One main set at the office (scenes swap out — not permanent rooms)",
        "Sequential sessions only (one family at a time)",
        "Photo sessions + simple birthday add-ons",
        "Full book production pipeline",
        "Booking, deposits, SOPs",
      ],
      notYet: [
        "Multiple permanent set rooms",
        "Parallel shoots at the same time",
        "Full retail lease + kitchen",
        "Multi-photographer staffing",
      ],
      opsModel:
        "Single main set footprint. Change scenes/backdrops/props between sessions or mid-session as needed. Throughput is one shoot at a time — prove demand and quality, not parallel capacity.",
    },
    {
      id: "retail",
      name: "Phase 2 — Full Retail + Kitchen",
      likelihood: "Most likely scale step",
      goal: "Purpose-built customer location: sessions all week + real birthday parties with kitchen capability.",
      location: "Leased retail / studio with kitchen (OC)",
      capitalMid: 175000,
      capitalRange: "$130K–$250K",
      monthlyFixedOpex: 16000,
      sessionsPerMonthTarget: 45,
      avgTicket: 560,
      birthdayPartiesPerMonth: 6,
      birthdayAvgTicket: 850,
      annualizedRevIfSteady: 363600,
      triggerToPull:
        "Only after beta clears the gate metrics — do not sign a big retail lease on hope.",
      gateMetrics: [
        { metric: "Sessions / month (beta)", target: "≥ 16 for 2 consecutive months" },
        { metric: "Average ticket", target: "≥ $480" },
        { metric: "Show-up / completion rate", target: "≥ 90%" },
        { metric: "Book rework rate", target: "< 15% needing major redo" },
        { metric: "Contribution after COGS", target: "≥ $400 / session" },
        { metric: "Warm demand waitlist", target: "≥ 25 families interested in retail open" },
        { metric: "Owner capacity", target: "Can staff 3–4 session days/week without burning Brandastic" },
      ],
      includes: [
        "Multiple permanent sets built at once (individual scene rooms/areas)",
        "Parallel shoots — more than one family/session at the same time when staffed",
        "Retail storefront experience",
        "Kitchen for birthday parties / tea-house style gatherings",
        "Higher birthday ticket + more weekend party slots",
        "Part-time staff / assistant + path to 2nd photographer",
      ],
      opsModel:
        "True multi-set layout. Unlike office beta scene-swaps, sets stay standing so capacity can scale with photographers — feed multiple shoots in parallel.",
      rentCaution:
        "If rent pushes fixed OpEx above ~$18–20K/mo, recalculate break-even before signing. Pretty space that can't break even is a trap.",
    },
    {
      id: "scale",
      name: "Phase 3 — Scale (Multi-Set / Team)",
      likelihood: "After retail is full",
      goal: "Parallel lanes: multiple sets running, multiple photographers, higher birthday volume.",
      location: "Same retail home (expanded ops) or second site later",
      capitalMid: 80000,
      capitalRange: "$50K–$150K incremental",
      monthlyFixedOpex: 35000,
      sessionsPerMonthTarget: 120,
      avgTicket: 600,
      birthdayPartiesPerMonth: 12,
      birthdayAvgTicket: 950,
      annualizedRevIfSteady: 1008000,
      triggerToPull:
        "Retail calendar is consistently full; turning away customers; contribution margins still healthy after staff costs.",
      includes: [
        "All set rooms running in parallel",
        "2–4 photographers feeding simultaneous shoots",
        "Birthday program fully staffed",
        "Systems for QA, scheduling, fulfillment at volume",
      ],
      opsModel:
        "Maximize utilization of permanent multi-set retail footprint — the capacity unlock that office scene-swapping cannot match.",
    },
  ],
} as const;

/** @deprecated Use BP_PHASE_ROADMAP — kept as aliases for existing UI sections */
export const BP_PHASE_ONE = [
  {
    title: "Beta at the office (now)",
    detail:
      "One main set at the office — swap scenes/props as needed (not separate rooms). One family at a time. Prove demand, 60-minute flow, book quality, and real average ticket before any big retail lease.",
  },
  {
    title: "What beta must prove",
    detail:
      "Parents pay transparent prices, siblings finish in an hour, books are gift-worthy, and we can fill ~12–20 sessions/month without a storefront.",
  },
  {
    title: "Simple birthdays only",
    detail:
      "Light weekend party add-ons possible in beta (cake table / crowns) — full kitchen parties wait for retail Phase 2.",
  },
  {
    title: "Capital stays light",
    detail:
      "Phase 1 is about learning with limited capital ($10–40K), not building the dream location yet.",
  },
] as const;

export const BP_PHASE_ONE_BIRTHDAYS = {
  headline: "Birthdays by phase",
  summary:
    "Beta: simple party add-ons only. Phase 2 retail + kitchen: real birthday program (most likely scale investment). Phase 3: high-volume parties with staff.",
  packageIdeas: [
    { name: "Beta Birthday Mini", price: "$399–$549", includes: "Simple party window at office · mini-session · digital share link" },
    { name: "Retail Kingdom Party", price: "$699–$999", includes: "Kitchen-capable space · 2 sets · birthday + sibling portraits · 1 hardcover book" },
    { name: "Royal Court Party", price: "$1,200–$1,800", includes: "Larger guests · premium styling · books/prints package (Phase 2+)" },
  ],
  opsNotes: [
    "Do not build kitchen capacity until beta gate metrics clear",
    "Phase 2 kitchen is the birthday unlock — and the big lease decision",
    "Protect photo session blocks even when parties grow",
    "Every party should still drive a book/print upsell",
  ],
};

export const BP_PHASE_TWO = [
  {
    title: "This is the real 'pull the trigger' decision",
    detail:
      "Full retail location with kitchen is more likely than staying in the office forever — but only after beta numbers make the lease math work.",
  },
  {
    title: "What you're buying in Phase 2",
    detail:
      "Customer-facing location with multiple permanent sets (not scene swaps), kitchen for birthdays, parallel shoots when staffed, brand presence. Capital mid ~$175K + higher monthly fixed costs. This is the throughput jump the office cannot do.",
  },
  {
    title: "Gate before signing",
    detail:
      "Hit beta metrics (volume, ticket, quality, waitlist). Recalculate break-even with the actual rent. If rent is too high, walk — the location should serve the model, not the other way around.",
  },
] as const;

/**
 * Phase decision economics — office beta vs retail+kitchen vs scale.
 * Used on proforma / phase decision page so we know when to pull the trigger.
 */
/** Office beta vs retail: set footprint difference */
export const BP_SET_CAPACITY_NOTE = {
  beta:
    "Office beta: one main set. Scenes can be switched out (different looks), but there are not individual rooms for each kingdom set. Sessions run one at a time.",
  retail:
    "Retail: build multiple permanent sets at once. Multiple shoots can run in parallel when staffed — real capacity scale, not just nicer space.",
  implication:
    "Beta proves willingness to pay and product quality. Retail unlocks simultaneous throughput (multi-set, multi-shoot feed). Don't model office beta as if it had 4 standing rooms.",
};

export const BP_PHASE_ECONOMICS = {
  beta: {
    id: "beta",
    name: "Phase 1 · Office beta",
    sessionsPerYear: 192,
    avgTicket: 500,
    birthdayPartiesPerYear: 24,
    birthdayAvgTicket: 650,
    expenses: [
      { label: "Extra office overhead / utilities share", annual: 6000 },
      { label: "Part-time assist (as needed)", annual: 18000 },
      { label: "Marketing", annual: 18000 },
      { label: "Insurance (photo rider)", annual: 2400 },
      { label: "Software / AI / tools", annual: 3600 },
      { label: "Props refresh / supplies", annual: 3600 },
      { label: "Misc / admin", annual: 2400 },
    ],
    capitalMid: 25000,
    note: "Low rent risk. Proves product. Not the ceiling.",
  },
  retail: {
    id: "retail",
    name: "Phase 2 · Retail + kitchen",
    sessionsPerYear: 540,
    avgTicket: 560,
    birthdayPartiesPerYear: 72,
    birthdayAvgTicket: 850,
    expenses: [
      { label: "Rent (retail + kitchen)", annual: 84000 },
      { label: "Staff / assistants", annual: 48000 },
      { label: "Marketing", annual: 36000 },
      { label: "Insurance", annual: 7200 },
      { label: "Utilities", annual: 9600 },
      { label: "Software / AI", annual: 4800 },
      { label: "Maintenance / props / kitchen supplies", annual: 12000 },
      { label: "Misc / admin", annual: 6000 },
    ],
    capitalMid: 175000,
    note: "Most likely next step after beta. Kitchen unlocks real birthday revenue.",
  },
  scale: {
    id: "scale",
    name: "Phase 3 · Multi-set scale",
    sessionsPerYear: 1440,
    avgTicket: 600,
    birthdayPartiesPerYear: 144,
    birthdayAvgTicket: 950,
    expenses: [
      { label: "Rent", annual: 96000 },
      { label: "Photographers & staff", annual: 220000 },
      { label: "Marketing", annual: 72000 },
      { label: "Insurance", annual: 12000 },
      { label: "Utilities", annual: 12000 },
      { label: "Software / AI", annual: 9600 },
      { label: "Maintenance / props / kitchen", annual: 24000 },
      { label: "Misc / admin", annual: 12000 },
    ],
    capitalMid: 80000,
    note: "Incremental capital after retail is full. Team + parallel capacity.",
  },
} as const;

/**
 * 3-Year projections — fully operational studio with leased location in OC.
 * Open 6 days/week (Mon–Sat), 4 sessions/day. Includes rent, staff, buildout.
 * Assumes dedicated studio space (1,500–2,000 sqft Orange County).
 */
export const BP_PROJECTIONS = [
  {
    year: "Year 1",
    sessions: "2–3 sessions/day · 5 days/week (≈ 480–600 sessions)",
    avg: "$420 avg ticket",
    revenue: "~$202,000 – $252,000",
    margin: "After overhead: 25–30%",
    profit: "$50,000 – $76,000",
    note: "Soft launch in leased OC space. Building brand, refining ops. Overhead: ~$150K/yr (rent $5K/mo + staff + utilities).",
    highlight: false,
  },
  {
    year: "Year 2",
    sessions: "4 sessions/day · 6 days/week · 75% capacity (≈ 900 sessions)",
    avg: "$480 avg ticket (upsells growing)",
    revenue: "~$432,000",
    margin: "After overhead: 38–42%",
    profit: "$164,000 – $181,000",
    note: "Full 6-day schedule. 2nd photographer hired. Add-ons (prints, video) contributing meaningfully.",
    highlight: true,
  },
  {
    year: "Year 3",
    sessions: "4 sessions/day · 6 days/week · 90% capacity (≈ 1,100 sessions)",
    avg: "$550 avg ticket",
    revenue: "~$605,000",
    margin: "After overhead: 42–48%",
    profit: "$254,000 – $290,000",
    note: "Fully booked most weeks. Exploring 2nd OC location or franchise licensing.",
    highlight: false,
  },
] as const;

export const BP_CAPACITY = {
  maxPerDay: 4,
  daysPerWeek: 6,
  maxPerWeek: 24,
  maxPerYear: 1248,
  realisticCapacity: 0.75,
  realisticPerYear: 936,
  note: "6 days/week Mon–Sat, 4 sessions/day (60 min + 15 min reset). At 75% capacity = 936 sessions/year.",
};

/**
 * Revenue growth scenarios (Years 1–3) for charts + capacity modeling.
 * Baseline = single photographer / sequential sessions.
 * Scaled = 4 sets running in parallel with multiple photographers.
 *
 * Math anchors (75-min blocks, 8-hour studio day ≈ 6 blocks/photographer):
 * - 1 photog × 4 sessions/day × 6 days × 50 wks × 75% ≈ 900 sessions/yr
 * - 4 photogs × 4 concurrent lanes × same cadence × 75% ≈ 3,600 sessions/yr
 */
export const BP_REVENUE_GROWTH = {
  years: ["Year 1", "Year 2", "Year 3"] as const,
  assumptions: [
    "60-min max shoot + 15-min reset (75-min calendar block)",
    "Avg ticket rises with siblings, both-books, and light print upsells",
    "Baseline: 1 photographer, sessions run mostly one family at a time",
    "Scaled: 4 kingdom sets live at once + multiple photographers (parallel lanes)",
  ],
  baseline: [
    {
      year: "Year 1",
      sessions: 540,
      avgTicket: 420,
      revenue: 226800,
      photographers: 1,
      parallelSets: 1,
      note: "Soft launch · 2–3 sessions/day · building demand",
    },
    {
      year: "Year 2",
      sessions: 900,
      avgTicket: 480,
      revenue: 432000,
      photographers: 1,
      parallelSets: 1,
      note: "Full schedule · ~75% of single-lane capacity",
    },
    {
      year: "Year 3",
      sessions: 1100,
      avgTicket: 550,
      revenue: 605000,
      photographers: 2,
      parallelSets: 1,
      note: "Near full single-lane book · 2nd photog for coverage",
    },
  ],
  scaled: [
    {
      year: "Year 1",
      sessions: 1200,
      avgTicket: 450,
      revenue: 540000,
      photographers: 2,
      parallelSets: 2,
      note: "Early multi-set ops · 2 parallel lanes ramping",
    },
    {
      year: "Year 2",
      sessions: 2400,
      avgTicket: 520,
      revenue: 1248000,
      photographers: 3,
      parallelSets: 3,
      note: "3 sets concurrent · multi-photographer team",
    },
    {
      year: "Year 3",
      sessions: 3600,
      avgTicket: 600,
      revenue: 2160000,
      photographers: 4,
      parallelSets: 4,
      note: "4 sets running at once · full parallel studio",
    },
  ],
  capacityCeiling: {
    title: "Theoretical ceiling (4 parallel lanes)",
    photographers: 4,
    parallelSets: 4,
    sessionsPerDayPerLane: 4,
    daysPerWeek: 6,
    weeksPerYear: 50,
    utilization: 0.75,
    sessionsPerYear: 3600,
    atTicket550: 1980000,
    atTicket650: 2340000,
    atTicket800: 2880000,
    formula:
      "4 lanes × 4 sessions/day × 6 days × 50 weeks × 75% utilization = ~3,600 sessions/year",
  },
};

/**
 * Session timing standard — all packages (solo, sibling, family) stay inside 1 hour.
 * Many families bring siblings; design the shoot as one family session, not stacked solos.
 */
export const BP_SESSION_TIMING = {
  maxMinutes: 60,
  resetMinutes: 15,
  blockMinutes: 75,
  rule: "1 hour max per shoot — including siblings",
  principle:
    "Treat multi-child bookings as one family session in a single 60-minute window, not two full solos back-to-back. Kids and parents usually peak in the first 45–60 minutes.",
  flow: [
    { minutes: "0–10", step: "Arrive, costumes, crowns, warm-up" },
    { minutes: "10–30", step: "Kid 1 hero shots (2 sets max)" },
    { minutes: "30–45", step: "Kid 2 hero shots (same 2 sets)" },
    { minutes: "45–55", step: "Sibling together shots" },
    { minutes: "55–60", step: "Quick wrap / optional parent shot" },
  ],
  rules: [
    "Max 2–3 sets per session (even if marketing shows 4)",
    "Pre-select outfits before arrival",
    "One assistant for costume changes while photographer shoots",
    "Sibling package = same hour, not +30 minutes free",
    "Family of 3+ keeps the same 60-minute window with a tighter shot list",
  ],
  packaging:
    "Solo / Sibling / Family: 60-minute kingdom session. Additional children included in the same session window.",
};

/**
 * Average customer spend — competitor pressure model vs our transparent ticket.
 * Many families bring siblings; ticket grows with package mix + light add-ons.
 */
export const BP_AVG_CUSTOMER_SPEND = {
  competitorAvg: 1300,
  competitorRange: "$1,000–$3,000+",
  competitorNote:
    "Enchanted Fairies-style studios often average ~$1,300 per family after a high-pressure ordering appointment (storybook often $3,000+ extra).",
  ourTargetAvg: 650,
  ourRange: "$450–$900 typical · path to $1,000+ with prints",
  ourNote:
    "Transparent packages + sibling scale + optional prints. Win trust first; grow average without bait-and-switch.",
  mix: [
    { label: "Solo / single book", share: "≈40%", ticket: "$299–$349" },
    { label: "Both books / stronger package", share: "≈20%", ticket: "≈$499" },
    { label: "Sibling (2 kids)", share: "≈30%", ticket: "≈$549" },
    { label: "Family (3 kids)", share: "≈10%", ticket: "≈$849" },
  ],
  withAddOns: [
    { stage: "Core package average (siblings common)", amount: "$450–$650" },
    { stage: "With digital + light print upsells", amount: "$700–$1,000" },
    { stage: "Competitor-style pressure average", amount: "~$1,300" },
  ],
  strategy: [
    "Do not copy their $1,300 via surprise sales",
    "Raise average naturally: sibling/family packages, Royal Collection (both books), 1–2 high-margin prints, digital download",
    "Position: families happily pay $500–$900+ without feeling tricked — room to grow toward $1,000+ cleanly",
  ],
};

export const BP_STARTUP_COSTS = {
  oneTime: [
    { item: "Studio build-out (4 enchanted sets)", low: 40000, high: 80000 },
    { item: "Lighting & camera equipment", low: 8000, high: 15000 },
    { item: "Props, costumes, sets", low: 10000, high: 20000 },
    { item: "Signage & branding", low: 3000, high: 5000 },
    { item: "Tech setup (computers, software, AI tools)", low: 3000, high: 5000 },
    { item: "Initial marketing & launch", low: 5000, high: 10000 },
  ],
  totalLow: 69000,
  totalHigh: 135000,
  monthly: [
    { item: "Rent (1,500–2,000 sqft OC)", low: 4000, high: 7000 },
    { item: "Staff (2–3 part-time)", low: 4000, high: 6000 },
    { item: "Utilities & internet", low: 400, high: 600 },
    { item: "Insurance", low: 300, high: 500 },
    { item: "Marketing (ads, social)", low: 2000, high: 3000 },
    { item: "Software & subscriptions", low: 200, high: 400 },
  ],
  monthlyTotalLow: 10900,
  monthlyTotalHigh: 17500,
  breakEvenSessions: 55,
  breakEvenNote: "At ~55 sessions/month (2–3/day, 5 days/week) you cover all overhead. Achievable by Month 3–6.",
};

export const BP_COMPETITOR_PRICING = {
  competitor: {
    name: "Enchanted Fairies (Competitor)",
    note: "High-end fantasy portrait studio",
    pricingModel: "No transparent pricing. Clients spend $1,000–$3,000+ at a surprise 'Ordering appointment' after the shoot. Some $10,000+. High-pressure sales. Storybook starts at $3,000.",
    theirQuote: "Most clients invest $1,000–$3,000. Ask how to save 50% at your Ordering appointment.",
    realReviews: [
      { source: "Lemon8 review", quote: "I won a session, but ended up paying $1,000 for just 4 digital images." },
      { source: "Yelp review", quote: "$9K for the best package, $4K for the lower package. $400 for two 8x10s." },
      { source: "Reddit review", quote: "Paid $25 to schedule the 'free' session. Felt like a scam." },
      { source: "TikTok", quote: "Photo packages started at $2,500." },
    ],
    verdict: "Bait-and-switch model. 'Free' session = high-pressure sales appointment. Real spend: $1,000–$9,000+ after showing up.",
    items: [
      { product: "1st 8x10 Portrait", price: "FREE with special", us: null },
      { product: "8x10 Portrait", price: "$200", us: null },
      { product: "11x14 Portrait", price: "$600", us: "$600" },
      { product: "16x20 Portrait", price: "$975", us: "$975" },
      { product: "24x30 Portrait", price: "$1,650", us: "$1,650" },
      { product: "30x40 Portrait", price: "$2,650", us: "$2,650" },
      { product: "Digital Image", price: "$500", us: "$500" },
      { product: "Kingdom Chronicles", price: "Starts at $3,000", us: "INCLUDED in packages" },
      { product: "MP4 Digital Slideshow", price: "$1,400", us: "$299 (animated video)" },
      { product: "Session / Package", price: "Unknown — add-on model", us: "$299–$799 all-in" },
    ],
  },
  ourAdvantages: [
    "Storybook INCLUDED in package — competitor charges $3,000+ extra",
    "Transparent all-in pricing vs surprise add-on model",
    "AI-personalized illustrations unique to each child",
    "6 different adventure paths — competitor only offers one theme",
    "Digital share link + PDF included — competitor charges $500/digital",
    "Per-child book model scales with families (Sibling/Family packages)",
    "Animated video at $299 vs competitor's $1,400 slideshow",
    "Same print pricing (8x10–30x40) = competitive on wall art",
  ],
};


export const BP_COST_BREAKDOWN = {
  perSession: {
    title: "Cost Per Session (Solo Quest)",
    items: [
      { label: "Your time (60 min @ $175/hr)", cost: 175, note: "Opportunity cost" },
      { label: "Staff assist (if applicable)", cost: 25, note: "Part-time help" },
      { label: "Set overhead (amortized)", cost: 20, note: "Props, costumes, maintenance" },
      { label: "Mpix 8x8 hardcover book", cost: 32, note: "Printed and shipped" },
      { label: "AI generation (Imagen/Grok/fal)", cost: 2, note: "~$0.50–$3 per book" },
      { label: "Processing & admin (15 min)", cost: 10, note: "Post-session work" },
      { label: "Marketing (per session avg)", cost: 15, note: "Ads, social, referrals" },
    ],
    totalCost: 279,
  },
  packages: [
    {
      name: "Solo Quest",
      price: 349,
      cost: 279,
      margin: 70,
      pct: 20,
      sessions: { daily: [1, 2, 3], revenue: [349, 698, 1047] },
    },
    {
      name: "Sibling Quest",
      price: 549,
      cost: 340, // extra time + 2nd book
      margin: 209,
      pct: 38,
    },
    {
      name: "Family Quest",
      price: 849,
      cost: 415, // 90 min + 3 books
      margin: 434,
      pct: 51,
    },
  ],
  monthly: {
    conservative: { sessions: 15, avgTicket: 380, revenue: 5700, margin: 2280 },
    moderate: { sessions: 25, avgTicket: 420, revenue: 10500, margin: 4200 },
    strong: { sessions: 40, avgTicket: 480, revenue: 19200, margin: 7680 },
  },
  addOnMargins: [
    { product: "Digital download (no watermark)", price: 49, cost: 0, margin: 49, note: "Pure software — zero cost" },
    { product: "Digital + extra printed copy", price: 79, cost: 32, margin: 47, note: "Combo upsell" },
    { product: "Extra printed hardcover", price: 45, cost: 32, margin: 13, note: "Mpix cost" },
    { product: "Animated video (coming soon)", price: 299, cost: 5, margin: 294, note: "Pure margin" },
    { product: "Rush processing", price: 75, cost: 5, margin: 70, note: "Time premium" },
    { product: "8x10 portrait print", price: 200, cost: 35, margin: 165, note: "High margin wall art" },
    { product: "16x20 portrait print", price: 975, cost: 80, margin: 895, note: "Best margin add-on" },
  ],
  digitalPolicy: {
    shareLink: "FREE — included with every session. Watermarked preview. Parents share with family/friends → organic marketing.",
    downloadFee: "$49 — full PDF, no watermark. Pure software revenue. ~$0 cost.",
    combo: "$79 — download + one extra printed copy.",
    philosophy: "Physical book = the heirloom product. Digital share link = the marketing engine. Paid download = bonus revenue.",
    projectedUptake: "Estimate 30-40% of families purchase digital download. At 50 sessions/month = $735-980 additional monthly revenue.",
  },
};



/**
 * Full P&L capacity scenarios — Small vs Large studio.
 * Annual view: Revenue, COGS, Gross Margin, OpEx, Net.
 *
 * COGS per session (cash, excludes owner opportunity cost):
 *   books/print ~$45 blended, AI ~$2, set consumables ~$8, payment fees ~3% of ticket
 * Variable marketing tracked in OpEx (ads) rather than COGS for clarity.
 */
export const BP_PNL_SCENARIOS = {
  assumptions: [
    "60-min max shoot + 15-min reset; siblings included in same hour",
    "Avg ticket includes package mix + light digital/print attach",
    "COGS = books, AI, consumables, payment processing (cash costs only)",
    "Owner draw / opportunity cost is NOT in OpEx (shown separately as note)",
    "Small = 1 photographer lane · Large = up to 4 parallel set lanes",
    "Birthday party revenue included as modest weekend add-on in each model",
  ],
  cogsPerSession: {
    bookPrintBlended: 45,
    ai: 2,
    consumables: 8,
    paymentFeeRate: 0.03,
    note: "Blended hardcover + packaging; AI generation; crowns/props wear; ~3% card fees on ticket",
  },
  small: {
    id: "small",
    name: "Small Capacity",
    subtitle: "1 photographer · 1 family at a time · Phase 1 studio",
    photographers: 1,
    parallelLanes: 1,
    sessionsPerYear: 540,
    avgTicket: 520,
    birthdayPartiesPerYear: 36,
    birthdayAvgTicket: 750,
    expenses: [
      { label: "Rent", annual: 60000 },
      { label: "Staff / assistants", annual: 36000 },
      { label: "Marketing & ads", annual: 30000 },
      { label: "Insurance", annual: 4800 },
      { label: "Utilities & internet", annual: 6000 },
      { label: "Software & AI tools", annual: 3600 },
      { label: "Maintenance / props refresh", annual: 6000 },
      { label: "Misc / admin", annual: 4800 },
    ],
  },
  large: {
    id: "large",
    name: "Large Capacity",
    subtitle: "4 sets concurrent · multi-photographer team",
    photographers: 4,
    parallelLanes: 4,
    sessionsPerYear: 3600,
    avgTicket: 600,
    birthdayPartiesPerYear: 100,
    birthdayAvgTicket: 950,
    expenses: [
      { label: "Rent (larger / dedicated)", annual: 96000 },
      { label: "Photographers & staff", annual: 280000 },
      { label: "Marketing & ads", annual: 90000 },
      { label: "Insurance", annual: 12000 },
      { label: "Utilities & internet", annual: 12000 },
      { label: "Software & AI tools", annual: 12000 },
      { label: "Maintenance / props / costumes", annual: 24000 },
      { label: "Misc / admin / accounting", annual: 18000 },
    ],
  },
} as const;

export type BpPnlScenarioInput = typeof BP_PNL_SCENARIOS.small | typeof BP_PNL_SCENARIOS.large;

export function computeBpPnl(scenario: {
  sessionsPerYear: number;
  avgTicket: number;
  birthdayPartiesPerYear: number;
  birthdayAvgTicket: number;
  expenses: readonly { label: string; annual: number }[];
}) {
  const cogs = BP_PNL_SCENARIOS.cogsPerSession;
  const sessionRevenue = scenario.sessionsPerYear * scenario.avgTicket;
  const birthdayRevenue =
    scenario.birthdayPartiesPerYear * scenario.birthdayAvgTicket;
  const revenue = sessionRevenue + birthdayRevenue;

  const sessionCogsUnit =
    cogs.bookPrintBlended +
    cogs.ai +
    cogs.consumables +
    scenario.avgTicket * cogs.paymentFeeRate;
  const birthdayCogsUnit =
    60 + // party supplies / simple setup
    scenario.birthdayAvgTicket * cogs.paymentFeeRate +
    40; // optional mini book / prints blend

  const cogsSessions = scenario.sessionsPerYear * sessionCogsUnit;
  const cogsBirthdays = scenario.birthdayPartiesPerYear * birthdayCogsUnit;
  const cogsTotal = cogsSessions + cogsBirthdays;
  const grossProfit = revenue - cogsTotal;
  const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const opex = scenario.expenses.reduce((sum, e) => sum + e.annual, 0);
  const net = grossProfit - opex;
  const netMarginPct = revenue > 0 ? (net / revenue) * 100 : 0;

  return {
    sessionRevenue,
    birthdayRevenue,
    revenue,
    sessionCogsUnit,
    birthdayCogsUnit,
    cogsSessions,
    cogsBirthdays,
    cogsTotal,
    grossProfit,
    grossMarginPct,
    opex,
    net,
    netMarginPct,
    expenses: scenario.expenses,
  };
}

/**
 * Pre-launch proforma — what we need to know before we start.
 * Startup capital, monthly ramp Year 1, annual Y1–Y3, break-even, cash buffer.
 */
export const BP_PROFORMA = {
  purpose:
    "Planning proforma before launch: capital to open, monthly ramp, Year 1–3 P&L, break-even sessions, and cash buffer so we know the number before we start.",
  startupUses: [
    { item: "Studio build-out (kingdom sets)", mid: 60000, note: "Throne / forest / garden / castle sets" },
    { item: "Lighting & camera", mid: 12000, note: "Primary + backup kit" },
    { item: "Props, costumes, crowns", mid: 15000, note: "Child sizes + refresh stock" },
    { item: "Signage & branding", mid: 4000, note: "Exterior + in-studio" },
    { item: "Tech / computers / AI tools", mid: 4000, note: "Editing + generator stack" },
    { item: "Launch marketing", mid: 8000, note: "Ads, soft, partnerships" },
    { item: "Deposits, legal, insurance setup", mid: 7000, note: "Lease deposit, LLC, policies" },
    { item: "Opening inventory / supplies", mid: 3000, note: "Packaging, books buffer" },
  ],
  workingCapital: {
    monthsOpExReserve: 3,
    monthlyOpExMid: 14000,
    reserve: 42000,
    note: "3 months operating expenses as cash buffer before volume stabilizes",
  },
  totalCapitalNeededMid: 155000,
  capitalRange: { low: 120000, high: 200000 },
  capitalNote:
    "Mid case ~$155K = ~$113K one-time build/launch + ~$42K working capital. Raise/save enough to open without living session-to-session.",
  year1MonthlyRamp: [
    { month: "M1", sessions: 8, avgTicket: 450, birthdayParties: 0, note: "Soft open / friends & family" },
    { month: "M2", sessions: 12, avgTicket: 470, birthdayParties: 1, note: "Local ads live" },
    { month: "M3", sessions: 16, avgTicket: 490, birthdayParties: 1, note: "Referrals starting" },
    { month: "M4", sessions: 20, avgTicket: 500, birthdayParties: 2, note: "Weekend birthdays begin" },
    { month: "M5", sessions: 24, avgTicket: 510, birthdayParties: 2, note: "Toward break-even pace" },
    { month: "M6", sessions: 28, avgTicket: 520, birthdayParties: 3, note: "Break-even zone" },
    { month: "M7", sessions: 32, avgTicket: 530, birthdayParties: 3, note: "Steady marketing" },
    { month: "M8", sessions: 36, avgTicket: 540, birthdayParties: 3, note: "Church / mom groups" },
    { month: "M9", sessions: 40, avgTicket: 550, birthdayParties: 4, note: "Holiday interest" },
    { month: "M10", sessions: 42, avgTicket: 560, birthdayParties: 4, note: "Peak season prep" },
    { month: "M11", sessions: 45, avgTicket: 570, birthdayParties: 4, note: "Holiday bookings" },
    { month: "M12", sessions: 48, avgTicket: 580, birthdayParties: 5, note: "Strong close" },
  ],
  birthdayAvgTicket: 750,
  monthlyFixedOpEx: [
    { label: "Rent", amount: 5000 },
    { label: "Staff / assist", amount: 3500 },
    { label: "Marketing", amount: 2500 },
    { label: "Insurance", amount: 400 },
    { label: "Utilities", amount: 500 },
    { label: "Software / AI", amount: 300 },
    { label: "Maintenance / misc", amount: 800 },
  ],
  annualYears: [
    {
      year: "Year 1",
      sessions: 351,
      avgTicket: 530,
      birthdayParties: 32,
      birthdayAvgTicket: 750,
      opex: 156000,
      note: "Ramp year — not full capacity. Prove product + local demand.",
    },
    {
      year: "Year 2",
      sessions: 720,
      avgTicket: 560,
      birthdayParties: 48,
      birthdayAvgTicket: 800,
      opex: 180000,
      note: "Full schedule developing. 2nd part-time help. Birthdays steady.",
    },
    {
      year: "Year 3",
      sessions: 960,
      avgTicket: 600,
      birthdayParties: 60,
      birthdayAvgTicket: 850,
      opex: 210000,
      note: "Near single-lane capacity. Option to add parallel sets / 2nd photog.",
    },
  ],
  breakEven: {
    monthlyFixedMid: 13000,
    contributionPerSession: 450,
    sessionsPerMonth: 29,
    note: "Roughly ~29 sessions/month at ~$520 ticket (~$450 contribution after COGS) covers ~$13K fixed OpEx. Target by Month 5–7.",
  },
  goNoGo: [
    "Capital ready: mid ~$155K (or phased open with lower set build)",
    "Location locked with parking + kid-friendly access",
    "1 complete sample book + portrait workflow proven",
    "Booking site + packages live; calendar can take deposits",
    "3-month cash reserve still in bank after build-out",
    "Owner can run sessions 3–4 days/week for first 6 months",
  ],
} as const;

export function computeProformaMonth(input: {
  sessions: number;
  avgTicket: number;
  birthdayParties: number;
  birthdayAvgTicket: number;
  fixedOpex: number;
}) {
  const cogs = BP_PNL_SCENARIOS.cogsPerSession;
  const sessionRevenue = input.sessions * input.avgTicket;
  const birthdayRevenue = input.birthdayParties * input.birthdayAvgTicket;
  const revenue = sessionRevenue + birthdayRevenue;
  const sessionCogs =
    input.sessions *
    (cogs.bookPrintBlended +
      cogs.ai +
      cogs.consumables +
      input.avgTicket * cogs.paymentFeeRate);
  const birthdayCogs =
    input.birthdayParties *
    (60 + input.birthdayAvgTicket * cogs.paymentFeeRate + 40);
  const cogsTotal = sessionCogs + birthdayCogs;
  const gross = revenue - cogsTotal;
  const net = gross - input.fixedOpex;
  return {
    sessionRevenue,
    birthdayRevenue,
    revenue,
    cogsTotal,
    gross,
    fixedOpex: input.fixedOpex,
    net,
  };
}

export function computeProformaYear(input: {
  sessions: number;
  avgTicket: number;
  birthdayParties: number;
  birthdayAvgTicket: number;
  opex: number;
}) {
  return computeProformaMonth({
    sessions: input.sessions,
    avgTicket: input.avgTicket,
    birthdayParties: input.birthdayParties,
    birthdayAvgTicket: input.birthdayAvgTicket,
    fixedOpex: input.opex,
  });
}


/**
 * One-store target: can a single retail location clear $300K net?
 * Answer: YES — but not on a soft 45 sessions/mo model. Needs strong volume
 * (multi-set / 2nd photog throughput) or higher ticket + parties.
 */
export const BP_ONE_STORE_300K = {
  question: "Can one store make at least $300K net?",
  answer: "Yes — with roughly 70–80 photo sessions per month (or slightly fewer at a higher ticket), plus a real birthday program, and fixed OpEx held near ~$17–20K/month.",
  notEnough: {
    label: "Soft retail steady (not enough)",
    sessionsPerMonth: 45,
    avgTicket: 560,
    partiesPerMonth: 6,
    partyTicket: 850,
    annualOpex: 207600,
    approxNet: 108000,
    note: "Healthy business, but ~$100K net — short of $300K.",
  },
  target: {
    label: "One-store $300K net path",
    sessionsPerMonth: 78,
    sessionsPerYear: 936,
    avgTicket: 560,
    partiesPerMonth: 6,
    partiesPerYear: 72,
    partyTicket: 850,
    annualOpex: 207600,
    approxRevenue: 584000,
    approxNet: 300000,
    note: "Same OpEx as retail model; volume is the lever. ~78 sessions/mo is multi-set / 2-photographer territory — not office-beta sequential.",
  },
  levers: [
    { lever: "Volume", detail: "~75–80 sessions/mo at ~$560, or ~67/mo at ~$650" },
    { lever: "Parallel capacity", detail: "Retail multi-set + 2nd photographer — office scene-swaps cannot hit this alone" },
    { lever: "Ticket", detail: "Sibling mix, both-books, light prints — every $50 of avg ticket lowers required volume" },
    { lever: "Birthdays", detail: "Kitchen parties add high-margin weekend revenue on top of sessions" },
    { lever: "OpEx control", detail: "Rent/staff discipline; if fixed costs jump to $25K+/mo, $300K net gets much harder" },
  ],
  paths: [
    {
      name: "Volume path",
      sessionsPerMonth: 78,
      ticket: 560,
      partiesPerMonth: 6,
      opexAnnual: 208000,
      net: 300000,
      requires: "2 sets standing + often 2 shooters or very full single-lane days",
    },
    {
      name: "Higher-ticket path",
      sessionsPerMonth: 67,
      ticket: 650,
      partiesPerMonth: 6,
      opexAnnual: 220000,
      net: 300000,
      requires: "Strong sibling/family mix + print attach",
    },
    {
      name: "Party-assisted path",
      sessionsPerMonth: 70,
      ticket: 580,
      partiesPerMonth: 10,
      opexAnnual: 230000,
      net: 300000,
      requires: "Kitchen busy on weekends + solid weekday sessions",
    },
  ],
  verdict:
    "One retail store can clear $300K net. Plan for ~$550–650K revenue and ~75 sessions/month-class throughput (or equivalent mix). Do not expect $300K net from office beta or a half-full single-lane calendar.",
} as const;

/**
 * Phase 1 office beta strategy — product proof + CAC discovery.
 * The critical unknown is ad cost to acquire a paying family.
 */
export const BP_BETA_STRATEGY = {
  purpose:
    "Office beta exists to prove two things before a retail lease: (1) product/session quality, (2) paid acquisition CAC — what it costs to get a paying client.",
  pillars: [
    {
      title: "Product proof",
      detail:
        "One main set with scene swaps. 3–10 real sessions. Confirm 60-minute flow (including siblings), gift-worthy books, and transparent package pricing parents accept.",
    },
    {
      title: "CAC discovery (critical unknown)",
      detail:
        "Run real ads against a real offer after beta creative exists. Learn cost per deposited/paid session — not likes or clicks. This number decides whether scaling is profitable.",
    },
    {
      title: "Ops learning",
      detail:
        "Sequential sessions only at the office. Document SOPs, show rate, rework rate, and fulfillment time before multi-set retail volume.",
    },
  ],
  cacTest: {
    title: "Beta CAC ad test",
    why: "Marketing ability is strong; the unknown is conversion cost. Beta + ads answers it cheaply.",
    budget: "$1,500–$3,000 learning budget (or $50–$150/day for 2–3 weeks)",
    offer: "Clear kingdom session + storybook offer with transparent pricing / from-price. Deposit required.",
    creative: "Real beta kids/sessions only — no fake stock once tests start",
    channels: ["Meta local (primary)", "Warm/organic baseline for comparison", "Optional Google/local search"],
    track: [
      "Ad spend",
      "Leads",
      "Booked sessions",
      "Show-ups",
      "Paying families (deposited/paid)",
      "Average ticket",
      "CAC = ad spend ÷ paying families",
      "Ticket ÷ CAC payback signal",
    ],
    targets: [
      { band: "<$75 CAC", read: "Excellent — scale aggressively once ops ready" },
      { band: "$75–$150 CAC", read: "Strong / scalable for this model" },
      { band: "$150–$250 CAC", read: "Workable if ticket/siblings/add-ons strong" },
      { band: "$250–$350 CAC", read: "Tight — improve offer/creative before retail bet" },
      { band: ">$350 CAC", read: "Do not scale spend; fix funnel or offer first" },
    ],
    ruleOfThumb:
      "Aim for CAC under ~25–30% of average ticket early. Example: $560 ticket → keep CAC ideally ≤ $150–170, better near $100–120.",
  },
  scorecard: [
    { metric: "CAC to paid session", target: "Discover real number; green if ≤ $150 (stretch ≤ $120)" },
    { metric: "Average ticket", target: "≥ $480 (path to $520–$560+)" },
    { metric: "Show rate", target: "≥ 85–90% of booked" },
    { metric: "Book quality / rework", target: "< 15% major redo" },
    { metric: "Sibling session time", target: "Complete in 60 minutes" },
    { metric: "Sessions/month (organic+paid)", target: "≥ 12–16 before retail conversation hardens" },
  ],
  sequence: [
    "Build one main office set (scene-swap capable)",
    "Run 3–5 private/friends-family sessions → sample books + ad creative",
    "Lock landing page + booking + deposit",
    "Launch $1.5–3K CAC ad test",
    "Review scorecard weekly",
    "Only then model retail lease against proven CAC + ticket",
  ],
  decisionRule:
    "If CAC is healthy and product quality holds, marketing can fill a retail store. If CAC is ugly, do not lease — fix offer/funnel first. Beta is for learning CAC and product, not for forcing $300K-net volume.",
} as const;




export const BP_EXECUTIVE_SUMMARY =
  "Storybook Photos (Kingdom Quests) is a premium fantasy photo studio in Costa Mesa offering kingdom-themed photo sessions for children and families. Clients dress as kings, queens, and royalty and are photographed in custom-built sets. Every session includes the option of a personalized AI-assisted Kingdom Chronicles where the child is the hero of their own adventure.";
