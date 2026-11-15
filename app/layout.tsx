import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import ThemeProvider from "@/src/theme-provider";
import TargetCursor from "@/components/TargetCursor";
import { siteConfig } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jkrafts — Websites and web systems, crafted to last",
    template: "%s — Jkrafts",
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
    { media: "(prefers-color-scheme: light)", color: "#f1f0f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0b22" },
  ],
};

// One variable family carries the whole identity. The width (wdth) and
// optical size (opsz) axes let display headings run narrow and tight while
// body copy stays at full width.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
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
    <html lang="en" suppressHydrationWarning className={bricolage.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      {/*
        GTM-* is a Tag Manager container id; G-* is a GA4 Measurement id.
        Mounting <GoogleTagManager> twice produced two elements with the same
        id (`_next-gtm`), so the GA4 id uses <GoogleAnalytics> instead.
      */}
      <GoogleTagManager gtmId="GTM-PXL6NLM5" />
      <GoogleAnalytics gaId="G-8YGCX4RECJ" />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
