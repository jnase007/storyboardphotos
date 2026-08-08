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
  gender: z.enum(["girl", "boy"]),
  notes: z.string().max(1000).optional().nullable(),
  /** Choose-your-own-adventure path (kiosk option) */
  adventure_path: z.enum(ADVENTURE_PATH_IDS).optional().default("dragon-slayer"),
  /** script = curated path text; ai = LLM rewrite following the path */
  story_mode: z.enum(["script", "ai"]).optional().default("script"),
  /** Optional edited adventure script from Story Scripts admin */
  adventure_script: z
    .object({
      id: z.enum(ADVENTURE_PATH_IDS),
      option: z.coerce.number().int().min(1).max(6).optional(),
      label: z.string().min(1).max(120).optional(),
      title: z.string().min(1).max(160).optional(),
      description: z.string().max(1000).optional(),
      aiTheme: z.string().max(2000).optional(),
      bookTitleTemplate: z.string().max(200).optional(),
      pages: z
        .array(
          z
            .object({
              page: z.coerce.number().int().positive(),
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
                .optional()
                .nullable(),
              useSessionPhoto: z.boolean().optional(),
              imagePromptHint: z.string().optional(),
              staticScene: z.string().optional(),
            })
            .passthrough()
        )
        .min(6)
        .max(24),
    })
    .passthrough()
    .optional(),
  /** Optional set photos — empty arrays allowed (coloring book uses face only) */
  photos_by_set: z
    .object({
      "throne-room": z.array(photoUrlSchema).max(3).optional().default([]),
      "royal-forest": z.array(photoUrlSchema).max(3).optional().default([]),
      "royal-garden": z.array(photoUrlSchema).max(3).optional().default([]),
      "chastle": z.array(photoUrlSchema).max(3).optional().default([]),
    })
    .optional(),
  /** Legacy studio set photos — ignored for page art (coloring book only) */
  photo_urls: z.array(photoUrlSchema).max(12).optional().default([]),
  /** Kid face / profile photo — required for personalized coloring-book hero */
  character_photo: z
    .string()
    .min(1, "Child face photo is required")
    .refine(
      (v) => v.startsWith("http") || v.startsWith("data:image/"),
      "Invalid face photo"
    ),
  /** What to produce after generate */
  package: z
    .enum(["book", "movie", "both"])
    .optional()
    .default("book"),
}).refine((data) => Boolean(data.character_photo),
  { message: "character_photo (kid face) is required", path: ["character_photo"] }
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
