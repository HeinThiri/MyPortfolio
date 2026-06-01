import * as THREE from 'three';
import type { FrameContext, SceneObject } from '../scene-object';
import { particlesVert, particlesFrag } from '../shaders';

/**
 * ParticleField — a volumetric drift of soft motes giving the scene depth and
 * atmosphere. Count scales with the device tier; everything lives on the GPU.
 */
export class ParticleField implements SceneObject {
  readonly object3D = new THREE.Group();
  private points!: THREE.Points;
  private material!: THREE.ShaderMaterial;

  constructor(private readonly count = 1400) {}

  onAdd(): void {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const scales = new Float32Array(this.count);
    const speeds = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      // Distribute in a soft sphere shell around the camera frustum.
      const r = 4 + Math.pow(Math.random(), 0.5) * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = r * Math.cos(phi) - 2;
      scales[i] = 0.4 + Math.random() * 1.2;
      speeds[i] = 0.5 + Math.random() * 1.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: particlesVert,
      fragmentShader: particlesFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 7 },
        uScroll: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
        uColor: { value: new THREE.Color('#9fb8da') },
      },
    });

    this.points = new THREE.Points(geo, this.material);
    this.object3D.add(this.points);
  }

  update(ctx: FrameContext): void {
    const u = this.material.uniforms;
    u['uTime'].value = ctx.elapsed;
    u['uScroll'].value = ctx.scroll;
    (u['uPointer'].value as THREE.Vector2).copy(ctx.pointer);
    this.object3D.rotation.y = ctx.elapsed * 0.01 + ctx.pointer.x * 0.1;
  }

  dispose(): void {
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
