"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Heart, Play, Volume2, VolumeX } from "lucide-react";
import { SITE } from "@/lib/constants";
import { EnchantEmbers } from "@/components/enchant-embers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/** Self-hosted homepage promo — no YouTube chrome. */
const HERO_VIDEO = "/brand/homepage-hero-promo.mp4";
const HERO_POSTER = "/brand/homepage-hero-promo-poster.jpg";
const HERO_BACKDROP = "/brand-storefront.jpg";

export function HeroSection() {
  const previewRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);

  // Keep the muted hero loop playing when the lightbox is closed.
  useEffect(() => {
    const preview = previewRef.current;
    const modal = modalRef.current;
    if (open) {
      preview?.pause();
      return;
    }
    modal?.pause();
    if (!preview) return;
    preview.muted = true;
    setMuted(true);
    const playPromise = preview.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay can still fail on some browsers; poster + play CTA remain.
      });
    }
  }, [open]);

  // When the lightbox opens, play with sound from the start.
  useEffect(() => {
    if (!open) return;
    const video = modalRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    setMuted(false);
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // If sound autoplay is blocked, keep controls available.
      });
    }
  }, [open]);

  const toggleMute = () => {
    const video = previewRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) {
      video.play().catch(() => {});
    }
  };

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-enchanted-night">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_BACKDROP}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 bg-royal-blue/55 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-royal-blue/88 via-royal-blue/55 to-royal-purple/35 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-royal-cream via-transparent to-royal-blue/30 z-[1]" />
      <div
        className="absolute inset-0 z-[1] opacity-50 mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 40% at 70% 30%, rgba(212,176,122,0.45), transparent 70%)",
        }}
      />

      <EnchantEmbers />

      <div className="container mx-auto px-4 lg:px-8 pt-[calc(var(--promo-bar-height,0px)+var(--navbar-height,6rem)+1rem)] lg:pt-[calc(var(--promo-bar-height,0px)+var(--navbar-height-lg,7rem)+1.25rem)] pb-14 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-royal-cream leading-tight mb-6 drop-shadow-lg">
              Remind Your Child
              <br />
              <span className="text-gradient-gold-shine">They Are Royalty</span>
            </h1>

            <p className="text-lg text-royal-cream/90 max-w-lg mb-8 leading-relaxed drop-shadow">
              Kingdom-themed photo shoots and Kingdom Chronicles that help
              kids feel brave, beloved, and full of wonder — an enchanted
              adventure they'll never forget.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-8">
              <Link
                href="/book"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-royal-gold px-8 text-base font-semibold text-royal-blue glow-gold transition-all hover:bg-[#D4B480] hover:scale-[1.02]"
              >
                Book Your Session
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-royal-gold/50 bg-royal-blue/40 backdrop-blur-sm px-8 text-base font-semibold text-royal-cream transition-all hover:border-royal-gold hover:bg-royal-gold/15"
              >
                Books from $299
              </Link>
            </div>

            <div className="inline-flex flex-col gap-2 rounded-xl bg-royal-blue/80 backdrop-blur-md px-4 py-3 text-sm text-royal-cream ring-1 ring-royal-gold/25 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-royal-gold shrink-0" />
                <span className="font-medium">Premium studio in {SITE.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-royal-gold shrink-0" />
                <span className="font-medium">Book · Movie · Memory they'll never outgrow</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:col-span-7"
          >
            <div className="relative rounded-2xl overflow-hidden border border-royal-gold/40 bg-black shadow-2xl shadow-black/45 glow-lantern">
              <div
                className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-royal-gold/70 to-transparent z-20"
                aria-hidden="true"
              />

              <div className="relative w-full aspect-video min-h-[240px] sm:min-h-[320px] lg:min-h-[420px]">
                <video
                  ref={previewRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={HERO_VIDEO}
                  poster={HERO_POSTER}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label="Storybook Photos experience preview"
                />

                {/* Click-catcher opens the lightbox player */}
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-royal-blue/35 via-transparent to-royal-blue/10 transition-colors hover:bg-royal-blue/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-royal-gold focus-visible:ring-inset"
                  aria-label="Play full video"
                >
                  <span className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-royal-gold text-royal-blue shadow-xl shadow-black/30 ring-4 ring-royal-gold/30 transition-transform hover:scale-105">
                    <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-current ml-1" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="absolute bottom-3 right-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-royal-blue/75 text-royal-cream ring-1 ring-royal-gold/35 backdrop-blur-sm hover:bg-royal-gold hover:text-royal-blue transition-colors"
                  aria-label={muted ? "Unmute preview" : "Mute preview"}
                >
                  {muted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(96vw,1120px)] overflow-hidden rounded-2xl border border-royal-gold/40 bg-black p-0 shadow-2xl">
          <DialogTitle className="sr-only">
            Storybook Photos experience video
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full Storybook Photos promo video player
          </DialogDescription>
          <div className="relative w-full aspect-video bg-black">
            <video
              ref={modalRef}
              className="absolute inset-0 h-full w-full object-contain bg-black"
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
