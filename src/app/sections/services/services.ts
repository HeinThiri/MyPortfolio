import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { DeviceService } from '../../core/services/device.service';

interface Service {
  iconKey: string;
  title: string;
  desc: string;
  features: string[];
}

interface FloatCard {
  label: string;
  value: string;
  icon: string;
  x: number;
  y: number;
  rot: number;
  delay: number;
}

/**
 * Services — a premium SaaS-style service showcase. A sticky device mockup with
 * floating glassmorphism metric cards on the left; heading, animated stat
 * counters and revealing service cards on the right. Reveal + counters fire via
 * IntersectionObserver; pointer parallax adds depth.
 */
@Component({
  selector: 'aurora-services',
  standalone: true,
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements AfterViewInit, OnDestroy {
  private readonly device = inject(DeviceService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly revealed = signal(false);
  readonly counts = signal<number[]>([0, 0, 0, 0]);
  readonly px = signal(0);
  readonly py = signal(0);

  readonly stats = [
    { target: 100, suffix: '+', label: 'Projects Completed' },
    { target: 50, suffix: '+', label: 'Happy Clients' },
    { target: 5, suffix: '+', label: 'Years Experience' },
    { target: 99, suffix: '%', label: 'Client Satisfaction' },
  ];

  // Floating service cards around the phone (x = horizontal centre, %).
  readonly floatCards: FloatCard[] = [
    { label: 'Corporate & Business', value: 'Website Dev', icon: 'web', x: 12, y: 4, rot: -5, delay: 0 },
    { label: 'Fast & Secure', value: 'Static Sites', icon: 'bolt', x: 80, y: -2, rot: 4, delay: 0.5 },
    { label: 'Apps & APIs', value: 'Dynamic Sites', icon: 'database', x: 84, y: 44, rot: 6, delay: 0.9 },
    { label: 'Research to Design', value: 'UI / UX', icon: 'pen', x: 10, y: 50, rot: 5, delay: 0.3 },
    { label: 'Every Device', value: 'Responsive', icon: 'devices', x: 16, y: 86, rot: -4, delay: 1.2 },
    { label: 'Creative Visuals', value: 'Photoshop', icon: 'image', x: 78, y: 88, rot: 3, delay: 1.5 },
  ];

  readonly services: Service[] = [
    {
      iconKey: 'web',
      title: 'Website Development',
      desc: 'Professional business websites built to increase visibility, engagement and conversions.',
      features: ['Corporate Websites', 'Company Profiles', 'Landing Pages', 'Business Websites'],
    },
    {
      iconKey: 'bolt',
      title: 'Static Website Development',
      desc: 'Fast, secure and lightweight websites that load instantly.',
      features: ['SEO Friendly', 'High Performance', 'Secure Hosting', 'Easy Maintenance'],
    },
    {
      iconKey: 'database',
      title: 'Dynamic Website Development',
      desc: 'Custom web applications powered by modern technologies.',
      features: ['Database Integration', 'Admin Panels', 'User Authentication', 'API Integration'],
    },
    {
      iconKey: 'pen',
      title: 'UI / UX Design',
      desc: 'Intuitive and engaging digital experiences from research to polished interface.',
      features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    },
    {
      iconKey: 'devices',
      title: 'Responsive Web Design',
      desc: 'Flawless performance across every device and screen size.',
      features: ['Mobile First Design', 'Tablet Optimization', 'Desktop Compatibility', 'Cross Browser'],
    },
    {
      iconKey: 'image',
      title: 'Photoshop & Graphic Design',
      desc: 'Creative visual solutions and brand identity for businesses.',
      features: ['Banner Design', 'Marketing Graphics', 'Social Media Assets', 'Branding Materials'],
    },
    {
      iconKey: 'grid',
      title: 'Portal Development',
      desc: 'Enterprise portals for business operations of any scale.',
      features: ['Employee Portal', 'Customer Portal', 'Vendor Portal', 'Management Dashboard'],
    },
  ];

  // Technology stack grouped by discipline.
  readonly techGroups = [
    {
      label: 'Frontend',
      items: [
        { name: 'Angular', icon: '/icons/angular.svg' },
        { name: 'React', icon: '/icons/react.svg' },
        { name: 'Next.js', icon: '/icons/nextjs.svg' },
        { name: 'TypeScript', icon: '/icons/typescript.svg' },
      ],
    },
    {
      label: 'Backend',
      items: [
        { name: '.NET', icon: '/icons/dotnet.svg' },
        { name: 'Node.js', icon: '/icons/nodejs.svg' },
        { name: 'Spring Boot', icon: '/icons/spring.svg' },
      ],
    },
    {
      label: 'Database',
      items: [
        { name: 'SQL Server', icon: '/icons/sqlserver.svg' },
        { name: 'PostgreSQL', icon: '/icons/postgresql.svg' },
        { name: 'MySQL', icon: '/icons/mysql.svg' },
      ],
    },
    {
      label: 'Design',
      items: [
        { name: 'Figma', icon: '/icons/figma.svg' },
        { name: 'Photoshop', icon: '/icons/photoshop.svg' },
        { name: 'Illustrator', icon: '/icons/illustrator.svg' },
      ],
    },
  ];

  private io?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (this.device.reducedMotion() || typeof IntersectionObserver === 'undefined') {
      this.revealed.set(true);
      this.counts.set(this.stats.map((s) => s.target));
      return;
    }
    const target = this.host.nativeElement.querySelector('.svc-grid') ?? this.host.nativeElement;
    // threshold 0 + bottom rootMargin: fires as soon as the section scrolls in,
    // even when the grid is taller than the viewport (a fixed ratio could never
    // be met then, leaving the content stuck hidden).
    this.io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.revealed.set(true);
          this.animateCounts();
          this.io?.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    );
    this.io.observe(target);
  }

  private animateCounts(): void {
    const duration = 1800;
    const t0 = performance.now();
    const tick = (now: number): void => {
      const p = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      this.counts.set(this.stats.map((s) => Math.round(s.target * e)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  onMove(e: PointerEvent, host: HTMLElement): void {
    const r = host.getBoundingClientRect();
    this.px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    this.py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }

  onLeave(): void {
    this.px.set(0);
    this.py.set(0);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}
