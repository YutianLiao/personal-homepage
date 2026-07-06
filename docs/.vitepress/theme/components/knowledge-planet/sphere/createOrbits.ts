import * as THREE from "three";
import { SPHERE_RADIUS } from "./constants";

/**
 * 行星环：球心处的正圆（半径 > SPHERE_RADIUS），倾斜后从透视看呈椭圆。
 * 不用压扁椭圆——压扁后环面会穿过球体内部。
 */
export function createOrbits(): {
  group: THREE.Group;
  dispose: () => void;
} {
  const group = new THREE.Group();
  group.rotation.x = THREE.MathUtils.degToRad(62);
  group.rotation.z = THREE.MathUtils.degToRad(-48);

  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];

  const rings = [
    { r: SPHERE_RADIUS + 0.42, opacity: 0.08, color: 0xd4e6ff },
    { r: SPHERE_RADIUS + 0.62, opacity: 0.065, color: 0xc8daf8 },
    { r: SPHERE_RADIUS + 0.82, opacity: 0.055, color: 0xe4d4ff },
    { r: SPHERE_RADIUS + 1.02, opacity: 0.045, color: 0xffe8d4 }
  ];

  for (const ring of rings) {
    const curve = new THREE.EllipseCurve(0, 0, ring.r, ring.r, 0, Math.PI * 2, false, 0);
    const pts = curve.getPoints(128).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: ring.opacity,
      depthWrite: false,
      depthTest: true
    });
    const line = new THREE.LineLoop(geom, mat);
    line.renderOrder = 0;
    group.add(line);
    geoms.push(geom);
    mats.push(mat);
  }

  return {
    group,
    dispose() {
      for (const g of geoms) g.dispose();
      for (const m of mats) m.dispose();
    }
  };
}

export function createAtmosphere(): {
  mesh: THREE.Mesh;
  dispose: () => void;
} {
  const geom = new THREE.SphereGeometry(SPHERE_RADIUS + 0.12, 40, 40);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x7aa8e8,
    transparent: true,
    opacity: 0.025,
    side: THREE.BackSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.renderOrder = -2;
  return {
    mesh,
    dispose() {
      geom.dispose();
      mat.dispose();
    }
  };
}
