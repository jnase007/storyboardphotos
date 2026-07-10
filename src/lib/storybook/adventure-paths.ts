import type { KingdomSet, StoryGender, StoryPage } from "./types";

/**
 * Choose-your-own-adventure paths for the kiosk / generator.
 * Kids pick one quest; scripts use placeholders filled at generate time.
 *
 * Placeholders: [Name] [Role] [she/he/they] [She/He/They]
 * [her/his/their] [Her/His/Their] [her/him/them] [is/are]
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
  /** Extra guidance for AI rewriting */
  aiTheme: string;
  /** Book title with [Role] and [Name] */
  bookTitleTemplate: string;
  pages: AdventureScriptPage[];
};

export const TITLE_ROLE = {
  girl: "Princess",
  boy: "Prince",
  other: "Royal Hero",
} as const;

export function getPronouns(gender: StoryGender) {
  if (gender === "girl") {
    return {
      they: "she",
      They: "She",
      their: "her",
      Their: "Her",
      them: "her",
      is: "is",
    };
  }
  if (gender === "boy") {
    return {
      they: "he",
      They: "He",
      their: "his",
      Their: "His",
      them: "him",
      is: "is",
    };
  }
  return {
    they: "they",
    They: "They",
    their: "their",
    Their: "Their",
    them: "them",
    is: "are",
  };
}

/** Fill script placeholders for a child. */
export function fillPlaceholders(
  text: string,
  childName: string,
  gender: StoryGender
): string {
  const role = TITLE_ROLE[gender];
  const p = getPronouns(gender);
  return text
    .replace(/\[Child['']s Name\]/g, childName)
    .replace(/\[Name\]/g, childName)
    .replace(/\[Role\]/g, role)
    .replace(/\[she\/he\/they\]/g, p.they)
    .replace(/\[She\/He\/They\]/g, p.They)
    .replace(/\[her\/his\/their\]/g, p.their)
    .replace(/\[Her\/His\/Their\]/g, p.Their)
    .replace(/\[her\/him\/them\]/g, p.them)
    .replace(/\[is\/are\]/g, p.is);
}

export const ADVENTURE_PATHS_STORAGE_KEY = "sbp-adventure-paths-v1";

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

  const pages: StoryPage[] = path.pages.map((p) => {
    const photoSet = p.photoSet ?? null;
    // If explicitly set in script, respect it.
    // Otherwise: use session photo only for set portraits (pages 2-5 with a photoSet).
    // Action/adventure pages (no photoSet, or last 2 pages) get AI watercolor.
    const useSessionPhoto =
      p.useSessionPhoto !== undefined
        ? p.useSessionPhoto
        : photoSet !== null && p.page > 1 && p.page < 7;

    return {
      page: p.page,
      title: fillPlaceholders(p.title, childName, gender),
      text: fillPlaceholders(p.text, childName, gender),
      imageUrl: null,
      photoSet,
      useSessionPhoto,
      imagePrompt:
        fillPlaceholders(
          p.imagePromptHint ||
            `Watercolor children's book illustration of [Role] [Name] in a kingdom adventure, soft golden light, magical atmosphere, no text`,
          childName,
          gender
        ) + `, age ${childAge}`,
    };
  });

  if (notes?.trim() && pages[1]) {
    pages[1].text += `\n\n(Special note from the session: ${notes.trim()})`;
  }

  return { bookTitle, pages };
}

