import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { WebGLEngineService } from '../../core/services/webgl-engine.service';
import { DeviceService } from '../../core/services/device.service';
import { AppStateService } from '../../core/services/app-state.service';
import { Centerpiece } from '../../three/objects/centerpiece';

interface Pt {
  x: number;
  y: number;
  px: number;
  py: number;
}

/**
 * Hero — editorial split. Right side is a draggable "lanyard" ID card hanging
 * from a flexible rope, simulated with lightweight Verlet physics (grab, drag &
 * throw; gravity + inertia). Three.js centerpiece drifts behind the section.
 */
@Component({
  selector: 'aurora-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements AfterViewInit, OnDestroy {
  private readonly engine = inject(WebGLEngineService);
  private readonly device = inject(DeviceService);
  private readonly state = inject(AppStateService);
  private readonly zone = inject(NgZone);

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly showroom = viewChild.required<ElementRef<HTMLElement>>('showroom');
  private readonly ropePath = viewChild.required<ElementRef<SVGPathElement>>('ropePath');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');

  private centerpiece?: Centerpiece;
  private typingTimer?: ReturnType<typeof setTimeout>;

  private typingIndex = 0;
  private charIndex = 0;
  private deleting = false;

  readonly typingText = signal('');
  // Specialty word cycled in the "Hi, I'm {x} Specialist" heading.
  readonly roles = ['Angular', 'React', 'Frontend', 'Web'];

  // Card visual state: 'idle' (hanging), 'grab' (held), 'drop' (just released).
  readonly cardFx = signal<'idle' | 'grab' | 'drop'>('idle');
  private dropTimer?: ReturnType<typeof setTimeout>;
  private phase = 0;

  // ---- Verlet lanyard ----
  private readonly SEG = 14;
  private points: Pt[] = [];
  private anchor = { x: 0, y: 0 };
  private segLen = 0;
  private W = 0;
  private H = 0;
  private dragging = false;
  private dragOffset = { x: 0, y: 0 };
  private pointer = { x: 0, y: 0 };
  private raf = 0;
  private ro?: ResizeObserver;

  constructor() {
    effect(() => {
      if (this.state.entered()) this.playIntro();
    });
  }

  ngAfterViewInit(): void {
    const detail = this.device.tier() === 'high' ? 64 : 24;
    this.centerpiece = new Centerpiece(detail);
    this.engine.register(this.centerpiece);

    if (this.device.reducedMotion()) {
      this.typingText.set(this.roles[0]);
    } else {
      this.startTyping();
    }

    this.initLanyard();
  }

  /* ---- Lanyard physics ---------------------------------------------- */
  private initLanyard(): void {
    const host = this.showroom().nativeElement;

    const setup = () => {
      const r = host.getBoundingClientRect();
      this.W = r.width;
      this.H = r.height;
      this.anchor = { x: this.W / 2, y: this.H * 0.05 };
      const cardTopY = this.H * 0.3;
      this.segLen = Math.max(4, (cardTopY - this.anchor.y) / this.SEG);
      this.points = [];
      for (let i = 0; i <= this.SEG; i++) {
        const x = this.anchor.x + i * 1.5; // slight initial lean → swings in
        const y = this.anchor.y + i * this.segLen;
        // px < x gives a small rightward starting velocity.
        this.points.push({ x, y, px: x - i * 0.5, py: y });
      }
      this.render();
    };

    setup();
    this.ro = new ResizeObserver(setup);
    this.ro.observe(host);

    if (this.device.reducedMotion()) return;

    this.zone.runOutsideAngular(() => {
      const loop = () => {
        this.step();
        this.render();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    });
  }

  private step(): void {
    const G = 0.6;
    const FRICTION = 0.985;
    const last = this.points.length - 1;

    // Integrate (anchor + dragged tip excluded).
    for (let i = 1; i < this.points.length; i++) {
      if (this.dragging && i === last) continue;
      const p = this.points[i];
      const vx = (p.x - p.px) * FRICTION;
      const vy = (p.y - p.py) * FRICTION;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + G;
    }

    // Idle "wind" — a gentle, continuous sway while just hanging.
    if (!this.dragging) {
      this.phase += 0.016;
      const tip = this.points[last];
      tip.x += Math.sin(this.phase * 1.2) * 0.16 + Math.sin(this.phase * 0.47) * 0.09;
    }

    // Satisfy distance constraints.
    for (let k = 0; k < 12; k++) {
      this.points[0].x = this.anchor.x;
      this.points[0].y = this.anchor.y;
      if (this.dragging) {
        const t = this.points[last];
        t.x = this.pointer.x - this.dragOffset.x;
        t.y = this.pointer.y - this.dragOffset.y;
      }
      for (let i = 0; i < this.points.length - 1; i++) {
        const a = this.points[i];
        const b = this.points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = (d - this.segLen) / d;
        const ox = dx * 0.5 * diff;
        const oy = dy * 0.5 * diff;
        const aPin = i === 0;
        const bPin = this.dragging && i + 1 === last;
        if (!aPin && !bPin) {
          a.x += ox;
          a.y += oy;
          b.x -= ox;
          b.y -= oy;
        } else if (!aPin) {
          a.x += dx * diff;
          a.y += dy * diff;
        } else if (!bPin) {
          b.x -= dx * diff;
          b.y -= dy * diff;
        }
      }
    }
  }

  private render(): void {
    if (!this.points.length) return;
    const pts = this.points;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    this.ropePath().nativeElement.setAttribute('d', d);

    const cardEl = this.card().nativeElement;
    const tip = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const rot = (Math.atan2(tip.x - prev.x, tip.y - prev.y) * 180) / Math.PI;
    const cw = cardEl.offsetWidth || 0;
    cardEl.style.transformOrigin = `${cw / 2}px 0px`;
    cardEl.style.transform = `translate(${(tip.x - cw / 2).toFixed(1)}px, ${tip.y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
  }

  private local(e: PointerEvent): { x: number; y: number } {
    const r = this.showroom().nativeElement.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  onGrab(e: PointerEvent): void {
    if (this.device.reducedMotion()) return;
    e.preventDefault();
    this.card().nativeElement.setPointerCapture(e.pointerId);
    const p = this.local(e);
    const tip = this.points[this.points.length - 1];
    this.dragOffset = { x: p.x - tip.x, y: p.y - tip.y };
    this.pointer = p;
    this.dragging = true;
    clearTimeout(this.dropTimer);
    this.cardFx.set('grab');
  }

  onDrag(e: PointerEvent): void {
    if (!this.dragging) return;
    this.pointer = this.local(e);
  }

  onRelease(e: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    this.cardFx.set('drop');
    clearTimeout(this.dropTimer);
    this.dropTimer = setTimeout(() => this.cardFx.set('idle'), 650);
    try {
      this.card().nativeElement.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  /* ---- Typing role -------------------------------------------------- */
  private startTyping(): void {
    const type = () => {
      const phrase = this.roles[this.typingIndex];
      if (!this.deleting) {
        this.typingText.set(phrase.slice(0, this.charIndex + 1));
        this.charIndex += 1;
        if (this.charIndex === phrase.length) {
          this.deleting = true;
          this.typingTimer = setTimeout(type, 2000);
          return;
        }
        this.typingTimer = setTimeout(type, 85);
        return;
      }
      this.typingText.set(phrase.slice(0, this.charIndex - 1));
      this.charIndex -= 1;
      if (this.charIndex === 0) {
        this.deleting = false;
        this.typingIndex = (this.typingIndex + 1) % this.roles.length;
        this.typingTimer = setTimeout(type, 450);
        return;
      }
      this.typingTimer = setTimeout(type, 42);
    };
    type();
  }

  private playIntro(): void {
    if (this.device.reducedMotion()) {
      gsap.set(['.hero-name', '.hero-intro', '.hero-actions', '.hero-visual', '.hero-hint'], {
        opacity: 1,
        y: 0,
        x: 0,
        filter: 'blur(0px)',
      });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero-name', { opacity: 0, y: 26, filter: 'blur(8px)', duration: 1.1 })
      .from('.hero-intro', { opacity: 0, y: 18, duration: 0.8 }, '-=0.6')
      .from('.hero-actions .hero-btn', { y: 22, opacity: 0, duration: 0.75, stagger: 0.12 }, '-=0.55')
      .from('.hero-visual', { opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.9')
      .from('.hero-hint', { opacity: 0, y: 10, duration: 0.8 }, '-=0.4');
  }

  ngOnDestroy(): void {
    clearTimeout(this.typingTimer);
    clearTimeout(this.dropTimer);
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    if (this.centerpiece) this.engine.unregister(this.centerpiece);
  }
}
