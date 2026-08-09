import type { KingdomSet, StoryGender, StoryPage } from "./types";

/**
 * Choose-your-own-adventure paths for the kiosk / generator.
 * Kids pick one quest; scripts use placeholders filled at generate time.
 *
 * Placeholders only: [Name] [Role]
 * No pronouns — always repeat the child's name.
 */

export const ADVENTURE_PATH_IDS = [
  "dragon-slayer",
  "rescue-mission",
  "lost-crown",
  "forest-guardian",
  "kindness-quest",
  "light-treasure",
] as const;

export type AdventurePathId = (typeof ADVENTURE_PATH_IDS)[number];

export type AdventureScriptPage = {
  page: number;
  title: string;
  text: string;
  photoCaption: string;
  photoSet?: Exclude<KingdomSet, null>;
  useSessionPhoto?: boolean;
  imagePromptHint?: string;
  staticScene?: string;
};

export type AdventurePath = {
  id: AdventurePathId;
  /** Kiosk option number 1-6 */
  option: 1 | 2 | 3 | 4 | 5 | 6;
  /** Short label on the choice card */
  label: string;
  /** Full adventure name */
  title: string;
  /** One-line kid-friendly pitch */
  description: string;
  /** Scripture anchor for the quest (reference) */
  bibleVerse: string;
  /** Short kid-friendly verse wording */
  bibleVerseText: string;
  /** Extra guidance for AI rewriting */
  aiTheme: string;
  /** Book title with [Role] and [Name] */
  bookTitleTemplate: string;
  pages: AdventureScriptPage[];
};

export const TITLE_ROLE = {
  girl: "Queen",
  boy: "King",
} as const;

/** Fill script placeholders for a child. Name only — no pronouns. */
export function fillPlaceholders(
  text: string,
  childName: string,
  gender: StoryGender
): string {
  const role = TITLE_ROLE[gender];
  return text
    .replace(/\[Child['']s Name\]/g, childName)
    .replace(/\[Name\]/g, childName)
    .replace(/\[Role\]/g, role);
}

/** v7 = longer action quests (cliffs/bridges/storms) + one-land focus */
export const ADVENTURE_PATHS_STORAGE_KEY = "sbp-adventure-paths-v7";

/** Shared AI guardrails for every quest (faith-friendly kingdom stories). */
export const BIBLICAL_STORY_GUARDRAILS =
  "Faith-friendly Kingdom of Light story. Themes from Scripture: courage, kindness, stewardship, light, rescue, integrity. " +
  "NO magic spells, NO wands, NO casting, NO witchcraft, NO sorcery, NO wizards, NO potions, NO incantations, NO fairy-godmother magic. " +
  "Wonder comes from beauty of creation, courage, prayerful heart, love, and light — never occult power. " +
  "Talking animals or dragons only as gentle fable creatures (Narnia-adjacent), not as spirits or gods. " +
  "No pronouns — always use the child name. Boy=King, Girl=Queen only.";

export function getAdventurePath(id: AdventurePathId): AdventurePath {
  const path = ADVENTURE_PATHS.find((p) => p.id === id);
  if (!path) throw new Error(`Unknown adventure path: ${id}`);
  return path;
}

/** Validate / normalize a stored or posted adventure path script. */
export function isAdventurePath(value: unknown): value is AdventurePath {
  if (!value || typeof value !== "object") return false;
  const p = value as AdventurePath;
  return (
    typeof p.id === "string" &&
    ADVENTURE_PATH_IDS.includes(p.id as AdventurePathId) &&
    typeof p.label === "string" &&
    typeof p.title === "string" &&
    typeof p.bookTitleTemplate === "string" &&
    typeof (p as AdventurePath).bibleVerse === "string" &&
    typeof (p as AdventurePath).bibleVerseText === "string" &&
    Array.isArray(p.pages) &&
    p.pages.length >= 6
  );
}

/**
 * Parse localStorage / API adventure script overrides.
 * Returns defaults when missing or invalid.
 */
export function resolveAdventurePaths(
  storedJson?: string | null
): AdventurePath[] {
  if (!storedJson) return ADVENTURE_PATHS;
  try {
    const parsed = JSON.parse(storedJson) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 6) return ADVENTURE_PATHS;
    if (!parsed.every(isAdventurePath)) return ADVENTURE_PATHS;
    return parsed;
  } catch {
    return ADVENTURE_PATHS;
  }
}

/** Browser helper - load edited scripts from localStorage when present. */
export function loadAdventurePathsClient(): AdventurePath[] {
  if (typeof window === "undefined") return ADVENTURE_PATHS;
  try {
    return resolveAdventurePaths(
      localStorage.getItem(ADVENTURE_PATHS_STORAGE_KEY)
    );
  } catch {
    return ADVENTURE_PATHS;
  }
}

