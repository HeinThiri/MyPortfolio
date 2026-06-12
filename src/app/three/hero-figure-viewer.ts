import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface HeroFigureViewerOptions {
  /** Public-relative URL of the .glb/.gltf, e.g. '/3D/hero-person.glb'. */
  url: string;
  /** Longest-axis size in world units after auto-normalization. */
  size?: number;
  /** Pointer parallax strength (radians of yaw at full deflection). */
  parallax?: number;
  /** Constant idle yaw in radians/sec — set > 0 for a turntable showcase. */
  autoSpin?: number;
  /** Honor the OS "reduce motion" setting — disables idle float + parallax. */
  reducedMotion?: boolean;
}

/**
 * HeroFigureViewer — a small, self-contained three.js viewer that renders a
 * single glTF/GLB character into its own transparent canvas. Unlike the global
 * WebGLEngine (one full-screen canvas behind the DOM), this owns a tiny
 * renderer parked exactly where the hero portrait sits, so the 3D figure lands
 * in the same spot the flat PNG used to.
 *
 * It centers + rescales the asset automatically, plays embedded animation
 * clips, and adds an idle float + pointer-driven yaw so a static model still
 * feels alive. Loading is async and non-fatal.
 */
export class HeroFigureViewer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly clock = new THREE.Clock();
  private readonly group = new THREE.Group();
  private readonly opts: Required<HeroFigureViewerOptions>;

  private mixer?: THREE.AnimationMixer;
  private rafId = 0;
  private loaded = false;
  private spin = 0; // accumulated auto-spin yaw

  // Smoothed pointer in [-1, 1], eased toward the raw target each frame.
  private readonly pointer = new THREE.Vector2(0, 0);
  private readonly pointerTarget = new THREE.Vector2(0, 0);

  private readonly ro: ResizeObserver;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    options: HeroFigureViewerOptions,
  ) {
    this.opts = {
      size: 2.5,
      parallax: 0.35,
      autoSpin: 0,
      reducedMotion: false,
      ...options,
    };

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    this.scene.add(this.group);
    this.setupLighting();

    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);

    if (!this.opts.reducedMotion) {
      window.addEventListener('pointermove', this.onPointer, { passive: true });
    }

    new GLTFLoader().load(
      this.opts.url,
      (gltf) => this.onLoad(gltf),
      undefined,
      (err) => console.warn(`[HeroFigureViewer] failed to load ${this.opts.url}`, err),
    );

    this.clock.start();
    this.loop();
  }

  /** Soft studio lighting — warm key, cool rim, champagne fill. */
  private setupLighting(): void {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe6f0, 1.1));

    const key = new THREE.DirectionalLight(0xfff4e6, 1.8);
    key.position.set(3, 5, 5);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xbcd6ff, 1.2);
    rim.position.set(-4, 2, -3);
    this.scene.add(rim);

    const fill = new THREE.PointLight(0xe7d6b8, 0.6, 30);
    fill.position.set(0, -2, 4);
    this.scene.add(fill);
  }

  private onLoad(gltf: GLTF): void {
    const model = gltf.scene;

    // Normalize: recenter at origin, scale longest axis to `size`.
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const dims = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(dims);
    model.position.sub(center);
    const longest = Math.max(dims.x, dims.y, dims.z) || 1;
    model.scale.setScalar(this.opts.size / longest);

    this.group.add(model);

    // Play every embedded clip — this is the asset's own 3D animation.
    if (gltf.animations.length) {
      this.mixer = new THREE.AnimationMixer(model);
      for (const clip of gltf.animations) this.mixer.clipAction(clip).play();
    }

    this.loaded = true;
  }

  private resize(): void {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private onPointer = (e: PointerEvent): void => {
    this.pointerTarget.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    );
  };

  private loop = (): void => {
    this.rafId = requestAnimationFrame(this.loop);

    const dt = Math.min(this.clock.getDelta(), 1 / 30);
    const elapsed = this.clock.elapsedTime;
    this.mixer?.update(dt);

    if (this.loaded && !this.opts.reducedMotion) {
      this.pointer.lerp(this.pointerTarget, 1 - Math.pow(0.0015, dt));
      this.spin += dt * this.opts.autoSpin;

      // Constant turntable spin + pointer-driven yaw/pitch + a gentle idle float.
      this.group.rotation.y = this.spin + this.pointer.x * this.opts.parallax;
      this.group.rotation.x = -this.pointer.y * this.opts.parallax * 0.4;
      this.group.position.y = Math.sin(elapsed * 0.6) * 0.06;
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.ro.disconnect();
    window.removeEventListener('pointermove', this.onPointer);
    this.mixer?.stopAllAction();
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach(disposeMaterial);
      else if (mat) disposeMaterial(mat);
    });
    this.renderer.dispose();
  }
}

/** Dispose a material and any textures it references. */
function disposeMaterial(mat: THREE.Material): void {
  for (const key of Object.keys(mat)) {
    const val = (mat as unknown as Record<string, unknown>)[key];
    if (val && (val as THREE.Texture).isTexture) (val as THREE.Texture).dispose();
  }
  mat.dispose();
}
