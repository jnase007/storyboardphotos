# Animated Kingdom Movie — Production Plan

## Product
1. Upload kid face photo
2. Pick 1 of 6 adventures
3. Generate coloring-book style pages with kid as hero
4. Narrate with ElevenLabs (personalized name)
5. Animate pages (Higgsfield/Seedance)
6. Stitch mini-movie + deliver on storybookphotos.com

## Art style (book + video)
- Coloring book: bold black outlines, cream paper, mostly line art
- Kid face likeness simplified into cute line-art character
- No heavy watercolor, no photorealism, no on-screen text in frames

## Video structure (per book)
| Beat | Duration | Visual | Audio |
|---|---|---|---|
| Open title | 3s | Coloring-book title page + kid hero | Soft music bed + "Once upon a time..." |
| Pages 2–N | 6–8s each | Animate that page still | ElevenLabs page narration |
| Close | 4s | Final page + logo | "The end — [Name], you are loved." |

**Target length**
- Teaser: 15–30s (3–5 hero pages)
- Full movie: 60–90s (all story pages)

## Seedance motion prompt (every page)
```
Children's coloring book illustration coming to life, bold black outlines stay sharp,
gentle 2D motion, soft parallax, cape/hair/leaves move lightly, warm magical sparkles,
slow camera push-in, cream paper texture preserved, no text, no watermark, no morphing face
```

## ElevenLabs narration plan
- One brand storyteller voice for all 6 adventures
- Generate AFTER name/gender fill so [Name]/[Role] are real words
- Pace: slow kids-book read, ~130 wpm
- Optional: page-by-page MP3s for easier sync

## Personalization tokens
- [Name] → child name
- [Role] → Prince / Princess / Royal Hero
- pronouns from gender

---

## The 6 adventure video scripts
Use page `text` as narration. Visual = coloring-book page with kid face.

### Slay the Dragon (`dragon-slayer`)
**Book title template:** [Role] [Name] and The Dragon Quest
**Pitch:** Face the great dragon with courage - and discover that bravery can turn a foe into a friend.

| Page | Scene title | Narration (after name fill) | Visual shot |
|---|---|---|---|
| 1 | The Dragon Quest | [Role] [Name] and the Dragon Quest | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 2 | The Kingdom of Light | Welcome to the Kingdom of Light — a magical realm of enchanted forests, royal gardens, and ancient castles. Every path leads to adventure. Every adventure begins with a brave heart. Your kingdom awaits, [Role] [Name]. | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 3 | The Call | In the Kingdom of Light, a golden morning turned to shadow when word arrived: a great dragon had settled in the hills beyond the valley, and the people trembled with fear. The King himself walked slowly to the throne ... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 4 | The Royal Throne | The Throne Room was the most magnificent place [Role] [Name] had ever seen. Banners of crimson and gold hung from the vaulted ceiling, and every stone in the walls had been polished smooth by generations of royal hand... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 5 | A Royal Promise | [Role] [Name] rose from the golden throne and walked to the great balcony that overlooked the kingdom. Far below, the people had gathered — farmers and bakers, children and elders — all of them looking upward with hop... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 6 | Into the Royal Forest | The Royal Forest was ancient and alive, full of the kind of quiet that feels inhabited — as if the trees themselves were listening. [Role] [Name] walked along the lantern-lit path, each step soft on the mossy ground. ... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 7 | Face to Face | The dragon emerged from behind a curtain of morning mist — enormous and ancient, with scales the color of storm clouds and eyes like amber lanterns burning in the dark. For a long moment, neither of them moved. [Role]... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 8 | The Royal Garden | The Royal Garden was the most beautiful place in all the kingdom — a living tapestry of color and fragrance that seemed to exist outside of time. [Role] [Name] walked slowly through the garden paths, letting the peace... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 9 | The Courage Quest | The Courage Quest was the final challenge — a place of great and ancient power, where the kingdom's story had been written and rewritten across centuries. [Role] [Name] arrived at the summit as the sun was beginning i... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 10 | The Kingdom Rejoices | When [Role] [Name] returned home, the dragon flew peacefully above the castle towers — not as a threat, but as a guardian. Its great wings caught the evening light, turning it into something that looked almost like a ... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 11 | Always a Hero | That night, after the celebrations had faded and the kingdom had grown quiet, [Role] [Name] sat by the window and looked out at the stars. The dragon was there — curled around the highest tower like a great, gentle gu... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |

