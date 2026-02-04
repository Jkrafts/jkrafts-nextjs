'use client';

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

import StaggeredMenu from "./StaggeredMenu";

const Navbar = () => {

  const navRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {

    const ctx = gsap.context(() => { 

      const nav = navRef.current;
      if (!nav) return;

      const header = nav.querySelector('.staggered-menu-header') as HTMLElement;
      if (!header) return;

      // Ensure the border exists but starts transparent
      nav.style.border = "0px solid";
      nav.style.borderColor = "transparent";
      nav.style.boxSizing = "border-box";

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: nav,
          start: "top top",
          end: "+=100",
          scrub: true,
        },
      });

      
      // Shrink the header & container
      // NOTE: This only affects the nav container, not the menu panel
      // The menu panel is now positioned fixed to viewport
      tl.to(nav, {
        // height: "50px",
        // padding: "0 1rem",
        // width: "1200px",
        // top: "32px",
        // left: "50%",
        // x: "-50%",
        // borderWidth: "1px",
        // borderRadius: "8px",
        ease: "power1.out",
      }, 0);

      tl.to(header, {
        // padding: "0.6em",
        ease: "power1.out",
      }, 0);

      // Animate border color only near the end
      tl.to(nav, {
        borderColor: "#000", // visible color
        duration: 0.1,       // very short fade-in
        ease: "none",
        onComplete: () => nav.classList.add('shadow-lg'),
        onReverseComplete: () => nav.classList.remove('shadow-lg')
      }, 0.70); // start at 70% of the timeline

    }, navRef);

    return () => ctx.revert()
    
  }, []);

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