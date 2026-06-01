# Aurora — Cinematic 3D Frontend Developer Portfolio

A premium, immersive single-page portfolio built with **Angular 20 + Three.js + GSAP + Lenis**.
The aesthetic is _light, warm and atmospheric_ — Apple-style storytelling, Lusion-grade motion,
Stripe-level restraint. No darkness, no neon, no clutter.

> Apple × Lusion × Stripe × Active Theory.

```bash
npm install
npm start          # dev server → http://localhost:4200
npm run build      # production bundle → dist/aurora-portfolio
```

Built & verified on Node 20+ / Angular 20.2. Initial JS payload ≈ **197 kB gzipped** (incl. Three.js + post-processing).

---

## 1 · Project Architecture

A **single shared WebGL context** lives behind the entire DOM. Sections never spin up their own
renderers; they contribute `SceneObject`s to one engine and choreograph DOM with GSAP. One render
loop, one scroll clock (Lenis → ScrollTrigger), one quality budget.

```
                ┌──────────────────────────────────────────────┐
                │                  App (shell)                   │
                │   preloader · nav · cursor · scroll-progress   │
                └──────────────────────────────────────────────┘
                          │ DOM (z:10+)        │ contributes
            ┌─────────────▼───────────┐  ┌─────▼─────────────────┐
            │  Section components      │  │  WebGLEngineService   │
            │  (Hero…Contact)          │  │  renderer · camera    │
            │  semantic HTML + GSAP    │  │  composer(bloom)·loop │
            └─────────────┬───────────┘  └─────▲─────────────────┘
                          │ uses                │ scroll 0..1
            ┌─────────────▼───────────┐  ┌──────┴────────────────┐
            │ MotionService (GSAP)     │  │ ScrollService (Lenis  │
            │ reveal · split · scrub   │  │ + ScrollTrigger sync) │
            └──────────────────────────┘  └───────────────────────┘
                          │
            ┌─────────────▼───────────┐
            │ DeviceService            │  capability tier · DPR · reduced-motion
            └──────────────────────────┘
```

**Layering (z-index):** `canvas(0)` → `atmosphere wash(1)` → `content(10)` → `nav/progress(40)` →
`cursor(90)` → `preloader(100)`. The atmosphere layer is radially masked so the 3D centerpiece
shows through the middle while the light UI frames it.

---

## 2 · Folder Structure

```
src/
├─ index.html                 # SEO meta, fonts, semantic shell
├─ styles.scss                # global reset + base typography + utilities
├─ styles/
│  ├─ _tokens.scss            # color system, type scale, spacing, motion (CSS vars)
│  └─ _mixins.scss            # glass(), container, eyebrow, gradient-text…
└─ app/
   ├─ app.ts / app.html / app.scss      # shell: orchestrates preloader → scroll start
   ├─ core/
   │  ├─ content.ts                      # typed portfolio data (skills/projects/experience)
   │  └─ services/
   │     ├─ device.service.ts            # capability tier, DPR clamp, reduced-motion
   │     ├─ webgl-engine.service.ts      # renderer, camera, bloom, the rAF loop
   │     ├─ scroll.service.ts            # Lenis ↔ ScrollTrigger, global progress signal
   │     ├─ motion.service.ts            # reusable GSAP animation vocabulary
   │     ├─ loader.service.ts            # preloader progress (assets + fonts)
   │     └─ app-state.service.ts         # `entered` signal (curtain cleared)
   ├─ three/
   │  ├─ scene-object.ts                 # SceneObject + FrameContext contracts
   │  ├─ shaders.ts                      # GLSL: simplex noise, centerpiece, particles
   │  └─ objects/
   │     ├─ centerpiece.ts               # morphing iridescent hero object
   │     └─ particle-field.ts            # GPU atmospheric motes
   ├─ shared/directives/
   │  ├─ reveal.directive.ts             # [auroraReveal] scroll reveals
   │  └─ magnetic.directive.ts           # [auroraMagnetic] elastic hover
   ├─ layout/
   │  ├─ webgl-canvas/                   # fixed full-screen canvas host
   │  ├─ preloader/                      # counter + curtain wipe
   │  ├─ site-nav/                       # glass pill nav
   │  ├─ custom-cursor/                  # dot + trailing ring
   │  └─ scroll-progress/                # hairline top bar
   └─ sections/
      ├─ hero/  about/  skills/
      └─ projects/  experience/  contact/
```

