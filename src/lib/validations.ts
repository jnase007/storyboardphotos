import { z } from "zod";

const childSchema = z.object({
  name: z.string().min(1, "Child's name is required"),
  age: z.coerce
    .number()
    .min(1, "Age must be at least 1")
    .max(18, "Age must be 18 or under"),
});

export const bookingSchema = z.object({
  parent_name: z
    .string()
    .min(2, "Parent name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[\d\s\-()+.]+$/, "Please enter a valid phone number"),
  children: z
    .array(childSchema)
    .min(1, "Add at least one child")
    .max(6, "Maximum 6 children on this form"),
  preferred_date: z.string().min(1, "Please select a preferred date"),
  num_people: z.coerce
    .number()
    .min(1, "At least 1 person")
    .max(10, "Maximum 10 people"),
  package_type: z.string().min(1, "Please select a package"),
  /** Combined into special_requests on submit */
  curate_experience: z.string().optional(),
  story_theme: z.string().optional(),
  must_haves: z.string().optional(),
  child_notes: z.string().optional(),
  special_requests: z.string().optional(),
  promo_code: z.string().max(40).optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

/** Payload shape sent to /api/bookings (matches Supabase bookings table) */
export const bookingApiSchema = z.object({
  parent_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  child_name: z.string().min(1),
  child_age: z.coerce.number().min(1).max(18),
  preferred_date: z.string().min(1),
  num_people: z.coerce.number().min(1).max(10),
  package_type: z.string().min(1),
  special_requests: z.string().optional().nullable(),
});

export type BookingApiPayload = z.infer<typeof bookingApiSchema>;

/** Kept for optional /api/ai/generate — not shown on the marketing site */
export const aiGenerateSchema = z.object({
  prompt: z
    .string()
    .min(5, "Describe your royal adventure (at least 5 characters)")
    .max(500, "Prompt must be under 500 characters"),
  style_preset: z.enum([
    "throne-room",
    "royal-forest",
    "royal-garden",
    "chastle",
  ]),
});

export type AIGenerateFormData = z.infer<typeof aiGenerateSchema>;
