import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getStarDotTexture } from "./glowTexture";
import { createAtmosphere } from "./createOrbits";

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  dispose: () => void;
  resize: (width: number, height: number) => void;
}

/** 远景星尘总量（三层 Points，共享贴图） */
const STAR_LAYERS = [
  { count: 4500, rMin: 9, rMax: 26, size: 1.4, opacity: 0.4 },
  { count: 2800, rMin: 7.5, rMax: 18, size: 1.75, opacity: 0.48 },
  { count: 1500, rMin: 6.5, rMax: 14, size: 2.1, opacity: 0.52 }
] as const;

function createStarLayer(
  count: number,
  rMin: number,
  rMax: number,
  size: number,
  opacity: number,
  starMap: THREE.CanvasTexture
): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    map: starMap,
    color: 0xe8f0ff,
    size,
    transparent: true,
    opacity,
    sizeAttenuation: false,
    depthWrite: false,
    alphaTest: 0.08,
    blending: THREE.NormalBlending
  });
  return new THREE.Points(geom, mat);
}

export function createScene(container: HTMLElement): SceneContext {
  const scene = new THREE.Scene();
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  const width = container.clientWidth || 640;
  const height = container.clientHeight || 480;
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.05, 4.8);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.45;

  const starMap = getStarDotTexture();
  for (const layer of STAR_LAYERS) {
    const pts = createStarLayer(
      layer.count,
      layer.rMin,
      layer.rMax,
      layer.size,
      layer.opacity,
      starMap
    );
    scene.add(pts);
    disposables.push(pts.geometry, pts.material as THREE.Material);
  }

  const atmosphere = createAtmosphere();
  scene.add(atmosphere.mesh);
  disposables.push(atmosphere.mesh.geometry, atmosphere.mesh.material as THREE.Material);

  return {
    scene,
    camera,
    renderer,
    controls,
    resize(w: number, h: number) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    },
    dispose() {
      controls.dispose();
      renderer.dispose();
      atmosphere.dispose();
      for (const d of disposables) d.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    }
  };
}
