'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';

type IconProps = {
  name: string;          // dynamic part: {icon}-white.png / {icon}-black.png
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
};

export default function Icon({
  name,
  alt = '',
  size = 24,
  className,
  priority = false,
}: IconProps) {
  const { theme, resolvedTheme } = useTheme();

  /**
   * resolvedTheme handles:
   * - "system"
   * - hydration mismatch
   */
  const currentTheme = resolvedTheme ?? theme;

  /**
   * Contrast logic:
   * - light mode → black icon
   * - dark mode → white icon
   */
  const iconVariant = currentTheme === 'dark' ? 'white' : 'black';

  const src = `/${name}-${iconVariant}.png`;

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block select-none ${className ?? ''}`}
      priority={priority}
      draggable="false"
    />
  );
}