---

## 3 · Angular Component Organization

* **Standalone components + signals** throughout (Angular 20). No NgModules.
* **`core/`** = singletons (`providedIn: 'root'`). Stateless-ish, framework-free logic.
* **`three/`** = pure Three.js, zero Angular imports — portable and testable in isolation.
* **`shared/`** = cross-section directives.
* **`layout/`** = chrome that frames the experience.
* **`sections/`** = one component per narrative beat; each owns its DOM, its GSAP timeline, and
  (optionally) registers a `SceneObject`. Each section cleans up in `ngOnDestroy`.

Communication is via injected services + signals — never `@Input` chains across the page.

---

## 4 · Three.js Scene Setup

`WebGLEngineService` owns everything 3D:

* `WebGLRenderer` — `alpha:true` (UI shows through), `ACESFilmicToneMapping`, DPR clamped per tier.
* **Lighting** — soft *studio* rig: hemisphere + warm key + cool rim + champagne fill. Bright and
  premium, never harsh.
* **Post-processing** — `EffectComposer` → `RenderPass` → `UnrealBloomPass` (strength `0.42`,
  high threshold so only highlights glow) → `OutputPass`. Disabled on the low tier / reduced-motion.
* **Loop** — runs in `NgZone.runOutsideAngular`, `delta` clamped to avoid post-tab-switch jumps,
  pauses on `visibilitychange`.
* **SceneObject contract** — `{ object3D, onAdd?, update(ctx), dispose() }`. The engine calls
  `update(FrameContext)` each frame with `{ dt, elapsed, pointer, scroll, camera }`.

Two scene objects ship: the **Centerpiece** (icosahedron + curl-noise vertex displacement +
Fresnel iridescent shader + additive halo) and the **ParticleField** (GPU points, soft sprites,
pointer/scroll parallax).

---

## 5 · GSAP Animation Strategy

`MotionService` is the single animation vocabulary so every section feels the same:

| Primitive        | Use                                                              |
| ---------------- | --------------------------------------------------------------- |
| `splitWords()`   | Wrap text in line-clip masks + word spans (no SplitText dep)    |
| `revealText()`   | Masked, staggered word rise on viewport enter                   |
| `reveal()`       | Generic fade+rise for blocks / lists                            |
| `timeline()`     | Paused timeline for imperative orchestration                    |
| `scrubbed()`     | Pinned, scrubbed timeline — the backbone of section storytelling|

Shared easing is **`expo.out`** (entrances) and **`none`** (scrubbed). The `[auroraReveal]`
directive exposes `reveal`/`revealText` declaratively in templates.

---

## 6 · Scroll Storytelling Structure

**Lenis** smooths the wheel; its `scroll` event drives `ScrollTrigger.update()` and publishes a
global `progress` signal that is also fed to the WebGL engine (`engine.setScroll`). One clock for
DOM motion *and* 3D — the centerpiece recedes/scales exactly as you leave the hero.

Beat map (vertical narrative):

```
00 ─ Preloader curtain clears ──────────────► hero intro timeline fires
HERO        floating centerpiece, masked headline, scroll hint
ABOUT       editorial statement reveal + 3 parallax depth cards
SKILLS      glass capability cards over a CSS orbit system
PROJECTS    cinematic cards: blur→focus + scale-up, parallaxed index/atmosphere
EXPERIENCE  gradient timeline line draws on scrub; milestones stagger in
CONTACT     magnetic CTA over a glow, then a quiet footer reveal
```

---

## 7 · UI/UX Design Guidelines

* **Generous whitespace** — content breathes; sections use `clamp()` vertical rhythm.
* **One material language** — frosted glass (`glass()` mixin) for all floating surfaces.
* **Quiet feedback** — hairline progress bar, soft cursor, magnetic buttons. Nothing shouts.
* **Motion with intent** — every transition has a reason; easing is consistent and calm.
* **Depth over decoration** — parallax + the 3D layer create dimension instead of ornament.
* **Accessibility first** — semantic landmarks, real links, focus rings, full reduced-motion path.

