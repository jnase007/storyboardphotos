import type { KingdomSet, StoryGender, StoryPage } from "./types";
import { KINGDOM_SETS } from "./types";
import {
  ADVENTURE_PATHS,
  TITLE_ROLE,
  getAdventurePath,
  isAdventurePath,
  materializeAdventureStory,
  type AdventurePath,
  type AdventurePathId,
} from "./adventure-paths";

type StoryInput = {
  childName: string;
  childAge: number;
  gender: StoryGender;
  notes?: string;
  pageCount?: number;
  /** Choose-your-own-adventure path selected at the kiosk */
  adventurePath?: AdventurePathId;
  /** Optional edited script (from Story Scripts admin / localStorage) */
  adventureScript?: AdventurePath;
  /**
   * `script` = use curated adventure script (reliable for kiosk).
   * `ai` = ask LLM to personalize while following the path (falls back to script).
   */
  storyMode?: "script" | "ai";
};

function resolvePath(input: StoryInput): AdventurePath {
  if (input.adventureScript && isAdventurePath(input.adventureScript)) {
    return input.adventureScript;
  }
  const id = input.adventurePath ?? ADVENTURE_PATHS[0].id;
  return getAdventurePath(id);
}

/**
 * Build the system + user prompts for Grok / Claude story generation.
 */
export function buildStoryPrompts(input: StoryInput) {
  const role = TITLE_ROLE[input.gender];
  const pages = Math.min(12, Math.max(8, input.pageCount ?? 8));
  const notes = input.notes?.trim()
    ? `Staff notes about the child: ${input.notes.trim()}`
    : "No extra notes.";

  const path = resolvePath(input);

  const outline = path.pages
    .map(
      (p) =>
        `Page ${p.page} "${p.title}"${p.photoSet ? ` [photoSet: ${p.photoSet}]` : ""}: ${p.text.slice(0, 180).replace(/\n/g, " ")}…`
    )
    .join("\n");

  const system = `You are a children's storybook author for Storybook Photos | Kings & Queens, a premium kingdom photo studio.
Write warm, brave, inclusive adventure stories for ages 2–12.
Use the child's name often. Keep language lyrical but readable aloud.
The child chose this adventure path: "${path.title}" (${path.label}).
Theme guidance: ${path.aiTheme}
Follow the plot beats of the outline below — personalize wording, keep the same page count and photoSet assignments.
Structure the quest through these four sets in order somewhere in the middle pages:
1) Castle Throne Room 2) Royal Forest 3) Royal Garden 4) Courage Quest.
Return ONLY valid JSON (no markdown) matching:
{
  "bookTitle": string,
  "pages": [
    { "page": number, "title": string, "text": string, "photoSet": "Castle Throne Room"|"Royal Forest"|"Royal Garden"|"Courage Quest"|null, "useSessionPhoto": boolean, "imagePrompt": string }
  ]
}
Rules:
- Exactly ${pages} pages.
- Pages 1–2: title / call to adventure (photoSet null or portrait; useSessionPhoto true ok).
- Include each of the four kingdom sets on distinct pages with useSessionPhoto true.
- Final 1–2 pages: return + The End.
- imagePrompt: short watercolor children's book illustration prompt describing the scene (no text in image), mentioning ${role} ${input.childName}, age ${input.childAge}.
- Each page text: 2–5 short paragraphs, suitable for a printed spread.
- Never graphic violence; keep dragon/conflict age-appropriate and hopeful.`;

  const user = `Write an ${pages}-page personalized story for ${role} ${input.childName}, age ${input.childAge}, gender ${input.gender}.
Adventure chosen: Option ${path.option} — ${path.title}. ${path.description}
Book title style: "${path.bookTitleTemplate.replace("[Role]", role).replace("[Name]", input.childName)}".
${notes}

Plot outline to follow:
${outline}`;

  return { system, user, pages, role, path };
}

/**
 * Call xAI Grok chat completions when GROK_API_KEY or XAI_API_KEY is set.
 */
async function generateWithGrok(
  system: string,
  user: string
): Promise<string | null> {
  const key = process.env.GROK_API_KEY ?? process.env.XAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Grok story error:", await res.text());
      return null;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("Grok story failed:", err);
    return null;
  }
}

/**
 * Call Anthropic Claude when ANTHROPIC_API_KEY is set.
 */
async function generateWithClaude(
  system: string,
  user: string
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) {
      console.error("Claude story error:", await res.text());
      return null;
    }

    const data = await res.json();
    const block = data?.content?.find(
      (c: { type: string }) => c.type === "text"
    );
    return block?.text ?? null;
  } catch (err) {
    console.error("Claude story failed:", err);
    return null;
  }
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1].trim() : trimmed;
  return JSON.parse(body);
}

type RawPage = {
  page?: number;
  title?: string;
  text?: string;
  photoSet?: string | null;
  useSessionPhoto?: boolean;
  imagePrompt?: string;
};

function normalizePages(
  rawPages: RawPage[],
  input: StoryInput,
  role: string
): StoryPage[] {
  const setNames = new Set(KINGDOM_SETS);

  return rawPages.map((p, i) => {
    const page = p.page ?? i + 1;
    let photoSet: KingdomSet = null;
    if (p.photoSet && setNames.has(p.photoSet as Exclude<KingdomSet, null>)) {
      photoSet = p.photoSet as Exclude<KingdomSet, null>;
    }

    return {
      page,
      title: p.title?.trim() || `Page ${page}`,
      text: (p.text ?? "").trim(),
      imageUrl: null,
      photoSet,
      useSessionPhoto: Boolean(p.useSessionPhoto),
      imagePrompt:
        p.imagePrompt?.trim() ||
        `Watercolor children's book illustration of ${role} ${input.childName} on a kingdom adventure, soft golden light, magical atmosphere, no text`,
    };
  });
}

/**
 * Generate a personalized kingdom story from a chosen adventure path.
 * Default: curated script (kiosk-reliable). Optional AI polish when storyMode is "ai".
 */
export async function generateKingdomStory(input: StoryInput): Promise<{
  bookTitle: string;
  pages: StoryPage[];
  provider: "grok" | "claude" | "template";
  adventurePath: AdventurePathId;
}> {
  const path = resolvePath(input);
  const adventurePath = path.id;
  const scriptStory = materializeAdventureStory(
    path,
    input.childName,
    input.gender,
    input.childAge,
    input.notes
  );

  const mode = input.storyMode ?? "script";
  if (mode === "script") {
    return { ...scriptStory, provider: "template", adventurePath };
  }

  const { system, user, role } = buildStoryPrompts({
    ...input,
    adventurePath,
    adventureScript: path,
  });

  const raw =
    (await generateWithGrok(system, user)) ??
    (await generateWithClaude(system, user));

  if (raw) {
    try {
      const parsed = extractJson(raw) as {
        bookTitle?: string;
        pages?: RawPage[];
      };
      if (Array.isArray(parsed.pages) && parsed.pages.length >= 6) {
        return {
          bookTitle:
            parsed.bookTitle?.trim() || scriptStory.bookTitle,
          pages: normalizePages(parsed.pages, input, role),
          provider:
            process.env.GROK_API_KEY || process.env.XAI_API_KEY
              ? "grok"
              : "claude",
          adventurePath,
        };
      }
    } catch (err) {
      console.error("Failed to parse story JSON:", err);
    }
  }

  return { ...scriptStory, provider: "template", adventurePath };
}
