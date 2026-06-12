import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';
import { DeviceService } from '../../core/services/device.service';

/**
 * auroraTilt — declarative 3D pointer tilt. Drop it on a card and it rotates in
 * perspective toward the cursor, easing back to flat on leave. Pure CSS
 * transform (no rAF, no model), so it's cheap enough for a grid of cards.
 *
 *   <article auroraTilt>…</article>        // default 8° max
 *   <article auroraTilt="12">…</article>   // stronger
 *
 * Disabled under prefers-reduced-motion. Keep auroraReveal on a WRAPPER, not on
 * the same element — both write `transform` and would fight otherwise.
 */
@Directive({ selector: '[auroraTilt]', standalone: true })
export class TiltDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly device = inject(DeviceService);

  /** Maximum tilt in degrees at the card's edge. */
  readonly max = input(8, {
    alias: 'auroraTilt',
    transform: (v: string | number) => {
      const n = typeof v === 'number' ? v : parseFloat(v);
      return Number.isFinite(n) ? n : 8;
    },
  });

  private enabled = false;

  ngAfterViewInit(): void {
    if (this.device.reducedMotion()) return;
    this.enabled = true;
    const el = this.host.nativeElement;
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerleave', this.onLeave);
  }

  private onMove = (e: PointerEvent): void => {
    const el = this.host.nativeElement;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    const m = this.max();
    el.style.transition = 'transform 0.08s linear';
    el.style.transform = `perspective(900px) rotateY(${px * m}deg) rotateX(${-py * m}deg)`;
  };

  private onLeave = (): void => {
    const el = this.host.nativeElement;
    el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
  };

  ngOnDestroy(): void {
    if (!this.enabled) return;
    const el = this.host.nativeElement;
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerleave', this.onLeave);
  }
}
