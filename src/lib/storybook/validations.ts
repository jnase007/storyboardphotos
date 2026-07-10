import { z } from "zod";
import { ADVENTURE_PATH_IDS } from "./adventure-paths";

const photoUrlSchema = z
  .string()
  .min(1)
  .refine(
    (v) => v.startsWith("http") || v.startsWith("data:image/"),
    "Invalid photo URL"
  );

const setPhotosSchema = z
  .array(photoUrlSchema)
  .min(1, "At least one photo required for this set")
  .max(3, "Maximum 3 photos per set");

export const createStorybookSchema = z.object({
  child_name: z.string().min(1, "Child's name is required").max(80),
  child_age: z.coerce.number().int().min(1).max(18),
  gender: z.enum(["girl", "boy", "other"]),
  notes: z.string().max(1000).optional().nullable(),
  /** Choose-your-own-adventure path (kiosk option) */
  adventure_path: z.enum(ADVENTURE_PATH_IDS).optional().default("dragon-slayer"),
  /** script = curated path text; ai = LLM rewrite following the path */
  story_mode: z.enum(["script", "ai"]).optional().default("script"),
  /** Optional edited adventure script from Story Scripts admin */
  adventure_script: z
    .object({
      id: z.enum(ADVENTURE_PATH_IDS),
      option: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(6),
      ]),
      label: z.string().min(1).max(80),
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(500),
      aiTheme: z.string().min(1).max(1000),
      bookTitleTemplate: z.string().min(1).max(160),
      pages: z
        .array(
          z.object({
            page: z.number().int().positive(),
            title: z.string().min(1),
            text: z.string().min(1),
            photoCaption: z.string().optional().default(""),
            photoSet: z
              .enum([
                "Throne Room",
                "Royal Forest",
                "Royal Garden",
                "Chastle",
              ])
              .optional(),
            useSessionPhoto: z.boolean().optional(),
            imagePromptHint: z.string().optional(),
          })
        )
        .min(6)
        .max(12),
    })
    .optional(),
  /** Photos grouped by kingdom set (preferred) */
  photos_by_set: z
    .object({
      "throne-room": setPhotosSchema,
      "royal-forest": setPhotosSchema,
      "royal-garden": setPhotosSchema,
      "chastle": setPhotosSchema,
    })
    .optional(),
  /** Flat list kept for backwards compatibility */
  photo_urls: z.array(photoUrlSchema).min(4).max(12).optional(),
}).refine(
  (data) => Boolean(data.photos_by_set) || Boolean(data.photo_urls?.length),
  { message: "photos_by_set or photo_urls is required" }
);

export const updatePagesSchema = z.object({
  pages: z.array(
    z.object({
      page: z.number().int().positive(),
      title: z.string().min(1),
      text: z.string().min(1),
      imageUrl: z.string().nullable(),
      photoSet: z
        .enum([
          "Throne Room",
          "Royal Forest",
          "Royal Garden",
          "Chastle",
        ])
        .nullable(),
      imagePrompt: z.string().optional(),
      useSessionPhoto: z.boolean().optional(),
    })
  ),
});
