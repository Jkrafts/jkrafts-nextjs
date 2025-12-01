import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/src/theme-provider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Jkrafts",
  description: "One stop shop for all your web development needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased container_ mx-auto px-4 sm:px-6 lg:px-8 pattern-dotted">
        
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          
        </ThemeProvider>
      </body>
    </html>
  );
}