---

## 8 · Color System

Defined as CSS custom properties in `styles/_tokens.scss`.

| Role          | Token            | Value     |
| ------------- | ---------------- | --------- |
| Canvas        | `--c-bg`         | `#f4f1ec` warm off-white |
| Raised        | `--c-bg-elev`    | `#fbfaf7` |
| Recessed      | `--c-bg-sink`    | `#ece7df` |
| Ink           | `--c-ink`        | `#1c1b1a` (softened charcoal, never pure black) |
| Muted ink     | `--c-ink-muted`  | `#6b6760` |
| Soft blue     | `--c-blue`       | `#8fb3e0` |
| Pale cyan     | `--c-cyan`       | `#a9dce3` |
| Champagne     | `--c-champagne`  | `#e7d6b8` |
| Accent        | `--c-accent`     | `#7e9cc9` |
| Glow (cool)   | `--glow-cool`    | `rgba(143,179,224,.45)` |

Gradients (`--grad-aurora`, `--grad-accent`, `--grad-glass`) stay muted and atmospheric.

---

## 9 · Typography

* **Display** — `Inter Tight` (tight tracking, −0.02→−0.035em on large sizes).
* **Body** — `Inter`, weight 300 for an airy, premium feel.
* **Editorial accent** — `Instrument Serif` italic for emphasis words (“immersive”, “obsessing”).
* **Fluid scale** — `clamp()` tokens (`--fs-hero … --fs-micro`) so type scales smoothly across viewports.
* **Eyebrows** — uppercase, `0.18em` tracking, used as section indices `(01) — About`.

---

## 10 · Animation Sequencing Strategy

1. **Boot** — loader eases a progress bar (assets 70% + fonts to 100%); curtain panels wipe up
   (`expo.inOut`, staggered).
2. **Hero intro** — fires on the `entered` signal: words rise from masks (stagger `0.09`), then
   eyebrow → aside → hint cascade.
3. **On scroll** — each section's reveal triggers `once` at ~`top 85%`; scrubbed timelines
   (timeline line, parallax) bind to `top bottom → bottom top`.
4. **Micro** — magnetic buttons (`elastic.out`), cursor scale on interactive hover, chip/underline transitions.
5. **3D continuity** — the shared `scroll` uniform keeps the centerpiece and particles in lockstep with the page.

---

## 11 · Performance Optimization

* Render loop **outside Angular's zone** — no change detection at 60fps.
* **Adaptive quality tier** (`DeviceService`): DPR cap (2 / 1.5 / 1), particle count
  (1800 / 1000 / 450), icosahedron detail (64 / 24), bloom on/off.
* `delta` **clamped** to `1/30`; loop **pauses** when the tab is hidden.
* GPU-only motion in shaders (vertex displacement, point parallax) — no per-frame CPU geometry work.
* Allocation-free `update()` (pre-allocated vectors, in-place `lerp`/`copy`).
* `will-change` only on actively animated transforms; `backdrop-filter` used sparingly.
* `text-wrap: balance/pretty`, `font-display: swap`, preconnected font origins.

---

## 12 · Suggested Libraries

| Concern            | Shipped                          | Optional upgrade |
| ------------------ | -------------------------------- | ---------------- |
| 3D                 | `three` + examples post-fx       | `postprocessing` (pmndrs), `three-stdlib` |
| Declarative 3D     | raw Three (max control)          | `angular-three` (NGT) for template-driven scenes |
| Animation          | `gsap` + `ScrollTrigger`         | `@gsap/business` SplitText, `Flip` |
| Smooth scroll      | `lenis`                          | — |
| Assets             | `GLTFLoader`, `DRACOLoader`, KTX2 | `meshopt` decoder |

---

## 13 · Mobile Responsiveness Strategy

* Fluid type/space via `clamp()`; grids collapse to single column at `≤900px`.
* **Touch path**: custom cursor + magnetic hover disabled; Lenis keeps native momentum.
* **Low tier auto-applies** on mobile → fewer particles, no bloom, lower DPR.
* Decorative-only layers (`about` depth cards, `skills` orbit) hidden on small screens to protect clarity & fps.
* `100svh` for the hero so mobile browser chrome doesn't clip it; `viewport-fit=cover`.

