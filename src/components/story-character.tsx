"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export const CHARACTERS = {
  fairy: {
    src: "/characters/fairy.webp",
    alt: "Watercolor fairy with lantern and flower crown",
  },
  king: {
    src: "/characters/king.webp",
    alt: "Watercolor fairy-tale king with crown and scepter",
  },
  prince: {
    src: "/characters/prince.webp",
    alt: "Watercolor young prince with blue cape and scepter",
  },
  queen: {
    src: "/characters/queen.webp",
    alt: "Watercolor fairy-tale queen with crown and scepter",
  },
} as const;

export type CharacterId = keyof typeof CHARACTERS;

type StoryCharacterProps = {
  id: CharacterId;
  className?: string;
  /** Approximate display width in px for Next Image sizes */
  width?: number;
  priority?: boolean;
  /** Soft float animation */
  float?: boolean;
  /** multiply melts white paper into cream; normal for dark sections */
  blend?: "multiply" | "normal";
};

/**
 * Watercolor fairy-tale character.
 * Default multiply blend melts white paper into cream page backgrounds.
 */
export function StoryCharacter({
  id,
  className,
  width = 220,
  priority = false,
  float = true,
  blend = "multiply",
}: StoryCharacterProps) {
  const character = CHARACTERS[id];

  return (
    <div
      className={cn(
        "pointer-events-none select-none",
        float && "animate-character-float",
        className
      )}
      aria-hidden="true"
    >
      <Image
        src={character.src}
        alt={character.alt}
        width={width}
        height={Math.round(width * 1.35)}
        priority={priority}
        className={cn(
          "h-auto w-full object-contain drop-shadow-sm",
          blend === "multiply" ? "mix-blend-multiply opacity-90" : "opacity-85"
        )}
        sizes={`${width}px`}
      />
    </div>
  );
}