**ElevenLabs paste block (template)**
```
Adventure: Slay the Dragon
Child: [Name]  Role: [Role]

--- Page 1: The Dragon Quest ---
[Role] [Name] and the Dragon Quest

--- Page 2: The Kingdom of Light ---
Welcome to the Kingdom of Light — a magical realm of enchanted forests, royal gardens, and ancient castles.

Every path leads to adventure. Every adventure begins with a brave heart.

Your kingdom awaits, [Role] [Name].

--- Page 3: The Call ---
In the Kingdom of Light, a golden morning turned to shadow when word arrived: a great dragon had settled in the hills beyond the valley, and the people trembled with fear.

The King himself walked slowly to the throne room window and gazed out at the distant smoke curling above the mountains. He had heard of one person brave enough — one whose heart was made not just of courage, but of kindness.

He turned and called out the name that made the whole kingdom hold its breath.

"[Name]," the King said softly, "the dragon does not need to be defeated. It needs to be understood. Will you go? Will you bring peace back to our land?"

[Role] [Name] looked out at the distant mountains, felt afraid — just a little — and then felt something stronger rising in [her/his/their] chest: a deep and steady courage, like a flame that cannot be blown out.

[She/He/They] stood tall and answered with one quiet word: "Yes."

--- Page 4: The Royal Throne ---
The Throne Room was the most magnificent place [Role] [Name] had ever seen. Banners of crimson and gold hung from the vaulted ceiling, and every stone in the walls had been polished smooth by generations of royal hands.

In the center of the room, upon a platform of pure white marble, stood the throne — carved from the wood of an ancient oak, inlaid with gold, and draped in velvet the color of midnight sky.

[Role] [Name] walked toward it slowly, footsteps echoing in the sacred silence of the hall. [She/He/They] sat down gently, as one sits on something holy.

Because it was.

This was where every great leader of the kingdom had sat before [her/him/them]. This was where decisions were made that changed lives. This was where courage lived — not in swords or armies, but in the quiet, steady commitment to do what was right.

[Role] [Name] straightened [her/his/their] back, lifted [her/his/their] chin, and whispered the words that every ruler must one day learn to believe: "I am ready."

--- Page 5: A Royal Promise ---
[Role] [Name] rose from the golden throne and walked to the great balcony that overlooked the kingdom. Far below, the people had gathered — farmers and bakers, children and elders — all of them looking upward with hope in their eyes.

A hush fell over the crowd.

[Role] [Name] placed one hand over [her/his/their] heart and spoke in a voice clear and calm enough to carry to the very edges of the kingdom: "I will face the dragon. Not with anger — but with understanding. Not with a desire to win — but with a desire to make peace. I give you my word."

For a long moment, there was silence. And then — the cheering began. It rolled across the courtyard like thunder, warm and full and generous, the sound of a people who believed in their [role] with every fiber of their being.

[Role] [Name] smiled. It was time.

--- Page 6: Into the Royal Forest ---
The Royal Forest was ancient and alive, full of the kind of quiet that feels inhabited — as if the trees themselves were listening.

[Role] [Name] walked along the lantern-lit path, each step soft on the mossy ground. The light from the lanterns filtered through the leaves in golden patches, and somewhere high above, birds called to one another in the canopy.

At the base of an enormous oak tree, a small woodland creature sat watching [her/him/them] with bright, kind eyes.

"You have come far," it said. "And you have a good heart. But hearts alone do not win battles. You must learn one more thing before you face the dragon."

[Role] [Name] sat down on a nearby stone. "What must I learn?"

The creature was quiet for a moment, then said: "That the bravest thing you can do is to see someone — truly see them — even when they are frightening. Especially then."

[Role] [Name] sat with those words until they settled deep inside [her/him/them], like seeds finding soil.

--- Page 7: Face to Face ---
The dragon emerged from behind a curtain of morning mist — enormous and ancient, with scales the color of storm clouds and eyes like amber lanterns burning in the dark.

For a long moment, neither of them moved.

[Role] [Name] felt [her/his/their] heart beating fast. But [she/he/they] did not run. Instead, [she/he/they] took one slow step forward. Then another. Until [she/he/they] stood close enough to feel the warmth radiating from the dragon's great chest.

"I'm not here to fight you," [she/he/they] said, voice steady and clear. "I'm here because I believe you are more than what they say you are."

The dragon lowered its head. Its breath came out in slow plumes of smoke. And then — very softly — it spoke.

"I just want to belong somewhere. I just want a home."

[Role] [Name] felt something break open inside [her/him/them] — not pain, but tenderness. The deep and aching tenderness of recognizing another soul who is lonely.

"Then you have already found one," [she/he/they] said. "I promise."

--- Page 8: The Royal Garden ---
The Royal Garden was the most beautiful place in all the kingdom — a living tapestry of color and fragrance that seemed to exist outside of time.

[Role] [Name] walked slowly through the garden paths, letting the peace of the place settle over [her/him/them] like a warm blanket. Roses climbed the stone walls. Butterflies drifted from flower to flower. The air smelled of honey and earth and something sweeter that had no name.

In the very center of the garden grew a flower unlike any other — a single blossom that glowed softly, as if it had captured a piece of the sun inside itself.

[Role] [Name] knew immediately what it was: the gift that would seal the promise. The thing that would turn a former enemy into a lifelong friend.

[She/He/They] reached down gently, cupped the flower in both hands, and lifted it carefully. It pulsed once — warm and steady — like a heartbeat.

"Thank you," [she/he/they] whispered to the garden. And [she/he/they] could have sworn the flowers nodded back.

--- Page 9: The Courage Quest ---
The Courage Quest was the final challenge — a place of great and ancient power, where the kingdom's story had been written and rewritten across centuries.

[Role] [Name] arrived at the summit as the sun was beginning its slow descent toward the horizon. The light was golden and warm, painting everything it touched in shades of amber and rose.

[She/He/They] stood still for a moment and breathed it all in: the smell of stone and sky, the distant sound of the kingdom below, the weight of the glowing blossom still cradled in [her/his/their] hands.

This was it. This was the moment.

[Role] [Name] was not the same person who had answered the King's call that morning. [She/He/They] had walked through lantern-lit forests and sat upon ancient thrones. [She/He/They] had looked into the eyes of something frightening and chosen love over fear.

And now [she/he/they] was ready — not because [she/he/they] had no fear left, but because [she/he/they] had learned that courage was never the absence of fear. Courage was the decision that something — and someone — else mattered more.

--- Page 10: The Kingdom Rejoices ---
When [Role] [Name] returned home, the dragon flew peacefully above the castle towers — not as a threat, but as a guardian. Its great wings caught the evening light, turning it into something that looked almost like a sunset made of scales.

The people of the kingdom had gathered in the courtyard. When they saw [Role] [Name] walk through the gates — and saw the dragon land gently on the castle wall above — the cheering that rose up was unlike anything any of them had ever heard before.

The King stepped forward and placed his hands on [Role] [Name]'s shoulders.

"You did not just save the kingdom," he said, his voice full and quiet at the same time. "You showed us what it means to be truly brave. You showed us that the greatest strength is not force — it is love."

[Role] [Name] looked out at the faces of the people — all those faces alight with joy and wonder and relief — and felt something complete settle into place deep in [her/his/their] chest.

This was what [she/he/they] had been made for. Not glory. Not power. But this: the quiet, impossible, perfect miracle of bringing people home to one another.

--- Page 11: Always a Hero ---
That night, after the celebrations had faded and the kingdom had grown quiet, [Role] [Name] sat by the window and looked out at the stars.

The dragon was there — curled around the highest tower like a great, gentle guardian — its breath rising slowly in the cool night air. Every now and then, a small flame flickered at its nostrils, and for a moment the darkness glowed gold.

[Role] [Name] thought about the journey. About the fear and the courage. About the loneliness in the dragon's eyes and the warmth of the moment it had been seen — truly seen — for the first time.

About how a single act of bravery had not just saved a kingdom, but had changed two hearts forever.

Somewhere in the streets below, a child looked up at the stars and spoke a name in a wondering whisper. [Role] [Name] heard it carried on the wind, and smiled.

Because that is what heroes do. Not because they are fearless. Not because they are perfect. But because when the moment comes — when the world needs someone to step forward and choose love — they say yes.

Always, they say yes.

```

