"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Film,
  LayoutDashboard,
  Printer,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_UNLOCK_KEY = "sbp-unlock-admin";
export const ADMIN_UNLOCK_EVENT = "sbp-admin-unlock";

const ADMIN_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    shortLabel: "Home",
    icon: LayoutDashboard,
    match: (path: string) => path === "/admin",
  },
  {
    href: "/admin/storybook-generator",
    label: "Storybook Generator",
    shortLabel: "Generator",
    icon: Sparkles,
    match: (path: string) => path.startsWith("/admin/storybook-generator"),
  },
  {
    href: "/business-plan",
    label: "Business Plan",
    shortLabel: "Plan",
    icon: ClipboardList,
    // One nav item — Phases / Costs / Proforma / IP live inside the plan hub
    match: (path: string) =>
      path === "/business-plan" ||
      path.startsWith("/business-plan/") ||
      path.startsWith("/admin/ip"),
  },
  {
    href: "/admin/books",
    label: "Books Library",
    shortLabel: "Books",
    icon: BookOpen,
    match: (path: string) => path.startsWith("/admin/books"),
  },
  {
    href: "/admin/video-jobs",
    label: "Movie Queue",
    shortLabel: "Movies",
    icon: Film,
    match: (path: string) => path.startsWith("/admin/video-jobs"),
  },
  {
    href: "/admin/story-scripts",
    label: "Story Scripts",
    shortLabel: "Scripts",
    icon: BookOpen,
    match: (path: string) => path.startsWith("/admin/story-scripts"),
  },
] as const;

function isAdminUnlocked(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Sub-navigation under the main header for unlocked staff (code 3121).
 */
export function AdminNav() {
  const pathname = usePathname();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const sync = () => setUnlocked(isAdminUnlocked());
    sync();
    window.addEventListener(ADMIN_UNLOCK_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ADMIN_UNLOCK_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--admin-nav-height",
      unlocked ? "3rem" : "0px"
    );
    return () => {
      document.documentElement.style.setProperty("--admin-nav-height", "0px");
    };
  }, [unlocked]);

  if (!unlocked) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[55] border-b-2 border-royal-gold/70 bg-[#1a1230] shadow-[0_4px_18px_rgba(0,0,0,0.35)] top-[calc(var(--promo-bar-height,0px)+var(--navbar-height,6rem))] lg:top-[calc(var(--promo-bar-height,0px)+var(--navbar-height-lg,7rem))]"
      role="navigation"
      aria-label="Admin"
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-12 items-stretch gap-1 sm:gap-1.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 self-center mr-1 sm:mr-2 rounded-sm bg-royal-gold px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] uppercase text-royal-blue">
            Admin
          </span>
          {ADMIN_LINKS.map((link) => {
            const active = link.match(pathname);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={cn(
                  "shrink-0 inline-flex h-12 items-center gap-1 sm:gap-1.5 rounded-md px-2.5 sm:px-3 text-xs sm:text-sm font-semibold transition-colors",
                  active
                    ? "bg-royal-gold text-royal-blue shadow-sm"
                    : "text-royal-cream hover:bg-royal-gold/15 hover:text-royal-gold"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">{link.shortLabel}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
