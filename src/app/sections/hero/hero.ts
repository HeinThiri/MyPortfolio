import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { WebGLEngineService } from '../../core/services/webgl-engine.service';
import { DeviceService } from '../../core/services/device.service';
import { AppStateService } from '../../core/services/app-state.service';
import { Centerpiece } from '../../three/objects/centerpiece';

/**
 * Hero — the cinematic opening. The floating shader centerpiece (in the shared
 * canvas) sits behind masked, staggered display type. On `entered`, an intro
 * timeline lifts the words and fades in the meta. A scroll hint loops gently.
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

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private centerpiece?: Centerpiece;

  constructor() {
    // Fire the intro exactly when the curtain clears.
    effect(() => {
      if (this.state.entered()) this.playIntro();
    });
  }

  ngAfterViewInit(): void {
    const detail = this.device.tier() === 'high' ? 64 : 24;
    this.centerpiece = new Centerpiece(detail);
    this.engine.register(this.centerpiece);
  }

  private playIntro(): void {
    const el = this.root().nativeElement;
    const words = el.querySelectorAll('.hero-title .reveal-word, .hero-title .word');
    if (this.device.reducedMotion()) {
      gsap.set([words, '.hero-aside', '.hero-hint'], { opacity: 1, yPercent: 0, y: 0 });
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(words, { yPercent: 120, opacity: 0, duration: 1.3, stagger: 0.09 })
      .from('.hero-eyebrow', { opacity: 0, y: 14, duration: 0.8 }, '-=1.0')
      .from('.hero-aside', { opacity: 0, y: 20, duration: 0.9 }, '-=0.8')
      .from('.hero-hint', { opacity: 0, y: 10, duration: 0.8 }, '-=0.6');
  }

  ngOnDestroy(): void {
    if (this.centerpiece) this.engine.unregister(this.centerpiece);
  }
}
