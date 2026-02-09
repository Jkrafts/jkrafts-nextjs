import Link from 'next/link'

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CursorLink from '@/components/TargetCursor/CursorLink';

const NotFound = () => {
  return (
    <>
      <Navbar />

      <div className='min-h-screen flex gap-12 flex-col justify-center items-center'>
        <h2 className='text-5xl font-heading'>Not Found</h2>
        
        <p className="font-body text-2xl">Could not find requested resource</p>
        <CursorLink href="/" className="cta">Return Home</CursorLink>
      </div>

      <Footer />
    </>
  );
}

export default NotFound;