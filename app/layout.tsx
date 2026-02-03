import type { Metadata } from "next";
import { Inter, Manrope, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/src/theme-provider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LenisProvider } from "@/providers/LenisProvider";

export const metadata: Metadata = {
  title: "Jkrafts",
  description: "One stop shop for all your web development needs.",
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
      <body className="antialiased container_ pattern-dotted overflow-x-clip">
        
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
