-- =============================================================================
-- Animated Kingdom Movie upsell — run in Supabase SQL Editor
-- ListedFire-style production queue on existing storybooks
-- =============================================================================

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS video_status TEXT NOT NULL DEFAULT 'none'
    CHECK (video_status IN (
      'none',
      'requested',
      'paid',
      'in_production',
      'ready',
      'delivered',
      'cancelled'
    ));

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS video_requested_at TIMESTAMPTZ;

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS video_delivered_at TIMESTAMPTZ;

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS video_package TEXT
    CHECK (video_package IS NULL OR video_package IN ('teaser', 'full'));

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS video_notes TEXT;

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS video_contact_email TEXT;

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS video_contact_name TEXT;

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS narration_url TEXT;

ALTER TABLE public.storybooks
  ADD COLUMN IF NOT EXISTS narration_script TEXT;

CREATE INDEX IF NOT EXISTS idx_storybooks_video_status
  ON public.storybooks(video_status);

COMMENT ON COLUMN public.storybooks.video_status IS
  'Animated movie upsell: none → requested → paid/in_production → ready/delivered';
COMMENT ON COLUMN public.storybooks.video_url IS
  'Final MP4 URL (Supabase storage or CDN) shown in client book viewer';

-- Allow MP4 uploads in storybook-assets bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
  'video/webm'
]
WHERE id = 'storybook-assets';
