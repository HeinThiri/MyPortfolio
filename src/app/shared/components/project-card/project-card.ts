import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../../core/content';

/**
 * ProjectCard — listing card linking to the project's detail page. Featured
 * image with zoom, category tag, title, short description, stack chips and a
 * "View Details" call-to-action. Reused for related projects on the detail page.
 */
@Component({
  selector: 'aurora-project-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
