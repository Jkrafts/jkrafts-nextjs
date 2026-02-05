'use client';

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

import StaggeredMenu from "./StaggeredMenu";

const Navbar = () => {

  const navRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    // { label: 'Services', ariaLabel: 'View our services', link: '/services' }, 
    { label: 'Work', ariaLabel: 'View our projects', link: '/projects' },
    { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
  ];

  const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com/_mfalm3' },
    { label: 'GitHub', link: 'https://github.com/mfalm3' },
    { label: 'LinkedIn', link: 'https://linkedin.com/in/joe-waithaka' }
  ];

  return (
    <StaggeredMenu
      ref={navRef}
      position="right"
      isFixed={true}
      items={menuItems}
      socialItems={socialItems}
      displaySocials={true}
      displayItemNumbering={true}
      menuButtonColor="var(--color-text)"
      openMenuButtonColor="var(--color-text) invert(100%)"
      changeMenuColorOnOpen={true}
      colors={['#B19EEF', '#5227FF']}
      logoUrl="/50.png"
      accentColor="#ff6b6b"
      onMenuOpen={() => console.log('Menu opened')}
      onMenuClose={() => console.log('Menu closed')}
    />
  )
}

export default Navbar