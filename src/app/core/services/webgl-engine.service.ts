import { Injectable, NgZone, inject } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { DeviceService } from './device.service';
import type { FrameContext, SceneObject } from '../../three/scene-object';

/**
 * WebGLEngineService — owns the single renderer, camera, scene-graph and
 * the rAF loop for the whole site. One canvas, fixed behind the DOM; every
 * section contributes SceneObjects rather than spinning up its own context.
 *
 * The loop runs OUTSIDE Angular's zone so 60fps rendering never triggers
 * change detection.
 */
@Injectable({ providedIn: 'root' })
export class WebGLEngineService {
  private readonly zone = inject(NgZone);
  private readonly device = inject(DeviceService);

  private renderer!: THREE.WebGLRenderer;
  private composer?: EffectComposer;
  private bloom?: UnrealBloomPass;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;

  private readonly clock = new THREE.Clock();
  private rafId = 0;
  private running = false;

  private readonly objects = new Set<SceneObject>();

  // Pointer + scroll state shared with scene objects.
  private readonly pointerTarget = new THREE.Vector2(0, 0);
  private readonly pointer = new THREE.Vector2(0, 0);
  private scroll = 0;

  private readonly ctx: FrameContext = {
    dt: 0,
    elapsed: 0,
    pointer: this.pointer,
    scroll: 0,
    camera: undefined as unknown as THREE.PerspectiveCamera,
  };

  /** Boot the engine against a host canvas. Idempotent. */
  init(canvas: HTMLCanvasElement): void {
    if (this.renderer) return;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.device.tier() !== 'low',
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(this.device.dpr());
    this.renderer.setSize(this.device.width(), this.device.height());
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      35,
      this.device.width() / this.device.height(),
      0.1,
      100,
    );
    this.camera.position.set(0, 0, 9);
    (this.ctx as { camera: THREE.PerspectiveCamera }).camera = this.camera;

    this.setupLighting();
    if (this.device.allowPostFx()) this.setupPostFx();

    this.bindEvents();
  }

  /** Soft, atmospheric studio lighting — bright, premium, never harsh. */
  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight(0xffffff, 0xdfe6f0, 1.1);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff4e6, 1.6); // warm key
    key.position.set(4, 6, 5);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xbcd6ff, 1.2); // cool rim
    rim.position.set(-5, 2, -4);
    this.scene.add(rim);

    const fill = new THREE.PointLight(0xe7d6b8, 0.6, 30); // champagne fill
    fill.position.set(0, -3, 4);
    this.scene.add(fill);
  }

  private setupPostFx(): void {
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(this.device.dpr());
    this.composer.setSize(this.device.width(), this.device.height());
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Gentle, diffuse bloom for a soft glow — not a neon halo.
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(this.device.width(), this.device.height()),
      0.42, // strength
      0.85, // radius
      0.92, // threshold (high → only highlights bloom)
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  register(obj: SceneObject): void {
    this.objects.add(obj);
    this.scene.add(obj.object3D);
    obj.onAdd?.(this.scene);
  }

  unregister(obj: SceneObject): void {
    if (!this.objects.has(obj)) return;
    this.objects.delete(obj);
    this.scene.remove(obj.object3D);
    obj.dispose();
  }

  /** Feed global scroll progress (0..1) from the scroll service. */
  setScroll(progress: number): void {
    this.scroll = progress;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.zone.runOutsideAngular(() => this.loop());
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private loop = (): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);

    const dt = Math.min(this.clock.getDelta(), 1 / 30); // clamp after tab-switch
    const elapsed = this.clock.elapsedTime;

    // Inertial pointer easing — organic, never snappy.
    this.pointer.lerp(this.pointerTarget, 1 - Math.pow(0.0015, dt));

    (this.ctx as { dt: number }).dt = dt;
    (this.ctx as { elapsed: number }).elapsed = elapsed;
    (this.ctx as { scroll: number }).scroll = this.scroll;

    for (const obj of this.objects) obj.update(this.ctx);

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  };

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    // Pause rendering when the tab is hidden — saves battery & GPU.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else this.start();
    });
  }

  private onResize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this.device.dpr());
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
  };

  private onPointer = (e: PointerEvent): void => {
    this.pointerTarget.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    );
  };

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    for (const obj of this.objects) obj.dispose();
    this.objects.clear();
    this.renderer?.dispose();
  }
}
