/**
 * Copy for the home page sections (app/(smooth)/page.tsx).
 *
 * FILLER CONTENT: the testimonials, the results figures attached to them and
 * the FAQ answers (timelines, prices, terms) are stand-ins written to show
 * the shape of each section. Replace them with real quotes, real figures and
 * your actual terms before launch. Testimonial attributions are bracketed so
 * a filler quote can't be mistaken for a real one.
 */

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  /** The measurable change the client saw, shown beside the quote. */
  result: { figure: string; label: string };
  /** Project in data/projects.ts this quote is about. */
  projectId: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'Matching sales, stock and meter readings used to take days at the end of every month. Now it all reconciles before we lock up each night.',
    name: 'Rhoda',
    role: 'Inventory Manager, Servpure',
    result: { figure: '2 days', label: 'of admin saved every month' },
    projectId: 'servpure',
  },
  {
    quote:
      'The internet drops out here every week. The tills don’t care any more, and the evening reconciliation finally adds up.',
    name: 'Simon',
    role: 'Sales Associate, Minet Bar',
    result: { figure: '0', label: 'sales lost to outages since launch' },
    projectId: 'liqa',
  },
  {
    quote:
      'For the first time our website brings in enquiries instead of just sitting there. People mention it on calls.',
    name: 'James',
    role: 'Marketing, Meal Magic',
    result: { figure: '3×', label: 'more enquiries from the website' },
    projectId: 'meal-magic',
  },
];

/** What the visitor is dealing with today. */
export const pains = [
  {
    title: 'Your website looks older than your business',
    body: 'Prospects judge you in seconds. A dated, slow site quietly tells them to try someone else.',
  },
  {
    title: 'Visitors arrive and leave without a word',
    body: 'Traffic comes in, but there’s no clear next step, so the enquiries you paid for never happen.',
  },
  {
    title: 'Your team runs the business on spreadsheets',
    body: 'Copying orders, chasing invoices and fixing typos takes hours that should go to customers.',
  },
  {
    title: 'The last developer went quiet',
    body: 'Deadlines slipped, nobody can change anything, and you’re left holding code you can’t trust.',
  },
];

export type FeatureFigure = 'brand' | 'speed' | 'enquiry' | 'automation' | 'secure' | 'grow';

export const features: { title: string; benefit: string; figure: FeatureFigure }[] = [
  {
    title: 'Designed around your brand',
    benefit: 'Visitors remember you, not a theme they’ve already seen ten times this week.',
    figure: 'brand',
  },
  {
    title: 'Fast on any phone or connection',
    benefit: 'Pages appear before people lose patience, so they stay, read and get in touch.',
    figure: 'speed',
  },
  {
    title: 'Every page leads somewhere',
    benefit: 'Clear calls to action and short forms turn a visit into a conversation with you.',
    figure: 'enquiry',
  },
  {
    title: 'The busywork, automated',
    benefit: 'Orders, invoices and reports move between systems by themselves. Your team gets its hours back.',
    figure: 'automation',
  },
  {
    title: 'Secure and dependable',
    benefit: 'Roles, backups and monitoring, so problems are caught before your customers notice them.',
    figure: 'secure',
  },
  {
    title: 'Ready to grow with you',
    benefit: 'Add pages, features and users later without starting again or paying for a rebuild.',
    figure: 'grow',
  },
];

/** How a project runs, start to finish. */
export const steps = [
  {
    title: 'Tell me what you need',
    body: 'A free 30-minute call about your goals, your customers and what isn’t working today.',
  },
  {
    title: 'Get a clear plan and price',
    body: 'Within two working days: the scope, the price and a launch date, in writing.',
  },
  {
    title: 'Watch it take shape',
    body: 'Design and build in short rounds, with a live preview link you can check and comment on every week.',
  },
  {
    title: 'Launch, then keep improving',
    body: 'I handle the launch and stay on for support, fixes and new features as you grow.',
  },
];

export const faqs = [
  {
    q: 'How much does a project cost?',
    a: 'Every project is different, so there’s no one-size-fits-all price. Once I understand your goals, your users and what has to be built, I work out exactly what’s involved and quote for that. You get a competitive rate, a clear breakdown of what it covers, and quality that’s built in, not added on.',
  },
  {
    q: 'How long will it take?',
    a: 'Most websites launch in 4 to 6 weeks, and larger systems in 8 to 12. You get a launch date with your quote and weekly previews along the way.',
  },
  {
    q: 'Who will I be working with?',
    a: 'Me, directly. There are no account managers in between, so the person you explain the problem to is the person who builds the solution.',
  },
  {
    q: 'I already have a website. Can you improve it instead of starting over?',
    a: 'Often, yes. I start by reviewing what you have and tell you honestly whether a redesign, a rebuild or a few targeted fixes will get you further.',
  },
  {
    q: 'Will I be able to update the content myself?',
    a: 'Yes. Content you change often, like pages, products and posts, is editable from a simple admin panel, and you get a short walkthrough at launch.',
  },
  {
    q: 'Who owns the site and the code?',
    a: 'You do. Once the project is paid, the code, the designs and the accounts are yours, and everything is documented so any developer could pick it up.',
  },
  {
    q: 'What happens after launch?',
    a: 'You get [30] days of free fixes, then optional monthly support for updates, monitoring and new features. You’re never locked in.',
  },
];
