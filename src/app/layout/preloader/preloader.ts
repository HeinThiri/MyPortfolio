import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { LoaderService } from '../../core/services/loader.service';

/**
 * Elegant boot sequence: a minimal counter + thin progress line, then a soft
 * curtain wipe revealing the hero. Emits `done` when the curtain has cleared.
 */
@Component({
  selector: 'aurora-preloader',
  standalone: true,
  templateUrl: './preloader.html',
  styleUrl: './preloader.scss',
})
export class Preloader implements OnInit, AfterViewInit {
  private readonly loader = inject(LoaderService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  readonly done = output<void>();

  readonly percent = signal(0);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private finished = false;

  ngOnInit(): void {
    // Mirror loader progress into a rounded percent for the counter.
    const sync = () => {
      this.percent.set(Math.round(this.loader.progress() * 100));
      if (this.percent() < 100) requestAnimationFrame(sync);
    };
    requestAnimationFrame(sync);
  }

  async ngAfterViewInit(): Promise<void> {
    await this.loader.boot();
    this.percent.set(100);
    this.playOutro();
  }

  private playOutro(): void {
    const el = this.root().nativeElement;
    const tl = gsap.timeline({ onComplete: () => this.complete() });
    tl.to('.pl-meta', { opacity: 0, y: -16, duration: 0.5, ease: 'power2.out' })
      .to(
        el.querySelectorAll('.pl-panel'),
        {
          scaleY: 0,
          transformOrigin: 'top',
          duration: 1.1,
          ease: 'expo.inOut',
          stagger: 0.08,
        },
        '-=0.1',
      )
      .set(el, { display: 'none' });

    // Hard fallback: if GSAP's ticker stalls (backgrounded tab), force the
    // overlay away so the site can never stay frozen behind the curtain.
    setTimeout(() => this.complete(), 2200);
  }

  /** Idempotently tear down the overlay and notify the shell. */
  private complete(): void {
    if (this.finished) return;
    this.finished = true;
    this.hostEl.nativeElement.style.display = 'none';
    this.done.emit();
  }
}
