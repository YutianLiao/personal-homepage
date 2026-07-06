import * as THREE from "three";
import type { FlatKnowledgePoint } from "../types";
import { getGlowTexture } from "./glowTexture";
import { SPHERE_RADIUS } from "./constants";

const MIN_SIZE = 0.062;
const MAX_SIZE = 0.12;

function densityScale(count: number): number {
  if (count <= 12) return 1;
  return Math.max(0.6, Math.sqrt(12 / count));
}

export interface NodeGroup {
  group: THREE.Group;
  meshes: Map<string, THREE.Sprite>;
  dispose: () => void;
}

export function createNodes(points: FlatKnowledgePoint[]): NodeGroup {
  const group = new THREE.Group();
  const meshes = new Map<string, THREE.Sprite>();
  const materials: THREE.Material[] = [];
  const scale = densityScale(points.length);
  const glowTex = getGlowTexture();

  for (const point of points) {
    const t = Math.min(100, Math.max(0, point.familiarity)) / 100;
    const size = (MIN_SIZE + t * (MAX_SIZE - MIN_SIZE)) * scale;
    const color = new THREE.Color(point.color);

    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      color,
      transparent: true,
      opacity: 0.52 + t * 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      alphaTest: 0.02
    });
    materials.push(mat);

    const sprite = new THREE.Sprite(mat);
    sprite.position.set(
      point.position.x * SPHERE_RADIUS,
      point.position.y * SPHERE_RADIUS,
      point.position.z * SPHERE_RADIUS
    );
    sprite.scale.setScalar(size);
    sprite.renderOrder = 2;
    sprite.userData.pointId = point.id;
    sprite.userData.baseScale = size;
    sprite.userData.familiarity = t;

    group.add(sprite);
    meshes.set(point.id, sprite);
  }

  return {
    group,
    meshes,
    dispose() {
      for (const m of materials) m.dispose();
    }
  };
}

export function updateNodeHighlight(
  meshes: Map<string, THREE.Sprite>,
  highlightIds: Set<string>,
  hasQuery: boolean,
  selectedId: string | null,
  hoveredId: string | null
) {
  for (const [id, sprite] of meshes) {
    const mat = sprite.material as THREE.SpriteMaterial;
    const base = sprite.userData.baseScale as number;
    const t = sprite.userData.familiarity as number;
    const matched = highlightIds.has(id);
    const selected = id === selectedId;
    const hovered = id === hoveredId;

    if (selected) {
      mat.opacity = 0.95;
      sprite.scale.setScalar(base * 1.35);
    } else if (hovered) {
      mat.opacity = 0.82;
      sprite.scale.setScalar(base * 1.15);
    } else if (!hasQuery) {
      mat.opacity = 0.45 + t * 0.4;
      sprite.scale.setScalar(base);
    } else if (matched) {
      mat.opacity = 0.88;
      sprite.scale.setScalar(base * 1.08);
    } else {
      mat.opacity = 0.1;
      sprite.scale.setScalar(base * 0.75);
    }
  }
}
