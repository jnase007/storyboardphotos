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
  const bookTitle = fillPlaceholders(path.bookTitleTemplate, childName, gender);

  const pages: StoryPage[] = path.pages.map((p) => {
    const photoSet = p.photoSet ?? null;
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
            "Watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] in a kingdom adventure, warm golden light, no text",
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
  // ─────────────────────────────────────────────────────────────
  //  PATH 1 — DRAGON SLAYER
  // ─────────────────────────────────────────────────────────────
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
        title: "The Legend Begins",
        text: "In the shining Kingdom of Light, where golden towers touched the clouds and banners danced in the gentle breeze, there lived a remarkable [Role] named [Name].\n\nStories were told of dragons in distant hills - great winged creatures whose roars shook the mountains and whose eyes burned like lanterns in the dark.\n\nBut [Name] was not afraid. [She/He/They] had a heart full of courage, a spirit full of wonder, and a kingdom full of people who believed in [her/him/them].\n\nThis is the story of how [Role] [Name] faced the impossible - and discovered that the greatest power of all is a brave and loving heart.",
        photoCaption: "The Legend Begins",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing before a glowing kingdom with golden towers and a dragon silhouette on distant hills, warm golden light, no text",
      },
      {
        page: 2,
        title: "The Call to Adventure",
        text: "One morning, the kingdom bells rang three times - a signal that something had changed.\n\nA messenger raced into the castle courtyard, breathless and wide-eyed. \"A great dragon has settled in the hills beyond the Royal Forest! The people are frightened, and the land grows cold with worry.\"\n\nThe King turned to [Role] [Name] with steady, loving eyes. \"[Name], you have always been brave where others feared. Will you answer the call and bring peace back to our kingdom?\"\n\n[Name] stood tall, took a deep breath, and nodded. \"I will go. I will face the dragon - and I will find a way.\" The adventure had truly begun.",
        photoCaption: "The Call to Adventure",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] in a castle courtyard receiving a quest from the King, distant dragon silhouette visible on golden hills, hopeful and determined, warm golden light, no text",
      },
      {
        page: 3,
        title: "Throne Room Portrait",
        text: "Before setting out, [Role] [Name] entered the grand Castle Throne Room, where history lived in every stone.\n\nThe golden throne glowed in the morning light, tall and magnificent, carved with the crests of brave [Role]s and [Role]s who had come before.\n\n[She/He/They] sat upon it quietly, feeling the weight of all that love and legacy. In this room, [Name] understood: being royal was not about wearing a crown. It was about choosing courage when it was hard.\n\n\"I am ready,\" [she/he/they] whispered to the empty room. And the room seemed to answer back with warmth.",
        photoCaption: "Photo from Castle Throne Room",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] seated on a grand golden throne with royal banners, preparing for a dragon quest, warm golden light, no text",
      },
      {
        page: 4,
        title: "Crowned with Courage",
        text: "The royal advisor brought [Name] a gift - a small golden shield that had been passed down through generations of brave royals.\n\n\"This shield has never been broken,\" the advisor said, \"not because it is made of magic metal - but because every [Role] who carried it believed they were loved and never truly alone.\"\n\n[Role] [Name] held the shield close. Outside the throne room windows, the hills waited. Somewhere out there, the dragon breathed fire into a gray sky.\n\nBut [Name] had a shield, a heart, and a kingdom behind [her/him/them]. [She/He/They] was already braver than [she/he/they] knew.",
        photoCaption: "Crowned with Courage",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] holding a small golden shield in the throne room, royal advisor nearby, warm golden light streaming through tall windows, no text",
      },
      {
        page: 5,
        title: "Into the Royal Forest",
        text: "The Royal Forest was a place of ancient magic, where lanterns hung from branches like tiny captured moons and the trees stood tall as gentle giants.\n\n[Role] [Name] walked the winding path with careful steps, listening to the rustle of leaves and the songs of hidden birds.\n\nDeep in the forest, a silver fox crossed [her/his/their] path and paused, golden eyes meeting [Name]'s own. For a long moment, they simply looked at each other - hero and creature, two brave hearts in a quiet wood.\n\n\"The dragon is not what you think,\" the forest seemed to whisper. [Name] listened and kept walking.",
        photoCaption: "Photo from Royal Forest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking a lantern-lit forest path, soft magical light between ancient trees, warm golden light, no text",
      },
      {
        page: 6,
        title: "A Secret in the Forest",
        text: "Suddenly, the lanterns flickered - and there, perched on a mossy log, sat the most extraordinary creature [Name] had ever seen.\n\nIt was a small golden owl with silver feathers that shimmered like starlight. In its beak it carried a single glowing seed.\n\n\"The dragon breathes fire because it is cold inside,\" the owl said softly. \"It roars because no one has ever spoken to it with kindness. Carry this seed to the dragon. It will know you mean peace.\"\n\n[Role] [Name] accepted the glowing seed with both hands, cradling it like the most precious thing in the kingdom. Because perhaps it was.",
        photoCaption: "A Secret in the Forest",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] receiving a glowing seed from a magical golden owl on a mossy log in an enchanted forest, soft mystical light, warm golden light, no text",
      },
      {
        page: 7,
        title: "Royal Forest Portrait",
        text: "The Royal Forest wrapped around [Name] like a gentle hug, its ancient trees standing witness to [her/his/their] courage.\n\nEvery lantern that swayed in the breeze seemed to say: \"You are not alone. You are seen. You are loved.\"\n\n[Role] [Name] paused to breathe it all in - the smell of pine and starlight, the soft glow of the lanterns, the quiet strength of the great old trees.\n\n[She/He/They] was halfway through the journey. The dragon still waited. But [Name] no longer felt small. [She/He/They] felt exactly the right size.",
        photoCaption: "Photo from Royal Forest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing tall among glowing lanterns in the Royal Forest, ancient trees overhead, warm golden light, no text",
      },
      {
        page: 8,
        title: "The Royal Garden",
        text: "Beyond the forest, the Royal Garden burst into view - a paradise of color and life, where flowers bloomed in every shade of sunrise and fountains sang softly in the afternoon light.\n\n[Role] [Name] walked among the roses and lilies, marveling at the beauty that grew right here in [her/his/their] own kingdom.\n\nA gardener looked up with kind eyes. \"Whatever you are facing,\" she said, \"remember that even the most fearsome thing can be softened by beauty. Bring a piece of this garden with you.\"\n\n[Name] looked around and understood. The garden was teaching [her/him/them] something important - that gentleness is its own kind of power.",
        photoCaption: "Photo from Royal Garden",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking through a blooming royal garden with colorful flowers and soft fountains, warm golden light, no text",
      },
      {
        page: 9,
        title: "Gathering the Magic Gift",
        text: "There - glowing softly between two rose bushes - was a single extraordinary blossom. Its petals were the color of dawn: pink and gold and the softest shade of hope.\n\n[Role] [Name] knelt in the soft garden soil and reached for it gently. The moment [her/his/their] fingers touched the stem, the flower hummed like a little song.\n\nThis was the magic gift the owl had spoken of. Not a sword. Not armor. A flower - born from the most beautiful garden in the kingdom, meant to be given away.\n\n[Name] held it carefully and rose. The dragon was waiting. But now [she/he/they] carried something no fire could destroy: the gift of peace.",
        photoCaption: "Gathering the Magic Gift",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] kneeling in a royal garden picking a glowing magical blossom that radiates soft golden and pink light, warm golden light, no text",
      },
      {
        page: 10,
        title: "Royal Garden Portrait",
        text: "The Royal Garden held [Name] in its gentle arms for one last moment before the final leg of the journey.\n\nColorful petals drifted through the air like tiny blessings. A butterfly landed on [Name]'s shoulder as if to say: \"You have everything you need. You always have.\"\n\n[Role] [Name] smiled - a real, deep, fearless smile. Not the smile of someone who was not afraid. The smile of someone who was afraid and going anyway.\n\nThat is what courage truly looks like.",
        photoCaption: "Photo from Royal Garden",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] in the Royal Garden with colorful petals floating around and a butterfly on [her/his/their] shoulder, radiant and brave, warm golden light, no text",
      },
      {
        page: 11,
        title: "The Courage Quest Begins",
        text: "The path beyond the garden led to the Courage Quest - a rocky trail climbing toward the dragon's mountain, where the air shimmered with heat and the ground rumbled softly underfoot.\n\n[Role] [Name] stepped onto the path without hesitation.\n\nWith every step, [she/he/they] remembered the King's believing eyes, the forest lanterns' gentle glow, the gardener's wise words, and the warm hum of the magic blossom in [her/his/their] hand.\n\n[She/He/They] was not alone. [She/He/They] had never been alone. And now [she/he/they] was ready to face the greatest test of all.",
        photoCaption: "Photo from Courage Quest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Courage Quest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] beginning a rocky mountain path toward a dragon's lair with determined expression, glowing blossom in hand, warm golden light, no text",
      },
      {
        page: 12,
        title: "Facing the Dragon!",
        text: "The dragon was ENORMOUS.\n\nIts wings spread wide as a sailing ship. Its scales shimmered red and orange like a living flame. When it opened its mouth, sparks flew and its roar shook the clouds.\n\nEvery creature for miles had run. Every brave knight had turned back. Every plan had failed.\n\nBut [Role] [Name] did not run. [She/He/They] stood at the foot of the mountain, heart hammering, eyes shining - and held up the glowing blossom.\n\n\"I am not here to fight you,\" [Name] called out, voice steady and true. \"I am here because you deserve a friend.\"\n\nThe dragon stopped roaring. Its enormous head tilted. And for the first time in a very long time - it listened.",
        photoCaption: "Facing the Dragon!",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing fearlessly before a massive colorful dragon on a mountain ledge, holding a glowing blossom up bravely, dragon's eyes wide with surprise, dramatic action-packed scene, warm golden light, no text",
      },
      {
        page: 13,
        title: "The Dragon's Heart",
        text: "The dragon lowered its great head slowly, carefully, until its enormous nose was just inches from the glowing blossom.\n\nIt sniffed. A single tear, bright as a diamond, rolled down its scaly cheek.\n\n\"No one has ever brought me a gift,\" the dragon said, its voice deep as thunder but soft as wind. \"No one has ever stayed.\"\n\n[Role] [Name] reached up and placed a gentle hand on the dragon's nose. \"I am staying,\" [she/he/they] said. \"The kingdom is big enough for both of us. And I think you have always wanted to protect it - not scare it.\"\n\nThe dragon breathed out - not fire, but a warm golden sigh. Its heart, at last, was safe.",
        photoCaption: "The Dragon's Heart",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] gently placing a hand on a dragon's nose in a tender friendship moment, dragon's eyes soft with tears of relief, glowing blossom between them, warm golden light, no text",
      },
      {
        page: 14,
        title: "Courage Quest Portrait",
        text: "On the Courage Quest path, [Role] [Name] stood transformed.\n\n[She/He/They] had climbed the mountain with fear in [her/his/their] heart and come down with a friend by [her/his/their] side.\n\nThe dragon walked gently behind [Name] like a great and loyal companion - its flames now warm rather than wild, its roar now a rumble of contentment.\n\nThe people of the kingdom watched from the valley below, and one by one, their fear turned to wonder. Then to joy. Then to cheering that echoed from mountain to sea.",
        photoCaption: "Photo from Courage Quest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Courage Quest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing triumphantly on a mountain path with a gentle dragon beside [her/him/them], kingdom visible below in golden light, no text",
      },
      {
        page: 15,
        title: "Victory Ride",
        text: "\"Would you like to fly?\" the dragon asked with a rumbling, happy voice.\n\n[Role] [Name] laughed - a bright, pure, fearless laugh - and climbed onto the dragon's strong back.\n\nUp they soared, high above the Royal Forest and the glittering garden and the golden towers of the castle. The wind sang in [Name]'s ears. The whole kingdom spread out below like a tapestry of everything [she/he/they] loved.\n\nFrom up here, every village, every lantern, every friendly face looked like a tiny glowing star. And [Role] [Name] realized that this - right here, right now - was the most magical moment of [her/his/their] life.",
        photoCaption: "Victory Ride",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] riding joyfully on a friendly dragon soaring high above a glittering kingdom, wind in [her/his/their] hair, pure delight, warm golden light, no text",
      },
      {
        page: 16,
        title: "The Kingdom Celebrates",
        text: "When [Name] and the dragon landed in the castle courtyard, the celebration that erupted was unlike anything the kingdom had ever seen.\n\nBanners flew from every window. Musicians played from every balcony. Children danced in circles, waving ribbons of gold and red.\n\nThe King stepped forward with tears of joy in his eyes. \"You have given us something more than peace,\" he said. \"You have given us proof that courage and kindness together can change everything.\"\n\nThe dragon let out a tremendous, happy roar that rattled the flags and made everyone laugh and cheer even louder.",
        photoCaption: "The Kingdom Celebrates",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, festive kingdom celebration with [Role] [Name] and a friendly dragon in the castle courtyard, banners flying and people cheering, warm golden light, no text",
      },
      {
        page: 17,
        title: "The Hero Returns",
        text: "Through the great castle gates, [Role] [Name] walked - no longer just a child on a quest, but a true hero of the realm.\n\nThe castle staff lined the hallways. The royal guard stood at attention. Even the old stone walls of the castle seemed to glow a little warmer.\n\n[Name] walked slowly, taking it all in - the proud faces, the happy tears, the weight and wonder of having done something that mattered.\n\nBehind [her/him/them], visible through the great arched windows, the dragon curled peacefully on the castle hill - a guardian at last, exactly where it belonged.",
        photoCaption: "The Hero Returns",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking triumphantly through castle gates with cheering staff and guards lining the hall, dragon visible through windows on a hill, warm golden light, no text",
      },
      {
        page: 18,
        title: "A Gift for the Kingdom",
        text: "That evening, [Role] [Name] stood before all the people of the kingdom and offered them a gift.\n\nNot gold. Not jewels. [She/He/They] offered them the magic blossom - now somehow still glowing, still alive, more beautiful than ever.\n\n\"Plant this in the center of our kingdom,\" [Name] said, \"so that everyone who passes will remember: the most powerful thing we have is not a sword or a dragon or a crown. It is the courage to choose kindness.\"\n\nThey planted it together - every hand, young and old - and when it touched the earth, the glow spread wide and warm as sunrise across the whole kingdom.",
        photoCaption: "A Gift for the Kingdom",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] presenting a glowing magical blossom to the people of the kingdom in a town square, everyone gathered with joyful faces, warm golden light spreading across the scene, no text",
      },
      {
        page: 19,
        title: "The Stars Remember",
        text: "That night, [Role] [Name] sat on the castle's highest tower and looked up at the stars.\n\nThey were brighter than usual - or perhaps [Name] was simply looking at them differently now.\n\nThe dragon slept below, its gentle breathing like a slow and peaceful tide. The kingdom glowed softly in the dark, full of warm windows and sleeping families.\n\n\"Did I really do that?\" [Name] whispered to the stars.\n\nAnd the stars - those faithful, ancient witnesses - shimmered back: \"Yes. You did. And we saw every step.\"",
        photoCaption: "The Stars Remember",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] sitting on a high castle tower gazing at a brilliant starry sky, kingdom glowing softly below, sleeping dragon visible, peaceful and wonder-filled, warm golden light, no text",
      },
      {
        page: 20,
        title: "Always a Hero",
        text: "And so, [Role] [Name] lived bravely ever after.\n\nNot because [she/he/they] never felt afraid - but because [she/he/they] faced the fear anyway, with kindness in [her/his/their] heart and love as [her/his/their] guide.\n\nThe dragon became the kingdom's guardian. The glowing blossom bloomed every year. And the story of [Role] [Name] was told to children for generations:\n\n\"Once there was a [Role] who faced the great dragon - and instead of a battle, chose a friendship. And that made all the difference.\"\n\nThe End.",
        photoCaption: "Always a Hero",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, peaceful final scene of [Role] [Name] with a gentle smile standing beside a friendly dragon in a glowing kingdom at dawn, warm golden light, no text",
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────
  //  PATH 2 — RESCUE MISSION
  // ─────────────────────────────────────────────────────────────
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
        title: "The Legend Begins",
        text: "In the Kingdom of Light, where lanterns burned through every kind of weather and neighbors always knew each other's names, there lived a remarkable [Role] named [Name].\n\nEveryone in the kingdom knew that when someone was lost or frightened or needed a hand, there was one [Role] they could count on.\n\n[Name] was the kind of person who turned around when others walked past. Who noticed the one who was left behind. Who believed, with [her/his/their] whole heart, that no one should ever face the hard moments alone.\n\nThis is the story of the greatest rescue mission the kingdom had ever seen - and the [Role] who made it possible.",
        photoCaption: "The Legend Begins",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing before a glowing golden kingdom with lanterns in the distance and a sense of readiness and warmth, warm golden light, no text",
      },
      {
        page: 2,
        title: "The Call to Adventure",
        text: "The messenger arrived just before sunrise, breathless and frightened.\n\n\"Friends from the valley are missing! They wandered into the eastern hills when the fog rolled in, and no one can find them. Night is coming again and we are afraid.\"\n\nThe King turned to [Role] [Name] with calm and trusting eyes. \"You are the one for this mission, [Name]. Your heart leads you to those who need help. Will you go?\"\n\n[Name] did not hesitate - not for a single heartbeat. \"I will find them,\" [she/he/they] said, picking up [her/his/their] lantern. \"Every single one.\"",
        photoCaption: "The Call to Adventure",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] receiving urgent news in a castle courtyard at early morning, picking up a lantern with determined purpose, warm golden light, no text",
      },
      {
        page: 3,
        title: "Throne Room Portrait",
        text: "In the Castle Throne Room, [Role] [Name] paused to receive the royal charge.\n\nThe King placed a hand on [Name]'s shoulder and spoke quietly: \"The power of a true [Role] is not in armies or gold - it is in the willingness to go when others are afraid. You have always had that power, [Name]. You were born with it.\"\n\n[She/He/They] looked at the throne, the banners, the high vaulted ceilings - and then at the lantern in [her/his/their] hand. The kingdom needed [her/him/them]. That was all [she/he/they] needed to know.",
        photoCaption: "Photo from Castle Throne Room",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] in a golden throne room with a lantern, receiving a royal charge from the King with solemn warmth, warm golden light, no text",
      },
      {
        page: 4,
        title: "Equipped for the Mission",
        text: "The royal advisor brought [Name] a compass that always pointed toward those in need - not north, not south, but toward the heart of whoever was lost.\n\n\"It has never led a rescuer astray,\" the advisor said proudly.\n\n[Role] [Name] held the compass carefully. The needle swung gently and settled. Somewhere out there, someone was waiting. The compass knew the way.\n\n[She/He/They] clasped it around [her/his/their] wrist and walked out through the castle doors into the golden morning light, ready for everything.",
        photoCaption: "Equipped for the Mission",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] receiving a magical compass in the throne room, light streaming through tall windows, ready for rescue, warm golden light, no text",
      },
      {
        page: 5,
        title: "Into the Royal Forest",
        text: "The Royal Forest was cool and hushed, its lanterns swaying softly as [Role] [Name] followed the glowing compass needle deep among the ancient trees.\n\nA footprint here. A lost scarf there. Clues that someone had come this way, hurrying and frightened.\n\n[Name] moved steadily, calling out in a warm, clear voice: \"I am here! You are not alone! I am coming for you!\"\n\nThe trees listened. The lanterns glowed a little brighter. And far ahead, a small, frightened voice called back.",
        photoCaption: "Photo from Royal Forest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] moving purposefully through a lantern-lit forest following a magical compass, calling out warmly into the trees, warm golden light, no text",
      },
      {
        page: 6,
        title: "A Secret in the Forest",
        text: "From behind a mossy boulder stepped a creature [Name] had never seen - a small luminous deer, its antlers wrapped in golden light, its eyes like deep, still pools.\n\n\"The lost ones are frightened but safe,\" the deer said gently. \"The forest has been protecting them. But they need a voice they trust. They need yours.\"\n\n[Role] [Name] nodded slowly. \"Then I will not stop calling until they hear me.\"\n\nThe deer bowed its glowing head in quiet approval - and vanished back into the soft shadows of the forest, leaving only a trail of golden light pointing the way forward.",
        photoCaption: "A Secret in the Forest",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] encountering a magical luminous deer with glowing antlers in an enchanted forest, mystical and tender, warm golden light, no text",
      },
      {
        page: 7,
        title: "Royal Forest Portrait",
        text: "The Royal Forest felt like a partner in the mission now - its lanterns bobbing like encouragement, its ancient trees whispering support with every swaying branch.\n\n[Role] [Name] walked its paths with a full heart, knowing [she/he/they] was exactly where [she/he/they] was supposed to be, doing exactly what [she/he/they] was made to do.\n\nSome people are born for great battles. Some for grand discoveries. [Name] was born for this: for showing up, for reaching out, for making sure no one was ever left behind.\n\nAnd the forest loved [her/him/them] for it.",
        photoCaption: "Photo from Royal Forest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking with purpose and warmth through a glowing lantern forest, peaceful determination, warm golden light, no text",
      },
      {
        page: 8,
        title: "The Royal Garden",
        text: "The compass led [Role] [Name] to the edge of the Royal Garden, where flowers grew so thick and tall that a small person could easily get turned around.\n\nAnd there - nestled between two tall rosebushes with muddy boots and a tear-streaked face - was the first lost friend, sound asleep in the soft grass.\n\n[Name] knelt down gently and touched [her/his/their] friend's shoulder. \"I found you,\" [she/he/they] said softly. \"You are safe now. I have you.\"\n\nThe friend's eyes opened - and the relief and joy in them was worth every step of the journey.",
        photoCaption: "Photo from Royal Garden",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] discovering a lost friend sleeping among tall garden roses, kneeling with tender care, warm golden light, no text",
      },
      {
        page: 9,
        title: "The Rescuer's Gift",
        text: "The garden seemed to celebrate the reunion - flowers turning their faces toward [Name] and [her/his/their] found friend like a crowd of tiny suns.\n\nA single bright blossom drifted down from a nearby tree and landed in [Name]'s palm. It glowed with a soft warmth, the kind that made frightened hearts feel steady again.\n\n[Role] [Name] tucked it carefully into [her/his/their] pocket - a gift from the garden for those who were still waiting to be found.\n\nBecause the mission was not finished yet. More friends were out there. And [Name] would not rest until every one of them was home.",
        photoCaption: "The Rescuer's Gift",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] in a royal garden catching a glowing blossom that drifted from a tree, flowers all around turning toward [her/him/them], warm golden light, no text",
      },
      {
        page: 10,
        title: "Royal Garden Portrait",
        text: "With [her/his/their] first friend safely found and walking beside [her/him/them], [Role] [Name] stood in the Royal Garden and let the beauty of it fill [her/his/their] heart.\n\nTwo had become a team. They were stronger together than either had been alone.\n\n\"We will find the others,\" [Name] said, holding the compass steady. \"Together.\"\n\n[Her/His/Their] friend squeezed [her/his/their] hand. The compass needle glowed. And together they walked on, two small heroes in a garden full of gold.",
        photoCaption: "Photo from Royal Garden",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing in a blooming royal garden with a rescued friend beside [her/him/them], holding a glowing compass, warm golden light, no text",
      },
      {
        page: 11,
        title: "The Courage Quest Begins",
        text: "The compass pointed to the Courage Quest - a rocky trail that wound up a steep hillside where the mist still clung and the path grew narrow.\n\nThis was the hardest part. Two more friends waited somewhere up there, frightened and cold.\n\n[Role] [Name] looked at the hill, then at [her/his/their] friend, then at the compass. [She/He/They] took a deep breath and stepped forward.\n\n\"Courage is not the absence of fear,\" [Name] said, half to [her/his/their] friend and half to [her/him/them]self. \"Courage is going anyway, because someone needs you.\"\n\nUp they climbed.",
        photoCaption: "Photo from Courage Quest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Courage Quest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] with a rescued friend beginning to climb a misty hillside path, determined and warm, warm golden light breaking through the mist, no text",
      },
      {
        page: 12,
        title: "The Great Rescue!",
        text: "At the top of the hill, behind a cluster of boulders, two more friends huddled together - cold, frightened, but holding each other bravely.\n\nWhen they heard [Name]'s voice calling through the mist, they gasped. When they saw [her/his/their] lantern swinging through the fog, they cried.\n\n[Role] [Name] ran the last steps and gathered them both into a fierce, warm hug.\n\n\"I told you I was coming,\" [Name] said breathlessly. \"I never, ever stop looking. Not once. Not ever.\"\n\nThe mist seemed to retreat. The lantern blazed bright. And four small heroes stood together on the hilltop, laughing and crying and so very, very glad.",
        photoCaption: "The Great Rescue!",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] running through clearing mist to embrace found friends on a hilltop, lantern blazing bright, joyful reunion, warm golden light breaking through, no text",
      },
      {
        page: 13,
        title: "Safe at Last",
        text: "The walk back down the hill was very different from the walk up.\n\nThere was laughter now. And singing - off-key, joyful, echoing off the valley walls. There were stories shared about hiding spots and funny moments and the very silly things people think about when they are lost.\n\n[Role] [Name] walked in the middle of the little group, lantern held high, compass glowing gold with satisfaction.\n\nSomewhere ahead, the lights of the kingdom were already growing brighter. And every person who had been lost now knew something important: they were found. They were loved. And they had [Name] to thank for it.",
        photoCaption: "Safe at Last",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking with a happy group of rescued friends down a golden hill toward a glowing kingdom, laughing and singing together, warm golden light, no text",
      },
      {
        page: 14,
        title: "Courage Quest Portrait",
        text: "Back on the Courage Quest path, [Role] [Name] paused and looked at the faces around [her/him/them].\n\nEvery face that had been frightened was now smiling. Every pair of eyes that had been full of tears was now full of light.\n\nThis was what [she/he/they] had come for. Not glory. Not honor. Just this - the sight of people who were safe because [she/he/they] had not given up.\n\n[Name] felt something settle deep in [her/his/their] chest. This was [her/his/their] calling. This was [her/his/their] crown.",
        photoCaption: "Photo from Courage Quest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Courage Quest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] on a mountain path surrounded by rescued and smiling friends, serene and triumphant, warm golden light, no text",
      },
      {
        page: 15,
        title: "Heroes' Parade",
        text: "The kingdom had prepared a surprise.\n\nWhen [Role] [Name] and the rescued friends came through the valley gate, the whole village was waiting - waving banners, throwing flowers, playing music that carried on the wind.\n\nThe King rode out on a white horse and bowed his head to [Name]. \"You did not just rescue our friends,\" he said. \"You showed us what this kingdom is truly made of.\"\n\n[Name] walked at the front of the parade, laughing and waving, [her/his/their] lantern still lit - because a rescuer never lets the light go out.",
        photoCaption: "Heroes' Parade",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] leading a joyful parade through a village street with rescued friends, people waving banners and throwing flowers, lantern held high, warm golden light, no text",
      },
      {
        page: 16,
        title: "The Kingdom Celebrates",
        text: "The celebration in the castle courtyard lasted until the stars came out.\n\nTables were set with wonderful food. Children chased each other around the fountain. Families who had been separated were reunited and could not stop smiling.\n\nEvery now and then someone would reach out and squeeze [Name]'s hand or say a quiet \"thank you\" that meant more than any speech or parade.\n\n[Role] [Name] received each thank you with a simple, warm smile. [She/He/They] was not saving it up or measuring it. [She/He/They] was just glad to be here, in the middle of all this joy, knowing [she/he/they] had helped make it possible.",
        photoCaption: "The Kingdom Celebrates",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, festive kingdom celebration in a castle courtyard with [Role] [Name] at the center, tables of food and people reuniting joyfully, stars beginning to appear above, warm golden light, no text",
      },
      {
        page: 17,
        title: "The Hero Returns",
        text: "As the celebration quieted and the evening grew still, [Role] [Name] walked back through the castle gates.\n\nThe guards smiled. The staff bowed. The old stone walls of the castle felt warm beneath [Name]'s fingertips as [she/he/they] trailed [her/his/their] hand along them.\n\n[She/He/They] had left this morning with an empty lantern and a beating heart. [She/He/They] returned with that lantern still glowing - because a rescuer always comes back with light.\n\nThe castle doors swung open wide. [Name] was home.",
        photoCaption: "The Hero Returns",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking through warm castle gates in the evening, lantern still glowing, guards smiling and bowing, triumphant homecoming, warm golden light, no text",
      },
      {
        page: 18,
        title: "A Gift for the Kingdom",
        text: "The next morning, [Role] [Name] gathered the whole kingdom and made a promise.\n\n\"No one in this kingdom will ever be lost alone. From today, we will light a lantern for every person who is away from home - so they always know someone is watching for them.\"\n\nThey called it the Lantern of Return, and they placed one at every crossroads in the land.\n\nAnd whenever someone felt lost or scared or forgotten, they would look for the lantern - and remember that [Role] [Name] had promised: I will always come for you.",
        photoCaption: "A Gift for the Kingdom",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] lighting a Lantern of Return at a kingdom crossroads surrounded by people of all ages watching with gratitude, warm golden light, no text",
      },
      {
        page: 19,
        title: "The Stars Remember",
        text: "That night, [Role] [Name] sat on the castle steps and looked up at a sky blazing with stars.\n\nEach star seemed to flicker like a tiny lantern - a reminder that even in the darkest dark, light finds a way.\n\nThe rescued friends were home. The kingdom was safe. The lanterns at the crossroads burned steady and warm.\n\n[Name] thought about courage - how it does not roar or thunder. Sometimes it is just quiet and steady, one step after another, calling out into the dark: \"I am here. I am coming. You are not alone.\"\n\nThe stars blinked back in agreement.",
        photoCaption: "The Stars Remember",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] sitting on castle steps gazing at a brilliant starry sky, lanterns glowing along a pathway, peaceful and reflective, warm golden light, no text",
      },
      {
        page: 20,
        title: "Always a Hero",
        text: "And so, [Role] [Name] lived bravely ever after.\n\nNot because [she/he/they] never had hard days - but because when the hard days came, [she/he/they] picked up the lantern and went anyway.\n\nFor as long as the Kingdom of Light stood, the story was told:\n\n\"Once there was a [Role] who never stopped looking for the lost. Who never let the lantern go out. Who showed an entire kingdom what it means to love your neighbor.\"\n\n[She/He/They] [is/are] [Name]. And [Name] [is/are] a hero.\n\nThe End.",
        photoCaption: "Always a Hero",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, peaceful final scene of [Role] [Name] with a glowing lantern standing at the edge of a golden kingdom at dusk, warm and joyful expression, warm golden light, no text",
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────
  //  PATH 3 — LOST CROWN
  // ─────────────────────────────────────────────────────────────
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
        title: "The Legend Begins",
        text: "In the Kingdom of Light, the royal crown was more than a circle of gold. It was a symbol of every promise the kingdom had ever made - to be wise, to be fair, to care for every person within its walls.\n\nAnd [Role] [Name] was the most observant [Role] the kingdom had ever known. [She/He/They] noticed what others missed. [She/He/They] asked questions that others forgot to ask. [She/He/They] saw the truth hiding in plain sight.\n\nIt was this gift that would be needed now - because something precious was gone, and only the sharpest eyes in the kingdom could find it.\n\nThis is the story of [Role] [Name] and the search for the Lost Crown.",
        photoCaption: "The Legend Begins",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing in a grand kingdom with a missing crown pedestal visible in the background, observant and curious expression, warm golden light, no text",
      },
      {
        page: 2,
        title: "The Call to Adventure",
        text: "The morning alarm rang through the castle - not bells of celebration, but the three solemn chimes that meant something had gone wrong.\n\nThe royal crown was missing from its velvet pillow. The whole castle had been searched. No one knew where it had gone.\n\nThe King stood before his court looking tired and worried. Then his eyes found [Role] [Name].\n\n\"You notice what others miss,\" he said quietly. \"Will you find our crown and restore what has been lost?\"\n\n[Name] looked at the empty pillow, then at the King, then at the kingdom beyond the window. \"I will not stop until I find it,\" [she/he/they] promised. And [she/he/they] meant it with every part of [her/his/their] heart.",
        photoCaption: "The Call to Adventure",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] looking at an empty crown pillow in a grand hall with a worried King, mystery and determination in the air, warm golden light, no text",
      },
      {
        page: 3,
        title: "Throne Room Portrait",
        text: "The investigation began in the Castle Throne Room, where the crown had last been seen.\n\n[Role] [Name] moved slowly and carefully, eyes scanning every corner, every crack, every shadow. [She/He/They] was not in a hurry. The best investigators, [she/he/they] knew, take their time.\n\nAnd there - beneath the edge of the royal banner, pressed flat by a boot heel - was a golden thread. A single gleaming clue, so small that anyone who rushed would have missed it entirely.\n\n[Name] held it up to the light and smiled. The trail had begun.",
        photoCaption: "Photo from Castle Throne Room",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] carefully examining a golden thread clue on the floor of a grand throne room, magnifying glass or curious expression, warm golden light, no text",
      },
      {
        page: 4,
        title: "The Royal Investigator",
        text: "The royal advisor was amazed. \"No one else spotted that thread in three full hours of searching!\"\n\n\"Most people look for big things,\" [Role] [Name] explained thoughtfully. \"But answers usually hide in small ones.\"\n\nShe/He/They studied the thread again. It was the kind used to stitch the royal banners - but newer. Recently woven. Someone had been in this room who had also been near the banner-makers' workshop.\n\nA new clue. A new direction.\n\n[Name] tucked the thread safely away and turned toward the door. The crown was out there. And [she/he/they] was going to find it.",
        photoCaption: "The Royal Investigator",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] studying a golden thread carefully in the throne room, thoughtful and clever expression, advisor watching in admiration, warm golden light, no text",
      },
      {
        page: 5,
        title: "Into the Royal Forest",
        text: "The golden thread led [Role] [Name] out of the castle and into the Royal Forest, where the lanterns swayed and the ancient trees kept their silent watch.\n\nAmong the roots of the oldest oak, [Name] found the second clue - a sparkling blue jewel, the exact color of the one missing from the crown's front setting.\n\nIt was dusty, as if it had rolled there by accident. As if the crown had passed this way in a hurry - or had been carried past carelessly.\n\nHmm. [Name] tucked the jewel safely away and pressed deeper into the forest.",
        photoCaption: "Photo from Royal Forest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] finding a sparkling blue jewel among tree roots in a lantern-lit forest, curious and alert, warm golden light, no text",
      },
      {
        page: 6,
        title: "A Secret in the Forest",
        text: "Deep in the forest, a family of luminous foxes watched [Name] from between the trees.\n\nThe eldest fox padded forward and sat regally before [her/him/them]. \"We saw who passed through with the crown,\" it said. \"It was not stolen in malice. It was borrowed by someone who did not understand its meaning.\"\n\n[Role] [Name] listened carefully. \"Where did they go?\"\n\n\"To the garden,\" the fox said, \"to find something to trade for it. Because deep down, they want to make things right.\"\n\n[Name] nodded slowly. \"Then we will give them the chance.\" [She/He/They] thanked the fox and turned toward the garden path.",
        photoCaption: "A Secret in the Forest",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] kneeling before a wise luminous fox in an enchanted forest, listening to an important secret, warm golden light filtering through trees, no text",
      },
      {
        page: 7,
        title: "Royal Forest Portrait",
        text: "The Royal Forest was a place of wisdom, and [Role] [Name] was grateful for it.\n\nEvery lantern [she/he/they] passed felt like a quiet cheer. Every swaying branch felt like the trees were waving [her/him/them] forward.\n\nThis investigation was teaching [Name] something important: truth does not always look like what you expect. Sometimes what seems like a crime is really a mistake. Sometimes what feels like a theft is really a misunderstanding.\n\nA good investigator - a truly good [Role] - remembers that and leads with fairness before judgment.",
        photoCaption: "Photo from Royal Forest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking thoughtfully through a lantern-lit forest, peaceful wisdom, warm golden light, no text",
      },
      {
        page: 8,
        title: "The Royal Garden",
        text: "In the Royal Garden, the colors were almost overwhelming - every flower imaginable blooming in great cascading walls of red and gold and violet.\n\n[Role] [Name] searched carefully, following a faint trail of gold dust that sparkled at the edge of the paths.\n\nAnd there, behind a hedge of white roses, sat a young gardener's child - holding the crown reverently in both hands, looking at it with wonder and regret in equal measure.\n\nShe looked up when [Name] arrived. Her eyes filled with tears immediately. \"I only wanted to see it up close,\" she whispered. \"I never meant to cause such trouble.\"",
        photoCaption: "Photo from Royal Garden",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] finding a tearful child holding the royal crown behind rose hedges in a garden, gentle and understanding, warm golden light, no text",
      },
      {
        page: 9,
        title: "The Truth About the Crown",
        text: "The gardener's child held out the crown with trembling arms.\n\n[Role] [Name] sat down in the grass beside her and did not snatch it away. Instead, [she/he/they] simply looked at the child with kind, steady eyes.\n\n\"Tell me,\" [Name] said gently.\n\nAnd the child did - about how she had always dreamed of seeing the crown up close, how she had slipped in to look and then panicked when she heard the alarm, how she had carried it outside meaning to bring it back but been too frightened.\n\n\"You made a mistake,\" [Name] said finally, \"but you also stayed. And you are giving it back. That is the beginning of honesty.\"\n\nThe child exhaled like she had been holding her breath for hours.",
        photoCaption: "The Truth About the Crown",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] sitting in a royal garden beside a tearful child, both looking at the glowing crown between them, tender and forgiving moment, warm golden light, no text",
      },
      {
        page: 10,
        title: "Royal Garden Portrait",
        text: "Together, [Role] [Name] and the gardener's child walked through the Royal Garden - the crown safely in [Name]'s hands, the child walking beside [her/him/them] with a lighter heart.\n\n\"You will need to apologize to the King,\" [Name] said kindly. \"It will be hard. But he is fair, and fairness means giving people a chance to make things right.\"\n\nThe child nodded. The flowers around them seemed to nod too, their bright heads swaying in gentle agreement.\n\nIn this garden, two people had found something more valuable than a crown: the truth, and the grace that follows it.",
        photoCaption: "Photo from Royal Garden",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking through a blooming garden with a relieved child beside [her/him/them], crown safely in hand, warm golden light, no text",
      },
      {
        page: 11,
        title: "The Courage Quest Begins",
        text: "The walk back through the Courage Quest trail was the final leg of the journey - and in some ways, the most important.\n\nThe gardener's child grew quieter as they neared the castle. Fear was creeping back.\n\n[Role] [Name] walked beside her, steady and calm. \"I will be with you when you speak to the King,\" [she/he/they] said. \"You will not face it alone.\"\n\nThe child looked up with eyes full of gratitude.\n\nCourage, [Name] thought, sometimes means helping someone else find theirs.",
        photoCaption: "Photo from Courage Quest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Courage Quest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking with a nervous child on a trail back toward the castle, encouraging and steady, crown carried safely, warm golden light, no text",
      },
      {
        page: 12,
        title: "The Crown Returns!",
        text: "The great hall fell silent as [Role] [Name] walked in with the gardener's child and held the crown high for all to see.\n\nA gasp. Then a cheer. Then a wave of relief so powerful it seemed to move the banners on the walls.\n\nThe gardener's child stepped forward, trembling, and told her story truthfully to the King - every word of it, without hiding anything.\n\nThe King listened. Everyone listened. When she finished, a long silence stretched across the hall.\n\nAnd then the King said something no one expected: \"Thank you for your honesty. That took more courage than borrowing the crown ever did.\"",
        photoCaption: "The Crown Returns!",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] holding the royal crown aloft in a great hall with cheering courtiers, a small child beside [her/him/them] bravely facing the King, dramatic and warm, golden light flooding the hall, no text",
      },
      {
        page: 13,
        title: "Justice with Mercy",
        text: "The King placed the crown back on its velvet pillow and looked at the gardener's child for a long moment.\n\n\"You will come to the castle every week for a year,\" he said. \"Not as punishment - but to learn the stories of every jewel in this crown. Every stone has a history. Every piece of gold was given by someone who loved this kingdom.\"\n\nThe child's eyes went wide - not with fear, but with wonder.\n\n[Role] [Name] smiled. This was what true royal wisdom looked like. Not vengeance. Not harshness. Justice that made people better.\n\n\"This kingdom,\" [Name] thought, \"is worth protecting with everything I have.\"",
        photoCaption: "Justice with Mercy",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, a wise and kind King speaking gently to a child in a golden hall, [Role] [Name] standing nearby smiling, royal crown gleaming on its pillow, warm golden light, no text",
      },
      {
        page: 14,
        title: "Courage Quest Portrait",
        text: "On the Courage Quest path, [Role] [Name] paused to breathe the cool mountain air and let the day settle into [her/his/their] heart.\n\nWhat a day it had been. Not a battle - a mystery. Not a fight - a conversation. Not a victory of strength - but of patience, observation, and grace.\n\n[She/He/They] had found the crown. More than that, [she/he/they] had found the truth. And in finding the truth, [she/he/they] had given someone the chance to be brave.\n\nThat felt like the most royal thing [she/he/they] had ever done.",
        photoCaption: "Photo from Courage Quest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Courage Quest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing on a mountain trail with a peaceful and satisfied expression, kingdom below in golden afternoon light, no text",
      },
      {
        page: 15,
        title: "The Crown Restored",
        text: "That evening, the King held a small, quiet ceremony.\n\nHe placed the crown back on [Name]'s head - not as [her/his/their] crown, but as an honor. \"For one day,\" he said, \"let it rest where wisdom and kindness live together.\"\n\n[Role] [Name] wore it lightly, knowing its weight and its meaning.\n\nNearby, the gardener's child watched with shining eyes, already beginning to understand the stories behind the stones.\n\nThe crown was home. The kingdom was whole. And everything had been restored - not by force, but by truth.",
        photoCaption: "The Crown Restored",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] wearing the royal crown gently in a candlelit hall, the King and a proud child nearby, warm and ceremonial, warm golden light, no text",
      },
      {
        page: 16,
        title: "The Kingdom Celebrates",
        text: "News spread fast, the way good news always does.\n\nBy nightfall, the kingdom was alive with celebration - not the wild, roaring kind, but the warm, deep kind. The kind where people sit together at long tables and share meals and stories and laughter until the candles burn low.\n\n[Role] [Name] sat at the center of it all, quietly content.\n\nSomeone passed [her/him/them] a piece of honey cake. Someone else raised a cup and said simply: \"To [Name] - who never stopped looking.\"\n\nThe whole table agreed. And [Name] felt, in that moment, completely and perfectly at home.",
        photoCaption: "The Kingdom Celebrates",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, a warm kingdom feast with [Role] [Name] at the center of a long table surrounded by happy people, candles and golden light, celebration and community, no text",
      },
      {
        page: 17,
        title: "The Hero Returns",
        text: "When the feast ended and the castle grew quiet, [Role] [Name] walked slowly through the familiar halls.\n\nEach painting, each tapestry, each suit of armor along the walls told a story of someone who had once faced something hard and chosen well.\n\nNow [Name]'s story was part of these walls too.\n\n[She/He/They] paused at the throne room door and looked in at the crown, back on its pillow where it belonged, gleaming in the last light of the evening.\n\n\"Goodnight,\" [Name] said softly - to the crown, to the kingdom, to the stories on the walls.",
        photoCaption: "The Hero Returns",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] walking through candlelit castle halls in the evening, pausing to look at the royal crown gleaming on its pillow, peaceful and proud, warm golden light, no text",
      },
      {
        page: 18,
        title: "A Gift for the Kingdom",
        text: "The following morning, [Role] [Name] made a new promise to the kingdom.\n\n\"From today, every person who lives here may visit the throne room once a year to learn the stories of the crown. Not just to look - but to understand. Because a kingdom's treasures belong to all of us.\"\n\nThe gardener's child was the first to sign the new book of visitors.\n\nShe wrote her name carefully, looked at [Name] with grateful eyes, and said: \"Thank you for not giving up on me.\"\n\n\"I would never,\" [Name] replied simply. \"That is what this kingdom is for.\"",
        photoCaption: "A Gift for the Kingdom",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] and a child signing a new visitors book in a golden throne room, the crown gleaming nearby, hopeful and generous, warm golden light, no text",
      },
      {
        page: 19,
        title: "The Stars Remember",
        text: "That night, [Role] [Name] sat beside the window and watched the stars appear one by one over the kingdom.\n\nThe day had been full of mystery, truth, fear, grace, and joy all at once.\n\n\"I wonder,\" [Name] thought, \"if this is what being a good [Role] really means. Not winning. Not ruling. Just... paying attention. Following the small clues. Treating every person as if their story matters.\"\n\nThe stars shimmered overhead - those ancient, patient witnesses.\n\nThey had been watching. And they agreed.",
        photoCaption: "The Stars Remember",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] sitting by a castle window looking at a starry sky over the kingdom, reflective and peaceful, a crown glinting softly on a table nearby, warm golden light, no text",
      },
      {
        page: 20,
        title: "Always a Hero",
        text: "And so, [Role] [Name] lived bravely ever after.\n\nNot because every mystery was easy to solve. Not because every truth was comfortable to hear. But because [she/he/they] never stopped looking - for clues, for truth, for the good in every person [she/he/they] met.\n\nFor generations, the story was told in the Kingdom of Light:\n\n\"Once there was a [Role] who followed a single golden thread and found not just a crown - but what the crown truly means: honesty, fairness, and the courage to face the truth.\"\n\nThat [Role] was [Name]. And [Name] was always, always a hero.\n\nThe End.",
        photoCaption: "Always a Hero",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, peaceful final scene of [Role] [Name] in a golden throne room with the crown gleaming on its pillow, calm and dignified, warm golden light, no text",
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────
  //  PATH 4 — FOREST GUARDIAN
  // ─────────────────────────────────────────────────────────────
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
        title: "The Legend Begins",
        text: "Beyond the royal walls of the Kingdom of Light, a great and ancient forest breathed with quiet magic.\n\nIts lanterns never needed lighting - they had glowed since the first day the kingdom was built. Its creatures had never known fear. Its roots ran deep as memory and tall as hope.\n\nBut something had changed. A shadow was creeping in from the edges. The lanterns were flickering. The creatures were hiding.\n\nAnd there was only one [Role] in all the kingdom whose heart was gentle enough, brave enough, and attentive enough to do what the forest needed.\n\n[Role] [Name] had always loved the forest. Today, the forest would need [her/him/them].",
        photoCaption: "The Legend Begins",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing at the edge of a magical glowing forest with ancient trees and lanterns, a shadow creeping at the edges, hopeful and determined, warm golden light, no text",
      },
      {
        page: 2,
        title: "The Call to Adventure",
        text: "A tiny wren arrived at [Name]'s window before sunrise, tapping frantically with its beak.\n\nTied to its foot was a message written in the old forest language - a curling script of leaves and starlight that [Name] could somehow understand, though [she/he/they] had never studied it.\n\nThe message said: The forest is afraid. It needs a guardian. Will you come?\n\nThe King appeared in the doorway, reading the message over [Name]'s shoulder. \"The forest has chosen you,\" he said quietly. \"It does not choose lightly.\"\n\n[Name] looked at the wren, at the message, at the green glow of the forest on the horizon. [She/He/They] had been waiting for this call without knowing it. \"I am ready,\" [she/he/they] said.",
        photoCaption: "The Call to Adventure",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] reading a tiny magical message tied to a wren at a castle window, forest glowing on the horizon, warm golden light, no text",
      },
      {
        page: 3,
        title: "Throne Room Portrait",
        text: "In the Castle Throne Room, the King draped a special cloak over [Name]'s shoulders - woven from threads of gold and the silk of spiderwebs found only in the deepest parts of the Royal Forest.\n\n\"A guardian of the forest does not fight against nature,\" the King said. \"[She/He/They] listens to it. Moves with it. Speaks for those who cannot speak for themselves.\"\n\n[Role] [Name] felt the cloak settle around [her/his/their] shoulders like a pair of wings. [She/He/They] looked different already - steadier. Taller, somehow.\n\n\"I will protect everything that cannot protect itself,\" [Name] promised.",
        photoCaption: "Photo from Castle Throne Room",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] receiving a forest guardian cloak in a golden throne room, the King draping it over [her/his/their] shoulders with ceremony, warm golden light, no text",
      },
      {
        page: 4,
        title: "The Guardian's Tools",
        text: "The royal advisor brought three gifts for the guardian's journey.\n\nA staff carved from a branch that had fallen naturally from the oldest tree in the forest - never cut, only given. A flask of starwater that could heal a sick root or calm a frightened animal. And a small silver whistle that only the creatures of the forest could hear.\n\n[Role] [Name] received each gift with both hands and quiet gratitude.\n\n\"These tools ask something of you,\" the advisor said. \"Gentleness. Patience. The willingness to kneel down and meet the small creatures at their level.\"\n\n[Name] nodded. [She/He/They] had always known how to do that. It came naturally.",
        photoCaption: "The Guardian's Tools",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] receiving a carved staff, a flask of starwater, and a silver whistle in the throne room, each glowing softly, warm golden light, no text",
      },
      {
        page: 5,
        title: "Into the Royal Forest",
        text: "The moment [Role] [Name] stepped beneath the first great tree, the forest seemed to exhale.\n\nAnimals peered out from behind roots and branches - curious, cautious. A family of hedgehogs. A sleepy owl. Three rabbits who crept just a little closer than was usual.\n\n[Name] crouched down, completely still, and let them come in their own time.\n\nSlowly, one by one, they came forward - drawn by something they could feel but not explain. A quality in [Name] that the forest had always recognized, even if [Name] had never known it before.\n\nGuardianship is not claimed. It is given. And the forest was giving it.",
        photoCaption: "Photo from Royal Forest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] crouching gently in the Royal Forest as small animals - hedgehogs, owls, rabbits - creep curiously toward [her/him/them], warm golden light, no text",
      },
      {
        page: 6,
        title: "A Secret in the Forest",
        text: "Deeper in the forest, where the trees grew so tall their tops disappeared into clouds, [Name] found the oldest tree of all.\n\nIts bark was silver. Its leaves were the color of starlight. And carved into its ancient trunk were names - every Guardian who had come before.\n\nA voice rose from within the tree like wind given words: \"You are not the first. And because you came, you will not be the last. Light the lanterns, Guardian. The forest is counting on you.\"\n\n[Role] [Name] placed [her/his/their] hand on the silver bark. It was warm. It hummed with something that felt like courage - or maybe love.\n\n[She/He/They] understood now what [she/he/they] had to do.",
        photoCaption: "A Secret in the Forest",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] touching a glowing ancient silver tree with guardian names carved in its bark, magical and mystical, warm golden light, no text",
      },
      {
        page: 7,
        title: "Royal Forest Portrait",
        text: "One by one, [Role] [Name] lit the fading lanterns of the Royal Forest - each one brightening as [she/he/they] touched it, as if it had been waiting for exactly this hand.\n\nWith every lantern lit, the shadows retreated a little further. The creatures crept back out of hiding. A fox kit stumbled into the light and blinked at [Name] with enormous golden eyes.\n\n[Name] laughed softly - the pure, surprised laugh of someone discovering that the most important work in the world is also the most beautiful.\n\nThe forest was coming back. And [Name] was the reason.",
        photoCaption: "Photo from Royal Forest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] lighting lanterns in an ancient forest as animals emerge from hiding, fox kit in the foreground blinking at [her/him/them], warm golden light, no text",
      },
      {
        page: 8,
        title: "The Royal Garden",
        text: "The guardian's path led to the Royal Garden, where the plants that fed the forest's magic were grown.\n\n[Role] [Name] walked the rows carefully, looking for something the forest had asked for: seeds of starlight, which could only be found among certain midnight-blooming flowers.\n\nThere - between the silver roses and the twilight lilies - were tiny glowing pods, each one pulsing softly like a tiny heart.\n\n[Name] gathered them gently in [her/his/their] pouch. These seeds would replant the forest's deepest magic. They were the most important thing in the garden.\n\nAnd [Name] carried them like the gifts they were.",
        photoCaption: "Photo from Royal Garden",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] carefully gathering glowing seed pods from midnight-blooming flowers in a royal garden, reverent and careful, warm golden light, no text",
      },
      {
        page: 9,
        title: "Planting the Light",
        text: "Back at the heart of the forest, [Role] [Name] knelt in the soft earth and planted the starlight seeds one by one.\n\nEach seed went in with a word - not a spell, but something truer. A promise. \"Grow.\" \"Thrive.\" \"Be safe here.\"\n\nAs [she/he/they] pressed the last seed into the ground, a sound rose through the forest - not wind, not birdsong, but something that felt like music and breathing and laughter all at once.\n\nThe forest was answering.\n\nUnder [Name]'s hands, the first tiny shoot pushed up through the earth - green and glowing and full of everything the forest needed to come back to life.",
        photoCaption: "Planting the Light",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] kneeling in forest soil carefully planting glowing seeds, a tiny green shoot already pushing up toward golden light, warm golden light, no text",
      },
      {
        page: 10,
        title: "Royal Garden Portrait",
        text: "The Royal Garden had given [Name] what the forest needed. And now, in return, [Name] had given the forest something it had not had in a long time: a guardian who truly cared.\n\n[Role] [Name] stood in the garden for a moment before the final walk into the forest's heart.\n\nA butterfly settled on [her/his/their] shoulder. Then another. Then a small sparrow perched on [her/his/their] head for exactly three seconds before flying off again.\n\n[Name] laughed quietly. The garden was saying thank you in its own way.\n\n\"You are very welcome,\" [she/he/they] said to the flowers, the butterflies, the sparrow. And [she/he/they] meant it.",
        photoCaption: "Photo from Royal Garden",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] in the Royal Garden with butterflies settling on [her/his/their] shoulders and a sparrow on [her/his/their] head, delighted and peaceful, warm golden light, no text",
      },
      {
        page: 11,
        title: "The Courage Quest Begins",
        text: "The final challenge of the guardian's journey waited at the edge of the Courage Quest - where the shadow was deepest and the forest lanterns had gone completely dark.\n\n[Role] [Name] could feel the coldness from twenty steps away. This was where the shadow had begun. This was where the forest's heart was most wounded.\n\n[She/He/They] held the staff in one hand and the last starlight seeds in the other.\n\n\"I am not afraid of dark places,\" [Name] said quietly, stepping forward. \"I know what they need. They need light - and someone who is willing to stand in them long enough to offer it.\"",
        photoCaption: "Photo from Courage Quest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Courage Quest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] holding a carved staff and glowing seeds stepping toward the dark edge of a forest, brave and determined, warm golden light at [her/his/their] back, no text",
      },
      {
        page: 12,
        title: "Darkness Descends!",
        text: "The shadow roared - not with a voice, but with a cold and heavy silence that pressed down on everything.\n\nThe lanterns on all sides went out. The creatures fled. The trees groaned.\n\n[Role] [Name] stood absolutely still in the center of it all, eyes open, heart steady.\n\nThe shadow swirled. It pushed. It tried to make [Name] run.\n\nBut [Name] did not run.\n\n[She/He/They] raised the guardian's staff, whispered the names of every creature [she/he/they] was protecting, and planted the very last starlight seed directly in the heart of the darkest shadow.\n\nFor one long, breathless moment, nothing happened.",
        photoCaption: "Darkness Descends!",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing firm in the center of a swirling dark shadow in the forest, staff raised and glowing seed in hand, brave and unmoving, dramatic tension, warm golden light struggling through, no text",
      },
      {
        page: 13,
        title: "The Forest Awakens",
        text: "Then the seed cracked open.\n\nGolden light erupted from the earth like sunrise in fast motion, racing along the roots and up the trunks and out through every branch until every single lantern in the Royal Forest blazed back to life at once.\n\nThe shadow dissolved - not defeated but healed, transformed into warm air and soft light.\n\nThe creatures came flooding back - every hedgehog, every rabbit, every fox and owl and sparrow, surrounding [Role] [Name] in a joyful, chirping, rustling circle.\n\nThe forest was alive. The forest was healed. And its guardian stood at the center of it all, tears of joy on [her/his/their] cheeks and the deepest possible satisfaction in [her/his/their] heart.",
        photoCaption: "The Forest Awakens",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] at the center of an explosion of golden light in the forest as all lanterns reignite and animals rush joyfully back, magical restoration scene, warm golden light, no text",
      },
      {
        page: 14,
        title: "Courage Quest Portrait",
        text: "On the Courage Quest trail, [Role] [Name] stood tall in the newly restored forest light.\n\nSomewhere in the canopy above, every bird in the forest was singing at once - a wild, complicated, beautiful chorus that had not been heard in years.\n\n[She/He/They] raised [her/his/their] staff, and the forest answered with a wave of rustling leaves and warm golden lantern glow.\n\nGuardian and forest. Forest and guardian. The agreement was sealed in light and song and the soft sound of creatures returning to their homes.\n\nThis was what [Name] was made for.",
        photoCaption: "Photo from Courage Quest",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Courage Quest",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] raising a carved staff in a forest blazing with golden lantern light as birds sing and animals gather joyfully, triumphant guardian moment, warm golden light, no text",
      },
      {
        page: 15,
        title: "A Ride Through the Canopy",
        text: "The oldest tree - the silver one with all the guardians' names - offered [Name] something extraordinary.\n\nFrom its highest branch descended a great eagle, ancient and golden-eyed, who bowed its head in invitation.\n\n[Role] [Name] climbed up, heart soaring before [she/he/they] even left the ground.\n\nThen up they flew - above the canopy, into the wide sky, banking and gliding over a forest that sparkled below like a field of living lanterns.\n\nFrom up here, [Name] could see how vast and beautiful it was - this forest [she/he/they] had saved. How full of life. How full of light.\n\nEvery creature below looked up and saw their guardian flying overhead - and the whole forest rang with joy.",
        photoCaption: "A Ride Through the Canopy",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] riding a majestic golden eagle above the treetops of a glowing forest, animals visible below looking up joyfully, wide open sky, warm golden light, no text",
      },
      {
        page: 16,
        title: "The Kingdom Celebrates",
        text: "Back at the castle, the celebration was wild and wonderful.\n\nCreatures from the forest had followed [Name] to the castle gates - carefully, shyly, but there. A fox sitting at the foot of the steps. Three rabbits peering through the garden gate. An owl perched on the castle banner.\n\nThe people of the kingdom looked at this procession with wonder and joy.\n\n\"[Name] did not just save the forest,\" one of the royal advisors said softly. \"[She/He/They] brought the forest home to us.\"\n\nThe King wiped his eyes. [Name] laughed and held out [her/his/their] arm, and the owl swooped down to sit on [her/his/their] wrist as if it had always lived there.",
        photoCaption: "The Kingdom Celebrates",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] returning to the castle with forest animals following - fox, rabbits, owl perched on [her/his/their] wrist - people of the kingdom watching with wonder, warm golden light, no text",
      },
      {
        page: 17,
        title: "The Hero Returns",
        text: "That evening, [Role] [Name] walked through the castle gardens and sat beside the fountain for a long time.\n\nThe owl sat beside [her/him/them]. The silver fox from the forest had slipped through the gate and curled up near [her/his/their] feet.\n\n[Name] stroked the fox's ears gently. It purred - or whatever foxes do when they are deeply, completely content.\n\nA guardian does not stop at sundown, [Name] thought. The work is never quite finished. But tonight - tonight everything was safe. Tonight was enough.",
        photoCaption: "The Hero Returns",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] sitting by a garden fountain with a silver fox curled at [her/his/their] feet and an owl beside [her/him/them], peaceful evening, warm golden light, no text",
      },
      {
        page: 18,
        title: "A Gift for the Kingdom",
        text: "The following spring, [Role] [Name] made a new tradition.\n\nEvery year on the day the forest was restored, the whole kingdom would gather at the forest's edge to plant trees together - one for every person in the kingdom, young and old.\n\nThey called it the Day of Growing.\n\nAnd on each tree, [Name] tied a small ribbon with a word on it. Not a grand word. Just: \"Tend.\"\n\n\"This is your tree,\" [Name] told each person. \"Tend it. Watch it. And remember: the world gets better when we take care of what cannot take care of itself.\"",
        photoCaption: "A Gift for the Kingdom",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] leading a whole kingdom in planting small trees at the forest's edge, each tree tagged with a small ribbon, joyful community scene, warm golden light, no text",
      },
      {
        page: 19,
        title: "The Stars Remember",
        text: "That night [Role] [Name] lay in the soft grass at the forest's edge and watched the stars emerge.\n\nThe owl sat nearby. Somewhere in the trees, the creatures settled into sleep.\n\nThe lanterns of the forest and the lanterns of the stars seemed to mirror each other - two great canopies of light, one above and one below, and [Name] cradled between them.\n\n[She/He/They] thought: this is what I want my life to look like. Full of living things. Full of care. Full of light that I helped to keep burning.\n\nThe stars agreed. The forest breathed. And [Name] closed [her/his/their] eyes in perfect peace.",
        photoCaption: "The Stars Remember",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] lying peacefully in forest grass gazing up at a brilliant starry sky with forest lanterns glowing all around, an owl nearby, pure peace, warm golden light, no text",
      },
      {
        page: 20,
        title: "Always a Hero",
        text: "And so, [Role] [Name] lived bravely ever after.\n\nNot because [she/he/they] was the loudest or the strongest. But because [she/he/they] cared for the things that could not speak. Protected the ones that needed protecting. And stayed, steadily, when the darkness came.\n\nFor all the years that followed, the Kingdom of Light and the Royal Forest lived together in harmony - because a guardian had come who understood that gentleness is not weakness, and that caring for the small things is the greatest adventure of all.\n\nThe [Role] who did that was named [Name]. And [Name] was always, always a hero.\n\nThe End.",
        photoCaption: "Always a Hero",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, peaceful final scene of [Role] [Name] standing at the edge of a glowing forest with animals surrounding [her/him/them] and a golden sky above, serene and joyful, warm golden light, no text",
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────
  //  PATH 5 — KINDNESS QUEST
  // ─────────────────────────────────────────────────────────────
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
        title: "The Legend Begins",
        text: "In the Kingdom of Light, the greatest power was not in swords or shields.\n\nIt lived in a simpler, rarer thing: the ability to see someone who was hurting and choose to stay.\n\n[Role] [Name] had always had this power. [She/He/They] noticed the child sitting alone at the feast. [She/He/They] remembered the name of every person [she/he/they] met. [She/He/They] asked \"How are you?\" and then actually waited for the answer.\n\nThis is the story of the time that power saved an entire village - and proved, once and for all, that kindness is not just gentle. Kindness is brave.",
        photoCaption: "The Legend Begins",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] standing in a golden kingdom square, warm and open-hearted, people in the background with a few looking lonely or sad, warm golden light, no text",
      },
      {
        page: 2,
        title: "The Call to Adventure",
        text: "The message came not from a messenger on horseback but from a small and weary traveler who arrived at the castle gates looking defeated and grey.\n\nShe was from a village at the kingdom's edge - a village where, she said, people had stopped speaking to each other. Where loneliness had crept in like cold fog and no one knew how to push it back out.\n\nThe King listened and then looked at [Role] [Name].\n\n\"Not every quest needs a weapon,\" he said. \"This one needs a heart. Your heart. Will you go?\"\n\n[Name] stood up immediately. \"Tell me the way,\" [she/he/they] said.",
        photoCaption: "The Call to Adventure",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] listening to a weary traveler in a castle hall, the King nearby, warm and compassionate expression, warm golden light, no text",
      },
      {
        page: 3,
        title: "Throne Room Portrait",
        text: "In the Castle Throne Room, the King offered [Name] something unusual: not a sword, not armor, but a small golden notebook and a pen.\n\n\"Words can be as powerful as any weapon,\" he said. \"Write kindness into it - and give each page away.\"\n\n[Role] [Name] looked at the notebook thoughtfully. It was beautiful - the pages were soft, the cover was warm gold, and it smelled faintly of something safe and home-like.\n\n\"I will fill every page,\" [Name] promised. And the King smiled like someone whose faith had just been perfectly placed.",
        photoCaption: "Photo from Castle Throne Room",
        // @ts-ignore - photoSet used as display label for session matching
        photoSet: "Castle Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "watercolor and colored pencil coloring book style, soft ink outlines, [Role] [Name] receiving a golden notebook from the King in the throne room, warm and meaningful moment, warm golden light, no text",
      },
      {
        page: 4,
        title: "Words of Gold",
        text: "Before leaving the throne room, [Role] [Name] sat at the great table and began to write.\n\nPage after page, [she/he/they] wrote down things that were true: You are seen. You are not alone. Your kindness matters. You belong here.\n\nThe words seemed to glow a little as [Name] wrote them, as if the gold in the notebook was responding to the truth.\n\n[She/He/They] wrote until [her/his/their] hand ached, then looked at the pages and felt something catch in [her/his/their] chest.\n\nSomeone out there needed every