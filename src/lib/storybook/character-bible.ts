/**
 * Storybook Photos — IP Character Bible
 *
 * Source of truth for recurring cast across ALL quests.
 * Injected into every page illustration prompt so the dragon, King,
 * friends, animals, etc. do not redesign themselves page-to-page.
 *
 * Hero child face/outfit still come from lockedHeroFace / lockedHeroWardrobe
 * + the customer photo. This bible covers the SHARED kingdom cast.
 */

export type QuestId =
  | "dragon-slayer"
  | "rescue-mission"
  | "lost-crown"
  | "forest-guardian"
  | "kindness-quest"
  | "light-treasure"
  | string;

/** One locked design sheet for a recurring character or creature. */
export type CharacterSheet = {
  id: string;
  name: string;
  /** Short lock line injected into prompts */
  lock: string;
  /** Do / don't bullets compressed into prompt language */
  bans?: string;
};

/**
 * SHARED cast — appears in more than one quest or frames the whole IP.
 * Keep designs simple, kid-readable, watercolor-friendly.
 */
export const SHARED_CAST: Record<string, CharacterSheet> = {
  king: {
    id: "king",
    name: "The King (quest-giver)",
    lock: [
      "LOCKED CAST — THE KING (identical every time he appears, every quest):",
      "kind older man, warm brown eyes, short silver-gray beard and mustache,",
      "friendly face wrinkles, soft gold crown with small red jewel,",
      "royal crimson-red cloak over cream tunic with gold trim,",
      "gentle smile, never scary, never young, never clean-shaven swap.",
    ].join(" "),
    bans: "Do NOT redesign the King as a different age, hair color, crown, or outfit on later pages.",
  },
  dragon: {
    id: "dragon",
    name: "Dragon of Dragon Mountain",
    lock: [
      "LOCKED CAST — THE DRAGON (identical on EVERY page it appears in this book and every Dragon Mountain book):",
      "ONE continuous creature design: large western storybook dragon,",
      "deep emerald-green scales with soft teal belly plates,",
      "two great bat-like wings (same wing shape every page),",
      "warm amber-gold eyes with visible iris (never empty black sockets),",
      "small curved ivory horns, blunt friendly snout (not nightmare teeth),",
      "four sturdy legs, long tapering tail with soft ridge spines,",
      "watercolor children's book dragon — majestic but not evil.",
      "When fire-breath shows: short warm orange flame from mouth only; same dragon body underneath.",
      "After the river-bucket win: same dragon, calmer eyes, gentle steam instead of hard flame.",
    ].join(" "),
    bans:
      "CRITICAL: Do NOT change dragon species, color, horn count, wing type, or face between pages. No red dragon one page and green the next. No morph to serpent, hydra, dinosaur, or cute baby dragon mid-book.",
  },
  friends_rescue: {
    id: "friends_rescue",
    name: "Rescued friends (Broken Bridge)",
    lock: [
      "LOCKED CAST — RESCUED FRIENDS (same two kids every page they appear):",
      "Friend A: small boy, sandy hair, blue vest, brown boots.",
      "Friend B: small girl, dark braids, yellow cardigan, green skirt.",
      "Scared then relieved — never swap into different children mid-story.",
    ].join(" "),
    bans: "Do NOT replace the stranded friends with random different kids on later pages.",
  },
  forest_animals: {
    id: "forest_animals",
    name: "Living Forest animals",
    lock: [
      "LOCKED CAST — FOREST ANIMALS (same little group when rescued):",
      "one red fox with white chest, one spotted fawn, one gray rabbit, one brown squirrel,",
      "soft watercolor fur, big gentle eyes, clearly the SAME animals from page to page.",
    ].join(" "),
    bans: "Do NOT swap fox for wolf, or change the animal lineup every page.",
  },
  race_friend: {
    id: "race_friend",
    name: "Fallen race friend",
    lock: [
      "LOCKED CAST — RACE FRIEND (Kingdom Race):",
      "one child runner about the hero's age, freckles, copper hair in a short ponytail,",
      "simple white race tunic with green sash, scuffed sneakers,",
      "same friend when fallen and when finishing together.",
    ].join(" "),
    bans: "Do NOT change the helped runner into a different child at the finish line.",
  },
  cliff_goats: {
    id: "cliff_goats",
    name: "Cliff goats",
    lock: [
      "LOCKED CAST — CLIFF GOATS (Sword of the Cliffs):",
      "two playful white mountain goats with tiny flower crowns (daisy + clover),",
      "same pair when they reappear.",
    ].join(" "),
  },
  treasure_chest: {
    id: "treasure_chest",
    name: "Treasure chest prop",
    lock: [
      "LOCKED PROP — TREASURE CHEST:",
      "one medium wooden chest, warm oak wood, dark iron straps, small gold latch,",
      "rounded lid — same chest from discovery through village share.",
    ].join(" "),
  },
};

