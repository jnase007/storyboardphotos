export const SITE = {
  name: "Storybook Photos",
  subtitle: "Kings & Queens",
  domain: "storybookphotos.com",
  url: "https://storybookphotos.com",
  tagline: "Remind Your Child They Are Royalty",
  description:
    "Kingdom-themed photo studio in Costa Mesa, CA. Magical royal photo shoots and personalized storybooks that help kids feel brave, beloved, and full of wonder.",
  location: "Costa Mesa, CA",
  email: "hello@storybookphotos.com",
  phone: "(949) 637-2226",
  address: "3525 Hyland Ave, Suite 235, Costa Mesa, CA 92626",
} as const;

export const NAV_LINKS = [
  { href: "/experience", label: "The Experience" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/kingdom-sets", label: "Kingdom Sets" },
  { href: "/storybooks", label: "Storybooks" },
  { href: "/pricing", label: "Pricing" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQ" },
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
      "Select a package that fits your family — from a single royal portrait to a full kingdom experience with a personalized storybook.",
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
      "We create a personalized storybook where your child is the hero — loved, brave, and made for adventure.",
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
    id: "royal-portrait",
    name: "Royal Portrait",
    price: 450,
    description: "A premium introduction — two kingdom sets and a free portrait.",
    features: [
      "45-minute studio session",
      "2 kingdom sets of your choice",
      "1 free Limited Edition 8x10 Royal Portrait",
      "10 edited digital portraits",
      "Costume & prop access",
      "Online gallery",
    ],
    popular: false,
  },
  {
    id: "kingdom-adventure",
    name: "Kingdom Adventure",
    price: 750,
    description: "Our most popular package for a full enchanted royal experience.",
    features: [
      "60-minute studio session",
      "3 kingdom sets",
      "1 free 8x10 print",
      "20 edited digital portraits",
      "Premium costumes & props",
      "Mini storybook (8 pages)",
      "Online gallery + prints",
    ],
    popular: true,
  },
  {
    id: "heirloom-legacy",
    name: "Heirloom Legacy",
    price: 1200,
    description: "The complete experience with a custom heirloom storybook.",
    features: [
      "75-minute studio session",
      "All 4 kingdom sets",
      "1 free 8x10 print",
      "30 edited digital portraits",
      "Full costume wardrobe",
      "Custom 20-page Heirloom Storybook",
      "Premium leather-bound album",
      "Family portrait included",
    ],
    popular: false,
  },
] as const;

export const ADDITIONAL_INVESTMENTS = [
  { label: "Extra 8×10 prints", price: "$200 each" },
  { label: "11×14 print", price: "$600" },
  { label: "16×20 print", price: "$975" },
  { label: "24×30 print", price: "$1,650" },
  { label: "30×40 print", price: "$2,650" },
  { label: "Single Digital Image", price: "$500" },
  { label: "Full Heirloom Storybook Upgrade", price: "Starts at $3,000" },
  { label: "MP4 Digital Slideshow", price: "$1,400" },
] as const;

export const OUR_PROMISE = {
  headline: "Our Promise",
  body: "Your child will have a magical time, beautifully captured in our one-of-a-kind heirloom art pieces.",
  detail:
    "Most of our families invest between $1,000 – $3,000 and are thrilled with their keepsakes. Some families invest $10,000+. Payment plans are available. There is never any obligation to purchase anything beyond the free portrait.",
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
      "We're a kingdom-themed photo studio in Costa Mesa. Kids dress as royalty, explore immersive sets, and can receive a personalized storybook where they are the hero of the adventure.",
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
      "Your personalized storybook features your child as the hero of their own royal adventure, with professional photos woven throughout. Text is customized to their story and printed on premium archival paper.",
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

export const PACKAGE_OPTIONS = PRICING_PACKAGES.map((p) => ({
  value: p.id,
  label: `${p.name} — $${p.price}`,
}));
