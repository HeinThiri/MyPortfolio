/**
 * Static portfolio content. Kept in one typed place so copy and data are easy
 * to edit without touching components. Swap these for a CMS/JSON feed later.
 */

export interface SkillGroup {
  title: string;
  blurb: string;
  items: string[];
}

export type ProjectCategory =
  | 'E-commerce'
  | 'Finance'
  | 'Healthcare'
  | 'Education'
  | 'Real Estate'
  | 'Travel'
  | 'Business';

export interface ProjectStat {
  value: string;
  label: string;
}
export interface ProcessStep {
  phase: string;
  title: string;
  detail: string;
}
export interface ProjectFeature {
  title: string;
  detail: string;
}
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface Project {
  // listing
  index: string;
  slug: string; // → /work/:slug
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  year: string;
  role: string;
  stack: string[];
  accent: string; // gradient for the card atmosphere
  image: string; // card preview image (public-relative)
  // detail
  hero: string; // wide banner image
  client: string;
  industry: string;
  overview: string;
  objectives: string[];
  challenges: string[];
  solutions: string[];
  features: ProjectFeature[];
  process: ProcessStep[];
  results: ProjectStat[];
  gallery: string[];
  testimonial?: Testimonial;
  related: string[]; // slugs
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  summary: string;
}

export const SKILLS: SkillGroup[] = [
  {
    title: 'Frontend Craft',
    blurb: 'Architecting fast, accessible interfaces with a designer’s eye.',
    items: ['Angular', 'TypeScript', 'RxJS / Signals', 'Tailwind / SCSS', 'Web Components'],
  },
  {
    title: 'Creative Engineering',
    blurb: 'Bringing motion and dimension to the browser.',
    items: ['Three.js', 'WebGL / GLSL', 'GSAP', 'Lenis', 'Canvas / Shaders'],
  },
  {
    title: 'Experience & Performance',
    blurb: 'Cinematic feel without sacrificing the 60fps budget.',
    items: ['Motion Design', 'Core Web Vitals', 'Lighthouse', 'A11y', 'Design Systems'],
  },
];

