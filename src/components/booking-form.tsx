"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar, Send, CheckCircle2, Sparkles, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PACKAGE_OPTIONS } from "@/lib/constants";
import { bookingSchema, type BookingFormData } from "@/lib/validations";
import { PROMO_CODE } from "@/components/promo-bar";

const VALID_PACKAGES = new Set<string>(PACKAGE_OPTIONS.map((p) => p.value));
const MAX_CHILDREN = 6;

function buildSpecialRequests(
  data: BookingFormData,
  selectedSetLabels?: string[]
): string {
  const setLine =
    selectedSetLabels && selectedSetLabels.length > 0
      ? `Selected studio sets: ${selectedSetLabels.join(", ")}. Throne Room & Chastle coming soon (not selectable yet).`
      : "Studio sets for this booking: Forest Garden (Royal Forest + Royal Garden). Throne Room & Chastle coming soon.";
  const parts: string[] = [setLine];

  if (data.children.length > 1) {
    const extras = data.children
      .slice(1)
      .map((c, i) => `Child ${i + 2}: ${c.name} (age ${c.age})`)
      .join("\n");
    parts.push(`Additional children:\n${extras}`);
  }

  if (data.curate_experience?.trim()) {
    parts.push(`How to curate the experience:\n${data.curate_experience.trim()}`);
  }
  if (data.story_theme?.trim()) {
    parts.push(`Story / theme to build around:\n${data.story_theme.trim()}`);
  }
  if (data.must_haves?.trim()) {
    parts.push(`Things they want included:\n${data.must_haves.trim()}`);
  }
  if (data.child_notes?.trim()) {
    parts.push(`About the child(ren):\n${data.child_notes.trim()}`);
  }
  if (data.promo_code?.trim()) {
    parts.push(`Promo code: ${data.promo_code.trim().toUpperCase()}`);
  }
  if (data.special_requests?.trim()) {
    parts.push(`Other notes:\n${data.special_requests.trim()}`);
  }

  return parts.join("\n\n");
}

type BookingFormProps = {
  /** Human labels for selected open sets (e.g. Royal Forest) */
  selectedSetLabels?: string[];
  selectedQuestId?: string | null;
};

