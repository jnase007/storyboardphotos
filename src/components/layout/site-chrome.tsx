"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Hides marketing/admin chrome on fullscreen book viewer routes.
 * /book and /book/[id] should be clean share links with no overlapping headers.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBookViewer = pathname === "/book" || pathname.startsWith("/book/");

  if (isBookViewer) return null;
  return <>{children}</>;
}
