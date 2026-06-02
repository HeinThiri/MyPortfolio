import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { CardSwap } from '../../shared/components/card-swap/card-swap';

/**
 * About — storytelling block. A large editorial statement reveals word by word,
 * followed by the supporting bio copy. The tech-stack orbit now lives in the
 * Skills section.
 */
@Component({
  selector: 'aurora-about',
  standalone: true,
  imports: [RevealDirective, CardSwap],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
