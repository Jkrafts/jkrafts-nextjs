import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LenisProvider } from "@/providers/LenisProvider";

export default function SmoothLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
     <LenisProvider>
        <Navbar />
        {children}
        <Footer /> 
      </LenisProvider>
  )
}