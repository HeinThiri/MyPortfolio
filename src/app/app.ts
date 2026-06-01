import { AfterViewInit, Component, inject } from '@angular/core';
import { WebglCanvas } from './layout/webgl-canvas/webgl-canvas';
import { Preloader } from './layout/preloader/preloader';
import { SiteNav } from './layout/site-nav/site-nav';
import { CustomCursor } from './layout/custom-cursor/custom-cursor';
import { ScrollProgress } from './layout/scroll-progress/scroll-progress';
import { Hero } from './sections/hero/hero';
import { About } from './sections/about/about';
import { Skills } from './sections/skills/skills';
import { Projects } from './sections/projects/projects';
import { Experience } from './sections/experience/experience';
import { Contact } from './sections/contact/contact';
import { ScrollService } from './core/services/scroll.service';
import { AppStateService } from './core/services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    WebglCanvas,
    Preloader,
    SiteNav,
    CustomCursor,
    ScrollProgress,
    Hero,
    About,
    Skills,
    Projects,
    Experience,
    Contact,
  ],
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