/** Which cast sheets apply to each quest. */
export const QUEST_CAST: Record<string, string[]> = {
  "dragon-slayer": ["king", "dragon"],
  "rescue-mission": ["king", "friends_rescue"],
  "lost-crown": ["king", "cliff_goats"],
  "forest-guardian": ["king", "forest_animals"],
  "kindness-quest": ["king", "race_friend"],
  "light-treasure": ["king", "treasure_chest"],
};

/** Dragon is exclusive to the Dragon Mountain quest. */
export function isDragonQuest(questId?: string | null): boolean {
  const q = (questId || "").toLowerCase();
  return q === "dragon-slayer" || q.includes("dragon");
}

/**
 * Build the cast-lock prompt block for a page.
 * Uses quest id when known.
 * PRODUCT RULE: dragon appears ONLY in dragon-slayer. Never inject dragon into other quests.
 */
export function lockedCastForPage(options: {
  questId?: string | null;
  sceneText?: string | null;
}): string {
  const quest = (options.questId || "").toLowerCase();
  const scene = `${options.sceneText || ""}`.toLowerCase();
  const dragonQuest = isDragonQuest(quest);
  const ids = new Set<string>(QUEST_CAST[quest] || ["king"]);

  // Never let a non-dragon quest pick up the dragon cast sheet
  if (!dragonQuest) ids.delete("dragon");

  // Scene-based safety nets (quest-scoped only)
  if (dragonQuest && /\bdragon\b/.test(scene)) ids.add("dragon");
  if (/\bking\b/.test(scene)) ids.add("king");
  if (quest.includes("forest") && /\b(fox|fawn|rabbit|squirrel|animal)/.test(scene)) {
    ids.add("forest_animals");
  }
  if (/\b(friend|stranded|rescued)/.test(scene) && quest.includes("rescue")) {
    ids.add("friends_rescue");
  }
  if (quest.includes("lost-crown") && /\b(goat)/.test(scene)) ids.add("cliff_goats");
  if (quest.includes("light-treasure") && /\b(chest|treasure)/.test(scene)) {
    ids.add("treasure_chest");
  }
  if (quest.includes("kindness") && /\b(race|runner|finish)/.test(scene)) {
    ids.add("race_friend");
  }

  // Final hard filter: dragon only on dragon quest
  if (!dragonQuest) ids.delete("dragon");

  const parts: string[] = [
    "IP CHARACTER BIBLE (mandatory consistency — do not redesign locked cast):",
  ];

  if (!dragonQuest) {
    parts.push(
      "QUEST CAST RULE: This is NOT the Dragon Mountain story. Do NOT draw any dragon, wyvern, serpent-dragon, or dragon silhouette anywhere in this image — not in the sky, not in the background, not as a statue, not as a toy."
    );
  }

  for (const id of ids) {
    const sheet = SHARED_CAST[id];
    if (!sheet) continue;
    parts.push(sheet.lock);
    if (sheet.bans) parts.push(sheet.bans);
  }

  parts.push(
    "Backgrounds and poses may change. Locked cast must keep the same species, colors, face, outfit, and silhouette every page."
  );

  return parts.join(" ");
}

/** Full bible blurb for admin / docs. */
export function characterBibleSummary(): string {
  return Object.values(SHARED_CAST)
    .map((c) => `• ${c.name} (${c.id})`)
    .join("\n");
}
