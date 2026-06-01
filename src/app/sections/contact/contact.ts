import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { DeviceService } from '../../core/services/device.service';
import { ScrollService } from '../../core/services/scroll.service';

/**
 * Contact — the closing scene. A large, magnetic call-to-action over a soft
 * glow, then a quiet footer reveal. The email + socials remain real, crawlable
 * links for SEO and accessibility.
 */
@Component({
  selector: 'aurora-contact',
  standalone: true,
  imports: [MagneticDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements AfterViewInit {
  private readonly device = inject(DeviceService);
  private readonly scroll = inject(ScrollService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  readonly year = 2026;
  readonly socials = [
    { label: 'GitHub', href: '#' },
    { label: 'Dribbble', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Read.cv', href: '#' },
  ];

  ngAfterViewInit(): void {
    if (this.device.reducedMotion()) return;
    const el = this.root().nativeElement;

    const headline = el.querySelector('.contact-headline');
    if (headline) {
      gsap.from(headline, {
        scale: 0.92,
        opacity: 0,
        y: 60,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      });
    }

    gsap.from(el.querySelectorAll('.contact-fade'), {
      opacity: 0,
      y: 26,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 60%', once: true },
    });
  }

  scrollTop(): void {
    this.scroll.scrollTo(0);
  }
}
