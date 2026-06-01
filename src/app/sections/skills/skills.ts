import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { SKILLS } from '../../core/content';

/**
 * Skills — three glass capability cards over a slowly orbiting accent system.
 * The orbit rings are pure CSS (cheap) while the global particle field supplies
 * the 3D depth behind them.
 */
@Component({
  selector: 'aurora-skills',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills {
  readonly groups = SKILLS;
}
