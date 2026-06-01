import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, inject } from '@angular/core';
import { DeviceService } from '../../core/services/device.service';

/**
 * Aurora glow cursor: a soft, blurred accent orb that trails the pointer with
 * inertia, plus a crisp ink dot that tracks tightly. Over interactive elements
 * the orb blooms and the dot hides.
 *
 * Activation is gesture-based, not capability-based: it waits for the first
 * real mouse/pen movement before showing. This means hybrid touchscreen
 * laptops (where `hover: none` falsely matches) still get the cursor when a
 * mouse is used, while pure-touch devices never trigger it. Only reduced-motion
 * fully opts out.
 */
@Component({
  selector: 'aurora-custom-cursor',
  standalone: true,
  template: `
    <div class="cursor" aria-hidden="true">
      <span class="cursor-glow"></span>
      <span class="cursor-dot"></span>
    </div>
  `,
  styleUrl: './custom-cursor.scss',
})
export class CustomCursor implements OnDestroy {
  private readonly device = inject(DeviceService);
  private readonly zone = inject(NgZone);
  private readonly host = inject(ElementRef<HTMLElement>);

  private glowEl!: HTMLElement;
  private dotEl!: HTMLElement;
  private active = false;
  private rafId = 0;

  // Raw target + smoothed positions for dot (tight) and glow (laggy).
  private tx = 0;
  private ty = 0;
  private dx = 0;
  private dy = 0;
  private gx = 0;
  private gy = 0;

  constructor() {
    afterNextRender(() => this.prepare());
  }

  private prepare(): void {
    if (this.device.reducedMotion()) return;

    const root = this.host.nativeElement as HTMLElement;
    const glow = root.querySelector<HTMLElement>('.cursor-glow');
    const dot = root.querySelector<HTMLElement>('.cursor-dot');
    if (!glow || !dot) return;

    this.glowEl = glow;
    this.dotEl = dot;

    // Show only once a real pointer (mouse/pen) moves.
    this.zone.runOutsideAngular(() =>
      window.addEventListener('pointermove', this.firstMove, { passive: true }),
    );
  }

  private firstMove = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    window.removeEventListener('pointermove', this.firstMove);
    this.activate(e);
  };

  private activate(e: PointerEvent): void {
    this.active = true;
    // `has-custom-cursor` on <body> hides the native cursor (global rule).
    document.body.classList.add('has-custom-cursor');
    // Visibility/hover/press toggle on the HOST element so the component's
    // encapsulated styles ( :host(.is-visible) … ) actually match — a body
    // ancestor selector would be rewritten and never apply.
    this.host.nativeElement.classList.add('is-visible');
    this.tx = this.dx = this.gx = e.clientX;
    this.ty = this.dy = this.gy = e.clientY;

    this.zone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onMove, { passive: true });
      document.addEventListener('pointerover', this.onOver, { passive: true });
      window.addEventListener('pointerdown', this.onDown, { passive: true });
      window.addEventListener('pointerup', this.onUp, { passive: true });
      this.loop();
    });
  }

  private onMove = (e: PointerEvent): void => {
    this.tx = e.clientX;
    this.ty = e.clientY;
  };

  private onOver = (e: Event): void => {
    const interactive = (e.target as HTMLElement).closest('a, button, [data-cursor="hover"]');
    this.host.nativeElement.classList.toggle('is-hover', !!interactive);
  };

  private onDown = (): void => this.host.nativeElement.classList.add('is-down');
  private onUp = (): void => this.host.nativeElement.classList.remove('is-down');

  private loop = (): void => {
    if (!this.active) return;
    this.rafId = requestAnimationFrame(this.loop);

    // Dot tracks tightly; glow trails with more inertia.
    this.dx += (this.tx - this.dx) * 0.5;
    this.dy += (this.ty - this.dy) * 0.5;
    this.gx += (this.tx - this.gx) * 0.16;
    this.gy += (this.ty - this.gy) * 0.16;

    this.dotEl.style.transform = `translate3d(${this.dx}px, ${this.dy}px, 0)`;
    this.glowEl.style.transform = `translate3d(${this.gx}px, ${this.gy}px, 0)`;
  };

  ngOnDestroy(): void {
    this.active = false;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('pointermove', this.firstMove);
    window.removeEventListener('pointermove', this.onMove);
    document.removeEventListener('pointerover', this.onOver);
    window.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointerup', this.onUp);
    document.body.classList.remove('has-custom-cursor');
    this.host.nativeElement.classList.remove('is-visible', 'is-hover', 'is-down');
  }
}
