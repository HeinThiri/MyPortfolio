import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { DeviceService } from '../../core/services/device.service';
import { PROJECTS } from '../../core/content';

/**
 * Projects — the cinematic showcase. The section title pins while large project
 * cards scroll past; each card scales/fades up on entry and its atmosphere
 * layer parallaxes for depth (Apple-style reveal).
 */
@Component({
  selector: 'aurora-projects',
  standalone: true,
  imports: [RevealDirective, MagneticDirective],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements AfterViewInit {
  private readonly device = inject(DeviceService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  readonly projects = PROJECTS;

  ngAfterViewInit(): void {
    if (this.device.reducedMotion()) return;
    const el = this.root().nativeElement;

    el.querySelectorAll<HTMLElement>('.project').forEach((card) => {
      // Cinematic entry: rise + scale + soft un-blur.
      gsap.fromTo(
        card,
        { y: 90, scale: 0.94, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        },
      );

      // Parallax the atmosphere + index for depth.
      const media = card.querySelector('.project-media');
      const index = card.querySelector('.project-index');
      if (media) {
        gsap.to(media, {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      }
      if (index) {
        gsap.to(index, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      }
    });

    ScrollTrigger.refresh();
  }
}
