import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PromoBar } from "@/components/promo-bar";
import { Navbar } from "@/components/layout/navbar";
import { AdminNav } from "@/components/layout/admin-nav";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { CursorSparkles } from "@/components/cursor-sparkles";
import { SITE } from "@/lib/constants";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url
  ),
  title: {
    default: `${SITE.name} | ${SITE.subtitle} — Kingdom Photo Studio in Costa Mesa`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "storybook photos",
    "storybookphotos.com",
    "kingdom quests",
    "kings and queens photos",
    "children photography Costa Mesa",
    "Kingdom Chronicles",
    "royal photo shoot",
    "fantasy photo studio",
    "self esteem for kids",
    "Kingdom Chronicles",
    "family photography Orange County",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: `${SITE.name} | ${SITE.subtitle}`,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: "/hero-kingdom.jpg",
        width: 1024,
        height: 744,
        alt: `${SITE.name} — Remind Your Child They Are Royalty`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/hero-kingdom.jpg"],
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
    icon: "/favicon.svg",
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
        <PromoBar />
        <Navbar />
        <AdminNav />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
        <CursorSparkles />
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
