import { Injectable, signal } from '@angular/core';

/** Cross-cutting UI state. `entered` flips true the moment the preloader clears. */
@Injectable({ providedIn: 'root' })
export class AppStateService {
  readonly entered = signal(false);
}
