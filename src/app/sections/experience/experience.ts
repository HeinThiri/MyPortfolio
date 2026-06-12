import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { DeviceService } from '../../core/services/device.service';

interface Node {
  x: number;
  y: number;
  top: boolean;
}

/** Catmull-Rom → cubic Bézier: a smooth curve through all points. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Experience — a premium "Professional Journey": education, work and
 * achievements as connected milestones along an animated curved path. The path
 * draws itself on scroll; nodes carry icons and glass cards lift on hover.
 */
@Component({
  selector: 'aurora-experience',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class Experience implements AfterViewInit {
  private readonly device = inject(DeviceService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  readonly hovered = signal<number | null>(null);

  readonly stats = [
    { value: '3+', label: 'Years Experience' },
    { value: '20+', label: 'Projects Delivered' },
    { value: '10+', label: 'Technologies' },
    { value: '100%', label: 'Passion for Learning' },
  ];

  // Real career milestones (chronological). iconKey drives the line icon.
  readonly milestones = [
    {
      type: 'Education',
      iconKey: 'edu',
      year: '2019 — 2020',
      title: 'B.Sc. Computer Science',
      org: 'University of Computer Studies, Magway',
      summary:
        'Software engineering, web development and database systems — graduated with First Prize for the academic year.',
      skills: ['Software Eng.', 'Databases', 'Web Dev'],
    },
    {
      type: 'Internship',
      iconKey: 'work',
      year: '2019 — 2020',
      title: 'Software Developer Intern',
      org: 'Myanmar IT Star Co., Ltd',
      summary:
        'Built the “MCrop” platform with C# and .NET to help farmers check crop prices and find nearby buyers.',
      skills: ['C#', '.NET', 'MySQL'],
    },
    {
      type: 'Achievement',
      iconKey: 'award',
      year: '2020',
      title: 'Huawei Seeds for the Future',
      org: 'Huawei Global Program 2020',
      summary:
        'Selected for Huawei’s flagship global technology leadership and training program.',
      skills: ['Leadership', 'Cloud', '5G'],
    },
    {
      type: 'Experience',
      iconKey: 'work',
      year: '2020 — 2022',
      title: 'Database Admin & Customer Support',
      org: 'Best Guide Education Agency',
      summary:
        'Managed data entry and queries, supported clients directly and maintained strong customer relationships.',
      skills: ['SQL', 'Data Entry', 'Client Care'],
    },
    {
      type: 'Experience',
      iconKey: 'work',
      year: '2022 — Present',
      title: 'Frontend Developer',
      org: 'Systematic Business Solution Co., Ltd',
      summary:
        'Building Angular apps (SMART HR, QR, ERP) and banking sites, integrating ASP.NET REST APIs with WordPress & Wix.',
      skills: ['Angular', 'TypeScript', 'ASP.NET', 'WordPress'],
    },
  ];

  // Wave node positions in the path's 100×32 viewBox; alternate card side.
  readonly nodes: Node[] = [
    { x: 10, y: 20, top: false },
    { x: 30, y: 12, top: true },
    { x: 50, y: 20, top: false },
    { x: 70, y: 12, top: true },
    { x: 90, y: 20, top: false },
  ];

  readonly pathD = smoothPath([
    { x: 0, y: 16 },
    ...this.nodes.map((n) => ({ x: n.x, y: n.y })),
    { x: 100, y: 16 },
  ]);

  ngAfterViewInit(): void {
    if (this.device.reducedMotion()) return;
    const el = this.root().nativeElement;

    const journey = el.querySelector('.journey');

    // One-time "reveal" timeline that fires when the section is reached: the
    // line draws itself, then the milestone nodes pop in along it.
    const reveal = gsap.timeline({
      scrollTrigger: { trigger: journey, start: 'top 72%', once: true },
    });

    const path = el.querySelector<SVGPathElement>('.jx-path');
    if (path) {
      reveal.fromTo(
        path,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut' },
        0,
      );
    }

    const nodes = el.querySelectorAll<HTMLElement>('.jx-node');
    reveal.from(
      nodes,
      {
        opacity: 0,
        y: 28,
        scale: 0.92,
        duration: 0.7,
        ease: 'back.out(1.6)',
        stagger: 0.14,
      },
      0.5,
    );

    ScrollTrigger.refresh();
  }
}
