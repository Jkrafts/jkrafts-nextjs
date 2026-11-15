import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LenisProvider } from "@/providers/LenisProvider";
import PageTransition from "@/components/PageTransition";

export default function SmoothLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <Navbar />
      {children}
      <Footer />
      {/* After the page, so it completes once the new route's effects ran. */}
      <PageTransition />
    </LenisProvider>
  );
}
