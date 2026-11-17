import type { FeatureFigure as Kind } from "@/data/home";

/**
 * Small line drawings for the feature list. They use the ink colour with
 * one violet highlight per drawing (the thing the benefit is about), and are
 * decorative: the feature's text carries the meaning.
 */
export default function FeatureFigure({ kind }: { kind: Kind }) {
  return (
    <svg
      viewBox="0 0 120 90"
      className="feature-figure"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {figures[kind]}
    </svg>
  );
}

const hi = "var(--violet)";

const figures: Record<Kind, React.ReactNode> = {
  // A brand sheet: type specimen and swatches.
  brand: (
    <>
      <rect x="6" y="8" width="108" height="74" />
      <text x="16" y="56" fill="currentColor" stroke="none" fontSize="38" fontWeight="600" letterSpacing="-2">
        Aa
      </text>
      <rect x="74" y="20" width="14" height="14" fill={hi} stroke="none" />
      <rect x="90" y="20" width="14" height="14" fill="currentColor" stroke="none" />
      <rect x="74" y="36" width="14" height="14" />
      <rect x="90" y="36" width="14" height="14" fill="var(--lilac)" stroke="none" />
      <path d="M16 70h50M74 70h30" />
    </>
  ),
  // A page loading: the content is already there, the bar nearly done.
  speed: (
    <>
      <rect x="6" y="8" width="108" height="74" />
      <path d="M6 20h108" />
      <path d="M6 20h96" stroke={hi} strokeWidth="3" />
      <rect x="16" y="30" width="40" height="26" />
      <path d="M64 34h40M64 42h34M64 50h38M16 66h88M16 74h60" />
    </>
  ),
  // A pointer on the one button the page leads to.
  enquiry: (
    <>
      <path d="M14 18h70M14 28h56M14 38h64" />
      <rect x="14" y="50" width="50" height="18" fill={hi} stroke="none" />
      <path d="M72 58l14 26 4-11 11-4z" fill="var(--paper)" />
    </>
  ),
  // Two systems passing data along on their own.
  automation: (
    <>
      <rect x="6" y="22" width="34" height="46" />
      <rect x="80" y="22" width="34" height="46" />
      <path d="M12 34h22M12 42h22M12 50h16M86 34h22M86 42h22M86 50h16" />
      <path d="M44 45h32" strokeDasharray="4 4" />
      <path d="M70 39l6 6-6 6" stroke={hi} strokeWidth="2" />
      <circle cx="58" cy="45" r="4" fill={hi} stroke="none" />
    </>
  ),
  // A shield with a check.
  secure: (
    <>
      <path d="M60 8l34 12v22c0 20-14 34-34 40C40 76 26 62 26 42V20z" />
      <path d="M45 44l10 10 20-20" stroke={hi} strokeWidth="3" />
    </>
  ),
  // Blocks stacking; the newest one highlighted.
  grow: (
    <>
      <rect x="10" y="62" width="30" height="20" />
      <rect x="44" y="62" width="30" height="20" />
      <rect x="78" y="62" width="30" height="20" />
      <rect x="27" y="38" width="30" height="20" />
      <rect x="61" y="38" width="30" height="20" />
      <rect x="44" y="14" width="30" height="20" fill={hi} stroke="none" />
    </>
  ),
};
