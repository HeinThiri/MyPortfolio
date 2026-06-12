import {
  AfterViewInit,
  Component,
  ElementRef,
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
import { HeroFigureViewer } from '../../three/hero-figure-viewer';

/**
 * Hero — greeting badge, single-line name, typing-role banner, CTA buttons
 * and paint-splatter portrait. Three.js centerpiece drifts behind the section.
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
  private readonly figure = viewChild.required<ElementRef<HTMLCanvasElement>>('figure');
  private centerpiece?: Centerpiece;
  private figureViewer?: HeroFigureViewer;
  private typingTimer?: ReturnType<typeof setTimeout>;

  private typingIndex = 0;
  private charIndex = 0;
  private deleting = false;

  readonly typingText = signal('');

  readonly roles = [
    'Frontend Developer',
    'Angular Developer',
    'UI Engineer',
    'Web Developer',
  ];

  constructor() {
    effect(() => {
      if (this.state.entered()) this.playIntro();
    });
  }

  ngAfterViewInit(): void {
    const detail = this.device.tier() === 'high' ? 64 : 24;
    this.centerpiece = new Centerpiece(detail);
    this.engine.register(this.centerpiece);

    this.figureViewer = new HeroFigureViewer(this.figure().nativeElement, {
      url: '/3D/hero-person.glb',
      reducedMotion: this.device.reducedMotion(),
    });

    if (this.device.reducedMotion()) {
      this.typingText.set(this.roles[0]);
    } else {
      this.startTyping();
    }
  }

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
    const el = this.root().nativeElement;
    const words = el.querySelectorAll('.hero-name .word');

    if (this.device.reducedMotion()) {
      gsap.set(
        [
          words,
          '.hero-greeting',
          '.hero-role',
          '.hero-actions',
          '.hero-visual',
          '.hero-hint',
        ],
        { opacity: 1, yPercent: 0, y: 0, x: 0, filter: 'blur(0px)' },
      );
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero-greeting', { opacity: 0, x: -24, duration: 0.8 })
      // React Bits "BlurText" style: words resolve from blurred + shifted to sharp.
      .from(
        words,
        {
          filter: 'blur(12px)',
          opacity: 0,
          y: 22,
          duration: 1.6,
          stagger: 0.28,
          ease: 'power2.out',
        },
        '-=0.45',
      )
      .from('.hero-role', { opacity: 0, x: -18, duration: 0.8 }, '-=0.75')
      .from('.hero-actions .hero-btn', { y: 22, opacity: 0, duration: 0.75, stagger: 0.1 }, '-=0.55')
      .from('.hero-visual', { x: 40, opacity: 0, duration: 1.1 }, '-=0.9')
      .from('.hero-btn--hire', { scale: 0.85, opacity: 0, duration: 0.6 }, '-=0.5')
      .from('.hero-hint', { opacity: 0, y: 10, duration: 0.8 }, '-=0.4');
  }

  ngOnDestroy(): void {
    clearTimeout(this.typingTimer);
    if (this.centerpiece) this.engine.unregister(this.centerpiece);
    this.figureViewer?.dispose();
  }
}
