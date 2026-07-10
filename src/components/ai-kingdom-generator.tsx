"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Loader2, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AI_STYLE_PRESETS } from "@/lib/constants";
import {
  aiGenerateSchema,
  type AIGenerateFormData,
} from "@/lib/validations";
import { cn } from "@/lib/utils";

interface AIKingdomGeneratorProps {
  variant?: "hero" | "compact";
  className?: string;
}

export function AIKingdomGenerator({
  variant = "hero",
  className,
}: AIKingdomGeneratorProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AIGenerateFormData>({
    resolver: zodResolver(aiGenerateSchema),
    defaultValues: {
      prompt: "",
      style_preset: "castle-throne",
    },
  });

  const selectedPreset = watch("style_preset");

  const onSubmit = async (data: AIGenerateFormData) => {
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Generation failed");
      }

      setGeneratedImage(result.imageUrl);
      toast.success("Your kingdom preview is ready!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate preview"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "rounded-2xl border border-royal-gold/30 overflow-hidden",
        isCompact ? "bg-white shadow-xl" : "glass-card",
        className
      )}
    >
      <div className={cn("p-6", isCompact ? "" : "lg:p-8")}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-royal-gold/20">
            <Wand2 className="h-5 w-5 text-royal-gold" />
          </div>
          <div>
            <h3
              className={cn(
                "font-serif font-bold",
                isCompact ? "text-royal-blue text-xl" : "text-royal-cream text-xl"
              )}
            >
              AI Kingdom Preview Generator
            </h3>
            <p
              className={cn(
                "text-sm",
                isCompact ? "text-royal-blue/60" : "text-royal-cream/60"
              )}
            >
              Visualize your child&apos;s royal adventure before you arrive
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label
              htmlFor="prompt"
              className={isCompact ? "text-royal-blue" : "text-royal-cream/90"}
            >
              Describe the royal adventure
            </Label>
            <Input
              id="prompt"
              placeholder='e.g. "brave young prince in royal forest, confident and joyful"'
              className={cn(
                "mt-1.5",
                isCompact
                  ? "bg-royal-cream border-royal-gold/30"
                  : "bg-white/10 border-white/20 text-royal-cream placeholder:text-royal-cream/40"
              )}
              {...register("prompt")}
            />
            {errors.prompt && (
              <p className="text-red-400 text-sm mt-1">{errors.prompt.message}</p>
            )}
          </div>

          {/* Style Presets */}
          <div>
            <Label
              className={cn(
                "mb-2 block",
                isCompact ? "text-royal-blue" : "text-royal-cream/90"
              )}
            >
              Style Preset
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {AI_STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    setValue("style_preset", preset.id as AIGenerateFormData["style_preset"])
                  }
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-sm font-medium transition-all border",
                    selectedPreset === preset.id
                      ? "bg-royal-gold text-royal-blue border-royal-gold"
                      : isCompact
                        ? "bg-royal-cream text-royal-blue/70 border-royal-gold/20 hover:border-royal-gold/50"
                        : "bg-white/5 text-royal-cream/70 border-white/10 hover:border-royal-gold/50"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating your kingdom...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Preview
              </>
            )}
          </Button>
        </form>

        {/* Generated Image Preview */}
        {(generatedImage || isGenerating) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-royal-purple/20">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gold-shimmer animate-shimmer" />
                  <p
                    className={cn(
                      "text-sm",
                      isCompact ? "text-royal-blue/60" : "text-royal-cream/60"
                    )}
                  >
                    Creating your preview...
                  </p>
                </div>
              ) : generatedImage ? (
                <>
                  <Image
                    src={generatedImage}
                    alt="AI Kingdom Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <a
                      href={generatedImage}
                      download="kingdom-preview.webp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-white/90 hover:text-royal-gold transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Save preview
                    </a>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
