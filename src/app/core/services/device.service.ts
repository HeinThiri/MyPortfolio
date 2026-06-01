import { Injectable, signal, computed } from '@angular/core';

export type QualityTier = 'high' | 'medium' | 'low';

/**
 * DeviceService — single source of truth for capability & preference.
 * Drives adaptive quality (DPR clamp, particle counts, post-processing)
 * and motion gating (prefers-reduced-motion, touch vs pointer).
 */
@Injectable({ providedIn: 'root' })
export class DeviceService {
  readonly width = signal(typeof window !== 'undefined' ? window.innerWidth : 1440);
  readonly height = signal(typeof window !== 'undefined' ? window.innerHeight : 900);

  readonly isTouch = signal(
    typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches,
  );
  readonly reducedMotion = signal(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  readonly isMobile = computed(() => this.width() < 768);
  readonly isTablet = computed(() => this.width() >= 768 && this.width() < 1100);

  /** Heuristic hardware tier — used to scale the 3D workload. */
  readonly tier = signal<QualityTier>(this.detectTier());

  /** Device pixel ratio, clamped per tier to protect fill-rate. */
  readonly dpr = computed(() => {
    const raw = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    const cap = this.tier() === 'high' ? 2 : this.tier() === 'medium' ? 1.5 : 1;
    return Math.min(raw, cap);
  });

  /** Whether expensive post-processing (bloom) should run. */
  readonly allowPostFx = computed(() => this.tier() !== 'low' && !this.reducedMotion());

  constructor() {
    if (typeof window === 'undefined') return;

    const onResize = () => {
      this.width.set(window.innerWidth);
      this.height.set(window.innerHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });

    window
      .matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', (e) => this.reducedMotion.set(e.matches));
  }

  private detectTier(): QualityTier {
    if (typeof navigator === 'undefined') return 'medium';
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
    const mobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

    if (mobile || cores <= 4 || mem <= 4) return cores <= 2 ? 'low' : 'medium';
    if (cores >= 8 && mem >= 8) return 'high';
    return 'medium';
  }
}