### Rescue Mission (`rescue-mission`)
**Book title template:** [Role] [Name] and The Rescue Mission
**Pitch:** Someone needs help! Race through the kingdom to rescue friends and bring them safely home.

| Page | Scene title | Narration (after name fill) | Visual shot |
|---|---|---|---|
| 1 | Title Page | A messenger raced into the Kingdom of Light with urgent news - friends from the valley were missing, and night was falling fast.\n\nThe King turned to [Role] [Name]:\n\n"[Name], will you lead the rescue? The kingdom t... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 3 | Castle Throne Room | In the Castle Throne Room, [Role] [Name] received a royal map and a lantern of hope.\n\n[She/He/They] promised the people: "No one in our kingdom is left behind."\n\nThen [she/he/they] set out, heart steady and eyes b... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 4 | Royal Forest | Through the Royal Forest, [Name] followed soft footprints and distant calls for help.\n\nLantern light guided [her/him/them] between the trees until [she/he/they] found the first friend - cold, scared, but safe.\n\n"Y... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 5 | Royal Garden | The final rescue waited at the Courage Quest - a bridge too high for little feet, and a friend too frightened to cross.\n\n[Role] [Name] stood beside them and whispered, "We go together."\n\nStep by step, hand in hand... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 6 | Courage Quest | The final rescue waited at the Courage Quest - a bridge too high for little feet, and a friend too frightened to cross.\n\n[Role] [Name] stood beside them and whispered, "We go together."\n\nStep by step, hand in hand... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |

