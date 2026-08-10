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

/** v8 = clearer challenges: trial crown, kingdom race, treasure chest names/logic */
export const ADVENTURE_PATHS_STORAGE_KEY = "sbp-adventure-paths-v8";

/** Shared AI guardrails for every quest (faith-friendly kingdom stories). */
export const BIBLICAL_STORY_GUARDRAILS =
  "Faith-friendly Kingdom of Light story. Themes from Scripture: courage, kindness, stewardship, light, rescue, integrity. " +
  "NO magic spells, NO wands, NO casting, NO witchcraft, NO sorcery, NO wizards, NO potions, NO incantations, NO fairy-godmother magic. " +
  "Wonder comes from beauty of creation, courage, prayerful heart, love, and light — never occult power. " +
  "Talking animals or dragons only as gentle fable creatures (Narnia-adjacent), not as spirits or gods. " +
  "No pronouns — always use the child name. Boy=King, Girl=Queen only. " +
  "STORY MUST BE BELIEVABLE for kids: clear cause-and-effect, no random nonsense (no crowns blowing off pillows). " +
  "Every quest = HELP someone, SAVE someone, or CONQUER a real obstacle. Exciting, fun adventure read-aloud — action, humor, heart. " +
  "No meta lines like 'challenge locked in'. Sound like a great kids book, not a lesson plan. " +
  "Use plain kid language parents understand out loud. No place names that sound like people (not Cliff Road). " +
  "Do NOT over-personify weather/nature as violent villains (avoid rain slapped, wind shoved/laughed). Prefer: rain was pounding, wind was blowing sideways. " +
  "No vague poetry kids cannot picture (avoid courage push louder, shield of will, fear gets last word). Say clear actions and feelings. " +
  "Do NOT put Bible verse text inside story pages. Verse stays metadata for back cover only.";

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

/** Canonical front-cover title: "Queen River and the Broken Bridge Rescue" */
export function buildBookTitle(
  path: Pick<AdventurePath, "bookTitleTemplate" | "title">,
  childName: string,
  gender: StoryGender
): string {
  const fromTemplate = fillPlaceholders(
    path.bookTitleTemplate || `[Role] [Name] and the ${path.title}`,
    childName,
    gender
  )
    .replace(/\s+/g, " ")
    .trim();
  if (/\band\b/i.test(fromTemplate) && fromTemplate.length > 8) return fromTemplate;
  const role = TITLE_ROLE[gender];
  const quest = (path.title || "Kingdom Quest").replace(/^the\s+/i, "").trim();
  return `${role} ${childName} and the ${quest}`;
}