/** Build generator StoryPage[] from an adventure script. */
export function materializeAdventureStory(
  path: AdventurePath,
  childName: string,
  gender: StoryGender,
  childAge: number,
  notes?: string
): { bookTitle: string; pages: StoryPage[] } {
  const role = TITLE_ROLE[gender];
  const bookTitle = fillPlaceholders(path.bookTitleTemplate, childName, gender);

  // Keep title/cover script pages so they get UNIQUE art for the hardcover.
  // Interior reading/PDF still strips them via stripRedundantTitlePages (cover already shows name + hero).
  const rawPages = path.pages;

  const pages: StoryPage[] = rawPages.map((p, idx) => {
    const photoSet = p.photoSet ?? null;
    const useSessionPhoto =
      p.useSessionPhoto ?? (photoSet !== null || idx === 0 || p.page === 8);

    return {
      page: idx + 1,
      title: fillPlaceholders(p.title, childName, gender),
      text: fillPlaceholders(p.text, childName, gender),
      imageUrl: null,
      photoSet,
      useSessionPhoto,
      staticScene: p.staticScene,
      imagePrompt:
        fillPlaceholders(
          p.imagePromptHint ||
            `Watercolor children's storybook illustration of [Role] [Name] in a kingdom adventure, soft sepia ink outlines, pastel watercolor washes, cream paper, warm golden light and wonder of creation, no magic spells no wands, no text`,
          childName,
          gender
        ) + `, age ${childAge}`,
    };
  });

  if (notes?.trim() && pages[0]) {
    pages[0].text += `\n\n(Special note from the session: ${notes.trim()})`;
  }

  return { bookTitle, pages };
}

/** True for interior title-only pages that duplicate the hardcover cover. */
function isRedundantTitleScriptPage(p: {
  page: number;
  title: string;
  text: string;
  photoSet?: string | null;
  useSessionPhoto?: boolean;
}): boolean {
  const title = (p.title || "").trim().toLowerCase();
  if (title === "title page") return true;
  // First script page that is only "King/Queen Name and the …" with no real story body
  if (p.page !== 1) return false;
  const text = (p.text || "").trim();
  const plain = text.replace(/\s+/g, " ");
  if (plain.length <= 90 && /\[Role\]\s*\[Name\]/i.test(text) && /and the /i.test(text)) {
    return true;
  }
  // Dragon-slayer style: title page text is just the adventure name line
  if (
    plain.length <= 80 &&
    !text.includes("\n") &&
    /and the /i.test(text) &&
    !p.photoSet
  ) {
    return true;
  }
  return false;
}

/**
 * Strip duplicate title/portrait intro pages from an already-generated book.
 * Cover already carries name + hero — interior should start on the story.
 */
export function stripRedundantTitlePages<T extends { page?: number; title?: string; text?: string }>(
  pages: T[]
): T[] {
  if (!pages?.length) return pages;
  const filtered = pages.filter((p, idx) => {
    const title = (p.title || "").trim().toLowerCase();
    if (title === "title page" || title === "royal portrait") return false;
    if (idx !== 0) return true;
    const text = (p.text || "").trim();
    const plain = text.replace(/\s+/g, " ");
    // "King Justin and the Rescue Mission" only (no real paragraphs)
    if (plain.length <= 100 && /\band the\b/i.test(plain) && plain.split(/[.!?]/).length <= 2) {
      // Keep if it looks like a real paragraph story start
      if (plain.length > 60 && (plain.includes(",") || plain.split(" ").length > 14)) {
        return true;
      }
      return false;
    }
    return true;
  });
  return filtered.map((p, i) => ({ ...p, page: i + 1 }));
}

