import type { Metadata } from "next";
import { Inter, Manrope, Instrument_Serif, Space_Grotesk } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google'
import ThemeProvider from "@/src/theme-provider";
import TargetCursor from "@/components/TargetCursor";

import "./globals.css";

export const metadata: Metadata = {
  title: "Jkrafts",
  description: "Crafting Digital Solutions.",
};

const interFont = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter", 
  fallback: ["sans-serif"],
});

const manropeFont = Manrope({ 
  subsets: ["latin"], 
  variable: "--font-manrope",
  fallback: ["sans-serif"],
});

const instrumentSerifFont = Instrument_Serif({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-instrument-serif",
  fallback: ["serif"]
});

const spaceGroteskFont = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk",
  fallback: ["serif"]
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${interFont.variable} ${manropeFont.variable} ${instrumentSerifFont.variable} ${spaceGroteskFont.variable}`}>
      <GoogleTagManager gtmId="GTM-PXL6NLM5" />
      <body className="antialiased container_ pattern-dotted overflow-x-clip">
        
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <TargetCursor
            spinDuration={2}
            parallaxOn
            hoverDuration={0.2}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
