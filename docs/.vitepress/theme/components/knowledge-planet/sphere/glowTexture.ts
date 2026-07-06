import * as THREE from "three";

let glowCached: THREE.CanvasTexture | null = null;
let starCached: THREE.CanvasTexture | null = null;

function configureTexture(tex: THREE.CanvasTexture) {
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
}

/** 知识点：中心亮白、外圈彩色柔光 */
export function getGlowTexture(): THREE.CanvasTexture {
  if (glowCached) return glowCached;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.06, "rgba(255,255,255,0.95)");
  g.addColorStop(0.18, "rgba(255,255,255,0.45)");
  g.addColorStop(0.42, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowCached = new THREE.CanvasTexture(canvas);
  configureTexture(glowCached);
  return glowCached;
}

/** 背景星尘圆点 */
export function getStarDotTexture(): THREE.CanvasTexture {
  if (starCached) return starCached;
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(220,235,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  starCached = new THREE.CanvasTexture(canvas);
  configureTexture(starCached);
  return starCached;
}
