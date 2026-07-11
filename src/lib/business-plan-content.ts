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
  "High-margin upsells: fine art prints, digital files, and Heirloom Storybooks (starting at $3,000)",
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
    role: "Optional luxury lay-flat heirloom storybooks for premium upgrades",
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
 * Conservative projections: Year 1 builds awareness slowly.
 * Avg ticket assumes session fee + some print/digital upsells;
 * full $3k+ storybook conversion is upside, not the base case.
 */
export const BP_PROJECTIONS = [
  {
    year: "Year 1",
    sessions: "3–5 sessions/week average (≈ 160–250 sessions)",
    avg: "$1,800 – $2,200",
    revenue: "~$320,000 – $500,000",
    margin: "Gross Margin: 65–75%",
    profit: "$80,000 – $160,000",
    highlight: false,
  },
  {
    year: "Year 2",
    sessions: "6–8 sessions/week (≈ 310–400 sessions)",
    avg: "$2,000 – $2,400",
    revenue: "~$650,000 – $900,000",
    margin: null as string | null,
    profit: "$220,000 – $350,000",
    highlight: true,
  },
  {
    year: "Year 3",
    sessions: "10–12 sessions/week (≈ 500–600 sessions)",
    avg: "$2,200 – $2,600",
    revenue: "~$1.1 – $1.5 million",
    margin: null as string | null,
    profit: "$400,000 – $600,000",
    highlight: false,
  },
] as const;

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
      { product: "Heirloom Storybook", price: "Starts at $3,000", us: "INCLUDED in packages" },
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


export const BP_EXECUTIVE_SUMMARY =
  "Storybook Photos (Kingdom Quests) is a premium fantasy photo studio in Costa Mesa offering kingdom-themed photo sessions for children and families. Clients dress as kings, queens, and royalty and are photographed in custom-built sets. Every session includes the option of a personalized AI-assisted heirloom storybook where the child is the hero of their own adventure.";