**ElevenLabs paste block (template)**
```
Adventure: Rescue Mission
Child: [Name]  Role: [Role]

--- Page 1: Title Page ---
A messenger raced into the Kingdom of Light with urgent news - friends from the valley were missing, and night was falling fast.\n\nThe King turned to [Role] [Name]:\n\n"[Name], will you lead the rescue? The kingdom trusts your brave and caring heart."\n\nWithout hesitation, [she/he/they] answered, "I will find them."

--- Page 3: Castle Throne Room ---
In the Castle Throne Room, [Role] [Name] received a royal map and a lantern of hope.\n\n[She/He/They] promised the people: "No one in our kingdom is left behind."\n\nThen [she/he/they] set out, heart steady and eyes bright.

--- Page 4: Royal Forest ---
Through the Royal Forest, [Name] followed soft footprints and distant calls for help.\n\nLantern light guided [her/him/them] between the trees until [she/he/they] found the first friend - cold, scared, but safe.\n\n"You're not alone anymore," [Role] [Name] said gently.

--- Page 5: Royal Garden ---
The final rescue waited at the Courage Quest - a bridge too high for little feet, and a friend too frightened to cross.\n\n[Role] [Name] stood beside them and whispered, "We go together."\n\nStep by step, hand in hand, they crossed. Everyone was safe.

--- Page 6: Courage Quest ---
The final rescue waited at the Courage Quest - a bridge too high for little feet, and a friend too frightened to cross.\n\n[Role] [Name] stood beside them and whispered, "We go together."\n\nStep by step, hand in hand, they crossed. Everyone was safe.

```

### Find the Crown (`lost-crown`)
**Book title template:** [Role] [Name] and The Lost Crown
**Pitch:** The royal crown is missing! Follow clues across the kingdom to bring it home.

