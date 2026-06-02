import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { FrameContext, SceneObject } from '../scene-object';

export interface BackgroundModelOptions {
  /** Public-relative URL of the .glb/.gltf, e.g. '/models/scene.glb'. */
  url: string;
  /** Longest-axis size in world units after auto-normalization. */
  size?: number;
  /** Resting position of the model group [x, y, z]. */
  position?: THREE.Vector3Tuple;
  /** Constant idle spin on Y, in radians/sec. */
  spin?: number;
  /** Pointer parallax strength (world units at full deflection). */
  parallax?: number;
  /** How far the model recedes on Z over a full page scroll. */
  scrollDepth?: number;
  /** Playback-speed multiplier for any embedded animation clips. */
  timeScale?: number;
}

/**
 * BackgroundModel — loads a glTF/GLB (e.g. a model downloaded from Sketchfab)
 * and parks it as an ambient layer behind the foreground content. It centers
 * and rescales the asset automatically, plays every embedded animation clip,
 * and adds an idle spin + pointer parallax + scroll recession so even a static
 * model feels alive. Loading is async and non-fatal: if the file is missing it
 * simply logs a warning and stays invisible.
 */
export class BackgroundModel implements SceneObject {
  readonly object3D = new THREE.Group();
  private mixer?: THREE.AnimationMixer;
  private loaded = false;
  private readonly opts: Required<BackgroundModelOptions>;

  constructor(options: BackgroundModelOptions) {
    this.opts = {
      size: 6,
      position: [0, 0, -4],
      spin: 0.05,
      parallax: 0.6,
      scrollDepth: 3,
      timeScale: 1,
      ...options,
    };
    const [x, y, z] = this.opts.position;
    this.object3D.position.set(x, y, z);
    this.object3D.visible = false; // revealed once the asset resolves
  }

  onAdd(): void {
    new GLTFLoader().load(
      this.opts.url,
      (gltf) => this.onLoad(gltf),
      undefined,
      (err) => console.warn(`[BackgroundModel] failed to load ${this.opts.url}`, err),
    );
  }

  private onLoad(gltf: GLTF): void {
    const model = gltf.scene;

    // Normalize: recenter at origin and scale the longest axis to `size`.
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const dims = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(dims);
    model.position.sub(center);
    const longest = Math.max(dims.x, dims.y, dims.z) || 1;
    model.scale.setScalar(this.opts.size / longest);

    // Decorative background — keep it out of the shadow/depth fight.
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });

    this.object3D.add(model);

    // Play every embedded clip — this is the asset's own 3D animation.
    if (gltf.animations.length) {
      this.mixer = new THREE.AnimationMixer(model);
      for (const clip of gltf.animations) this.mixer.clipAction(clip).play();
      this.mixer.timeScale = this.opts.timeScale;
    }

    this.object3D.visible = true;
    this.loaded = true;
  }

  update(ctx: FrameContext): void {
    if (!this.loaded) return;
    this.mixer?.update(ctx.dt);

    // Idle spin + gentle float so static models still drift.
    this.object3D.rotation.y += ctx.dt * this.opts.spin;
    const float = Math.sin(ctx.elapsed * 0.4) * 0.15;

    // Pointer parallax — the engine already eases ctx.pointer inertially.
    const [bx, by, bz] = this.opts.position;
    this.object3D.position.x = bx + ctx.pointer.x * this.opts.parallax;
    this.object3D.position.y = by + ctx.pointer.y * this.opts.parallax + float;
    this.object3D.position.z = bz - ctx.scroll * this.opts.scrollDepth;
  }

  dispose(): void {
    this.mixer?.stopAllAction();
    this.object3D.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach(disposeMaterial);
      else if (mat) disposeMaterial(mat);
    });
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
