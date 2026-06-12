import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BounceCards } from '../../shared/components/bounce-cards/bounce-cards';

/**
 * About — storytelling block. An editorial statement + bio sit beside a
 * composite portrait; below, the three info cards (Personal Info, Achievements,
 * Skills) are fanned out in a BounceCards stack that springs in on reveal and
 * reacts to hover.
 */
@Component({
  selector: 'aurora-about',
  standalone: true,
  imports: [RevealDirective, BounceCards],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  /** Resting fan positions — one transform per info card. */
  readonly cardTransforms = [
    'rotate(-7deg) translate(-330px)',
    'rotate(0deg)',
    'rotate(7deg) translate(330px)',
  ];
}