| Page | Scene title | Narration (after name fill) | Visual shot |
|---|---|---|---|
| 1 | Title Page | Morning bells rang strangely in the Kingdom of Light - the royal crown was gone from its velvet pillow!\n\nThe King looked to [Role] [Name]:\n\n"You notice what others miss. Will you find our crown and restore the kin... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 3 | Castle Throne Room | In the Castle Throne Room, [Role] [Name] searched carefully.\n\nBeneath a banner, [she/he/they] found the first clue: a golden thread leading toward the forest.\n\n"Every clue brings us closer," [she/he/they] said wit... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 5 | Royal Garden | At the Courage Quest, [Role] [Name] found the crown resting on a stone of light.\n\nA soft voice asked, "Who seeks the crown - for glory, or for the people?"\n\n"For the people," [Name] answered.\n\nThe crown shone, a... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 6 | Courage Quest | At the Courage Quest, [Role] [Name] found the crown resting on a stone of light.\n\nA soft voice asked, "Who seeks the crown - for glory, or for the people?"\n\n"For the people," [Name] answered.\n\nThe crown shone, a... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |

**ElevenLabs paste block (template)**
```
Adventure: Find the Crown
Child: [Name]  Role: [Role]

--- Page 1: Title Page ---
Morning bells rang strangely in the Kingdom of Light - the royal crown was gone from its velvet pillow!\n\nThe King looked to [Role] [Name]:\n\n"You notice what others miss. Will you find our crown and restore the kingdom's light?"\n\n[Name] nodded. A mystery awaited.

--- Page 3: Castle Throne Room ---
In the Castle Throne Room, [Role] [Name] searched carefully.\n\nBeneath a banner, [she/he/they] found the first clue: a golden thread leading toward the forest.\n\n"Every clue brings us closer," [she/he/they] said with a spark of hope.

--- Page 5: Royal Garden ---
At the Courage Quest, [Role] [Name] found the crown resting on a stone of light.\n\nA soft voice asked, "Who seeks the crown - for glory, or for the people?"\n\n"For the people," [Name] answered.\n\nThe crown shone, and [she/he/they] lifted it with care.

--- Page 6: Courage Quest ---
At the Courage Quest, [Role] [Name] found the crown resting on a stone of light.\n\nA soft voice asked, "Who seeks the crown - for glory, or for the people?"\n\n"For the people," [Name] answered.\n\nThe crown shone, and [she/he/they] lifted it with care.

```

### Forest Guardian (`forest-guardian`)
**Book title template:** [Role] [Name] and The Forest Guardian
**Pitch:** The enchanted forest needs a protector. Defend the creatures and restore the magic.

| Page | Scene title | Narration (after name fill) | Visual shot |
|---|---|---|---|
| 1 | Title Page | The lanterns of the Royal Forest flickered weakly - the magic that protected the woodland creatures was fading.\n\nThe King asked [Role] [Name]:\n\n"Will you become the Forest Guardian and bring the light back to the ... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 3 | Castle Throne Room | In the Castle Throne Room, [Role] [Name] received a guardian's cloak woven with leaf-gold thread.\n\n"Protect the small and the quiet," the King said. "That is true power."\n\n[Name] bowed and set out for the woods. | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 6 | Courage Quest | When [Role] [Name] returned, birds sang over the castle walls.\n\nThe King smiled. "You guarded what could not speak for itself. That is the heart of a true [Role]." | Coloring-book still of this scene; kid face as hero; slow life + sparkles |

**ElevenLabs paste block (template)**
```
Adventure: Forest Guardian
Child: [Name]  Role: [Role]

--- Page 1: Title Page ---
The lanterns of the Royal Forest flickered weakly - the magic that protected the woodland creatures was fading.\n\nThe King asked [Role] [Name]:\n\n"Will you become the Forest Guardian and bring the light back to the trees?"\n\n[She/He/They] felt the call of the wild and whispered, "Yes."

--- Page 3: Castle Throne Room ---
In the Castle Throne Room, [Role] [Name] received a guardian's cloak woven with leaf-gold thread.\n\n"Protect the small and the quiet," the King said. "That is true power."\n\n[Name] bowed and set out for the woods.

--- Page 6: Courage Quest ---
When [Role] [Name] returned, birds sang over the castle walls.\n\nThe King smiled. "You guarded what could not speak for itself. That is the heart of a true [Role]."

```

### Kindness Quest (`kindness-quest`)
**Book title template:** [Role] [Name] and The Kindness Quest
**Pitch:** A lonely corner of the kingdom needs warmth. Heal hearts with courage and kindness.

