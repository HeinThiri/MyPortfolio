import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';
import { MotionService } from '../../core/services/motion.service';

/**
 * auroraParallax — declarative scroll parallax. Drop it on any element to make
 * it drift against the scroll as it passes through the viewport. The value is
 * the drift speed (fraction of the element's size, negative reverses):
 *
 *   <span auroraParallax>…</span>            // default 0.2
 *   <img auroraParallax="0.4" />             // stronger
 *   <div auroraParallax="-0.15">…</div>      // reversed
 *   <div auroraParallax="0.3" parallaxAxis="x">…</div>  // horizontal
 *
 * Disabled automatically under prefers-reduced-motion (handled in MotionService).
 */
@Directive({ selector: '[auroraParallax]', standalone: true })
export class ParallaxDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly motion = inject(MotionService);

  readonly speed = input(0.2, {
    alias: 'auroraParallax',
    // Bare `auroraParallax` binds '' — fall back to the default.
    transform: (v: string | number) => {
      const n = typeof v === 'number' ? v : parseFloat(v);
      return Number.isFinite(n) ? n : 0.2;
    },
  });
  readonly axis = input<'x' | 'y'>('y', { alias: 'parallaxAxis' });

  private tween?: ReturnType<MotionService['parallax']>;

  ngAfterViewInit(): void {
    this.tween = this.motion.parallax(this.host.nativeElement, {
      speed: this.speed(),
      axis: this.axis(),
    });
  }

  ngOnDestroy(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}
