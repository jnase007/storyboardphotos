# Storybook Photos — Watercolor IP Lock (DO NOT DRIFT)

**Status:** LOCKED product IP — same look for every client, every book.

## Gold reference
- File: `docs/art-locks/river-kingdom-quest-watercolor-GOLD.pdf` (Justin lock 2026-10-02)
- Look: soft **sepia ink outlines** + **pastel watercolor washes** on cream paper
- NOT: 3D/CGI, plastic Disney faces, photoreal, bare line-art coloring pages, generic Flux cartoon

## Code source of truth
- `src/lib/storybook/generate-illustrations.ts`
  - `STORYBOOK_WATERCOLOR_IP` / `STYLE_SUFFIX` — required on every generation prompt
  - Primary with face: **fal-ai/flux-pulid** + character card / session photo URL
  - Never ship book art from bare `flux/dev` without the full watercolor IP suffix
  - Placeholders only as last resort, and never one shared castle stamp for all pages

## Rules
1. Every client book must match the gold watercolor feel (ink + wash, pastel, cream paper).
2. Face lock via character card / photo when available (PuLID).
3. Do not “emergency fix” with a different model look — fix the lock path instead.
4. No movie/PDF until Justin (or admin) approves art.
5. Changing this look requires Justin’s explicit OK — it is the business brand.

## Incident 2026-10-02
Emergency Flux Dev pages fixed duplicate castle stamps but **broke IP look**. Stopped movie/PDF. Restored lock path.