export const ADVENTURE_PATHS: AdventurePath[] = [
  {
    id: "dragon-slayer",
    option: 1,
    label: "Slay the Dragon",
    title: "The Dragon Quest",
    description:
      "Face the great dragon with courage - and discover that bravery can turn a foe into a friend.",
    aiTheme:
      "Child faces a fearsome-but-not-gory dragon threatening the kingdom. Climax is courage and kindness that calms or befriends the dragon - never graphic violence. Theme: true strength protects others.",
    bookTitleTemplate: "[Role] [Name] and the Dragon Quest",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Dragon Quest",
        photoCaption: "Royal portrait of the child",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor portrait of [Role] [Name] with a gentle crown, soft cream background, children's book style, no text",
      },
      {
        page: 2,
        title: "The Call",
        text: "In the Kingdom of Light, word spread like wildfire - a great dragon had settled near the hills, and the people were afraid.\n\nThe King called upon [Role] [Name]:\n\n"[Name], the kingdom needs your courage. Will you face the dragon and bring peace back to our lands?"\n\n[She/He/They] stood tall. The adventure had begun.",
        photoCaption: "Child looking ready for adventure",
        imagePromptHint:
          "Watercolor of [Role] [Name] receiving a quest scroll, distant dragon silhouette on hills, hopeful children's book style, no text",
      },
      {
        page: 3,
        title: "Throne Room",
        text: "First, [Role] [Name] entered the majestic Throne Room.\n\n[She/He/They] sat upon the golden throne and felt the honor of royalty - and the duty to protect [her/his/their] people.\n\n"I am brave," [she/he/they] whispered. "I am loved. I will face the dragon with a true heart."",
        photoCaption: "Photo from Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] on a golden throne preparing for a dragon quest, warm banners, children's book style, no text",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "Next, [she/he/they] journeyed through the Royal Forest, where lanterns glowed between ancient trees.\n\nA woodland creature whispered that the dragon was not only fierce - it was lonely and misunderstood.\n\n[Role] [Name] listened carefully. Courage, [she/he/they] realized, begins with understanding.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] in a lantern-lit forest learning about a dragon, magical trees, children's book illustration, no text",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "In the Royal Garden, flowers bloomed in every color.\n\nHere [Role] [Name] gathered a gift - a glowing blossom said to calm even the wildest heart.\n\nKindness would be [her/his/their] shield. Bravery would be [her/his/their] sword.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] picking a glowing blossom in a royal garden, soft sunlight, children's book style, no text",
      },
      {
        page: 6,
        title: "Chastle",
        text: "At last, [Role] [Name] faced the Chastle — and the great dragon itself.\n\nThe dragon roared. The ground trembled. But [Name] did not run.\n\n[She/He/They] offered the glowing blossom and spoke with a steady voice:\n\n"You do not have to be alone. The kingdom can be your home — if you choose peace."\n\nThe dragon's fire softened to warm golden light. A new friendship was born.",
        photoCaption: "Dragon battle scene — AI watercolor",
        photoSet: "Chastle",
        useSessionPhoto: false,
        imagePromptHint:
          "Watercolor of [Role] [Name] bravely facing a friendly dragon with a glowing flower, heroic but gentle, children's book illustration, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: "When [Role] [Name] returned to the castle, the whole kingdom celebrated.\n\nThe dragon soared above the towers - not as an enemy, but as a guardian of the realm.\n\n[Name] had learned that true courage protects, listens, and turns fear into hope.",
        photoCaption: "Child looking proud",
        imagePromptHint:
          "Watercolor celebration with [Role] [Name] and a friendly dragon above the castle, warm golden tones, children's book style, no text",
      },
      {
        page: 8,
        title: "The End",
        text: "And so, [Role] [Name] lived bravely ever after,\nknowing [she/he/they] [is/are] strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final portrait",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor closing portrait of [Role] [Name] with soft golden light and a gentle smile, children's book illustration, no text",
      },
    ],
  },
  {
    id: "rescue-mission",
    option: 2,
    label: "Rescue Mission",
    title: "The Rescue Mission",
    description:
      "Someone needs help! Race through the kingdom to rescue friends and bring them safely home.",
    aiTheme:
      "Child leads a rescue mission to save villagers or friends in trouble (lost, trapped, or scared - never dark). Theme: helping others, teamwork, compassion.",
    bookTitleTemplate: "[Role] [Name] and the Rescue Mission",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Rescue Mission",
        photoCaption: "Royal portrait of the child",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor portrait of [Role] [Name] ready for a rescue quest, soft cream background, children's book style, no text",
      },
      {
        page: 2,
        title: "The Call",
        text: "A messenger raced into the Kingdom of Light with urgent news - friends from the valley were missing, and night was falling fast.\n\nThe King turned to [Role] [Name]:\n\n"[Name], will you lead the rescue? The kingdom trusts your brave and caring heart."\n\nWithout hesitation, [she/he/they] answered, "I will find them."",
        photoCaption: "Child looking determined",
        imagePromptHint:
          "Watercolor of [Role] [Name] receiving urgent news in a castle courtyard, children's book style, no text",
      },
      {
        page: 3,
        title: "Throne Room",
        text: "In the Throne Room, [Role] [Name] received a royal map and a lantern of hope.\n\n[She/He/They] promised the people: "No one in our kingdom is left behind."\n\nThen [she/he/they] set out, heart steady and eyes bright.",
        photoCaption: "Photo from Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] with a map and lantern in a throne room, children's book illustration, no text",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "Through the Royal Forest, [Name] followed soft footprints and distant calls for help.\n\nLantern light guided [her/him/them] between the trees until [she/he/they] found the first friend - cold, scared, but safe.\n\n"You're not alone anymore," [Role] [Name] said gently.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] finding a friend in a lantern-lit forest, caring moment, children's book style, no text",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "In the Royal Garden, another friend had wandered among the roses and lost the path home.\n\n[Role] [Name] offered a hand and a smile.\n\nTogether they walked, and the garden seemed to bloom brighter with every step of kindness.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] helping a friend through a blooming garden, warm light, children's book illustration, no text",
      },
      {
        page: 6,
        title: "Chastle",
        text: "The final rescue waited at the Chastle - a bridge too high for little feet, and a friend too frightened to cross.\n\n[Role] [Name] stood beside them and whispered, "We go together."\n\nStep by step, hand in hand, they crossed. Everyone was safe.",
        photoCaption: "Photo from Chastle",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] helping a friend cross a gentle bridge, brave and kind, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: "Back at the castle, cheers rose like music.\n\nFamilies hugged. Friends laughed. The King placed a hand on [Name]'s shoulder.\n\n"You did not just find the lost," he said. "You reminded us what royalty means - to care for one another."",
        photoCaption: "Child looking proud",
        imagePromptHint:
          "Watercolor celebration as [Role] [Name] returns with rescued friends, castle hall, children's book style, no text",
      },
      {
        page: 8,
        title: "The End",
        text: "And so, [Role] [Name] lived bravely ever after,\nknowing [she/he/they] [is/are] strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final portrait",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor closing portrait of [Role] [Name] with soft golden light, children's book illustration, no text",
      },
    ],
  },
  {
    id: "lost-crown",
    option: 3,
    label: "Find the Crown",
    title: "The Lost Crown",
    description:
      "The royal crown is missing! Follow clues across the kingdom to bring it home.",
    aiTheme:
      "Mystery adventure: the royal crown is lost. Child follows clues through the four sets and recovers it. Theme: responsibility, observation, honesty.",
    bookTitleTemplate: "[Role] [Name] and the Lost Crown",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Lost Crown",
        photoCaption: "Royal portrait of the child",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor portrait of [Role] [Name] with a soft crown motif, cream background, children's book style, no text",
      },
      {
        page: 2,
        title: "The Call",
        text: "Morning bells rang strangely in the Kingdom of Light - the royal crown was gone from its velvet pillow!\n\nThe King looked to [Role] [Name]:\n\n"You notice what others miss. Will you find our crown and restore the kingdom's light?"\n\n[Name] nodded. A mystery awaited.",
        photoCaption: "Child looking curious",
        imagePromptHint:
          "Watercolor of [Role] [Name] beside an empty crown pillow, mystery mood, children's book style, no text",
      },
      {
        page: 3,
        title: "Throne Room",
        text: "In the Throne Room, [Role] [Name] searched carefully.\n\nBeneath a banner, [she/he/they] found the first clue: a golden thread leading toward the forest.\n\n"Every clue brings us closer," [she/he/they] said with a spark of hope.",
        photoCaption: "Photo from Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] finding a golden thread clue in a throne room, children's book illustration, no text",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "The golden thread wound through the Royal Forest.\n\nAmong the lanterns, [Name] discovered a second clue - a sparkling jewel that belonged to the crown.\n\nThe path was becoming clear.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] finding a jewel in a lantern forest, children's book style, no text",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "In the Royal Garden, petals hid a tiny map drawn in gold ink.\n\nIt pointed to the Chastle - where the crown waited for someone brave enough to claim it with honesty, not greed.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] reading a tiny gold map among flowers, children's book illustration, no text",
      },
      {
        page: 6,
        title: "Chastle",
        text: "At the Chastle, [Role] [Name] found the crown resting on a stone of light.\n\nA soft voice asked, "Who seeks the crown - for glory, or for the people?"\n\n"For the people," [Name] answered.\n\nThe crown shone, and [she/he/they] lifted it with care.",
        photoCaption: "Photo from Chastle",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] reclaiming a glowing crown on a stone of light, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: "When [Role] [Name] returned the crown to the King, the kingdom glowed brighter than before.\n\n"You found more than gold," the King said. "You found the meaning of royalty - to serve with a true heart."",
        photoCaption: "Child looking proud",
        imagePromptHint:
          "Watercolor of [Role] [Name] returning the crown in a castle hall, celebration light, children's book style, no text",
      },
      {
        page: 8,
        title: "The End",
        text: "And so, [Role] [Name] lived bravely ever after,\nknowing [she/he/they] [is/are] strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final portrait",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor closing portrait of [Role] [Name] with soft golden light, children's book illustration, no text",
      },
    ],
  },
  {
    id: "forest-guardian",
    option: 4,
    label: "Forest Guardian",
    title: "The Forest Guardian",
    description:
      "The enchanted forest needs a protector. Defend the creatures and restore the magic.",
    aiTheme:
      "Child becomes guardian of the enchanted forest, helping animals and restoring magic. Theme: stewardship, gentleness with nature, quiet courage.",
    bookTitleTemplate: "[Role] [Name] and the Forest Guardian",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Forest Guardian",
        photoCaption: "Royal portrait of the child",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor portrait of [Role] [Name] with soft forest light, children's book style, no text",
      },
      {
        page: 2,
        title: "The Call",
        text: "The lanterns of the Royal Forest flickered weakly - the magic that protected the woodland creatures was fading.\n\nThe King asked [Role] [Name]:\n\n"Will you become the Forest Guardian and bring the light back to the trees?"\n\n[She/He/They] felt the call of the wild and whispered, "Yes."",
        photoCaption: "Child looking wonder-struck",
        imagePromptHint:
          "Watercolor of [Role] [Name] called to protect a magical forest, children's book style, no text",
      },
      {
        page: 3,
        title: "Throne Room",
        text: "In the Throne Room, [Role] [Name] received a guardian's cloak woven with leaf-gold thread.\n\n"Protect the small and the quiet," the King said. "That is true power."\n\n[Name] bowed and set out for the woods.",
        photoCaption: "Photo from Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] receiving a leaf-gold cloak in a throne room, children's book illustration, no text",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "Deep in the Royal Forest, [Name] found frightened creatures hiding from the dark.\n\n[She/He/They] lit the lanterns one by one and sang a soft song of courage.\n\nThe trees seemed to lean closer, listening.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] lighting lanterns for forest creatures, magical trees, children's book style, no text",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "The Royal Garden offered seeds of starlight - tiny sparks that could heal tired roots.\n\n[Role] [Name] carried them carefully, knowing every living thing deserved care.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] gathering glowing seeds in a garden, children's book illustration, no text",
      },
      {
        page: 6,
        title: "Chastle",
        text: "At the Chastle, a shadow tried to snuff out the last forest light.\n\n[Role] [Name] planted the starlight seeds and stood firm.\n\nLight bloomed. The shadow fled. The forest breathed again - and named [Name] its guardian.",
        photoCaption: "Photo from Chastle",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] restoring forest light against a soft shadow, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: "When [Role] [Name] returned, birds sang over the castle walls.\n\nThe King smiled. "You guarded what could not speak for itself. That is the heart of a true [Role]."",
        photoCaption: "Child looking proud",
        imagePromptHint:
          "Watercolor of [Role] [Name] welcomed home with birds and forest light, children's book style, no text",
      },
      {
        page: 8,
        title: "The End",
        text: "And so, [Role] [Name] lived bravely ever after,\nknowing [she/he/they] [is/are] strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final portrait",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor closing portrait of [Role] [Name] with soft forest-gold light, children's book illustration, no text",
      },
    ],
  },
  {
    id: "kindness-quest",
    option: 5,
    label: "Kindness Quest",
    title: "The Kindness Quest",
    description:
      "A lonely corner of the kingdom needs warmth. Heal hearts with courage and kindness.",
    aiTheme:
      "Emotional adventure: child spreads kindness to heal loneliness or sadness in the kingdom. Theme: empathy, inclusion, gentle bravery.",
    bookTitleTemplate: "[Role] [Name] and the Kindness Quest",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Kindness Quest",
        photoCaption: "Royal portrait of the child",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor portrait of [Role] [Name] with a warm gentle smile, children's book style, no text",
      },
      {
        page: 2,
        title: "The Call",
        text: "Not every quest needs a sword. In the Kingdom of Light, a quiet sadness had settled over one village - people felt unseen and alone.\n\nThe King asked [Role] [Name]:\n\n"Will you carry kindness like a lantern and remind everyone they belong?"\n\n[Name]'s answer was soft and sure: "I will."",
        photoCaption: "Child looking compassionate",
        imagePromptHint:
          "Watercolor of [Role] [Name] holding a lantern of kindness, children's book style, no text",
      },
      {
        page: 3,
        title: "Throne Room",
        text: "From the Throne Room, [Role] [Name] gathered notes of encouragement written in gold ink.\n\n"Words can be as brave as armor," [she/he/they] said, and set out to share them.",
        photoCaption: "Photo from Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] with golden notes of encouragement in a throne room, children's book illustration, no text",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "In the Royal Forest, [Name] met a traveler who had lost hope.\n\n[She/He/They] sat beside them, listened, and left a note that read: You matter.\n\nThe forest felt warmer somehow.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] comforting a traveler in a lantern forest, children's book style, no text",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "In the Royal Garden, [Role] [Name] invited shy children to plant flowers together.\n\nLaughter returned like spring rain. Kindness, [she/he/they] learned, grows when it is shared.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] planting flowers with other children in a garden, children's book illustration, no text",
      },
      {
        page: 6,
        title: "Chastle",
        text: "The Chastle asked [Name] to speak kindness even when it felt hard - to include someone who had been left out.\n\n[She/He/They] reached out a hand.\n\nThat single brave moment lit the whole kingdom.",
        photoCaption: "Photo from Chastle",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] including someone left out, warm heroic kindness, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: "When [Role] [Name] returned, the village glowed with new friendships.\n\nThe King said, "You healed what swords cannot. That is royal magic."",
        photoCaption: "Child looking proud",
        imagePromptHint:
          "Watercolor celebration of kindness with [Role] [Name] at the castle, children's book style, no text",
      },
      {
        page: 8,
        title: "The End",
        text: "And so, [Role] [Name] lived bravely ever after,\nknowing [she/he/they] [is/are] strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final portrait",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor closing portrait of [Role] [Name] with soft golden light, children's book illustration, no text",
      },
    ],
  },
  {
    id: "light-treasure",
    option: 6,
    label: "Treasure of Light",
    title: "The Treasure of Light",
    description:
      "The kingdom's light has been stolen! Recover the treasure and bring the glow home.",
    aiTheme:
      "Quest to recover a stolen magical light/treasure that keeps the kingdom bright. Theme: perseverance, hope, sharing light with others.",
    bookTitleTemplate: "[Role] [Name] and the Treasure of Light",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Treasure of Light",
        photoCaption: "Royal portrait of the child",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor portrait of [Role] [Name] with a glowing treasure motif, children's book style, no text",
      },
      {
        page: 2,
        title: "The Call",
        text: "One night, the stars above the Kingdom of Light dimmed - the Treasure of Light had been taken from the tower.\n\nThe King called [Role] [Name]:\n\n"Bring back our light, and remind everyone that hope can be found again."\n\n[Name] lifted a small empty lantern. "I will fill it."",
        photoCaption: "Child holding a lantern",
        imagePromptHint:
          "Watercolor of [Role] [Name] with an empty lantern under dim stars, children's book style, no text",
      },
      {
        page: 3,
        title: "Throne Room",
        text: "In the Throne Room, [Role] [Name] learned the treasure was not gold - it was a crystal of shared hope.\n\nWhoever held it must give light away, not keep it.\n\n"Then I will share it," [she/he/they] promised.",
        photoCaption: "Photo from Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] learning about a crystal of hope in a throne room, children's book illustration, no text",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "Through the Royal Forest, sparks of stolen light flickered between the trees.\n\n[Name] gathered them gently into [her/his/their] lantern until the path ahead glowed.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] collecting light sparks in a forest lantern, children's book style, no text",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "In the Royal Garden, moonflowers opened only for a true heart.\n\nThey pointed [Role] [Name] toward the Chastle, where the crystal waited for someone who would share its glow.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] among glowing moonflowers in a garden, children's book illustration, no text",
      },
      {
        page: 6,
        title: "Chastle",
        text: "At the Chastle, a shadow tried to keep the Treasure of Light for itself.\n\n[Role] [Name] did not fight with anger. [She/He/They] opened the lantern and offered light freely.\n\nThe shadow melted. The crystal shone. The kingdom's treasure was restored.",
        photoCaption: "Photo from Chastle",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] restoring a glowing crystal of light, heroic and gentle, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: "When [Role] [Name] returned, every window in the kingdom glowed.\n\nThe King placed the crystal where all could see it.\n\n"You brought the light home," he said, "because you were willing to share it."",
        photoCaption: "Child looking proud",
        imagePromptHint:
          "Watercolor of [Role] [Name] returning the glowing treasure to a bright castle, children's book style, no text",
      },
      {
        page: 8,
        title: "The End",
        text: "And so, [Role] [Name] lived bravely ever after,\nknowing [she/he/they] [is/are] strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final portrait",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor closing portrait of [Role] [Name] with soft golden light, children's book illustration, no text",
      },
    ],
  },
];
