"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Loader2,
  Pencil,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SetUploadId, StoryGender, StoryPage } from "@/lib/storybook/types";
import {
  ADMIN_ACCESS_CODE,
  MAX_PHOTOS_PER_SET,
  SET_UPLOAD_SLOTS,
} from "@/lib/storybook/types";
import {
  compressImageFile,
  readApiJson,
} from "@/lib/storybook/compress-image";
import { buildStorybookPdf } from "@/lib/storybook/build-pdf";
import {
  ADVENTURE_PATHS,
  loadAdventurePathsClient,
  type AdventurePathId,
} from "@/lib/storybook/adventure-paths";

type GeneratedBook = {
  id: string;
  bookTitle: string;
  child_name: string;
  child_age: number;
  gender: StoryGender;
  notes: string | null;
  adventure_path?: AdventurePathId;
  photo_urls: string[];
  pages: StoryPage[];
  status: string;
  storyProvider?: string;
};

type SetFiles = Record<SetUploadId, File[]>;
type SetPreviews = Record<SetUploadId, string[]>;

const emptySetFiles = (): SetFiles => ({
  "throne-room": [],
  "royal-forest": [],
  "royal-garden": [],
  "chastle": [],
});

const emptySetPreviews = (): SetPreviews => ({
  "throne-room": [],
  "royal-forest": [],
  "royal-garden": [],
  "chastle": [],
});

const adminHeaders = {
  "x-admin-code": ADMIN_ACCESS_CODE,
};

type Step = "form" | "generating" | "preview";

// ─── Animated progress steps ───────────────────────────────────────────────
const PROGRESS_STEPS = [
  { emoji: "✨", message: "Preparing your royal quest…" },
  { emoji: "📜", message: "Writing your adventure story…" },
  { emoji: "🎨", message: "Painting your kingdom scenes…" },
  { emoji: "🐉", message: "Bringing the dragon to life…" },
  { emoji: "🌟", message: "Adding the finishing touches…" },
  { emoji: "📖", message: "Binding your royal storybook…" },
];

