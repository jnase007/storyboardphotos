import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PromoBar } from "@/components/promo-bar";
import { Navbar } from "@/components/layout/navbar";
import { AdminNav } from "@/components/layout/admin-nav";
import { Footer } from "@/components/layout/footer";
import { SiteChrome } from "@/components/layout/site-chrome";
import { CookieConsent } from "@/components/cookie-consent";
import { CursorSparkles } from "@/components/cursor-sparkles";
import { SITE, SEO_KEYWORDS } from "@/lib/constants";
import { StructuredData } from "@/components/structured-data";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.subtitle} — Kingdom Photo Studio in Costa Mesa`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SEO_KEYWORDS],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Photography",
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: `${SITE.url}/og-image.jpg`,
        width: 1024,
        height: 744,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [`${SITE.url}/og-image.jpg`],
  },
  robots: {
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
  alternates: {
    canonical: SITE.url,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
  },
  other: {
    "geo.region": "US-CA",
    "geo.placename": "Costa Mesa",
    "geo.position": "33.6846;-117.8865",
    ICBM: "33.6846, -117.8865",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <StructuredData />
        <SiteChrome>
          <PromoBar />
          <Navbar />
          <AdminNav />
        </SiteChrome>
        <main>{children}</main>
        <SiteChrome>
          <Footer />
          <CookieConsent />
          <CursorSparkles />
        </SiteChrome>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "#1E3352",
              color: "#FFFBF5",
              border: "1px solid rgba(212, 176, 122, 0.35)",
            },
          }}
        />
      </body>
    </html>
  );
}
