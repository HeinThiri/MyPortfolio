# Projects Showcase — UI/UX Design Spec

A premium, enterprise-grade Projects Showcase for this Angular site: a **listing**
view and a **dedicated detail page** per project, with cinematic-but-tasteful
motion that reuses the existing design system.

> **Stack reality check (drives the decisions below)**
> - Angular standalone components, single-page app composed in [app.html](../src/app/app.html). **No router yet.**
> - Smooth scroll via Lenis ([scroll.service.ts](../src/app/core/services/scroll.service.ts)); animation vocabulary in [motion.service.ts](../src/app/core/services/motion.service.ts) (`reveal`, `revealText`, `parallax`, `scrubbed`) + [RevealDirective](../src/app/shared/directives/reveal.directive.ts).
> - GSAP + ScrollTrigger already registered. WebGL particle backdrop is global.
> - Design tokens in [_tokens.scss](../src/styles/_tokens.scss) — **light theme only** today (no dark mode).
> - Existing `PROJECTS` data + `Project` interface in [content.ts](../src/app/core/content.ts) — needs extending.

---

## 1. Information architecture & routing

Introduce `@angular/router` (lazy-loaded detail). Keep the existing scrolling
home as the index route; add a real detail route for SEO + deep-linking.

```
/                      → Home (all sections, incl. Projects listing)   ← existing page
/work                  → Full Projects listing (filterable grid)        ← optional standalone
/work/:slug            → Project detail page                            ← new, lazy
```

- `app.html` wraps sections in `<router-outlet>`; the home route renders the
  section stack, `/work/:slug` renders `ProjectDetailPage`.
- **Scroll restoration**: on route change, stop Lenis, scroll to top, restart
  (`scroll.service`), and move focus to the detail `<h1>` (a11y).
- **Fallback option (no router)**: a full-screen overlay `ProjectDetailOverlay`
  driven by a signal in `AppStateService`. Faster to ship, but weaker SEO/deep
  links. **Recommendation: real routes.**

---

## 2. Data model (extend `Project`)

```ts
export interface ProjectStat { value: string; label: string; }      // "120%", "Conversion"
export interface ProcessStep { phase: string; title: string; detail: string; }
export interface Testimonial { quote: string; author: string; role: string; avatar?: string; }

export interface Project {
  // existing
  index: string; title: string; tagline: string; description: string;
  year: string; role: string; stack: string[]; accent: string; image: string;
  // new
  slug: string;                 // 'banking-system'  → /work/banking-system
  category: ProjectCategory;    // 'Finance' | 'E-commerce' | 'Healthcare' | …
  client: string;
  industry: string;
  overview: string;             // long-form intro
  objectives: string[];
  challenges: string[];
  solutions: string[];
  features: { icon: string; title: string; detail: string }[];
  process: ProcessStep[];       // timeline
  results: ProjectStat[];       // animated counters
  gallery: string[];            // lightbox images
  testimonial?: Testimonial;
  related: string[];            // slugs
  hero: string;                 // wide banner image (distinct from card image)
}

export type ProjectCategory =
  | 'E-commerce' | 'Finance' | 'Healthcare' | 'Education' | 'Real Estate' | 'Travel' | 'Business';
```

Keep all copy/data in `content.ts` so it stays CMS-swappable.

---

## 3. Component hierarchy

```
ProjectsShowcase (listing — replaces/extends current Projects section)
├─ ShowcaseHeader            eyebrow + headline + intro
├─ ProjectFilter             category tag pills (signal-driven filtering)
└─ ProjectGrid
   └─ ProjectCard  ×N         image, title, desc, category tag, stack chips, "View Details"

ProjectDetailPage (route /work/:slug)
├─ DetailHero                parallax banner, title, client, industry, breadcrumb
├─ DetailIntro               overview + meta sidebar (client / industry / year / role)
├─ ObjectiveChallengeSolution   3-column "OCS" cards (or tabbed)
├─ FeatureGrid               key features (icon cards)
├─ ResultStats               animated counters
├─ ProcessTimeline           vertical timeline, slide-in steps
├─ TechStack                 grouped tech badges
├─ ProjectGallery            masonry/grid → Lightbox overlay
├─ Testimonial               quote block
├─ RelatedProjects           mini ProjectCards (reuse)
└─ DetailCTA                 "Start a project" call-to-action

Shared
├─ LightboxOverlay           full-screen image viewer (focus-trapped dialog)
├─ CountUp (directive)       animate number on scroll-in
├─ Skeleton (component)      shimmer placeholders
└─ ThemeService + ThemeToggle   light/dark
```

Reuse existing `BounceCards`, `CardSwap`, `RevealDirective`, `MagneticDirective`.

---

## 4. Listing page — layout & card spec

**Grid**
- `repeat(auto-fill, minmax(340px, 1fr))`, gap `clamp(1.25rem, 2.5vw, 2rem)`.
- Section padding via `@include section-pad`; container `--container` + `--gutter`.
- Filter bar sticky under nav on scroll (optional).

**ProjectCard anatomy**
```
┌───────────────────────────────┐
│  �row: category tag (overlay)  │  ← featured image (16:10), object-fit cover
│            IMAGE              │     zoom on hover, gradient scrim bottom
├───────────────────────────────┤
│  Title (fs-h3, 600)           │
│  Short description (2 lines,   │     -webkit-line-clamp:2
│   ink-muted)                   │
│  [tech] [chips] [+2]          │     show 3, “+N” overflow
│  View Details →               │     ghost/underline button, arrow slides
└───────────────────────────────┘
```
- **Material**: glass surface (`@include glass`) or `--c-bg-elev` + `--shadow-md`.
- **Category tag**: small pill, color-coded per category (see palette §8).

