"use client";

import { useTheme } from "next-themes";
import Icon from "./Icon";

/**
 * Both icons are always rendered and swapped with CSS (`dark:`), so the
 * server and client markup match regardless of the stored theme.
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
      aria-label="Toggle theme"
      title="Switch between light and dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Icon name="moon" size={20} className="dark:hidden" />
      <Icon name="sun" size={20} className="hidden dark:block" />
    </button>
  );
}
