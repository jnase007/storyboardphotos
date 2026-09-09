import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

const DISALLOW = [
  "/admin",
  "/admin/",
  "/api/",
  "/business-plan",
  "/business-plan/",
  "/kiosk",
  "/kiosk/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
