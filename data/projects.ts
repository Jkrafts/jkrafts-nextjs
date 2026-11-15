import { PATTERN_VARIANTS, projectPattern, type PatternVariant, type ProjectPattern } from '../lib/patterns';

type SlideType =
  | 'challenge'
  | 'craft'
  | 'process'
  | 'result'
  | 'cover';

export type ProjectSlide = {
  id: string;
  type: SlideType;
  title?: string;
  body?: string;
  media?: {
    type: 'image' | 'video';
    src: string;
  };
  bullets?: string[];
};

export type ProjectStory = {
  id: string;
  title: string;
  shortTagline: string;
  category: 'Website' | 'Web App' | 'SaaS' | 'System';
  skills: string[];
  accentColor: string;
  /** Pattern family (lib/patterns.ts). Optional: one is picked from the id. */
  pattern?: PatternVariant;
  slides: ProjectSlide[];
};

// Projects have no photography yet, so each one carries a monogram built
// from data every project already has (its unique title).
export const getInitials = (title: string): string =>
  title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

// Without an explicit family, a project gets one picked from its id, so it
// stays stable but new projects don't all share a look.
const defaultVariant = (id: string): PatternVariant => {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PATTERN_VARIANTS[h % PATTERN_VARIANTS.length];
};

export const getPattern = (project: ProjectStory): ProjectPattern =>
  projectPattern(project.id, project.accentColor, project.pattern ?? defaultVariant(project.id));

/** CSS custom properties that paint a project's pattern (see globals.css). */
export const patternStyle = (project: ProjectStory) => {
  const p = getPattern(project);
  return { '--pattern': p.image, '--pattern-size': p.size } as Record<string, string>;
};

export const projects: ProjectStory[] = [
  {
    id: 'saas-dashboard',
    title: 'Subscription Management SaaS',
    shortTagline: 'A clean dashboard for managing plans and payments.',
    category: 'SaaS',
    skills: ['Laravel', 'Stripe', 'Filament', 'SaaS Architecture'],
    accentColor: '#15803d',
    pattern: 'maze',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Subscription SaaS',
        body: 'Designed to scale with growing businesses.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'Managing subscriptions, billing, and roles in one unified platform.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'Multi-tenant architecture',
          'Stripe integration',
          'Admin & client panels',
          'Secure role permissions'
        ]
      },
      {
        id: 'process',
        type: 'process',
        title: 'Built with'
      },
      {
        id: 'result',
        type: 'result',
        title: 'The result',
        body: 'Streamlined billing operations and reduced manual overhead.'
      }
    ]
  },
  {
    id: 'pos-system',
    title: 'Offline POS System',
    shortTagline: 'Fast, reliable sales even without internet.',
    category: 'System',
    skills: ['Laravel', 'Offline-first', 'Thermal Printing', 'Performance'],
    accentColor: '#4338ca',
    pattern: 'circuit',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Offline POS System',
        body: 'Designed for real-world retail environments.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'The business needed a POS system that works reliably even when connectivity is unstable.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'Laravel backend architecture',
          'Offline-first sync logic',
          'Role-based access',
          'Thermal receipt printing'
        ]
      },
      {
        id: 'process',
        type: 'process',
        title: 'Built with'
      },
      {
        id: 'result',
        type: 'result',
        title: 'The result',
        body: 'Reduced checkout time and improved reliability during peak hours.'
      }
    ]
  },
  {
    id: 'business-site',
    title: 'Corporate Website',
    shortTagline: 'A modern online presence for a growing brand.',
    category: 'Website',
    skills: ['Twill CMS', 'Laravel', 'UI Design', 'Performance'],
    accentColor: '#0369a1',
    pattern: 'triangles',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Corporate Website',
        body: 'Showcasing the brand with a professional online presence.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'Create a professional, fast, and easy-to-manage website.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'Custom WordPress theme',
          'SEO-friendly structure',
          'Responsive UI'
        ]
      },
      {
        id: 'process',
        type: 'process',
        title: 'Built with'
      },
      {
        id: 'result',
        type: 'result',
        title: 'The result',
        body: 'Improved brand credibility and online reach.'
      }
    ]
  },
  {
    id: 'admin-tool',
    title: 'Internal Admin Tool',
    shortTagline: 'Tools that make internal operations effortless.',
    category: 'Web App',
    skills: ['Laravel', 'APIs', 'Automation'],
    accentColor: '#c2410c',
    pattern: 'plots',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Internal Admin Tool',
        body: 'Streamlining internal operations with custom tools.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'Manual processes slowed down daily operations.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'API-driven design',
          'Automation workflows',
          'Secure access control'
        ]
      },
      {
        id: 'process',
        type: 'process',
        title: 'Built with'
      },
      {
        id: 'result',
        type: 'result',
        title: 'The result',
        body: 'Saved time and reduced human error.'
      }
    ]
  },
  {
    id: 'interactive-ui',
    title: 'Interactive Web Experience',
    shortTagline: 'Motion-driven UI experiments.',
    category: 'Web App',
    skills: ['GSAP', 'Three.js', 'UI Engineering'],
    accentColor: '#7e22ce',
    pattern: 'arcs',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Interactive Web Experience',
        body: 'Bringing delight through motion and interactivity.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'Exploring how motion enhances usability and delight.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'GSAP animations',
          'WebGL experiments',
          'Component-driven UI'
        ]
      },
      {
        id: 'process',
        type: 'process',
        title: 'The process',
        media: {
          type: 'video',
          src: '/projects/interactive/demo.mp4'
        }
      },
      {
        id: 'result',
        type: 'result',
        title: 'The result',
        body: 'A playful but performant experimental build.'
      }
    ]
  }
]