function GeneratingView({ status }: { status: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-advance through magical steps every ~8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = Math.min(prev + 1, PROGRESS_STEPS.length - 1);
        setProgress(Math.round((next / (PROGRESS_STEPS.length - 1)) * 100));
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentStep = PROGRESS_STEPS[stepIndex];

  return (
    <div className="rounded-2xl border-2 border-royal-gold/35 bg-white p-12 text-center shadow-lg">
      {/* Animated emoji */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ scale: 0.5, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.2, opacity: 0, y: -10 }}
          transition={{ duration: 0.45, type: "spring", bounce: 0.4 }}
          className="text-6xl mb-6 select-none"
        >
          {currentStep.emoji}
        </motion.div>
      </AnimatePresence>

      <h2 className="font-serif text-2xl font-bold text-royal-blue mb-2">
        Creating the kingdom story…
      </h2>

      {/* Step message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="text-royal-blue/70 text-base font-medium mb-1"
        >
          {currentStep.message}
        </motion.p>
      </AnimatePresence>

      <p className="text-royal-blue/40 text-xs mb-8">{status}</p>

      {/* Progress bar */}
      <div className="max-w-sm mx-auto">
        <div className="flex justify-between text-[10px] font-semibold text-royal-blue/40 mb-2 px-0.5">
          <span>Step {stepIndex + 1} of {PROGRESS_STEPS.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-royal-blue/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-royal-gold to-[#E8C97A]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-4">
          {PROGRESS_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                i < stepIndex
                  ? "bg-royal-gold"
                  : i === stepIndex
                  ? "bg-royal-gold scale-125"
                  : "bg-royal-blue/15"
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-royal-blue/30 text-xs mt-6">
        This can take a minute when fal.ai / Grok keys are configured.
      </p>
    </div>
  );
}

/**
 * Internal staff tool: upload session photos by set → generate story + art → edit → PDF.
 */
export function StorybookGenerator() {
  const [step, setStep] = useState<Step>("form");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState(6);
  const [gender, setGender] = useState<StoryGender>("girl");
  const [notes, setNotes] = useState("");
  const [adventurePath, setAdventurePath] =
    useState<AdventurePathId>("dragon-slayer");
  const [storyMode, setStoryMode] = useState<"script" | "ai">("script");
  const [setFiles, setSetFiles] = useState<SetFiles>(emptySetFiles);
  const [setPreviews, setSetPreviews] = useState<SetPreviews>(emptySetPreviews);
  // Character portrait state
  const [characterPhoto, setCharacterPhoto] = useState<string | null>(null);
  const [characterPreview, setCharacterPreview] = useState<string | null>(null);
  const [characterDragging, setCharacterDragging] = useState(false);
  const [book, setBook] = useState<GeneratedBook | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [regeneratingPage, setRegeneratingPage] = useState(false);
  const [genStatus, setGenStatus] = useState("Preparing…");

  const page = book?.pages[pageIndex];

  // ── Character portrait handlers ─────────────────────────────────────────

  function handleCharacterFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, or WebP).");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setCharacterPreview(previewUrl);
    // Convert to base64 for transmission
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") setCharacterPhoto(result);
    };
    reader.readAsDataURL(file);
  }

  function clearCharacterPhoto() {
    if (characterPreview) URL.revokeObjectURL(characterPreview);
    setCharacterPreview(null);
    setCharacterPhoto(null);
  }

  function onCharacterDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setCharacterDragging(true);
  }

  function onCharacterDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setCharacterDragging(false);
  }

  function onCharacterDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setCharacterDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCharacterFile(file);
  }

  // ── Set upload handlers ─────────────────────────────────────────────────

  const addFilesToSet = useCallback((setId: SetUploadId, list: FileList | File[]) => {
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) {
      toast.error("Please drop image files (JPG, PNG, or WebP).");
      return;
    }

    setSetFiles((prev) => {
      const merged = [...prev[setId], ...incoming].slice(0, MAX_PHOTOS_PER_SET);
      if (prev[setId].length + incoming.length > MAX_PHOTOS_PER_SET) {
        toast.message(`Up to ${MAX_PHOTOS_PER_SET} photos per set`);
      }
      return { ...prev, [setId]: merged };
    });

    setSetPreviews((prev) => {
      const existing = prev[setId];
      const room = MAX_PHOTOS_PER_SET - existing.length;
      const nextUrls = incoming.slice(0, Math.max(0, room)).map((f) =>
        URL.createObjectURL(f)
      );
      return { ...prev, [setId]: [...existing, ...nextUrls] };
    });
  }, []);

  function removeFileFromSet(setId: SetUploadId, index: number) {
    setSetFiles((prev) => ({
      ...prev,
      [setId]: prev[setId].filter((_, i) => i !== index),
    }));
    setSetPreviews((prev) => {
      const url = prev[setId][index];
      if (url) URL.revokeObjectURL(url);
      return {
        ...prev,
        [setId]: prev[setId].filter((_, i) => i !== index),
      };
    });
  }

  // ── Generate handler ────────────────────────────────────────────────────

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const missing = SET_UPLOAD_SLOTS.filter((s) => setFiles[s.id].length < 1);
    if (missing.length > 0) {
      toast.error(`Add at least one photo for: ${missing.map((m) => m.name).join(", ")}`);
      return;
    }
    if (!childName.trim()) {
      toast.error("Child's name is required.");
      return;
    }

    setStep("generating");
    setGenStatus("Compressing photos…");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const photos_by_set = {
        "throne-room": [] as string[],
        "royal-forest": [] as string[],
        "royal-garden": [] as string[],
        "chastle": [] as string[],
      };
      const photo_urls: string[] = [];

      for (let i = 0; i < SET_UPLOAD_SLOTS.length; i++) {
        const slot = SET_UPLOAD_SLOTS[i];
        setGenStatus(
          `Uploading ${slot.name} (${i + 1}/${SET_UPLOAD_SLOTS.length})…`
        );
        const form = new FormData();
        for (const file of setFiles[slot.id]) {
          const compressed = await compressImageFile(file);
          form.append(slot.id, compressed);
        }

        const upRes = await fetch("/api/admin/storybooks/upload", {
          method: "POST",
          headers: adminHeaders,
          body: form,
        });
        const upData = await readApiJson<{
          error?: string;
          photos_by_set?: Partial<typeof photos_by_set>;
          photo_urls?: string[];
        }>(upRes);
        if (!upRes.ok) throw new Error(upData.error || "Upload failed");

        const urls = upData.photos_by_set?.[slot.id];
        if (!urls?.length) {
          throw new Error(`Upload returned no photos for ${slot.name}`);
        }
        photos_by_set[slot.id] = urls;
        photo_urls.push(...urls);
      }

      const selectedPath =
        loadAdventurePathsClient().find((p) => p.id === adventurePath) ??
        ADVENTURE_PATHS.find((p) => p.id === adventurePath) ??
        ADVENTURE_PATHS[0];
      setGenStatus(`Writing "${selectedPath.label}"…`);

      const genRes = await fetch("/api/admin/storybooks/generate", {
        method: "POST",
        headers: {
          ...adminHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_name: childName.trim(),
          child_age: childAge,
          gender,
          notes: notes.trim() || null,
          adventure_path: adventurePath,
          adventure_script: selectedPath,
          story_mode: storyMode,
          photos_by_set,
          photo_urls,
          character_photo: characterPhoto ?? undefined,
        }),
      });

      setGenStatus("Painting watercolor illustrations…");
      const genData = await readApiJson<{
        error?: string;
        storyProvider?: string;
      } & GeneratedBook>(genRes);
      if (!genRes.ok) throw new Error(genData.error || "Generation failed");

      setBook(genData as GeneratedBook);
      setPageIndex(0);
      setEditMode(false);
      setStep("preview");
      toast.success(
        genData.storyProvider === "template"
          ? "Adventure story ready from curated script"
          : "Adventure story generated!"
      );
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Generation failed");
      setStep("form");
    }
  }

  // ── Page editing ────────────────────────────────────────────────────────

  function updatePageField(
    index: number,
    field: "title" | "text",
    value: string
  ) {
    setBook((prev) => {
      if (!prev) return prev;
      const pages = prev.pages.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      );
      return { ...prev, pages };
    });
  }

  async function saveEdits() {
    if (!book) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/storybooks/${book.id}`, {
        method: "PATCH",
        headers: {
          ...adminHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pages: book.pages }),
      });
      const data = await readApiJson<{ error?: string; persisted?: boolean }>(res);
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success(data.persisted ? "Saved to Supabase" : "Edits saved locally");
      setEditMode(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function downloadMpixPdf() {
    if (!book) return;
    setPdfLoading(true);
    try {
      // Use server-side PDF generation so images are fetched without CORS issues
      const res = await fetch("/api/admin/storybooks/build-pdf", {
        method: "POST",
        headers: { ...adminHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: book.bookTitle,
          childName: book.child_name,
          pages: book.pages,
          coverImageUrl: book.pages[0]?.imageUrl ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.child_name.replace(/\s+/g, "-")}-Kingdom-Quest-Storybook.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Mpix PDF downloaded — ready for photo book order!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setPdfLoading(false);
    }
  }

  async function regeneratePage(pageIdx: number) {
    if (!book) return;
    const page = book.pages[pageIdx];
    if (!page || page.useSessionPhoto) {
      toast.error("This page uses a real photo — upload a different photo to change it");
      return;
    }
    setRegeneratingPage(true);
    try {
      const res = await fetch("/api/admin/storybooks/regenerate-page", {
        method: "POST",
        headers: { ...adminHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePrompt: page.imagePrompt,
          pageTitle: page.title,
        }),
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const data = await res.json();
      if (data.imageUrl) {
        setBook((prev) => {
          if (!prev) return prev;
          const pages = [...prev.pages];
          pages[pageIdx] = { ...pages[pageIdx], imageUrl: data.imageUrl };
          return { ...prev, pages };
        });
        toast.success("Page regenerated! ✨");
      }
    } catch (err) {
      toast.error("Failed to regenerate page");
    } finally {
      setRegeneratingPage(false);
    }
  }

  async function approveAndDownload() {
    if (!book) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/storybooks/${book.id}/approve`, {
        method: "POST",
        headers: {
          ...adminHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pages: book.pages,
          child_name: book.child_name,
          bookTitle: book.bookTitle,
        }),
      });

      if (!res.ok) {
        const data = await readApiJson<{ error?: string }>(res).catch(() => ({
          error: "PDF failed",
        }));
        throw new Error(data.error || "PDF failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.child_name.replace(/\s+/g, "-")}-kingdom-quest.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded — ready for the printer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setApproving(false);
    }
  }

  const canGenerate = useMemo(
    () =>
      childName.trim().length > 0 &&
      SET_UPLOAD_SLOTS.every((s) => setFiles[s.id].length >= 1),
    [childName, setFiles]
  );

  const totalPhotos = useMemo(
    () => SET_UPLOAD_SLOTS.reduce((n, s) => n + setFiles[s.id].length, 0),
    [setFiles]
  );

  return (
    <div className="min-h-screen bg-enchanted-cream">
      <div className="bg-royal-blue border-b border-royal-gold/30">
        <div className="container mx-auto px-4 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-royal-gold/20 ring-1 ring-royal-gold/35">
              <BookOpen className="h-5 w-5 text-royal-gold" />
            </div>
            <div>
              <p className="text-royal-gold text-xs font-semibold tracking-[0.2em] uppercase">
                Internal Staff Tool
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-cream">
                Storybook Generator
              </h1>
            </div>
          </div>
          <p className="text-royal-cream/65 text-sm sm:text-base max-w-2xl ml-[3.5rem]">
            Let the child pick their adventure, drop session photos into each
            kingdom set, generate the story, edit, then download a printer-ready
            PDF.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 sm:py-12 max-w-5xl">
        {step === "form" && (
          <form
            onSubmit={handleGenerate}
            className="rounded-2xl border-2 border-royal-gold/35 bg-white p-6 sm:p-8 shadow-lg shadow-royal-gold/10 space-y-6"
          >
            {/* ── Character Portrait Upload (TOP) ─────────────────────────── */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-medium text-royal-blue">
                  Upload Character Portrait (white background)
                </p>
                <p className="text-xs text-royal-blue/50 mt-0.5">
                  Upload a studio portrait of the child on a white background — this becomes the hero of every scene
                </p>
              </div>

              {characterPreview ? (
                <div className="relative inline-block">
                  <div className="relative w-40 h-52 rounded-xl overflow-hidden border-2 border-royal-gold/50 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={characterPreview}
                      alt="Character portrait"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearCharacterPhoto}
                    className="absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-royal-blue text-white hover:bg-royal-blue/80 shadow"
                    aria-label="Remove character portrait"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <p className="mt-2 text-xs text-royal-blue/50 text-center">Character photo ✓</p>
                </div>
              ) : (
                <div
                  onDragOver={onCharacterDragOver}
                  onDragLeave={onCharacterDragLeave}
                  onDrop={onCharacterDrop}
                  className={cn(
                    "rounded-xl border-2 border-dashed transition-colors",
                    characterDragging
                      ? "border-royal-gold bg-royal-gold/10"
                      : "border-royal-gold/40 bg-royal-cream/30 hover:border-royal-gold/70"
                  )}
                >
                  <label className="flex flex-col items-center justify-center gap-3 px-6 py-10 cursor-pointer">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-royal-gold/15 ring-2 ring-royal-gold/30">
                      <Crown className="h-7 w-7 text-royal-gold" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-royal-blue">
                        {characterDragging ? "Drop portrait here" : "Drag & drop or click to upload"}
                      </p>
                      <p className="text-xs text-royal-blue/45 mt-1">
                        Single portrait · JPG, PNG, WebP · white background
                      </p>
                      <p className="text-xs text-royal-blue/35 mt-0.5 italic">
                        Optional — enables AI face compositing for all scenes
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCharacterFile(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* ── Divider ─────────────────────────────────────────────────── */}
            <div className="border-t border-royal-gold/20" />

            {/* ── Adventure path ──────────────────────────────────────────── */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-medium text-royal-blue">
                  Choose your adventure
                </p>
                <p className="text-xs text-royal-blue/50 mt-0.5">
                  Kiosk step — the child picks how their story goes (1 of 6)
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADVENTURE_PATHS.map((path) => {
                  const selected = adventurePath === path.id;
                  return (
                    <button
                      key={path.id}
                      type="button"
                      onClick={() => setAdventurePath(path.id)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-4 text-left transition-all min-h-[5.5rem]",
                        selected
                          ? "border-royal-gold bg-royal-blue text-royal-cream shadow-md shadow-royal-gold/20"
                          : "border-royal-gold/25 bg-royal-cream/40 text-royal-blue hover:border-royal-gold/55"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-bold mb-2",
                          selected
                            ? "bg-royal-gold text-royal-blue"
                            : "bg-royal-gold/20 text-royal-blue"
                        )}
                      >
                        {path.option}
                      </span>
                      <span className="font-serif text-lg font-bold block leading-snug">
                        {path.label}
                      </span>
                      <span
                        className={cn(
                          "mt-1.5 block text-sm leading-snug",
                          selected
                            ? "text-royal-cream/70"
                            : "text-royal-blue/55"
                        )}
                      >
                        {path.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-royal-blue mb-1.5">
                  Child&apos;s name
                </label>
                <input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full h-11 rounded-md border border-royal-gold/30 bg-royal-cream/40 px-3 text-royal-blue outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20"
                  placeholder="Emma"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-royal-blue mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  min={1}
                  max={18}
                  value={childAge}
                  onChange={(e) => setChildAge(Number(e.target.value))}
                  className="w-full h-11 rounded-md border border-royal-gold/30 bg-royal-cream/40 px-3 text-royal-blue outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-royal-blue mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as StoryGender)}
                  className="w-full h-11 rounded-md border border-royal-gold/30 bg-royal-cream/40 px-3 text-royal-blue outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20"
                >
                  <option value="girl">Girl (Princess)</option>
                  <option value="boy">Boy (Prince)</option>
                  <option value="other">Other (Royal Hero)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-royal-blue mb-1.5">
                Story writing mode
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStoryMode("script")}
                  className={cn(
                    "rounded-lg border-2 px-3 py-3 text-left text-sm transition-colors",
                    storyMode === "script"
                      ? "border-royal-gold bg-royal-gold/15 text-royal-blue"
                      : "border-royal-gold/25 bg-royal-cream/30 text-royal-blue/70"
                  )}
                >
                  <span className="font-semibold block">Curated script</span>
                  <span className="text-xs opacity-70">
                    Best for kiosk — uses the adventure path text
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStoryMode("ai")}
                  className={cn(
                    "rounded-lg border-2 px-3 py-3 text-left text-sm transition-colors",
                    storyMode === "ai"
                      ? "border-royal-gold bg-royal-gold/15 text-royal-blue"
                      : "border-royal-gold/25 bg-royal-cream/30 text-royal-blue/70"
                  )}
                >
                  <span className="font-semibold block">AI rewrite</span>
                  <span className="text-xs opacity-70">
                    Personalizes the chosen adventure (needs API key)
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-royal-blue mb-1.5">
                Session notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-royal-gold/30 bg-royal-cream/40 px-3 py-2 text-royal-blue outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20"
                placeholder="Loves dragons, wore the blue cape, shy smile…"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-medium text-royal-blue">
                    Session photos by kingdom set
                  </p>
                  <p className="text-xs text-royal-blue/50 mt-0.5">
                    Drag &amp; drop 1–{MAX_PHOTOS_PER_SET} photos into each set
                    · {totalPhotos} total
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {SET_UPLOAD_SLOTS.map((slot) => (
                  <SetDropZone
                    key={slot.id}
                    name={slot.name}
                    hint={slot.hint}
                    files={setFiles[slot.id]}
                    previews={setPreviews[slot.id]}
                    onAdd={(list) => addFilesToSet(slot.id, list)}
                    onRemove={(i) => removeFileFromSet(slot.id, i)}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canGenerate}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-royal-gold px-8 text-sm font-semibold text-royal-blue hover:bg-[#D4B480] disabled:opacity-40 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Generate Story &amp; Illustrations
            </button>
          </form>
        )}

        {step === "generating" && (
          <GeneratingView status={genStatus} />
        )}

        {step === "preview" && book && page && (
          <BookFlipPreview
            book={book}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            editMode={editMode}
            setEditMode={setEditMode}
            saving={saving}
            approving={approving}
            pdfLoading={pdfLoading}
            updatePageField={updatePageField}
            saveEdits={saveEdits}
            downloadMpixPdf={downloadMpixPdf}
            approveAndDownload={approveAndDownload}
            regeneratePage={regeneratePage}
            regeneratingPage={regeneratingPage}
            onNewBook={() => {
              setStep("form");
              setBook(null);
              setPageIndex(0);
              setEditMode(false);
              setChildName("");
              setNotes("");
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Book Flip Preview ───────────────────────────────────────────────────────

function BookFlipPreview({
  book,
  pageIndex,
  setPageIndex,
  editMode,
  setEditMode,
  saving,
  approving,
  pdfLoading,
  updatePageField,
  saveEdits,
  downloadMpixPdf,
  approveAndDownload,
  regeneratePage,
  regeneratingPage,
  onNewBook,
}: {
  book: GeneratedBook;
  pageIndex: number;
  setPageIndex: (i: number) => void;
  editMode: boolean;
  setEditMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  saving: boolean;
  approving: boolean;
  pdfLoading: boolean;
  updatePageField: (index: number, field: "title" | "text", value: string) => void;
  saveEdits: () => void;
  downloadMpixPdf: () => void;
  approveAndDownload: () => void;
  regeneratePage: (pageIdx: number) => void;
  regeneratingPage: boolean;
  onNewBook: () => void;
}) {
  const page = book.pages[pageIndex];
  const [direction, setDirection] = useState<1 | -1>(1);

  function goNext() {
    if (pageIndex < book.pages.length - 1) {
      setDirection(1);
      setPageIndex(pageIndex + 1);
    }
  }

  function goPrev() {
    if (pageIndex > 0) {
      setDirection(-1);
      setPageIndex(pageIndex - 1);
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      rotateY: dir > 0 ? -12 : 12,
    }),
    center: { x: 0, opacity: 1, rotateY: 0 },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      rotateY: dir > 0 ? 12 : -12,
    }),
  };

  if (!page) return null;

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-royal-blue">
            {book.bookTitle}
          </h2>
          <p className="text-sm text-royal-blue/55">
            {book.pages.length} pages · Age {book.child_age}
            {book.adventure_path
              ? ` · ${
                  ADVENTURE_PATHS.find((p) => p.id === book.adventure_path)
                    ?.label ?? book.adventure_path
                }`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md border px-4 text-sm font-semibold transition-colors",
              editMode
                ? "border-royal-gold bg-royal-gold/15 text-royal-blue"
                : "border-royal-gold/35 bg-white text-royal-blue hover:bg-royal-gold/10"
            )}
          >
            <Pencil className="h-4 w-4" />
            {editMode ? "Editing…" : "Edit Story"}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={saveEdits}
              disabled={saving}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-royal-blue px-4 text-sm font-semibold text-royal-cream disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save edits
            </button>
          )}
          {(book.status === "ready" || book.status === "approved") && !page.useSessionPhoto && (
            <button
              type="button"
              onClick={() => regeneratePage(pageIndex)}
              disabled={regeneratingPage}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border-2 border-amber-500 bg-amber-50 px-4 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
            >
              {regeneratingPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>✨</span>
              )}
              {regeneratingPage ? "Regenerating..." : "Regenerate This Scene"}
            </button>
          )}
          {(book.status === "ready" || book.status === "approved") && (
            <button
              type="button"
              onClick={downloadMpixPdf}
              disabled={pdfLoading}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border-2 border-royal-gold bg-royal-blue px-4 text-sm font-semibold text-royal-gold hover:bg-royal-blue/80 disabled:opacity-50 transition-colors"
            >
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Mpix PDF
            </button>
          )}
          <button
            type="button"
            onClick={onNewBook}
            className="inline-flex h-10 items-center rounded-md border border-royal-gold/25 px-4 text-sm text-royal-blue/70 hover:bg-white"
          >
            New book
          </button>
        </div>
      </div>

      {/* Book viewer */}
      <div className="rounded-2xl border border-royal-gold/30 bg-gradient-to-br from-[#FFFBF5] via-white to-[#F5EDE0] shadow-xl overflow-hidden">
        {/* Page content with flip animation */}
        <div className="relative" style={{ perspective: 1200 }}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={`${book.id}-${page.page}-${editMode}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              {/* Illustration — top 70% */}
              <div className="relative w-full" style={{ paddingBottom: "58%" }}>
                {page.imageUrl ? (
                  page.imageUrl.startsWith("data:") ||
                  page.imageUrl.includes("placehold.co") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={page.imageUrl}
                      alt={["Title Page","The Dragon Quest","The Lost Crown","The Rescue Mission","The Forest Guardian","The Kindness Quest","The Light Treasure"].includes(page.title) ? "" : page.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={page.imageUrl}
                      alt={["Title Page","The Dragon Quest","The Lost Crown","The Rescue Mission","The Forest Guardian","The Kindness Quest","The Light Treasure"].includes(page.title) ? "" : page.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 900px"
                      unoptimized
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-royal-cream/50">
                    <span className="text-royal-blue/30 text-sm">No illustration yet</span>
                  </div>
                )}
                {/* Page number overlay */}
                <div className="absolute bottom-3 right-4 bg-royal-blue/70 text-royal-cream text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Page {page.page} of {book.pages.length}
                </div>
                {page.photoSet && (
                  <div className="absolute bottom-3 left-4 inline-flex items-center gap-1 bg-white/80 text-royal-blue/60 text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                    <Camera className="h-3 w-3 text-royal-gold" />
                    {page.photoSet}
                  </div>
                )}
              </div>

              {/* Text — bottom 30% */}
              <div className="px-6 sm:px-10 py-6 bg-white border-t border-royal-gold/15">
                {editMode ? (
                  <div className="space-y-3">
                    <input
                      value={["Title Page","The Dragon Quest","The Lost Crown","The Rescue Mission","The Forest Guardian","The Kindness Quest","The Light Treasure"].includes(page.title) ? "" : page.title}
                      onChange={(e) =>
                        updatePageField(pageIndex, "title", e.target.value)
                      }
                      className="font-serif text-2xl font-bold text-royal-blue w-full border-b border-royal-gold/40 bg-transparent outline-none pb-1"
                    />
                    <textarea
                      value={page.text}
                      onChange={(e) =>
                        updatePageField(pageIndex, "text", e.target.value)
                      }
                      rows={5}
                      className="w-full rounded-md border border-royal-gold/30 bg-white px-3 py-2 text-sm text-royal-blue/80 leading-relaxed outline-none focus:ring-2 focus:ring-royal-gold/20"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-royal-blue mb-3 leading-tight">
                      {["Title Page","The Dragon Quest","The Lost Crown","The Rescue Mission","The Forest Guardian","The Kindness Quest","The Light Treasure"].includes(page.title) ? "" : page.title}
                    </h3>
                    <p className="text-royal-blue/75 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                      {page.text}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-royal-gold/20 bg-white/50">
          <button
            type="button"
            onClick={goPrev}
            disabled={pageIndex === 0}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-royal-gold/35 bg-white px-4 text-sm font-semibold text-royal-blue disabled:opacity-40 hover:bg-royal-gold/5 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {/* Page dots / numbers */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {book.pages.map((p, i) => (
              <button
                key={p.page}
                type="button"
                onClick={() => {
                  setDirection(i > pageIndex ? 1 : -1);
                  setPageIndex(i);
                }}
                className={cn(
                  "h-8 min-w-8 rounded-md px-2 text-xs font-bold transition-colors",
                  i === pageIndex
                    ? "bg-royal-gold text-royal-blue"
                    : "bg-royal-blue/5 text-royal-blue/60 hover:bg-royal-gold/20"
                )}
              >
                {p.page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={pageIndex === book.pages.length - 1}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-royal-gold/35 bg-white px-4 text-sm font-semibold text-royal-blue disabled:opacity-40 hover:bg-royal-gold/5 transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Approve & Download PDF — bottom CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={approveAndDownload}
          disabled={approving}
          className="inline-flex h-12 items-center gap-2 rounded-md bg-royal-gold px-8 text-sm font-semibold text-royal-blue hover:bg-[#D4B480] disabled:opacity-50 shadow-md shadow-royal-gold/20 transition-colors"
        >
          {approving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Approve &amp; Download PDF
        </button>
      </div>

      <p className="text-center text-sm text-royal-blue/50">
        Each kingdom-set page uses the photos you dropped for that set.
        AI watercolor fills the remaining pages when fal.ai is configured.
      </p>
    </div>
  );
}

// ─── SetDropZone ─────────────────────────────────────────────────────────────

function SetDropZone({
  name,
  hint,
  files,
  previews,
  onAdd,
  onRemove,
}: {
  name: string;
  hint: string;
  files: File[];
  previews: string[];
  onAdd: (list: FileList | File[]) => void;
  onRemove: (index: number) => void;
}) {
  const [dragging, setDragging] = useState(false);

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      onAdd(e.dataTransfer.files);
    }
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "rounded-xl border-2 border-dashed bg-royal-cream/30 p-4 transition-colors",
        dragging
          ? "border-royal-gold bg-royal-gold/10"
          : files.length > 0
            ? "border-royal-gold/50"
            : "border-royal-gold/40 hover:border-royal-gold/70"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-serif font-bold text-royal-blue text-base leading-tight">
            {name}
          </p>
          <p className="text-xs text-royal-blue/50 mt-0.5">{hint}</p>
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold tracking-wide uppercase px-2 py-1 rounded-md",
            files.length > 0
              ? "bg-royal-gold/20 text-royal-blue"
              : "bg-royal-blue/5 text-royal-blue/45"
          )}
        >
          {files.length}/{MAX_PHOTOS_PER_SET}
        </span>
      </div>

      <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-royal-gold/20 bg-white/60 px-3 py-6 cursor-pointer hover:bg-white transition-colors">
        <Upload
          className={cn(
            "h-6 w-6",
            dragging ? "text-royal-gold" : "text-royal-gold/80"
          )}
        />
        <span className="text-sm font-semibold text-royal-blue text-center">
          {dragging ? "Drop photos here" : "Drag & drop or click"}
        </span>
        <span className="text-[11px] text-royal-blue/45">
          JPG, PNG, WebP · up to {MAX_PHOTOS_PER_SET}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div
              key={src}
              className="relative aspect-square rounded-md overflow-hidden border border-royal-gold/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${name} photo ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-0.5 right-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-royal-blue/80 text-white hover:bg-royal-blue"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
