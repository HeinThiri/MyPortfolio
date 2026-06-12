import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PROJECTS } from '../../core/content';
import { DeviceService } from '../../core/services/device.service';

interface Pt {
  x: number;
  y: number;
}

/** Quadratic curve between two points with a perpendicular bend (0–100 space). */
function curve(a: Pt, b: Pt, bend: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  return `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`;
}

/**
 * Projects — an interactive "ecosystem" showcase. Project cards float across an
 * asymmetric canvas, wired together by animated dotted connection paths and
 * surrounded by floating business badges. Mouse parallax + 3D hover; each card
 * links through to its detail page (/work/:slug).
 */
@Component({
  selector: 'aurora-projects',
  standalone: true,
  imports: [RouterLink, RevealDirective],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly device = inject(DeviceService);

  readonly projects = PROJECTS;

  // cardIndex → slotIndex. Rotated on an interval so cards swap floating slots.
  readonly slots = signal<number[]>(PROJECTS.map((_, i) => i));

  // Asymmetric floating positions (% of the canvas) + tilt + parallax depth.
  readonly layout = [
    { x: 27, y: 34, rot: -4, depth: 1 },
    { x: 72, y: 26, rot: 5, depth: 0.6 },
    { x: 31, y: 73, rot: 4, depth: 0.85 },
    { x: 75, y: 70, rot: -5, depth: 1.25 },
  ];

  // Connections between cards — what they represent + curve bend.
  readonly connections = [
    { a: 0, b: 1, bend: 9, label: 'Innovation' },
    { a: 0, b: 2, bend: -12, label: 'Problem Solving' },
    { a: 1, b: 3, bend: 11, label: 'Business Growth' },
    { a: 2, b: 3, bend: -9, label: 'Digital Transformation' },
    { a: 0, b: 3, bend: 16, label: 'Scale' },
  ].map((c) => ({ ...c, d: curve(this.layout[c.a], this.layout[c.b], c.bend) }));

  // Floating glass badges scattered around the projects.
  readonly badges = [
    { label: 'Business Growth', icon: '📈', x: 13, y: 15, depth: 1.6, delay: 0 },
    { label: 'UX Excellence', icon: '✨', x: 50, y: 9, depth: 2, delay: 1.1 },
    { label: 'Revenue Increase', icon: '💹', x: 90, y: 45, depth: 1.2, delay: 0.6 },
    { label: 'Performance', icon: '⚡', x: 9, y: 55, depth: 1.4, delay: 0.3 },
    { label: 'Cloud Architecture', icon: '☁️', x: 60, y: 49, depth: 0.8, delay: 0.5 },
    { label: 'Enterprise', icon: '🏢', x: 52, y: 92, depth: 1, delay: 0.9 },
    { label: 'Real-Time Analytics', icon: '📊', x: 90, y: 86, depth: 1.8, delay: 1.4 },
    { label: 'Mobile First', icon: '📱', x: 22, y: 93, depth: 1.3, delay: 1.7 },
  ];

  readonly hovered = signal<number | null>(null);
  readonly px = signal(0);
  readonly py = signal(0);

  onMove(e: PointerEvent, host: HTMLElement): void {
    const r = host.getBoundingClientRect();
    this.px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    this.py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }

  onLeave(): void {
    this.px.set(0);
    this.py.set(0);
    this.hovered.set(null);
  }

  isActive(c: { a: number; b: number }): boolean {
    const h = this.hovered();
    if (h === null) return false;
    const slot = this.slots()[h];
    return c.a === slot || c.b === slot;
  }

  /* ---- Scroll-triggered continuous swap ----------------------------- */
  private timer?: ReturnType<typeof setInterval>;
  private io?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (this.device.reducedMotion() || this.projects.length < 2) return;

    this.io = new IntersectionObserver(
      (entries) => (entries[0].isIntersecting ? this.start() : this.stop()),
      { threshold: 0.35 },
    );
    this.io.observe(this.host.nativeElement);
  }

  private start(): void {
    if (this.timer) return;
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        if (this.hovered() !== null) return; // hold while a card is hovered
        const n = this.projects.length;
        this.zone.run(() => this.slots.update((s) => s.map((v) => (v + 1) % n)));
      }, 2800);
    });
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this.io?.disconnect();
  }
}
