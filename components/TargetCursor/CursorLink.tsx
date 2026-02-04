'use client';

import Link, { LinkProps } from 'next/link';
import React, { AnchorHTMLAttributes } from 'react';

type CursorLinkProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

export default function CursorLink({
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: CursorLinkProps) {
  const handleEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    document.body.style.cursor = 'none';
    document.documentElement.classList.add('cursor-active');
    onMouseEnter?.(e);
  };

  const handleLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    document.body.style.cursor = '';
    document.documentElement.classList.remove('cursor-active');
    onMouseLeave?.(e);
  };

  return (
    <Link
      {...props}
      className={`cursor-target ${className ?? ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </Link>
  );
}
CursorLink.displayName = 'CursorLink';