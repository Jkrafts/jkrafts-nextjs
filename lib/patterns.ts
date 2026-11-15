/**
 * Generated project patterns, seeded by the project id.
 *
 * Every family is drawn on the same grid of 28px tiles and repeats as a
 * 336px block, so all of them share a rhythm while looking distinct:
 *
 * - "maze": one diagonal per tile (Truchet), a structured maze.
 * - "arcs": two quarter circles per tile (Smith Truchet), an organic labyrinth.
 * - "circuit": orthogonal traces between tile centres, ending in pad rings.
 * - "triangles": a filled half-tile in one of four orientations.
 * - "plots": a field of dots, rings and plus marks.
 *
 * Seamless repeats: Truchet motifs end exactly on tile edges, so any
 * arrangement joins up; circuit connections wrap around the block (the
 * right edge of the last column connects to the first column), so traces
 * continue across repeats; triangles and plots stay inside their tile.
 *
 * Legibility: the lines are a *darker* shade of the accent. White text on a
 * darker pixel always has more contrast than on the accent itself, so every
 * pixel behind text keeps at least the accent's contrast with white (each
 * accent passes AA). Lighter lines can't do that: even 15% lighter drops
 * three of the five accents below 4.5:1. The shade is solved per accent so
 * the lines differ from the background by the same contrast everywhere,
 * which makes the pattern equally quiet on every project.
 *
 * No imports, so the e2e suite can check these numbers directly.
 */

export type PatternVariant = 'maze' | 'arcs' | 'circuit' | 'triangles' | 'plots';

export const PATTERN_VARIANTS: PatternVariant[] = ['maze', 'arcs', 'circuit', 'triangles', 'plots'];

const INK = '#0d0b22';

/**
 * Contrast between the pattern and its background, per family: visible but
 * far below text. Filled shapes cover much more area than thin lines, so
 * they get a lighter touch to carry the same visual weight.
 */
export const PATTERN_CONTRAST: Record<PatternVariant, number> = {
  maze: 1.45,
  arcs: 1.45,
  circuit: 1.45,
  plots: 1.5,
  triangles: 1.18,
};

const TILE = 28;
const BLOCK = 12; // tiles per side of the repeating block (336px)

