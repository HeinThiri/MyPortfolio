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

  readonly achievements = [
    'General English Four Skills',
    'Association Machinery Program',
    'First Prize (2019-2020) Academic Year',
    'Huawei Seeds For The Future Program 2020',
    'Diploma in Professional English',
  ];

  readonly stack = [
    { name: 'Angular', icon: '/icons/angular.svg' },
    { name: 'Figma', icon: '/icons/figma.svg' },
    { name: 'GitHub', icon: '/icons/github.svg' },
    { name: 'JavaScript', icon: '/icons/javascript.svg' },
    { name: 'Wix', icon: '/icons/wix.svg' },
    { name: 'WordPress', icon: '/icons/wordpress.svg' },
  ];
}
