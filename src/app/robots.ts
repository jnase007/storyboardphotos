import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/business-plan", "/business-plan/"],
      },
      // AI crawlers — allow public content for AEO citations
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/business-plan", "/business-plan/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/business-plan", "/business-plan/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/business-plan", "/business-plan/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/business-plan", "/business-plan/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/business-plan", "/business-plan/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/business-plan", "/business-plan/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
