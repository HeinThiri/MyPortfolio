import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';
import { MotionService } from '../../core/services/motion.service';

/**
 * auroraReveal — declarative scroll reveal. Drop it on any block to get the
 * site's signature masked fade+rise as it enters the viewport.
 *
 *   <div auroraReveal>…</div>
 *   <h2 auroraReveal="text">Headline</h2>   // word-by-word masked reveal
 *   <p auroraReveal="blur">Body</p>          // word reveal with blur-to-sharp
 */
@Directive({ selector: '[auroraReveal]', standalone: true })
export class RevealDirective implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly motion = inject(MotionService);

  readonly mode = input<'block' | 'text' | 'blur', '' | 'block' | 'text' | 'blur'>('block', {
    alias: 'auroraReveal',
    // Bare `auroraReveal` binds '' — treat it as the default block reveal.
    transform: (v) => (v === '' || v == null ? 'block' : v),
  });
  readonly delay = input(0);
  readonly start = input('top 84%');

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    if (this.mode() === 'text' || this.mode() === 'blur') {
      this.motion.revealText(el, { start: this.start(), blur: this.mode() === 'blur' });
    } else {
      this.motion.reveal(el, { start: this.start(), trigger: el });
    }
  }
}
