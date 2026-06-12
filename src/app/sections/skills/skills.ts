import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';

/**
 * Skills — a services list + headline stats on the left, paired with an
 * interactive 3D keyboard of tech-stack keycaps (pure CSS) on the right.
 */
@Component({
  selector: 'aurora-skills',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills {
  // High-level services (what I deliver) — complements the tool logos on the
  // right rather than repeating them.
  readonly services = [
    { name: 'Web Development', note: 'Responsive websites & single-page apps' },
    { name: 'UI / UX Design', note: 'User-focused interfaces, prototyped in Figma' },
    { name: 'CMS & No-Code', note: 'WordPress, Wix & custom content builds' },
    { name: 'Backend & Data', note: 'APIs and databases with C#, PHP & SQL' },
  ];

  // Headline stats — adjust the numbers to your real figures.
  readonly stats = [
    { value: '180+', label: 'Projects Completed' },
    { value: '3+', label: 'Years Experience' },
    { value: '100%', label: 'On-Time Delivery' },
  ];

  // Tech stack as keyboard keycaps. `color` is the brand colour that tints the
  // keycap; `tone:'light'` flips dark-logo keys (GitHub, Wix) to a light cap so
  // the logo stays visible. `large` flags the hero keys.
  readonly keys = [
    { name: 'Angular', icon: '/icons/angular.svg', color: '#dd0031', large: true, link: 'https://angular.dev' },
    { name: 'TypeScript', icon: '/icons/typescript.svg', color: '#3178c6', large: true, link: 'https://www.typescriptlang.org' },
    { name: 'JavaScript', icon: '/icons/javascript.svg', color: '#f7df1e', link: 'https://developer.mozilla.org/docs/Web/JavaScript' },
    { name: 'HTML5', icon: '/icons/html.svg', color: '#e34f26', link: 'https://developer.mozilla.org/docs/Web/HTML' },
    { name: 'CSS3', icon: '/icons/css.svg', color: '#1572b6', link: 'https://developer.mozilla.org/docs/Web/CSS' },
    { name: 'SCSS', icon: '/icons/sass.svg', color: '#cd6799', link: 'https://sass-lang.com' },
    { name: 'WordPress', icon: '/icons/wordpress.svg', color: '#21759b', large: true, link: 'https://wordpress.org' },
    { name: 'Wix', icon: '/icons/wix.svg', color: '#0c6efc', tone: 'light', link: 'https://www.wix.com' },
    { name: 'GitHub', icon: '/icons/github.svg', color: '#6e5494', tone: 'light', link: 'https://github.com' },
    { name: 'Figma', icon: '/icons/figma.svg', color: '#f24e1e', link: 'https://www.figma.com' },
    { name: 'REST API', icon: '/icons/restapi.svg', color: '#16a394', link: 'https://restfulapi.net' },
    { name: 'Bootstrap', icon: '/icons/bootstrap.svg', color: '#7952b3', link: 'https://getbootstrap.com' },
  ];
}
