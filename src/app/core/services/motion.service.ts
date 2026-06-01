import { Injectable, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DeviceService } from './device.service';

/**
 * MotionService — the reusable animation vocabulary of the site.
 * Every section composes these primitives so motion feels consistent:
 * the same easing, the same stagger rhythm, the same reveal language.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly device = inject(DeviceService);

  /** Shared cinematic easing curve (expo-out feel). */
  readonly ease = 'expo.out';

  /**
   * Split an element's text into word spans wrapped in line-clip masks.
   * Returns the word nodes for staggered reveals. Pure DOM, no extra deps.
   */
  splitWords(el: HTMLElement): HTMLElement[] {
    if (el.dataset['split'] === 'done') {
      return Array.from(el.querySelectorAll<HTMLElement>('.reveal-word'));
    }
    const words = (el.textContent ?? '').split(/(\s+)/);
    el.textContent = '';
    const nodes: HTMLElement[] = [];
    const line = document.createElement('span');
    line.className = 'reveal-line';

    for (const token of words) {
      if (/^\s+$/.test(token)) {
        line.appendChild(document.createTextNode(token));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'reveal-word';
      word.textContent = token;
      line.appendChild(word);
      nodes.push(word);
    }
    el.appendChild(line);
    el.dataset['split'] = 'done';
    return nodes;
  }

  /** Staggered, masked word reveal triggered when `el` enters the viewport. */
  revealText(el: HTMLElement, opts: { y?: number; stagger?: number; start?: string } = {}): void {
    const words = this.splitWords(el);
    if (this.device.reducedMotion()) {
      gsap.set(words, { yPercent: 0, opacity: 1 });
      return;
    }
    gsap.set(words, { yPercent: 120, opacity: 0 });
    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 1.1,
      ease: this.ease,
      stagger: opts.stagger ?? 0.045,
      scrollTrigger: { trigger: el, start: opts.start ?? 'top 85%', once: true },
    });
  }

  /** Generic fade+rise reveal for any block element or NodeList. */
  reveal(
    targets: gsap.TweenTarget,
    opts: { y?: number; stagger?: number; start?: string; trigger?: Element } = {},
  ): void {
    if (this.device.reducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }
    gsap.from(targets, {
      y: opts.y ?? 40,
      opacity: 0,
      duration: 1,
      ease: this.ease,
      stagger: opts.stagger ?? 0.12,
      scrollTrigger: {
        trigger: opts.trigger ?? (targets as Element),
        start: opts.start ?? 'top 82%',
        once: true,
      },
    });
  }

  /** A paused timeline for imperative orchestration. */
  timeline(vars?: gsap.TimelineVars): gsap.core.Timeline {
    return gsap.timeline({ defaults: { ease: this.ease }, ...vars });
  }

  /** Pinned, scrubbed timeline — the backbone of section storytelling. */
  scrubbed(trigger: Element, opts: { end?: string; pin?: boolean } = {}): gsap.core.Timeline {
    return gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: opts.end ?? '+=120%',
        scrub: 1,
        pin: opts.pin ?? false,
        anticipatePin: 1,
      },
    });
  }

  killAll(): void {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.globalTimeline.clear();
  }
}
