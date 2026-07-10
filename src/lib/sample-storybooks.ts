/**
 * Sample 8-page heirloom storybook content for the business-plan preview.
 * Exact Princess / Prince “Kingdom Quest” stories with session photo spots.
 */

export type StoryPhotoSet =
  | "Castle Throne Room"
  | "Royal Forest"
  | "Royal Garden"
  | "Courage Quest";

export type StoryPage = {
  page: number;
  title: string;
  /** Full story text for this page */
  text: string;
  /** Caption under the photo placeholder (e.g. “Photo from Royal Forest”) */
  photoCaption: string;
  /** When set, show that kingdom set image as a visual example */
  photoSet?: StoryPhotoSet;
};

export type StorybookVersion = {
  id: "princess" | "prince";
  tabLabel: string;
  shortLabel: string;
  bookTitle: string;
  childLabel: string;
  pages: StoryPage[];
};

export const SAMPLE_STORYBOOKS: StorybookVersion[] = [
  {
    id: "princess",
    tabLabel: "For Girls – Princess Version",
    shortLabel: "Princess",
    bookTitle: "Princess [Child’s Name] and the Kingdom Quest",
    childLabel: "Princess [Child’s Name]",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "Princess [Child’s Name]\nand the Kingdom Quest",
        photoCaption: "Beautiful portrait of the child in a crown or royal attire",
      },
      {
        page: 2,
        title: "The Call",
        text: "In the beautiful Kingdom of Light, there lived a brave and kind princess named [Child’s Name].\n\nOne day, the King called upon her:\n\n“[Child’s Name], the kingdom needs your courage. Will you go on a quest to bring hope and light to our lands?”",
        photoCaption: "Child looking confident or receiving a scroll/crown",
      },
      {
        page: 3,
        title: "Castle Throne Room",
        text: "First, Princess [Child’s Name] entered the majestic Castle Throne Room.\n\nShe sat upon the golden throne and felt the weight and honor of royalty.\n\n“I am brave,” she whispered. “I am loved. I am a daughter of the King.”",
        photoCaption: "Photo from Castle Throne Room",
        photoSet: "Castle Throne Room",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "Next, she walked into the peaceful Royal Forest.\n\nAncient trees stood tall, and soft lantern light glowed between the branches.\n\nShe felt wonder instead of fear and discovered that even in quiet places, she could be strong.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "Then she entered the beautiful Royal Garden, where flowers bloomed in every color.\n\nHere she learned to bloom too — to grow in kindness, courage, and beauty.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
      },
      {
        page: 6,
        title: "Courage Quest",
        text: "Finally, Princess [Child’s Name] faced the Courage Quest.\n\nWith knightly armor and a brave heart, she stood tall and faced her fears.\n\nShe discovered that true courage comes from knowing who you are.",
        photoCaption: "Photo from Courage Quest",
        photoSet: "Courage Quest",
      },
      {
        page: 7,
        title: "The Return",
        text: "When her quest was complete, Princess [Child’s Name] returned to the castle.\n\nThe whole kingdom celebrated her bravery.\n\nShe realized she had been royalty all along — not because of a crown, but because of the light inside her.",
        photoCaption: "Child looking proud or with a big smile",
      },
      {
        page: 8,
        title: "The End",
        text: "And so, Princess [Child’s Name] lived bravely ever after,\nknowing she is strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final beautiful portrait of the child",
      },
    ],
  },
  {
    id: "prince",
    tabLabel: "For Boys – Prince Version",
    shortLabel: "Prince",
    bookTitle: "Prince [Child’s Name] and the Kingdom Quest",
    childLabel: "Prince [Child’s Name]",
    pages: [
      {
        page: 1,
        title: "Title Page",
        text: "Prince [Child’s Name]\nand the Kingdom Quest",
        photoCaption: "Child in crown or royal attire",
      },
      {
        page: 2,
        title: "The Call",
        text: "In the Kingdom of Light, there lived a brave young prince named [Child’s Name].\n\nOne day the King said to him:\n\n“[Child’s Name], the kingdom needs your courage. Will you go on a quest to bring hope and strength to our lands?”",
        photoCaption: "Child looking ready for adventure",
      },
      {
        page: 3,
        title: "Castle Throne Room",
        text: "First, Prince [Child’s Name] entered the majestic Castle Throne Room.\n\nHe sat on the golden throne and felt the responsibility and honor of royalty.\n\n“I am brave,” he said. “I am strong. I am a son of the King.”",
        photoCaption: "Photo from Castle Throne Room",
        photoSet: "Castle Throne Room",
      },
      {
        page: 4,
        title: "Royal Forest",
        text: "Next he journeyed into the peaceful Royal Forest.\n\nAncient trees and soft lantern light surrounded him.\n\nHe learned that even in quiet places, true strength can be found.",
        photoCaption: "Photo from Royal Forest",
        photoSet: "Royal Forest",
      },
      {
        page: 5,
        title: "Royal Garden",
        text: "Then he walked through the lush Royal Garden, where beauty grew all around.\n\nHe discovered that strength also includes gentleness and care for others.",
        photoCaption: "Photo from Royal Garden",
        photoSet: "Royal Garden",
      },
      {
        page: 6,
        title: "Courage Quest",
        text: "Finally, Prince [Child’s Name] entered the Courage Quest.\n\nWith knightly spirit and a brave heart, he stood tall and faced challenges with courage.",
        photoCaption: "Photo from Courage Quest",
        photoSet: "Courage Quest",
      },
      {
        page: 7,
        title: "The Return",
        text: "When the quest was complete, Prince [Child’s Name] returned home.\n\nThe kingdom celebrated his bravery and kindness.\n\nHe understood that being a prince wasn’t just about a crown — it was about the courage and light he carried inside.",
        photoCaption: "Child looking proud/strong",
      },
      {
        page: 8,
        title: "The End",
        text: "And so Prince [Child’s Name] lived bravely ever after,\nknowing he is strong, kind, and deeply loved.\n\nThe End.",
        photoCaption: "Final portrait of the child",
      },
    ],
  },
];
