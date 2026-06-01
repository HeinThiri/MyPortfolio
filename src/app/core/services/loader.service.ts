import { Injectable, signal } from '@angular/core';
import * as THREE from 'three';

/**
 * LoaderService — tracks boot progress for the preloader.
 * Wraps Three's DefaultLoadingManager (for any GLB/HDRI/textures) and also
 * waits on web-fonts so the first paint of the hero type is correct.
 *
 * Completion is driven by setTimeout (not requestAnimationFrame) and backed by
 * a HARD cap, so the bar always reaches 100% and the curtain always lifts —
 * even if rAF is throttled (background tab, low-power device). A stalled
 * preloader would otherwise sit on top of the whole experience.
 */
@Injectable({ providedIn: 'root' })
export class LoaderService {
  readonly progress = signal(0);
  readonly ready = signal(false);

  readonly manager = THREE.DefaultLoadingManager;

  private static readonly MIN_MS = 500; // minimum on-screen time (feels intentional)
  private static readonly MAX_MS = 4000; // hard cap — always finish by here

  async boot(): Promise<void> {
    let assetsTotal = 0;
    let assetsLoaded = 0;
    let fontsDone = false;

    this.manager.onStart = (_u, loaded, total) => {
      assetsLoaded = loaded;
      assetsTotal = total;
    };
    this.manager.onProgress = (_u, loaded, total) => {
      assetsLoaded = loaded;
      assetsTotal = total;
    };
    this.manager.onLoad = () => {
      assetsLoaded = assetsTotal;
    };

    const fontsReady =
      'fonts' in document ? (document as Document).fonts.ready : Promise.resolve();
    fontsReady.then(() => (fontsDone = true)).catch(() => (fontsDone = true));

    const start = performance.now();

    await new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        this.progress.set(1);
        this.ready.set(true);
        resolve();
      };

      // Guarantees completion regardless of rAF/timer throttling.
      const hardStop = setTimeout(finish, LoaderService.MAX_MS);

      const step = () => {
        if (done) return;
        const elapsed = performance.now() - start;
        const assetRatio = assetsTotal > 0 ? assetsLoaded / assetsTotal : 1;
        const ready = fontsDone && assetRatio >= 1 && elapsed >= LoaderService.MIN_MS;

        // Until ready, creep toward 90% on a time curve; once ready, pull to 100%.
        const target = ready ? 1 : Math.min(0.9, 0.12 + (elapsed / LoaderService.MAX_MS) * 0.78);
        const current = this.progress();
        this.progress.set(Math.min(1, current + (target - current) * 0.2 + 0.012));

        if (ready && this.progress() >= 0.99) {
          clearTimeout(hardStop);
          finish();
        } else {
          // setTimeout (not rAF) so the bar still advances in background tabs.
          setTimeout(step, 50);
        }
      };
      step();
    });
  }
}