export function BookingForm({
  selectedSetLabels,
  selectedQuestId,
}: BookingFormProps = {}) {
  const searchParams = useSearchParams();
  const packageFromUrl = searchParams.get("package") ?? "";
  const defaultPackage = VALID_PACKAGES.has(packageFromUrl)
    ? packageFromUrl
    : "";
  const promoFromUrl = (searchParams.get("promo") ?? "").trim();
  const defaultPromo = promoFromUrl || PROMO_CODE;

  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      num_people: 2,
      package_type: defaultPackage,
      children: [{ name: "", age: undefined as unknown as number }],
      special_requests: "",
      curate_experience: "",
      story_theme: "",
      must_haves: "",
      child_notes: "",
      promo_code: defaultPromo,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      const primary = data.children[0];
      const notes = buildSpecialRequests(data, selectedSetLabels);
      const withQuest = selectedQuestId
        ? `${notes}\n\nSelected quest: ${selectedQuestId}`
        : notes;
      const payload = {
        parent_name: data.parent_name,
        email: data.email,
        phone: data.phone,
        child_name: primary.name,
        child_age: primary.age,
        preferred_date: data.preferred_date,
        num_people: data.num_people,
        package_type: data.package_type,
        special_requests: withQuest || null,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Booking failed");
      }

      setIsSubmitted(true);
      reset({
        num_people: 2,
        package_type: defaultPackage,
        children: [{ name: "", age: undefined as unknown as number }],
        special_requests: "",
        curate_experience: "",
        story_theme: "",
        must_haves: "",
        child_notes: "",
        promo_code: defaultPromo,
        parent_name: "",
        email: "",
        phone: "",
        preferred_date: "",
      });
      toast.success("Your royal session has been requested!", {
        description: "We'll contact you within 24 hours to confirm.",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit booking. Please try again or call us."
      );
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-6"
      >
        <CheckCircle2 className="h-16 w-16 text-royal-emerald mx-auto mb-4" />
        <h3 className="font-serif text-2xl font-bold text-royal-blue mb-2">
          Your Quest Awaits!
        </h3>
        <p className="text-royal-blue/70 max-w-md mx-auto mb-6">
          Thank you for booking with Storybook Photos. We&apos;ll review your
          answers and reach out within 24 hours to confirm your session and
          begin shaping their story.
        </p>
        <Button variant="outline" onClick={() => setIsSubmitted(false)}>
          Submit Another Booking
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Contact & session details */}
      <div className="space-y-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-royal-blue mb-1">
            Session Details
          </h3>
          <p className="text-sm text-royal-blue/55">
            Tell us who&apos;s coming and when you&apos;d like to visit.
          </p>
          <div
            className="mt-3 rounded-xl px-3.5 py-2.5 text-sm"
            style={{
              background: "rgba(185,138,25,0.08)",
              border: "1px solid rgba(185,138,25,0.25)",
              color: "#0A1628",
            }}
          >
            <span className="font-semibold">Sets included now:</span> Forest
            Garden — Royal Forest & Royal Garden.{" "}
            <span className="text-royal-blue/60">
              Throne Room & Chastle coming soon.
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="parent_name">Parent / Guardian Name</Label>
            <Input
              id="parent_name"
              placeholder="Your full name"
              className="mt-1.5 bg-white border-royal-gold/30"
              {...register("parent_name")}
            />
            {errors.parent_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.parent_name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1.5 bg-white border-royal-gold/30"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(949) 637-2226"
              className="mt-1.5 bg-white border-royal-gold/30"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="preferred_date">Preferred Date</Label>
            <div className="relative mt-1.5">
              <Input
                id="preferred_date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="bg-white border-royal-gold/30"
                {...register("preferred_date")}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-royal-blue/40 pointer-events-none" />
            </div>
            {errors.preferred_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.preferred_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Children — add more with + */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label>Children</Label>
              <p className="text-xs text-royal-blue/50 mt-0.5">
                Add each child&apos;s name and age. Siblings welcome.
              </p>
            </div>
            {fields.length < MAX_CHILDREN && (
              <button
                type="button"
                onClick={() =>
                  append({ name: "", age: undefined as unknown as number })
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-royal-gold/40 bg-white px-3 text-sm font-medium text-royal-blue hover:border-royal-gold hover:bg-royal-gold/10 transition-colors"
              >
                <Plus className="h-4 w-4 text-royal-gold" />
                Add child
              </button>
            )}
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid sm:grid-cols-[1fr_7rem_auto] gap-3 items-end"
            >
              <div>
                <Label htmlFor={`children.${index}.name`}>
                  {index === 0 ? "Child's Name" : `Child ${index + 1} Name`}
                </Label>
                <Input
                  id={`children.${index}.name`}
                  placeholder="Little royal's name"
                  className="mt-1.5 bg-white border-royal-gold/30"
                  {...register(`children.${index}.name`)}
                />
                {errors.children?.[index]?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.children[index]?.name?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`children.${index}.age`}>Age</Label>
                <Input
                  id={`children.${index}.age`}
                  type="number"
                  min={1}
                  max={18}
                  placeholder="Age"
                  className="mt-1.5 bg-white border-royal-gold/30"
                  {...register(`children.${index}.age`)}
                />
                {errors.children?.[index]?.age && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.children[index]?.age?.message}
                  </p>
                )}
              </div>
              <div className="pb-0.5">
                {fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-royal-gold/25 text-royal-blue/50 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Remove child ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="h-10 w-10" aria-hidden="true" />
                )}
              </div>
            </div>
          ))}

          {errors.children && typeof errors.children.message === "string" && (
            <p className="text-red-500 text-sm">{errors.children.message}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="num_people">Number of People</Label>
            <Input
              id="num_people"
              type="number"
              min={1}
              max={10}
              className="mt-1.5 bg-white border-royal-gold/30"
              {...register("num_people")}
            />
            <p className="text-xs text-royal-blue/45 mt-1">
              Total attending (kids + adults)
            </p>
            {errors.num_people && (
              <p className="text-red-500 text-sm mt-1">
                {errors.num_people.message}
              </p>
            )}
          </div>
          <div>
            <Label>Package Interest</Label>
            <Controller
              name="package_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="mt-1.5 bg-white border-royal-gold/30">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGE_OPTIONS.map((pkg) => (
                      <SelectItem key={pkg.value} value={pkg.value}>
                        {pkg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.package_type && (
              <p className="text-red-500 text-sm mt-1">
                {errors.package_type.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Experience curation */}
      <div className="space-y-6 rounded-2xl border border-royal-gold/25 bg-royal-cream/60 p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-royal-gold/20">
            <Sparkles className="h-5 w-5 text-royal-gold" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-royal-blue mb-1">
              Help Us Curate Your Experience
            </h3>
            <p className="text-sm text-royal-blue/60 leading-relaxed">
              Optional — share anything that helps us prepare. We guide the
              adventure; you don&apos;t need to invent it.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="child_notes">
            Anything we should know about your child(ren)?
          </Label>
          <Textarea
            id="child_notes"
            placeholder="Personality, shy or outgoing, favorite interests, sensory needs, allergies..."
            rows={3}
            className="mt-1.5 bg-white border-royal-gold/30"
            {...register("child_notes")}
          />
        </div>

        <div>
          <Label htmlFor="promo_code">Promo code</Label>
          <Input
            id="promo_code"
            placeholder={PROMO_CODE}
            className="mt-1.5 bg-white border-royal-gold/30 uppercase tracking-wide"
            {...register("promo_code")}
          />
          <p className="mt-1.5 text-xs text-royal-blue/50">
            Code {PROMO_CODE} = 15% off. Enter it here if you have a promo.
          </p>
        </div>

        <div>
          <Label htmlFor="special_requests">Other notes (optional)</Label>
          <Textarea
            id="special_requests"
            placeholder="Anything else that would help us prepare..."
            rows={2}
            className="mt-1.5 bg-white border-royal-gold/30"
            {...register("special_requests")}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Sending your royal request..."
        ) : (
          <>
            <Send className="h-4 w-4" />
            Request Your Session
          </>
        )}
      </Button>

      <p className="text-center text-xs text-royal-blue/50 leading-relaxed">
        By submitting, you agree to our{" "}
        <a href="/terms" className="text-royal-gold hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-royal-gold hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
