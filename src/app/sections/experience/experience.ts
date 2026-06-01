import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { DeviceService } from '../../core/services/device.service';
import { EXPERIENCE } from '../../core/content';

/**
 * Experience — a minimal vertical timeline. A gradient progress line draws
 * itself as you scroll, and each milestone reveals in sequence.
 */
@Component({
  selector: 'aurora-experience',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class Experience implements AfterViewInit {
  private readonly device = inject(DeviceService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  readonly items = EXPERIENCE;

  ngAfterViewInit(): void {
    if (this.device.reducedMotion()) return;
    const el = this.root().nativeElement;
    const line = el.querySelector('.timeline-progress');

    if (line) {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el.querySelector('.timeline'),
            start: 'top 70%',
            end: 'bottom 80%',
            scrub: 1,
          },
        },
      );
    }

    el.querySelectorAll<HTMLElement>('.milestone').forEach((node) => {
      gsap.from(node, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: { trigger: node, start: 'top 85%', once: true },
      });
    });

    ScrollTrigger.refresh();
  }
}
