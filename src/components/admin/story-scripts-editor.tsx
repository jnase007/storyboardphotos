"use client";

import { useEffect, useState } from "react";
import { Camera, Check, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ADVENTURE_PATHS,
  ADVENTURE_PATHS_STORAGE_KEY,
  resolveAdventurePaths,
  type AdventurePath,
  type AdventurePathId,
  type AdventureScriptPage,
} from "@/lib/storybook/adventure-paths";

const STORAGE_KEY = ADVENTURE_PATHS_STORAGE_KEY;

function cloneDefaults(): AdventurePath[] {
  return JSON.parse(JSON.stringify(ADVENTURE_PATHS)) as AdventurePath[];
}

/**
 * Admin tool to edit the 6 choose-your-own-adventure scripts used by the kiosk generator.
 */
export function StoryScriptsEditor() {
  const [paths, setPaths] = useState<AdventurePath[]>(cloneDefaults);
  const [pathId, setPathId] = useState<AdventurePathId>("dragon-slayer");
  const [pageIndex, setPageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setPaths(resolveAdventurePaths(raw));
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const path = paths.find((p) => p.id === pathId) ?? paths[0];
  const page = path.pages[pageIndex];

  function selectPath(id: AdventurePathId) {
    setPathId(id);
    setPageIndex(0);
  }

  function updatePathField<K extends keyof AdventurePath>(
    field: K,
    value: AdventurePath[K]
  ) {
    setDirty(true);
    setPaths((prev) =>
      prev.map((p) => (p.id === pathId ? { ...p, [field]: value } : p))
    );
  }

  function updatePage(field: keyof AdventureScriptPage, value: string) {
    setDirty(true);
    setPaths((prev) =>
      prev.map((p) => {
        if (p.id !== pathId) return p;
        return {
          ...p,
          pages: p.pages.map((pg, i) =>
            i === pageIndex ? { ...pg, [field]: value } : pg
          ),
        };
      })
    );
  }

  function saveScripts() {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
      setDirty(false);
      toast.success("Adventure scripts saved on this device");
    } catch {
      toast.error("Could not save scripts");
    } finally {
      setSaving(false);
    }
  }

  function resetToDefaults() {
    if (
      !window.confirm(
        "Reset all 6 adventure scripts to the original choose-your-own-adventure text?"
      )
    ) {
      return;
    }
    const defaults = cloneDefaults();
    setPaths(defaults);
    localStorage.removeItem(STORAGE_KEY);
    setDirty(false);
    setPageIndex(0);
    toast.success("Scripts reset to defaults");
  }

  if (!loaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-royal-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-enchanted-cream">
      <div className="bg-royal-blue border-b border-royal-gold/30">
        <div className="container mx-auto px-4 lg:px-8 py-8 sm:py-10">
          <p className="text-royal-gold text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Internal · Story scripts
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-cream mb-2">
            Choose Your Adventure — 6 Story Paths
          </h1>
          <p className="text-royal-cream/65 text-sm sm:text-base max-w-2xl leading-relaxed">
            Edit the kiosk options kids pick before their book is generated.
            Use placeholders like{" "}
            <span className="text-royal-gold/90">[Name]</span>,{" "}
            <span className="text-royal-gold/90">[Role]</span>,{" "}
            <span className="text-royal-gold/90">[she/he/they]</span> so every
            child gets a personal story.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 sm:py-10 max-w-5xl space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {paths.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPath(p.id)}
              className={cn(
                "rounded-xl border-2 px-3 py-3.5 text-left transition-all min-h-[4.5rem]",
                pathId === p.id
                  ? "bg-royal-blue border-royal-gold text-royal-cream shadow-md shadow-royal-gold/20"
                  : "bg-white border-royal-gold/25 text-royal-blue hover:border-royal-gold/50"
              )}
            >
              <span
                className={cn(
                  "block text-[10px] font-semibold tracking-[0.18em] uppercase mb-1",
                  pathId === p.id ? "text-royal-gold" : "text-royal-gold/80"
                )}
              >
                Option {p.option}
              </span>
              <span className="font-serif text-sm sm:text-base font-bold leading-snug block">
                {p.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-royal-gold/30 bg-white px-4 text-sm font-semibold text-royal-blue/70 hover:bg-royal-gold/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to default
          </button>
          <button
            type="button"
            onClick={saveScripts}
            disabled={saving || !dirty}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-royal-gold px-4 text-sm font-semibold text-royal-blue hover:bg-[#D4B480] disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : dirty ? (
              <Save className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {dirty ? "Save scripts" : "Saved"}
          </button>
        </div>

        <div className="rounded-2xl border border-royal-gold/30 bg-white p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-royal-gold mb-2">
              Kiosk label
            </label>
            <input
              value={path.label}
              onChange={(e) => updatePathField("label", e.target.value)}
              className="w-full font-serif text-xl font-bold text-royal-blue border-b border-royal-gold/30 bg-transparent pb-2 outline-none focus:border-royal-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-royal-gold mb-2">
              Adventure title
            </label>
            <input
              value={path.title}
              onChange={(e) => updatePathField("title", e.target.value)}
              className="w-full text-base text-royal-blue border border-royal-gold/25 rounded-md bg-royal-cream/30 px-3 py-2 outline-none focus:ring-2 focus:ring-royal-gold/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-royal-gold mb-2">
              Kiosk description
            </label>
            <textarea
              value={path.description}
              onChange={(e) => updatePathField("description", e.target.value)}
              rows={2}
              className="w-full text-sm text-royal-blue/80 border border-royal-gold/25 rounded-md bg-royal-cream/30 px-3 py-2 outline-none focus:ring-2 focus:ring-royal-gold/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-royal-gold mb-2">
              Book title template
            </label>
            <input
              value={path.bookTitleTemplate}
              onChange={(e) =>
                updatePathField("bookTitleTemplate", e.target.value)
              }
              className="w-full font-serif text-lg font-bold text-royal-blue border border-royal-gold/25 rounded-md bg-royal-cream/30 px-3 py-2 outline-none focus:ring-2 focus:ring-royal-gold/20"
            />
            <p className="mt-1.5 text-xs text-royal-blue/45">
              Example: [Role] [Name] and the Dragon Quest
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-royal-gold mb-2">
              AI theme notes
            </label>
            <textarea
              value={path.aiTheme}
              onChange={(e) => updatePathField("aiTheme", e.target.value)}
              rows={2}
              className="w-full text-sm text-royal-blue/80 border border-royal-gold/25 rounded-md bg-royal-cream/30 px-3 py-2 outline-none focus:ring-2 focus:ring-royal-gold/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {path.pages.map((p, i) => (
            <button
              key={p.page}
              type="button"
              onClick={() => setPageIndex(i)}
              className={cn(
                "h-10 min-w-10 sm:h-9 sm:min-w-9 rounded-md px-2.5 text-xs font-bold transition-colors",
                i === pageIndex
                  ? "bg-royal-gold text-royal-blue"
                  : "bg-white border border-royal-gold/25 text-royal-blue/60 hover:bg-royal-gold/15"
              )}
            >
              {p.page}
            </button>
          ))}
        </div>

        {page && (
          <div className="rounded-2xl border-2 border-royal-gold/30 bg-gradient-to-br from-[#FFFBF5] via-white to-[#F5EDE0] p-5 sm:p-8 shadow-inner space-y-5">
            <p className="text-royal-gold text-xs font-semibold tracking-[0.2em] uppercase">
              Option {path.option} · Page {page.page} of {path.pages.length}
            </p>

            <div>
              <label className="block text-xs font-medium text-royal-blue/50 mb-1.5">
                Page title
              </label>
              <input
                value={page.title}
                onChange={(e) => updatePage("title", e.target.value)}
                className="w-full font-serif text-2xl font-bold text-royal-blue border border-royal-gold/25 rounded-md bg-white/80 px-3 py-2 outline-none focus:ring-2 focus:ring-royal-gold/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-royal-blue/50 mb-1.5">
                Story text
              </label>
              <textarea
                value={page.text}
                onChange={(e) => updatePage("text", e.target.value)}
                rows={9}
                className="w-full rounded-md border border-royal-gold/25 bg-white/80 px-3 py-2 text-sm sm:text-base text-royal-blue/80 leading-relaxed outline-none focus:ring-2 focus:ring-royal-gold/20 whitespace-pre-wrap"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-royal-blue/50 mb-1.5">
                Photo placeholder note
              </label>
              <div className="flex gap-2 items-start">
                <Camera className="h-4 w-4 text-royal-gold shrink-0 mt-2.5" />
                <input
                  value={page.photoCaption}
                  onChange={(e) => updatePage("photoCaption", e.target.value)}
                  className="flex-1 rounded-md border border-royal-gold/25 bg-white/80 px-3 py-2 text-sm text-royal-blue/75 outline-none focus:ring-2 focus:ring-royal-gold/20"
                />
              </div>
              {page.photoSet && (
                <p className="mt-2 text-xs text-royal-blue/45 ml-6">
                  Kingdom set: {page.photoSet}
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-royal-blue/40 max-w-xl mx-auto">
          Save stores scripts in this browser. The Storybook Generator on the
          same device will use your saved versions when creating books.
        </p>
      </div>
    </div>
  );
}
