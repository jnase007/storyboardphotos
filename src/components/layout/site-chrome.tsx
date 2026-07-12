"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Hides marketing/admin chrome only on shared storybook viewer routes:
 *   /book/[id]
 * Keeps full site chrome on the public booking page:
 *   /book
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // /book/abc-123 → hide chrome; /book → keep nav
  const isBookViewer = /^\/book\/[^/]+/.test(pathname);

  if (isBookViewer) return null;
  return <>{children}</>;
}
