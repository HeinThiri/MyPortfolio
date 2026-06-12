import { AfterViewInit, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebglCanvas } from './layout/webgl-canvas/webgl-canvas';
import { Preloader } from './layout/preloader/preloader';
import { SiteNav } from './layout/site-nav/site-nav';
import { CustomCursor } from './layout/custom-cursor/custom-cursor';
import { ScrollProgress } from './layout/scroll-progress/scroll-progress';
import { ScrollService } from './core/services/scroll.service';
import { AppStateService } from './core/services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WebglCanvas, Preloader, SiteNav, CustomCursor, ScrollProgress],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  private readonly scroll = inject(ScrollService);
  private readonly state = inject(AppStateService);

  ngAfterViewInit(): void {
    // Smooth scrolling boots immediately; the curtain hides the first frames.
    this.scroll.init();
    this.scroll.stop(); // hold the page still beneath the preloader
  }

  /** Called by the preloader once its curtain has fully cleared. */
  onPreloaderDone(): void {
    this.scroll.start();
    this.scroll.refresh();
    this.state.entered.set(true);
  }
}
