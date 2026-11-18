import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import ThemeProvider from "@/src/theme-provider";
import TargetCursor from "@/components/TargetCursor";
import Analytics from "@/components/Analytics";
import CookieBanner from "@/components/CookieBanner";
import { SITE_URL, isIndexable, siteConfig } from "@/lib/seo";

import "./globals.css";

// Site-wide defaults. Each page sets its own complete metadata with
// pageMetadata() (lib/seo), including its canonical URL.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jkrafts | Websites and business systems, built properly",
    template: "%s | Jkrafts",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // Only production deploys may be indexed (see isIndexable).
  robots: isIndexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
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
