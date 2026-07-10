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
    const useSessionPhoto =
      p.useSessionPhoto ?? (photoSet !== null || p.page === 1 || p.page === 8);

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
        title: `The Dragon Quest`,
        text: `[Role] [Name]\nand the Dragon Quest`,
        photoCaption: `A magical kingdom awaits`,
        useSessionPhoto: false,
        imagePromptHint:
          "[Role] [Name] title page with a glowing dragon silhouette on distant hills, royal crest, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 2,
        title: `The Call`,
        text: `In the Kingdom of Light, word spread like wildfire — a great dragon had settled near the hills, and the people were afraid.\n\nThe King called upon [Role] [Name]:\n\n"[Name], the kingdom needs your courage. Will you face the dragon and bring peace back to our lands?"\n\n[She/He/They] stood tall. The adventure had begun.`,
        photoCaption: `The quest begins`,
        useSessionPhoto: false,
        imagePromptHint:
          "[Role] [Name] receiving a quest scroll in a grand castle hall, a distant dragon silhouette on misty hills through the window, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 3,
        title: `The Royal Throne`,
        text: `First, [Role] [Name] entered the majestic Throne Room.\n\n[She/He/They] sat upon the golden throne and felt the honor of royalty — and the duty to protect [her/his/their] people.\n\n"I am brave," [she/he/they] whispered. "I am loved."`,
        photoCaption: `Portrait from the Throne Room`,
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "[Role] [Name] on a golden throne with royal banners, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 4,
        title: `A Royal Promise`,
        text: `[Role] [Name] rose from the throne and made a royal promise to the people of the kingdom.\n\n"I will face the dragon with a true heart. I will bring peace to our land."\n\nThe people cheered, and [she/he/they] set out on [her/his/their] great quest.`,
        photoCaption: `Royal portrait`,
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "[Role] [Name] standing tall before royal banners making a promise, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 5,
        title: `Into the Royal Forest`,
        text: `[Role] [Name] journeyed into the Royal Forest, where lanterns glowed between ancient trees.\n\nA wise woodland creature appeared on a mossy log.\n\n"The dragon is not only fierce," it whispered. "It is lonely and misunderstood. To face it, you must first understand it."`,
        photoCaption: `Portrait in the Royal Forest`,
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "[Role] [Name] in a glowing lantern forest talking with a woodland creature, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 6,
        title: `Secrets of the Forest`,
        text: `Deep in the Royal Forest, [Name] listened to the ancient trees.\n\nTheir rustling leaves told stories of the dragon — once a gentle creature, now frightened and alone.\n\n[Role] [Name] felt something change in [her/his/their] heart. Courage, [she/he/they] realized, begins with understanding.`,
        photoCaption: `Forest portrait`,
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "[Role] [Name] listening to whispering ancient trees in a magical forest, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 7,
        title: `The Forest Path`,
        text: `Suddenly — a great shadow swept over the treetops!\n\nThe dragon circled overhead, its wings stirring the lanterns like leaves in the wind.\n\n[Role] [Name] did not run. [She/He/They] stood still, looked up, and held out a steady hand of peace.`,
        photoCaption: `A shadow overhead`,
        useSessionPhoto: false,
        imagePromptHint:
          "A large friendly dragon flying overhead in a glowing forest, [Role] [Name] standing bravely below with hand outstretched, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 8,
        title: `The Royal Garden`,
        text: `In the Royal Garden, flowers bloomed in every color under the golden sun.\n\nHere [Role] [Name] searched for a special gift — a glowing blossom said to calm even the wildest heart.\n\n"Kindness will be my shield," [she/he/they] said softly.`,
        photoCaption: `Portrait in the Royal Garden`,
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "[Role] [Name] searching among colorful blooms in a royal garden, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 9,
        title: `The Glowing Blossom`,
        text: `[Role] [Name] found it at the heart of the garden — a single blossom glowing soft as moonlight.\n\n[She/He/They] cupped it gently in both hands.\n\nBravery would be [her/his/their] sword. Kindness would be [her/his/their] shield. Now [she/he/they] was ready.`,
        photoCaption: `Garden portrait`,
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "[Role] [Name] holding a glowing magical blossom in a royal garden, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 10,
        title: `Garden Magic`,
        text: `As [Role] [Name] held the blossom, the whole garden seemed to glow.\n\nButterflies of light danced around [her/him/them], and for a moment the world felt very still and very safe.\n\n"You are ready," whispered the wind through the flowers.`,
        photoCaption: `A moment of magic`,
        useSessionPhoto: false,
        imagePromptHint:
          "A royal garden glowing with magic, butterflies of golden light swirling around a lone figure, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 11,
        title: `The Chastle`,
        text: `At last [Role] [Name] reached the Chastle — the ancient fortress at the edge of the kingdom.\n\nIts towers rose high above the mist, and from inside came the rumbling breath of the great dragon.\n\n[She/He/They] took a deep breath and stepped through the gate.`,
        photoCaption: `Portrait at the Chastle`,
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "[Role] [Name] entering an ancient fortress gate, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 12,
        title: `Face to Face`,
        text: `[Role] [Name] walked into the great hall of the Chastle.\n\nThere, curled among the stones, was the dragon — enormous and glowing like embers.\n\n[She/He/They] stood tall, heart steady, and waited.`,
        photoCaption: `Chastle portrait`,
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "[Role] [Name] standing bravely in an ancient hall facing a large glowing dragon, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 13,
        title: `The Dragon Roars`,
        text: `The dragon roared. The ground trembled. Fire flickered at the edges of the room.\n\nBut [Role] [Name] did not run.\n\n[She/He/They] stepped forward and held out the glowing blossom — a small and gentle light in the dark.`,
        photoCaption: `Courage in the dark`,
        useSessionPhoto: false,
        imagePromptHint:
          "A brave child holding a glowing blossom before a roaring dragon in an ancient hall, fire light flickering warmly, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 14,
        title: `A New Friend`,
        text: `[Role] [Name] spoke with a steady voice:\n\n"You do not have to be alone. The kingdom can be your home — if you choose peace."\n\nThe dragon blinked. Its fire softened to warm golden light.\n\nSlowly, gently, it lowered its great head. A new friendship was born.`,
        photoCaption: `Friendship begins`,
        useSessionPhoto: false,
        imagePromptHint:
          "A dragon bowing its great head gently toward a small brave child who holds a glowing flower, golden warm light filling the hall, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 15,
        title: `Victory!`,
        text: `Word raced back to the Kingdom of Light: the dragon had been calmed!\n\nNot by a sword — but by a brave and kind heart.\n\n[Role] [Name] had done what no warrior could: [she/he/they] had turned a fearsome foe into a faithful friend.`,
        photoCaption: `Victory for the kingdom`,
        useSessionPhoto: false,
        imagePromptHint:
          "A joyful kingdom celebration scene with banners and golden light, a friendly dragon visible above the castle towers, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 16,
        title: `The Celebration`,
        text: `The whole kingdom erupted in celebration!\n\nBells rang from every tower. Flowers rained from the windows. The dragon soared above the rooftops — not as an enemy, but as a guardian of the realm.\n\nAnd at the center of it all stood [Role] [Name], beaming with joy.`,
        photoCaption: `Celebration in the kingdom`,
        useSessionPhoto: false,
        imagePromptHint:
          "A grand kingdom celebration with bells, flowers falling from windows, and a friendly dragon soaring above celebrating crowds, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 17,
        title: `The Return Home`,
        text: `[Role] [Name] rode home beside the great dragon, who now wore a wreath of flowers around its neck.\n\nAlong the road, children waved and cheered.\n\n[Name] waved back, [her/his/their] heart full — knowing that home was always worth fighting for.`,
        photoCaption: `The journey home`,
        useSessionPhoto: false,
        imagePromptHint:
          "[Role] [Name] riding beside a friendly flower-wreathed dragon on a golden road while children wave from the roadside, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 18,
        title: `The King's Gift`,
        text: `The King met [Role] [Name] at the castle gate with a smile and a golden medallion.\n\n"You have given the kingdom something more precious than treasure," he said. "You have shown us that courage and kindness together can change the world."\n\n[Name] placed the medallion over [her/his/their] heart.`,
        photoCaption: `A royal gift`,
        useSessionPhoto: false,
        imagePromptHint:
          "A king presenting a golden medallion to [Role] [Name] at a castle gate, warm ceremony, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 19,
        title: `Under the Stars`,
        text: `That night, [Role] [Name] sat on the castle wall as the stars came out one by one.\n\nThe dragon curled peacefully at the base of the tower, breathing slow and warm.\n\n[She/He/They] looked up at the sky and felt something deep and quiet — the peace of a job done with love.`,
        photoCaption: `A peaceful night`,
        useSessionPhoto: false,
        imagePromptHint:
          "[Role] [Name] sitting on a castle wall under a starry sky, a sleeping dragon peacefully below, moonlight and starlight glowing softly, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
      },
      {
        page: 20,
        title: `The End`,
        text: `And so, [Role] [Name] lived bravely ever after,\nknowing [she/he/they] [is/are] strong, kind, and deeply loved.\n\nTrue courage protects. True kindness heals.\nAnd true heroes carry both in their hearts.\n\nThe End.`,
        photoCaption: `The End`,
        useSessionPhoto: false,
        imagePromptHint:
          "A soft closing illustration of a glowing kingdom at peace under a starry sky, a small crown and flower in the foreground, watercolor and colored pencil children's storybook illustration style, soft ink outlines, gentle pastel washes on cream background, magical kingdom atmosphere, warm golden light, no text",
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
        text: `A messenger raced into the Kingdom of Light with urgent news - friends from the valley were missing, and night was falling fast.\n\nThe King turned to [Role] [Name]:\n\n"[Name], will you lead the rescue? The kingdom trusts your brave and caring heart."\n\nWithout hesitation, [she/he/they] answered, "I will find them."`,
        photoCaption: "Child looking determined",
        imagePromptHint:
          "Watercolor of [Role] [Name] receiving urgent news in a castle courtyard, children's book style, no text",
      },
      {
        page: 3,
        title: "Castle Throne Room",
        text: `In the Castle Throne Room, [Role] [Name] received a royal map and a lantern of hope.\n\n[She/He/They] promised the people: "No one in our kingdom is left behind."\n\nThen [she/he/they] set out, heart steady and eyes bright.`,
        photoCaption: "Photo from Castle Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] with a map and lantern in a throne room, children's book illustration, no text",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: `Through the Royal Forest, [Name] followed soft footprints and distant calls for help.\n\nLantern light guided [her/him/them] between the trees until [she/he/they] found the first friend - cold, scared, but safe.\n\n"You're not alone anymore," [Role] [Name] said gently.`,
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
        title: "Courage Quest",
        text: `The final rescue waited at the Courage Quest - a bridge too high for little feet, and a friend too frightened to cross.\n\n[Role] [Name] stood beside them and whispered, "We go together."\n\nStep by step, hand in hand, they crossed. Everyone was safe.`,
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] helping a friend cross a gentle bridge, brave and kind, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: `Back at the castle, cheers rose like music.\n\nFamilies hugged. Friends laughed. The King placed a hand on [Name]'s shoulder.\n\n"You did not just find the lost," he said. "You reminded us what royalty means - to care for one another."`,
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
        text: `Morning bells rang strangely in the Kingdom of Light - the royal crown was gone from its velvet pillow!\n\nThe King looked to [Role] [Name]:\n\n"You notice what others miss. Will you find our crown and restore the kingdom's light?"\n\n[Name] nodded. A mystery awaited.`,
        photoCaption: "Child looking curious",
        imagePromptHint:
          "Watercolor of [Role] [Name] beside an empty crown pillow, mystery mood, children's book style, no text",
      },
      {
        page: 3,
        title: "Castle Throne Room",
        text: `In the Castle Throne Room, [Role] [Name] searched carefully.\n\nBeneath a banner, [she/he/they] found the first clue: a golden thread leading toward the forest.\n\n"Every clue brings us closer," [she/he/they] said with a spark of hope.`,
        photoCaption: "Photo from Castle Throne Room",
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
        text: "In the Royal Garden, petals hid a tiny map drawn in gold ink.\n\nIt pointed to the Courage Quest - where the crown waited for someone brave enough to claim it with honesty, not greed.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] reading a tiny gold map among flowers, children's book illustration, no text",
      },
      {
        page: 6,
        title: "Courage Quest",
        text: `At the Courage Quest, [Role] [Name] found the crown resting on a stone of light.\n\nA soft voice asked, "Who seeks the crown - for glory, or for the people?"\n\n"For the people," [Name] answered.\n\nThe crown shone, and [she/he/they] lifted it with care.`,
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] reclaiming a glowing crown on a stone of light, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: `When [Role] [Name] returned the crown to the King, the kingdom glowed brighter than before.\n\n"You found more than gold," the King said. "You found the meaning of royalty - to serve with a true heart."`,
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
        text: `The lanterns of the Royal Forest flickered weakly - the magic that protected the woodland creatures was fading.\n\nThe King asked [Role] [Name]:\n\n"Will you become the Forest Guardian and bring the light back to the trees?"\n\n[She/He/They] felt the call of the wild and whispered, "Yes."`,
        photoCaption: "Child looking wonder-struck",
        imagePromptHint:
          "Watercolor of [Role] [Name] called to protect a magical forest, children's book style, no text",
      },
      {
        page: 3,
        title: "Castle Throne Room",
        text: `In the Castle Throne Room, [Role] [Name] received a guardian's cloak woven with leaf-gold thread.\n\n"Protect the small and the quiet," the King said. "That is true power."\n\n[Name] bowed and set out for the woods.`,
        photoCaption: "Photo from Castle Throne Room",
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
        title: "Courage Quest",
        text: "At the Courage Quest, a shadow tried to snuff out the last forest light.\n\n[Role] [Name] planted the starlight seeds and stood firm.\n\nLight bloomed. The shadow fled. The forest breathed again - and named [Name] its guardian.",
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] restoring forest light against a soft shadow, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: `When [Role] [Name] returned, birds sang over the castle walls.\n\nThe King smiled. "You guarded what could not speak for itself. That is the heart of a true [Role]."`,
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
        text: `Not every quest needs a sword. In the Kingdom of Light, a quiet sadness had settled over one village - people felt unseen and alone.\n\nThe King asked [Role] [Name]:\n\n"Will you carry kindness like a lantern and remind everyone they belong?"\n\n[Name]'s answer was soft and sure: "I will."`,
        photoCaption: "Child looking compassionate",
        imagePromptHint:
          "Watercolor of [Role] [Name] holding a lantern of kindness, children's book style, no text",
      },
      {
        page: 3,
        title: "Castle Throne Room",
        text: `From the Castle Throne Room, [Role] [Name] gathered notes of encouragement written in gold ink.\n\n"Words can be as brave as armor," [she/he/they] said, and set out to share them.`,
        photoCaption: "Photo from Castle Throne Room",
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
        title: "Courage Quest",
        text: "The Courage Quest asked [Name] to speak kindness even when it felt hard - to include someone who had been left out.\n\n[She/He/They] reached out a hand.\n\nThat single brave moment lit the whole kingdom.",
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] including someone left out, warm heroic kindness, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: `When [Role] [Name] returned, the village glowed with new friendships.\n\nThe King said, "You healed what swords cannot. That is royal magic."`,
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
        text: `One night, the stars above the Kingdom of Light dimmed - the Treasure of Light had been taken from the tower.\n\nThe King called [Role] [Name]:\n\n"Bring back our light, and remind everyone that hope can be found again."\n\n[Name] lifted a small empty lantern. "I will fill it."`,
        photoCaption: "Child holding a lantern",
        imagePromptHint:
          "Watercolor of [Role] [Name] with an empty lantern under dim stars, children's book style, no text",
      },
      {
        page: 3,
        title: "Castle Throne Room",
        text: `In the Castle Throne Room, [Role] [Name] learned the treasure was not gold - it was a crystal of shared hope.\n\nWhoever held it must give light away, not keep it.\n\n"Then I will share it," [she/he/they] promised.`,
        photoCaption: "Photo from Castle Throne Room",
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
        text: "In the Royal Garden, moonflowers opened only for a true heart.\n\nThey pointed [Role] [Name] toward the Courage Quest, where the crystal waited for someone who would share its glow.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] among glowing moonflowers in a garden, children's book illustration, no text",
      },
      {
        page: 6,
        title: "Courage Quest",
        text: "At the Courage Quest, a shadow tried to keep the Treasure of Light for itself.\n\n[Role] [Name] did not fight with anger. [She/He/They] opened the lantern and offered light freely.\n\nThe shadow melted. The crystal shone. The kingdom's treasure was restored.",
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] restoring a glowing crystal of light, heroic and gentle, children's book style, no text",
      },
      {
        page: 7,
        title: "The Return",
        text: `When [Role] [Name] returned, every window in the kingdom glowed.\n\nThe King placed the crystal where all could see it.\n\n"You brought the light home," he said, "because you were willing to share it."`,
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
