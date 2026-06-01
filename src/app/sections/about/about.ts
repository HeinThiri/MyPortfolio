import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { DeviceService } from '../../core/services/device.service';

/**
 * About — storytelling block. A large editorial statement reveals word by word
 * while three layered "depth" cards drift at different parallax speeds.
 */
@Component({
  selector: 'aurora-about',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements AfterViewInit {
  private readonly device = inject(DeviceService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  readonly stats = [
    { value: '6+', label: 'Years crafting' },
    { value: '40+', label: 'Shipped experiences' },
    { value: '12', label: 'Awards & honors' },
  ];

  ngAfterViewInit(): void {
    if (this.device.reducedMotion()) return;
    const el = this.root().nativeElement;

    // Layered parallax — each card moves at its own depth.
    el.querySelectorAll<HTMLElement>('[data-depth]').forEach((card) => {
      const depth = parseFloat(card.dataset['depth'] ?? '0');
      gsap.to(card, {
        yPercent: -depth * 18,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    });

    ScrollTrigger.refresh();
  }
}
