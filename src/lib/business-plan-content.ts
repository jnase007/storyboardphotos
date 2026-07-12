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
  "High-margin upsells: fine art prints, digital files, and Kingdom Chronicless (starting at $3,000)",
  "Digital-only storybooks for instant high-margin revenue",
] as const;

export const BP_GROWTH = [
  "Instagram + local Christian mom groups marketing",
  "Church partnerships",
  "AI-powered fast digital storybooks",
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
    role: "Optional luxury lay-flat Kingdom Chronicless for premium upgrades",
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
    purpose: "Consistent character illustrations",
    provider: "fal.ai Flux (best)",
    cost: "$0.30 – $1.20",
  },
  {
    api: "Story Generation",
    purpose: "Personalized kingdom story",
    provider: "Grok API or Claude",
    cost: "<$0.10",
  },
  {
    api: "Storage & Database",
    purpose: "Photos + generated files",
    provider: "Supabase (already set up)",
    cost: "Free — very low",
  },
] as const;

export const BP_STORYBOOK_AI_COST_TOTAL =
  "Total estimated AI cost per book: $0.50 – $2.00 (very cheap)";

export const BP_FULFILLMENT_PROCESS = [
  "AI-generated personalized story + consistent character illustrations (fal.ai Flux + Grok/Claude)",
  "Human editing & curation",
  "Professional printing via Mpix on archival paper / hardcover photo books",
  "Digital PDF delivery option for instant high-margin revenue",
] as const;

export const BP_PHASE_TWO = [
  {
    title: "Prove the model first",
    detail:
      "Once we know the studio business works — sessions, storybooks, and margins — we reinvest profits into a permanent home of our own.",
  },
  {
    title: "Own or lease our space",
    detail:
      "Rent or buy a dedicated location so we are no longer limited by a beta / shared setup, with room to grow sets, staff, and session capacity.",
  },
  {
    title: "Enchanted tea house attached",
    detail:
      "Connect a kitchen-equipped tea house to the studio — an enchanted gathering space for weekend birthday parties, celebrations, and family events that extend the kingdom experience beyond the photo session.",
  },
] as const;

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
      { label: "AI generation (Gemini)", cost: 1, note: "~$0.50-1 per book" },
      { label: "Processing & admin (15 min)", cost: 10, note: "Post-session work" },
      { label: "Marketing (per session avg)", cost: 15, note: "Ads, social, referrals" },
    ],
    totalCost: 278,
  },
  packages: [
    {
      name: "Solo Quest",
      price: 349,
      cost: 278,
      margin: 71,
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


export const BP_EXECUTIVE_SUMMARY =
  "Storybook Photos (Kingdom Quests) is a premium fantasy photo studio in Costa Mesa offering kingdom-themed photo sessions for children and families. Clients dress as kings, queens, and royalty and are photographed in custom-built sets. Every session includes the option of a personalized AI-assisted Kingdom Chronicles where the child is the hero of their own adventure.";
