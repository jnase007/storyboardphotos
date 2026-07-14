export const SITE = {
  name: "Storybook Photos",
  subtitle: "Kings & Queens",
  domain: "www.storybookphotos.com",
  url: "https://www.storybookphotos.com",
  tagline: "Remind Your Child They Are Royalty",
  description:
    "Kingdom-themed kids photo studio in Costa Mesa, CA. Magical royal photo shoots and personalized Kingdom Chronicles storybooks that help children feel brave, beloved, and full of wonder.",
  location: "Costa Mesa, CA",
  email: "hello@storybookphotos.com",
  phone: "(949) 637-2226",
  address: "3525 Hyland Ave, Suite 235, Costa Mesa, CA 92626",
  social: [] as string[],
} as const;

export const SEO_KEYWORDS = [
  "storybook photos",
  "kids photo studio Costa Mesa",
  "children photography Orange County",
  "kingdom photo shoot",
  "personalized children's storybook",
  "Kingdom Chronicles",
  "royal kids photos",
  "fantasy photo studio",
  "family photography Costa Mesa",
  "children portrait studio Orange County",
  "storybook photo session",
] as const;

export const NAV_LINKS = [
  { href: "/experience", label: "The Experience" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/kingdom-sets", label: "Kingdom Sets" },
  { href: "/storybooks", label: "Storybooks" },
  { href: "/pricing", label: "Pricing" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQ" },
] as const;

export const LOCAL_PAGES = [
  {
    href: "/kids-photographer-costa-mesa",
    label: "Kids Photographer Costa Mesa",
    navLabel: "Kids Photographer in Costa Mesa",
    priority: 0.9,
  },
  {
    href: "/children-photography-orange-county",
    label: "Children Photography Orange County",
    navLabel: "Children Photography in Orange County",
    priority: 0.85,
  },
  {
    href: "/storybook-photo-session",
    label: "Storybook Photo Session",
    navLabel: "Storybook Photo Sessions",
    priority: 0.85,
  },
] as const;

export const SITE_PAGES = [
  { href: "/", label: "Home", priority: 1 },
  { href: "/experience", label: "The Experience", priority: 0.9 },
  { href: "/how-it-works", label: "How It Works", priority: 0.8 },
  { href: "/kingdom-sets", label: "Kingdom Sets", priority: 0.9 },
  { href: "/storybooks", label: "Storybooks", priority: 0.9 },
  { href: "/pricing", label: "Pricing", priority: 0.9 },
  { href: "/testimonials", label: "Testimonials", priority: 0.7 },
  { href: "/faq", label: "FAQ", priority: 0.7 },
  { href: "/book", label: "Book Your Session", priority: 1 },
  ...LOCAL_PAGES.map((page) => ({
    href: page.href,
    label: page.label,
    priority: page.priority,
  })),
  { href: "/privacy", label: "Privacy Policy", priority: 0.3 },
  { href: "/terms", label: "Terms of Service", priority: 0.3 },
] as const;

/** Core themes woven through the experience */
export const IDENTITY_TRUTHS = [
  {
    title: "Born for Wonder",
    label: "Belonging",
    description:
      "Every child deserves to feel special. Our sessions celebrate their unique spark with joy and care.",
  },
  {
    title: "Royal at Heart",
    label: "Dignity",
    description:
      "Crowns, costumes, and kingdom sets help kids stand taller — and see themselves as brave and beloved.",
  },
  {
    title: "Deeply Loved",
    label: "Confidence",
    description:
      "Self-esteem grows when children feel seen. We create memories that remind them they matter.",
  },
  {
    title: "Made for Adventure",
    label: "Purpose",
    description:
      "Each storybook affirms that your child's life is full of courage, meaning, and possibility.",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Choose Your Quest",
    description:
      "Select a package that fits your family — from a single royal portrait to a full kingdom experience with a Kingdom Chronicles.",
    icon: "Crown" as const,
  },
  {
    step: 2,
    title: "Book Your Session",
    description:
      "Share a few simple details — names, ages, and anything we should know about your child. We guide the rest.",
    icon: "Sparkles" as const,
  },
  {
    step: 3,
    title: "The Royal Session",
    description:
      "In our Costa Mesa studio, costumes, sets, and patient photographers help your child step into their royal adventure with joy and confidence.",
    icon: "Camera" as const,
  },
  {
    step: 4,
    title: "Craft Your Storybook",
    description:
      "We create a Kingdom Chronicles where your child is the hero — loved, brave, and made for adventure.",
    icon: "BookOpen" as const,
  },
  {
    step: 5,
    title: "Receive Your Heirloom",
    description:
      "A premium printed storybook arrives at your door — a keepsake that builds lasting confidence and wonder.",
    icon: "Gift" as const,
  },
] as const;

export const KINGDOM_SETS = [
  {
    id: "throne-room",
    name: "Throne Room",
    description:
      "A royal throne room fit for kings and queens — where your story begins.",
    image: "/sets/throne-room.jpg",
  },
  {
    id: "royal-forest",
    name: "Royal Forest",
    description:
      "A peaceful woodland kingdom with lantern light and ancient trees — wonder without fear.",
    image: "/sets/royal-forest.webp",
  },
  {
    id: "royal-garden",
    name: "Royal Garden",
    description:
      "Lush gardens and quiet beauty — a soft, enchanted place to bloom.",
    image: "/sets/royal-garden.webp",
  },
  {
    id: "chastle",
    name: "Chastle",
    description:
      "An enchanted castle realm of bravery and wonder — where heroes rise.",
    image: "/sets/chastle.webp",
  },
] as const;

export const AI_STYLE_PRESETS = [
  {
    id: "throne-room",
    label: "Throne Room",
    promptSuffix:
      "in a majestic castle throne room with golden crown, royal robes, warm torchlight, dignified and joyful, cinematic portrait photography",
  },
  {
    id: "royal-forest",
    label: "Royal Forest",
    promptSuffix:
      "in a peaceful royal forest with soft lantern light, warm woodland atmosphere, hopeful and noble, premium portrait photography",
  },
  {
    id: "royal-garden",
    label: "Royal Garden",
    promptSuffix:
      "in a lush royal garden with roses, marble fountain, golden hour light, serene and beloved, elegant portrait photography",
  },
  {
    id: "chastle",
    label: "Chastle",
    promptSuffix:
      "on a courageous knightly quest with noble armor accents, brave and confident pose, warm heroic lighting, premium portrait photography",
  },
] as const;

export const PRICING_PACKAGES = [
  {
    id: "storybook-only",
    name: "Kingdom Chronicles",
    price: 299,
    description: "The AI-illustrated adventure story where your child is the hero.",
    features: [
      "45-minute studio session",
      "All 4 enchanted kingdom sets",
      "Personalized AI watercolor storybook",
      "Child named as the hero throughout",
      "6 unique adventure paths to choose from",
      "8×8 premium printed hardcover",
      "Free digital share link",
    ],
    popular: false,
  },
  {
    id: "portrait-only",
    name: "Royal Portrait Album",
    price: 299,
    description: "A stunning photo book of your child\'s royal portraits from all 4 sets.",
    features: [
      "45-minute studio session",
      "All 4 enchanted kingdom sets",
      "Professional studio portraits",
      "Child\'s name on the cover",
      "20+ curated photos beautifully laid out",
      "8×8 premium printed hardcover",
      "Free digital share link",
    ],
    popular: false,
  },
  {
    id: "both-books",
    name: "The Royal Collection",
    price: 499,
    description: "Both books — the adventure story AND the portrait album. The complete keepsake.",
    features: [
      "60-minute studio session",
      "All 4 enchanted kingdom sets",
      "Kingdom Chronicles storybook",
      "Royal Portrait Album",
      "Both 8×8 premium hardcover books",
      "Child\'s name in both books",
      "Free digital share links for both",
      "Save $99 vs buying separately",
    ],
    popular: true,
  },
]

export const ADDITIONAL_INVESTMENTS = [
  // Digital access
  { label: "Digital share link (preview)", price: "FREE — included with every session" },
  { label: "Digital download — full PDF, no watermark", price: "$49" },
  { label: "Digital download + 1 extra printed copy", price: "$79" },
  // Physical add-ons
  { label: "Additional child book (4th+ child)", price: "$149 each" },
  { label: "Extra printed hardcover copy", price: "$45 each" },
  { label: "Animated Kingdom video (coming soon)", price: "$299" },
  { label: "Rush processing (48hr turnaround)", price: "$75" },
  // Portrait prints
  { label: "8×10 portrait print", price: "$200 each" },
  { label: "11×14 portrait print", price: "$600" },
  { label: "16×20 portrait print", price: "$975" },
  { label: "24×30 portrait print", price: "$1,650" },
  { label: "30×40 portrait print", price: "$2,650" },
  { label: "MP4 digital slideshow (coming soon)", price: "$1,400" },
] as const;

export const OUR_PROMISE = {
  headline: "Our Promise",
  body: "Your child will have a magical time, beautifully captured in their very own Kingdom Chronicles storybook.",
  detail:
    "Every session includes a printed hardcover Kingdom Chronicles book and a digital share link so family and friends can preview online. Want to download the full PDF without a watermark? Add it for $49. Additional printed copies are $45 each. Transparent pricing — no surprises.",
} as const;

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah & Michael T.",
    role: "Parents of Emma, age 6",
    quote:
      "Emma now says, 'I'm a queen!' The storybook reminds her every night that she is loved and brave. It has done more for her confidence than we expected.",
    rating: 5,
  },
  {
    id: 2,
    name: "Jennifer L.",
    role: "Mother of twins, age 4",
    quote:
      "The studio felt warm and intentional. Our boys left standing taller — celebrated, not just photographed.",
    rating: 5,
  },
  {
    id: 3,
    name: "David & Rachel K.",
    role: "Family of 4",
    quote:
      "The Heirloom Legacy storybook is something we'll pass down. It captures who our kids are in a way photos alone never could.",
    rating: 5,
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "What is Storybook Photos?",
    answer:
      "We're a kingdom-themed photo studio in Costa Mesa. Kids dress as royalty, explore immersive sets, and can receive a Kingdom Chronicles where they are the hero of the adventure.",
  },
  {
    question: "Where can I book a kingdom photo shoot near Costa Mesa?",
    answer:
      "Storybook Photos is located at 3525 Hyland Ave, Suite 235, Costa Mesa, CA 92626. We serve families across Orange County, including Newport Beach, Irvine, Huntington Beach, and surrounding cities. You can book online at storybookphotos.com/book.",
  },
  {
    question: "How much does a Storybook Photos session cost?",
    answer:
      "Packages start at $299 for Kingdom Chronicles or the Royal Portrait Album. The Royal Collection, which includes both books, starts at $499. Every package includes a studio session and a premium printed hardcover book.",
  },
  {
    question: "What ages are best for a session?",
    answer:
      "Our sessions are designed for children ages 2–12, though teens and adults are welcome in family packages. Every age can enjoy feeling like royalty for a day.",
  },
  {
    question: "How long does a session take?",
    answer:
      "Sessions range from 45 to 75 minutes depending on your package. We never rush — every child gets time to feel safe, seen, and celebrated.",
  },
  {
    question: "What's included in the storybook?",
    answer:
      "Your Kingdom Chronicles features your child as the hero of their own royal adventure, with professional photos woven throughout. Text is customized to their story and printed on premium archival paper.",
  },
  {
    question: "Can siblings participate together?",
    answer:
      "Absolutely! We offer family and sibling add-ons. Multiple children can share sets and appear together in portraits and storybook pages.",
  },
  {
    question: "How do you prepare before our session?",
    answer:
      "When you book, share names, ages, and anything we should know about your child. We guide costumes, sets, and the storybook — you don't need to invent the experience.",
  },
  {
    question: "Where is the studio located?",
    answer:
      "We're located at 3525 Hyland Ave, Suite 235, Costa Mesa, CA 92626. Parking details are sent upon booking confirmation.",
  },
] as const;

export const PACKAGE_OPTIONS = [
  { value: "solo-quest", label: "Solo Quest — $349 (1 child · 1 printed hardcover book)" },
  { value: "sibling-quest", label: "Sibling Quest — $549 (2 children · 2 printed hardcover books)" },
  { value: "family-quest", label: "Family Quest — $849 (3 children · 3 printed hardcover books)" },
  { value: "additional-book", label: "Add extra book — $149 (for 4th child+)" },
];
