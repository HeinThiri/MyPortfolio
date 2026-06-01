import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import { WebGLEngineService } from '../../core/services/webgl-engine.service';
import { DeviceService } from '../../core/services/device.service';
import { ParticleField } from '../../three/objects/particle-field';

/**
 * Fixed full-viewport canvas sitting behind all DOM content. Boots the shared
 * WebGL engine and seeds the global atmospheric particle field.
 */
@Component({
  selector: 'aurora-webgl-canvas',
  standalone: true,
  template: `<canvas #canvas class="scene" aria-hidden="true"></canvas>`,
  styles: [
    `
      .scene {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: var(--z-canvas);
        pointer-events: none;
      }
    `,
  ],
})
export class WebglCanvas implements AfterViewInit, OnDestroy {
  private readonly engine = inject(WebGLEngineService);
  private readonly device = inject(DeviceService);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private field?: ParticleField;

  ngAfterViewInit(): void {
    this.engine.init(this.canvasRef().nativeElement);

    // Particle count scales with hardware tier to hold 60fps.
    const count =
      this.device.tier() === 'high' ? 1800 : this.device.tier() === 'medium' ? 1000 : 450;
    this.field = new ParticleField(count);
    this.engine.register(this.field);

    this.engine.start();
  }

  ngOnDestroy(): void {
    if (this.field) this.engine.unregister(this.field);
  }
}