export const ADVENTURE_PATHS: AdventurePath[] = [
  {
    id: "dragon-slayer",
    option: 1,
    label: "Dragon Mountain",
    title: "Dragon Mountain",
    description:
      "Climb the Ember Path, face fire-gusts on the peak, and conquer Dragon Land.",
    bibleVerse: "Joshua 1:9",
    bibleVerseText:
      "Be strong and courageous. Do not be afraid… for the Lord your God is with you wherever you go.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE LAND: Dragon Mountain only. ACTION QUEST: climb, rockfall, fire-gusts, stand ground, win the peak. Hero CONQUERS fear and frees the pass. No kingdom tour. No soft filler. Age-appropriate peril, no gore, no killing required — dragon may yield and become guardian after the win. Joshua 1:9.`,
    bookTitleTemplate: "[Role] [Name] and Dragon Mountain",
    pages: [
      {
        page: 1,
        title: "Dragon Mountain",
        staticScene: "dragon-slayer/title",
        text: `[Role] [Name] and Dragon Mountain`,
        photoCaption: "Dragon Mountain awaits",
        useSessionPhoto: false,
        imagePromptHint: "title page dragon mountain watercolor no text",
      },
      {
        page: 2,
        title: "Smoke on the Peak",
        staticScene: "dragon-slayer/call",
        text: `Dragon Mountain smoked like a giant campfire left too long. Sparks hopped in the night sky. The valley pass was blocked. Carts stopped. Sheep stayed home. Fear sat heavy on every rooftop.

"[Role] [Name]," the elder said, "someone must climb Dragon Mountain and take back the high pass."

[Role] [Name] felt the fear — then felt courage push louder.

"I will climb," [Name] said. "I will face the dragon. I will free the mountain."

Be strong and courageous… for the Lord your God is with you. — Joshua 1:9`,
        photoCaption: "The call",
        useSessionPhoto: false,
        imagePromptHint: "smoky dragon mountain valley people looking up watercolor no text",
      },
      {
        page: 3,
        title: "Through the Gate of Ash",
        text: `The Gate of Ash was black stone, warm to the touch. Hot wind slapped [Role] [Name]'s cheeks.

[Name] did not wait for perfect bravery. [Name] stepped through.

On the other side, the Ember Path glowed faintly underfoot — a road of cracked rock and orange light, climbing straight into danger.`,
        photoCaption: "Entering Dragon Land",
        useSessionPhoto: false,
        imagePromptHint: "hero stepping through scorched ash gate watercolor no text",
      },
      {
        page: 4,
        title: "Rockfall!",
        text: `Halfway up, the mountain shook. Stones bounced down the cliff like angry drums.

"Move!" [Role] [Name] shouted to nobody but [Name]'s own feet.

[Name] dashed under a stone overhang as boulders smashed the path behind. Dust filled the air. For one breath, the world was only noise.

Then quiet.

[Role] [Name] crawled out, brushed ash from the royal outfit, and grinned a shaky grin. "Nice try, mountain."

The climb continued — steeper now.`,
        photoCaption: "Escaping the rockfall",
        useSessionPhoto: false,
        imagePromptHint: "hero diving under overhang as rocks fall on mountain path watercolor no text",
      },
      {
        page: 5,
        title: "The Broken Cliff Bridge",
        text: `A rope bridge once crossed a deep ravine. Now half the boards were gone, swinging over empty air.

Far below: mist and teeth of stone.

[Role] [Name] tested the first rope. It held. Barely.

"One board. One breath. One prayer," [Name] whispered.

Step… slide… catch… step. Wind shoved hard. A board cracked and fell spinning into the mist. [Name] froze — then kept going.

At the far side, [Role] [Name] dropped to safe rock and laughed once, wild and free. "I crossed it."`,
        photoCaption: "Crossing the broken bridge",
        useSessionPhoto: false,
        imagePromptHint: "hero crossing broken rope bridge over mountain ravine watercolor no text",
      },
      {
        page: 6,
        title: "Cave of Echoes",
        text: `The path dove into a black cave. Every footstep roared back twice as loud.

"Too small," the echoes mocked.
"Too scared."
"Turn around."

[Role] [Name] planted feet in the dark. "I am [Role] [Name]! Fear can talk — fear does not get the last word!"

The cave went quiet. A thin gold crack of daylight opened ahead.

[Name] ran toward it.`,
        photoCaption: "Through the cave",
        useSessionPhoto: false,
        imagePromptHint: "hero running through dark mountain cave toward light watercolor no text",
      },
      {
        page: 7,
        title: "The Dragon Rises",
        staticScene: "dragon-slayer/dragon",
        text: `Wings blotted the sun.

The dragon exploded from the crater — storm-colored scales, amber eyes, wind like a hurricane. Fire-gusts rolled across the ledge. Sparks stung the air.

[Role] [Name] did not hide.

"This mountain is not yours alone!" [Name] shouted. "The people need the pass. I came to take it back!"

The dragon roared so hard the stone sang. This was the fight — courage against fear, heart against heat.`,
        photoCaption: "Dragon encounter",
        useSessionPhoto: false,
        imagePromptHint: "hero facing giant dragon on mountain ledge fire wind watercolor no text",
      },
      {
        page: 8,
        title: "Stand in the Fire-Wind",
        text: `Again the dragon dove. Again golden heat blasted the peak.

Most people would run. [Role] [Name] stepped forward into the fire-wind, shield of will raised high, royal outfit snapping like a banner.

"You will not rule by fear!" [Name] cried.

The dragon wheeled, shocked. [Name] advanced. Inch by inch, [Role] [Name] claimed the ledge. Roars turned shorter. Wings beat slower.

Courage was winning.`,
        photoCaption: "Standing firm",
        useSessionPhoto: false,
        imagePromptHint: "hero advancing through dragon fire gust on peak watercolor no text",
      },
      {
        page: 9,
        title: "The Peak Is Won",
        staticScene: "dragon-slayer/victory",
        text: `[Role] [Name] reached the crown of Dragon Mountain and struck the ancient bronze victory gong.

CLANG — the sound rolled over the whole land like sunrise made of metal.

The dragon landed hard… then folded its wings… then bowed its great head.

"The pass is free," [Name] said. "Fear does not sit on this throne anymore."

In that moment, [Role] [Name] conquered Dragon Mountain.`,
        photoCaption: "Victory on the peak",
        useSessionPhoto: false,
        imagePromptHint: "hero striking bronze gong on mountain peak dragon bowing watercolor no text",
      },
      {
        page: 10,
        title: "Guardian of the Pass",
        text: `From that day the dragon guarded the pass instead of blocking it. Wings made shade for travelers. Night-flame on the peak became a lighthouse for the valley.

Carts rolled again. Children pointed up and cheered: "[Role] [Name]!"

[Name] had won more than a mountain. [Name] had won the road home for everyone.`,
        photoCaption: "Dragon guards the pass",
        useSessionPhoto: false,
        imagePromptHint: "dragon guarding mountain pass hero standing proud watercolor no text",
      },
      {
        page: 11,
        title: "Home From the Mountain",
        staticScene: "dragon-slayer/end",
        text: `Bells rang in the valley. Flowers filled the road. [Role] [Name] came down dusty, tired, shining.

"You conquered the mountain!" the people cried.

That night [Name] looked back at Dragon Mountain and whispered, "Courage first."

Far above, a gentle flame answered on the peak.

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero returning from dragon mountain celebration watercolor no text",
      },
    ],
  },
  {
    id: "rescue-mission",
    option: 2,
    label: "Broken Bridge Rescue",
    title: "The Broken Bridge Rescue",
    description:
      "Race the storm, cross a shattered bridge, and pull lost friends off the cliff path.",
    bibleVerse: "Luke 15:4",
    bibleVerseText:
      "What man of you, having a hundred sheep, if he has lost one of them, does not… go after the one that is lost?",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE QUEST LAND: storm valley + cliff road + broken bridge. ACTION: race against weather, climb, haul rope, cross broken bridge, rescue friends from ledge. Hero CONQUERS danger to save others. No full kingdom tour. Luke 15:4.`,
    bookTitleTemplate: "[Role] [Name] and the Broken Bridge Rescue",
    pages: [
      {
        page: 1,
        title: "The Broken Bridge Rescue",
        staticScene: "rescue-mission/title",
        text: `[Role] [Name]
and the Broken Bridge Rescue`,
        photoCaption: "Rescue begins",
        useSessionPhoto: false,
        imagePromptHint: "cover hero with rope and lantern storm clouds watercolor no text",
      },
      {
        page: 2,
        title: "Storm Warning",
        staticScene: "rescue-mission/call",
        text: `Thunder grumbled over the valley. A scout stumbled into the courtyard, soaked and breathless.

"Friends are stuck on Cliff Road," the scout gasped. "The bridge is breaking. The storm is faster than they are."

[Role] [Name] grabbed a rope, a lantern, and courage.

"I'm going now."

What man… does not go after the one that is lost? — Luke 15:4`,
        photoCaption: "The urgent call",
        useSessionPhoto: false,
        imagePromptHint: "courtyard storm messenger hero grabbing rope watercolor no text",
      },
      {
        page: 3,
        title: "Race the Rain",
        text: `Rain slapped the trail. Wind shoved sideways. [Role] [Name] ran anyway — boots splashing, lantern swinging, rope coiled tight.

Lightning flashed white. For a second the whole valley looked like a sketch.

[Name] did not slow down. Someone needed [Name] on the other side of the storm.`,
        photoCaption: "Running through the storm",
        useSessionPhoto: false,
        imagePromptHint: "hero running on muddy trail in rain with lantern watercolor no text",
      },
      {
        page: 4,
        title: "Cliff Road",
        text: `Cliff Road clung to the mountain like a skinny ribbon. One side: rock wall. Other side: empty air and roaring river far below.

[Role] [Name] pressed a hand to the wet stone and edged forward.

"Hold on!" [Name] called into the wind. "I am coming!"

A tiny voice answered from ahead — scared, but alive.`,
        photoCaption: "On the cliff path",
        useSessionPhoto: false,
        imagePromptHint: "hero on narrow cliff path storm river below watercolor no text",
      },
      {
        page: 5,
        title: "The Bridge Breaks",
        text: `There it was — the rope bridge, half-torn, boards missing, one side hanging low.

Two friends crouched on the far ledge. One plank snapped and spun into the mist.

"Don't move!" [Role] [Name] shouted. "I will bring the rope!"

[Name]'s heart hammered. This was the moment bravery becomes action.`,
        photoCaption: "Broken bridge ahead",
        useSessionPhoto: false,
        imagePromptHint: "broken rope bridge cliff friends stranded hero arriving watercolor no text",
      },
      {
        page: 6,
        title: "Rope Across the Gap",
        text: `[Role] [Name] tied the rope to an iron ring, spun it once, and threw.

Miss.

Wind laughed. [Name] threw again — harder.

Catch! The far friend grabbed it.

"Tie it around the rock!" [Name] called. "Tight!"

When the line went taut, [Role] [Name] clipped courage to the rope and stepped onto the first trembling board.`,
        photoCaption: "Throwing the rescue rope",
        useSessionPhoto: false,
        imagePromptHint: "hero throwing rope across broken bridge storm watercolor no text",
      },
      {
        page: 7,
        title: "Crossing",
        text: `Step. Slide. Catch. Step.

A board cracked. [Role] [Name] dropped to a knee, held the rope, and breathed through the scare.

"I am [Role] [Name]," [Name] said through clenched teeth. "I do not leave people behind."

Across the gap [Name] went — wet, shaking, unstoppable — until boots hit solid ledge and arms wrapped the waiting friends.`,
        photoCaption: "Crossing the broken bridge",
        useSessionPhoto: false,
        imagePromptHint: "hero crossing damaged rope bridge in rain watercolor no text",
      },
      {
        page: 8,
        title: "Pull to Safety",
        text: `One friend was too tired to walk. [Role] [Name] made a rope harness and guided each person back across, one at a time, body a shield against the wind.

When the last friend reached safe rock, the bridge gave a final groan and sagged even lower.

They had made it. Just in time.`,
        photoCaption: "Everyone safe",
        useSessionPhoto: false,
        imagePromptHint: "hero helping friends off cliff ledge after bridge crossing watercolor no text",
      },
      {
        page: 9,
        title: "Down the Safe Trail",
        text: `On the sheltered trail below, the storm softened to a whisper. [Role] [Name] shared the lantern's warm circle and walked the friends home.

No throne room tour. No garden stroll. Just the best kind of victory: people safe because someone ran toward the danger.`,
        photoCaption: "Walking home",
        useSessionPhoto: false,
        imagePromptHint: "hero leading rescued friends down trail after storm watercolor no text",
      },
      {
        page: 10,
        title: "Home Bells",
        staticScene: "rescue-mission/end",
        text: `Village bells rang when they returned. Hugs. Blankets. Warm bread.

"You crossed the broken bridge," an elder said. "You conquered the storm with love."

[Role] [Name] smiled, soaked and shining. "No one gets left behind."

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero homecoming after rescue wet but happy watercolor no text",
      },
    ],
  },
  {
    id: "lost-crown",
    option: 3,
    label: "Crown of the Cliffs",
    title: "Crown of the Cliffs",
    description:
      "Scale the White Cliffs, outsmart the wind thieves, and reclaim the lost crown.",
    bibleVerse: "Proverbs 4:23",
    bibleVerseText: "Keep your heart with all vigilance, for from it flow the springs of life.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE LAND: White Cliffs. ACTION: climb, wind blasts, narrow ledges, tricky goats/wind-thieves (playful not evil), reclaim crown at summit. Hero CONQUERS the climb. No kingdom tour. Proverbs 4:23 — guard what matters.`,
    bookTitleTemplate: "[Role] [Name] and the Crown of the Cliffs",
    pages: [
      {
        page: 1,
        title: "Crown of the Cliffs",
        staticScene: "lost-crown/title",
        text: `[Role] [Name]
and the Crown of the Cliffs`,
        photoCaption: "The cliffs await",
        useSessionPhoto: false,
        imagePromptHint: "cover hero looking up white cliffs crown glint watercolor no text",
      },
      {
        page: 2,
        title: "The Crown Is Gone",
        staticScene: "lost-crown/call",
        text: `A wild wind ripped through the courtyard and lifted the royal crown clean off the pillow.

Up it spun — gold flashing — until it snagged on the highest tooth of the White Cliffs.

"That crown belongs to the kingdom," the King said. "And the climb belongs to the brave."

[Role] [Name] tied a climbing sash. "I will bring it home."`,
        photoCaption: "Crown stolen by wind",
        useSessionPhoto: false,
        imagePromptHint: "crown blown by wind toward white cliffs hero determined watercolor no text",
      },
      {
        page: 3,
        title: "Base of the White Cliffs",
        text: `The White Cliffs rose like a wall of chalk and sunlight. Birds wheeled. Wind whistled through cracks.

[Role] [Name] found the first handhold and pulled up.

"One hold at a time," [Name] said. "Courage is a climb."`,
        photoCaption: "Starting the climb",
        useSessionPhoto: false,
        imagePromptHint: "hero starting climb on tall white cliffs watercolor no text",
      },
      {
        page: 4,
        title: "The Wind Shoves Back",
        text: `Halfway up, a gust hit like a giant's push. [Role] [Name]'s foot slipped. Fingers burned on the rock.

[Name] hugged the cliff, heart pounding, and waited out the wind.

Then [Name] laughed — short and fierce — and kept climbing higher than the fear.`,
        photoCaption: "Holding on in the wind",
        useSessionPhoto: false,
        imagePromptHint: "hero clinging to cliff face in strong wind watercolor no text",
      },
      {
        page: 5,
        title: "Goat Thieves of the Ledge",
        text: `On a wide ledge, three cheeky cliff-goats blocked the path, crowns of wildflowers on their heads like tiny jokes.

They had nudged the royal crown higher with their horns for fun.

"I need that crown," [Role] [Name] said firmly. "Not for pride — for the people."

[Name] offered the goats sweet clover from a pouch. While they munched, [Name] slipped past toward the final chimney of rock.`,
        photoCaption: "Outsmarting the goats",
        useSessionPhoto: false,
        imagePromptHint: "hero on cliff ledge with playful goats flower crowns watercolor no text",
      },
      {
        page: 6,
        title: "The Chimney Crack",
        text: `The last stretch was a narrow crack — a rock chimney. [Role] [Name] pressed back and feet to opposite walls and wriggled upward, inch by inch.

Sweat. Dust. A scrape on the royal sleeve (same outfit, still locked, just a little cliff-dusty).

Then [Name]'s hand found open air and blue sky.`,
        photoCaption: "The hardest climb",
        useSessionPhoto: false,
        imagePromptHint: "hero chimney-climbing up narrow rock crack watercolor no text",
      },
      {
        page: 7,
        title: "Crown on the Summit",
        staticScene: "lost-crown/find",
        text: `There it was — the crown — caught on a sunlit spike of stone, glittering like a captured star.

[Role] [Name] crawled across the summit spine, wind roaring, and lifted the crown free with both hands.

"Got you," [Name] whispered.

Below, the whole kingdom looked tiny. Above, the sky felt huge. [Name] had conquered the cliffs.`,
        photoCaption: "Crown recovered",
        useSessionPhoto: false,
        imagePromptHint: "hero on cliff summit holding crown high watercolor no text",
      },
      {
        page: 8,
        title: "The Careful Way Down",
        text: `Getting down was its own adventure. [Role] [Name] used the rope, tested every hold, and talked courage into tired arms.

When boots hit grass at the bottom, [Name] raised the crown and whooped so loud the goats answered from above.`,
        photoCaption: "Safe descent",
        useSessionPhoto: false,
        imagePromptHint: "hero descending cliffs with crown secured watercolor no text",
      },
      {
        page: 9,
        title: "Crown Restored",
        staticScene: "lost-crown/end",
        text: `In the courtyard [Role] [Name] set the crown back where it belonged — not as a trophy of ego, but as a promise kept.

"You guarded what matters," the King said. "You conquered the cliffs."

[Name] stood tall, dusty, victorious.

Keep your heart with all vigilance… — Proverbs 4:23

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero returning crown to courtyard celebration watercolor no text",
      },
    ],
  },
  {
    id: "forest-guardian",
    option: 4,
    label: "Storm in the Forest",
    title: "Storm in the Living Forest",
    description:
      "Race a wild storm through the Living Forest, free the trapped river, and save the ancient trees.",
    bibleVerse: "Genesis 2:15",
    bibleVerseText:
      "The Lord God took the man and put him in the garden of Eden to work it and keep it.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE LAND: Living Forest in a storm. ACTION: falling branches, flooded path, jammed river rocks, climb to free water, protect animals/trees. Hero CONQUERS the storm crisis as steward. No kingdom tour. Genesis 2:15.`,
    bookTitleTemplate: "[Role] [Name] and the Forest Storm",
    pages: [
      {
        page: 1,
        title: "Storm in the Living Forest",
        staticScene: "forest-guardian/title",
        text: `[Role] [Name]
and the Forest Storm`,
        photoCaption: "The forest needs help",
        useSessionPhoto: false,
        imagePromptHint: "cover hero in windy living forest storm light watercolor no text",
      },
      {
        page: 2,
        title: "Trees in Trouble",
        staticScene: "forest-guardian/call",
        text: `The Living Forest groaned. Wind twisted the high branches. Animals ran toward the castle path.

"The river is blocked," a woodcutter cried. "If the water can't move, the roots will drown and the storm will break the old trees."

[Role] [Name] took a deep breath. "Then I go into the storm."`,
        photoCaption: "The call",
        useSessionPhoto: false,
        imagePromptHint: "stormy forest edge animals fleeing hero determined watercolor no text",
      },
      {
        page: 3,
        title: "Into the Roar",
        text: `Leaves flew like green birds. [Role] [Name] pushed into the Living Forest as the canopy thrashed overhead.

A branch crashed across the path. [Name] leapt it. Another cracked to the right — [Name] rolled left and kept running.

This was not a stroll. This was a rescue at full speed.`,
        photoCaption: "Running the storm path",
        useSessionPhoto: false,
        imagePromptHint: "hero running through stormy forest falling branches watercolor no text",
      },
      {
        page: 4,
        title: "The Flooded Path",
        text: `Brown water covered the trail. [Role] [Name] waded in up to the knees, holding the lantern high.

Something bumped [Name]'s leg — a little fox stranded on a root island. [Name] scooped it up and set it on higher ground.

"I've got you. Now the river."`,
        photoCaption: "Wading the flood",
        useSessionPhoto: false,
        imagePromptHint: "hero wading flooded forest path rescuing fox watercolor no text",
      },
      {
        page: 5,
        title: "Rocks in the River",
        text: `At the bend, storm-tumbled boulders jammed the river into a furious swirl. Water had nowhere good to go.

[Role] [Name] climbed onto the wet rocks, found the keystone boulder, and shoved with everything [Name] had.

It budged an inch. Then another.

"Move!" [Name] yelled — and the rock rolled free with a thunder-splash.`,
        photoCaption: "Freeing the river",
        useSessionPhoto: false,
        imagePromptHint: "hero pushing boulder in raging forest river storm watercolor no text",
      },
      {
        page: 6,
        title: "Water Roars Free",
        text: `The river punched through the jam and raced down its old path, singing a wild relieved song.

Trees straightened as the drowning pressure eased. The worst of the thrashing calmed.

[Role] [Name] stood on the rock, soaked, laughing, victorious — guardian in action, not in title only.`,
        photoCaption: "River freed",
        useSessionPhoto: false,
        imagePromptHint: "hero standing on rocks as forest river bursts free watercolor no text",
      },
      {
        page: 7,
        title: "Quiet After the Storm",
        staticScene: "forest-guardian/gift",
        text: `Sunbeams found the leaves again. Birds tried out their voices. The little fox flicked its tail like a thank-you flag.

[Role] [Name] walked the path once more, checking nests and roots, making sure the Living Forest could breathe.`,
        photoCaption: "Forest calms",
        useSessionPhoto: false,
        imagePromptHint: "calm after storm forest sunbeams hero with animals watercolor no text",
      },
      {
        page: 8,
        title: "Keeper of the Woods",
        staticScene: "forest-guardian/end",
        text: `When [Role] [Name] returned, the people had seen the river run true again.

"You kept the garden of the woods," the King said. "That is holy work."

[Name] looked back at the green cathedral of trees and felt proud all the way through.

The Lord God… put him in the garden… to work it and keep it. — Genesis 2:15

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero returning from forest after storm success watercolor no text",
      },
    ],
  },
  {
    id: "kindness-quest",
    option: 5,
    label: "Lantern Run",
    title: "The Midnight Lantern Run",
    description:
      "A village goes dark in a storm. Race supplies across a broken footbridge before midnight.",
    bibleVerse: "Ephesians 4:32",
    bibleVerseText:
      "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE QUEST: storm-dark village + broken footbridge + midnight deadline. ACTION kindness: race with supply sled/lanterns, cross damaged bridge, restart the village light-tower, include the left-out child. Kindness is brave and physical, not boring notes-only. Ephesians 4:32.`,
    bookTitleTemplate: "[Role] [Name] and the Midnight Lantern Run",
    pages: [
      {
        page: 1,
        title: "The Midnight Lantern Run",
        staticScene: "kindness-quest/title",
        text: `[Role] [Name]
and the Midnight Lantern Run`,
        photoCaption: "Lanterns ready",
        useSessionPhoto: false,
        imagePromptHint: "cover hero with glowing lantern night village watercolor no text",
      },
      {
        page: 2,
        title: "The Lights Go Out",
        staticScene: "kindness-quest/call",
        text: `A hard storm knocked out the village light-tower. Windows went black. The cold crept in. People were scared and stuck on opposite sides of the swollen creek.

"If the lanterns aren't across by midnight," the elder said, "families stay separated till morning."

[Role] [Name] loaded a sled with blankets, bread, and lanterns.

"Kindness moves," [Name] said. "I'm running."`,
        photoCaption: "Dark village crisis",
        useSessionPhoto: false,
        imagePromptHint: "dark storm village light tower out hero with supply sled watercolor no text",
      },
      {
        page: 3,
        title: "Sled Through the Gale",
        text: `Wind tried to steal the sled. Rain tried to slow the boots. [Role] [Name] leaned forward and pulled harder.

Through the square. Past the bakery. Down to the creek roar.

Every step was a gift in motion.`,
        photoCaption: "Pulling supplies",
        useSessionPhoto: false,
        imagePromptHint: "hero pulling supply sled through windy rainy street watercolor no text",
      },
      {
        page: 4,
        title: "The Broken Footbridge",
        text: `The footbridge sagged. Two boards missing. Water licked the underside like a hungry animal.

[Role] [Name] lashed the lanterns tight, tested the rope rail, and stepped out.

"People need light more than I need dry socks," [Name] muttered — and crossed.`,
        photoCaption: "Bridge crossing",
        useSessionPhoto: false,
        imagePromptHint: "hero crossing broken footbridge with lanterns night storm watercolor no text",
      },
      {
        page: 5,
        title: "Almost Dropped",
        text: `Mid-bridge, a plank tipped. The sled skidded. One lantern bounced toward the dark water—

[Role] [Name] dove flat and caught the handle with two fingers.

"Not tonight," [Name] told the storm.

Back on feet. Forward again. The far bank came like a cheer.`,
        photoCaption: "Saving the lantern",
        useSessionPhoto: false,
        imagePromptHint: "hero catching falling lantern on broken bridge watercolor no text",
      },
      {
        page: 6,
        title: "Lights for Every Door",
        text: `Door to door [Role] [Name] ran — knock, lantern, blanket, bread, smile, next house.

A shy child stood alone at the edge of the crowd. [Name] turned back on purpose.

"This one's yours. Walk with me."

Kindness isn't only soft. Sometimes it is fast feet and a hand that refuses to leave anyone out.`,
        photoCaption: "Delivering light",
        useSessionPhoto: false,
        imagePromptHint: "hero giving lanterns door to door including shy child watercolor no text",
      },
      {
        page: 7,
        title: "Restart the Tower",
        staticScene: "kindness-quest/gift",
        text: `At the light-tower, [Role] [Name] climbed the wet stairs two at a time and set the master lantern in its glass crown.

Gold light blasted across the roofs. Windows answered one by one until the whole village glowed like a constellation on the ground.

Midnight had not won.`,
        photoCaption: "Village lit again",
        useSessionPhoto: false,
        imagePromptHint: "hero at top of light tower lighting village night watercolor no text",
      },
      {
        page: 8,
        title: "Tables in the Street",
        text: `People pulled tables into the street under the new light. Soup steamed. Laughter came back shy, then loud.

[Role] [Name] sat in the middle, not the throne end — passing bowls, listening, tired in the best way.`,
        photoCaption: "Shared victory meal",
        useSessionPhoto: false,
        imagePromptHint: "village street meal under lantern light hero among people watercolor no text",
      },
      {
        page: 9,
        title: "Brave Kindness",
        staticScene: "kindness-quest/end",
        text: `"You didn't just say kind words," the King told [Role] [Name]. "You crossed the broken bridge. You conquered the dark with love in action."

[Name] looked at the glowing tower and the open doors and felt the truth settle deep:

Be kind to one another, tenderhearted… — Ephesians 4:32

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero peaceful after lantern run village glowing watercolor no text",
      },
    ],
  },
  {
    id: "light-treasure",
    option: 6,
    label: "Treasure Gauntlet",
    title: "The Treasure Gauntlet",
    description:
      "Follow the map through traps, tunnels, and a final leap to the hidden chest — then share it.",
    bibleVerse: "Matthew 5:14",
    bibleVerseText: "You are the light of the world. A city set on a hill cannot be hidden.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE QUEST: treasure gauntlet path. ACTION: map clues, swinging vine gap, dark tunnel, pressure-plate puzzle, final leap to chest of real gold/gems. Hero CONQUERS obstacles and SHARES treasure. No dull kingdom tour. Matthew 5:14.`,
    bookTitleTemplate: "[Role] [Name] and the Treasure Gauntlet",
    pages: [
      {
        page: 1,
        title: "The Treasure Gauntlet",
        staticScene: "light-treasure/title",
        text: `[Role] [Name]
and the Treasure Gauntlet`,
        photoCaption: "Map in hand",
        useSessionPhoto: false,
        imagePromptHint: "cover hero with treasure map and lantern excited watercolor no text",
      },
      {
        page: 2,
        title: "X Marks Trouble",
        staticScene: "light-treasure/call",
        text: `The old map did not show a gentle stroll. It showed a gauntlet: vine gap, whisper tunnel, stone teeth, and a chest under a hill door.

"Find it," the King said. "Then share it. Treasure hidden forever helps no one."

[Role] [Name] rolled the map tight. "I will run the gauntlet."`,
        photoCaption: "Accepting the map",
        useSessionPhoto: false,
        imagePromptHint: "hero with old treasure map castle library determined watercolor no text",
      },
      {
        page: 3,
        title: "The Vine Gap",
        text: `First mark on the map: a canyon with vines hanging like ropes.

[Role] [Name] backed up, ran, jumped—

Caught the vine. Swung. Missed the ledge by a toe. Swung again harder and rolled onto safe grass, laughing.

"One obstacle down."`,
        photoCaption: "Swinging the vine gap",
        useSessionPhoto: false,
        imagePromptHint: "hero swinging on vine across canyon gap watercolor no text",
      },
      {
        page: 4,
        title: "Whisper Tunnel",
        text: `The tunnel tried to scare [Role] [Name] with drips and echoes and shadows that looked bigger than they were.

[Name] held the lantern high and walked faster. "I hear you. I am still coming."

At the far mouth, daylight slapped [Name]'s face like a high-five.`,
        photoCaption: "Through the tunnel",
        useSessionPhoto: false,
        imagePromptHint: "hero in dark tunnel with lantern determined watercolor no text",
      },
      {
        page: 5,
        title: "Stone Teeth Puzzle",
        text: `A hallway of stone "teeth" slammed open and shut in a pattern. Wait… wait… NOW!

[Role] [Name] dashed between the gaps, rolled under the last tooth, and skidded into a golden chamber, map crumpled but spirit on fire.`,
        photoCaption: "Dodging stone traps",
        useSessionPhoto: false,
        imagePromptHint: "hero dashing through slamming stone trap hallway watercolor no text",
      },
      {
        page: 6,
        title: "The Final Leap",
        staticScene: "light-treasure/find",
        text: `Across a black pit sat the treasure chest on a stone island. The jump looked too far.

[Role] [Name] breathed once, twice, then sprinted and leapt with everything in [Name]'s royal heart.

Boots hit stone. Hands hit wood. The chest lid flew open — gold coins, gems, light spilling like sunrise.

"[Name] found it!" [Name] whooped to the empty chamber — then quieter: "Now I share it."`,
        photoCaption: "Treasure found",
        useSessionPhoto: false,
        imagePromptHint: "hero leaping to stone island opening treasure chest gold light watercolor no text",
      },
      {
        page: 7,
        title: "Carry the Light Out",
        text: `The gauntlet felt different on the way back — still hard, but [Role] [Name] knew every trap now. Chest strapped tight. Lantern bright.

Obstacles that once felt impossible became a path [Name] had already conquered.`,
        photoCaption: "Leaving with treasure",
        useSessionPhoto: false,
        imagePromptHint: "hero carrying glowing treasure chest out of cave watercolor no text",
      },
      {
        page: 8,
        title: "Treasure for Everyone",
        staticScene: "light-treasure/end",
        text: `In the square [Role] [Name] opened the chest for the whole kingdom — coins for repairs, gems for the light-tower, joy for every open hand.

"You ran the gauntlet," the King said. "You conquered fear. And you did not hide the light."

You are the light of the world… — Matthew 5:14

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero sharing treasure chest with village celebration watercolor no text",
      },
    ],
  },
];;
