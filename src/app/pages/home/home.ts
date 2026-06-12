import { Component } from '@angular/core';
import { Hero } from '../../sections/hero/hero';
import { About } from '../../sections/about/about';
import { Skills } from '../../sections/skills/skills';
import { Services } from '../../sections/services/services';
import { Projects } from '../../sections/projects/projects';
import { Experience } from '../../sections/experience/experience';
import { Contact } from '../../sections/contact/contact';

/**
 * Home — the single-page section stack (index route). Pulled out of the App
 * shell so a router-outlet can swap in dedicated pages like project detail.
 */
@Component({
  selector: 'aurora-home',
  standalone: true,
  imports: [Hero, About, Skills, Services, Projects, Experience, Contact],
  template: `
    <aurora-hero />
    <aurora-about />
    <aurora-skills />
    <aurora-projects />
    <aurora-experience />
    <aurora-services />
    <aurora-contact />
  `,
})
export class Home {}
