import * as THREE from 'three';

/** Context passed to every scene object on each frame. */
export interface FrameContext {
  /** Seconds since last frame. */
  readonly dt: number;
  /** Seconds since the engine started. */
  readonly elapsed: number;
  /** Smoothed, normalized pointer position in [-1, 1]. */
  readonly pointer: THREE.Vector2;
  /** Global scroll progress in [0, 1] across the whole page. */
  readonly scroll: number;
  readonly camera: THREE.PerspectiveCamera;
}

/**
 * A self-contained, GPU-friendly scene element.
 * Sections create these and hand them to the WebGL engine; the engine
 * owns the render loop and calls update() each frame.
 */
export interface SceneObject {
  /** The root node added to the scene graph. */
  readonly object3D: THREE.Object3D;
  /** Called once after the object is registered (lazy material/texture setup). */
  onAdd?(scene: THREE.Scene): void;
  /** Per-frame update. Keep allocation-free. */
  update(ctx: FrameContext): void;
  /** Free geometries, materials, textures. */
  dispose(): void;
}
