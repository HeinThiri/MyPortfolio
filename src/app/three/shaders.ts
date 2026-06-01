/**
 * GLSL shader sources for the Aurora scene.
 * Light, iridescent, atmospheric — Fresnel rim + soft gradient, gentle
 * curl-noise breathing on the geometry. No hard neon.
 */

// Ashima simplex noise (public domain) — shared by the shaders below.
const SIMPLEX_NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

export const centerpieceVert = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uScroll;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${SIMPLEX_NOISE}
void main(){
  vec3 pos = position;
  // Slow, organic "breathing" displacement along the normal.
  float n = snoise(normalize(position) * 1.4 + vec3(0.0, uTime * 0.18, 0.0));
  float n2 = snoise(normalize(position) * 3.1 - vec3(uTime * 0.12));
  float disp = (n * 0.65 + n2 * 0.35) * uAmp * (1.0 + uScroll * 0.4);
  pos += normal * disp;
  vNoise = n;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

export const centerpieceFrag = /* glsl */ `
precision highp float;
uniform vec3 uColorA;   // champagne
uniform vec3 uColorB;   // soft blue
uniform vec3 uColorC;   // pale cyan
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main(){
  // Fresnel rim — bright edges, translucent core.
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);

  // Iridescent gradient driven by view angle + noise.
  float t = clamp(0.5 + 0.5 * vNoise + 0.25 * sin(uTime * 0.3), 0.0, 1.0);
  vec3 base = mix(uColorA, uColorB, smoothstep(0.0, 0.6, t));
  base = mix(base, uColorC, smoothstep(0.5, 1.0, t));

  vec3 color = base + fres * 0.9;          // glowing rim
  color += vec3(0.04, 0.05, 0.06) * fres;  // subtle cool sheen
  float alpha = 0.82 + fres * 0.18;
  gl_FragColor = vec4(color, alpha);
}`;

export const particlesVert = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uScroll;
uniform vec2 uPointer;
attribute float aScale;
attribute float aSpeed;
varying float vAlpha;
${SIMPLEX_NOISE}
void main(){
  vec3 pos = position;
  // Gentle drift + parallax response to pointer and scroll.
  float n = snoise(pos * 0.18 + vec3(0.0, uTime * 0.05 * aSpeed, 0.0));
  pos.x += n * 0.6 + uPointer.x * 0.6 * aScale;
  pos.y += sin(uTime * 0.2 * aSpeed + pos.x) * 0.4 + uPointer.y * 0.4 * aScale;
  pos.z += cos(uTime * 0.15 * aSpeed) * 0.5 - uScroll * 4.0 * aScale;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * (300.0 / -mv.z);
  vAlpha = smoothstep(0.0, 1.0, aScale) * 0.7;
}`;

export const particlesFrag = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
void main(){
  // Soft round sprite.
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  gl_FragColor = vec4(uColor, a);
}`;
