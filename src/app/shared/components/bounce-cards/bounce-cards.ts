import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DeviceService } from '../../../core/services/device.service';

gsap.registerPlugin(ScrollTrigger);

/**
 * BounceCards — an Angular port of the reactbits bounce-cards effect. Project
 * any number of `.card` elements; they fan out into the resting positions given
 * by `transformStyles`, spring in on mount, and react to hover — the hovered
 * card straightens while its siblings are pushed aside.
 *
 *   <aurora-bounce-cards [transformStyles]="transforms" [containerWidth]="960">
 *     <article class="card">…</article>
 *     <article class="card">…</article>
 *   </aurora-bounce-cards>
 */
@Component({
  selector: 'aurora-bounce-cards',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './bounce-cards.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'bounce-cards',
    '[style.width.px]': 'containerWidth()',
    '[style.height.px]': 'containerHeight()',
  },
})
export class BounceCards implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly device = inject(DeviceService);

  readonly containerWidth = input(400);
  readonly containerHeight = input(400);
  readonly animationDelay = input(0.5);
  readonly animationStagger = input(0.06);
  readonly easeType = input('elastic.out(1, 0.8)');
  /** ScrollTrigger start position — when the fan springs into view. */
  readonly scrollStart = input('top 80%');
  readonly transformStyles = input<string[]>([
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)',
  ]);
  readonly enableHover = input(true);

  private cards: HTMLElement[] = [];
  private ctx?: gsap.Context;
  private readonly cleanups: Array<() => void> = [];

  ngAfterViewInit(): void {
    this.cards = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(':scope > .card'),
    );
    if (!this.cards.length) return;

    // Lay the cards out in their resting fan (mirrors the React inline style).
    this.cards.forEach((el, i) => {
      el.style.transform = this.transformStyles()[i] ?? 'none';
    });

    // Reduced motion: keep the static fan, no spring-in or hover reactions.
    if (this.device.reducedMotion()) return;

    this.zone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        // Cards start collapsed (scale 0, immediateRender) and spring in when
        // the fan scrolls into view.
        gsap.fromTo(
          '.card',
          { scale: 0 },
          {
            scale: 1,
            stagger: this.animationStagger(),
            ease: this.easeType(),
            delay: this.animationDelay(),
            scrollTrigger: {
              trigger: this.host.nativeElement,
              start: this.scrollStart(),
              once: true,
            },
          },
        );
      }, this.host.nativeElement);

      if (this.enableHover()) {
        this.cards.forEach((el, i) => {
          const enter = () => this.pushSiblings(i);
          const leave = () => this.resetSiblings();
          el.addEventListener('mouseenter', enter);
          el.addEventListener('mouseleave', leave);
          this.cleanups.push(() => {
            el.removeEventListener('mouseenter', enter);
            el.removeEventListener('mouseleave', leave);
          });
        });
      }
    });
  }

  private pushSiblings(hoveredIdx: number): void {
    this.cards.forEach((target, i) => {
      gsap.killTweensOf(target);
      const baseTransform = this.transformStyles()[i] ?? 'none';

      if (i === hoveredIdx) {
        gsap.to(target, {
          transform: this.getNoRotationTransform(baseTransform),
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto',
        });
      } else {
        const offsetX = i < hoveredIdx ? -160 : 160;
        const distance = Math.abs(hoveredIdx - i);
        gsap.to(target, {
          transform: this.getPushedTransform(baseTransform, offsetX),
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay: distance * 0.05,
          overwrite: 'auto',
        });
      }
    });
  }

  private resetSiblings(): void {
    this.cards.forEach((target, i) => {
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: this.transformStyles()[i] ?? 'none',
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto',
      });
    });
  }

  private getNoRotationTransform(transformStr: string): string {
    const rotateRegex = /rotate\([\s\S]*?\)/;
    if (rotateRegex.test(transformStr)) {
      return transformStr.replace(rotateRegex, 'rotate(0deg)');
    }
    return transformStr === 'none' ? 'rotate(0deg)' : `${transformStr} rotate(0deg)`;
  }

  private getPushedTransform(baseTransform: string, offsetX: number): string {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const newX = parseFloat(match[1]) + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    }
    return baseTransform === 'none'
      ? `translate(${offsetX}px)`
      : `${baseTransform} translate(${offsetX}px)`;
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.ctx?.revert();
  }
}
