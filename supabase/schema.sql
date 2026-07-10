-- =============================================================================
-- Storybook Photos | Kingdom Quests — Supabase Schema
-- =============================================================================
--
-- WHEN YOU'RE READY:
-- 1. Create a project at https://supabase.com
-- 2. Open SQL Editor → New query
-- 3. Paste this entire file and click Run
-- 4. Copy keys into .env.local (and Vercel env vars):
--      NEXT_PUBLIC_SUPABASE_URL
--      NEXT_PUBLIC_SUPABASE_ANON_KEY
--      SUPABASE_SERVICE_ROLE_KEY
-- 5. Confirm Storage → Buckets shows "generated-images" (public)
--
-- TABLES:
--   bookings          — booking form submissions
--   generated_images  — AI kingdom preview metadata
--
-- PACKAGE_TYPE VALUES (from the site):
--   royal-portrait | kingdom-adventure | heirloom-legacy
--
-- STYLE_PRESET VALUES (AI generator):
--   castle-throne | royal-forest | royal-garden | courage-quest
--
-- =============================================================================

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL CHECK (child_age >= 1 AND child_age <= 18),
  preferred_date DATE NOT NULL,
  num_people INTEGER NOT NULL CHECK (num_people >= 1 AND num_people <= 10),
  package_type TEXT NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' NOT NULL
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_date ON public.bookings(preferred_date);

COMMENT ON TABLE public.bookings IS 'Kingdom Quests session booking requests from storybookphotos.com';
COMMENT ON COLUMN public.bookings.package_type IS 'royal-portrait | kingdom-adventure | heirloom-legacy';
COMMENT ON COLUMN public.bookings.status IS 'pending | confirmed | completed | cancelled';

-- ============================================
-- GENERATED IMAGES TABLE (AI Previews)
-- ============================================
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  prompt TEXT NOT NULL,
  style_preset TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  session_id TEXT,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_generated_images_created_at
  ON public.generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_expires_at
  ON public.generated_images(expires_at);
CREATE INDEX IF NOT EXISTS idx_generated_images_style_preset
  ON public.generated_images(style_preset);

COMMENT ON TABLE public.generated_images IS 'Temporary AI kingdom preview images (typically expire after 24h)';
COMMENT ON COLUMN public.generated_images.style_preset IS 'castle-throne | royal-forest | royal-garden | courage-quest';

-- ============================================
-- ROW LEVEL SECURITY — BOOKINGS
-- ============================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public booking submissions" ON public.bookings;
CREATE POLICY "Allow public booking submissions"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to bookings" ON public.bookings;
CREATE POLICY "Service role full access to bookings"
  ON public.bookings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ROW LEVEL SECURITY — GENERATED IMAGES
-- ============================================
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public AI image logging" ON public.generated_images;
CREATE POLICY "Allow public AI image logging"
  ON public.generated_images
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read of generated images" ON public.generated_images;
CREATE POLICY "Allow public read of generated images"
  ON public.generated_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role full access to generated images" ON public.generated_images;
CREATE POLICY "Service role full access to generated images"
  ON public.generated_images
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET — generated-images
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-images',
  'generated-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Allow public uploads to generated-images" ON storage.objects;
CREATE POLICY "Allow public uploads to generated-images"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'generated-images');

DROP POLICY IF EXISTS "Allow public read of generated-images" ON storage.objects;
CREATE POLICY "Allow public read of generated-images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'generated-images');

DROP POLICY IF EXISTS "Service role full access to generated-images" ON storage.objects;
CREATE POLICY "Service role full access to generated-images"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'generated-images')
  WITH CHECK (bucket_id = 'generated-images');

-- ============================================
-- OPTIONAL: cleanup expired AI preview rows
-- Schedule via Dashboard → Database → Extensions → pg_cron
-- or call from a Supabase Edge Function / cron job.
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.generated_images
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_images() IS
  'Deletes generated_images rows past expires_at. Schedule daily if desired.';
