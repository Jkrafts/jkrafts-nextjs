type SlideType =
  | 'challenge'
  | 'craft'
  | 'process'
  | 'result'
  | 'cover'
  | 'meta';

export type ProjectSlide = {
  id: string;
  type: SlideType;
  title?: string;
  body?: string;
  accentColor?: string;
  index?: number;
  skills?: string[];
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
  cover: {
    type: 'image' | 'video';
    src: string;
  };
  skills: string[];
  accentColor: string;
  icon?: string;
  slides: ProjectSlide[];
};

export const projects: ProjectStory[] = [
  {
    id: 'saas-dashboard',
    title: 'Subscription Management SaaS',
    shortTagline: 'A clean dashboard for managing plans and payments.',
    category: 'SaaS',
    cover: {
      type: 'video',
      src: '/projects/saas/cover.mp4'
    },
    skills: ['Laravel', 'Stripe', 'Filament', 'SaaS Architecture'],
    accentColor: '#16a34a',
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
        title: 'The Challenge',
        body: 'Managing subscriptions, billing, and roles in one unified platform.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The Craft',
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
        title: 'The Process',
        media: {
          type: 'image',
          src: '/projects/saas/ui.jpg'
        }
      },
      {
        id: 'result',
        type: 'result',
        title: 'The Result',
        body: 'Streamlined billing operations and reduced manual overhead.'
      }
    ]
  },
  {
    id: 'pos-system',
    title: 'Offline POS System',
    shortTagline: 'Fast, reliable sales even without internet.',
    category: 'System',
    cover: {
      type: 'image',
      src: '/projects/pos/cover.jpg'
    },
    skills: ['Laravel', 'Offline-first', 'Thermal Printing', 'Performance'],
    accentColor: '#4f46e5',
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
        title: 'The Challenge',
        body: 'The business needed a POS system that works reliably even when connectivity is unstable.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The Craft',
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
        title: 'Process',
        media: {
          type: 'image',
          src: '/projects/pos/wireframes.jpg'
        }
      },
      {
        id: 'result',
        type: 'result',
        title: 'Result',
        body: 'Reduced checkout time and improved reliability during peak hours.'
      }
    ]
  },
  {
    id: 'business-site',
    title: 'Corporate Website',
    shortTagline: 'A modern online presence for a growing brand.',
    category: 'Website',
    cover: {
      type: 'image',
      src: '/projects/business/cover.jpg'
    },
    skills: ['Twill CMS', 'Laravel', 'UI Design', 'Performance'],
    accentColor: '#0ea5e9',
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
        title: 'The Challenge',
        body: 'Create a professional, fast, and easy-to-manage website.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The Craft',
        bullets: [
          'Custom WordPress theme',
          'SEO-friendly structure',
          'Responsive UI'
        ]
      },
      {
        id: 'process',
        type: 'process',
        title: 'The Process',
        media: {
          type: 'image',
          src: '/projects/business/mockups.jpg'
        }
      },
      {
        id: 'result',
        type: 'result',
        title: 'The Result',
        body: 'Improved brand credibility and online reach.'
      }
    ]
  },
  {
    id: 'admin-tool',
    title: 'Internal Admin Tool',
    shortTagline: 'Tools that make internal operations effortless.',
    category: 'Web App',
    cover: {
      type: 'image',
      src: '/projects/admin/cover.jpg'
    },
    skills: ['Laravel', 'APIs', 'Automation'],
    accentColor: '#f97316',
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
        title: 'The Challenge',
        body: 'Manual processes slowed down daily operations.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The Craft',
        bullets: [
          'API-driven design',
          'Automation workflows',
          'Secure access control'
        ]
      },
      {
        id: 'process',
        type: 'process',
        title: 'The Process',
        media: {
          type: 'image',
          src: '/projects/admin/flows.jpg'
        }
      },
      {
        id: 'result',
        type: 'result',
        title: 'The Result',
        body: 'Saved time and reduced human error.'
      }
    ]
  },
  {
    id: 'interactive-ui',
    title: 'Interactive Web Experience',
    shortTagline: 'Motion-driven UI experiments.',
    category: 'Web App',
    cover: {
      type: 'video',
      src: '/projects/interactive/cover.mp4'
    },
    skills: ['GSAP', 'Three.js', 'UI Engineering'],
    accentColor: '#a855f7',
    icon: 'store-front',
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
        title: 'The Challenge',
        body: 'Exploring how motion enhances usability and delight.'
      },
      {
        id: 'craft',
        type: 'craft',
        title: 'The Craft',
        bullets: [
          'GSAP animations',
          'WebGL experiments',
          'Component-driven UI'
        ]
      },
      {
        id: 'process',
        type: 'process',
        title: 'The Process',
        media: {
          type: 'video',
          src: '/projects/interactive/demo.mp4'
        }
      },
      {
        id: 'result',
        type: 'result',
        title: 'The Result',
        body: 'A playful but performant experimental build.'
      }
    ]
  }
]
