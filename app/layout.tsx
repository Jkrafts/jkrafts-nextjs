import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import ThemeProvider from "@/src/theme-provider";
import TargetCursor from "@/components/TargetCursor";
import Analytics from "@/components/Analytics";
import CookieBanner from "@/components/CookieBanner";
import { siteConfig } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jkrafts | Websites and business systems, built properly",
    template: "%s | Jkrafts",
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f3f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0b22" },
  ],
};

// One variable family carries the whole identity. Archivo's width axis
// (wdth 62–125) lets display headings run condensed and tight while body
// copy stays at normal width. next/font self-hosts the files, so visitors'
// browsers never request anything from Google Fonts.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

// Runs before first paint: lets CSS hide elements that GSAP will animate in,
// without hiding them for visitors who have JavaScript disabled.
const jsFlag = `document.documentElement.classList.add('js')`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={archivo.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      {/* Analytics loads only after consent (components/Analytics.tsx). */}
      <Analytics />
      <body className="overflow-x-clip">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TargetCursor />
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
