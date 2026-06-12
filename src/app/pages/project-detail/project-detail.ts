import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { ProjectCard } from '../../shared/components/project-card/project-card';
import { MotionService } from '../../core/services/motion.service';
import { ScrollService } from '../../core/services/scroll.service';
import { Project, projectBySlug } from '../../core/content';

/**
 * ProjectDetail — dedicated page for a single project (/work/:slug). Hero with
 * parallax banner, overview, objectives/challenges/solutions, key features,
 * tech stack, related projects and a closing CTA. Scroll reveals throughout.
 */
@Component({
  selector: 'aurora-project-detail',
  standalone: true,
  imports: [RouterLink, RevealDirective, ProjectCard],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly motion = inject(MotionService);
  private readonly scroll = inject(ScrollService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly project = signal<Project | undefined>(undefined);
  readonly related = computed(
    () => (this.project()?.related ?? []).map(projectBySlug).filter((p): p is Project => !!p),
  );

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pm) => {
      const found = projectBySlug(pm.get('slug') ?? '');
      if (!found) {
        this.router.navigate(['/']);
        return;
      }
      this.project.set(found);
      this.scroll.jumpToTop();
      // Recompute ScrollTrigger positions once the new content has painted.
      requestAnimationFrame(() => this.scroll.refresh());
    });
  }

  ngAfterViewInit(): void {
    const img = this.host.nativeElement.querySelector<HTMLElement>('.pd-hero-img');
    if (img) this.motion.parallax(img, { speed: 0.16 });
  }
}
