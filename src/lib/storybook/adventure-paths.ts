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
        staticScene: "dragon-slayer/title",
        text: `[Role] [Name] and the Dragon Quest`,
        photoCaption: `A magical kingdom awaits`,
        useSessionPhoto: false,
        imagePromptHint: "title page watercolor no text",
      },
      {
        page: 2,
        title: `The Call`,
        staticScene: "dragon-slayer/call",
        text: `In the Kingdom of Light, a golden morning turned to shadow when word arrived: a great dragon had settled in the hills beyond the valley, and the people trembled with fear.

The King himself walked slowly to the throne room window and gazed out at the distant smoke curling above the mountains. He had heard of one person brave enough — one whose heart was made not just of courage, but of kindness.

He turned and called out the name that made the whole kingdom hold its breath.

"[Name]," the King said softly, "the dragon does not need to be defeated. It needs to be understood. Will you go? Will you bring peace back to our land?"

[Role] [Name] looked out at the distant mountains, felt afraid — just a little — and then felt something stronger rising in [her/his/their] chest: a deep and steady courage, like a flame that cannot be blown out.

[She/He/They] stood tall and answered with one quiet word: "Yes."`,
        photoCaption: `The quest begins`,
        useSessionPhoto: false,
        imagePromptHint: "call to adventure watercolor no text",
      },
      {
        page: 3,
        title: `The Royal Throne`,
        text: `The Throne Room was the most magnificent place [Role] [Name] had ever seen. Banners of crimson and gold hung from the vaulted ceiling, and every stone in the walls had been polished smooth by generations of royal hands.

In the center of the room, upon a platform of pure white marble, stood the throne — carved from the wood of an ancient oak, inlaid with gold, and draped in velvet the color of midnight sky.

[Role] [Name] walked toward it slowly, footsteps echoing in the sacred silence of the hall. [She/He/They] sat down gently, as one sits on something holy.

Because it was.

This was where every great leader of the kingdom had sat before [her/him/them]. This was where decisions were made that changed lives. This was where courage lived — not in swords or armies, but in the quiet, steady commitment to do what was right.

[Role] [Name] straightened [her/his/their] back, lifted [her/his/their] chin, and whispered the words that every ruler must one day learn to believe: "I am ready."`,
        photoCaption: `Portrait from the Throne Room`,
        photoSet: "Throne Room",
        useSessionPhoto: true,
        imagePromptHint: "throne room portrait watercolor no text",
      },
      {
        page: 4,
        title: `A Royal Promise`,
        staticScene: "dragon-slayer/call",
        text: `[Role] [Name] rose from the golden throne and walked to the great balcony that overlooked the kingdom. Far below, the people had gathered — farmers and bakers, children and elders — all of them looking upward with hope in their eyes.

A hush fell over the crowd.

[Role] [Name] placed one hand over [her/his/their] heart and spoke in a voice clear and calm enough to carry to the very edges of the kingdom: "I will face the dragon. Not with anger — but with understanding. Not with a desire to win — but with a desire to make peace. I give you my word."

For a long moment, there was silence. And then — the cheering began. It rolled across the courtyard like thunder, warm and full and generous, the sound of a people who believed in their [role] with every fiber of their being.

[Role] [Name] smiled. It was time.`,
        photoCaption: `A royal promise`,
        useSessionPhoto: false,
        imagePromptHint: "royal promise watercolor coloring book no text",
      },
      {
        page: 5,
        title: `Into the Royal Forest`,
        text: `The Royal Forest was ancient and alive, full of the kind of quiet that feels inhabited — as if the trees themselves were listening.

[Role] [Name] walked along the lantern-lit path, each step soft on the mossy ground. The light from the lanterns filtered through the leaves in golden patches, and somewhere high above, birds called to one another in the canopy.

At the base of an enormous oak tree, a small woodland creature sat watching [her/him/them] with bright, kind eyes.

"You have come far," it said. "And you have a good heart. But hearts alone do not win battles. You must learn one more thing before you face the dragon."

[Role] [Name] sat down on a nearby stone. "What must I learn?"

The creature was quiet for a moment, then said: "That the bravest thing you can do is to see someone — truly see them — even when they are frightening. Especially then."

[Role] [Name] sat with those words until they settled deep inside [her/him/them], like seeds finding soil.`,
        photoCaption: `Portrait in the Royal Forest`,
        photoSet: "Royal Forest",
        useSessionPhoto: true,
        imagePromptHint: "royal forest portrait watercolor no text",
      },
      {
        page: 6,
        title: `Face to Face`,
        staticScene: "dragon-slayer/dragon",
        text: `The dragon emerged from behind a curtain of morning mist — enormous and ancient, with scales the color of storm clouds and eyes like amber lanterns burning in the dark.

For a long moment, neither of them moved.

[Role] [Name] felt [her/his/their] heart beating fast. But [she/he/they] did not run. Instead, [she/he/they] took one slow step forward. Then another. Until [she/he/they] stood close enough to feel the warmth radiating from the dragon's great chest.

"I'm not here to fight you," [she/he/they] said, voice steady and clear. "I'm here because I believe you are more than what they say you are."

The dragon lowered its head. Its breath came out in slow plumes of smoke. And then — very softly — it spoke.

"I just want to belong somewhere. I just want a home."

[Role] [Name] felt something break open inside [her/him/them] — not pain, but tenderness. The deep and aching tenderness of recognizing another soul who is lonely.

"Then you have already found one," [she/he/they] said. "I promise."`,
        photoCaption: `The dragon encounter`,
        useSessionPhoto: false,
        imagePromptHint: "dragon encounter watercolor no text",
      },
      {
        page: 7,
        title: `The Royal Garden`,
        text: `The Royal Garden was the most beautiful place in all the kingdom — a living tapestry of color and fragrance that seemed to exist outside of time.

[Role] [Name] walked slowly through the garden paths, letting the peace of the place settle over [her/him/them] like a warm blanket. Roses climbed the stone walls. Butterflies drifted from flower to flower. The air smelled of honey and earth and something sweeter that had no name.

In the very center of the garden grew a flower unlike any other — a single blossom that glowed softly, as if it had captured a piece of the sun inside itself.

[Role] [Name] knew immediately what it was: the gift that would seal the promise. The thing that would turn a former enemy into a lifelong friend.

[She/He/They] reached down gently, cupped the flower in both hands, and lifted it carefully. It pulsed once — warm and steady — like a heartbeat.

"Thank you," [she/he/they] whispered to the garden. And [she/he/they] could have sworn the flowers nodded back.`,
        photoCaption: `Portrait in the Royal Garden`,
        photoSet: "Royal Garden",
        useSessionPhoto: true,
        imagePromptHint: "royal garden portrait watercolor no text",
      },
      {
        page: 8,
        title: `The Courage Quest`,
        text: `The Courage Quest was the final challenge — a place of great and ancient power, where the kingdom's story had been written and rewritten across centuries.

[Role] [Name] arrived at the summit as the sun was beginning its slow descent toward the horizon. The light was golden and warm, painting everything it touched in shades of amber and rose.

[She/He/They] stood still for a moment and breathed it all in: the smell of stone and sky, the distant sound of the kingdom below, the weight of the glowing blossom still cradled in [her/his/their] hands.

This was it. This was the moment.

[Role] [Name] was not the same person who had answered the King's call that morning. [She/He/They] had walked through lantern-lit forests and sat upon ancient thrones. [She/He/They] had looked into the eyes of something frightening and chosen love over fear.

And now [she/he/they] was ready — not because [she/he/they] had no fear left, but because [she/he/they] had learned that courage was never the absence of fear. Courage was the decision that something — and someone — else mattered more.`,
        photoCaption: `Portrait at the Courage Quest`,
        photoSet: "Chastle",
        useSessionPhoto: true,
        imagePromptHint: "courage quest portrait watercolor no text",
      },
      {
        page: 9,
        title: `The Kingdom Rejoices`,
        staticScene: "dragon-slayer/victory",
        text: `When [Role] [Name] returned home, the dragon flew peacefully above the castle towers — not as a threat, but as a guardian. Its great wings caught the evening light, turning it into something that looked almost like a sunset made of scales.

The people of the kingdom had gathered in the courtyard. When they saw [Role] [Name] walk through the gates — and saw the dragon land gently on the castle wall above — the cheering that rose up was unlike anything any of them had ever heard before.

The King stepped forward and placed his hands on [Role] [Name]'s shoulders.

"You did not just save the kingdom," he said, his voice full and quiet at the same time. "You showed us what it means to be truly brave. You showed us that the greatest strength is not force — it is love."

[Role] [Name] looked out at the faces of the people — all those faces alight with joy and wonder and relief — and felt something complete settle into place deep in [her/his/their] chest.

This was what [she/he/they] had been made for. Not glory. Not power. But this: the quiet, impossible, perfect miracle of bringing people home to one another.`,
        photoCaption: `The kingdom rejoices`,
        useSessionPhoto: false,
        imagePromptHint: "victory watercolor no text",
      },
      {
        page: 10,
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
        staticScene: "light-treasure/end",
        staticScene: "kindness-quest/end",
        staticScene: "forest-guardian/end",
        staticScene: "lost-crown/end",
        staticScene: "rescue-mission/end",
        text: "And so, [Role] [Name] lived bravely ever after,\nknowing [she/he/they] [is/are] strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final portrait",,
        useSessionPhoto: false,
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
        photoCaption: "Royal portrait of the child",,
        useSessionPhoto: false,
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
        photoSet: "Throne Room",,
        useSessionPhoto: false,
        imagePromptHint:
          "Watercolor of [Role] [Name] finding a golden thread clue in a throne room, children's book illustration, no text",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "The golden thread wound through the Royal Forest.\n\nAmong the lanterns, [Name] discovered a second clue - a sparkling jewel that belonged to the crown.\n\nThe path was becoming clear.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",,
        useSessionPhoto: false,
        imagePromptHint:
          "Watercolor of [Role] [Name] finding a jewel in a lantern forest, children's book style, no text",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "In the Royal Garden, petals hid a tiny map drawn in gold ink.\n\nIt pointed to the Courage Quest - where the crown waited for someone brave enough to claim it with honesty, not greed.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",,
        useSessionPhoto: false,
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
