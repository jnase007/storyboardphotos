# Storybook Photos — Kingdom Quests

Premium fantasy photo studio marketing website for [storybookphotos.com](https://storybookphotos.com).

**Tagline:** Turn Your Child Into Royalty — With a Personalized Storybook

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui components
- **Supabase** (Database + Storage)
- **Framer Motion** animations
- **React Hook Form** + Zod validation
- **Sonner** toasts
- **Lucide React** icons

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Create a Storage bucket named `generated-images` (public)
4. Copy your project URL and keys to `.env.local`

### 4. Add AI API key (optional but recommended)

At least one provider enables real AI previews:

| Variable | Provider |
|---|---|
| `GOOGLE_AI_API_KEY` | Google Imagen 3 |
| `REPLICATE_API_TOKEN` | Replicate Flux 1.1 Pro |
| `TOGETHER_API_KEY` | Together.ai Flux |

Without any key, the generator returns a styled placeholder.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy
5. Add custom domain `storybookphotos.com` in Vercel → Settings → Domains
6. Update DNS at your registrar to point to Vercel

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/generate/     # AI image generation endpoint
│   │   └── bookings/        # Booking form submission
│   ├── layout.tsx           # Root layout + SEO metadata
│   └── page.tsx             # Single-page marketing site
├── components/
│   ├── ai-kingdom-generator.tsx  # Reusable AI preview component
│   ├── booking-form.tsx          # Booking form with validation
│   ├── layout/                   # Navbar, Footer
│   ├── sections/                 # All page sections
│   └── ui/                       # shadcn/ui primitives
└── lib/
    ├── ai/generate-image.ts      # AI provider fallback chain
    ├── constants.ts              # All editable site content
    ├── supabase/                 # Supabase clients
    └── validations.ts            # Zod schemas
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
REPLICATE_API_TOKEN=your-replicate-token
TOGETHER_API_KEY=your-together-key
NEXT_PUBLIC_SITE_URL=https://storybookphotos.com
```
