import { Component, inject, signal } from '@angular/core';
import { ScrollService } from '../../core/services/scroll.service';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { GlassSurface } from '../../shared/components/glass-surface/glass-surface';

interface NavLink {
  label: string;
  target: string;
}

@Component({
  selector: 'aurora-site-nav',
  standalone: true,
  imports: [MagneticDirective, GlassSurface],
  templateUrl: './site-nav.html',
  styleUrl: './site-nav.scss',
})
export class SiteNav {
  private readonly scroll = inject(ScrollService);
  readonly open = signal(false);

  readonly links: NavLink[] = [
    { label: 'About', target: '#about' },
    { label: 'Skills', target: '#skills' },
    { label: 'Work', target: '#projects' },
    { label: 'Journey', target: '#experience' },
    { label: 'Contact', target: '#contact' },
  ];

  go(target: string, e: Event): void {
    e.preventDefault();
    this.open.set(false);
    this.scroll.scrollTo(target, -40);
  }
}
