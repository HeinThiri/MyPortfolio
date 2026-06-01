import { Directive, ElementRef, inject, input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { gsap } from 'gsap';
import { DeviceService } from '../../core/services/device.service';

/**
 * auroraMagnetic — elastic "magnetic" hover physics. The element is pulled
 * toward the cursor with inertia and springs back on leave. Pointer-only.
 */
@Directive({ selector: '[auroraMagnetic]', standalone: true })
export class MagneticDirective implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly device = inject(DeviceService);

  /** Pull strength (px-ish multiplier). Bare `auroraMagnetic` → default 0.4. */
  readonly strength = input<number, number | string>(0.4, {
    alias: 'auroraMagnetic',
    transform: (v) => (v === '' || v == null ? 0.4 : Number(v)),
  });

  private xTo?: (v: number) => void;
  private yTo?: (v: number) => void;

  ngOnInit(): void {
    if (this.device.isTouch() || this.device.reducedMotion()) return;
    const el = this.host.nativeElement;

    this.zone.runOutsideAngular(() => {
      this.xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      this.yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', this.onMove);
      el.addEventListener('pointerleave', this.onLeave);
    });
  }

  private onMove = (e: PointerEvent): void => {
    const el = this.host.nativeElement;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    const s = this.strength();
    this.xTo?.(mx * s);
    this.yTo?.(my * s);
  };

  private onLeave = (): void => {
    this.xTo?.(0);
    this.yTo?.(0);
  };

  ngOnDestroy(): void {
    const el = this.host.nativeElement;
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerleave', this.onLeave);
  }
}
