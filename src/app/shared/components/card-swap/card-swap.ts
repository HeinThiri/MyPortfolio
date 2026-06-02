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
import { DeviceService } from '../../../core/services/device.service';

interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

// Two easing personalities, mirroring the original CardSwap presets.
const EASING = {
  elastic: {
    ease: 'elastic.out(0.6, 0.9)',
    durDrop: 2,
    durMove: 2,
    durReturn: 2,
    promoteOverlap: 0.9,
    returnDelay: 0.05,
  },
  smooth: {
    ease: 'power1.inOut',
    durDrop: 0.8,
    durMove: 0.8,
    durReturn: 0.8,
    promoteOverlap: 0.45,
    returnDelay: 0.2,
  },
} as const;

/**
 * CardSwap — an Angular port of the reactbits stacked-card-swap effect. Project
 * any number of `.card` elements; they sit in a 3D stack and cycle on an
 * interval: the front card drops, the rest promote forward, and the dropped
 * card returns to the back. Clicking a card toggles a `selected` class.
 *
 *   <aurora-card-swap [delay]="4000" [pauseOnHover]="true">
 *     <article class="card">…</article>
 *     <article class="card">…</article>
 *   </aurora-card-swap>
 */
@Component({
  selector: 'aurora-card-swap',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './card-swap.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'card-swap',
    '[style.--cs-w.px]': 'width()',
    '[style.--cs-h.px]': 'height()',
  },
})
export class CardSwap implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly device = inject(DeviceService);

  readonly width = input(360);
  readonly height = input(240);
  readonly cardDistance = input(60);
  readonly verticalDistance = input(70);
  readonly delay = input(5000);
  readonly pauseOnHover = input(false);
  readonly skewAmount = input(6);
  readonly easing = input<'elastic' | 'smooth'>('elastic');

  private cards: HTMLElement[] = [];
  private order: number[] = [];
  private timeline?: gsap.core.Timeline;
  private intervalId?: ReturnType<typeof setInterval>;
  private cfg: (typeof EASING)[keyof typeof EASING] = EASING.elastic;

  ngAfterViewInit(): void {
    this.cards = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(':scope > .card'),
    );
    if (!this.cards.length) return;

    this.cfg = EASING[this.easing()];
    this.order = this.cards.map((_, i) => i);

    const total = this.cards.length;
    this.cards.forEach((el, i) => this.place(el, this.slot(i, total)));

    // Click-to-select (folded in from card.js).
    this.cards.forEach((el) => el.addEventListener('click', () => el.classList.toggle('selected')));

    // Respect reduced motion / single card: leave the stack static.
    if (this.device.reducedMotion() || total < 2) return;

    this.zone.runOutsideAngular(() => {
      this.swap();
      this.intervalId = setInterval(this.swap, this.delay());
    });

    if (this.pauseOnHover()) {
      const node = this.host.nativeElement;
      node.addEventListener('mouseenter', this.pause);
      node.addEventListener('mouseleave', this.resume);
    }
  }

  private slot(i: number, total: number): Slot {
    return {
      x: i * this.cardDistance(),
      y: -i * this.verticalDistance(),
      z: -i * this.cardDistance() * 1.5,
      zIndex: total - i,
    };
  }

  private place(el: HTMLElement, slot: Slot): void {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      xPercent: -50,
      yPercent: -50,
      skewY: this.skewAmount(),
      transformOrigin: 'center center',
      zIndex: slot.zIndex,
      force3D: true,
    });
  }

  private swap = (): void => {
    if (this.order.length < 2) return;
    const cfg = this.cfg;
    const total = this.cards.length;
    const [front, ...rest] = this.order;
    const elFront = this.cards[front];

    const tl = gsap.timeline();
    this.timeline = tl;

    // Drop the front card straight down.
    tl.to(elFront, { y: '+=500', duration: cfg.durDrop, ease: cfg.ease });

    // Promote everyone else one slot forward.
    tl.addLabel('promote', `-=${cfg.durDrop * cfg.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const el = this.cards[idx];
      const slot = this.slot(i, total);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(
        el,
        { x: slot.x, y: slot.y, z: slot.z, duration: cfg.durMove, ease: cfg.ease },
        `promote+=${i * 0.15}`,
      );
    });

    // Send the dropped card to the back slot.
    const backSlot = this.slot(total - 1, total);
    tl.addLabel('return', `promote+=${cfg.durMove * cfg.returnDelay}`);
    tl.call(
      () => {
        gsap.set(elFront, { zIndex: backSlot.zIndex });
      },
      undefined,
      'return',
    );
    tl.set(elFront, { x: backSlot.x, z: backSlot.z }, 'return');
    tl.to(elFront, { y: backSlot.y, duration: cfg.durReturn, ease: cfg.ease }, 'return');
    tl.call(() => {
      this.order = [...rest, front];
    });
  };

  private pause = (): void => {
    this.timeline?.pause();
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = undefined;
  };

  private resume = (): void => {
    this.timeline?.play();
    if (!this.intervalId) this.intervalId = setInterval(this.swap, this.delay());
  };

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.timeline?.kill();
    const node = this.host.nativeElement;
    node.removeEventListener('mouseenter', this.pause);
    node.removeEventListener('mouseleave', this.resume);
  }
}