**Hover animation**
| Element | Effect | Timing |
|---|---|---|
| Card | `translateY(-8px)` + `--shadow-lg` + accent glow | 0.4s `--ease-out-soft` |
| Image | `scale(1.06)` | 0.6s |
| Scrim | brighten / category tint reveal | 0.4s |
| Button arrow | `translateX(4px)`, underline grows | 0.25s |
| Content | fade/rise in on scroll (`auroraReveal`, staggered) | — |

---

## 5. Detail page — section specs

1. **Hero banner** — full-bleed image, `scrubbed` parallax on the image layer
   (`yPercent: -15`), title `revealText` word reveal, client·industry·year meta
   row, breadcrumb `Work / {title}`. Scroll-down cue.
2. **Overview** — two-column: long overview text (reveal) + sticky meta card
   (Client, Industry, Year, Role, live link).
3. **Objectives / Challenges / Solutions** — 3 glass cards, staggered reveal;
   on mobile collapse to stacked accordions.
4. **Key features** — icon-card grid (`auto-fit minmax(240px,1fr)`), hover lift.
5. **Results & achievements** — 3–4 **animated counters** (`CountUp` on
   scroll-in) on an accent band; subtext per stat.
6. **Process timeline** — vertical line, alternating left/right nodes on desktop,
   single column on mobile; each step **slide-in** from its side via ScrollTrigger.
7. **Tech stack** — grouped badges (Frontend / Backend / Tooling).
8. **Gallery** — masonry; click opens **Lightbox** (scale+fade in, arrow keys,
   focus trap, Esc to close, swipe on touch).
9. **Testimonial** — large serif quote, author + role + avatar.
10. **Related projects** — 3 reused `ProjectCard`s (same category first).
11. **CTA** — gradient panel, magnetic button → contact.

---

## 6. Animation behavior (map to existing primitives)

| Requirement | Implementation |
|---|---|
| Scroll reveal | `RevealDirective` (`block` / `text` / `blur`) — already built |
| Parallax hero | `motion.parallax(heroImg, { speed: 0.18 })` / `scrubbed` |
| Stat counters | `CountUp` directive: GSAP tween `{ val: 0 → target }` on ScrollTrigger `once` |
| Gallery lightbox | overlay: `gsap.fromTo(scale .9→1, opacity 0→1)`, ease `expo.out` |
| Page transitions | route-leave curtain (reuse preloader curtain pattern) or Angular `@animations` fade/clip |
| Timeline slide-in | per-node `gsap.from({ x: ±60, opacity:0 })` ScrollTrigger |
| Loading skeletons | CSS shimmer (`@keyframes` gradient sweep) while images/data resolve |
| Reduced motion | every primitive already checks `DeviceService.reducedMotion()` — keep it |

All scroll work goes through ScrollTrigger so it stays in sync with Lenis.

---

## 7. Dark mode strategy (new)

Tokens are light-only today. Add a theme layer **without** rewriting components:

```scss
:root { /* existing light tokens */ }
:root[data-theme='dark'] {
  --c-bg: #0e1116; --c-bg-elev:#161b22; --c-ink:#e8eaed; --c-ink-muted:#9aa3af;
  --c-line: rgba(255,255,255,0.10); /* …override the same token names… */
}
```
- `ThemeService`: signal `theme: 'light'|'dark'`, sets `document.documentElement.dataset.theme`, persists to `localStorage`, defaults from `prefers-color-scheme`.
- `ThemeToggle` in [site-nav](../src/app/layout/site-nav). Because components consume CSS vars, dark mode "just works" once overrides exist.
- WebGL particle color should also swap with theme.

---

## 8. Visual system

**Color** — keep the warm neutral base; add category accents (used on tags + card glows):
| Category | Accent |
|---|---|
| E-commerce | `--c-champagne` warm gold |
| Finance | `--c-blue` |
| Healthcare | `--c-cyan` |
| Education | violet `#9b8fe0` (add token) |
| Real Estate | slate `#8a93a3` |
| Travel | teal `#79c6b6` (add token) |

**Typography** — existing scale: `--fs-hero/h1/h2/h3/lead/body/small/micro`; display
font `Inter Tight`, serif accents `Instrument Serif` for taglines/quotes.

**Surface language** — glassmorphism for floating UI (cards, lightbox chrome,
toggle), solid `--c-bg-elev` for content blocks; elevation via `--shadow-sm/md/lg`,
glow via `--shadow-glow`. Radii `--r-md/lg/xl`.

**Spacing** — 8pt scale `--sp-*`; section rhythm `@include section-pad`.

---

## 9. Accessibility & SEO

- Cards are `<a routerLink>` (real links, keyboard + middle-click friendly).
- Lightbox = focus-trapped `role="dialog"` `aria-modal`, restores focus on close.
- Counters expose final value in DOM immediately (animation is progressive
  enhancement); respect reduced motion.
- Per-route `<title>`/meta description + JSON-LD `CreativeWork`/`Project`.
- Color contrast ≥ 4.5:1 in both themes; visible focus rings (`@include focus-ring`).
- Mobile-first: single column → 2-up → 3-up; timeline stacks; gallery 1-col.

---

## 10. Phased implementation plan

- **Phase 1 — Foundation**: extend `Project` model + real data; add router;
  redesign listing (cards + category filter). *Shippable on its own.*
- **Phase 2 — Detail core**: detail route + Hero, Overview, OCS, Features, Tech,
  Related, CTA with scroll reveals & hero parallax.
- **Phase 3 — Signature motion**: CountUp stats, ProcessTimeline slide-in,
  Gallery + Lightbox, route page-transition.
- **Phase 4 — Platform polish**: dark mode + ThemeToggle, loading skeletons,
  a11y/SEO pass, responsive QA.

Each phase builds + verifies independently.
```
```
