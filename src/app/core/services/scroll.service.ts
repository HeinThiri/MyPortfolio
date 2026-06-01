import { Injectable, NgZone, inject, signal } from '@angular/core';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WebGLEngineService } from './webgl-engine.service';
import { DeviceService } from './device.service';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollService — wires Lenis smooth-scrolling to GSAP's ScrollTrigger and
 * publishes a global 0..1 scroll progress. This is the single scroll clock
 * the whole experience is choreographed against.
 */
@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly zone = inject(NgZone);
  private readonly engine = inject(WebGLEngineService);
  private readonly device = inject(DeviceService);

  private lenis?: Lenis;
  readonly progress = signal(0);

  init(): void {
    if (this.lenis) return;

    this.lenis = new Lenis({
      // Frame-rate-independent smoothing: feels identical on 60/120/144Hz and is
      // lighter than a fixed duration+easing. Lower = silkier/heavier glide.
      lerp: this.device.isTouch() ? 0.12 : 0.09,
      smoothWheel: true,
      // Touch keeps native momentum; Lenis only smooths the wheel.
      syncTouch: false,
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
      overscroll: true,
    });

    // Bridge Lenis → ScrollTrigger. The scroll event now fires OUTSIDE Angular's
    // zone (see zone-flags.ts), so we keep ScrollTrigger + WebGL updates out of
    // change detection and only re-enter the zone to publish the signal.
    this.lenis.on('scroll', (e: { progress: number }) => {
      ScrollTrigger.update();
      this.engine.setScroll(e.progress);
      this.zone.run(() => this.progress.set(e.progress));
    });

    // Drive Lenis from GSAP's ticker (one clock, no double rAF).
    this.zone.runOutsideAngular(() => {
      gsap.ticker.add((time) => this.lenis!.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    });

    document.documentElement.classList.add('lenis');

    if (this.device.reducedMotion()) {
      // Honor the preference: disable smoothing, keep ScrollTriggers working.
      this.lenis.destroy();
      this.lenis = undefined;
    }
  }

  scrollTo(target: string | number | HTMLElement, offset = 0): void {
    this.lenis?.scrollTo(target, { offset, duration: 1.4 });
  }

  stop(): void {
    this.lenis?.stop();
  }
  start(): void {
    this.lenis?.start();
  }

  /** Recompute trigger positions (after layout/content changes). */
  refresh(): void {
    ScrollTrigger.refresh();
  }

  destroy(): void {
    this.lenis?.destroy();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
