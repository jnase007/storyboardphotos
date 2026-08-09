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

/** v5 = longer bedtime scripts + real treasure hunt + outfit-lock era */
export const ADVENTURE_PATHS_STORAGE_KEY = "sbp-adventure-paths-v5";

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
    label: "Slay the Dragon",
    title: "The Dragon Quest",
    description:
      "Face the great dragon with courage — and discover that bravery and kindness can turn a foe into a friend.",
    bibleVerse: "Joshua 1:9",
    bibleVerseText:
      "Be strong and courageous. Do not be afraid… for the Lord your God is with you wherever you go.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} Child faces a fearsome-but-not-gory dragon. Climax is courage and kindness that calms or befriends the dragon — never graphic violence, never spells. Theme: true strength protects others (Joshua 1:9).`,
    bookTitleTemplate: "[Role] [Name] and the Dragon Quest",
    pages: [
      {
        page: 1,
        title: `The Dragon Quest`,
        staticScene: "dragon-slayer/title",
        text: `[Role] [Name] and the Dragon Quest`,
        photoCaption: `A kingdom of light awaits`,
        useSessionPhoto: false,
        imagePromptHint: "title page watercolor no text, no wands no spells",
      },
      {
        page: 2,
        title: `The Kingdom of Light`,
        staticScene: "kingdom-map",
        text: `Welcome to the Kingdom of Light — a bright realm of living forests, royal gardens, and ancient castles.

Every path leads to adventure. Every adventure begins with a brave heart.

Your kingdom awaits, [Role] [Name].

Be strong and courageous… for the Lord your God is with you. — Joshua 1:9`,
        photoCaption: `Map of the Kingdom`,
        useSessionPhoto: false,
        imagePromptHint: "kingdom map watercolor no text",
      },
      {
        page: 3,
        title: `The Call`,
        staticScene: "dragon-slayer/call",
        text: `In the Kingdom of Light, a golden morning turned to shadow when word arrived: a great dragon had settled in the hills beyond the valley, and the people trembled with fear.

The King himself walked slowly to the throne room window and gazed out at the distant smoke curling above the mountains. He had heard of one person brave enough — one whose heart was made not just of courage, but of kindness.

He turned and called out the name that made the whole kingdom hold its breath.

"[Name]," the King said softly, "the dragon does not need to be defeated. It needs to be understood. Will you go? Will you bring peace back to our land?"

[Role] [Name] looked out at the distant mountains, felt afraid — just a little — and then felt something stronger rising in [Name]'s chest: a deep and steady courage, like a flame that cannot be blown out.

[Name] stood tall and answered with one quiet word: "Yes."`,
        photoCaption: `The quest begins`,
        useSessionPhoto: false,
        imagePromptHint: "call to adventure watercolor no text",
      },
      {
        page: 4,
        title: `The Royal Throne`,
        text: `The Throne Room was the most magnificent place [Role] [Name] had ever seen. Banners of crimson and gold hung from the vaulted ceiling, and every stone in the walls had been polished smooth by generations of royal hands.

In the center of the room, upon a platform of pure white marble, stood the throne — carved from the wood of an ancient oak, inlaid with gold, and draped in velvet the color of midnight sky.

[Role] [Name] walked toward it slowly, footsteps echoing in the sacred silence of the hall. [Name] sat down gently, as one sits on something holy.

Because it was.

This was where every great leader of the kingdom had sat before [Name]. This was where decisions were made that changed lives. This was where courage lived — not in swords or armies, but in the quiet, steady commitment to do what was right.

[Role] [Name] straightened [Name]'s back, lifted [Name]'s chin, and whispered the words that every ruler must one day learn to believe: "I am ready."`,
        photoCaption: `Portrait from the Throne Room`,
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint: "throne room portrait watercolor no text",
      },
      {
        page: 5,
        title: `A Royal Promise`,
        staticScene: "dragon-slayer/call",
        text: `[Role] [Name] rose from the golden throne and walked to the great balcony that overlooked the kingdom. Far below, the people had gathered — farmers and bakers, children and elders — all of them looking upward with hope in their eyes.

A hush fell over the crowd.

[Role] [Name] placed one hand over [Name]'s heart and spoke in a voice clear and calm enough to carry to the very edges of the kingdom: "I will face the dragon. Not with anger — but with understanding. Not with a desire to win — but with a desire to make peace. I give you my word."

For a long moment, there was silence. And then — the cheering began. It rolled across the courtyard like thunder, warm and full and generous, the sound of a people who believed in their [role] with every fiber of their being.

[Role] [Name] smiled. It was time.`,
        photoCaption: `A royal promise`,
        useSessionPhoto: false,
        imagePromptHint: "royal promise watercolor coloring book no text",
      },
      {
        page: 6,
        title: `Into the Royal Forest`,
        text: `The Royal Forest was ancient and alive, full of the kind of quiet that feels inhabited — as if the trees themselves were listening.

[Role] [Name] walked along the lantern-lit path, each step soft on the mossy ground. The light from the lanterns filtered through the leaves in golden patches, and somewhere high above, birds called to one another in the canopy.

At the base of an enormous oak tree, a small woodland creature sat watching [Name] with bright, kind eyes.

"You have come far," it said. "And you have a good heart. But hearts alone do not win battles. You must learn one more thing before you face the dragon."

[Role] [Name] sat down on a nearby stone. "What must I learn?"

The creature was quiet for a moment, then said: "That the bravest thing you can do is to see someone — truly see them — even when they are frightening. Especially then."

[Role] [Name] sat with those words until they settled deep inside [Name], like seeds finding soil.`,
        photoCaption: `Portrait in the Royal Forest`,
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint: "royal forest portrait watercolor no text",
      },
      {
        page: 7,
        title: `Face to Face`,
        staticScene: "dragon-slayer/dragon",
        text: `The dragon emerged from behind a curtain of morning mist — enormous and ancient, with scales the color of storm clouds and eyes like amber lanterns burning in the dark.

For a long moment, neither of them moved.

[Role] [Name] felt [Name]'s heart beating fast. But [Name] did not run. Instead, [Name] took one slow step forward. Then another. Until [Name] stood close enough to feel the warmth radiating from the dragon's great chest.

"I'm not here to fight you," [Name] said, voice steady and clear. "I'm here because I believe you are more than what they say you are."

The dragon lowered its head. Its breath came out in slow plumes of smoke. And then — very softly — it spoke.

"I just want to belong somewhere. I just want a home."

[Role] [Name] felt something break open inside [Name] — not pain, but tenderness. The deep and aching tenderness of recognizing another soul who is lonely.

"Then you have already found one," [Name] said. "I promise."`,
        photoCaption: `The dragon encounter`,
        useSessionPhoto: false,
        imagePromptHint: "dragon encounter watercolor no text",
      },
      {
        page: 8,
        title: `The Royal Garden`,
        text: `The Royal Garden was the most beautiful place in all the kingdom — a living tapestry of color and fragrance that seemed to exist outside of time.

[Role] [Name] walked slowly through the garden paths, letting the peace of the place settle over [Name] like a warm blanket. Roses climbed the stone walls. Butterflies drifted from flower to flower. The air smelled of honey and earth and something sweeter that had no name.

In the very center of the garden grew a flower unlike any other — a single blossom that glowed softly, as if it had captured a piece of the sun inside itself.

[Role] [Name] knew immediately what it was: the gift that would seal the promise. The thing that would turn a former enemy into a lifelong friend.

[Name] reached down gently, cupped the flower in both hands, and lifted it carefully. It pulsed once — warm and steady — like a heartbeat.

"Thank you," [Name] whispered to the garden. And [Name] could have sworn the flowers nodded back.`,
        photoCaption: `Portrait in the Royal Garden`,
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint: "royal garden portrait watercolor no text",
      },
      {
        page: 9,
        title: `The Courage Quest`,
        text: `The Courage Quest was the final challenge — a place of great and ancient power, where the kingdom's story had been written and rewritten across centuries.

[Role] [Name] arrived at the summit as the sun was beginning its slow descent toward the horizon. The light was golden and warm, painting everything it touched in shades of amber and rose.

[Name] stood still for a moment and breathed it all in: the smell of stone and sky, the distant sound of the kingdom below, the weight of the glowing blossom still cradled in [Name]'s hands.

This was it. This was the moment.

[Role] [Name] was not the same person who had answered the King's call that morning. [Name] had walked through lantern-lit forests and sat upon ancient thrones. [Name] had looked into the eyes of something frightening and chosen love over fear.

And now [Name] was ready — not because [Name] had no fear left, but because [Name] had learned that courage was never the absence of fear. Courage was the decision that something — and someone — else mattered more.`,
        photoCaption: `Portrait at the Courage Quest`,
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint: "courage quest portrait watercolor no text",
      },
      {
        page: 10,
        title: `The Kingdom Rejoices`,
        staticScene: "dragon-slayer/victory",
        text: `When [Role] [Name] returned home, the dragon flew peacefully above the castle towers — not as a threat, but as a guardian. Its great wings caught the evening light, turning it into something that looked almost like a sunset made of scales.

The people of the kingdom had gathered in the courtyard. When they saw [Role] [Name] walk through the gates — and saw the dragon land gently on the castle wall above — the cheering that rose up was unlike anything any of them had ever heard before.

The King stepped forward and placed his hands on [Role] [Name]'s shoulders.

"You did not just save the kingdom," he said, his voice full and quiet at the same time. "You showed us what it means to be truly brave. You showed us that the greatest strength is not force — it is love."

[Role] [Name] looked out at the faces of the people — all those faces alight with joy and wonder and relief — and felt something complete settle into place deep in [Name]'s chest.

This was what [Name] had been made for. Not glory. Not power. But this: the quiet, impossible, perfect miracle of bringing people home to one another.`,
        photoCaption: `The kingdom rejoices`,
        useSessionPhoto: false,
        imagePromptHint: "victory watercolor no text",
      },
      {
        page: 11,
        title: `Always a Hero`,
        staticScene: "dragon-slayer/end",
        text: `That night, after the celebrations had faded and the kingdom had grown quiet, [Role] [Name] sat by the window and looked out at the stars.

The dragon was there — curled around the highest tower like a great, gentle guardian — its breath rising slowly in the cool night air. Every now and then, a small flame flickered at its nostrils, and for a moment the darkness glowed gold.

[Role] [Name] thought about the journey. About the fear and the courage. About the loneliness in the dragon's eyes and the warmth of the moment it had been seen — truly seen — for the first time.

About how a single act of bravery had not just saved a kingdom, but had changed two hearts forever.

Somewhere in the streets below, a child looked up at the stars and spoke a name in a wondering whisper. [Role] [Name] heard it carried on the wind, and smiled.

Because that is what heroes do. Not because they are fearless. Not because they are perfect. But because when the moment comes — when the world needs someone to step forward and choose love — they say yes.

Always, they say yes.`,
        photoCaption: `The end`,
        useSessionPhoto: false,
        imagePromptHint: "peaceful ending watercolor no text",
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
    bibleVerse: "Luke 15:4",
    bibleVerseText:
      "What man of you, having a hundred sheep, if he has lost one of them, does not leave the ninety-nine… and go after the one that is lost?",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} Child leads a rescue to find friends who are lost or scared (never dark/horror). Theme: the Good Shepherd heart — leave none behind (Luke 15:4). No spells or wands.`,
    bookTitleTemplate: "[Role] [Name] and the Rescue Mission",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Rescue Mission",
        photoCaption: "Royal portrait of the child",
        staticScene: "rescue-mission/title",
        useSessionPhoto: false,
        imagePromptHint:
          "COVER PORTRAIT: [Role] [Name] ready for rescue with a simple lantern, soft throne or courtyard backdrop, calm brave smile, watercolor, NO text NO wand",
      },
      {
        page: 2,
        title: "The Kingdom of Light",
        staticScene: "kingdom-map",
        text: `Welcome to the Kingdom of Light — a bright realm of living forests, royal gardens, and ancient castles.

Every path leads to adventure. Every adventure begins with a brave heart.

Your kingdom awaits, [Role] [Name].

What man of you, having a hundred sheep, if he has lost one of them, does not… go after the one that is lost? — Luke 15:4`,
        photoCaption: "Map of the Kingdom",
        useSessionPhoto: false,
        imagePromptHint: "watercolor kingdom map overview warm gold light, no text",
      },
      {
        page: 3,
        staticScene: "rescue-mission/call",
        title: "The Call",
        text: `A messenger raced into the courtyard as the sun dipped low. Friends from the valley had not come home — night was falling fast.

The King turned to [Role] [Name].

"[Name], will you lead the rescue? The kingdom trusts your brave and caring heart."

[Role] [Name] felt a flutter of worry, then something steadier: love that would not leave anyone behind.

"I will find them," [Name] said.

What man… does not go after the one that is lost? — Luke 15:4`,
        photoCaption: "Child looking determined",
        imagePromptHint:
          "THE CALL: castle courtyard golden hour, [Role] [Name] receiving urgent news from a messenger, DIFFERENT from cover, watercolor, no text no wand",
      },
      {
        page: 4,
        title: "The Royal Throne",
        text: `In the Throne Room, banners of crimson and gold hung still in the quiet.

[Role] [Name] received a royal map and a lantern of hope. The King rested a hand on [Name]'s shoulder.

"No one in our kingdom is left behind," [Name] promised the people gathered at the doors.

[Name] sat one moment on the great oak throne, lifted [Name]'s chin, and whispered, "I am ready."

Then [Name] set out, heart steady and eyes bright.`,
        photoCaption: "Photo from Castle Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "throne room: [Role] [Name] with map and lantern, marble banners, full body, watercolor, no text",
      },
      {
        page: 5,
        title: "Into the Valley Road",
        text: `Beyond the castle gates the valley road wound between soft hills.

[Role] [Name] walked quickly but carefully, calling friendly names into the dusk. Crickets began their song. The lantern made a warm circle on the path.

A farmer pointed toward the Royal Forest. "I heard voices that way — little ones, tired ones."

[Name] thanked him and hurried on. Every step was a promise: I am coming.`,
        photoCaption: "The valley road",
        useSessionPhoto: false,
        imagePromptHint:
          "dusk valley road: [Role] [Name] walking with lantern toward forest hills, full body, watercolor, no text",
      },
      {
        page: 6,
        title: "Royal Forest",
        text: `Through the Royal Forest, [Name] followed soft footprints and distant calls for help.

Lantern light guided [Name] between the trees until [Name] found the first friend — cold, scared, but safe beside a mossy log.

"You're not alone anymore," [Role] [Name] said gently, wrapping a cloak around small shoulders.

Together they listened. Another call floated from deeper in the woods. The rescue was only beginning.`,
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "lantern forest: [Role] [Name] comforting a small friend, caring moment, full body, watercolor, no text no wand",
      },
      {
        page: 7,
        title: "Royal Garden",
        text: `In the Royal Garden, another friend had wandered among the roses and lost the path home.

[Role] [Name] offered a hand and a smile. "We go together."

They walked the blooming paths, counting lantern posts and laughing a little when a butterfly landed on the map.

The garden seemed to bloom brighter with every step of kindness. Two friends found. Hearts lighter. Still one more to go.`,
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "royal garden: [Role] [Name] helping a friend through roses, warm light, full body, watercolor, no text",
      },
      {
        page: 8,
        title: "The High Bridge",
        text: `The final rescue waited at the Courage Quest — a gentle stone bridge that felt too high for little feet, and a friend too frightened to cross.

[Role] [Name] stood beside them and whispered, "We go together. One step, then another."

Hand in hand, they crossed. The river sang below. On the far side, all three friends hugged [Name] at once.

Everyone was safe.`,
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "stone bridge overlook: [Role] [Name] helping a friend cross bravely, kind and steady, full body, watercolor, no text",
      },
      {
        page: 9,
        staticScene: "rescue-mission/found",
        title: "The Long Walk Home",
        text: `Home was a long walk in the best way.

[Role] [Name] led the little group along the lantern path, singing a soft marching song so tired feet kept moving. Stars blinked on one by one.

When the castle towers rose ahead, someone cheered. Then everyone did.

[Name] smiled. Finding the lost felt like finding treasure — the living kind.`,
        photoCaption: "Walking home together",
        useSessionPhoto: false,
        imagePromptHint:
          "night path to castle: [Role] [Name] leading small friends home under stars, joyful, full body, watercolor, no text",
      },
      {
        page: 10,
        title: "The Kingdom Rejoices",
        text: `Back at the castle, cheers rose like music.

Families hugged. Friends laughed. Warm bread and honey milk appeared as if by kindness alone.

The King placed a hand on [Name]'s shoulder.

"You did not just find the lost," he said. "You reminded us what royalty means — to care for one another."

[Role] [Name] looked at every safe face and felt something complete settle deep in [Name]'s chest.`,
        photoCaption: "Child looking proud",
        useSessionPhoto: false,
        imagePromptHint:
          "castle hall celebration: [Role] [Name] with rescued friends and families hugging, warm light, watercolor, no text",
      },
      {
        page: 11,
        title: "The End",
        staticScene: "rescue-mission/end",
        useSessionPhoto: false,
        text: `That night [Role] [Name] sat by the window and watched the valley lights.

Somewhere a child slept safe because someone went looking.

And so, [Role] [Name] lived bravely ever after,
knowing [Name] is strong, kind, and deeply loved.

The End.`,
        photoCaption: "Final portrait",
        imagePromptHint:
          "peaceful night window ending with [Role] [Name], soft golden light, watercolor, no text",
      },
    ],
  },
  {
    id: "lost-crown",
    option: 3,
    label: "Find the Crown",
    title: "The Lost Crown",
    description:
      "The royal crown is missing! Follow clues across the kingdom and return it with a true heart.",
    bibleVerse: "Proverbs 4:23",
    bibleVerseText:
      "Keep your heart with all vigilance, for from it flow the springs of life.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} Mystery: the royal crown is lost. Child follows clues and recovers it with honesty, not greed. Theme: guard your heart; true royalty serves (Proverbs 4:23). No magical artifacts that cast spells — crown is a symbol of responsibility.`,
    bookTitleTemplate: "[Role] [Name] and the Lost Crown",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Lost Crown",
        photoCaption: "Royal portrait of the child",
        staticScene: "lost-crown/title",
        useSessionPhoto: false,
        imagePromptHint:
          "COVER PORTRAIT: [Role] [Name] with soft crown motif, calm curious smile, simple throne or cream backdrop, watercolor, NO text NO wand",
      },
      {
        page: 2,
        title: "The Kingdom of Light",
        staticScene: "kingdom-map",
        text: `Welcome to the Kingdom of Light — a bright realm of living forests, royal gardens, and ancient castles.

Every path leads to adventure. Every adventure begins with a brave heart.

Your kingdom awaits, [Role] [Name].

Keep your heart with all vigilance, for from it flow the springs of life. — Proverbs 4:23`,
        photoCaption: "Map of the Kingdom",
        useSessionPhoto: false,
        imagePromptHint: "watercolor kingdom map overview, no text",
      },
      {
        page: 3,
        staticScene: "lost-crown/call",
        title: "The Call",
        text: `Morning bells rang strangely in the Kingdom of Light — the royal crown was gone from its velvet pillow!

Courtiers whispered. The King looked to [Role] [Name].

"You notice what others miss. Will you find our crown and restore the kingdom's light?"

[Name] nodded. A mystery awaited — not for glory, but for a true heart.

Keep your heart with all vigilance… — Proverbs 4:23`,
        photoCaption: "Child looking curious",
        imagePromptHint:
          "THE CALL: [Role] [Name] beside empty velvet crown pillow in castle hall, mystery mood, DIFFERENT from cover, watercolor, no text",
      },
      {
        page: 4,
        title: "Castle Throne Room",
        text: `In the Castle Throne Room, [Role] [Name] searched carefully — under banners, along marble steps, beside the great oak chair.

Beneath a hanging banner, [Name] found the first clue: a golden thread leading toward the forest doors.

"Every clue brings us closer," [Name] said with a spark of hope.

[Name] tied the thread gently around a finger and stepped into the adventure.`,
        photoCaption: "Photo from Castle Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "throne room clue: [Role] [Name] finding golden thread under a banner, full body, watercolor, no text",
      },
      {
        page: 5,
        title: "Footprints of Gold",
        text: `Outside the castle, the golden thread glittered across the courtyard stones.

[Role] [Name] followed it past the fountain and the bakery cart. A child pointed: "It went toward the trees!"

[Name] thanked them and hurried on. Mystery felt less scary when the whole kingdom helped a little.`,
        photoCaption: "Courtyard clues",
        useSessionPhoto: false,
        imagePromptHint:
          "castle courtyard: [Role] [Name] following thin golden thread toward forest gate, full body, watercolor, no text",
      },
      {
        page: 6,
        title: "Royal Forest",
        text: `The golden thread wound through the Royal Forest.

Among the lanterns, [Name] discovered a second clue — a jewel that belonged to the crown, resting in a nest of soft moss.

"Thank you, forest," [Name] whispered.

The path was becoming clear. Integrity meant picking up what was lost — and not keeping it for yourself.`,
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "lantern forest: [Role] [Name] finding a jewel clue in moss, full body, watercolor, no text no wand",
      },
      {
        page: 7,
        title: "Royal Garden",
        text: `In the Royal Garden, petals hid a tiny map drawn in gold ink.

It pointed to the Courage Quest hills — where the crown waited for someone brave enough to claim it with honesty, not greed.

[Role] [Name] tucked the map beside the jewel and the thread.

"Almost there," [Name] said, and the roses seemed to nod in the breeze.`,
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "garden: [Role] [Name] reading tiny gold map among flowers, full body, watercolor, no text",
      },
      {
        page: 8,
        title: "Courage Quest",
        text: `At the Courage Quest, [Role] [Name] found the crown resting on a stone of light.

A soft voice asked — maybe the wind, maybe the heart — "Who seeks the crown: for glory, or for the people?"

"For the people," [Name] answered.

The crown gleamed in the sun, and [Name] lifted it with care, never placing it on [Name]'s own head. It belonged to the kingdom.`,
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "hill stone of light: [Role] [Name] carefully lifting a simple gold crown, humble pose, full body, watercolor, no text",
      },
      {
        page: 9,
        staticScene: "lost-crown/discovery",
        title: "The Careful Return",
        text: `Carrying a crown is a holy kind of careful.

[Role] [Name] walked home slowly so no jewel would slip. Birds hopped along the path as if escorting a parade.

Villagers bowed not to the gold — but to the child who brought it back without keeping it.`,
        photoCaption: "Returning the crown",
        useSessionPhoto: false,
        imagePromptHint:
          "[Role] [Name] walking home carrying crown carefully on a cushion or both hands, villagers watching kindly, watercolor, no text",
      },
      {
        page: 10,
        title: "The Kingdom Glows",
        text: `When [Role] [Name] returned the crown to the King, the kingdom glowed brighter than before.

"You found more than gold," the King said. "You found the meaning of royalty — to serve with a true heart."

Bells rang the right way again. Children clapped. [Name] felt rich without keeping a single coin.`,
        photoCaption: "Child looking proud",
        useSessionPhoto: false,
        imagePromptHint:
          "castle hall: [Role] [Name] returning crown to King, celebration light, watercolor, no text",
      },
      {
        page: 11,
        title: "The End",
        staticScene: "lost-crown/end",
        useSessionPhoto: false,
        text: `That night [Role] [Name] sat by the window. The crown rested safe on its velvet pillow once more.

And so, [Role] [Name] lived bravely ever after,
knowing [Name] is strong, kind, and deeply loved.

The End.`,
        photoCaption: "Final portrait",
        imagePromptHint:
          "peaceful ending [Role] [Name] by window, soft golden light, watercolor, no text",
      },
    ],
  },
  {
    id: "forest-guardian",
    option: 4,
    label: "Forest Guardian",
    title: "The Forest Guardian",
    description:
      "God's green world needs a protector. Care for the creatures and restore the light to the trees.",
    bibleVerse: "Genesis 2:15",
    bibleVerseText:
      "The Lord God took the man and put him in the garden of Eden to work it and keep it.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} Child becomes guardian of the living forest, helping animals and restoring light to the trees. Theme: stewardship of creation (Genesis 2:15). No magic spells — light is care, courage, and God's good design.`,
    bookTitleTemplate: "[Role] [Name] and the Forest Guardian",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Forest Guardian",
        photoCaption: "Royal portrait of the child",
        staticScene: "forest-guardian/title",
        useSessionPhoto: false,
        imagePromptHint:
          "COVER PORTRAIT only: [Role] [Name] facing viewer in a soft garden arch or simple throne backdrop, calm smile, holding flowers or a small unlit lantern — NOT deep forest action, NO staff, NO wand, NO fairies casting spells, children's book style, no text",
      },
      {
        page: 2,
        title: "The Kingdom of Light",
        staticScene: "kingdom-map",
        text: `Welcome to the Kingdom of Light — a bright realm of living forests, royal gardens, and ancient castles.

Every path leads to adventure. Every adventure begins with a brave heart.

Your kingdom awaits, [Role] [Name].

The Lord God took the man and put him in the garden of Eden to work it and keep it. — Genesis 2:15`,
        photoCaption: "Map of the Kingdom",
        useSessionPhoto: false,
        imagePromptHint: "watercolor kingdom map with green forest emphasis, no text",
      },
      {
        page: 3,
        staticScene: "forest-guardian/call",
        title: "The Call",
        text: `The lanterns of the Royal Forest flickered weakly — the light that kept the woodland creatures safe was fading.

The King asked [Role] [Name]:

"Will you become the Forest Guardian and bring the light back to the trees?"

[Name] felt the call to care for creation and whispered, "Yes."

The Lord God… put him in the garden… to work it and keep it. — Genesis 2:15`,
        photoCaption: "Child looking wonder-struck",
        imagePromptHint:
          "THE CALL scene — DIFFERENT from cover: castle courtyard steps at golden hour, King or messenger with [Role] [Name], kingdom walls behind, beginning of journey pose, NO deep lantern forest clone of the cover, NO staff, NO wand, warm natural light, children's book style, no text",
      },
      {
        page: 4,
        title: "Castle Throne Room",
        text: `In the Castle Throne Room, [Role] [Name] received a guardian's cloak woven with leaf-gold thread.

"Protect the small and the quiet," the King said. "That is true power."

[Name] bowed, fastened the cloak, and set out for the woods with a simple lantern and a faithful heart.`,
        photoCaption: "Photo from Castle Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] receiving a leaf-gold cloak in a throne room, children's book illustration, no text no wand",
      },
      {
        page: 5,
        title: "Listening to the Trees",
        text: `At the forest edge, [Role] [Name] stopped and listened.

Wind moved the leaves like a soft conversation. A rabbit watched from the ferns. The first lantern on the path was dark.

[Name] cleaned the glass, trimmed the wick, and lit it with care from the castle flame.

One light. Then the path invited another step.`,
        photoCaption: "First lantern",
        useSessionPhoto: false,
        imagePromptHint:
          "forest edge: [Role] [Name] lighting first path lantern, rabbit watching, full body, watercolor, no text no wand no staff",
      },
      {
        page: 6,
        title: "Royal Forest",
        text: `Deep in the Royal Forest, [Name] found frightened creatures hiding from the dark.

[Name] lit the lanterns one by one and sang a soft song of courage.

The trees seemed to lean closer, listening. Owls blinked kindly. The woods felt less afraid with every warm circle of light.`,
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] lighting lanterns for forest creatures, living trees warm light, no spells no wands, children's book style, no text",
      },
      {
        page: 7,
        title: "Royal Garden",
        text: `The Royal Garden offered seeds of hope — tiny gifts that could strengthen tired roots.

[Role] [Name] carried them carefully in a small pouch, knowing every living thing deserved care.

[Name] planted a few along the garden wall and watered them gently. Stewardship looked like small hands doing faithful work.`,
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] gathering and planting hopeful seeds in a garden, warm daylight, no spells no wands, children's book illustration, no text",
      },
      {
        page: 8,
        title: "Courage Quest",
        text: `At the Courage Quest, a soft shadow tried to snuff out the last forest light.

[Role] [Name] planted the seeds of hope, stood firm, and shielded the final lantern with [Name]'s cloak.

Light returned. The shadow fled like mist at sunrise. The forest breathed again — and [Name] kept it with a faithful heart.`,
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] restoring forest light against a soft shadow, children's book style, no text no wand no staff",
      },
      {
        page: 9,
        title: "Creatures of the Green",
        text: `When the lanterns burned steady, the creatures came out to say thank you — deer at the path edge, squirrels in the branches, a fox with bright polite eyes.

[Role] [Name] did not boast. [Name] simply bowed to the woods.

"I will keep you," [Name] promised. "As long as I am able."`,
        photoCaption: "Forest friends",
        useSessionPhoto: false,
        imagePromptHint:
          "[Role] [Name] among gentle forest animals near lit lanterns, peaceful stewardship, full body, watercolor, no text no wand",
      },
      {
        page: 10,
        staticScene: "forest-guardian/magic",
        title: "The Return",
        text: `When [Role] [Name] returned, birds sang over the castle walls.

The King smiled. "You guarded what could not speak for itself. That is the heart of a true [Role]."

The people cheered for the Forest Guardian — not for power, but for care.`,
        photoCaption: "Child looking proud",
        imagePromptHint:
          "Watercolor of [Role] [Name] welcomed home with birds and forest light, children's book style, no text",
      },
      {
        page: 11,
        title: "The End",
        staticScene: "forest-guardian/end",
        useSessionPhoto: false,
        text: `That night the forest lanterns glowed like a string of quiet stars.

And so, [Role] [Name] lived bravely ever after,
knowing [Name] is strong, kind, and deeply loved.

The End.`,
        photoCaption: "Final portrait",
        imagePromptHint:
          "Watercolor closing scene of [Role] [Name] with soft forest-gold light, children's book illustration, no text",
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
    bibleVerse: "Ephesians 4:32",
    bibleVerseText:
      "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} Child spreads kindness to heal loneliness in the kingdom. Theme: be kind and tenderhearted (Ephesians 4:32). No "royal magic" — kindness is love in action, not a spell.`,
    bookTitleTemplate: "[Role] [Name] and the Kindness Quest",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Kindness Quest",
        photoCaption: "Royal portrait of the child",
        staticScene: "kindness-quest/title",
        useSessionPhoto: false,
        imagePromptHint:
          "COVER PORTRAIT: [Role] [Name] with a warm gentle smile, soft cream or garden arch backdrop, watercolor, NO text NO wand",
      },
      {
        page: 2,
        title: "The Kingdom of Light",
        staticScene: "kingdom-map",
        text: `Welcome to the Kingdom of Light — a bright realm of living forests, royal gardens, and ancient castles.

Every path leads to adventure. Every adventure begins with a brave heart.

Your kingdom awaits, [Role] [Name].

Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you. — Ephesians 4:32`,
        photoCaption: "Map of the Kingdom",
        useSessionPhoto: false,
        imagePromptHint: "watercolor kingdom map warm friendly light, no text",
      },
      {
        page: 3,
        staticScene: "kindness-quest/call",
        title: "The Call",
        text: `Not every quest needs a sword. In the Kingdom of Light, a quiet sadness had settled over one village — people felt unseen and alone.

The King asked [Role] [Name]:

"Will you carry kindness like a lantern and remind everyone they belong?"

[Name]'s answer was soft and sure: "I will."

Be kind to one another, tenderhearted… — Ephesians 4:32`,
        photoCaption: "Child looking compassionate",
        imagePromptHint:
          "THE CALL: [Role] [Name] holding a simple lantern of kindness in courtyard, DIFFERENT from cover, watercolor, no text no wand",
      },
      {
        page: 4,
        title: "Castle Throne Room",
        text: `From the Castle Throne Room, [Role] [Name] gathered notes of encouragement written in gold ink.

"Words can be as brave as armor," [Name] said, tucking them into a satchel.

Then [Name] set out to share them — one person, one smile, one brave sentence at a time.`,
        photoCaption: "Photo from Castle Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] with golden notes of encouragement in a throne room, children's book illustration, no text",
      },
      {
        page: 5,
        title: "The Quiet Village",
        text: `The village streets were neat but hushed. Doors stayed half-closed. A baker sighed without looking up.

[Role] [Name] began simply: a greeting, a thank-you, a note left on a windowsill that read You are seen.

One curtain opened. Then another. Kindness is contagious when someone goes first.`,
        photoCaption: "Village kindness",
        useSessionPhoto: false,
        imagePromptHint:
          "quiet village street: [Role] [Name] leaving a kind note at a door, warm hopeful mood, full body, watercolor, no text on note legible",
      },
      {
        page: 6,
        title: "Royal Forest",
        text: `In the Royal Forest, [Name] met a traveler who had lost hope.

[Name] sat beside them, listened without rushing, and left a note that read: You matter.

The forest felt warmer somehow — not from fire, but from friendship beginning again.`,
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] comforting a traveler in a lantern forest, children's book style, no text no wand",
      },
      {
        page: 7,
        title: "Royal Garden",
        text: `In the Royal Garden, [Role] [Name] invited shy children to plant flowers together.

Laughter returned like spring rain. Hands got dirty. Petals stuck to noses.

Kindness, [Name] learned, grows when it is shared — and gardens remember joy.`,
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "Premium watercolor of [Role] [Name] planting flowers with friends in a garden, bold ink outlines, cream paper feel, no text",
      },
      {
        page: 8,
        title: "Courage Quest",
        text: `The Courage Quest asked [Name] to speak kindness even when it felt hard — to include someone who had been left out at the edge of the crowd.

[Name] reached out a hand. "Walk with us."

That single brave moment lit the whole kingdom more than any banner ever could.`,
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "Watercolor of [Role] [Name] including someone left out, warm heroic kindness, children's book style, no text",
      },
      {
        page: 9,
        title: "Tables Made Longer",
        text: `By evening the village tables were pulled into the street. Bread was broken. Stories were told.

[Role] [Name] did not sit at the head like a show. [Name] sat in the middle, passing plates, listening, laughing.

Loneliness had less room when chairs kept being added.`,
        photoCaption: "Shared table",
        useSessionPhoto: false,
        imagePromptHint:
          "village evening long table feast: [Role] [Name] seated among neighbors sharing food, joyful, watercolor, no text",
      },
      {
        page: 10,
        staticScene: "kindness-quest/gift",
        title: "The Return",
        text: `When [Role] [Name] returned, the village glowed with new friendships.

The King said, "You healed what swords cannot. That is true royalty — love in action."

[Name] bowed, cheeks warm, heart full.`,
        photoCaption: "Child looking proud",
        imagePromptHint:
          "Watercolor celebration of kindness with [Role] [Name] at the castle, children's book style, no text",
      },
      {
        page: 11,
        title: "The End",
        staticScene: "kindness-quest/end",
        useSessionPhoto: false,
        text: `That night [Role] [Name] prayed a simple thank-you for every open door.

And so, [Role] [Name] lived bravely ever after,
knowing [Name] is strong, kind, and deeply loved.

The End.`,
        photoCaption: "Final portrait",
        imagePromptHint:
          "Watercolor closing scene of [Role] [Name] with soft golden light, children's book illustration, no text",
      },
    ],
  },
  {
    id: "light-treasure",
    option: 6,
    label: "Find the Treasure",
    title: "The Treasure Hunt",
    description:
      "An old map. Hidden clues. Real treasure waiting to be found — and shared with the whole kingdom.",
    bibleVerse: "Matthew 5:14",
    bibleVerseText: "You are the light of the world. A city set on a hill cannot be hidden.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} Classic treasure hunt: map, clues, chest of gold/jewels found through courage and honesty. Child FINDS real treasure (coins, gems, chest) — not only abstract "light." Theme: you are the light of the world — share what you find, do not hide goodness (Matthew 5:14). No magic spells; map/lantern/chest are ordinary adventure props. Treasure is discovered and shared, never stolen greedily.`,
    bookTitleTemplate: "[Role] [Name] and the Great Treasure Hunt",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "[Role] [Name]\nand the Great Treasure Hunt",
        photoCaption: "Royal portrait of the child",
        staticScene: "light-treasure/title",
        useSessionPhoto: false,
        imagePromptHint:
          "COVER PORTRAIT: [Role] [Name] holding an old rolled treasure map, soft gold coins motif, castle garden backdrop, children's book watercolor, NO text NO wand",
      },
      {
        page: 2,
        title: "The Kingdom of Light",
        staticScene: "kingdom-map",
        text: `Welcome to the Kingdom of Light — a bright realm of living forests, royal gardens, and ancient castles.\n\nEvery path leads to adventure. Every adventure begins with a brave heart.\n\nYour kingdom awaits, [Role] [Name].\n\nYou are the light of the world. A city set on a hill cannot be hidden. — Matthew 5:14`,
        photoCaption: "Map of the Kingdom",
        useSessionPhoto: false,
        imagePromptHint:
          "watercolor kingdom map overview with paths to forest garden and castle, warm gold light, no text",
      },
      {
        page: 3,
        staticScene: "light-treasure/call",
        title: "The Call",
        text: `One bright morning, a dusty old chest of drawers in the castle library rattled open by itself — and out tumbled a rolled parchment tied with red ribbon.\n\n[Role] [Name] unrolled it carefully. It was a treasure map.\n\nX marked a place beyond the Royal Forest. Little drawings showed a lantern tree, a rose arch, and a stone hill with a door.\n\nThe King smiled. "Our ancestors hid a treasure for the one brave enough to find it — and kind enough to share it. Will you go, [Name]?"\n\n[Role] [Name] held the map tight. "I will find the treasure."`,
        photoCaption: "The map is found",
        imagePromptHint:
          "THE CALL: [Role] [Name] unrolling an old treasure map in a sunlit castle library, excited pose, DIFFERENT from cover, no wand, watercolor, no text",
      },
      {
        page: 4,
        title: "The Royal Throne",
        text: `In the Throne Room, [Role] [Name] stood before the marble steps with the map in hand.\n\nBanners of crimson and gold hung from the ceiling. The King placed a small brass compass in [Name]'s palm.\n\n"Treasure is easy to want," the King said gently. "Harder to share. Find the chest — then bring its light home for everyone."\n\n[Role] [Name] nodded. "I promise."\n\n[Name] sat for one quiet moment on the great oak throne, straightened [Name]'s back, and whispered, "I am ready."`,
        photoCaption: "Portrait from the Throne Room",
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint:
          "throne room: [Role] [Name] with treasure map and brass compass, marble and gold banners, full body, watercolor, no text",
      },
      {
        page: 5,
        title: "Clue One: The Lantern Path",
        text: `The map's first mark led into the Royal Forest, where lanterns glowed along a mossy path.\n\n[Role] [Name] counted seven lanterns, just as the parchment said. At the seventh tree, something winked in the roots — a small golden key on a blue ribbon.\n\n"Clue one," [Name] said, lifting it carefully. "The key to the treasure."\n\nBirds chirped as if cheering. The forest felt friendlier already.`,
        photoCaption: "Portrait in the Royal Forest",
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint:
          "royal forest path: [Role] [Name] finding a small golden key at lantern tree roots, treasure hunt, full body, watercolor, no text no wand",
      },
      {
        page: 6,
        title: "Clue Two: The Rose Arch",
        text: `Next the map pointed to the Royal Garden.\n\nUnder a climbing rose arch, [Role] [Name] found a second clue: a round medallion carved with a sun. When [Name] held it up, sunlight flashed on a stone path toward the hills.\n\nButterflies drifted past. The air smelled of honey and earth.\n\n"Clue two," [Name] smiled. "We're getting closer."`,
        photoCaption: "Portrait in the Royal Garden",
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint:
          "royal garden rose arch: [Role] [Name] holding a sun medallion clue, treasure hunt, full body, watercolor, no text",
      },
      {
        page: 7,
        title: "The Hidden Door",
        text: `At the Courage Quest hills, [Role] [Name] found a stone door half-covered in ivy — the X on the map.\n\nThe golden key fit. Click.\n\nInside was a quiet cave lit by soft daylight from cracks above. In the center sat a wooden treasure chest bound with iron, waiting.\n\n[Name]'s heart beat fast — not from fear, but from wonder.`,
        photoCaption: "The hidden door",
        useSessionPhoto: false,
        imagePromptHint:
          "stone hill door with ivy, [Role] [Name] turning a golden key, treasure hunt entrance, full body, watercolor, no text no wand",
      },
      {
        page: 8,
        title: "Treasure Found!",
        staticScene: "light-treasure/discovery",
        text: `[Role] [Name] opened the chest.\n\nGold coins spilled like sunshine. Jewels sparkled — ruby red, sapphire blue, emerald green. A small crown of simple gold rested on top, and a letter in the lid read:\n\n"To the finder with a true heart: this treasure belongs to the whole kingdom. Share it, and you will be richer than gold."\n\n[Name] laughed with joy. "We found it! Real treasure!"\n\n[Name] did not stuff pockets full. [Name] closed the chest gently, locked it again, and prepared to carry it home — for everyone.`,
        photoCaption: "The treasure chest",
        useSessionPhoto: false,
        imagePromptHint:
          "TREASURE FOUND: open wooden chest full of gold coins and colorful jewels, [Role] [Name] kneeling in wonder, cave soft daylight, joyful, full body, watercolor children's book, no text no wand",
      },
      {
        page: 9,
        title: "The Climb Home",
        text: `Carrying treasure is hard work — even for a [Role].\n\n[Role] [Name] pulled the chest onto a little wooden cart from the cave wall and wheeled it carefully down the path. The compass spun happily. The map was finished.\n\nHalfway home, [Name] stopped to rest and look at the kingdom below — green forests, pink gardens, white castle walls.\n\n"This is why we share," [Name] whispered. "So the whole kingdom shines."`,
        photoCaption: "Photo from Courage Quest",
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint:
          "hill overlook: [Role] [Name] with small cart and treasure chest, kingdom vista below, full body, watercolor, no text",
      },
      {
        page: 10,
        title: "Shared with All",
        text: `When [Role] [Name] rolled the chest into the courtyard, the people gasped — then cheered.\n\nCoins and jewels were counted fairly. Some went to repair the village bridge. Some bought bread for families in need. Some sparkled in the castle hall so children could see that goodness finds a way.\n\nThe King placed a hand on [Name]'s shoulder.\n\n"You found the treasure," he said. "And you found something rarer — a heart that shares. That is the light of the world."`,
        photoCaption: "The kingdom shares the treasure",
        useSessionPhoto: false,
        imagePromptHint:
          "castle courtyard celebration: [Role] [Name] beside open treasure chest, villagers joyful, gold coins shared kindly, watercolor, no text",
      },
      {
        page: 11,
        title: "A Light on the Hill",
        staticScene: "light-treasure/end",
        text: `That night [Role] [Name] sat by the window. Far below, cottage lamps glowed. The castle tower shone like a city on a hill.\n\n[Name] thought of the map, the key, the rose arch, and the chest of real treasure — and of the greater treasure: bringing home something beautiful for others.\n\nYou are the light of the world. — Matthew 5:14\n\nAnd so, [Role] [Name] lived bravely ever after, knowing [Name] is strong, kind, and deeply loved.\n\nThe End.`,
        photoCaption: "Final portrait",
        useSessionPhoto: false,
        imagePromptHint:
          "night window ending: [Role] [Name] looking at glowing kingdom lights, peaceful, soft gold, watercolor, no text",
      },
    ],
  },
];