/* ---------------------------------------------------------------------------
   Colour
   --------------------------------------------------------------------------- */

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const linear = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex: string) {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function mix(from: string, to: string, t: number) {
  const a = channels(from);
  const b = channels(to);
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** The darker shade of `accent` whose contrast with it is `target`. */
export function lineColour(accent: string, target: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2;
    if (contrast(accent, mix(accent, INK, t)) < target) lo = t;
    else hi = t;
  }
  return mix(accent, INK, hi);
}

/* ---------------------------------------------------------------------------
   Geometry
   --------------------------------------------------------------------------- */

/** Small deterministic PRNG (mulberry32) seeded from a string. */
function random(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Shapes = { stroke: string; fill: string };

const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

/** Every family as `stroke` and `fill` path data for one block. */
const families: Record<PatternVariant, (rand: () => number) => Shapes> = {
  maze(rand) {
    let stroke = '';
    eachTile((x, y) => {
      stroke += rand() < 0.5 ? `M${x} ${y}l${TILE} ${TILE}` : `M${x + TILE} ${y}l${-TILE} ${TILE}`;
    });
    return { stroke, fill: '' };
  },

  arcs(rand) {
    const r = TILE / 2;
    let stroke = '';
    eachTile((x, y) => {
      // Two quarter circles joining edge midpoints, around opposite corners.
      stroke +=
        rand() < 0.5
          ? `M${x + r} ${y}a${r} ${r} 0 0 1 ${-r} ${r}M${x + TILE} ${y + r}a${r} ${r} 0 0 0 ${-r} ${r}`
          : `M${x + r} ${y}a${r} ${r} 0 0 0 ${r} ${r}M${x} ${y + r}a${r} ${r} 0 0 1 ${r} ${r}`;
    });
    return { stroke, fill: '' };
  },

  circuit(rand) {
    // Random links between neighbouring tile centres, wrapping at the block
    // edge. Each tile draws half of every link it has, so neighbours (and
    // neighbouring repeats) meet exactly at the shared edge.
    const right = grid(() => rand() < 0.42);
    const down = grid(() => rand() < 0.42);
    const h = TILE / 2;
    let stroke = '';
    let fill = '';
    eachTile((x, y, row, col) => {
      const cx = x + h;
      const cy = y + h;
      const links = [
        right[row][col] && `M${cx} ${cy}h${h}`,
        right[row][(col + BLOCK - 1) % BLOCK] && `M${cx} ${cy}h${-h}`,
        down[row][col] && `M${cx} ${cy}v${h}`,
        down[(row + BLOCK - 1) % BLOCK][col] && `M${cx} ${cy}v${-h}`,
      ].filter(Boolean) as string[];
      stroke += links.join('');
      // Trace ends get a pad; lone points a via.
      if (links.length === 1) stroke += ring(cx, cy, 5);
      else if (links.length === 0 && rand() < 0.35) fill += ring(cx, cy, 2);
    });
    return { stroke, fill };
  },

  triangles(rand) {
    let fill = '';
    eachTile((x, y) => {
      const t = TILE;
      // Half the tile, cut along a diagonal, in one of four orientations.
      fill += [
        `M${x} ${y}h${t}l${-t} ${t}z`,
        `M${x} ${y}h${t}v${t}z`,
        `M${x + t} ${y}v${t}h${-t}z`,
        `M${x} ${y}l${t} ${t}h${-t}z`,
      ][Math.floor(rand() * 4)];
    });
    return { stroke: '', fill };
  },

  plots(rand) {
    let stroke = '';
    let fill = '';
    eachTile((x, y) => {
      const cx = x + TILE / 2;
      const cy = y + TILE / 2;
      const pick = rand();
      if (pick < 0.55) fill += ring(cx, cy, 2.25);
      else if (pick < 0.78) stroke += `M${cx - 5} ${cy}h10M${cx} ${cy - 5}v10`;
      else if (pick < 0.94) stroke += ring(cx, cy, 6);
      // Otherwise empty: gaps keep the field from reading as a grid.
    });
    return { stroke, fill };
  },
};

function eachTile(draw: (x: number, y: number, row: number, col: number) => void) {
  for (let row = 0; row < BLOCK; row++) {
    for (let col = 0; col < BLOCK; col++) draw(col * TILE, row * TILE, row, col);
  }
}

function grid<T>(make: () => T): T[][] {
  return Array.from({ length: BLOCK }, () => Array.from({ length: BLOCK }, make));
}

export type ProjectPattern = {
  /** CSS `url(...)` for a repeating background. */
  image: string;
  /** Size of one repeat, for `background-size`. */
  size: string;
  /** The pattern's colour: a darker shade of the accent. */
  line: string;
  variant: PatternVariant;
};

/** Minimal escaping for an SVG inside a double-quoted CSS url(): far
    smaller than encodeURIComponent, which escapes every space and digit. */
const encodeSvg = (svg: string) =>
  svg.replace(/"/g, "'").replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E');

const cache = new Map<string, ProjectPattern>();

export function projectPattern(id: string, accent: string, variant: PatternVariant): ProjectPattern {
  const key = `${id}|${accent}|${variant}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { stroke, fill } = families[variant](random(id));
  const size = BLOCK * TILE;
  const line = lineColour(accent, PATTERN_CONTRAST[variant]);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (fill ? `<path d="${fill}" fill="${line}"/>` : '') +
    (stroke
      ? `<path d="${stroke}" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
      : '') +
    `</svg>`;

  const pattern = {
    image: `url("data:image/svg+xml,${encodeSvg(svg)}")`,
    size: `${size}px ${size}px`,
    line,
    variant,
  };
  cache.set(key, pattern);
  return pattern;
}
