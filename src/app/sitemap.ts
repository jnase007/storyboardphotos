import type { MetadataRoute } from "next";
import { SITE, SITE_PAGES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return SITE_PAGES.map((page) => ({
    url: `${SITE.url}${page.href === "/" ? "" : page.href}`,
    lastModified: now,
    changeFrequency: page.href === "/" || page.href === "/book" ? "weekly" : "monthly",
    priority: page.priority,
  }));
}
