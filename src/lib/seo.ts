import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

const DEFAULT_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1024,
  height: 744,
  alt: `${SITE.name} — ${SITE.tagline}`,
} as const;

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  absoluteTitle?: boolean;
};

/** Build consistent page metadata for SEO + AEO surfaces. */
export function buildMetadata({
  title,
  description,
  path = "/",
  keywords,
  image = DEFAULT_OG_IMAGE.url,
  noIndex = false,
  absoluteTitle = false,
}: BuildMetadataInput): Metadata {
  const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const url = `${SITE.url}${normalizedPath}`;
  const ogImage = {
    url: image,
    width: DEFAULT_OG_IMAGE.width,
    height: DEFAULT_OG_IMAGE.height,
    alt: `${title} | ${SITE.name}`,
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE.name,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE.url;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
