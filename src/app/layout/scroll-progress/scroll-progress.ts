import { Component, inject } from '@angular/core';
import { ScrollService } from '../../core/services/scroll.service';

/** Hairline progress bar pinned to the top edge — quiet, premium feedback. */
@Component({
  selector: 'aurora-scroll-progress',
  standalone: true,
  template: `<div class="progress" [style.transform]="'scaleX(' + scroll.progress() + ')'"></div>`,
  styles: [
    `
      .progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        z-index: var(--z-nav);
        transform-origin: left;
        background: var(--grad-accent);
        will-change: transform;
      }
    `,
  ],
})
export class ScrollProgress {
  readonly scroll = inject(ScrollService);
}
