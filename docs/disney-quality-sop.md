# Disney-Level Quality SOP — Storybook Photos

## Product promise
Upload kid face → pick adventure → **premium coloring-book story** + **bedtime narration** + optional **animated read-aloud movie**.

Not a photo book. Not a trailer. A keepsake that feels like a Disney storybook coming alive.

## Non-negotiables
1. **Boy = King [Name], Girl = Queen [Name]**
2. **No pronouns** — always use the name
3. **No real photos in pages or movie** — face is likeness reference only
4. **Coloring-book art** — bold ink, cream paper, mostly line art
5. **Narration** = parent reading the book slowly at bedtime

## Create flow (website)
1. Face / profile photo
2. Name, age, boy/girl
3. Choose 1 of 6 adventures
4. Generate coloring-book pages
5. Generate ElevenLabs narration from page text
6. Optional: request animated movie → admin queue → Higgsfield/Seedance → deliver MP4

## Art quality bar
- Clean, elegant black outlines (no sketchy mess)
- Hero readable silhouette center stage
- Face likeness simplified into charming royal line art
- Large colorable areas
- Tiny gold/blush accents only — not full paint
- No text in image, no watermark, no photo collage

## Seedance motion (every page)
Use `SEEDANCE_PAGE_MOTION_PROMPT` from `src/lib/storybook/narration.ts`:
- outlines stay sharp
- gentle 2D life only
- no face morph
- cream paper preserved

## Narration quality bar
- One warm adult storyteller voice (brand voice)
- Slow, clear, ~bedtime pace
- Script = filled adventure page text + soft open/close
- Deliver MP3 on book page “Read my story”

## Movie assembly
1. Page stills (coloring book)
2. Seedance clip per page (5–8s)
3. Full narration bed under timeline
4. Soft instrumental bed (low)
5. Open: title + “Once upon a time…”
6. Close: “The End” + “Sweet dreams, King/Queen [Name]”
7. Target full movie 60–90s (or teaser 15–30s)

## Admin checklist
- [ ] Face photo clear
- [ ] King/Queen correct
- [ ] Pages all coloring-book (no photo pages)
- [ ] Narration generated & sounds warm
- [ ] Movie request in `/admin/video-jobs`
- [ ] Copy page images into Higgsfield
- [ ] Deliver MP4 URL on book page

## Env (Vercel)
- FAL_API_KEY
- GOOGLE_AI_API_KEY
- ELEVENLABS_API_KEY
- ELEVENLABS_VOICE_ID
- Supabase URL + service role

## SQL
Run `supabase/animated-videos.sql` once for video + narration columns.
