"use client";

import { useCallback, useMemo, useState, type DragEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
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
  "castle-throne": [],
  "royal-forest": [],
  "royal-garden": [],
  "courage-quest": [],
});

const emptySetPreviews = (): SetPreviews => ({
  "castle-throne": [],
  "royal-forest": [],
  "royal-garden": [],
  "courage-quest": [],
});

const adminHeaders = {
  "x-admin-code": ADMIN_ACCESS_CODE,
};

type Step = "form" | "generating" | "preview";

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
  const [book, setBook] = useState<GeneratedBook | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [genStatus, setGenStatus] = useState("Preparing…");

  const page = book?.pages[pageIndex];

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

    try {
      const photos_by_set = {
        "castle-throne": [] as string[],
        "royal-forest": [] as string[],
        "royal-garden": [] as string[],
        "courage-quest": [] as string[],
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
      setGenStatus(`Writing “${selectedPath.label}”…`);

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
      const blob = await buildStorybookPdf({
        bookTitle: book.bookTitle,
        childName: book.child_name,
        pages: book.pages,
        includeCover: true,
        includeBack: true,
      });
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

              <div className="grid sm:grid-cols-2 gap-4">
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
          <div className="rounded-2xl border-2 border-royal-gold/35 bg-white p-12 text-center shadow-lg">
            <Loader2 className="h-10 w-10 text-royal-gold animate-spin mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-royal-blue mb-2">
              Creating the kingdom story…
            </h2>
            <p className="text-royal-blue/60 text-sm">{genStatus}</p>
            <p className="text-royal-blue/40 text-xs mt-4">
              This can take a minute when fal.ai / Grok keys are configured.
            </p>
          </div>
        )}

        {step === "preview" && book && page && (
          <div className="space-y-6">
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
                  onClick={approveAndDownload}
                  disabled={approving}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md bg-royal-gold px-4 text-sm font-semibold text-royal-blue hover:bg-[#D4B480] disabled:opacity-50"
                >
                  {approving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Approve &amp; Send to Printer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setBook(null);
                    setPageIndex(0);
                    setEditMode(false);
                    setChildName("");
                    setNotes("");
                  }}
                  className="inline-flex h-10 items-center rounded-md border border-royal-gold/25 px-4 text-sm text-royal-blue/70 hover:bg-white"
                >
                  New book
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl border border-royal-gold/30 bg-gradient-to-br from-[#FFFBF5] via-white to-[#F5EDE0] p-4 sm:p-8 shadow-inner">
              <div
                className="pointer-events-none absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-royal-gold/25 to-transparent hidden sm:block"
                aria-hidden="true"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${book.id}-${page.page}-${editMode}`}
                  initial={{ opacity: 0, rotateY: -8 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 8 }}
                  transition={{ duration: 0.35 }}
                  className="grid sm:grid-cols-2 gap-6 sm:gap-10 min-h-[340px]"
                  style={{ transformPerspective: 1200 }}
                >
                  <div className="flex flex-col justify-center px-1 sm:pr-4">
                    <p className="text-royal-gold text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                      Page {page.page} of {book.pages.length}
                    </p>
                    {editMode ? (
                      <>
                        <input
                          value={page.title}
                          onChange={(e) =>
                            updatePageField(pageIndex, "title", e.target.value)
                          }
                          className="font-serif text-2xl font-bold text-royal-blue mb-3 w-full border-b border-royal-gold/40 bg-transparent outline-none"
                        />
                        <textarea
                          value={page.text}
                          onChange={(e) =>
                            updatePageField(pageIndex, "text", e.target.value)
                          }
                          rows={10}
                          className="w-full rounded-md border border-royal-gold/30 bg-white/80 px-3 py-2 text-sm text-royal-blue/80 leading-relaxed outline-none focus:ring-2 focus:ring-royal-gold/20"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-royal-blue mb-4 leading-tight">
                          {page.title}
                        </h3>
                        <p className="text-royal-blue/75 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                          {page.text}
                        </p>
                      </>
                    )}
                    {page.photoSet && (
                      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-royal-blue/50">
                        <Camera className="h-3.5 w-3.5 text-royal-gold" />
                        {page.photoSet}
                      </p>
                    )}
                  </div>

                  <div className="relative rounded-xl overflow-hidden border-2 border-royal-gold/30 bg-royal-cream shadow-md aspect-[3/4] sm:aspect-auto sm:min-h-[320px]">
                    {page.imageUrl ? (
                      page.imageUrl.startsWith("data:") ||
                      page.imageUrl.includes("placehold.co") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={page.imageUrl}
                          alt={page.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={page.imageUrl}
                          alt={page.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 400px"
                          unoptimized
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-royal-blue/40 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-royal-gold/20 pt-5">
                <button
                  type="button"
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  disabled={pageIndex === 0}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-royal-gold/35 bg-white px-4 text-sm font-semibold text-royal-blue disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {book.pages.map((p, i) => (
                    <button
                      key={p.page}
                      type="button"
                      onClick={() => setPageIndex(i)}
                      className={cn(
                        "h-10 min-w-10 sm:h-8 sm:min-w-8 rounded-md px-2 text-xs font-bold",
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
                  onClick={() =>
                    setPageIndex((i) =>
                      Math.min(book.pages.length - 1, i + 1)
                    )
                  }
                  disabled={pageIndex === book.pages.length - 1}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-royal-gold/35 bg-white px-4 text-sm font-semibold text-royal-blue disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-royal-blue/50">
              Each kingdom-set page uses the photos you dropped for that set.
              AI watercolor fills the remaining pages when fal.ai is configured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function onDrop(e: DragEvent) {
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