---

## 14 · Step-by-Step Implementation Roadmap

1. Scaffold Angular 20 (standalone, SCSS) · add `three`, `gsap`, `lenis`, `@types/three`.
2. Design tokens + global styles + glass mixin.
3. `DeviceService` (tiering) → `WebGLEngineService` (renderer/loop/bloom).
4. `ScrollService` (Lenis ↔ ScrollTrigger) + `MotionService` vocabulary.
5. Shell: canvas host, preloader, nav, cursor, progress; wire `entered`.
6. Shaders → `Centerpiece` + `ParticleField`; mount in hero/canvas.
7. Build sections top-to-bottom, each with reveals + (optional) scene object.
8. Responsive passes + reduced-motion + tier tuning.
9. `npm run build`, check budgets, Lighthouse, real-device fps.
10. Swap placeholder content/data; add GLB/HDRI via the loader if desired.

---

## 15 · Hero Section Implementation Concept

The hero headline sits in front of the floating, breathing **Centerpiece** (in the shared canvas).
Words are wrapped in `.reveal-line` clip masks; on `entered` they lift from `yPercent:120` with an
expo stagger. The serif word (“immersive”) gets the accent gradient text-fill. The centerpiece tilts
toward the pointer with inertia and recedes as `scroll` grows. A looping scroll hint anchors the
bottom. See [hero.ts](src/app/sections/hero/hero.ts) + [hero.html](src/app/sections/hero/hero.html).

---

## 16 · Suggested Shader Effects

* **Fresnel iridescence** (shipped) — bright rim, translucent core, view-angle gradient between
  champagne → blue → cyan.
* **Curl/simplex displacement** (shipped) — organic "breathing" of the geometry.
* **Soft point sprites** (shipped) — round, additive, depth-scaled particles.
* *Next:* depth-of-field (bokeh) pass, chromatic-aberration on velocity, refractive glass via
  `MeshTransmissionMaterial`, GPGPU curl-noise particle flow, subtle film grain.

---

## 17 · Example Scene Choreography

```
scroll 0.00  hero      centerpiece centered, full scale, bloom on
scroll 0.15  hero→about centerpiece drifts back (z-) & down, halo fades
scroll 0.30  about     depth cards parallax at 0.4 / 1.0 / 1.8 speeds
scroll 0.45  skills    orbit rings rotate; particles drift on pointer
scroll 0.55  projects  cards blur→focus + scale-up as each enters
scroll 0.80  experience timeline gradient draws top→bottom on scrub
scroll 0.95  contact   glow swells; magnetic CTA; footer reveals
```

All driven by the one Lenis progress value shared between DOM (GSAP) and GPU (uniforms).

---

## 18 · Best Practices for Cinematic Storytelling Sites

* **One scroll clock.** Sync smooth-scroll → triggers → 3D so nothing fights.
* **Choreograph, don't decorate.** Each beat should advance a narrative.
* **Protect the frame budget.** Tier-scale before you add; measure on real devices.
* **Mask reveals** for that premium "type emerges" feel; keep staggers tight (`0.04–0.09s`).
* **Calm easing.** Expo/quart out; avoid bouncy defaults except deliberate micro-interactions.
* **Respect the user.** Full reduced-motion fallback, real semantic HTML, keyboard focus, pausable.
* **Light ≠ flat.** Use soft shadows, glass, glow and parallax to build depth without going dark.

---

### Accessibility & SEO notes

* Real semantic markup (`<main>`, `<section aria-label>`, `<h1>/<h2>`, `<ol>` timeline, `<dl>` stats)
  renders alongside the canvas — crawlable and screen-reader friendly. The canvas is `aria-hidden`.
* Full `prefers-reduced-motion` path: Lenis disabled, reveals resolve to final state, micro-interactions off.
* Focus-visible rings, skip-friendly anchors, and color contrast tuned on the light palette.

> Replace copy/data in [`src/app/core/content.ts`](src/app/core/content.ts) and the hero/contact
> templates to make it yours. Drop GLB/HDRI assets into `public/` and load them through
> `LoaderService.manager` to get real preloader progress.