/** Build generator StoryPage[] from an adventure script. */
export function materializeAdventureStory(
  path: AdventurePath,
  childName: string,
  gender: StoryGender,
  childAge: number,
  notes?: string
): { bookTitle: string; pages: StoryPage[] } {
  const bookTitle = buildBookTitle(path, childName, gender);
  // Page 1 text always mirrors the hardcover title exactly
  const coverTitleText = bookTitle.replace(/^(.+?)\s+and\s+/i, "$1\nand ");

  // Keep title/cover script pages so they get UNIQUE art for the hardcover.
  // Interior reading/PDF still strips them via stripRedundantTitlePages (cover already shows name + hero).
  const rawPages = path.pages;

  const pages: StoryPage[] = rawPages.map((p, idx) => {
    const photoSet = p.photoSet ?? null;
    const useSessionPhoto =
      p.useSessionPhoto ?? (photoSet !== null || idx === 0 || p.page === 8);
    const isCoverPage = idx === 0 || p.page === 1;

    return {
      page: idx + 1,
      // Cover page title = full quest name for UI/PDF; interior keeps beat titles
      title: isCoverPage
        ? bookTitle
        : fillPlaceholders(p.title, childName, gender),
      text: isCoverPage
        ? coverTitleText
        : fillPlaceholders(p.text, childName, gender),
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
      "Climb Dragon Mountain, douse the dragon's fire-breath with river water, and open the pass.",
    bibleVerse: "Joshua 1:9",
    bibleVerseText:
      "Be strong and courageous. Do not be afraid… for the Lord your God is with you wherever you go.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE LAND: Dragon Mountain only. ACTION QUEST: climb, rockfall, face dragon, scoop river water in a bucket, throw water into dragon's mouth to put out fire-breath, open the pass. Hero CONQUERS fear with a clear kid action (bucket of water), not vague courage poetry. No killing — dragon yields and becomes guardian after the win. Joshua 1:9.`,
    bookTitleTemplate: "[Role] [Name] and the Dragon Mountain",
    pages: [
      {
        page: 1,
        title: "Dragon Mountain",
        staticScene: "dragon-slayer/title",
        text: `[Role] [Name] and the Dragon Mountain`,
        photoCaption: "Dragon Mountain awaits",
        useSessionPhoto: false,
        imagePromptHint: "title page dragon mountain watercolor no text",
      },
      {
        page: 2,
        title: "Smoke on the Peak",
        staticScene: "dragon-slayer/call",
        text: `Dragon Mountain smoked like a campfire left too long. Sparks drifted in the night sky. The valley pass was blocked. Carts stopped. Sheep stayed home. Everyone was afraid.

"[Role] [Name]," the King said, "someone must climb Dragon Mountain and take back the high pass."

[Role] [Name] felt afraid. Then [Name] chose to be brave anyway.

"I will climb," [Name] said. "I will face the dragon. I will free the mountain."`,
        photoCaption: "The call",
        useSessionPhoto: false,
        imagePromptHint: "smoky dragon mountain valley people looking up watercolor no text",
      },
      {
        page: 3,
        title: "Through the Mountain Gate",
        text: `At the mountain gate, the black stone was warm to the touch. Hot wind hit [Role] [Name]'s cheeks.

[Name] was still a little scared. [Name] stepped through anyway.

On the other side, a cracked path of rock and orange light climbed straight up into danger.`,
        photoCaption: "Entering the mountain",
        useSessionPhoto: false,
        imagePromptHint: "hero stepping through scorched ash gate watercolor no text",
      },
      {
        page: 4,
        title: "Rockfall!",
        text: `Halfway up, the mountain shook. Stones bounced down the slope like loud drums.

"Move!" [Role] [Name] shouted to nobody but [Name]'s own feet.

[Name] dashed under a big rock shelf as boulders smashed the path behind. Dust filled the air. For one breath, the world was only noise.

Then quiet.

[Role] [Name] crawled out, brushed ash from the royal outfit, and smiled a shaky smile. "That was close."

The climb continued — steeper now.`,
        photoCaption: "Escaping the rockfall",
        useSessionPhoto: false,
        imagePromptHint: "hero diving under overhang as rocks fall on mountain path watercolor no text",
      },
      {
        page: 5,
        title: "The Broken Mountain Bridge",
        text: `A rope bridge once crossed a deep drop between the rocks. Now half the boards were gone, swinging over empty air.

Far below: mist and sharp rocks.

[Role] [Name] tested the first rope. It held. Barely.

"One board. One breath. One prayer," [Name] whispered.

Step… slide… catch… step. A hard gust of wind pushed against [Name]. A board cracked and fell spinning into the mist. [Name] froze — then kept going.

At the far side, [Role] [Name] dropped to safe rock and laughed once, wild and free. "I crossed it."`,
        photoCaption: "Crossing the broken bridge",
        useSessionPhoto: false,
        imagePromptHint: "hero crossing broken rope bridge over mountain ravine watercolor no text",
      },
      {
        page: 6,
        title: "Cave of Echoes",
        text: `The path dove into a black cave. Every footstep roared back twice as loud.

"Too small," the echoes seemed to say.
"Too scared."
"Turn around."

[Role] [Name] stood still in the dark. "I am [Role] [Name]! I am scared — but I am still going!"

The cave went quiet. A thin line of daylight opened ahead.

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

The dragon burst up from a big hole in the mountain — dark scales, bright amber eyes, wind rushing from its wings. Hot air rolled across the ledge. Sparks filled the air.

[Role] [Name] did not hide.

"This mountain is not yours alone!" [Name] shouted. "The people need the pass. I came to take it back!"

The dragon opened its mouth. Fire-breath glowed inside like a furnace.

[Name] looked down the slope. A cold mountain river rushed below. That gave [Name] an idea.`,
        photoCaption: "Dragon encounter",
        useSessionPhoto: false,
        imagePromptHint: "hero facing giant dragon on mountain ledge fire breath river below watercolor no text",
      },
      {
        page: 8,
        title: "The River Bucket",
        text: `[Role] [Name] scrambled down to the river and scooped a heavy wooden bucket full of cold water. Splash. Full to the top.

Back up the rocks [Name] climbed — arms shaking, water sloshing, boots slipping.

The dragon roared and leaned in, ready to breathe fire across the pass.

[Name] ran forward, swung the bucket with both hands, and threw the cold river water straight into the dragon's open mouth!

HISSSS — steam shot up like a teapot. The fire-breath went out. The hot wind stopped.

The dragon blinked. Coughed a tiny puff of smoke. And the pass was open again.`,
        photoCaption: "Dousing the fire-breath",
        useSessionPhoto: false,
        imagePromptHint: "hero throwing bucket of river water into dragon mouth steam rising watercolor no text",
      },
      {
        page: 9,
        title: "The Peak Is Won",
        staticScene: "dragon-slayer/victory",
        text: `With its fire-breath gone, the dragon landed gently on the peak. It folded its big wings… then bowed its great head.

"Thank you," [Role] [Name] said softly. "Now people can travel safely."

[Name] walked to the old bronze bell at the top of Dragon Mountain and rang it once.

CLANG — the sound rolled over the whole land. Down in the valley, people saw the open pass and cheered.

In that moment, [Role] [Name] conquered Dragon Mountain — not with a sword, but with a bucket of river water and a brave heart.`,
        photoCaption: "Victory on the peak",
        useSessionPhoto: false,
        imagePromptHint: "hero ringing bronze bell mountain peak dragon bowing gentle steam watercolor no text",
      },
      {
        page: 10,
        title: "Guardian of the Pass",
        text: `From that day the dragon guarded the pass instead of blocking it. Its wings made shade for travelers. The fire-breath stayed calm — only a gentle warm glow when nights got cold.

Carts rolled again. Children pointed up and cheered: "[Role] [Name]!"

[Name] had put out the dragon's fire-breath, opened the pass, and opened the road home for everyone.`,
        photoCaption: "Dragon guards the pass",
        useSessionPhoto: false,
        imagePromptHint: "dragon guarding open mountain pass carts traveling hero proud watercolor no text",
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
      "Race the storm, cross a washed-out bridge over the river, and bring lost friends home safe.",
    bibleVerse: "Luke 15:4",
    bibleVerseText:
      "What man of you, having a hundred sheep, if he has lost one of them, does not… go after the one that is lost?",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE QUEST LAND: storm valley + flooded river + broken bridge. NOT cliffs (cliffs belong to Sword quest). Clear kid language. ACTION: race against weather, haul rope, cross washed-out bridge over river gorge, rescue friends stuck on far bank. Hero CONQUERS danger to save others. No full kingdom tour. Luke 15:4.`,
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
        text: `Thunder grumbled over the valley. The King stood in the courtyard, cloak soaked, eyes full of worry.

"Friends are stuck on the far side of the river," the King said. "The bridge is breaking. The storm is faster than they are. [Role] [Name] — I need you to go."

[Role] [Name] grabbed a rope, a lantern, and courage.

"I'm going now."`,
        photoCaption: "The urgent call",
        useSessionPhoto: false,
        imagePromptHint: "king in courtyard storm sending hero with rope watercolor no text",
      },
      {
        page: 3,
        title: "Race the Rain",
        text: `The rain was pounding on the trail, and the wind was blowing everything sideways. [Role] [Name] ran anyway — boots splashing, lantern swinging, rope coiled tight.

Lightning flashed white across the sky.

[Name] did not slow down. Someone needed [Name] on the other side of the storm.`,
        photoCaption: "Running through the storm",
        useSessionPhoto: false,
        imagePromptHint: "hero running on muddy trail in rain with lantern watercolor no text",
      },
      {
        page: 4,
        title: "The River Path",
        text: `The trail ran beside the swollen river. Mud sucked at [Role] [Name]'s boots. Brown water rushed past, full of sticks and foam.

[Name] held the lantern high and kept running.

"Hold on!" [Name] called across the water. "I am coming!"

A tiny voice answered from the far bank — scared, but alive.`,
        photoCaption: "Beside the rising river",
        useSessionPhoto: false,
        imagePromptHint: "hero running beside flooded river in storm with lantern watercolor no text",
      },
      {
        page: 5,
        title: "The Bridge Breaks",
        text: `There it was — the old wooden bridge over the river, half-torn, boards missing, one side hanging low over the flood.

Two friends crouched on the far bank. One plank snapped and spun into the brown water.

"Don't move!" [Role] [Name] shouted. "I will bring the rope!"

[Name]'s heart was beating fast. This was the moment to be brave.`,
        photoCaption: "Broken bridge ahead",
        useSessionPhoto: false,
        imagePromptHint: "broken wooden bridge over flooded river friends stranded far bank hero arriving watercolor no text",
      },
      {
        page: 6,
        title: "Rope Across the Gap",
        text: `[Role] [Name] tied the rope to an iron ring, spun it once, and threw.

Miss.

The wind blew the rope off course. [Name] threw again — harder.

Catch! The far friend grabbed it.

"Tie it around the rock!" [Name] called. "Tight!"

When the rope was tight, [Role] [Name] held on and stepped onto the first shaky board.`,
        photoCaption: "Throwing the rescue rope",
        useSessionPhoto: false,
        imagePromptHint: "hero throwing rope across broken river bridge storm watercolor no text",
      },
      {
        page: 7,
        title: "Crossing",
        text: `Step. Slide. Catch. Step.

A board cracked. [Role] [Name] dropped to a knee, held the rope, and breathed through the scare.

"I am [Role] [Name]," [Name] said through clenched teeth. "I do not leave people behind."

Across the gap [Name] went — wet, shaking, and brave — until boots hit the muddy far bank and arms wrapped the waiting friends.`,
        photoCaption: "Crossing the broken bridge",
        useSessionPhoto: false,
        imagePromptHint: "hero crossing damaged wooden bridge over flooded river in rain watercolor no text",
      },
      {
        page: 8,
        title: "Pull to Safety",
        text: `One friend was too tired to walk. [Role] [Name] tied the rope around them and helped each person back across, one at a time, blocking the wind with [Name]'s own body.

When the last friend reached safe ground, the bridge gave a final groan and sagged even lower over the river.

They had made it. Just in time.`,
        photoCaption: "Everyone safe",
        useSessionPhoto: false,
        imagePromptHint: "hero helping friends onto safe riverbank after bridge crossing watercolor no text",
      },
      {
        page: 9,
        title: "Down the Safe Trail",
        text: `On the sheltered trail below, the storm softened to a whisper. [Role] [Name] shared the lantern's warm circle and walked the friends home.

The best win of all: people safe because someone ran to help.`,
        photoCaption: "Walking home",
        useSessionPhoto: false,
        imagePromptHint: "hero leading rescued friends down trail after storm watercolor no text",
      },
      {
        page: 10,
        title: "Home Bells",
        staticScene: "rescue-mission/end",
        text: `Village bells rang when they returned. Hugs. Blankets. Warm bread.

"You crossed the broken bridge," the King said. "You conquered the storm with love."

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
    label: "Sword of the Cliffs",
    title: "Sword of the Cliffs",
    description:
      "Climb the White Cliffs, free the King's sword from the summit stone, and bring it safely home.",
    bibleVerse: "Proverbs 4:23",
    bibleVerseText: "Keep your heart with all vigilance, for from it flow the springs of life.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE LAND: White Cliffs. CLEAR SETUP: the King left his sword stuck in the summit stone (sword-in-the-stone energy). CLEAR CHALLENGE: climb, wind, goats, chimney crack, pull sword free, careful descent. Hero CONQUERS the climb and returns the sword. Kid already wears a crown in photos — quest object is the SWORD, not a crown. No kingdom tour. Proverbs 4:23.`,
    bookTitleTemplate: "[Role] [Name] and the Sword of the Cliffs",
    pages: [
      {
        page: 1,
        title: "Sword of the Cliffs",
        staticScene: "lost-crown/title",
        text: `[Role] [Name]
and the Sword of the Cliffs`,
        photoCaption: "The cliffs await",
        useSessionPhoto: false,
        imagePromptHint: "cover hero looking up white cliffs sword stuck in summit stone watercolor no text",
      },
      {
        page: 2,
        title: "The King's Sword",
        staticScene: "lost-crown/call",
        text: `The King had climbed the White Cliffs at sunrise to watch over the kingdom… and left his sword stuck in the rock at the top.

By afternoon, everyone knew: the royal sword was still up there, flashing in the sun like a silver star.

"I need my sword back," the King told [Role] [Name]. "It is stuck tight in the stone. I need a brave climber who will not give up."

[Name] tied a climbing belt, checked the rope, and grinned up the white wall of rock.

"I will climb. I will bring your sword home."`,
        photoCaption: "Accepting the cliff quest",
        useSessionPhoto: false,
        imagePromptHint: "hero at base of white cliffs looking up at distant sword in stone watercolor no text",
      },
      {
        page: 3,
        title: "Base of the White Cliffs",
        text: `The White Cliffs rose like a tall white wall in the sunlight. Birds circled above. Wind whistled through the cracks.

High above, something silver winked — the King's sword, still waiting in the stone.

[Role] [Name] found the first handhold and pulled up.

"One hold at a time," [Name] said. "Courage is a climb."`,
        photoCaption: "Starting the climb",
        useSessionPhoto: false,
        imagePromptHint: "hero starting climb on tall white cliffs sword glint above watercolor no text",
      },
      {
        page: 4,
        title: "The Wind Pushes Back",
        text: `Halfway up, a strong gust of wind almost knocked [Role] [Name] sideways. [Name]'s foot slipped. Fingers ached on the rock.

For one scary second the whole world was wind and white stone.

[Name] hugged the cliff, heart pounding, and waited it out.

Then [Name] took a breath, smiled a little, and kept climbing.`,
        photoCaption: "Holding on in the wind",
        useSessionPhoto: false,
        imagePromptHint: "hero clinging to cliff face in strong wind watercolor no text",
      },
      {
        page: 5,
        title: "Goats on the Ledge",
        text: `On a wide ledge, three cheeky cliff-goats blocked the path, wildflower crowns tilted on their heads like tiny jokes.

"Excuse me," [Role] [Name] said. "I need this path. The King's sword is up there."

The goats did not move. Of course they didn't.

So [Name] pulled sweet clover from a pouch. While the goats munched and made happy goat noises, [Name] slipped past toward the last narrow crack in the rock — smiling the whole way.`,
        photoCaption: "Outsmarting the goats",
        useSessionPhoto: false,
        imagePromptHint: "hero on cliff ledge with playful goats flower crowns watercolor no text",
      },
      {
        page: 6,
        title: "The Narrow Crack",
        text: `The last stretch was a narrow crack in the rock. [Role] [Name] pressed back and feet to opposite walls and wriggled upward, inch by inch.

Sweat. Dust. Tired arms. Almost… almost…

Then [Name]'s hand found open air and blue sky.`,
        photoCaption: "The hardest climb",
        useSessionPhoto: false,
        imagePromptHint: "hero chimney-climbing up narrow rock crack watercolor no text",
      },
      {
        page: 7,
        title: "Sword in the Stone",
        staticScene: "lost-crown/find",
        text: `There it was — the King's sword — stuck deep in a sunny point of stone, exactly where he had left it.

[Role] [Name] crawled across the top of the cliff, wind roaring, wrapped both hands around the handle, and pulled.

It did not move.

[Name] planted both feet, took a deep breath, and pulled again with everything [Name] had.

SHHING! The sword slid free, bright as morning.

"Got you," [Name] said — then cheered so loud the echo cheered back.`,
        photoCaption: "Sword freed",
        useSessionPhoto: false,
        imagePromptHint: "hero on cliff summit pulling sword from stone watercolor no text",
      },
      {
        page: 8,
        title: "The Careful Way Down",
        text: `Getting down was its own adventure. A sword in hand is only half the win if you don't make it home.

[Role] [Name] strapped the sword safe, used the rope, tested every hold, and kept going even with tired arms.

When boots hit grass at the bottom, [Name] raised the sword high — and the goats bleated from above like they were cheering.`,
        photoCaption: "Safe descent",
        useSessionPhoto: false,
        imagePromptHint: "hero descending cliffs with sword secured watercolor no text",
      },
      {
        page: 9,
        title: "Sword Returned",
        staticScene: "lost-crown/end",
        text: `In the courtyard [Role] [Name] held out the King's sword — dusty, shining, earned.

"You did not quit when the wind hit," the King said, taking it with a proud smile. "You conquered the cliffs."

[Name] stood tall and grinned. It had been hard — and it felt great.

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero returning sword to king in courtyard celebration watercolor no text",
      },
    ],
  },
  {
    id: "forest-guardian",
    option: 4,
    label: "Fire in the Forest",
    title: "Fire in the Living Forest",
    description:
      "Race a forest fire, rescue trapped animals, and lead them to higher ground.",
    bibleVerse: "Genesis 2:15",
    bibleVerseText:
      "The Lord God took the man and put him in the garden of Eden to work it and keep it.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE LAND: Living Forest on fire (age-appropriate — glowing danger, smoke, heat, NOT gore). CLEAR MISSION: SAVE animals trapped by fire and lead them to higher ground / safe ridge. ACTION: smoke path, fallen log trap, scoop/guide animals (fox, deer fawn, birds), clear a safe trail uphill, count every friend safe. Hero is a rescuer/steward. Fire can be stopped/slowed by river or rain at end if needed — focus is animal rescue. No kingdom tour. Genesis 2:15.`,
    bookTitleTemplate: "[Role] [Name] and the Fire in the Living Forest",
    pages: [
      {
        page: 1,
        title: "Fire in the Living Forest",
        staticScene: "forest-guardian/title",
        text: `[Role] [Name]
and the Fire in the Living Forest`,
        photoCaption: "The forest needs help",
        useSessionPhoto: false,
        imagePromptHint: "cover hero facing glowing forest fire smoke animals watercolor no text",
      },
      {
        page: 2,
        title: "Smoke in the Trees",
        staticScene: "forest-guardian/call",
        text: `Orange light flickered between the trees. Smoke rolled low over the roots. Birds cried. A little fox darted toward the castle path — then stopped and looked back into the woods.

"Animals are trapped near the creek bend," the King said. "The fire is blocking the way to the high hill. [Role] [Name] — can you lead them to safety?"

[Role] [Name] tied a cloth over [Name]'s face, grabbed a water gourd, and ran.

"I'm going in. Nobody gets left behind."`,
        photoCaption: "The call",
        useSessionPhoto: false,
        imagePromptHint: "forest edge smoke glow animals scared hero determined watercolor no text",
      },
      {
        page: 3,
        title: "Into the Smoke",
        text: `The heat pressed against [Role] [Name]'s cheeks. Sparks floated up like fireflies. The edges of the path glowed.

A burning branch crashed down. [Name] leapt it. Another spark landed on the trail — [Name] stomped it out and kept running.

This was not a stroll. This was a rescue at full speed.`,
        photoCaption: "Running the fire path",
        useSessionPhoto: false,
        imagePromptHint: "hero running through smoky forest sparks falling branch watercolor no text",
      },
      {
        page: 4,
        title: "Trapped at the Creek",
        text: `At the creek bend, animals were stuck — a fox under a fallen log, a baby deer frozen by the bank, birds flapping in the low brush. Fire had blocked the easy way out.

"I've got you," [Role] [Name] said, voice steady.

[Name] heaved the log just enough for the fox to scramble free, scooped the shaking fawn into both arms, and whistled the birds toward higher ground.`,
        photoCaption: "Freeing trapped animals",
        useSessionPhoto: false,
        imagePromptHint: "hero freeing fox under log holding fawn forest fire glow watercolor no text",
      },
      {
        page: 5,
        title: "The Uphill Trail",
        text: `Higher ground meant the rocky hill above the trees — safe, open, away from the flames.

But the trail was blocked by brush and smoke.

[Role] [Name] cleared a path, poured water on hot spots, and led the animals one by one: fox first, baby deer in [Name]'s arms, birds flapping ahead.

"Stay with me. Almost there."`,
        photoCaption: "Leading them up",
        useSessionPhoto: false,
        imagePromptHint: "hero leading animals up rocky trail away from forest fire watercolor no text",
      },
      {
        page: 6,
        title: "Safe on the High Hill",
        text: `They made it onto the high hill as a cool wind hit their faces.

One by one [Role] [Name] counted: fox… baby deer… birds… even a sleepy owl sitting on [Name]'s shoulder.

Below, the fire hissed where it met the wide creek and could go no farther.

[Name] dropped to the grass, laughing with relief. Every friend was safe.`,
        photoCaption: "Animals safe on the high hill",
        useSessionPhoto: false,
        imagePromptHint: "hero on ridge with rescued forest animals fire below creek watercolor no text",
      },
      {
        page: 7,
        title: "Quiet After the Fire",
        staticScene: "forest-guardian/gift",
        text: `Rain came soft and kind, tapping the ash into the soil. Green leaves still waited deeper in the woods.

The fox flicked its tail like a thank-you flag. The fawn nuzzled [Role] [Name]'s hand.

[Name] walked the hill once more, checking every little animal, making sure the forest friends were safe.`,
        photoCaption: "After the rescue",
        useSessionPhoto: false,
        imagePromptHint: "hero with grateful animals on ridge soft rain after fire watercolor no text",
      },
      {
        page: 8,
        title: "Keeper of the Woods",
        staticScene: "forest-guardian/end",
        text: `When [Role] [Name] returned, the people had watched the hill fill with safe animals.

"You took care of the animals in the woods," the King said. "That was brave and good."

[Name] looked back at the trees and the friends [Name] had carried to higher ground — and felt proud all the way through.

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero returning from forest animal rescue celebration watercolor no text",
      },
    ],
  },
  {
    id: "kindness-quest",
    option: 5,
    label: "Kingdom Race",
    title: "The Kingdom Race",
    description:
      "Race for the kingdom ribbon — then stop to help a fallen friend finish strong.",
    bibleVerse: "Ecclesiastes 4:9-10",
    bibleVerseText:
      "Two are better than one… For if they fall, one will lift up his fellow.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE QUEST: Kingdom Race day. CLEAR CHALLENGE: win-the-race pressure vs help a hurt runner. ACTION: race start, obstacles on course, friend falls/gets hurt, hero slows down, helps them up, they finish together. Real win = finishing with love, not abandoning someone. No vague lantern lore. Ecclesiastes 4:9-10.`,
    bookTitleTemplate: "[Role] [Name] and the Kingdom Race",
    pages: [
      {
        page: 1,
        title: "The Kingdom Race",
        staticScene: "kindness-quest/title",
        text: `[Role] [Name]
and the Kingdom Race`,
        photoCaption: "Race day",
        useSessionPhoto: false,
        imagePromptHint: "cover hero at race start line kingdom banners watercolor no text",
      },
      {
        page: 2,
        title: "Race Day",
        staticScene: "kindness-quest/call",
        text: `Banners snapped over the starting line. The whole kingdom packed the hillsides for the Kingdom Race.

The King raised his hand. "First to the finish wins the royal ribbon," the King said. "Run strong — and watch out for each other. Ready… set…"

[Role] [Name] crouched low, heart thumping like a drum. This was going to be fun.`,
        photoCaption: "At the starting line",
        useSessionPhoto: false,
        imagePromptHint: "hero crouched at starting line crowded kingdom race watercolor no text",
      },
      {
        page: 3,
        title: "Go!",
        text: `"GO!"

Feet pounded on the dirt. Dust rose behind them. [Role] [Name] ran toward the front of the pack, cape flying, eyes on the finish ribbon.

Over the hill. Around the hay bales. Across the shallow creek splash.

[Name] was fast. Maybe fast enough to win.`,
        photoCaption: "Racing hard",
        useSessionPhoto: false,
        imagePromptHint: "hero sprinting in kingdom race dust flying watercolor no text",
      },
      {
        page: 4,
        title: "The Hard Stretch",
        text: `The middle of the course got hard — a steep hill, a wobbly plank bridge, and a turn so sharp runners almost fell.

[Role] [Name] kept going through each hard part.

Crowd noise rolled like thunder. The finish ribbon flashed white in the distance.

Almost there.`,
        photoCaption: "Course obstacles",
        useSessionPhoto: false,
        imagePromptHint: "hero crossing wobbly race bridge steep hill watercolor no text",
      },
      {
        page: 5,
        title: "Someone Falls",
        text: `Then — a cry behind [Role] [Name].

A smaller runner had fallen hard on the turn. Knee scraped. Eyes wet. The other racers ran past without stopping.

[Name] looked at the finish ribbon… then looked back at the kid in the dust.

And [Name] knew what kind of racer to be.`,
        photoCaption: "The fall",
        useSessionPhoto: false,
        imagePromptHint: "hero looking back at fallen child runner on race path watercolor no text",
      },
      {
        page: 6,
        title: "Stop and Help",
        text: `[Role] [Name] stopped so fast dust puffed up like smoke.

"I've got you," [Name] said, kneeling. "Can you stand?"

The fallen runner nodded, a little shaky. [Name] cleaned the scrape with a water splash, offered an arm, and helped them up.

Other racers flew by. The ribbon got farther away.

[Name] did not let go.`,
        photoCaption: "Helping up",
        useSessionPhoto: false,
        imagePromptHint: "hero kneeling helping fallen runner stand watercolor no text",
      },
      {
        page: 7,
        title: "Two Finish Together",
        staticScene: "kindness-quest/gift",
        text: `Side by side they ran the last stretch — slower than first place, stronger than quitting.

"You could have won alone," the friend panted.

"We win differently," [Role] [Name] said.

Together they crossed the finish line. The crowd cheered — not just because they were fast, but because they stopped to help.`,
        photoCaption: "Finish line together",
        useSessionPhoto: false,
        imagePromptHint: "hero and friend crossing finish line together cheering crowd watercolor no text",
      },
      {
        page: 8,
        title: "The Better Ribbon",
        text: `The official first-place runner got a ribbon. Fair was fair.

Then the King walked straight to [Role] [Name] and the friend [Name] had helped.

"Today's greatest win was not coming in first," the King said. "It was not leaving someone behind."`,
        photoCaption: "Honor after the race",
        useSessionPhoto: false,
        imagePromptHint: "king honoring hero and helped friend after race watercolor no text",
      },
      {
        page: 9,
        title: "True Winner",
        staticScene: "kindness-quest/end",
        text: `[Role] [Name] walked home tired, happy, and sure of the lesson:

Winning is good. Helping someone who falls is better.

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero peaceful after kingdom race sunset watercolor no text",
      },
    ],
  },
  {
    id: "light-treasure",
    option: 6,
    label: "Treasure Chest",
    title: "The Treasure Chest",
    description:
      "Follow the map, beat the path’s challenges, open the treasure chest — then share it.",
    bibleVerse: "Matthew 5:14",
    bibleVerseText: "You are the light of the world. A city set on a hill cannot be hidden.",
    aiTheme:
      `${BIBLICAL_STORY_GUARDRAILS} ONE QUEST: find the treasure chest. CLEAR CHALLENGE: map path with real obstacles (vine gap, dark tunnel, locked stone door), open the chest, carry it home, SHARE the treasure. Simple name kids understand. No 'gauntlet' jargon. Hero CONQUERS fear and greed by sharing. Matthew 5:14.`,
    bookTitleTemplate: "[Role] [Name] and the Treasure Chest",
    pages: [
      {
        page: 1,
        title: "The Treasure Chest",
        staticScene: "light-treasure/title",
        text: `[Role] [Name]
and the Treasure Chest`,
        photoCaption: "Map in hand",
        useSessionPhoto: false,
        imagePromptHint: "cover hero with treasure map and wooden chest watercolor no text",
      },
      {
        page: 2,
        title: "The Map",
        staticScene: "light-treasure/call",
        text: `An old map marked one clear prize: a treasure chest hidden beyond the hill cave.

"Find the chest," the King said. "Then share what is inside. Treasure locked away forever helps no one."

[Role] [Name] rolled up the map, eyes bright.

"I will find the treasure chest."`,
        photoCaption: "Accepting the map",
        useSessionPhoto: false,
        imagePromptHint: "hero with old treasure map determined watercolor no text",
      },
      {
        page: 3,
        title: "The Vine Gap",
        text: `First mark on the map: a canyon with vines hanging like ropes.

[Role] [Name] backed up, ran, jumped—

Caught the vine. Swung. Missed the ledge by a toe. Swung again harder and rolled onto safe grass, laughing.

"One challenge down."`,
        photoCaption: "Swinging the vine gap",
        useSessionPhoto: false,
        imagePromptHint: "hero swinging on vine across canyon gap watercolor no text",
      },
      {
        page: 4,
        title: "The Dark Tunnel",
        text: `The tunnel tried to scare [Role] [Name] with drips and echoes and shadows that looked bigger than they were.

[Name] held the lantern high and walked faster. "Nice try. I am still coming."

At the far end of the tunnel, warm daylight hit [Name]'s face.`,
        photoCaption: "Through the tunnel",
        useSessionPhoto: false,
        imagePromptHint: "hero in dark tunnel with lantern determined watercolor no text",
      },
      {
        page: 5,
        title: "The Locked Stone Door",
        text: `A heavy stone door blocked the chest chamber. Three carved symbols. One loose stone. One rope pull.

[Role] [Name] matched the map marks, pushed the loose stone, pulled the rope — CLUNK.

The door slid open. [Name] pumped a fist. "Yes!"`,
        photoCaption: "Opening the door",
        useSessionPhoto: false,
        imagePromptHint: "hero opening carved stone door to treasure room watercolor no text",
      },
      {
        page: 6,
        title: "Open the Chest",
        staticScene: "light-treasure/find",
        text: `There it was — a real wooden treasure chest with metal bands, sitting on a flat rock.

[Role] [Name] sprinted the last steps, hands on the lid, and pushed.

Gold coins. Bright gems. Warm light spilling like sunrise.

"[Name] found the treasure chest!" [Name] whooped — then quieter: "Now I share it."`,
        photoCaption: "Treasure found",
        useSessionPhoto: false,
        imagePromptHint: "hero opening wooden treasure chest gold light watercolor no text",
      },
      {
        page: 7,
        title: "Carry It Home",
        text: `The path home was still hard, but [Role] [Name] knew every step now. Chest strapped tight. Lantern bright.

Obstacles that once felt impossible became a road [Name] had already conquered.`,
        photoCaption: "Leaving with the chest",
        useSessionPhoto: false,
        imagePromptHint: "hero carrying treasure chest out of cave watercolor no text",
      },
      {
        page: 8,
        title: "Treasure for Everyone",
        staticScene: "light-treasure/end",
        text: `In the square [Role] [Name] opened the treasure chest for the whole kingdom — coins for repairs, gems for the village light, joy for every open hand.

"You found the chest," the King said. "You beat the hard path. And you shared what you found."

The End.`,
        photoCaption: "The end",
        useSessionPhoto: false,
        imagePromptHint: "hero sharing treasure chest with village celebration watercolor no text",
      },
    ],
  },
];;