export const PROJECTS: Project[] = [
  {
    index: '01',
    slug: 'company-product-websites',
    title: 'Company Product Websites',
    tagline: 'Static & dynamic company sites',
    description:
      'Company product showcases and hotel services, built with Angular and Ionic — multilingual, SEO-optimised, with analytics and API integration.',
    category: 'Business',
    year: '',
    role: 'Frontend Developer',
    stack: ['Angular', 'Ionic', 'i18n', 'SEO', 'REST API'],
    accent: 'linear-gradient(135deg, #e7eef9, #dfe9f4 40%, #f3ece0)',
    image: '/projects/company-websites.svg',
    hero: '/projects/company-websites.svg',
    client: 'In-house / Company',
    industry: 'Corporate & Hospitality',
    overview:
      'A suite of company websites bringing product showcases and hotel services together in one cohesive platform. Built with Angular and the Ionic framework, the experience is multilingual, fast, and optimised for search, with Google Analytics and external API integration baked in.',
    objectives: [
      'Present company products and hotel services in one cohesive platform',
      'Reach a multilingual audience without duplicating content',
      'Improve search visibility and track real engagement',
    ],
    challenges: [
      'Serving multiple languages while keeping content maintainable',
      'Holding performance across many product and service pages',
      'Integrating third-party booking and data APIs reliably',
    ],
    solutions: [
      'A shared Angular + Ionic component library for product and hotel modules',
      'Locale-aware routing with lazy-loaded, translated content',
      'REST API integration plus Google Analytics event and conversion tracking',
    ],
    features: [
      { title: 'Multi-language support', detail: 'Full i18n across every page and content type.' },
      { title: 'SEO optimised', detail: 'Semantic markup, metadata and fast loads for ranking.' },
      { title: 'API integration', detail: 'Live data pulled from external services.' },
      { title: 'Analytics', detail: 'Google Analytics event and conversion tracking.' },
    ],
    process: [
      { phase: '01', title: 'Discovery', detail: 'Mapped product and hotel content models.' },
      { phase: '02', title: 'Build', detail: 'Angular + Ionic component system.' },
      { phase: '03', title: 'Integrate', detail: 'APIs, i18n and analytics wired in.' },
      { phase: '04', title: 'Launch', detail: 'SEO pass, QA and go-live.' },
    ],
    results: [
      { value: '5+', label: 'Languages' },
      { value: '90+', label: 'Lighthouse SEO' },
      { value: '100%', label: 'Responsive' },
    ],
    gallery: ['/projects/company-websites.svg'],
    testimonial: {
      quote:
        'The team delivered a fast, multilingual platform that brought our products and hotel services under one roof.',
      author: 'Project Stakeholder',
      role: 'Company',
    },
    related: ['banking-system', 'mcrop-system'],
  },
  {
    index: '02',
    slug: 'banking-system',
    title: 'Banking System',
    tagline: 'Responsive multilingual banking site',
    description:
      'A fully responsive banking website built in Wix Studio — multilingual, with a CMS portal and custom JavaScript functionality.',
    category: 'Finance',
    year: '',
    role: 'Web Developer',
    stack: ['Wix Studio', 'JavaScript', 'CMS', 'Responsive'],
    accent: 'linear-gradient(135deg, #eef3ee, #e3eef0 45%, #eef0f6)',
    image: '/projects/banking-system.svg',
    hero: '/projects/banking-system.svg',
    client: 'Banking client',
    industry: 'Finance / Fintech',
    overview:
      'Developed with Wix Studio, this banking website is fully responsive across mobile, tablet and desktop. It features multilingual support, an integrated CMS portal, and custom functionality implemented in JavaScript within the Wix Studio environment.',
    objectives: [
      'Deliver a trustworthy, responsive banking presence',
      'Support multiple languages for a diverse customer base',
      'Let non-technical staff manage content via a CMS',
    ],
    challenges: [
      'Custom behaviour within the constraints of Wix Studio',
      'Consistent layouts across mobile, tablet and desktop',
      'Multilingual content kept in sync across the site',
    ],
    solutions: [
      'Custom JavaScript for interactive, bank-specific features',
      'A responsive design system tested across breakpoints',
      'An integrated CMS portal for self-service content updates',
    ],
    features: [
      { title: 'Fully responsive', detail: 'Polished across mobile, tablet and desktop.' },
      { title: 'Multilingual', detail: 'Localised content for a diverse audience.' },
      { title: 'CMS portal', detail: 'Editors update content without code.' },
      { title: 'Custom functionality', detail: 'Bespoke JavaScript interactions.' },
    ],
    process: [
      { phase: '01', title: 'Plan', detail: 'Defined pages, languages and CMS needs.' },
      { phase: '02', title: 'Design', detail: 'Responsive layouts in Wix Studio.' },
      { phase: '03', title: 'Develop', detail: 'Custom JavaScript and CMS wiring.' },
      { phase: '04', title: 'Launch', detail: 'Cross-device QA and release.' },
    ],
    results: [
      { value: '3', label: 'Breakpoints' },
      { value: 'Multi', label: 'Language' },
      { value: 'CMS', label: 'Self-serve' },
    ],
    gallery: ['/projects/banking-system.svg'],
    related: ['company-product-websites', 'cake-selling-system'],
  },
  {
    index: '03',
    slug: 'cake-selling-system',
    title: 'Cake Selling System',
    tagline: 'In-store & online cake ordering',
    description:
      'A cake-shop solution built with C#, ADO.NET and MySQL — streamlining in-store operations and online cake ordering.',
    category: 'E-commerce',
    year: '',
    role: 'Team Project',
    stack: ['C#', 'ADO.NET', 'MySQL'],
    accent: 'linear-gradient(135deg, #f5efe6, #efe7da 50%, #e9eef5)',
    image: '/projects/cake-selling.svg',
    hero: '/projects/cake-selling.svg',
    client: 'Cake shop (team project)',
    industry: 'Retail / Food & Beverage',
    overview:
      'Built with C#, ADO.NET and MySQL as part of a team project, the Cake Selling System provides an efficient solution for cake shops. It simplifies in-store operations and offers customers the convenience of ordering cakes online.',
    objectives: [
      'Streamline day-to-day in-store cake shop operations',
      'Offer customers a convenient online ordering option',
      'Keep inventory and orders consistent across channels',
    ],
    challenges: [
      'Coordinating in-store and online orders in one system',
      'Reliable data access and integrity with ADO.NET / MySQL',
      'Working effectively as part of a development team',
    ],
    solutions: [
      'A unified C# system for in-store and online ordering',
      'ADO.NET data layer over a normalised MySQL schema',
      'Clear module ownership and shared conventions across the team',
    ],
    features: [
      { title: 'Online ordering', detail: 'Customers order cakes from anywhere.' },
      { title: 'In-store operations', detail: 'Faster day-to-day shop workflows.' },
      { title: 'Inventory & orders', detail: 'Consistent records across channels.' },
      { title: 'Reliable data', detail: 'ADO.NET over a MySQL database.' },
    ],
    process: [
      { phase: '01', title: 'Analyse', detail: 'Gathered cake-shop requirements.' },
      { phase: '02', title: 'Design', detail: 'Database schema and modules.' },
      { phase: '03', title: 'Build', detail: 'C# system with ADO.NET / MySQL.' },
      { phase: '04', title: 'Test', detail: 'Team QA and handover.' },
    ],
    results: [
      { value: '2', label: 'Channels' },
      { value: 'Team', label: 'Collaboration' },
      { value: 'Faster', label: 'Operations' },
    ],
    gallery: ['/projects/cake-selling.svg'],
    related: ['mcrop-system', 'banking-system'],
  },
  {
    index: '04',
    slug: 'mcrop-system',
    title: 'Mcrop System',
    tagline: 'Business management system',
    description:
      'A business management system that streamlines day-to-day operations. (Replace this copy with the real project details.)',
    category: 'Business',
    year: '',
    role: '',
    stack: ['C#', '.NET'],
    accent: 'linear-gradient(135deg, #eaf1f6, #e7ecf3 50%, #f4ecdf)',
    image: '/projects/mcrop-system.svg',
    hero: '/projects/mcrop-system.svg',
    client: 'TBD',
    industry: 'Business software',
    overview:
      'A business management system that streamlines day-to-day operations. Replace this overview with the project goal, scope and your contribution.',
    objectives: ['Streamline core business operations', 'Centralise data and reporting'],
    challenges: ['Add the real challenges here'],
    solutions: ['Add the implemented solutions here'],
    features: [
      { title: 'Dashboard', detail: 'At-a-glance operational overview.' },
      { title: 'Reporting', detail: 'Centralised data and insights.' },
    ],
    process: [
      { phase: '01', title: 'Scope', detail: 'Define the system requirements.' },
      { phase: '02', title: 'Build', detail: 'Implement core modules.' },
      { phase: '03', title: 'Ship', detail: 'Test and deploy.' },
    ],
    results: [
      { value: '—', label: 'Add a metric' },
      { value: '—', label: 'Add a metric' },
    ],
    gallery: ['/projects/mcrop-system.svg'],
    related: ['company-product-websites', 'cake-selling-system'],
  },
];

/** Look up a project by its slug. */
export function projectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export const EXPERIENCE: ExperienceItem[] = [
  {
    period: '2023 — Now',
    role: 'Senior Frontend & Creative Engineer',
    company: 'Independent Studio',
    summary:
      'Partnering with agencies and product teams to ship award-calibre interactive experiences from concept to launch.',
  },
  {
    period: '2021 — 2023',
    role: 'Lead Frontend Engineer',
    company: 'Northwind Digital',
    summary:
      'Led the frontend guild, set the design-system foundations and introduced WebGL storytelling to flagship product launches.',
  },
  {
    period: '2019 — 2021',
    role: 'Frontend Developer',
    company: 'Studio Form',
    summary:
      'Built motion-rich marketing sites and internal tooling, specialising in performance and animation quality.',
  },
  {
    period: '2018 — 2019',
    role: 'UI Engineer',
    company: 'Brightside',
    summary:
      'Began the craft — component libraries, accessibility, and a lasting obsession with the details of motion.',
  },
];
