"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const solid = !isHome || scrolled;

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300",
        "top-[var(--promo-bar-height,0px)]",
        solid
          ? "bg-royal-blue/95 backdrop-blur-xl shadow-lg shadow-black/25 border-b border-royal-gold/15"
          : "bg-gradient-to-b from-royal-blue/80 via-royal-blue/35 to-transparent"
      )}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-24 lg:h-28 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label={SITE.name}>
            <Image
              src="/brand/storybook-photos-logo-white.png"
              alt={SITE.name}
              width={460}
              height={302}
              priority
              className="h-[4.5rem] w-auto sm:h-20 lg:h-[5.25rem] object-contain drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-[1.03]"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors",
                  pathname === link.href
                    ? "text-royal-gold"
                    : "text-royal-cream/80 hover:text-royal-gold"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="gold" size="lg" asChild>
              <Link href="/book">Book Now</Link>
            </Button>
          </div>

          <button
            className="lg:hidden text-royal-cream min-h-11 min-w-11 inline-flex items-center justify-center p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-royal-blue/98 backdrop-blur-md border-t border-royal-gold/20"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "py-2 text-lg transition-colors",
                    pathname === link.href
                      ? "text-royal-gold"
                      : "text-royal-cream/90 hover:text-royal-gold"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Button variant="gold" size="lg" asChild className="mt-2">
                <Link href="/book">Book Now</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
