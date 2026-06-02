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

  /**
   * Staggered, masked word reveal triggered when `el` enters the viewport.
   * `blur: true` adds a blur-to-sharp focus-in on each word.
   */
  revealText(
    el: HTMLElement,
    opts: { y?: number; stagger?: number; start?: string; blur?: boolean } = {},
  ): void {
    const words = this.splitWords(el);
    if (this.device.reducedMotion()) {
      gsap.set(words, { yPercent: 0, opacity: 1, filter: 'blur(0px)' });
      return;
    }
    gsap.set(words, { yPercent: 120, opacity: 0, filter: opts.blur ? 'blur(12px)' : 'none' });
    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      filter: 'blur(0px)',
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

  /**
   * Scroll parallax — drifts an element against the scroll as it crosses the
   * viewport. `speed` is the fraction of the element's own size it travels in
   * each direction (0.15 subtle … 0.5 strong); negative reverses. The element
   * sits at its natural position when centered in the viewport, so there's no
   * layout jump. Returns the tween (with its ScrollTrigger) for disposal.
   */
  parallax(
    el: Element,
    opts: {
      speed?: number;
      axis?: 'x' | 'y';
      start?: string;
      end?: string;
      trigger?: Element;
    } = {},
  ): gsap.core.Tween | undefined {
    if (this.device.reducedMotion()) return undefined;
    const prop = (opts.axis ?? 'y') === 'y' ? 'yPercent' : 'xPercent';
    const shift = (opts.speed ?? 0.2) * 100;
    return gsap.fromTo(
      el,
      { [prop]: -shift },
      {
        [prop]: shift,
        ease: 'none',
        scrollTrigger: {
          trigger: opts.trigger ?? el,
          start: opts.start ?? 'top bottom',
          end: opts.end ?? 'bottom top',
          scrub: true,
        },
      },
    );
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
