import { SITE, SITE_PAGES } from "@/lib/constants";

export default function sitemap() {
  return SITE_PAGES.map((page) => ({
    url: `${SITE.url}${page.href === "/" ? "" : page.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: page.priority,
  }));
}
