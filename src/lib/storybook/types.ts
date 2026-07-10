/** Shared types for the internal storybook generator */

export type StoryGender = "girl" | "boy" | "other";

export type StorybookStatus =
  | "draft"
  | "generating"
  | "ready"
  | "approved"
  | "error";

export type KingdomSet =
  | "Throne Room"
  | "Royal Forest"
  | "Royal Garden"
  | "Chastle"
  | null;

export type StoryPage = {
  page: number;
  title: string;
  text: string;
  /** fal / AI illustration URL (or placeholder) */
  imageUrl: string | null;
  /** Which kingdom set this page features */
  photoSet: KingdomSet;
  /** Prompt used for illustration */
  imagePrompt?: string;
  /** Key for pre-approved static scene from STATIC_SCENES map */
  staticScene?: string;
  /** True when this page should prefer a session photo over AI art */
  useSessionPhoto?: boolean;
};

export type StorybookRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  child_name: string;
  child_age: number;
  gender: StoryGender;
  notes: string | null;
  status: StorybookStatus;
  photo_urls: string[];
  pages: StoryPage[];
  pdf_url: string | null;
  error_message: string | null;
};

export const KINGDOM_SETS: Exclude<KingdomSet, null>[] = [
  "Throne Room",
  "Royal Forest",
  "Royal Garden",
  "Chastle",
];

/** Upload slots in the storybook generator (one drop zone per set). */
export const SET_UPLOAD_SLOTS = [
  {
    id: "throne-room",
    name: "Throne Room" as const,
    hint: "Throne / crown portraits from this set",
  },
  {
    id: "royal-forest",
    name: "Royal Forest" as const,
    hint: "Lantern forest shots from this set",
  },
  {
    id: "royal-garden",
    name: "Royal Garden" as const,
    hint: "Garden / bloom shots from this set",
  },
  {
    id: "chastle",
    name: "Chastle" as const,
    hint: "Quest / armor shots from this set",
  },
] as const;

export type SetUploadId = (typeof SET_UPLOAD_SLOTS)[number]["id"];

export type PhotosBySet = Record<SetUploadId, string[]>;

export const ADMIN_ACCESS_CODE = "3121";

/** Max photos staff can drop per kingdom set */
export const MAX_PHOTOS_PER_SET = 3;
