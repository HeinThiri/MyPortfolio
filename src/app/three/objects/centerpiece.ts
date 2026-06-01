import * as THREE from 'three';
import type { FrameContext, SceneObject } from '../scene-object';
import { centerpieceVert, centerpieceFrag } from '../shaders';

/**
 * Centerpiece — the floating hero object. A high-subdivision icosahedron with
 * curl-noise breathing and an iridescent Fresnel material. It reacts to the
 * pointer (tilt) and to scroll (drifts back & spins down as you leave the hero).
 */
export class Centerpiece implements SceneObject {
  readonly object3D = new THREE.Group();
  private mesh!: THREE.Mesh;
  private material!: THREE.ShaderMaterial;
  private halo!: THREE.Mesh;

  constructor(private readonly detail = 64) {}

  onAdd(): void {
    const geo = new THREE.IcosahedronGeometry(1.6, this.detail >= 64 ? 64 : 24);

    this.material = new THREE.ShaderMaterial({
      vertexShader: centerpieceVert,
      fragmentShader: centerpieceFrag,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 0.16 },
        uScroll: { value: 0 },
        uColorA: { value: new THREE.Color('#e7d6b8') }, // champagne
        uColorB: { value: new THREE.Color('#8fb3e0') }, // soft blue
        uColorC: { value: new THREE.Color('#a9dce3') }, // pale cyan
      },
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.object3D.add(this.mesh);

    // Soft additive halo behind the object for atmospheric glow.
    const haloGeo = new THREE.SphereGeometry(2.6, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#cfe0f5'),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.halo = new THREE.Mesh(haloGeo, haloMat);
    this.object3D.add(this.halo);
  }

  update(ctx: FrameContext): void {
    const u = this.material.uniforms;
    u['uTime'].value = ctx.elapsed;
    u['uScroll'].value = ctx.scroll;

    // Inertial tilt toward the pointer.
    this.object3D.rotation.y += (ctx.pointer.x * 0.5 - this.object3D.rotation.y) * 0.04;
    this.object3D.rotation.x += (-ctx.pointer.y * 0.4 - this.object3D.rotation.x) * 0.04;
    this.mesh.rotation.z += ctx.dt * 0.05;

    // Float up/down + recede on scroll.
    const float = Math.sin(ctx.elapsed * 0.6) * 0.08;
    this.object3D.position.y = float - ctx.scroll * 2.2;
    this.object3D.position.z = -ctx.scroll * 4.0;
    const s = 1 - ctx.scroll * 0.25;
    this.object3D.scale.setScalar(Math.max(s, 0.6));
    (this.halo.material as THREE.MeshBasicMaterial).opacity = 0.18 * (1 - ctx.scroll * 0.7);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.halo.geometry.dispose();
    (this.halo.material as THREE.Material).dispose();
  }
}