| Page | Scene title | Narration (after name fill) | Visual shot |
|---|---|---|---|
| 1 | Title Page | Not every quest needs a sword. In the Kingdom of Light, a quiet sadness had settled over one village - people felt unseen and alone.\n\nThe King asked [Role] [Name]:\n\n"Will you carry kindness like a lantern and remi... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 3 | Castle Throne Room | From the Castle Throne Room, [Role] [Name] gathered notes of encouragement written in gold ink.\n\n"Words can be as brave as armor," [she/he/they] said, and set out to share them. | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 6 | Courage Quest | When [Role] [Name] returned, the village glowed with new friendships.\n\nThe King said, "You healed what swords cannot. That is royal magic." | Coloring-book still of this scene; kid face as hero; slow life + sparkles |

**ElevenLabs paste block (template)**
```
Adventure: Kindness Quest
Child: [Name]  Role: [Role]

--- Page 1: Title Page ---
Not every quest needs a sword. In the Kingdom of Light, a quiet sadness had settled over one village - people felt unseen and alone.\n\nThe King asked [Role] [Name]:\n\n"Will you carry kindness like a lantern and remind everyone they belong?"\n\n[Name]'s answer was soft and sure: "I will."

--- Page 3: Castle Throne Room ---
From the Castle Throne Room, [Role] [Name] gathered notes of encouragement written in gold ink.\n\n"Words can be as brave as armor," [she/he/they] said, and set out to share them.

--- Page 6: Courage Quest ---
When [Role] [Name] returned, the village glowed with new friendships.\n\nThe King said, "You healed what swords cannot. That is royal magic."

```

### Treasure of Light (`light-treasure`)
**Book title template:** [Role] [Name] and The Treasure of Light
**Pitch:** The kingdom's light has been stolen! Recover the treasure and bring the glow home.

| Page | Scene title | Narration (after name fill) | Visual shot |
|---|---|---|---|
| 1 | Title Page | One night, the stars above the Kingdom of Light dimmed - the Treasure of Light had been taken from the tower.\n\nThe King called [Role] [Name]:\n\n"Bring back our light, and remind everyone that hope can be found agai... | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 3 | Castle Throne Room | In the Castle Throne Room, [Role] [Name] learned the treasure was not gold - it was a crystal of shared hope.\n\nWhoever held it must give light away, not keep it.\n\n"Then I will share it," [she/he/they] promised. | Coloring-book still of this scene; kid face as hero; slow life + sparkles |
| 6 | Courage Quest | When [Role] [Name] returned, every window in the kingdom glowed.\n\nThe King placed the crystal where all could see it.\n\n"You brought the light home," he said, "because you were willing to share it." | Coloring-book still of this scene; kid face as hero; slow life + sparkles |

**ElevenLabs paste block (template)**
```
Adventure: Treasure of Light
Child: [Name]  Role: [Role]

--- Page 1: Title Page ---
One night, the stars above the Kingdom of Light dimmed - the Treasure of Light had been taken from the tower.\n\nThe King called [Role] [Name]:\n\n"Bring back our light, and remind everyone that hope can be found again."\n\n[Name] lifted a small empty lantern. "I will fill it."

--- Page 3: Castle Throne Room ---
In the Castle Throne Room, [Role] [Name] learned the treasure was not gold - it was a crystal of shared hope.\n\nWhoever held it must give light away, not keep it.\n\n"Then I will share it," [she/he/they] promised.

--- Page 6: Courage Quest ---
When [Role] [Name] returned, every window in the kingdom glowed.\n\nThe King placed the crystal where all could see it.\n\n"You brought the light home," he said, "because you were willing to share it."

```

---

## Ops (ListedFire-style)
1. Customer uploads face + picks adventure on storybookphotos.com
2. Site generates coloring-book pages (face locked)
3. Fill script with name → ElevenLabs narration
4. Jordan/Higgsfield Seedance each page
5. Stitch clips + narration + light music
6. Upload MP4 to book page / email parent

## Vercel stack
- storybookphotos.com (Next.js)
- Supabase: pages, audio, final MP4
- fal/Higgsfield: images + Seedance
- ElevenLabs: narration
- Stripe later: movie upsell