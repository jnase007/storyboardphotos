-- =============================================================================
-- Storybook Generator — internal staff tool tables + storage
-- Run in Supabase SQL Editor after the base schema.sql
-- =============================================================================

-- ============================================
-- STORYBOOKS (one per child session book)
-- ============================================
CREATE TABLE IF NOT EXISTS public.storybooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL CHECK (child_age >= 1 AND child_age <= 18),
  gender TEXT NOT NULL CHECK (gender IN ('girl', 'boy', 'other')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'generating', 'ready', 'approved', 'error')),
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  pages JSONB NOT NULL DEFAULT '[]',
  pdf_url TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_storybooks_status ON public.storybooks(status);
CREATE INDEX IF NOT EXISTS idx_storybooks_created_at ON public.storybooks(created_at DESC);

COMMENT ON TABLE public.storybooks IS 'Internal AI storybook generator projects';
COMMENT ON COLUMN public.storybooks.pages IS 'Array of { page, title, text, imageUrl, photoSet, imagePrompt }';

ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to storybooks" ON public.storybooks;
CREATE POLICY "Service role full access to storybooks"
  ON public.storybooks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STORAGE — session photos + storybook assets
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'storybook-assets',
  'storybook-assets',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Service role full access to storybook-assets" ON storage.objects;
CREATE POLICY "Service role full access to storybook-assets"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'storybook-assets')
  WITH CHECK (bucket_id = 'storybook-assets');

DROP POLICY IF EXISTS "Allow public read of storybook-assets" ON storage.objects;
CREATE POLICY "Allow public read of storybook-assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'storybook-assets');
