'use client';

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SnapLayout({ children,}: {children: React.ReactNode}) {

  useEffect(() => {
    document.documentElement.dataset.layout = 'snap';
    return () => {
      delete document.documentElement.dataset.layout;
    };
  }, []);

  return (
      <>
        {/* <Navbar /> */}
        <div className="snap-root">
          {children}
        <Footer />
        </div>
      </>
  )
}