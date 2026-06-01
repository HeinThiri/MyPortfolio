/**
 * Static portfolio content. Kept in one typed place so copy and data are easy
 * to edit without touching components. Swap these for a CMS/JSON feed later.
 */

export interface SkillGroup {
  title: string;
  blurb: string;
  items: string[];
}

export interface Project {
  index: string;
  title: string;
  tagline: string;
  description: string;
  year: string;
  role: string;
  stack: string[];
  accent: string; // gradient for the card atmosphere
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
    title: 'Lumen',
    tagline: 'A spatial product configurator',
    description:
      'A real-time 3D configurator letting customers compose lighting fixtures in a photoreal scene, with instant material and finish swaps.',
    year: '2025',
    role: 'Lead Frontend & WebGL',
    stack: ['Angular', 'Three.js', 'GLSL', 'GSAP'],
    accent: 'linear-gradient(135deg, #e7eef9, #dfe9f4 40%, #f3ece0)',
  },
  {
    index: '02',
    title: 'Cadence',
    tagline: 'Data, made tangible',
    description:
      'An analytics suite where dashboards breathe — scroll-driven storytelling turns dense metrics into a guided, cinematic narrative.',
    year: '2024',
    role: 'Frontend Architect',
    stack: ['Angular', 'D3', 'Signals', 'Canvas'],
    accent: 'linear-gradient(135deg, #eef3ee, #e3eef0 45%, #eef0f6)',
  },
  {
    index: '03',
    title: 'Atelier',
    tagline: 'An editorial fashion experience',
    description:
      'An immersive lookbook blending film, type and physics — layered parallax and inertia create a tactile, gallery-like journey.',
    year: '2024',
    role: 'Creative Developer',
    stack: ['Three.js', 'GSAP', 'Lenis', 'SCSS'],
    accent: 'linear-gradient(135deg, #f5efe6, #efe7da 50%, #e9eef5)',
  },
  {
    index: '04',
    title: 'Pulse',
    tagline: 'Live audio-reactive identity',
    description:
      'A generative brand system that responds to sound in real time, driving shader-based visuals for events and broadcast.',
    year: '2023',
    role: 'Creative Engineer',
    stack: ['WebGL', 'Web Audio', 'GLSL', 'TypeScript'],
    accent: 'linear-gradient(135deg, #eaf1f6, #e7ecf3 50%, #f4ecdf)',
  },
];

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
