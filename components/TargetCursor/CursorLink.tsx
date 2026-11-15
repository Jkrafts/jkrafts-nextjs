import Link, { LinkProps } from 'next/link';
import React, { AnchorHTMLAttributes } from 'react';

type CursorLinkProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

/**
 * Internal navigation link. Wraps next/link (client-side transitions) and
 * tags the element as a target for the custom cursor. Cursor visibility is
 * owned entirely by <TargetCursor>, so this stays a server-safe component
 * with no handlers of its own.
 */
export default function CursorLink({ children, className, ...props }: CursorLinkProps) {
  return (
    <Link {...props} className={`cursor-target ${className ?? ''}`.trim()}>
      {children}
    </Link>
  );
}
