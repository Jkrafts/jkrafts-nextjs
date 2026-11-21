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
    id: 'liqa',
    title: 'LiQa Bar POS',
    shortTagline: 'Bar tills that keep selling when the internet drops.',
    category: 'System',
    skills: ['Laravel', 'Filament', 'NativePHP', 'Offline sync', 'M-Pesa', 'KRA eTIMS'],
    accentColor: '#4338ca',
    pattern: 'circuit',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'LiQa Bar POS',
        body: 'Point of sale and back office built for how bars actually trade.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'Bars sell by the shot from sealed bottles, hand cash to staff every shift and lose stock quietly. Generic retail tills track none of that, and stop working when the connection does.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'Desktop tills that run locally and sync to the cloud',
          'Stock tracked by the bottle and by the shot',
          'Till sessions with X and Z shift reports',
          'M-Pesa, card and KRA eTIMS tax receipts',
          'Happy-hour pricing and cocktail recipe costing'
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
        body: 'Owners see sales, pour cost and margin for every shift, and the tills keep trading through outages.'
      }
    ]
  },
  {
    id: 'quality-diagnostics',
    title: 'Quality Diagnostics Labs',
    shortTagline: 'A clear, credible website for a Massachusetts diagnostic laboratory.',
    category: 'Website',
    skills: ['Laravel', 'Livewire', 'Filament', 'GSAP', 'Accessibility', 'Technical SEO'],
    accentColor: '#0f766e',
    pattern: 'plots',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Quality Diagnostics Labs',
        body: 'Wellness blood tests and confidential drug screening in North Andover, Massachusetts.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'The old site looked generic and gave patients little reason to trust it. People needed to see what each test costs and how to prepare before they called, and staff needed to update details without a developer.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'Every test and price published, from one source',
          'Online appointment requests, stored and emailed to staff',
          'Contact details and messages managed in a Filament admin',
          'Medical structured data, sitemap and SEO metadata',
          'Accessible pages, cookie consent and privacy and security policies'
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
        body: 'Patients see the test, the price and the preparation up front and can request a visit online, and the lab keeps its own details current.'
      }
    ]
  },
  {
    id: 'servpure',
    title: 'ServPure Water Shop System',
    shortTagline: 'Sales, production and stock for a bottled-water business.',
    category: 'System',
    skills: ['Laravel', 'Filament', 'M-Pesa', 'Inventory', 'Receipt printing'],
    accentColor: '#0369a1',
    pattern: 'triangles',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'ServPure',
        body: 'One system for the counter, the production line and the stock room.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'A water shop sells bottled stock and metered refills, turns bottles and labels into finished products, and needs every litre and every shilling to reconcile at the end of the day.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'POS with refills, held sales and customer pricing',
          'Production runs from raw materials to finished stock',
          'Shop-day sessions with water meter readings',
          'Stock takes, M-Pesa payments and printed receipts',
          'Backfill mode for sales recorded on paper during downtime'
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
        body: 'Sales, stock and water usage reconcile every day, and missed paper sales land on the right date.'
      }
    ]
  },
  {
    id: 'meal-magic',
    title: 'Meal Magic Caterers',
    shortTagline: 'A booking-ready website for a Nairobi catering company.',
    category: 'Website',
    skills: ['Laravel', 'Twill CMS', 'Tailwind CSS', 'Alpine.js', 'SEO'],
    accentColor: '#c2410c',
    pattern: 'plots',
    slides: [
      {
        id: 'cover',
        type: 'cover',
        title: 'Meal Magic',
        body: 'Catering for corporate functions, weddings and celebrations across Kenya.'
      },
      {
        id: 'problem',
        type: 'challenge',
        title: 'The challenge',
        body: 'Great food and strong event photography, but a slow, dated site whose booking forms could fail and that the team found hard to update.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The craft',
        bullets: [
          'Services, sample menus and event galleries',
          'Online booking and contact forms with email alerts',
          'Everything editable from the Twill CMS',
          'Optimised images, sitemap and structured data',
          'Accessible forms, FAQs and legal pages'
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
        body: 'Clients can browse menus and past events and request a booking in minutes, and the team runs the site without a developer.'
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
